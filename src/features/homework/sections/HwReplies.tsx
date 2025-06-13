import React, { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
import { TrashIcon, LoaderCircle, X, Loader2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  fromNow,
  useUser,
} from "@/components";
import Router from "next/router";
import Image from "next/image";
import { useCloudflareImage, useComments } from "@/hooks";
import { Comment } from "@/@types";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { curiosity_id, secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import { ValidImage } from "@/components/shared/ValidImage";
import { toast } from "@/hooks/use-toast";
import { ImageCropper } from "@/lib/imageCrop";
import Link from "next/link";
const AppMath = dynamic(() => import("../../../components/contexts/MathJAX"), {
  ssr: false,
});

interface CommentProps {
  comment: Comment;
  authorId: string;
  setSuccess?: (s: boolean) => void;
  parentCommentId?: string;
  refetch?: (id: string) => void;
}

export const HwReplies = ({
  comment,
  authorId,
  setSuccess,
  parentCommentId,
  refetch,
}: CommentProps) => {
  const { user } = useUser();
  const { addComment, deleteComment } = useComments();
  const { uploadImage } = useCloudflareImage();

  const [reaction, setReaction] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [mention, setMention] = useState<string>("");
  const [replying, setReplying] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    if (comment.reactions && comment.reactions.length > 0) {
      setReaction(comment?.reactions[0].type);
    }
  }, [comment.reactions]);

  const reactToComment = async (r: string) => {
    try {
      setKey((prev) => prev + 1);
      if (comment.user_id === user.id) return;

      if (reaction === r) {
        if (r === "satisfied") {
          comment.satisfied_count -= 1;
        } else if (r === "dissatisfied") {
          comment.dissatisfied_count -= 1;
        }
        setReaction(null);
      } else {
        if (reaction === "satisfied") {
          comment.satisfied_count -= 1;
        } else if (reaction === "dissatisfied") {
          comment.dissatisfied_count -= 1;
        }

        if (r === "satisfied") {
          comment.satisfied_count += 1;
        } else if (r === "dissatisfied") {
          comment.dissatisfied_count += 1;
        }
        setReaction(r);
        setKey((prev) => prev + 1);
      }

      const res = await axios.post(
        `${secondaryAPI}/api/post/${comment.post_id}/comments/${comment.id}/react`,
        {
          authorId,
          reactionType: r,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(res);
    } catch (err) {
      handleError(err as AxiosError, () => reactToComment(r));
    }
  };

  const [imgUploading, setImgUploading] = useState(false);
  const [imgSrc, setImgSrc] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImgUploading(true);
      setImgSrc(f);
      // const imagelink = await uploadImage(file as File)
      // setPreview(imagelink)
      setCropperOpen(true);
      setImgUploading(false);
    }
  };

  const handleCroppedImageChange = async (f: File) => {
    const file = f;
    if (file) {
      setImgUploading(true);
      setFile(file);
      // setPreview(URL.createObjectURL(file));
      setImgUploading(false);
    }
  };

  async function cropDone() {
    try {
      setCropperOpen(false);
      const imagelink = await uploadImage(file as File);
      setPreview(imagelink as string);
    } catch {
      toast({
        title: "Image Upload Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }

  const submitComment = async () => {
    try {
      setReplying(true);
      await addComment(commentText, preview, parentCommentId);
      setCommentText("");
      if (setSuccess) setSuccess(true);
      setReplying(false);
      setPreview("");
      setKey(key + 1);
    } catch (err) {
      setReplying(false);
      handleError(err as AxiosError);
    }
  };

  const setReplyParent = () => {
    setMention(comment.user.name);
    // setParentCommentId(pid)
    setKey(key + 1);
  };

  const cropperModal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <Dialog open={cropperOpen} onOpenChange={setCropperOpen}>
        <DialogContent className="p-4 bg-white flex justify-center max-w-[500px] items-center">
          <DialogHeader>
            <DialogTitle className="text-center py-2 text-black">
              Crop Image
            </DialogTitle>
          </DialogHeader>
          <ImageCropper
            imgFile={imgSrc as File}
            onCropComplete={handleCroppedImageChange}
          />
          <DialogFooter className="grid grid-cols-2 gap-2 justify-between w-full">
            <Button
              className="ring-1 ring-ash text-black pb-1"
              type="button"
              onClick={() => {
                setImgSrc(null);
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

  async function handledeleteComment(id: string) {
    try {
      await deleteComment(id);
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted",
        variant: "success",
      });
      if (refetch) {
        refetch(id);
      }
    } catch (err) {
      handleError(err as AxiosError);
    }
  }

  const bgColor =
    comment?.user_id === curiosity_id
      ? "bg-dashnje ring-2 ring-elegant/20 dark:ring-elegant/50"
      : "bg-dew dark:bg-deep ring-0";

  return (
    <div>
      {cropperOpen && cropperModal}
      <div className="flex w-full pb-4">
        <Avatar
          className="mt-2 cursor-pointer"
          onClick={() => Router.push(`/users/${comment.user.id}`)}
        >
          <AvatarImage src={comment.user.image} alt={comment.user.name} />
          <AvatarFallback>
            {comment.user
              ? comment.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : "U"}
          </AvatarFallback>
        </Avatar>

        <div className="w-full">
          <div
            className={cn(
              bgColor,
              "rounded-xl text-black/80 dark:text-gray-100 dark:shadow-none shadow-gray-200 select-none ml-2 p-4",
              bgColor
            )}
          >
            {comment.user_id === authorId && (
              <svg
                width="49"
                height="13"
                viewBox="0 0 49 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.3844 5.82179C4.48027 5.5485 4.65714 5.26683 5.04286 4.66406L5.78959 3.49712C5.83544 3.42547 5.91464 3.38213 5.9997 3.38213H7.76647C7.85153 3.38213 7.93072 3.42547 7.97657 3.49712L8.7233 4.66406C9.10899 5.26678 9.28586 5.54845 9.38174 5.82173L9.35796 5.83337C9.25366 5.88438 9.15115 5.93365 9.04825 5.97767C8.8375 6.06783 8.65526 6.12225 8.50106 6.12645C8.28913 6.13224 8.10487 6.06022 7.84359 5.94796L7.8138 5.93514C7.75192 5.90848 7.68518 5.87972 7.61377 5.85172C7.46314 5.79265 7.38783 5.76312 7.32249 5.80768C7.25716 5.85224 7.25716 5.93937 7.25716 6.11363L7.25716 11.5645C7.25716 11.7056 7.25716 11.7761 7.30099 11.8199C7.34483 11.8638 7.41538 11.8638 7.55648 11.8638H9.87623C10.0718 11.8638 10.2323 11.7138 10.249 11.5226C10.2499 11.5114 10.2505 11.5002 10.2505 11.4888L10.2505 7.28627C10.2505 6.76544 10.2506 6.39131 10.2053 6.06615C10.2028 6.0487 10.2003 6.03139 10.1976 6.01421C10.1806 5.9061 10.1582 5.80297 10.1286 5.70107C10.0063 5.28049 9.77098 4.91279 9.38513 4.30997L8.01341 2.16636L8.01339 2.16633C7.83857 1.89308 7.68543 1.65373 7.54013 1.48622C7.38739 1.31014 7.17922 1.13721 6.88308 1.13721C6.58694 1.13721 6.37877 1.31014 6.22603 1.48622C6.08073 1.65373 5.92759 1.8931 5.75276 2.16635L4.38104 4.30997C3.99518 4.91279 3.75983 5.28049 3.6376 5.70107C3.61372 5.78323 3.59451 5.86618 3.57907 5.9519C3.57844 5.95498 3.57786 5.95806 3.57731 5.96116C3.55764 6.0719 3.54424 6.18848 3.53511 6.31514C3.52073 6.51288 3.51698 6.73323 3.51602 6.99309C3.51562 7.09187 3.51562 7.19639 3.51563 7.30753L3.51563 11.4896C3.51563 11.6963 3.68314 11.8638 3.88978 11.8638H6.20953C6.35063 11.8638 6.42118 11.8638 6.46502 11.8199C6.50885 11.7761 6.50885 11.7056 6.50885 11.5645L6.50885 6.11363C6.50885 5.93937 6.50885 5.85224 6.44351 5.80768C6.37818 5.76312 6.30287 5.79266 6.15224 5.85172C6.08082 5.87973 6.01409 5.90848 5.95221 5.93514L5.92242 5.94796C5.66114 6.06022 5.47688 6.13224 5.26495 6.12645C5.11075 6.12225 4.92851 6.06783 4.71776 5.97767C4.61487 5.93365 4.51236 5.88438 4.40805 5.83338L4.3844 5.82179Z"
                  fill="#575757"
                />
                <path
                  d="M16.5224 10H15.1161L17.6765 2.72727H19.3029L21.8668 10H20.4606L18.5181 4.21875H18.4613L16.5224 10ZM16.5685 7.14844H20.4038V8.20668H16.5685V7.14844ZM26.2445 7.70597V4.54545H27.53V10H26.2836V9.03054H26.2267C26.1036 9.33594 25.9012 9.5857 25.6195 9.77983C25.3401 9.97396 24.9957 10.071 24.5861 10.071C24.2286 10.071 23.9126 9.99171 23.638 9.8331C23.3657 9.67211 23.1526 9.43892 22.9988 9.13352C22.8449 8.82576 22.7679 8.45407 22.7679 8.01847V4.54545H24.0534V7.8196C24.0534 8.16525 24.1481 8.43987 24.3375 8.64347C24.5269 8.84706 24.7755 8.94886 25.0833 8.94886C25.2727 8.94886 25.4561 8.9027 25.6337 8.81037C25.8113 8.71804 25.9569 8.58073 26.0705 8.39844C26.1865 8.21378 26.2445 7.98295 26.2445 7.70597ZM31.5756 4.54545V5.53977H28.44V4.54545H31.5756ZM29.2141 3.23864H30.4996V8.35938C30.4996 8.5322 30.5257 8.66477 30.5778 8.7571C30.6322 8.84706 30.7032 8.90862 30.7908 8.94176C30.8784 8.97491 30.9755 8.99148 31.082 8.99148C31.1625 8.99148 31.2359 8.98556 31.3022 8.97372C31.3709 8.96188 31.4229 8.95123 31.4585 8.94176L31.6751 9.94673C31.6064 9.97041 31.5082 9.99645 31.3803 10.0249C31.2549 10.0533 31.101 10.0698 30.9187 10.0746C30.5967 10.084 30.3067 10.0355 30.0487 9.92898C29.7906 9.82008 29.5858 9.65199 29.4343 9.42472C29.2852 9.19744 29.2118 8.91335 29.2141 8.57244V3.23864ZM34.0534 6.80398V10H32.7679V2.72727H34.025V5.4723H34.089C34.2168 5.16454 34.4145 4.92187 34.682 4.74432C34.9519 4.56439 35.2952 4.47443 35.7118 4.47443C36.0906 4.47443 36.4209 4.55374 36.7026 4.71236C36.9843 4.87098 37.2021 5.10298 37.356 5.40838C37.5123 5.71378 37.5904 6.08665 37.5904 6.52699V10H36.3049V6.72585C36.3049 6.3589 36.2102 6.07363 36.0208 5.87003C35.8337 5.66406 35.571 5.56108 35.2324 5.56108C35.0051 5.56108 34.8016 5.6108 34.6216 5.71023C34.4441 5.80729 34.3044 5.94815 34.2026 6.13281C34.1032 6.31747 34.0534 6.54119 34.0534 6.80398ZM41.28 10.1065C40.7473 10.1065 40.2857 9.98935 39.8951 9.75497C39.5044 9.5206 39.2014 9.19271 38.986 8.77131C38.7729 8.34991 38.6664 7.85748 38.6664 7.29403C38.6664 6.73059 38.7729 6.23698 38.986 5.81321C39.2014 5.38944 39.5044 5.06037 39.8951 4.82599C40.2857 4.59162 40.7473 4.47443 41.28 4.47443C41.8127 4.47443 42.2743 4.59162 42.665 4.82599C43.0556 5.06037 43.3574 5.38944 43.5705 5.81321C43.7859 6.23698 43.8936 6.73059 43.8936 7.29403C43.8936 7.85748 43.7859 8.34991 43.5705 8.77131C43.3574 9.19271 43.0556 9.5206 42.665 9.75497C42.2743 9.98935 41.8127 10.1065 41.28 10.1065ZM41.2871 9.0767C41.5759 9.0767 41.8174 8.9974 42.0115 8.83878C42.2057 8.67779 42.3501 8.46236 42.4448 8.19247C42.5418 7.92259 42.5904 7.62192 42.5904 7.29048C42.5904 6.95668 42.5418 6.65483 42.4448 6.38494C42.3501 6.11269 42.2057 5.89607 42.0115 5.73509C41.8174 5.5741 41.5759 5.49361 41.2871 5.49361C40.9912 5.49361 40.745 5.5741 40.5485 5.73509C40.3543 5.89607 40.2087 6.11269 40.1117 6.38494C40.017 6.65483 39.9696 6.95668 39.9696 7.29048C39.9696 7.62192 40.017 7.92259 40.1117 8.19247C40.2087 8.46236 40.3543 8.67779 40.5485 8.83878C40.745 8.9974 40.9912 9.0767 41.2871 9.0767ZM44.9847 10V4.54545H46.2312V5.45455H46.288C46.3874 5.13968 46.5579 4.89702 46.7994 4.72656C47.0432 4.55374 47.3214 4.46733 47.6339 4.46733C47.7049 4.46733 47.7842 4.47088 47.8718 4.47798C47.9618 4.48272 48.0363 4.491 48.0955 4.50284V5.68537C48.0411 5.66643 47.9547 5.64986 47.8363 5.63565C47.7203 5.61908 47.6078 5.6108 47.4989 5.6108C47.2646 5.6108 47.0539 5.66169 46.8668 5.76349C46.6822 5.86293 46.5366 6.00142 46.43 6.17898C46.3235 6.35653 46.2702 6.56132 46.2702 6.79332V10H44.9847Z"
                  fill="#757575"
                />
              </svg>
            )}
            <div
              className="flex items-center gap-2 mb-2 cursor-pointer select-none"
              onClick={() => Router.push(`/users/${comment.user.id}`)}
            >
              <h2 className="font-bold flex items-center gap-1 text-xs lg:text-sm">
                <span className="pt-1">{comment.user.name}</span>
                {comment.user_id === curiosity_id && (
                  <svg
                    width="36"
                    height="17"
                    viewBox="0 0 36 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      y="0.5"
                      width="36.0003"
                      height="16"
                      rx="8"
                      fill="#8A00CA"
                    />
                    <path
                      opacity="0.4"
                      d="M12.3957 3.5C12.5588 3.5 12.7001 3.61304 12.736 3.77218L12.9865 4.88454C13.1695 5.69664 13.8037 6.33083 14.6158 6.51377L15.7281 6.76434C15.8873 6.80019 16.0003 6.94153 16.0003 7.10465C16.0003 7.26777 15.8873 7.40911 15.7281 7.44496L14.6158 7.69553C13.8037 7.87847 13.1695 8.51266 12.9865 9.32476L12.736 10.4371C12.7001 10.5963 12.5588 10.7093 12.3957 10.7093C12.2325 10.7093 12.0912 10.5963 12.0554 10.4371L11.8048 9.32476C11.6218 8.51266 10.9877 7.87847 10.1756 7.69553L9.06319 7.44496C8.90406 7.40911 8.79102 7.26777 8.79102 7.10465C8.79102 6.94153 8.90406 6.80019 9.06319 6.76434L10.1756 6.51377C10.9877 6.33083 11.6218 5.69664 11.8048 4.88454L12.0554 3.77218C12.0912 3.61304 12.2325 3.5 12.3957 3.5Z"
                      fill="white"
                    />
                    <path
                      d="M8.67442 8.15112C8.83754 8.15112 8.97888 8.26417 9.01473 8.4233L9.19371 9.21784C9.31592 9.76037 9.73959 10.184 10.2821 10.3063L11.0767 10.4852C11.2358 10.5211 11.3488 10.6624 11.3488 10.8255C11.3488 10.9887 11.2358 11.13 11.0767 11.1659L10.2821 11.3448C9.73959 11.467 9.31592 11.8907 9.19371 12.4332L9.01473 13.2278C8.97888 13.3869 8.83754 13.5 8.67442 13.5C8.5113 13.5 8.36996 13.3869 8.33411 13.2278L8.15513 12.4332C8.03292 11.8907 7.60925 11.467 7.06672 11.3448L6.27218 11.1659C6.11304 11.13 6 10.9887 6 10.8255C6 10.6624 6.11304 10.5211 6.27218 10.4852L7.06672 10.3063C7.60925 10.184 8.03292 9.76037 8.15513 9.21785L8.33411 8.4233C8.36996 8.26417 8.5113 8.15112 8.67442 8.15112Z"
                      fill="white"
                    />
                    <path
                      d="M21 9.08L20.892 9.428H23.172L23.064 9.068C22.792 8.204 22.568 7.48 22.392 6.896C22.224 6.304 22.12 5.932 22.08 5.78L22.032 5.54C21.96 5.94 21.616 7.12 21 9.08ZM19.92 12.5H18.336L21.072 4.412H23.028L25.764 12.5H24.132L23.556 10.664H20.496L19.92 12.5ZM28.5339 12.5H27.0219V4.412H28.5339V12.5Z"
                      fill="white"
                    />
                  </svg>
                )}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-400">
                {fromNow(comment?.created_at as Date)}
              </p>
            </div>

            <div>
              <div className="mb-2 select-text">
                <div className="px-2 w-full">
                  <AppMath
                    className="!max-w-[calc(100vw-180px)] lg:!max-w-xl"
                    formula={comment?.content || ""}
                    key={key}
                  />
                </div>
              </div>

              {comment?.image && (
                <Image
                  height={200}
                  width={200}
                  src={comment.image}
                  className="rounded-md"
                  alt=""
                />
              )}
            </div>
          </div>
          {comment.user_id === curiosity_id && (
            <div className="mt-3 text-xs md:text-sm font-medium px-3">
              <p>তুমি কি এই উত্তরটিতে স্যাটিস্ফাইড?</p>
            </div>
          )}
          <div className="flex items-center px-2 mt-2 space-x-4 text-xs md:text-sm font-medium text-light">
            {comment.user_id === curiosity_id ? (
              <>
                <button
                  type="button"
                  className={`flex items-center gap-1 ${
                    reaction === "satisfied" ? "text-elegant font-bold" : ""
                  }`}
                  onClick={() => reactToComment("satisfied")}
                >
                  {/* <HeartIcon size={16} /> */}
                  <svg
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill={reaction === "satisfied" ? "#8A00CA" : "none"}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.0969 2.99561C13.0857 1.76192 11.3303 2.25909 10.2758 3.05101C9.84339 3.37572 9.6272 3.53807 9.5 3.53807C9.3728 3.53807 9.15661 3.37572 8.72424 3.05101C7.66971 2.25909 5.91431 1.76192 3.90308 2.99561C1.26355 4.6147 0.66629 9.95614 6.75465 14.4625C7.91429 15.3208 8.49411 15.75 9.5 15.75C10.5059 15.75 11.0857 15.3208 12.2454 14.4625C18.3337 9.95614 17.7365 4.6147 15.0969 2.99561Z"
                      stroke={reaction === "satisfied" ? "#8A00CA" : "#575757"}
                      strokeWidth="1.125"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="">Yes</span>
                  <p className="flex items-center gap-1">
                    <span
                      className={cn(
                        "pt-0.5 ring-1 min-w-7 rounded-full px-2 text-xs",
                        reaction === "satisfied"
                          ? "text-elegant bg-elegant/10 ring-elegant/50"
                          : "bg-light/10 text-light ring-light/50 "
                      )}
                    >
                      {comment.satisfied_count}
                    </span>
                  </p>
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1 ${
                    reaction === "dissatisfied"
                      ? "text-[#F43F5E] font-bold"
                      : ""
                  }`}
                  onClick={() => reactToComment("dissatisfied")}
                >
                  <svg
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.39664 2.18617C7.17914 1.56307 5.47398 1.37219 3.60867 2.51637C2.06274 3.46464 1.19287 5.44545 1.49811 7.72134C1.80482 10.0082 3.28501 12.5947 6.41971 14.9149C7.50825 15.7211 8.30716 16.3127 9.49971 16.3127C10.6923 16.3127 11.4912 15.7211 12.5797 14.9149C15.7144 12.5947 17.1946 10.0082 17.5013 7.72134C17.8065 5.44545 16.9367 3.46464 15.3907 2.51637C13.155 1.14497 11.1493 1.69153 9.93769 2.60146C9.92223 2.61307 9.90714 2.6244 9.89242 2.63544L11.8749 6.49285C11.9953 6.72709 11.937 7.0135 11.7347 7.1821L9.95787 8.66277L11.0223 9.72723C11.2048 9.90974 11.2397 10.193 11.1069 10.4144L9.98191 12.2894C9.82208 12.5558 9.47656 12.6421 9.21017 12.4823C8.94378 12.3225 8.8574 11.977 9.01724 11.7106L9.91628 10.2122L8.72683 9.02272C8.61508 8.91097 8.55549 8.75736 8.56265 8.59948C8.56981 8.4416 8.64306 8.29402 8.76447 8.19285L10.6683 6.60632L8.39664 2.18617Z"
                      fill="#FC465D"
                    />
                  </svg>
                  <span className="">No</span>
                  <p className="flex items-center">
                    <span
                      className={cn(
                        "ring-1 min-w-7 pt-0.5 rounded-full text-xs",
                        reaction === "dissatisfied"
                          ? "text-hot bg-hot/10 ring-hot/50"
                          : "bg-light/10 text-light ring-light/50"
                      )}
                    >
                      {comment.dissatisfied_count}
                    </span>
                  </p>
                </button>
                <button
                  type="button"
                  className="flex items-center"
                  onClick={() => setReplyParent()}
                >
                  {/* <ReplyIcon size={16} /> */}
                  <span className="">Reply</span>
                </button>
              </>
            ) : comment.user_id !== user.id ? (
              <>
                <button
                  type="button"
                  className={`flex items-center gap-1 ${
                    reaction === "satisfied" ? "text-elegant font-bold" : ""
                  }`}
                  onClick={() => reactToComment("satisfied")}
                >
                  {/* <HeartIcon size={16} /> */}
                  <svg
                    width="19"
                    height="18"
                    viewBox="0 0 19 18"
                    fill={reaction === "satisfied" ? "#8A00CA" : "none"}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.0969 2.99561C13.0857 1.76192 11.3303 2.25909 10.2758 3.05101C9.84339 3.37572 9.6272 3.53807 9.5 3.53807C9.3728 3.53807 9.15661 3.37572 8.72424 3.05101C7.66971 2.25909 5.91431 1.76192 3.90308 2.99561C1.26355 4.6147 0.66629 9.95614 6.75465 14.4625C7.91429 15.3208 8.49411 15.75 9.5 15.75C10.5059 15.75 11.0857 15.3208 12.2454 14.4625C18.3337 9.95614 17.7365 4.6147 15.0969 2.99561Z"
                      stroke={reaction === "satisfied" ? "#8A00CA" : "#575757"}
                      strokeWidth="1.125"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="">Satisfied</span>
                  <p className="flex items-center gap-1">
                    <span
                      className={cn(
                        "pt-0.5 ring-1 min-w-7 rounded-full px-2 text-xs",
                        reaction === "satisfied"
                          ? "text-elegant bg-elegant/10 ring-elegant/50"
                          : "bg-light/10 text-light ring-light/50 "
                      )}
                    >
                      {comment.satisfied_count}
                    </span>
                  </p>
                </button>
                <button
                  type="button"
                  className="flex items-center"
                  onClick={() => setReplyParent()}
                >
                  {/* <ReplyIcon size={16} /> */}
                  <span className="">Reply</span>
                </button>
              </>
            ) : (
              <>
                <button
                  disabled
                  type="button"
                  className={`flex items-center gap-1 ${
                    reaction === "satisfied" ? "text-elegant font-bold" : ""
                  }`}
                  onClick={() => reactToComment("satisfied")}
                >
                  <span className="">Satisfied</span>
                  <p className="flex items-center gap-1">
                    <span
                      className={cn(
                        "pt-0.5 ring-1 min-w-7 rounded-full px-2 text-xs",
                        reaction === "satisfied"
                          ? "text-elegant bg-elegant/10 ring-elegant/50"
                          : "bg-light/10 text-light ring-light/50 "
                      )}
                    >
                      {comment.satisfied_count}
                    </span>
                  </p>
                </button>
              </>
            )}
            {user.role === "ADMIN" ? (
              <button
                className="flex items-center text-red-500 hover:underline"
                onClick={() => handledeleteComment(comment.id)}
              >
                <TrashIcon size={16} className="mr-1 text-red-500" />
                <span className="pt-0.5">Delete</span>
              </button>
            ) : comment.user_id === user.id ? (
              <div className="flex items-center gap-2 justify-end w-full">
                <button
                  type="button"
                  className="flex items-center text-red-500 hover:underline"
                  onClick={() => handledeleteComment(comment.id)}
                >
                  <TrashIcon size={16} className="mr-1 text-red-500" />
                  <span className="pt-1">Delete</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 grid">
          {comment.replies.map((reply) => (
            <HwReplies
              key={reply.id}
              comment={reply}
              authorId={authorId}
              parentCommentId={parentCommentId}
            />
          ))}
        </div>
      )}

      {mention && (
        <div
          className={cn(
            "flex gap-2 pl-10 pb-8",
            !!preview ? "items-start" : "items-center"
          )}
        >
          <div
            className={cn(
              "flex justify-between w-full gap-4",
              !!preview ? "items-start" : "items-center"
            )}
            id="commentbox"
          >
            <ValidImage src={user?.image || ""} alt={user?.name || ""} />
            <div className="flex-1 pt-1">
              <Input
                type="text"
                className="!bg-transparent !h-full !rounded-full !text-gray-900 dark:!text-gray-100"
                value={commentText}
                onChange={(e) => {
                  e.preventDefault();
                  setCommentText(e.target.value);
                  setKey(key + 2);
                }}
                placeholder={`Type your reply to ...@${mention}`}
              />
              {/* <span className="text-xs font-semibold text-teal-500">Replying to @{mention}</span> */}
              {preview && (
                <div className="w-full h-full flex justify-center py-4">
                  <div className="max-w-[180px] min-h-[180px] relative">
                    <div>
                      <Image
                        src={preview as string}
                        alt="preview"
                        width={180}
                        height={180}
                        className="rounded-lg object-contain ring-1 ring-ash"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute duration-300 hover:opacity-100 opacity-0 rounded-lg top-0 right-0 w-full h-full flex items-center justify-center hover:bg-black/40"
                      onClick={() => {
                        setPreview(null);
                        setFile(null);
                        setImgSrc(null);
                      }}
                    >
                      <span className="p-2 rounded-lg bg-red-500">
                        <X className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="!rounded-full !cursor-pointer flex items-center gap-2 relative !text-black dark:!text-hot dark:bg-hot/20 bg-white p-2">
            <Input
              className="!p-0 opacity-0 absolute w-full h-full !cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imgUploading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
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
            )}
          </div>

          <div
            className={cn(
              !commentText ? "text-light" : "text-hot bg-hot/10",
              "duration-300 rounded-full transition-all text-right"
            )}
          >
            <button
              type="submit"
              disabled={!commentText}
              onClick={submitComment}
              className="!rounded-full p-2"
            >
              {replying ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.4164 9.30198L2.29277 1.43678C2.15411 1.36914 2.00184 1.33398 1.84755 1.33398C1.2867 1.33398 0.832031 1.78865 0.832031 2.3495V2.37881C0.832031 2.51508 0.84874 2.65083 0.88179 2.78303L2.42843 8.96957C2.47067 9.13857 2.61355 9.2634 2.78665 9.28265L9.58462 10.038C9.82036 10.0642 9.9987 10.2634 9.9987 10.5007C9.9987 10.7379 9.82036 10.9372 9.58462 10.9633L2.78665 11.7187C2.61355 11.7379 2.47067 11.8627 2.42843 12.0317L0.88179 18.2182C0.84874 18.3505 0.832031 18.4862 0.832031 18.6225V18.6518C0.832031 19.2127 1.2867 19.6673 1.84755 19.6673C2.00184 19.6673 2.15411 19.6322 2.29277 19.5645L18.4164 11.6993C18.8746 11.4758 19.1654 11.0106 19.1654 10.5007C19.1654 9.99074 18.8746 9.52548 18.4164 9.30198Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const FeaturedComments = (props: {
  comment: Comment;
  postId: string;
}) => {
  const { comment, postId } = props;
  const { user } = useUser();
  const [reaction, setReaction] = useState<string | null>(null);

  useEffect(() => {
    setReaction(comment?.reactions[0]?.type);
  }, [comment]);

  const reactToComment = async (r: string) => {
    try {
      if (comment.user_id === user.id) return;

      if (reaction === r) {
        if (r === "satisfied") {
          comment.satisfied_count -= 1;
        } else if (r === "dissatisfied") {
          comment.dissatisfied_count -= 1;
        }
        setReaction(null);
      } else {
        if (reaction === "satisfied") {
          comment.satisfied_count -= 1;
        } else if (reaction === "dissatisfied") {
          comment.dissatisfied_count -= 1;
        }

        if (r === "satisfied") {
          comment.satisfied_count += 1;
        } else if (r === "dissatisfied") {
          comment.dissatisfied_count += 1;
        }
        setReaction(r);
      }

      const res = await axios.post(
        `${secondaryAPI}/api/post/${postId}/comments/${comment.id}/react`,
        {
          authorId: user.id,
          reactionType: r,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(res);
    } catch (err) {
      handleError(err as AxiosError, () => reactToComment(r));
    }
  };

  const bgColor = "bg-dashnje ring-2 ring-elegant/20 dark:ring-elegant/50";

  return (
    <div className="relative">
      <div className={cn("flex items-start gap-3 p-4 rounded-xl")}>
        <div className="relative h-[40px] w-[40px]">
          <ValidImage
            height={40}
            width={40}
            className="rounded-full cursor-pointer ring-2 ring-elegant/40 hover:ring-elegant/50 transition-all duration-300"
            src={(comment?.user?.image as string) || "/ai.png"}
            alt="Profile"
          />
          <span className="absolute bottom-2 -right-0 w-2 h-2 bg-elegant rounded-full border-1 border-white"></span>
        </div>
        <div>
          <div className={cn("flex-1 gap-2 p-2 rounded-xl", bgColor)}>
            <div className="flex w-full gap-1 items-center justify-between">
              <Link
                href={`/users/${comment?.user?.id || curiosity_id}`}
                className="text-sm flex items-center gap-2 px-2 text-black font-semibold capitalize"
              >
                {comment?.user?.name || "কিউরিওসিটি"}
                <svg
                  width="34"
                  height="16"
                  viewBox="0 0 34 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="33.9989" height="16" rx="8" fill="white" />
                  <path
                    d="M11.7827 2C11.9283 2 12.0544 2.10086 12.0864 2.24284L12.31 3.2353C12.4732 3.95986 13.0391 4.52569 13.7637 4.68891L14.7562 4.91247C14.8982 4.94445 14.9991 5.07056 14.9991 5.21609C14.9991 5.36163 14.8982 5.48774 14.7562 5.51972L13.7637 5.74328C13.0391 5.9065 12.4732 6.47233 12.31 7.19689L12.0864 8.18935C12.0544 8.33133 11.9283 8.43219 11.7827 8.43219C11.6372 8.43219 11.5111 8.33133 11.4791 8.18935L11.2555 7.19689C11.0923 6.47233 10.5264 5.9065 9.80179 5.74328L8.80926 5.51972C8.66727 5.48774 8.56641 5.36163 8.56641 5.21609C8.56641 5.07056 8.66727 4.94445 8.80926 4.91247L9.80179 4.68891C10.5264 4.52569 11.0923 3.95986 11.2555 3.2353L11.4791 2.24284C11.5111 2.10086 11.6372 2 11.7827 2Z"
                    fill="#8A00CA"
                  />
                  <path
                    d="M9.55688 6.88672C9.77383 6.88672 9.96181 7.03705 10.0095 7.24868L10.2475 8.30532C10.4101 9.0268 10.9735 9.59023 11.6951 9.75275L12.7518 9.99077C12.9634 10.0384 13.1138 10.2264 13.1138 10.4433C13.1138 10.6603 12.9634 10.8482 12.7518 10.8959L11.6951 11.1339C10.9735 11.2965 10.4101 11.8599 10.2475 12.5814L10.0095 13.638C9.96181 13.8496 9.77383 14 9.55688 14C9.33994 14 9.15196 13.8496 9.10428 13.638L8.86624 12.5814C8.70371 11.8599 8.14024 11.2965 7.4187 11.1339L6.36199 10.8959C6.15035 10.8482 6 10.6603 6 10.4433C6 10.2264 6.15035 10.0384 6.36199 9.99077L7.4187 9.75275C8.14024 9.59023 8.70371 9.02681 8.86624 8.30532L9.10428 7.24868C9.15196 7.03705 9.33994 6.88672 9.55688 6.88672Z"
                    fill="#8A00CA"
                  />
                  <path
                    d="M18.999 8.58L18.891 8.928H21.171L21.063 8.568C20.791 7.704 20.567 6.98 20.391 6.396C20.223 5.804 20.119 5.432 20.079 5.28L20.031 5.04C19.959 5.44 19.615 6.62 18.999 8.58ZM17.919 12H16.335L19.071 3.912H21.027L23.763 12H22.131L21.555 10.164H18.495L17.919 12ZM26.533 12H25.021V3.912H26.533V12Z"
                    fill="#8A00CA"
                  />
                </svg>
              </Link>
              <p className="text-xs text-light">
                {fromNow(comment?.created_at as Date)}
              </p>
            </div>
            <div className="rounded-md relative bg-muted p-2">
              <AppMath
                className="!max-w-[calc(100vw-120px)] xl:!max-w-[calc(100vw-980px)]"
                formula={
                  comment.content +
                  '<span class="text-elegant"> See more</span>'
                }
              />
              <Link
                href={`/post/${postId}`}
                className="absolute w-full z-10 h-full top-0 right-0"
              ></Link>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button
              disabled={reaction === "satisfied"}
              type="button"
              onClick={() => reactToComment("satisfied")}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                reaction === "satisfied" ? "text-elegant" : "text-light"
              )}
            >
              <svg
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.10867 1.51637C5.3444 0.144968 7.35007 0.691528 8.56173 1.60146C8.76106 1.75115 8.89786 1.8536 8.99971 1.92278C9.10155 1.8536 9.23836 1.75115 9.43769 1.60146C10.6493 0.691528 12.655 0.144968 14.8907 1.51637C16.4367 2.46464 17.3065 4.44545 17.0013 6.72134C16.6946 9.0082 15.2144 11.5947 12.0797 13.9149C10.9912 14.7211 10.1923 15.3127 8.99971 15.3127C7.80716 15.3127 7.00825 14.7211 5.91971 13.9149C2.78501 11.5947 1.30482 9.0082 0.998106 6.72134C0.692868 4.44545 1.56274 2.46464 3.10867 1.51637Z"
                  fill={reaction === "satisfied" ? "#8A00CA" : ""}
                  stroke={reaction === "satisfied" ? "" : "#575757"}
                />
              </svg>
              Yes
              <span
                className={cn(
                  "text-sm min-w-[20px] rounded-full h-4 font-normal flex items-center justify-center",
                  reaction === "satisfied"
                    ? "bg-elegant/10 ring-elegant ring-[1px] text-elegant"
                    : "bg-light/10 ring-light ring-[1px] text-light"
                )}
              >
                {comment.satisfied_count}
              </span>
            </button>
            <button
              disabled={reaction === "dissatisfied"}
              type="button"
              onClick={() => reactToComment("dissatisfied")}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold",
                reaction === "dissatisfied" ? "text-red-500" : "text-light"
              )}
            >
              <svg
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill={reaction === "dissatisfied" ? "red" : "none"}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 11L10.125 9.125L8.625 7.625L10.875 5.75L9 2.75C9 2.75 9.34339 2.37572 9.77576 2.05101C10.8303 1.25909 12.5857 0.761922 14.5969 1.99561C17.2365 3.6147 17.8337 8.95614 11.7454 13.4625C10.5857 14.3208 10.0059 14.75 9 14.75C7.99411 14.75 7.41429 14.3208 6.25465 13.4625C0.16629 8.95614 0.763551 3.6147 3.40308 1.99561C4.82361 1.12426 6.11652 1.11635 7.125 1.46591"
                  stroke={reaction === "dissatisfied" ? "none" : "#575757"}
                  fill={reaction === "dissatisfied" ? "red" : "none"}
                  strokeWidth="1.125"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              No
              <span
                className={cn(
                  "text-sm min-w-[20px] rounded-full h-4 font-normal flex items-center justify-center",
                  reaction === "dissatisfied"
                    ? "bg-red-500/10 ring-red-500 ring-[1px] text-red-500"
                    : "bg-light/10 ring-light ring-[1px] text-light"
                )}
              >
                {comment.dissatisfied_count}
              </span>
            </button>
            <Link
              href={`/post/${postId}`}
              className="flex items-center gap-2 text-sm font-semibold text-light"
            >
              Reply
            </Link>
          </div>
        </div>
      </div>
      {/* <Link href={`/post/${postId}`} className='absolute w-full z-10 h-full top-0 right-0'></Link> */}
    </div>
  );
};
