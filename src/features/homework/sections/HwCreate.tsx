/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  RtxEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useUser,
} from "@/components";
import { toast, useCloudflareImage, useSubject } from "@/hooks";
import { cn, decodeHtmlEntities } from "@/lib";
import { Chapter } from "@/@types";
import { THomework } from "@/@types/homeworks";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type Props = {
  decodedContent: string;
  setDecodedContent: (decodedContent: string) => void;
  onSubmit: () => void;
  values: THomework;
  setValues: (key: string, value: string | string[]) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const HwCreate = (props: Props) => {
  const { setDecodedContent, onSubmit, values, setValues, isOpen, setIsOpen } =
    props;

  const { uploadImage } = useCloudflareImage();
  const { subjects, chapters, getChapters, topicLoading } = useSubject();
  const { user } = useUser();
  const [imgUploading, setImgUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({
    subject: false,
    chapter: false,
    topic: false,
    deadline: false,
  });

  const handleEditPrompt = (updatedContent: string) => {
    setValues("prompt", updatedContent); // Store raw HTML content
    setDecodedContent(decodeHtmlEntities(updatedContent)); // Decode HTML entities
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type !== "application/pdf") {
      toast({
        title: "প্রতিবেদনটি পিডিএফ ফাইল হতে হবে।",
        variant: "destructive",
      });
      return;
    }

    if (file) {
      try {
        setImgUploading(true);
        const imageUrl = await uploadImage(file, "homework/");
        setValues("attachment_url", `${imageUrl}`);
        setImgUploading(false);
      } catch (error) {
        console.log(error);
        setImgUploading(false);
      }
    }
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      if (
        fileArray.some(
          (file) =>
            file.type !== "image/png" &&
            file.type !== "image/jpeg" &&
            file.type !== "image/jpg"
        )
      ) {
        toast({
          title: "প্রতিবেদনটি ইমেজ ফাইল হতে হবে।",
          variant: "destructive",
        });
        return;
      }

      try {
        setImgUploading(true);
        const imageLinks = await Promise.all(
          fileArray.map(async (file) => {
            // const imagelink = URL.createObjectURL(file)
            const imagelink = await uploadImage(file, "homework/");
            return imagelink as string;
          })
        );
        if (imageLinks.length === fileArray.length) {
          setValues("images", imageLinks);
        }
        setImgUploading(false);
      } catch (error) {
        console.log(error);
        setImgUploading(false);
      }
    }
  };

  const handleDeleteAttachment = async () => {
    try {
      // await deleteImage(values?.attachment_url as string)
      setValues("attachment_url", "");
    } catch (error) {
      console.log(error);
    }
  };
  const handleDeleteImages = async (image: string) => {
    try {
      // await deleteImage(values?.attachment_url as string)
      setValues(
        "images",
        values?.images.filter((img) => img !== image)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    if (
      !values?.subject_id ||
      !values?.chapter_id ||
      !values?.topic ||
      !values?.deadline
    ) {
      setError({
        subject: !values?.subject_id,
        chapter: !values?.chapter_id,
        topic: !values?.topic,
        deadline: !values?.deadline,
      });
      setLoading(false);
      return;
    }
    onSubmit();
    setLoading(false);
  };

  const createPost = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-white !p-2 !rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center py-2">
            হোমওয়ার্ক পোস্ট করুন
          </DialogTitle>
        </DialogHeader>
        <div className="!max-h-[600px] p-2 !overflow-y-auto">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={values?.subject_id}
                onValueChange={(value) => {
                  setValues("subject_id", value);
                  getChapters(value);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "w-full !h-9 !md:h-10 !px-4 !rounded-lg ring-2 ring-ash shadow-none duration-300 bg-white dark:text-white text-gray-900 hover:bg-ash",
                    error?.subject && !values?.subject_id && "ring-hot ring-2"
                  )}
                >
                  <SelectValue placeholder="বিষয়" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={values?.chapter_id}
                onValueChange={(value) => {
                  setValues("chapter_id", value);
                }}
                disabled={topicLoading}
              >
                <SelectTrigger
                  className={cn(
                    "w-full !h-9 !md:h-10 !px-4 !rounded-lg ring-2 ring-ash shadow-none duration-300 bg-white dark:text-white text-gray-900 hover:bg-ash",
                    error?.chapter && !values?.chapter_id && "ring-hot ring-2"
                  )}
                >
                  <SelectValue
                    placeholder={
                      topicLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "চ্যাপ্টার"
                      )
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {chapters?.map((chapter: Chapter) => (
                    <SelectItem key={chapter?.id} value={chapter?.id}>
                      {chapter?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className={cn(
                  "!rounded-lg",
                  error?.topic && !values?.topic && "ring-hot !ring-2"
                )}
                type="text"
                placeholder="টপিক"
                value={values?.topic || ""}
                onChange={(e) => setValues("topic", e.target.value)}
              />
              <Input
                className={cn(
                  "!rounded-lg",
                  error?.deadline &&
                    !values?.deadline &&
                    "ring-hot !ring-2 placeholder:text-red-500"
                )}
                type="datetime-local"
                placeholder="ডেডলাইন"
                value={values?.deadline || ""}
                onChange={(e) => setValues("deadline", e.target.value)}
              />
            </div>

            <div className="py-2 grid gap-4">
              <RtxEditor
                content={values?.body || ""}
                onUpdate={handleEditPrompt}
              />
              {values?.attachment_url && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-light ring-1 ring-hot/50 rounded-lg p-2 bg-hot/10 w-full">
                    {values.attachment_url.split("/").pop()}.pdf
                  </p>
                  <button
                    type="button"
                    className="text-hot hover:text-white duration-300 hover:bg-hot bg-hot/20 p-2 rounded-full"
                    onClick={handleDeleteAttachment}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {values?.images && values?.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {values?.images.map((image) => (
                    <div
                      key={image}
                      className="flex relative w-full h-[200px] items-center gap-2"
                    >
                      <Image
                        src={image}
                        alt="image"
                        fill
                        className="text-sm object-cover text-light ring-2 ring-hot/50 rounded-lg bg-hot/10"
                      />
                      <button
                        type="button"
                        className="text-hot absolute top-2 right-2 hover:text-white duration-300 hover:bg-hot bg-hot/20 p-2 rounded-full"
                        onClick={() => handleDeleteImages(image)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* <button type='button'>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="5.25" cy="5.25" r="1.25" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M1.08301 8.9987C1.08301 5.26675 1.08301 3.40077 2.24238 2.2414C3.40175 1.08203 5.26772 1.08203 8.99967 1.08203C12.7316 1.08203 14.5976 1.08203 15.757 2.2414C16.9163 3.40077 16.9163 5.26675 16.9163 8.9987C16.9163 12.7306 16.9163 14.5966 15.757 15.756C14.5976 16.9154 12.7316 16.9154 8.99967 16.9154C5.26772 16.9154 3.40175 16.9154 2.24238 15.756C1.08301 14.5966 1.08301 12.7306 1.08301 8.9987Z" stroke="#1C1C1C" strokeWidth="1.5" />
                                    <path d="M3.16602 16.5C6.80973 12.1458 10.8944 6.40333 16.9139 10.2853" stroke="#1C1C1C" strokeWidth="1.5" />
                                </svg>
                            </button> */}
                <div
                  className={cn("relative group cursor-pointer duration-300")}
                >
                  <Input
                    className="!p-0 opacity-0 hover:!cursor-pointer absolute w-full h-full !cursor-pointer"
                    type="file"
                    accept="image/*"
                    onChange={handleImagesChange}
                    multiple={true}
                  />

                  {imgUploading ? (
                    <Loader2 className="animate-spin text-center mb-1" />
                  ) : (
                    <p className="flex items-center gap-2 group-hover:text-elegant text-[#242424]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="5.25"
                          cy="5.25"
                          r="1.25"
                          stroke="#1C1C1C"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M1.08301 8.9987C1.08301 5.26675 1.08301 3.40077 2.24238 2.2414C3.40175 1.08203 5.26772 1.08203 8.99967 1.08203C12.7316 1.08203 14.5976 1.08203 15.757 2.2414C16.9163 3.40077 16.9163 5.26675 16.9163 8.9987C16.9163 12.7306 16.9163 14.5966 15.757 15.756C14.5976 16.9154 12.7316 16.9154 8.99967 16.9154C5.26772 16.9154 3.40175 16.9154 2.24238 15.756C1.08301 14.5966 1.08301 12.7306 1.08301 8.9987Z"
                          stroke="#1C1C1C"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3.16602 16.5C6.80973 12.1458 10.8944 6.40333 16.9139 10.2853"
                          stroke="#1C1C1C"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </p>
                  )}
                </div>

                <div
                  className={cn("relative group cursor-pointer duration-300")}
                >
                  <Input
                    className="!p-0 opacity-0 hover:!cursor-pointer absolute w-full h-full !cursor-pointer"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    // multiple={multiple}
                  />

                  {imgUploading ? (
                    <Loader2 className="animate-spin text-center mb-1" />
                  ) : (
                    <p className="flex items-center gap-2 group-hover:text-elegant text-[#242424]">
                      <svg
                        width="13"
                        height="16"
                        viewBox="0 0 13 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.5 0C1.08579 0 0.75 0.335786 0.75 0.75C0.75 1.16421 1.08579 1.5 1.5 1.5H12C12.4142 1.5 12.75 1.16421 12.75 0.75C12.75 0.335786 12.4142 0 12 0H1.5ZM7.49626 15.3493C7.4466 15.7154 7.13281 15.9976 6.75311 15.9976C6.3389 15.9976 6.00311 15.6618 6.00311 15.2476L6.00249 5.05856L3.02995 8.02601L2.94578 8.09856C2.65202 8.31621 2.23537 8.29171 1.96929 8.02525C1.67661 7.73215 1.67695 7.25728 1.97005 6.96459L6.25962 2.67989C6.33377 2.61512 6.42089 2.56485 6.5169 2.53385L6.59777 2.51072C6.64749 2.50019 6.69837 2.4947 6.74849 2.4947L6.80855 2.49661L6.87781 2.50451L6.99828 2.53462L7.08947 2.57254L7.12589 2.59371L7.21685 2.6523L7.28752 2.71481L11.5303 6.96546L11.6029 7.04964C11.8205 7.34345 11.7959 7.7601 11.5294 8.02612L11.4452 8.09866C11.1514 8.31624 10.7347 8.29165 10.4687 8.02514L7.50249 5.05456L7.50311 15.2476L7.49626 15.3493Z"
                          fill="currentColor"
                        />
                      </svg>
                    </p>
                  )}
                </div>

                {/* <button type='button'>
                                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C14.2091 0 16 1.79086 16 4C16 6.1422 14.316 7.89108 12.1996 7.9951L12 8H10C9.58579 8 9.25 7.66421 9.25 7.25C9.25 6.8703 9.53215 6.55651 9.89823 6.50685L10 6.5H12C13.3807 6.5 14.5 5.38071 14.5 4C14.5 2.67452 13.4685 1.58996 12.1644 1.50532L12 1.5H10C9.58579 1.5 9.25 1.16421 9.25 0.75C9.25 0.370304 9.53215 0.0565088 9.89823 0.00684643L10 0H12ZM6 0C6.41421 0 6.75 0.335786 6.75 0.75C6.75 1.1297 6.46785 1.44349 6.10177 1.49315L6 1.5H4C2.61929 1.5 1.5 2.61929 1.5 4C1.5 5.32548 2.53154 6.41004 3.83562 6.49468L4 6.5H6C6.41421 6.5 6.75 6.83579 6.75 7.25C6.75 7.6297 6.46785 7.94349 6.10177 7.99315L6 8H4C1.79086 8 0 6.20914 0 4C0 1.8578 1.68397 0.108921 3.80036 0.00489521L4 0H6ZM4.25 3.25H11.75C12.1642 3.25 12.5 3.58579 12.5 4C12.5 4.3797 12.2178 4.69349 11.8518 4.74315L11.75 4.75H4.25C3.83579 4.75 3.5 4.41421 3.5 4C3.5 3.6203 3.78215 3.30651 4.14823 3.25685L4.25 3.25H11.75H4.25Z" fill="currentColor" />
                                </svg>
                            </button> */}
              </div>
              <Button
                className="!bg-hot !text-sm !text-white"
                onClick={handleSubmit}
              >
                {loading ? (
                  <Loader2 className="animate-spin text-center" />
                ) : (
                  "পোস্ট করুন"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="pt-1 relative z-[2]">
      {createPost}
      <div className="p-4 ring-0 md:ring-1 grid gap-2 ring-ash bg-white dark:bg-gradient-to-r md:rounded-xl">
        <div
          onClick={() => {
            setIsOpen(true);
          }}
          className="flex items-center gap-3"
        >
          {user?.image ? (
            <Avatar>
              <AvatarImage src={user?.image as string} />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="relative">
              <Image
                height={40}
                width={40}
                className="rounded-full cursor-pointer ring-2 ring-hot/70 hover:ring-hot/50 transition-all duration-300"
                src={"/user.jpg"}
                alt="Profile"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-hot rounded-full border-2 dark:border-gray-900 border-ash"></span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold">{user.name}</h3>
            <h3 className="text-sm text-light">হোমওয়ার্ক পোস্ট করুন . . .</h3>
          </div>
        </div>

        <div className="border-t border-ash border-dashed"></div>

        <div className="w-full grid grid-cols-3 gap-2 justify-between">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
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
            <span className="pt-1 !font-medium">বিষয়</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
            }}
            className="rounded-full gap-1 text-xs sm:text-sm ring-1 ring-gray-200 sm:ring-0 flex justify-center items-center p-1 shadow-none duration-300"
          >
            <svg
              className="w-4 h-4 text-hot sm:h-5 sm:w-5"
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
            <span className="pt-1 tex !font-medium">ছবি / ফাইল</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
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
  );
};
