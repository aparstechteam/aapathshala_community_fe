/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useUser,
} from "@/components";
import { cn } from "@/lib/utils";
import { TSubmission } from "@/@types/homeworks";
import { PopoverClose } from "@radix-ui/react-popover";
import { Bookmark, BookmarkCheck, MoreVertical, Trash, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { secondaryAPI } from "@/configs";
import { toast } from "@/hooks";
import Link from "next/link";
import { Replies } from "./Details";
import { ValidImage } from "@/components/shared/ValidImage";
import { ImagePreview } from "@/components/shared/ImagePreview";
import { Gallery } from "@/components/shared/Gallery";
// import { HwReplies } from "./sections/HwReplies";
// import { comments } from "@/data/comments";
// import CreateReply from "./sections/CreateReply";
type TTeacher = {
  id: string;
  name: string;
  image: string;
  role: string;
};
type Props = {
  submission: TSubmission;
  submitMarks: (m: TSubmission) => void;
  handleDelete: (id: string) => void;
  isSolution: string | null;
  setIsSolution: (isSolution: string | null) => void;
  teacher?: TTeacher;
  setSuggestedReplies: (replies: Replies[]) => void;
  suggestedReplies: Replies[];
};

export const HwsCard = (props: Props) => {
  const {
    submission,
    submitMarks,
    handleDelete,
    teacher,
    isSolution,
    setIsSolution,
    setSuggestedReplies,
    suggestedReplies,
  } = props;
  const [marks, setMarks] = useState(submission?.marks);
  const [isBest, setIsBest] = useState(submission?.is_best);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [audience, setAudience] = useState("p");
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState(submission?.reply);
  const [isBookmarked, setIsBookmarked] = useState(submission?.is_bookmarked);
  // const [isSolution, setIsSolution] = useState(submission?.is_solution);
  const [openAddReply, setOpenAddReply] = useState(false);
  const [customReply, setCustomReply] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (submission?.is_solution) {
      setIsSolution(submission?.id);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission]);

  // Add suggested replies array
  // const suggestedReplies = [
  //   "Fantastic 😍",
  //   "Awesome! 👏",
  //   "Great job! 🌟",
  //   "Keep it up! 💪",
  //   "Well done! ✨",
  //   "Excellent! 🎯",
  //   "Best submission! 🏆",
  //   "চমৎকার! 🌟",
  //   "দারুণ হয়েছে! 👏",
  //   "অসাধারণ! ✨",
  //   "খুব সুন্দর! 😍",
  //   "এভাবেই এগিয়ে যাও! 💪",
  //   "সেরা! 🏆",
  // ];

  const handleBookmark = async () => {
    try {
      await axios.post(
        `${secondaryAPI}/api/homework/bookmark`,
        {
          submission_id: submission.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Bookmark Removed" : "Bookmark Added",
        description: isBookmarked
          ? "Submission removed from bookmarks"
          : "Submission added to bookmarks",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  async function handleAddCustomReply() {
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${secondaryAPI}/api/homework/saved-replies`,
        {
          reply: customReply,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setSuggestedReplies([...suggestedReplies, res.data.data]);
      setCustomReply("");
      toast({
        title: "Reply Added",
        description: "Reply added successfully",
        variant: "success",
      });
      // setOpenAddReply(false);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  async function handleAddSolution() {
    try {
      const sol =
        isSolution === null
          ? true
          : isSolution === submission?.id
          ? false
          : true;
      submitMarks({
        ...submission,
        is_solution: sol,
      });

      if (isSolution === submission?.id) {
        setIsSolution(null);
        toast({
          title: "Solution Removed",
          description: "Solution removed successfully",
          variant: "success",
        });
      } else {
        setIsSolution(submission?.id);
        toast({
          title: "Solution Added",
          description: "Solution added successfully",
          variant: "success",
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteReply(id: number) {
    try {
      await axios.delete(`${secondaryAPI}/api/homework/saved-replies/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setSuggestedReplies(suggestedReplies?.filter((reply) => reply.id !== id));
    } catch (error) {
      console.log(error);
    }
  }

  const deleteModal = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[400px] p-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium pt-2">
            ডিলিট করুন
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="!text-base">
          তুমি কি এই প্রতিবেদনটি ডিলিট করতে চাও?
        </DialogDescription>
        <DialogFooter>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              handleDelete(submission.homework_id);
              setIsOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const addReplyModal = (
    <Dialog open={openAddReply} onOpenChange={setOpenAddReply}>
      <DialogContent className="max-w-2xl p-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium pt-2">
            কাস্টম কমেন্ট লিখ
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="!text-base">
          কাস্টম কমেন্ট সিলেক্ট করে এই কমেন্ট পরের বার থেকে তুমি ব্যবহার করতে
          পারবা নিজেদের কমেন্ট সেকশনে হেসল ফ্রি ভাবে, তাই দেরি না করে এখনই কিছু
          কমেন্ট সেট করে ফেলুন।
        </DialogDescription>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 py-2">
            {suggestedReplies.map((reply) => (
              <div
                key={reply.id}
                className="px-3 py-1.5 group text-sm flex items-center bg-hot/10 hover:bg-hot/20 border border-dashed border-ash hover:border-hot rounded-full transition-colors"
              >
                <span>{reply.reply}</span>
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => handleDeleteReply(reply.id)}
                >
                  <X className="h-4 w-4 group-hover:text-hot" />
                </button>
              </div>
            ))}
          </div>
          <Input
            type="text"
            placeholder="কমেন্ট লিখুন"
            className="!rounded-full h-10"
            value={customReply}
            onChange={(e) => setCustomReply(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpenAddReply(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddCustomReply}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col gap-4">
      {deleteModal}
      {addReplyModal}
      <ImagePreview
        selectedImage={selectedImage as string}
        setSelectedImage={setSelectedImage}
        images={submission.images}
      />
      <div
        className={cn(
          isSolution === submission?.id
            ? "bg-gradient-to-br from-purple-50 via-rose-50 ring-2 ring-purple-200 to-sky-50"
            : "bg-white ring-1 ring-ash",
          "grid gap-4 sm:rounded-xl p-4"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10 ring-2 ring-hot rounded-full">
              <ValidImage
                src={submission?.user_image}
                alt="hw-details"
                className="rounded-full h-[40px] w-[40px] object-cover"
                width={40}
                height={40}
              />
            </div>
            <div className="grid sm:flex gap-1">
              <Link
                href={`/users/${submission.user_id}`}
                className="text-base hover:text-hot duration-300"
              >
                {submission.user_name}
              </Link>
              {/* <Tagtag tags={[submission.user_role || ""]} /> */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role !== "USER" ? (
              <button
                disabled={user.level === 0}
                onClick={() => {
                  submitMarks({ ...submission, is_best: !isBest });
                  setIsBest(!isBest);
                }}
                type="button"
                className={cn(
                  "text-sm flex items-center gap-1 rounded-full px-3 py-1 ring-1",
                  isBest
                    ? "text-elegant ring-elegant bg-elegant/10"
                    : "text-light ring-1 ring-light"
                )}
              >
                <span>Best</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.59429 1.10325C6.92442 0.434334 7.87828 0.43433 8.20841 1.10325L9.7295 4.18531L13.1307 4.67954C13.8689 4.7868 14.1637 5.69398 13.6295 6.21466L11.1684 8.6137L11.7494 12.0012C11.8755 12.7364 11.1038 13.2971 10.4435 12.95L7.40135 11.3506L4.35918 12.95C3.69892 13.2971 2.92723 12.7364 3.05333 12.0012L3.63433 8.6137L1.17316 6.21466C0.638999 5.69398 0.933756 4.7868 1.67196 4.67954L5.0732 4.18531L6.59429 1.10325ZM7.40135 1.72752L5.94667 4.67502C5.81558 4.94065 5.56217 5.12476 5.26903 5.16735L2.01627 5.64001L4.36999 7.93431C4.58211 8.14108 4.6789 8.43898 4.62882 8.73093L4.07319 11.9705L6.98254 10.441C7.24473 10.3032 7.55797 10.3032 7.82016 10.441L10.7295 11.9705L10.1739 8.73093C10.1238 8.43898 10.2206 8.14108 10.4327 7.93431L12.7864 5.64001L9.53367 5.16735C9.24053 5.12476 8.98712 4.94064 8.85603 4.67502L7.40135 1.72752Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ) : (
              isBest && (
                <div className="flex items-center justify-end">
                  <button
                    disabled={user.level === 0}
                    type="button"
                    className="text-sm flex items-center gap-1 text-elegant ring-1 ring-elegant bg-elegant/10 rounded-full px-3 py-1"
                  >
                    <span>Best</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.59429 1.10325C6.92442 0.434334 7.87828 0.43433 8.20841 1.10325L9.7295 4.18531L13.1307 4.67954C13.8689 4.7868 14.1637 5.69398 13.6295 6.21466L11.1684 8.6137L11.7494 12.0012C11.8755 12.7364 11.1038 13.2971 10.4435 12.95L7.40135 11.3506L4.35918 12.95C3.69892 13.2971 2.92723 12.7364 3.05333 12.0012L3.63433 8.6137L1.17316 6.21466C0.638999 5.69398 0.933756 4.7868 1.67196 4.67954L5.0732 4.18531L6.59429 1.10325ZM7.40135 1.72752L5.94667 4.67502C5.81558 4.94065 5.56217 5.12476 5.26903 5.16735L2.01627 5.64001L4.36999 7.93431C4.58211 8.14108 4.6789 8.43898 4.62882 8.73093L4.07319 11.9705L6.98254 10.441C7.24473 10.3032 7.55797 10.3032 7.82016 10.441L10.7295 11.9705L10.1739 8.73093C10.1238 8.43898 10.2206 8.14108 10.4327 7.93431L12.7864 5.64001L9.53367 5.16735C9.24053 5.12476 8.98712 4.94064 8.85603 4.67502L7.40135 1.72752Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              )
            )}
            <Popover>
              <PopoverTrigger asChild className="cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[200px] py-2 relative z-[4]"
              >
                {user.role !== "USER"
                  ? user.level !== 0 && (
                      <Button
                        type="button"
                        className="flex disabled:opacity-50 !outline-none items-center gap-2 hover:bg-red-500/10 hover:text-hot w-full !rounded-lg !justify-start"
                        onClick={() => setIsOpen(true)}
                      >
                        <Trash className="h-5 w-5" />
                        <span>Delete</span>
                      </Button>
                    )
                  : user.level !== 0 &&
                    submission.user_id === user?.id && (
                      <Button
                        type="button"
                        className="flex disabled:opacity-50 !outline-none items-center gap-2 hover:bg-red-500/10 hover:text-hot w-full !rounded-lg !justify-start"
                        onClick={() => setIsOpen(true)}
                      >
                        <Trash className="h-5 w-5" />
                        <span>Delete</span>
                      </Button>
                    )}
                <Button
                  type="button"
                  className={cn(
                    "flex !outline-none items-center gap-2 w-full hover:bg-light/10 !rounded-lg !justify-start",
                    isBookmarked && "text-hot"
                  )}
                  onClick={handleBookmark}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-5 w-5" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                  <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                </Button>

                <Button
                  type="button"
                  className={cn(
                    "flex !outline-none items-center gap-2 w-full hover:bg-light/10 !rounded-lg !justify-start",
                    isBookmarked && "text-hot"
                  )}
                  onClick={handleAddSolution}
                >
                  {isSolution === submission?.id ? (
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.66584 0.262479L3.62046 0.253943C3.08817 0.153788 2.617 0.065135 2.21934 0.0625588C1.77227 0.0596626 1.36702 0.163208 0.99815 0.47539C0.617201 0.797791 0.45365 1.21288 0.380181 1.67893C0.312435 2.10867 0.312466 2.64743 0.312502 3.27855L0.312503 8.16074C0.312488 8.74449 0.312476 9.22893 0.354935 9.61335C0.398936 10.0117 0.495524 10.3869 0.751879 10.7003C1.01855 11.0263 1.40556 11.1938 1.81765 11.3148C2.2275 11.4351 2.76586 11.5363 3.42726 11.6607L3.45792 11.6664C4.62952 11.8868 5.53168 12.2356 6.17188 12.5768L6.18556 12.5841C6.51443 12.7593 6.77938 12.9006 6.98237 12.997C7.08592 13.0461 7.18704 13.0903 7.28191 13.1229C7.37043 13.1533 7.49173 13.1875 7.625 13.1875C7.93566 13.1875 8.1875 12.9357 8.1875 12.625V3.39997C8.1875 3.35986 8.1875 3.3398 8.1894 3.3253C8.19558 3.27797 8.20125 3.26345 8.22883 3.22448C8.23727 3.21254 8.26078 3.18707 8.30781 3.13614C8.61729 2.80094 9.74198 2.02078 11.7891 1.6412C12.3604 1.53529 12.6953 1.4759 12.9465 1.47429C13.1491 1.473 13.2223 1.51014 13.2947 1.57051C13.3517 1.61805 13.4144 1.69031 13.4564 1.95267C13.5036 2.24815 13.5057 2.6545 13.5057 3.30712V5.35662C13.5057 5.74646 13.8262 6.0625 14.2216 6.0625C14.617 6.0625 14.9375 5.74646 14.9375 5.35662L14.9375 3.25539C14.9376 2.67054 14.9376 2.15125 14.8707 1.73283C14.7966 1.26902 14.6271 0.832861 14.2197 0.492868C13.8276 0.165699 13.396 0.0596285 12.9372 0.0625588C12.5411 0.0650889 12.0771 0.151206 11.578 0.243832L11.5245 0.253755C9.86413 0.56162 8.64533 1.12408 7.88751 1.64815C7.74303 1.74807 7.67079 1.79803 7.60131 1.79844C7.53183 1.79886 7.45939 1.75004 7.31449 1.6524C6.5418 1.13169 5.32195 0.573909 3.66584 0.262479Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M12.9339 7.79041C13.1839 7.5404 13.3089 7.41539 13.4389 7.34031C13.7918 7.13656 14.2266 7.13656 14.5795 7.34031C14.7096 7.41539 14.8346 7.5404 15.0846 7.79041C15.3346 8.04042 15.4596 8.16543 15.5347 8.29547C15.7384 8.64837 15.7384 9.08316 15.5347 9.43606C15.4596 9.5661 15.3346 9.6911 15.0846 9.94112L11.8537 13.172C11.3581 13.6676 10.61 13.6878 9.94829 13.8293C9.43083 13.9399 9.1721 13.9953 9.02592 13.8491C8.87974 13.7029 8.93506 13.4442 9.04571 12.9267C9.18721 12.265 9.20737 11.5169 9.70301 11.0213L12.9339 7.79041Z"
                        fill="#005E2F"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.66584 0.262479L3.62046 0.253943C3.08817 0.153788 2.617 0.065135 2.21934 0.0625588C1.77227 0.0596626 1.36702 0.163208 0.99815 0.47539C0.617201 0.797791 0.45365 1.21288 0.380181 1.67893C0.312435 2.10867 0.312466 2.64743 0.312502 3.27855L0.312503 8.16074C0.312488 8.74449 0.312476 9.22893 0.354935 9.61335C0.398936 10.0117 0.495524 10.3869 0.751879 10.7003C1.01855 11.0263 1.40556 11.1938 1.81765 11.3148C2.2275 11.4351 2.76586 11.5363 3.42726 11.6607L3.45792 11.6664C4.62952 11.8868 5.53168 12.2356 6.17188 12.5768L6.18556 12.5841C6.51443 12.7593 6.77938 12.9006 6.98237 12.997C7.08592 13.0461 7.18704 13.0903 7.28191 13.1229C7.37043 13.1533 7.49173 13.1875 7.625 13.1875C7.93566 13.1875 8.1875 12.9357 8.1875 12.625V3.39997C8.1875 3.35986 8.1875 3.3398 8.1894 3.3253C8.19558 3.27797 8.20125 3.26345 8.22883 3.22448C8.23727 3.21254 8.26078 3.18707 8.30781 3.13614C8.61729 2.80094 9.74198 2.02078 11.7891 1.6412C12.3604 1.53529 12.6953 1.4759 12.9465 1.47429C13.1491 1.473 13.2223 1.51014 13.2947 1.57051C13.3517 1.61805 13.4144 1.69031 13.4564 1.95267C13.5036 2.24815 13.5057 2.6545 13.5057 3.30712V5.35662C13.5057 5.74646 13.8262 6.0625 14.2216 6.0625C14.617 6.0625 14.9375 5.74646 14.9375 5.35662L14.9375 3.25539C14.9376 2.67054 14.9376 2.15125 14.8707 1.73283C14.7966 1.26902 14.6271 0.832861 14.2197 0.492868C13.8276 0.165699 13.396 0.0596285 12.9372 0.0625588C12.5411 0.0650889 12.0771 0.151206 11.578 0.243832L11.5245 0.253755C9.86413 0.56162 8.64533 1.12408 7.88751 1.64815C7.74303 1.74807 7.67079 1.79803 7.60131 1.79844C7.53183 1.79886 7.45939 1.75004 7.31449 1.6524C6.5418 1.13169 5.32195 0.573909 3.66584 0.262479Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M12.9339 7.79041C13.1839 7.5404 13.3089 7.41539 13.4389 7.34031C13.7918 7.13656 14.2266 7.13656 14.5795 7.34031C14.7096 7.41539 14.8346 7.5404 15.0846 7.79041C15.3346 8.04042 15.4596 8.16543 15.5347 8.29547C15.7384 8.64837 15.7384 9.08316 15.5347 9.43606C15.4596 9.5661 15.3346 9.6911 15.0846 9.94112L11.8537 13.172C11.3581 13.6676 10.61 13.6878 9.94829 13.8293C9.43083 13.9399 9.1721 13.9953 9.02592 13.8491C8.87974 13.7029 8.93506 13.4442 9.04571 12.9267C9.18721 12.265 9.20737 11.5169 9.70301 11.0213L12.9339 7.79041Z"
                        fill="#005E2F"
                      />
                    </svg>
                  )}
                  <span>
                    {isSolution === submission?.id
                      ? "Remove as Solution"
                      : "Mark as Solution"}
                  </span>
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p>{submission?.body}</p>
          <Gallery
            images={submission?.images}
            setSelectedImage={setSelectedImage}
          />
        </div>
        {!!marks && (
          <div className="flex justify-between items-center gap-2 border border-dashed border-hot/50 bg-hot/10 rounded-xl px-4 py-2">
            <p>প্রাপ্ত নম্বর</p>
            <p className="text-lg text-hot font-semibold">{marks}/10</p>
          </div>
        )}

        {user?.role !== "USER" && user.level !== 0 && (
          <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-xl">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-medium">নম্বর দিন</h2>
              <div className="flex flex-wrap w-full justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      submitMarks({ ...submission, marks: item });
                      setMarks(item);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-xl font-medium transition-all duration-300",
                      marks === item
                        ? "bg-hot text-white shadow-lg scale-105"
                        : "bg-hot/10 hover:bg-hot hover:text-white hover:scale-105"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 pt-2 border-t border-dashed border-ash/50">
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAddReply(!openAddReply)}
                    className="text-base font-medium flex items-center gap-2"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.68072 4.78033C7.97361 4.48744 7.97361 4.01256 7.68072 3.71967C7.38783 3.42678 6.91295 3.42678 6.62006 3.71967L3.12006 7.21967C2.82717 7.51256 2.82717 7.98744 3.12006 8.28033L6.62006 11.7803C6.91295 12.0732 7.38783 12.0732 7.68072 11.7803C7.97361 11.4874 7.97361 11.0126 7.68072 10.7197L5.46105 8.5H9.15039C11.4976 8.5 13.4004 10.4028 13.4004 12.75C13.4004 13.1642 13.7362 13.5 14.1504 13.5C14.5646 13.5 14.9004 13.1642 14.9004 12.75C14.9004 9.57436 12.326 7 9.15039 7H5.46105L7.68072 4.78033Z"
                        fill="#575757"
                      />
                    </svg>
                    <span>Add Custom Reply</span>
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="!w-full !rounded-full !px-4 !bg-white"
                    type="text"
                    placeholder="Add your reply..."
                  />

                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex ring-2 ring-ash rounded-full h-9 min-w-9 px-0 sm:px-3 justify-center items-center gap-2"
                        >
                          {audience === "u" ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.25 3.75L9.00005 1.5L3.75005 3.75L6.37505 4.875V6.375M14.25 3.75L11.625 4.875V6.375M14.25 3.75V6.75M6.37505 6.375C6.37505 6.375 7.2503 6 9.00005 6C10.7498 6 11.625 6.375 11.625 6.375M6.37505 6.375V7.125C6.37505 7.46972 6.44294 7.81106 6.57486 8.12954C6.70678 8.44802 6.90014 8.7374 7.14389 8.98116C7.38764 9.22491 7.67702 9.41827 7.9955 9.55018C8.31398 9.6821 8.65533 9.75 9.00005 9.75C9.34477 9.75 9.68611 9.6821 10.0046 9.55018C10.3231 9.41827 10.6124 9.22491 10.8562 8.98116C11.1 8.7374 11.2933 8.44802 11.4252 8.12954C11.5571 7.81106 11.625 7.46972 11.625 7.125V6.375M5.8373 12.5272C5.0123 13.041 2.8478 14.0888 4.16555 15.4005C4.8098 16.0425 5.52755 16.5 6.4283 16.5H11.5718C12.4733 16.5 13.1903 16.0418 13.8345 15.4005C15.1523 14.0888 12.9885 13.041 12.1628 12.528C11.2134 11.938 10.1178 11.6254 9.00005 11.6254C7.88225 11.6254 6.78673 11.938 5.8373 12.528"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8.00004 14.6654C7.07782 14.6654 6.21115 14.4903 5.40004 14.14C4.58893 13.7898 3.88337 13.3149 3.28338 12.7154C2.68338 12.1158 2.20849 11.4103 1.85871 10.5987C1.50893 9.78714 1.33382 8.92048 1.33337 7.9987C1.33293 7.07692 1.50804 6.21025 1.85871 5.3987C2.20937 4.58714 2.68426 3.88159 3.28338 3.28203C3.88249 2.68248 4.58804 2.20759 5.40004 1.85736C6.21204 1.50714 7.07871 1.33203 8.00004 1.33203C8.92137 1.33203 9.78804 1.50714 10.6 1.85736C11.412 2.20759 12.1176 2.68248 12.7167 3.28203C13.3158 3.88159 13.7909 4.58714 14.142 5.3987C14.4932 6.21025 14.668 7.07692 14.6667 7.9987C14.6654 8.92048 14.4903 9.78714 14.1414 10.5987C13.7925 11.4103 13.3176 12.1158 12.7167 12.7154C12.1158 13.3149 11.4103 13.79 10.6 14.1407C9.78982 14.4914 8.92315 14.6663 8.00004 14.6654ZM7.33337 13.2987V11.9987C6.96671 11.9987 6.65293 11.8683 6.39204 11.6074C6.13115 11.3465 6.00049 11.0325 6.00004 10.6654V9.9987L2.80004 6.7987C2.76671 6.9987 2.73626 7.1987 2.70871 7.3987C2.68115 7.5987 2.66715 7.7987 2.66671 7.9987C2.66671 9.34314 3.10849 10.5209 3.99204 11.532C4.8756 12.5431 5.98937 13.132 7.33337 13.2987ZM11.9334 11.5987C12.3889 11.0987 12.7363 10.5405 12.9754 9.92403C13.2145 9.30759 13.3338 8.66581 13.3334 7.9987C13.3334 6.90981 13.0307 5.91536 12.4254 5.01536C11.82 4.11536 11.0116 3.46536 10 3.06536V3.33203C10 3.6987 9.8696 4.0127 9.60871 4.27403C9.34782 4.53536 9.03382 4.66581 8.66671 4.66536H7.33337V5.9987C7.33337 6.18759 7.26937 6.34603 7.14137 6.47403C7.01337 6.60203 6.85515 6.66581 6.66671 6.66536H5.33337V7.9987H9.33337C9.52226 7.9987 9.68071 8.0627 9.80871 8.1907C9.93671 8.3187 10.0005 8.47692 10 8.66536V10.6654H10.6667C10.9556 10.6654 11.2167 10.7516 11.45 10.924C11.6834 11.0965 11.8445 11.3214 11.9334 11.5987Z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                          <span className="text-sm hidden sm:flex text-nowrap">
                            {audience === "u" ? "Only Student" : "Public"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[140px] p-1">
                        <PopoverClose asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAudience("u")}
                            className="w-full flex items-center gap-2 !justify-start"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M14.25 3.75L9.00005 1.5L3.75005 3.75L6.37505 4.875V6.375M14.25 3.75L11.625 4.875V6.375M14.25 3.75V6.75M6.37505 6.375C6.37505 6.375 7.2503 6 9.00005 6C10.7498 6 11.625 6.375 11.625 6.375M6.37505 6.375V7.125C6.37505 7.46972 6.44294 7.81106 6.57486 8.12954C6.70678 8.44802 6.90014 8.7374 7.14389 8.98116C7.38764 9.22491 7.67702 9.41827 7.9955 9.55018C8.31398 9.6821 8.65533 9.75 9.00005 9.75C9.34477 9.75 9.68611 9.6821 10.0046 9.55018C10.3231 9.41827 10.6124 9.22491 10.8562 8.98116C11.1 8.7374 11.2933 8.44802 11.4252 8.12954C11.5571 7.81106 11.625 7.46972 11.625 7.125V6.375M5.8373 12.5272C5.0123 13.041 2.8478 14.0888 4.16555 15.4005C4.8098 16.0425 5.52755 16.5 6.4283 16.5H11.5718C12.4733 16.5 13.1903 16.0418 13.8345 15.4005C15.1523 14.0888 12.9885 13.041 12.1628 12.528C11.2134 11.938 10.1178 11.6254 9.00005 11.6254C7.88225 11.6254 6.78673 11.938 5.8373 12.528"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Only Student</span>
                          </Button>
                        </PopoverClose>
                        <PopoverClose asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAudience("p")}
                            className="w-full flex items-center gap-2 !justify-start"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8.00004 14.6654C7.07782 14.6654 6.21115 14.4903 5.40004 14.14C4.58893 13.7898 3.88337 13.3149 3.28338 12.7154C2.68338 12.1158 2.20849 11.4103 1.85871 10.5987C1.50893 9.78714 1.33382 8.92048 1.33337 7.9987C1.33293 7.07692 1.50804 6.21025 1.85871 5.3987C2.20937 4.58714 2.68426 3.88159 3.28338 3.28203C3.88249 2.68248 4.58804 2.20759 5.40004 1.85736C6.21204 1.50714 7.07871 1.33203 8.00004 1.33203C8.92137 1.33203 9.78804 1.50714 10.6 1.85736C11.412 2.20759 12.1176 2.68248 12.7167 3.28203C13.3158 3.88159 13.7909 4.58714 14.142 5.3987C14.4932 6.21025 14.668 7.07692 14.6667 7.9987C14.6654 8.92048 14.4903 9.78714 14.1414 10.5987C13.7925 11.4103 13.3176 12.1158 12.7167 12.7154C12.1158 13.3149 11.4103 13.79 10.6 14.1407C9.78982 14.4914 8.92315 14.6663 8.00004 14.6654ZM7.33337 13.2987V11.9987C6.96671 11.9987 6.65293 11.8683 6.39204 11.6074C6.13115 11.3465 6.00049 11.0325 6.00004 10.6654V9.9987L2.80004 6.7987C2.76671 6.9987 2.73626 7.1987 2.70871 7.3987C2.68115 7.5987 2.66715 7.7987 2.66671 7.9987C2.66671 9.34314 3.10849 10.5209 3.99204 11.532C4.8756 12.5431 5.98937 13.132 7.33337 13.2987ZM11.9334 11.5987C12.3889 11.0987 12.7363 10.5405 12.9754 9.92403C13.2145 9.30759 13.3338 8.66581 13.3334 7.9987C13.3334 6.90981 13.0307 5.91536 12.4254 5.01536C11.82 4.11536 11.0116 3.46536 10 3.06536V3.33203C10 3.6987 9.8696 4.0127 9.60871 4.27403C9.34782 4.53536 9.03382 4.66581 8.66671 4.66536H7.33337V5.9987C7.33337 6.18759 7.26937 6.34603 7.14137 6.47403C7.01337 6.60203 6.85515 6.66581 6.66671 6.66536H5.33337V7.9987H9.33337C9.52226 7.9987 9.68071 8.0627 9.80871 8.1907C9.93671 8.3187 10.0005 8.47692 10 8.66536V10.6654H10.6667C10.9556 10.6654 11.2167 10.7516 11.45 10.924C11.6834 11.0965 11.8445 11.3214 11.9334 11.5987Z"
                                fill="currentColor"
                              />
                            </svg>
                            <span>Public</span>
                          </Button>
                        </PopoverClose>
                      </PopoverContent>
                    </Popover>

                    <Button
                      type="submit"
                      onClick={() => {
                        submitMarks({
                          ...submission,
                          reply: reply,
                          reply_audience: audience,
                        });
                        setTimeout(() => {
                          setReplies(reply);

                          setReply("");
                        }, 500);
                      }}
                      size="icon"
                      className="w-10 h-10 bg-hot text-white rounded-full hover:bg-hot/90 transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.3168 8.80394L2.19316 0.938738C2.0545 0.871096 1.90223 0.835938 1.74794 0.835938C1.18709 0.835938 0.732422 1.2906 0.732422 1.85145V1.88076C0.732422 2.01703 0.74913 2.15279 0.78218 2.28499L2.32882 8.47152C2.37106 8.64052 2.51394 8.76535 2.68704 8.7846L9.48501 9.53994C9.72076 9.5661 9.89909 9.76535 9.89909 10.0026C9.89909 10.2399 9.72076 10.4391 9.48501 10.4653L2.68704 11.2206C2.51394 11.2399 2.37106 11.3647 2.32882 11.5337L0.78218 17.7202C0.74913 17.8524 0.732422 17.9882 0.732422 18.1244V18.1538C0.732422 18.7146 1.18709 19.1693 1.74794 19.1693C1.90223 19.1693 2.0545 19.1341 2.19316 19.0664L18.3168 11.2013C18.775 10.9778 19.0658 10.5125 19.0658 10.0026C19.0658 9.49269 18.775 9.02744 18.3168 8.80394Z"
                          fill="currentColor"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* Add suggested replies section */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestedReplies.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setReply(suggestion.reply)}
                      className="px-3 py-1.5 text-sm  border border-dashed border-ash/80 hover:border-hot rounded-full transition-colors"
                    >
                      {suggestion.reply}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {replies &&
          (submission.reply_audience === "p" ||
            user.role !== "USER" ||
            (submission.reply_audience === "u" &&
              submission.user_id === user?.id)) && (
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-medium">Teacher&apos;s Reply</h2>
              <div className="flex justify-between items-center gap-2 border border-dashed border-ash rounded-xl px-4 py-2">
                {/* <Image src={teacher?.image as string} alt="Attachment" className="w-10 h-10 rounded-full object-cover" width={100} height={100} /> */}

                <p className="text-base text-light">{replies}</p>
              </div>
            </div>
          )}

        {/* <div>
          <CreateReply />
          {!!replies && submission.reply_audience === "p"
            ? comments.map((c) => (
                <HwReplies key={c.id} comment={c} authorId="" />
              ))
            : submission.reply_audience === "p" &&
              user.role === "USER" &&
              comments.map((c) => (
                <HwReplies key={c.id} comment={c} authorId={c.user_id} />
              ))}
        </div> */}
      </div>
    </div>
  );
};
