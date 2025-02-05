/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import Router from "next/router";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
  useUser,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DialogFooter,
  useDebounce,
  DialogTrigger,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  ScrollArea,
  RadioGroup,
  RadioGroupItem,
  Input,
  ScrollBar,
  Avatar,
  AvatarImage,
  AvatarFallback,
  RtxEditor,
  formatBnNumber,
} from "@/components";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Image from "next/image";
import { useCloudflareImage, useSubject } from "@/hooks";
import { ClipboardPlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components";
import { ImageCropper } from "@/lib/imageCrop";
import { useToast } from "@/hooks/use-toast";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import Link from "next/link";
import { guidelines } from "@/data/community";
import { Chapter, Group } from "@/@types";

interface CreatePostProps {
  group_id?: string;
  group_type?: string;
  subject_id?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

export const CreatePost: React.FC<CreatePostProps> = ({ group_id, group_type, subject_id }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { uploadImage } = useCloudflareImage();

  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [category, setCategory] = useState({ name: "", value: "" });
  const [imgSrc, setImgSrc] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [topicLoading, setTopicLoading] = useState<boolean>(false);

  const [imgUploading, setImgUploading] = useState<boolean>(false);
  const [cropperOpen, setCropperOpen] = useState(false);

  const [ai, setAi] = useState(false);

  const [error, setError] = useState<{
    subject: string;
    chapter: string;
    prompt: string;
    destination: string;
  }>({ subject: "", chapter: "", prompt: "", destination: "" });

  // const [imgSrc, setImgSrc] = useState<File | null>(null);
  // const [file, setFile] = useState<File | null>(null);
  const [limit, setLimit] = useState<number>(0);
  const [limitRemaining, setLimitRemaining] = useState<number>(0);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [poll, setPoll] = useState(false);
  const [pollType, setPollType] = useState<boolean>(false);

  const [options, setOptions] = useState([
    {
      name: "",
      is_correct: false,
    },
  ]);

  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const dsubject = useDebounce(subject, 500);

  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [destination, setDestination] = useState(group_id || "");
  const [destinationType, setDestinationType] = useState(group_type || "");
  const { subjects, subLoading } = useSubject();
  const [subjectDisabled, setSubjectDisabled] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 8,
    hours: 12,
    minutes: 1,
  });

  useEffect(() => {
    if (!!subject_id) {
      setSubject(subject_id);
      setSubjectDisabled(true);
      setCategory({ name: "বিষয়ভিত্তিক প্রশ্ন", value: "subject" },);
    }
  }, [subject_id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime.minutes > 0) {
          return { ...prevTime, minutes: prevTime.minutes - 1 };
        } else if (prevTime.hours > 0) {
          return { ...prevTime, hours: prevTime.hours - 1, minutes: 59 };
        } else if (prevTime.days > 0) {
          return { days: prevTime.days - 1, hours: 23, minutes: 59 };
        }
        clearInterval(timer);
        return prevTime;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const addOption = () => {
    setOptions([...options, { name: "", is_correct: false }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  useEffect(() => {
    async function getlimit() {
      try {
        const res = await axios.get(`${secondaryAPI}/api/utils/limits`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setLimit(Number(res.data.limit));
        setLimitRemaining(Number(res.data.remaining));
        setTimeLeft({
          days: res.data.trialDaysRemaining,
          hours: 0,
          minutes: 1,
        });
      } catch (error) {
        handleError(error as AxiosError, () => getlimit());
      }
    }
    getlimit();
  }, [user]);

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (category.value === "subject" && !subject) {
      setError({ ...error, subject: "Subject is required" });
      toast({
        title: "Subject is required",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    if (category.value === "subject" && !chapter) {
      setError({ ...error, chapter: "Chapter is required" });
      toast({
        title: "Chapter is required",
        description: "Please select a chapter",
        variant: "destructive",
      });
      return;
    }
    if (!preview && !prompt) {
      setError({ ...error, prompt: "Prompt is required" });
      toast({
        title: "Prompt is required",
        description: "Please write your question or problem",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = executeRecaptcha ? await executeRecaptcha("submit") : null;
      if (!token) {
        toast({
          title: "reCAPTCHA verification failed.",
          description: "Please try again",
          variant: "destructive",
        });
        return;
      }
      const batchName = localStorage.getItem("hsc_batch") || user?.hsc_batch;

      const data = {
        category: category.value,
        body: prompt,
        hsc_batch: batchName,
        subject_id: subject || "",
        chapter_id: chapter,
        token,
        images: preview || "",
        ai_enabled: ai,
        group_id: destination,
        video_url: videoUrl || undefined,
        status: "published",
      };

      const response = await axios.post(`${secondaryAPI}/api/post`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      setPrompt("");
      setCategory({ name: "", value: "" });
      setTimeout(() => {
        Router.push(`/post/${response.data.id}`);
      }, 600);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setIsOpen(false);
      handleError(error as AxiosError, () => handleCreatePost(e));
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImgUploading(true);
      const fileArray = Array.from(files);
      setImgSrc(fileArray);
      if (category.value !== "homework") {
        setCropperOpen(true);
      } else {
        const imageLinks = await Promise.all(
          fileArray.map(async (file) => {
            const imagelink = await uploadImage(file);
            return imagelink as string;
          })
        );
        setPreview([...preview, ...imageLinks]);
      }
      setImgUploading(false);
    }
  };

  const handleCroppedImageChange = async (f: File) => {
    const file = f;
    if (file) {
      setImgUploading(true);
      // setFile(file);
      // setPreview(URL.createObjectURL(file));
      setImgUploading(false);
    }
  };

  async function cropDone() {
    try {
      setCropperOpen(false);
      const imageLinks = await Promise.all(
        imgSrc.map(async (file) => {
          const imagelink = await uploadImage(file);
          return imagelink as string;
        })
      );
      if (category.value === "homework") {
        setPreview((prev) => [...prev, ...imageLinks]);
      } else {
        setPreview(imageLinks);
        setImgSrc([]);
      }
    } catch {
      toast({
        title: "Image Upload Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }

  const categories = [
    { name: "বিষয়ভিত্তিক প্রশ্ন", value: "subject" },
    { name: "হোমওয়ার্ক", value: "homework" },
    { name: "অন্যান্য", value: "other" },
  ];

  useEffect(() => {
    const getChapters = async () => {
      try {
        setTopicLoading(true);
        if (dsubject) {
          const response = await axios.get(
            `${secondaryAPI}/api/subjects/${dsubject}/chapters`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          setChapters(response.data);
        }
        setTopicLoading(false);
      } catch (err) {
        handleError(err as AxiosError, getChapters);
        setTopicLoading(false);
      }
    };
    getChapters();
  }, [dsubject]);

  const cropperModal = (
    <div>
      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="p-4 bg-white flex justify-center max-w-[500px] max-h-[80vh] items-center">
          <DialogHeader>
            <DialogTitle className="text-center py-2 text-black">
              Crop Image
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="w-full p-4 max-h-[450px]">
            <ImageCropper
              imgFile={imgSrc[0] as File}
              onCropComplete={handleCroppedImageChange}
            />
          </ScrollArea>
          <DialogFooter className="grid grid-cols-2 gap-2 justify-between w-full">
            <Button
              className="ring-1 ring-ash text-black pb-1"
              type="button"
              onClick={() => {
                setImgSrc([]);
                setCropperOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="ring-1 ring-ash text-black pb-1"
              onClick={() => cropDone()}
            >
              Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const communityModal = (
    <Dialog open={communityOpen} onOpenChange={setCommunityOpen}>
      <DialogTrigger asChild>
        <Link
          href={`#`}
          className="text-sm flex items-center gap-2 text-light hover:text-life duration-300"
        >
          <svg
            width="16"
            height="17"
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.99966 0.5C3.58197 0.5 0 4.08197 0 8.49966C0 12.9174 3.58197 16.5 7.99966 16.5C12.4174 16.5 16 12.9174 16 8.49966C16 4.08197 12.4174 0.5 7.99966 0.5ZM9.66502 12.8984C9.25325 13.0609 8.92546 13.1842 8.67962 13.2695C8.43445 13.3549 8.14933 13.3975 7.82493 13.3975C7.32648 13.3975 6.93841 13.2756 6.6621 13.0325C6.38578 12.7894 6.2483 12.4812 6.2483 12.1067C6.2483 11.9611 6.25845 11.8121 6.27877 11.6604C6.29977 11.5087 6.33295 11.338 6.37833 11.1463L6.89371 9.3259C6.93909 9.15117 6.97837 8.98525 7.00952 8.83084C7.04068 8.67507 7.05558 8.53217 7.05558 8.40214C7.05558 8.17052 7.00749 8.00798 6.912 7.91655C6.81515 7.82512 6.63297 7.78042 6.3614 7.78042C6.22866 7.78042 6.09185 7.80006 5.95166 7.84138C5.81283 7.88404 5.69228 7.92265 5.5934 7.96057L5.72952 7.39981C6.06679 7.26233 6.38984 7.14449 6.69799 7.04696C7.00614 6.94808 7.29735 6.89932 7.57164 6.89932C8.06671 6.89932 8.44868 7.01987 8.71754 7.25826C8.98506 7.49733 9.11983 7.80819 9.11983 8.19016C9.11983 8.2694 9.11035 8.40891 9.09206 8.60802C9.07378 8.80781 9.03924 8.98999 8.98912 9.15727L8.47644 10.9723C8.43445 11.1179 8.39721 11.2845 8.36334 11.4708C8.33016 11.657 8.3139 11.7992 8.3139 11.8947C8.3139 12.1358 8.36741 12.3004 8.47577 12.3877C8.58277 12.4751 8.77037 12.5191 9.03585 12.5191C9.16114 12.5191 9.30133 12.4968 9.45981 12.4534C9.61693 12.4101 9.73071 12.3715 9.8025 12.3383L9.66502 12.8984ZM9.57426 5.53128C9.3352 5.75342 9.04737 5.86449 8.71077 5.86449C8.37486 5.86449 8.08499 5.75342 7.84389 5.53128C7.60415 5.30914 7.48292 5.03892 7.48292 4.72332C7.48292 4.4084 7.60483 4.1375 7.84389 3.91333C8.08499 3.68849 8.37486 3.57674 8.71077 3.57674C9.04737 3.57674 9.33587 3.68849 9.57426 3.91333C9.81333 4.1375 9.93321 4.4084 9.93321 4.72332C9.93321 5.0396 9.81333 5.30914 9.57426 5.53128Z"
              fill="currentColor"
            />
          </svg>
          <span>কমিউনিটি গাইডলাইন দেখুন</span>
        </Link>
      </DialogTrigger>
      <DialogContent className="p-4 bg-white flex justify-center max-w-[525px] items-center">
        <DialogHeader>
          <DialogTitle className="text-center py-2 text-black">
            কমিউনিটি নির্দেশিকা
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col text-carbon gap-2">
          <p className="text-base font-light px-4">{guidelines.details}</p>

          <ScrollArea className="w-full h-[270px] px-4 pb-4">
            <Accordion type="multiple">
              {guidelines.sections.map((x) => (
                <AccordionItem key={x.id} value={x.id}>
                  <AccordionTrigger>{x.title}</AccordionTrigger>
                  <AccordionContent className="text-light">
                    {x.detail}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
        <DialogFooter className="flex justify-end items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="ring-1 ring-ash bg-life text-white"
            onClick={() => setCommunityOpen(false)}
          >
            ঠিকাছে
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  function handleChangePoll(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const newOptions = [...options];
    newOptions[index].name = e.target.value;
    setOptions(newOptions);
  }

  async function handlePollSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const batchName = localStorage.getItem("hsc_batch") || user?.hsc_batch;
      setLoading(true);
      const data = {
        category: "poll",
        hsc_batch: batchName,
        body: prompt,
        pollType: pollType ? "question" : "survey",
        pollOptions: options,
      };

      const response = await axios.post(`${secondaryAPI}/api/post`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      Router.push(`/post/${response.data.id}`);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      handleError(err as AxiosError, () => handlePollSubmit(e));
    }
  }

  function handleCorrectAnswer(index: number) {
    const newOptions = options.map((option, i) => ({
      ...option,
      is_correct: i === index,
    }));
    setOptions(newOptions);
    console.log(newOptions);
    setSelectedAnswer(index.toString());
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    if (!navigator.clipboard) {
      alert("Clipboard API is not supported by your browser.");
      return;
    }
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (inputRef.current) {
        // inputRef.current.value = clipboardText;
        extractEmbedLink(clipboardText);
        // setVideoUrl(clipboardText)
      }
    } catch (error) {
      console.error("Failed to paste text: ", error);
      alert("Clipboard access is not available or permission is denied.");
    }
  };

  const handleClear = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      const newOptions = [...options];
      newOptions[index].name = "";
      setOptions(newOptions);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      setVideoUrl("");
    }
  };

  const handleChange = (value: string) => {
    setVideoUrl(value);
  };

  function extractEmbedLink(input: string) {
    const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/;
    const shortLinkRegex = /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(\?.*)?/;

    const iframeMatch = input.match(iframeRegex);
    if (iframeMatch && iframeMatch[1]) {
      handleChange(iframeMatch[1]);
    }

    const shortLinkMatch = input.match(shortLinkRegex);
    if (shortLinkMatch && shortLinkMatch[1]) {
      const videoId = shortLinkMatch[1];
      const queryParams = shortLinkMatch[2] || "";
      handleChange(`https://www.youtube.com/embed/${videoId}${queryParams}`);
    }
  }

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${secondaryAPI}/api/group/mygroups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setMyGroups(response.data.groups);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <>
      <div>
        {cropperOpen && cropperModal}
        {!cropperOpen && (
          <Dialog
            open={isOpen}
            onOpenChange={(v) => {
              setIsOpen(v);
              setError({
                subject: "",
                chapter: "",
                prompt: "",
                destination: "",
              });
            }}
          >
            <DialogContent className="px-2 py-4 !mt-10 sm:!mt-0 dark:bg-gray-900 bg-white !h-screen !overflow-y-auto sm:!h-auto text-gray-600">
              <ScrollArea className="max-h-[80vh] md:max-h-[650px]">
                <div className="px-3">
                  <DialogHeader>
                    <DialogTitle className="px-4 pb-1 !text-lg md:!text-xl text-center font-bold">
                      {poll ? "নতুন পোল বানাও" : "নতুন পোস্ট লিখো"}
                    </DialogTitle>
                  </DialogHeader>
                  <div>
                    <form className="grid items-start gap-2">
                      <div
                        className={cn(
                          "flex flex-col gap-2",
                          !!group_id && "hidden",
                          !group_id && "grid"
                        )}
                      >
                        <h2 className="text-base font-medium">ডেস্টিনেশন</h2>

                        <div>
                          <Select
                            required
                            disabled={loading}
                            value={destination || " "}
                            onValueChange={(value) => {
                              setDestination(value);
                              const sub = myGroups.find(x => x.group_id === value)
                              setDestinationType(sub?.type as string)
                              if (!!sub?.data?.subject) {
                                setSubject(sub?.data?.subject)
                                setSubjectDisabled(true)
                              } else {
                                setSubject('')
                                setSubjectDisabled(false)
                              }

                            }}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full !h-10 !px-4 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-green-200 dark:hover:bg-green-200/20",
                                error.subject && !subject && "ring-hot ring-2"
                              )}
                            >
                              <SelectValue
                                placeholder={"ডেস্টিনেশন সিলেক্ট করো"}
                              />
                            </SelectTrigger>
                            <SelectContent
                              align="start"
                              className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                            >
                              <SelectItem
                                value={" "}
                                className="hover:!text-white"
                              >
                                নিউজ ফিড (পাবলিক)
                              </SelectItem>
                              {myGroups?.map((x) => (
                                <SelectItem
                                  key={x.group_id}
                                  value={x.group_id}
                                  className="hover:!text-white"
                                >
                                  {x.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {error && !destination && (
                            <p className="text-hot text-xs mt-2">
                              {error.destination}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Poll  */}

                      <div className={cn("gap-3", !poll ? "hidden" : "grid")}>
                        {/* Toggle */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pollType}
                            onCheckedChange={setPollType}
                          />
                          <span className="text-sm font-medium">
                            সঠিক উত্তর দেখানো পোল
                          </span>
                        </div>

                        <div>
                          <Textarea
                            required
                            value={prompt}
                            onChange={(e) => {
                              setPrompt(e.target.value);
                              setError({ ...error, prompt: "" });
                            }}
                            rows={1}
                            className={cn(
                              "!rounded-lg !px-4 !bg-transparent !text-base !ring-2 ring-ash !border-0 dark:text-white text-gray-900",
                              error.prompt && !prompt && "ring-hot ring-2"
                            )}
                            placeholder="পোলের প্রশ্ন লিখো"
                          />
                          {error && !prompt && (
                            <p className="text-hot text-xs mt-2">
                              {error.prompt}
                            </p>
                          )}
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          <Label className="!text-base font-semibold">
                            পোলের অপশন
                          </Label>
                          <RadioGroup
                            onValueChange={(v) =>
                              handleCorrectAnswer(Number(v))
                            }
                            value={selectedAnswer}
                            className="space-y-2"
                          >
                            {options.map((option, index) => (
                              <div
                                key={index}
                                className="flex relative items-center space-x-2"
                              >
                                <div className="flex-1 flex items-center justify-between p-2 border rounded-md">
                                  <div className="flex items-center space-x-1 w-full">
                                    <RadioGroupItem
                                      checked={option.is_correct}
                                      value={index.toString()}
                                    />
                                    <Input
                                      type="text"
                                      onKeyDown={(e) => handleClear(e, index)}
                                      onChange={(e) =>
                                        handleChangePoll(index, e)
                                      }
                                      value={option.name}
                                      placeholder={`অপশন ${index + 1}`}
                                      className="!text-base !py-0 !h-8 !rounded-md !ring-0 !border-none !ring-transparent !border-transparent !shadow-none"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="text-light hover:text-hot p-1 z-[3] rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      removeOption(index);
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                              </div>
                            ))}
                          </RadioGroup>
                          <div className="py-2">
                            <button
                              disabled={options.length === 4}
                              type="button"
                              className="w-full text-[#008643] disabled:!text-light duration-300 sm:hover:text-elegant font-medium text-base flex items-center gap-2"
                              onClick={addOption}
                            >
                              <svg
                                width="18"
                                height="17"
                                viewBox="0 0 18 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9.0013 0.166748C13.6037 0.166748 17.3346 3.89771 17.3346 8.50008C17.3346 13.1025 13.6037 16.8334 9.0013 16.8334C4.39893 16.8334 0.667969 13.1025 0.667969 8.50008C0.667969 3.89771 4.39893 0.166748 9.0013 0.166748ZM9.0013 4.33341C8.68489 4.33341 8.42339 4.56854 8.38201 4.87361L8.3763 4.95841V7.87508H5.45964C5.11446 7.87508 4.83464 8.1549 4.83464 8.50008C4.83464 8.81649 5.06976 9.07799 5.37483 9.11938L5.45964 9.12508H8.3763V12.0417C8.3763 12.3869 8.65612 12.6667 9.0013 12.6667C9.31772 12.6667 9.57921 12.4316 9.6206 12.1266L9.6263 12.0417V9.12508H12.543C12.8881 9.12508 13.168 8.84526 13.168 8.50008C13.168 8.18367 12.9328 7.92217 12.6278 7.88079L12.543 7.87508H9.6263V4.95841C9.6263 4.61324 9.34648 4.33341 9.0013 4.33341Z"
                                  fill="currentColor"
                                />
                              </svg>
                              Add an Option
                            </button>
                          </div>
                        </div>

                        {/* Answer Select */}
                        <div className={cn("space-y-2", !pollType && "hidden")}>
                          <Label className="!text-base font-semibold">
                            পোলের সঠিক উত্তর
                          </Label>
                          <Select
                            value={selectedAnswer}
                            onValueChange={(value) => {
                              handleCorrectAnswer(Number(value));
                            }}
                          >
                            <SelectTrigger className="ring-2 !ring-ash focus-visible:!ring-life focus-visible:!ring-2 !rounded-md">
                              <SelectValue
                                className="placeholder:text-light/70 text-light"
                                placeholder="সঠিক অপশন সিলেক্ট করো"
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((option, index) => {
                                return !!option.name ? (
                                  <SelectItem
                                    key={index}
                                    value={index.toString()}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleCorrectAnswer(index);
                                    }}
                                  >
                                    {option.name}
                                  </SelectItem>
                                ) : null;
                              })}
                              {options.length === 0 && (
                                <SelectItem
                                  disabled
                                  value="সঠিক অপশন সিলেক্ট করো"
                                >
                                  সঠিক অপশন সিলেক্ট করো
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* select Question type */}
                      <div
                        className={cn(
                          "w-full gap-2 py-2 justify-between",
                          Number(user?.level) === 0 && "hidden",
                          poll && "hidden",
                          !poll && "grid",
                          destinationType === "COURSE" ? 'grid-cols-3' : 'grid-cols-2'
                        )}
                      >
                        <h2 className={cn("text-base font-medium", destinationType === "COURSE" ? 'col-span-3' : 'col-span-2')}>
                          প্রশ্নের ধরণ সিলেক্ট করো
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(true);
                            setCategory(categories[0]);
                          }}
                          className={cn(
                            "rounded-full gap-1 text-xs sm:text-sm flex p-1.5 justify-center items-center shadow-none duration-300",
                            category.value === "subject" &&
                            "ring-life/70 ring-2 hover:ring-life/50",
                            category.value !== "subject" &&
                            "ring-ash ring-1 hover:ring-2"
                          )}
                        >
                          <svg
                            className="w-4 h-4 sm:h-6 sm:w-6"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.6665 5.83333C1.6665 4.66656 1.6665 4.08317 1.89357 3.63752C2.09331 3.24552 2.41202 2.92681 2.80402 2.72707C3.24967 2.5 3.83306 2.5 4.99984 2.5C6.16661 2.5 6.75 2.5 7.19565 2.72707C7.58766 2.92681 7.90637 3.24552 8.1061 3.63752C8.33317 4.08317 8.33317 4.66656 8.33317 5.83333V14.1667C8.33317 15.3334 8.33317 15.9168 8.1061 16.3625C7.90637 16.7545 7.58766 17.0732 7.19565 17.2729C6.75 17.5 6.16661 17.5 4.99984 17.5C3.83306 17.5 3.24967 17.5 2.80402 17.2729C2.41202 17.0732 2.09331 16.7545 1.89357 16.3625C1.6665 15.9168 1.6665 15.3334 1.6665 14.1667V5.83333Z"
                              stroke="#0992E2"
                              strokeWidth="0.875"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4.99988 14.1666H5.00736"
                              stroke="#0992E2"
                              strokeWidth="1.16667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.6665 5.83337H8.33317"
                              stroke="#0992E2"
                              strokeWidth="0.875"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.54036 6.89036C9.24461 5.78198 9.09673 5.2278 9.19858 4.74666C9.28816 4.32344 9.50887 3.93956 9.82908 3.65004C10.1931 3.3209 10.745 3.17241 11.8487 2.87542C12.9525 2.57843 13.5044 2.42994 13.9835 2.53221C14.405 2.62217 14.7873 2.8438 15.0756 3.16534C15.4034 3.53089 15.5512 4.08507 15.847 5.19344L17.9593 13.1096C18.2551 14.218 18.4029 14.7722 18.3011 15.2533C18.2115 15.6766 17.9908 16.0604 17.6706 16.35C17.3066 16.6791 16.7547 16.8276 15.6509 17.1246C14.5472 17.4216 13.9953 17.5701 13.5161 17.4678C13.0947 17.3778 12.7124 17.1562 12.4241 16.8347C12.0963 16.4691 11.9484 15.9149 11.6527 14.8066L9.54036 6.89036Z"
                              stroke="#0992E2"
                              strokeWidth="0.875"
                              strokeLinecap="round"
                            />
                            <path
                              d="M14.8175 13.9127L14.8247 13.9108"
                              stroke="#0992E2"
                              strokeWidth="1.16667"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9.99976 6.66694L15.4165 5.00012"
                              stroke="#0992E2"
                              strokeWidth="0.875"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="pt-1 !font-medium">
                            বিষয়ভিত্তিক
                          </span>
                        </button>
                        {destinationType === "COURSE" && (
                          <button type='button'
                            onClick={() => {
                              setIsOpen(true)
                              setCategory(categories[1])
                            }}
                            className={cn("rounded-full gap-1 text-xs sm:text-sm ring-1 ring-ash flex justify-center items-center p-1 shadow-none duration-300",
                              category.value === 'homework' && "ring-life/70 ring-2 hover:ring-life/50",
                              category.value !== 'homework' && "ring-ash ring-1 hover:ring-2"
                            )}>
                            <svg className='w-4 h-4 sm:h-6 sm:w-6' viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M11.8088 17.4088C15.2946 17.1771 18.0713 14.3611 18.2998 10.8258C18.3445 10.1339 18.3445 9.41748 18.2998 8.72564C18.0713 5.19035 15.2946 2.37432 11.8088 2.1426C10.6196 2.06355 9.37793 2.06371 8.19112 2.1426C4.70528 2.37432 1.92863 5.19035 1.70016 8.72564C1.65545 9.41748 1.65545 10.1339 1.70016 10.8258C1.78337 12.1134 2.35282 13.3055 3.02322 14.3122C3.41247 15.017 3.15558 15.8966 2.75014 16.6649C2.4578 17.2189 2.31163 17.4959 2.42899 17.696C2.54636 17.8961 2.80851 17.9024 3.33281 17.9152C4.36968 17.9404 5.06886 17.6465 5.62386 17.2372C5.93863 17.0051 6.09602 16.8891 6.20449 16.8757C6.31296 16.8624 6.52643 16.9503 6.9533 17.1261C7.33696 17.2841 7.78243 17.3816 8.19112 17.4088C9.37793 17.4877 10.6196 17.4879 11.8088 17.4088Z"
                                stroke="#FC465D" strokeLinejoin="round" />
                              <path
                                d="M8.75 7.9488C8.75 7.24074 9.30964 6.66675 10 6.66675C10.6904 6.66675 11.25 7.24074 11.25 7.9488C11.25 8.20402 11.1773 8.44183 11.0519 8.64161C10.6784 9.23705 10 9.80484 10 10.5129V10.8334"
                                stroke="#FC465D" strokeLinecap="round" />
                              <path d="M10 12.5H10.0075" stroke="#FC465D" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="pt-1 !font-medium">হোমওয়ার্ক</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(true);
                            setCategory(categories[2]);
                          }}
                          className={cn(
                            "rounded-full gap-1 text-xs sm:text-sm ring-1 ring-ash flex justify-center items-center p-1 shadow-none duration-300",
                            category.value === "other" &&
                            "ring-life/70 ring-2 hover:ring-life/50",
                            category.value !== "other" &&
                            "ring-ash ring-1 hover:ring-2"
                          )}
                        >
                          <svg
                            className="w-4 h-4 sm:h-6 sm:w-6"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.3546 4.47963C14.6881 2.81726 16.5939 2.07863 17.2576 2.74237C17.9214 3.40611 17.1827 5.31187 15.5204 7.64543M4.47963 12.3546C2.81726 14.6881 2.07863 16.5939 2.74237 17.2576C3.40611 17.9214 5.31187 17.1827 7.64543 15.5204M15.5204 7.64543C14.5767 8.97009 13.3354 10.4326 11.884 11.884C10.4326 13.3354 8.97009 14.5767 7.64543 15.5204M15.5204 7.64543C15.8291 8.36835 16 9.16422 16 10C16 13.3137 13.3137 16 10 16C9.16422 16 8.36835 15.8291 7.64543 15.5204M14.2426 5.75736C13.1569 4.67157 11.6569 4 10 4C6.68629 4 4 6.68629 4 10C4 11.6569 4.67157 13.1569 5.75736 14.2426"
                              stroke="#8A00CA"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="pt-1 !font-medium">অন্যান্য</span>
                        </button>
                      </div>

                      {/* Select Subject  */}
                      {category.value !== "other" && (
                        <div
                          className={cn(
                            "w-full gap-4 py-4 justify-between grid-cols-2",
                            poll && "hidden",
                            !poll && "grid"
                          )}
                        >
                          <div>
                            <Select
                              value={subject}
                              required={category.value === "subject"}
                              disabled={subLoading || subjectDisabled}
                              onValueChange={(value) => {
                                setChapter("");
                                setSubject(value);
                              }}
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-green-200 dark:hover:bg-green-200/20",
                                  error.subject && !subject && "ring-hot ring-2"
                                )}
                              >
                                <SelectValue
                                  placeholder={
                                    subLoading ? (
                                      <Loader2 className="animate-spin text-center mb-1" />
                                    ) : (
                                      "বিষয়"
                                    )
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent
                                align="start"
                                className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                              >
                                {subjects?.map((x) => (
                                  <SelectItem
                                    key={x.id}
                                    value={x.id}
                                    className="hover:!text-white"
                                  >
                                    {x.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {error && !subject && (
                              <p className="text-hot text-xs mt-2">
                                {error.subject}
                              </p>
                            )}
                          </div>

                          <div>
                            <Select
                              required={category.value === "subject"}
                              disabled={topicLoading || !subject}
                              value={chapter}
                              onValueChange={setChapter}
                            >
                              <SelectTrigger
                                className={cn(
                                  "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-green-200 dark:hover:bg-green-200/20",
                                  error.chapter && !chapter && "ring-hot ring-2"
                                )}
                              >
                                <SelectValue
                                  placeholder={
                                    topicLoading ? (
                                      <Loader2 className="animate-spin text-center mb-1" />
                                    ) : (
                                      "টপিক"
                                    )
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent
                                align="start"
                                className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px] p-1"
                              >
                                {chapters?.map((x) => (
                                  <SelectItem
                                    className="!truncate grid justify-start hover:!text-white"
                                    key={x.id}
                                    value={x.id}
                                  >
                                    <p className="max-w-[200px] truncate">
                                      {x.name}
                                    </p>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {error && !chapter && (
                              <p className="text-hot text-xs mt-2">
                                {error.chapter}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Write Post */}
                      <div
                        className={cn(
                          "gap-2",
                          poll && "hidden",
                          !poll && "grid"
                        )}
                      >
                        <div>
                          <RtxEditor
                            content={prompt}
                            onUpdate={(value) => {
                              setPrompt(value);
                              setError({ ...error, prompt: "" });
                            }}
                          />
                          {/* <Textarea
                            required
                            value={prompt}
                            onChange={(e) => {
                              setPrompt(e.target.value);
                              setError({ ...error, prompt: "" });
                            }}
                            rows={preview ? 1 : 4}
                            className={cn(
                              "!rounded-lg !px-4 !bg-transparent !text-base !ring-2 ring-ash !border-0 dark:text-white text-gray-900",
                              error.prompt && !prompt && "ring-hot ring-2"
                            )}
                            placeholder="তোমার প্রশ্ন বা সমস্যা লিখো..."
                          /> */}
                          {error && !prompt && (
                            <p className="text-hot text-xs mt-2">
                              {error.prompt}
                            </p>
                          )}
                        </div>
                        {communityModal}
                      </div>

                      {/* Video  */}

                      {!!videoUrl && (
                        <div>
                          <iframe
                            className="rounded-2xl"
                            width="100%"
                            height="350px"
                            src={videoUrl}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}

                      {user.role === "ADMIN" && (
                        <div
                          className={cn(
                            "gap-2 w-full items-end",
                            !videoOpen && "hidden",
                            videoOpen && "flex"
                          )}
                        >
                          <div className="w-full">
                            <Label className="text-base font-medium">
                              এম্বেড ভিডিও যুক্ত করো
                            </Label>
                            <Input
                              placeholder="Add Video URL"
                              value={videoUrl}
                              ref={inputRef}
                              onChange={(e) => extractEmbedLink(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="!ring-2 !ring-elegant/30 !border-transparent !shadow-none w-full"
                              type="text"
                            />
                          </div>
                          {!videoUrl ? (
                            <button
                              type="button"
                              className="rounded-full bg-elegant/10 hover:bg-elegant/30 duration-300 text-elegant p-2"
                              onClick={handlePaste}
                            >
                              <ClipboardPlus size={20} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="rounded-full bg-hot/10 hover:bg-hot/30 duration-300 text-hot p-2"
                              onClick={() => setVideoUrl("")}
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Image preview  */}
                      <div className={cn("grid gap-4",
                        preview.length > 1 && "sm:grid-cols-2 grid-cols-1"
                      )}>
                        {preview.map((src, index) => (
                          <div key={index} className="w-full flex items-center relative justify-center h-[300px]">
                            <button
                              type="button"
                              onClick={() => {
                                const newPreviews = preview.filter((_, i) => i !== index);
                                setPreview(newPreviews);
                              }}
                            >
                              <Image
                                className="object-contain !rounded-xl bg-purple-800/20"
                                src={src}
                                alt=""
                                fill
                              />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Upload Image, Poll, AI Enable Switch */}
                      <div className="flex items-center pb-2 justify-between gap-2">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "relative cursor-pointer duration-300 hover:text-elegant text-light"
                            )}
                          >
                            <Input
                              disabled={poll}
                              className="!p-0 opacity-0 absolute w-full h-full !cursor-pointer"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              multiple={destinationType === "CLASS"} // Enable multiple file selection for 'CLASS'
                            />

                            {imgUploading ? (
                              <Loader2 className="animate-spin text-center mb-1" />
                            ) : (
                              <p className="flex items-center gap-2">
                                <svg
                                  className="cursor-pointer"
                                  width="22"
                                  height="21"
                                  viewBox="0 0 22 21"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    cx="6.5"
                                    cy="6"
                                    r="1.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M1.5 10.5C1.5 6.02166 1.5 3.78249 2.89124 2.39124C4.28249 1 6.52166 1 11 1C15.4783 1 17.7175 1 19.1088 2.39124C20.5 3.78249 20.5 6.02166 20.5 10.5C20.5 14.9783 20.5 17.2175 19.1088 18.6088C17.7175 20 15.4783 20 11 20C6.52166 20 4.28249 20 2.89124 18.6088C1.5 17.2175 1.5 14.9783 1.5 10.5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M4 19.4999C8.37246 14.275 13.2741 7.384 20.4975 12.0424"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                                {/* <span className='text-base'>ছবি যুক্ত করো</span> */}
                              </p>
                            )}
                          </div>

                          {user.role === "ADMIN" && (
                            <button
                              disabled={user.role !== "ADMIN"}
                              onClick={() => setVideoOpen(!videoOpen)}
                              type="button"
                              className={cn(
                                "relative shadow-none hover:text-elegant text-light duration-300",
                                user.role !== "ADMIN" && "hidden"
                              )}
                            >
                              <svg
                                width="24"
                                height="25"
                                viewBox="0 0 24 25"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 8.5L13 8.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M2 11.5C2 8.20017 2 6.55025 3.02513 5.52513C4.05025 4.5 5.70017 4.5 9 4.5H10C13.2998 4.5 14.9497 4.5 15.9749 5.52513C17 6.55025 17 8.20017 17 11.5V13.5C17 16.7998 17 18.4497 15.9749 19.4749C14.9497 20.5 13.2998 20.5 10 20.5H9C5.70017 20.5 4.05025 20.5 3.02513 19.4749C2 18.4497 2 16.7998 2 13.5V11.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M17 9.40585L17.1259 9.30196C19.2417 7.55623 20.2996 6.68336 21.1498 7.10482C22 7.52628 22 8.92355 22 11.7181V13.2819C22 16.0765 22 17.4737 21.1498 17.8952C20.2996 18.3166 19.2417 17.4438 17.1259 15.698L17 15.5941"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setPoll((prev) => !prev);
                            }}
                            type="button"
                            className={cn(
                              "relative shadow-none duration-300",
                              poll && "text-elegant",
                              !poll && "text-light"
                            )}
                          >
                            <svg
                              width="20"
                              height="21"
                              viewBox="0 0 20 21"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.59844 3.2999C7.59844 1.97442 8.67295 0.899902 9.99844 0.899902C11.3239 0.899902 12.3984 1.97442 12.3984 3.2999V17.6999C12.3984 19.0254 11.3239 20.0999 9.99844 20.0999C8.67295 20.0999 7.59844 19.0254 7.59844 17.6999V3.2999ZM9.99844 2.0999C9.3357 2.0999 8.79844 2.63716 8.79844 3.2999V17.6999C8.79844 18.3626 9.3357 18.8999 9.99844 18.8999C10.6612 18.8999 11.1984 18.3626 11.1984 17.6999V3.2999C11.1984 2.63716 10.6612 2.0999 9.99844 2.0999ZM0.398438 12.8999C0.398438 11.5744 1.47295 10.4999 2.79844 10.4999C4.12392 10.4999 5.19844 11.5744 5.19844 12.8999V17.6999C5.19844 19.0254 4.12392 20.0999 2.79844 20.0999C1.47295 20.0999 0.398438 19.0254 0.398438 17.6999V12.8999ZM2.79844 11.6999C2.1357 11.6999 1.59844 12.2372 1.59844 12.8999V17.6999C1.59844 18.3626 2.1357 18.8999 2.79844 18.8999C3.46118 18.8999 3.99844 18.3626 3.99844 17.6999V12.8999C3.99844 12.2372 3.46118 11.6999 2.79844 11.6999ZM17.1984 5.6999C15.873 5.6999 14.7984 6.77442 14.7984 8.0999V17.6999C14.7984 19.0254 15.873 20.0999 17.1984 20.0999C18.5239 20.0999 19.5984 19.0254 19.5984 17.6999V8.0999C19.5984 6.77442 18.5239 5.6999 17.1984 5.6999ZM15.9984 8.0999C15.9984 7.43716 16.5357 6.8999 17.1984 6.8999C17.8612 6.8999 18.3984 7.43716 18.3984 8.0999V17.6999C18.3984 18.3626 17.8612 18.8999 17.1984 18.8999C16.5357 18.8999 15.9984 18.3626 15.9984 17.6999V8.0999Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-black">
                          {group_type === "SUBJECT" ? (
                            <>
                              <svg
                                width="12"
                                height="13"
                                viewBox="0 0 12 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_636_75093)">
                                  <path
                                    d="M3.83578 7.37277L4.90924 5.40988L6.87177 4.33624C6.98456 4.27463 7.0546 4.15634 7.0546 4.0278C7.0546 3.89935 6.98456 3.78107 6.87177 3.71936L4.90924 2.64581L3.83578 0.682922C3.77408 0.570129 3.65579 0.5 3.52734 0.5C3.3988 0.5 3.28052 0.570129 3.2189 0.682922L2.14545 2.64581L0.182831 3.71945C0.0701294 3.78107 0 3.89935 0 4.02789C0 4.15634 0.0701294 4.27463 0.182831 4.33633L2.14545 5.40988L3.2189 7.37277C3.28052 7.48557 3.3988 7.55569 3.52734 7.55569C3.65588 7.55569 3.77408 7.48557 3.83578 7.37277Z"
                                    fill="url(#paint0_linear_636_75093)"
                                  />
                                  <path
                                    d="M11.8161 7.13547L10.5091 6.42053L9.79422 5.11334C9.7326 5.00055 9.61432 4.93042 9.48578 4.93042C9.35724 4.93042 9.23895 5.00055 9.17734 5.11334L8.46249 6.42053L7.15549 7.13547C7.04269 7.19717 6.97266 7.31546 6.97266 7.44391C6.97266 7.57245 7.04269 7.69073 7.15549 7.75235L8.46249 8.46729L9.17734 9.77457C9.23895 9.88727 9.35724 9.9574 9.48578 9.9574C9.61432 9.9574 9.7326 9.88727 9.79422 9.77457L10.5091 8.46729L11.8161 7.75235C11.9288 7.69073 11.9989 7.57245 11.9989 7.44391C11.9989 7.31546 11.9288 7.19717 11.8161 7.13547Z"
                                    fill="url(#paint1_linear_636_75093)"
                                  />
                                  <path
                                    d="M6.88412 10.4277L6.06143 9.97772L5.61145 9.15485C5.54984 9.04205 5.43155 8.97192 5.30301 8.97192C5.17447 8.97192 5.05618 9.04205 4.99457 9.15485L4.54459 9.97772L3.72189 10.4277C3.60919 10.4894 3.53906 10.6077 3.53906 10.7361C3.53906 10.8647 3.60919 10.9829 3.72189 11.0446L4.54459 11.4947L4.99457 12.3174C5.05618 12.4302 5.17447 12.5004 5.30301 12.5004C5.43155 12.5004 5.54984 12.4302 5.61145 12.3174L6.06143 11.4947L6.88412 11.0446C6.99683 10.9829 7.06696 10.8647 7.06696 10.7361C7.06696 10.6077 6.99683 10.4894 6.88412 10.4277Z"
                                    fill="url(#paint2_linear_636_75093)"
                                  />
                                </g>
                                <defs>
                                  <linearGradient
                                    id="paint0_linear_636_75093"
                                    x1="0"
                                    y1="4.02785"
                                    x2="7.0546"
                                    y2="4.02785"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <linearGradient
                                    id="paint1_linear_636_75093"
                                    x1="6.97266"
                                    y1="7.44391"
                                    x2="11.9989"
                                    y2="7.44391"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <linearGradient
                                    id="paint2_linear_636_75093"
                                    x1="3.53906"
                                    y1="10.7361"
                                    x2="7.06696"
                                    y2="10.7361"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <clipPath id="clip0_636_75093">
                                    <rect
                                      width="12"
                                      height="12"
                                      fill="white"
                                      transform="translate(0 0.5)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                              <span>{`${limitRemaining}/ ${limit} left`}</span>
                              <Switch checked={ai} onCheckedChange={setAi} />
                              <Label>
                                <span className="font-semibold text-sm">
                                  Curiosity AI
                                </span>
                              </Label>
                            </>
                          ) : !group_id && Number(user.level) !== 0 && limitRemaining > 0 ? (
                            <>
                              <svg
                                width="12"
                                height="13"
                                viewBox="0 0 12 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_636_75093)">
                                  <path
                                    d="M3.83578 7.37277L4.90924 5.40988L6.87177 4.33624C6.98456 4.27463 7.0546 4.15634 7.0546 4.0278C7.0546 3.89935 6.98456 3.78107 6.87177 3.71936L4.90924 2.64581L3.83578 0.682922C3.77408 0.570129 3.65579 0.5 3.52734 0.5C3.3988 0.5 3.28052 0.570129 3.2189 0.682922L2.14545 2.64581L0.182831 3.71945C0.0701294 3.78107 0 3.89935 0 4.02789C0 4.15634 0.0701294 4.27463 0.182831 4.33633L2.14545 5.40988L3.2189 7.37277C3.28052 7.48557 3.3988 7.55569 3.52734 7.55569C3.65588 7.55569 3.77408 7.48557 3.83578 7.37277Z"
                                    fill="url(#paint0_linear_636_75093)"
                                  />
                                  <path
                                    d="M11.8161 7.13547L10.5091 6.42053L9.79422 5.11334C9.7326 5.00055 9.61432 4.93042 9.48578 4.93042C9.35724 4.93042 9.23895 5.00055 9.17734 5.11334L8.46249 6.42053L7.15549 7.13547C7.04269 7.19717 6.97266 7.31546 6.97266 7.44391C6.97266 7.57245 7.04269 7.69073 7.15549 7.75235L8.46249 8.46729L9.17734 9.77457C9.23895 9.88727 9.35724 9.9574 9.48578 9.9574C9.61432 9.9574 9.7326 9.88727 9.79422 9.77457L10.5091 8.46729L11.8161 7.75235C11.9288 7.69073 11.9989 7.57245 11.9989 7.44391C11.9989 7.31546 11.9288 7.19717 11.8161 7.13547Z"
                                    fill="url(#paint1_linear_636_75093)"
                                  />
                                  <path
                                    d="M6.88412 10.4277L6.06143 9.97772L5.61145 9.15485C5.54984 9.04205 5.43155 8.97192 5.30301 8.97192C5.17447 8.97192 5.05618 9.04205 4.99457 9.15485L4.54459 9.97772L3.72189 10.4277C3.60919 10.4894 3.53906 10.6077 3.53906 10.7361C3.53906 10.8647 3.60919 10.9829 3.72189 11.0446L4.54459 11.4947L4.99457 12.3174C5.05618 12.4302 5.17447 12.5004 5.30301 12.5004C5.43155 12.5004 5.54984 12.4302 5.61145 12.3174L6.06143 11.4947L6.88412 11.0446C6.99683 10.9829 7.06696 10.8647 7.06696 10.7361C7.06696 10.6077 6.99683 10.4894 6.88412 10.4277Z"
                                    fill="url(#paint2_linear_636_75093)"
                                  />
                                </g>
                                <defs>
                                  <linearGradient
                                    id="paint0_linear_636_75093"
                                    x1="0"
                                    y1="4.02785"
                                    x2="7.0546"
                                    y2="4.02785"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <linearGradient
                                    id="paint1_linear_636_75093"
                                    x1="6.97266"
                                    y1="7.44391"
                                    x2="11.9989"
                                    y2="7.44391"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <linearGradient
                                    id="paint2_linear_636_75093"
                                    x1="3.53906"
                                    y1="10.7361"
                                    x2="7.06696"
                                    y2="10.7361"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <clipPath id="clip0_636_75093">
                                    <rect
                                      width="12"
                                      height="12"
                                      fill="white"
                                      transform="translate(0 0.5)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                              {user?.is_paid ? (
                                <span className="text-xl">∞</span>
                              ) : (
                                <span>Free Trial {`${limitRemaining}/ ${limit} left`}</span>
                              )}
                              <Switch checked={ai} onCheckedChange={setAi} />
                              <Label>
                                <span className="font-semibold text-sm">
                                  Curiosity AI
                                </span>
                              </Label>
                            </>
                          ) : (
                            <>
                              <svg
                                width="12"
                                height="13"
                                viewBox="0 0 12 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_636_75093)">
                                  <path
                                    d="M3.83578 7.37277L4.90924 5.40988L6.87177 4.33624C6.98456 4.27463 7.0546 4.15634 7.0546 4.0278C7.0546 3.89935 6.98456 3.78107 6.87177 3.71936L4.90924 2.64581L3.83578 0.682922C3.77408 0.570129 3.65579 0.5 3.52734 0.5C3.3988 0.5 3.28052 0.570129 3.2189 0.682922L2.14545 2.64581L0.182831 3.71945C0.0701294 3.78107 0 3.89935 0 4.02789C0 4.15634 0.0701294 4.27463 0.182831 4.33633L2.14545 5.40988L3.2189 7.37277C3.28052 7.48557 3.3988 7.55569 3.52734 7.55569C3.65588 7.55569 3.77408 7.48557 3.83578 7.37277Z"
                                    fill="url(#paint0_linear_636_75093)"
                                  />
                                  <path
                                    d="M11.8161 7.13547L10.5091 6.42053L9.79422 5.11334C9.7326 5.00055 9.61432 4.93042 9.48578 4.93042C9.35724 4.93042 9.23895 5.00055 9.17734 5.11334L8.46249 6.42053L7.15549 7.13547C7.04269 7.19717 6.97266 7.31546 6.97266 7.44391C6.97266 7.57245 7.04269 7.69073 7.15549 7.75235L8.46249 8.46729L9.17734 9.77457C9.23895 9.88727 9.35724 9.9574 9.48578 9.9574C9.61432 9.9574 9.7326 9.88727 9.79422 9.77457L10.5091 8.46729L11.8161 7.75235C11.9288 7.69073 11.9989 7.57245 11.9989 7.44391C11.9989 7.31546 11.9288 7.19717 11.8161 7.13547Z"
                                    fill="url(#paint1_linear_636_75093)"
                                  />
                                  <path
                                    d="M6.88412 10.4277L6.06143 9.97772L5.61145 9.15485C5.54984 9.04205 5.43155 8.97192 5.30301 8.97192C5.17447 8.97192 5.05618 9.04205 4.99457 9.15485L4.54459 9.97772L3.72189 10.4277C3.60919 10.4894 3.53906 10.6077 3.53906 10.7361C3.53906 10.8647 3.60919 10.9829 3.72189 11.0446L4.54459 11.4947L4.99457 12.3174C5.05618 12.4302 5.17447 12.5004 5.30301 12.5004C5.43155 12.5004 5.54984 12.4302 5.61145 12.3174L6.06143 11.4947L6.88412 11.0446C6.99683 10.9829 7.06696 10.8647 7.06696 10.7361C7.06696 10.6077 6.99683 10.4894 6.88412 10.4277Z"
                                    fill="url(#paint2_linear_636_75093)"
                                  />
                                </g>
                                <defs>
                                  <linearGradient
                                    id="paint0_linear_636_75093"
                                    x1="0"
                                    y1="4.02785"
                                    x2="7.0546"
                                    y2="4.02785"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <linearGradient
                                    id="paint1_linear_636_75093"
                                    x1="6.97266"
                                    y1="7.44391"
                                    x2="11.9989"
                                    y2="7.44391"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <linearGradient
                                    id="paint2_linear_636_75093"
                                    x1="3.53906"
                                    y1="10.7361"
                                    x2="7.06696"
                                    y2="10.7361"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#8A00CA" />
                                    <stop offset="0.3" stop-color="#8B0DC5" />
                                    <stop offset="0.53" stop-color="#BC37FA" />
                                    <stop offset="0.755" stop-color="#B142E5" />
                                    <stop offset="1" stop-color="#440064" />
                                  </linearGradient>
                                  <clipPath id="clip0_636_75093">
                                    <rect
                                      width="12"
                                      height="12"
                                      fill="white"
                                      transform="translate(0 0.5)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                              {user?.is_paid ? (
                                <span className="text-xl">∞</span>
                              ) : (
                                <span>
                                  Free Trial
                                  {`${limitRemaining}/ ${limit} left`}</span>
                              )}
                              <Switch disabled={true} checked={ai} onCheckedChange={setAi} />
                              <Label>
                                <span className="font-semibold text-sm text-gray-500">
                                  Curiosity AI
                                </span>
                              </Label>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Submit Button  */}
                      <div className="grid w-full">
                        <Button
                          onClick={(e) => {
                            if (!!poll) {
                              handlePollSubmit(e);
                            } else {
                              // e.preventDefault()
                              handleCreatePost(e);
                              // console.log(e)
                            }
                          }}
                          type="submit"
                          className="!rounded-full bg-olive dark:bg-life"
                          disabled={loading}
                        >
                          <span className="pt-1 text-white">
                            {loading ? (
                              <Loader2 className="animate-spin text-center mb-1" />
                            ) : (
                              "পোস্ট করো"
                            )}
                          </span>
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}

        <div className="py-4 space-y-4 relative z-[2]">
          <div className="p-4 ring-0 shadow dark:shadow-purple-800 shadow-elegant/20 bg-white dark:bg-gradient-to-r dark:bg-neutral-950/70 md:rounded-xl">
            <div

              onClick={() => {
                setIsOpen(true);
                setCategory({ name: "বিষয়ভিত্তিক প্রশ্ন", value: "subject" });
              }}
              className="flex items-start gap-4"
            >
              {user?.image ? (
                <Avatar>
                  <AvatarImage src={user?.image as string} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="relative">
                  <Image
                    height={40}
                    width={40}
                    className="rounded-full cursor-pointer ring-2 ring-life/70 hover:ring-life/50 transition-all duration-300"
                    src={"/user.jpg"}
                    alt="Profile"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-life rounded-full border-2 dark:border-gray-900 border-ash"></span>
                </div>
              )}
              <div>
                <h3 className="text-base font-bold">{user.name}</h3>
                <h3 className="text-xs text-light">
                  তোমার জিজ্ঞাসা বা সমস্যা সম্পর্কে লিখো...
                </h3>
              </div>
            </div>
            <div className="w-full grid grid-cols-3 gap-2 pt-4 justify-between">
              <button
                onClick={() => {
                  setIsOpen(true);
                  if (Number(user.level) === 0) {
                    setCategory(categories[2]);
                  } else {
                    setCategory(categories[0]);
                  }
                }}
                className="rounded-full gap-1 text-xs sm:text-sm flex ring-1 ring-gray-200 sm:ring-0 p-1 justify-center items-center shadow-none duration-300"
              >
                <svg
                  className="w-4 h-4 sm:h-6 sm:w-6"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.6665 5.83333C1.6665 4.66656 1.6665 4.08317 1.89357 3.63752C2.09331 3.24552 2.41202 2.92681 2.80402 2.72707C3.24967 2.5 3.83306 2.5 4.99984 2.5C6.16661 2.5 6.75 2.5 7.19565 2.72707C7.58766 2.92681 7.90637 3.24552 8.1061 3.63752C8.33317 4.08317 8.33317 4.66656 8.33317 5.83333V14.1667C8.33317 15.3334 8.33317 15.9168 8.1061 16.3625C7.90637 16.7545 7.58766 17.0732 7.19565 17.2729C6.75 17.5 6.16661 17.5 4.99984 17.5C3.83306 17.5 3.24967 17.5 2.80402 17.2729C2.41202 17.0732 2.09331 16.7545 1.89357 16.3625C1.6665 15.9168 1.6665 15.3334 1.6665 14.1667V5.83333Z"
                    stroke="#0992E2"
                    strokeWidth="0.875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4.99988 14.1666H5.00736"
                    stroke="#0992E2"
                    strokeWidth="1.16667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.6665 5.83337H8.33317"
                    stroke="#0992E2"
                    strokeWidth="0.875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.54036 6.89036C9.24461 5.78198 9.09673 5.2278 9.19858 4.74666C9.28816 4.32344 9.50887 3.93956 9.82908 3.65004C10.1931 3.3209 10.745 3.17241 11.8487 2.87542C12.9525 2.57843 13.5044 2.42994 13.9835 2.53221C14.405 2.62217 14.7873 2.8438 15.0756 3.16534C15.4034 3.53089 15.5512 4.08507 15.847 5.19344L17.9593 13.1096C18.2551 14.218 18.4029 14.7722 18.3011 15.2533C18.2115 15.6766 17.9908 16.0604 17.6706 16.35C17.3066 16.6791 16.7547 16.8276 15.6509 17.1246C14.5472 17.4216 13.9953 17.5701 13.5161 17.4678C13.0947 17.3778 12.7124 17.1562 12.4241 16.8347C12.0963 16.4691 11.9484 15.9149 11.6527 14.8066L9.54036 6.89036Z"
                    stroke="#0992E2"
                    strokeWidth="0.875"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14.8175 13.9127L14.8247 13.9108"
                    stroke="#0992E2"
                    strokeWidth="1.16667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.99976 6.66694L15.4165 5.00012"
                    stroke="#0992E2"
                    strokeWidth="0.875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="pt-1 !font-medium">
                  {Number(user.level) !== 0 ? "বিষয়ভিত্তিক" : "পোস্ট"}
                </span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(true);
                  setCategory(categories[2]);
                }}
                className="rounded-full gap-1 text-xs sm:text-sm ring-1 ring-gray-200 sm:ring-0 flex justify-center items-center p-1 shadow-none duration-300"
              >
                <svg
                  className="w-4 h-4 text-olive sm:h-5 sm:w-5"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="6.5"
                    cy="6"
                    r="1.5"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.5 10.5C1.5 6.02166 1.5 3.78249 2.89124 2.39124C4.28249 1 6.52166 1 11 1C15.4783 1 17.7175 1 19.1088 2.39124C20.5 3.78249 20.5 6.02166 20.5 10.5C20.5 14.9783 20.5 17.2175 19.1088 18.6088C17.7175 20 15.4783 20 11 20C6.52166 20 4.28249 20 2.89124 18.6088C1.5 17.2175 1.5 14.9783 1.5 10.5Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <path
                    d="M4 19.4999C8.37246 14.275 13.2741 7.384 20.4975 12.0424"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                </svg>
                <span className="pt-1 tex !font-medium">ছবি</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(true);
                  setCategory(categories[2]);
                }}
                className="rounded-full gap-1 text-xs sm:text-sm flex ring-1 ring-gray-200 sm:ring-0 justify-center items-center p-1 shadow-none duration-300"
              >
                <svg
                  className="w-4 h-4 sm:h-6 sm:w-6"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.3546 4.47963C14.6881 2.81726 16.5939 2.07863 17.2576 2.74237C17.9214 3.40611 17.1827 5.31187 15.5204 7.64543M4.47963 12.3546C2.81726 14.6881 2.07863 16.5939 2.74237 17.2576C3.40611 17.9214 5.31187 17.1827 7.64543 15.5204M15.5204 7.64543C14.5767 8.97009 13.3354 10.4326 11.884 11.884C10.4326 13.3354 8.97009 14.5767 7.64543 15.5204M15.5204 7.64543C15.8291 8.36835 16 9.16422 16 10C16 13.3137 13.3137 16 10 16C9.16422 16 8.36835 15.8291 7.64543 15.5204M14.2426 5.75736C13.1569 4.67157 11.6569 4 10 4C6.68629 4 4 6.68629 4 10C4 11.6569 4.67157 13.1569 5.75736 14.2426"
                    stroke="#8A00CA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="pt-1 !font-medium">অন্যান্য</span>
              </button>
            </div>
          </div>
        </div>
        {timeLeft.days > 0 && (
          <div className='z-[2] relative bg-white rounded-lg'>
            <p className='text-center bg-hot/20 max-w-4xl py-2 mx-auto rounded-lg h-full px-5 w-full flex items-center justify-center text-base font-semibold text-hot'>
              {formatBnNumber(timeLeft.days)} দিন ফ্রি ট্রায়াল বাকি আছে
            </p>
          </div>

        )}
      </div>
    </>
  );
};
