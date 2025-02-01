import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Tagtag,
  copyLink,
  fromNow,
  // reactionCountIcon,
  useUser,
} from "@/components";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PollOption, Post } from "@/@types";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import { ChevronLeft, ChevronRight, EllipsisVertical } from "lucide-react";
import { useRouter } from "next/router";
import { PollComponent, VideoComponent } from "./index";
import { reactionTabs } from "@/data/reactions";
import { collections } from "@/data/saved-types";
import { ReactCounts } from "@/components/shared/ReactCounts";
const AppMath = dynamic(() => import("../../components/contexts/MathJAX"), {
  ssr: false,
});

type PostShowProps = {
  post: Post;
  setSuccess?: (v: boolean) => void;
  refetch?: (v: boolean) => void;
  updateReact?: (t: string) => void;
};

export const PostComponent: React.FC<PostShowProps> = ({
  post,
  setSuccess,
  updateReact,
  refetch,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const userReaction = post?.reactions.find((r) => r.user.id === user?.id);
  const getInitialReaction = () => {
    if (!userReaction) return 5;
    return reactionTabs.findIndex((r) => r.value === userReaction.type);
  };

  const [polls, setPolls] = useState<PollOption[]>(
    post?.pollOptions as PollOption[]
  );
  const [isFollowing, setIsFollowing] = useState(post?.isFollowing);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [viewRections, setViewReactions] = useState(false);
  const [viewRectionList, setViewReactionList] = useState(false);
  const [reaction, setReaction] = useState(getInitialReaction());
  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(!!post?.isSaved);
  const [isPinned, setIsPinned] = useState<boolean>(!!post?.isPinned);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [totalVotes, setTotalVotes] = useState<number>(post?.totalVotes || 0);
  const [showSaveTypes, setShowSaveTypes] = useState<boolean>(false);
  const [collection, setCollection] = useState<number>(0);
  const [showImage, setShowImage] = useState<string | null>(null);
  const [imgShowOpen, setImgShowOpen] = useState<boolean>(false);

  const getReactionIcon = (type: string) => {
    const i = reactionTabs.findIndex((r) => r.value === type);
    return reactionTabs[i].icon;
  };

  const toggleFollow = async () => {
    if (isFollowing) return;

    setFollowLoading(true);
    try {
      const res = await axios.post(
        `${secondaryAPI}/api/follow`,
        {
          followingId: post?.user?.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(res.data);
      setIsFollowing(!isFollowing);
      setFollowLoading(false);
    } catch (error) {
      setIsFollowing(false);
      handleError(error as AxiosError, toggleFollow);
    }
  };

  const updateReaction = async (t: string) => {
    if (updateReact) {
      updateReact(t);
    }
    try {
      await axios.post(
        `${secondaryAPI}/api/post/react`,
        {
          postId: post?.id,
          type: t,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch (err) {
      handleError(err as AxiosError, () => updateReaction(t));
    }
  };

  const handleSave = async (s: boolean, c: number) => {
    try {
      const response = await axios.post(
        `${secondaryAPI}/api/post/save_post`,
        {
          post_id: post?.id,
          collection_id: c,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(response.data);
      setShowSaveTypes(false);
      setIsSaved(!s);
      setTimeout(() => {
        if (!s)
          toast({
            title: "Saved",
            description: "Post saved successfully",
            variant: "default",
          });
        else
          toast({
            title: "Removed",
            description: "Post removed from saved",
            variant: "destructive",
          });
      }, 200);
    } catch (err) {
      handleError(err as AxiosError, () => handleSave(s, c));
    }
  };

  const handleShare = async () => {
    try {
      const response = await axios.post(
        `${secondaryAPI}/api/post/${post?.id}/share`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      copyLink(`${router.basePath}/posts/${post?.id}`);

      if (response.data)
        toast({
          title: "Post Link Copied",
          description: response.data.message,
          variant: "default",
        });
    } catch (err) {
      handleError(err as AxiosError, () => handleShare());
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const reactionList = (
    <Dialog open={viewRectionList} onOpenChange={setViewReactionList}>
      <DialogContent className="p-4 bg-white max-w-sm text-black/80 dark:bg-gray-900 dark:text-white">
        <DialogHeader className="text-base font-bold py-1">
          <DialogTitle>রিয়েকশন</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          {post?.reactions.map((r) => (
            <div key={r.type} className="p-2 flex gap-2 items-center">
              <div className="relative p-1">
                <Avatar>
                  <AvatarImage src={r?.user?.image as string} />
                  <AvatarFallback>
                    {r.user?.name
                      ?.split(" ")
                      ?.map((n: string) => n[0])
                      ?.join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-200 dark:border-gray-900">
                  {getReactionIcon(r.type)}
                </span>
              </div>

              <div className="flex justify-between items-center w-full">
                <Link
                  href={`/users/${r.user.id}`}
                  className="hover:text-light duration-300"
                >
                  {r.user.name}
                </Link>
                {/* {r.user.id !== user.id ? (
                  <button type="button" className="font-semibold text-sm text-life hover:text-elegant duration-300">
                    {r?.user?.isFollowing ? "Following" : "Follow"}
                  </button>
                ) : null} */}
              </div>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  async function pinnePost() {
    try {
      const group_id = post?.group_id;
      await axios.post(
        `${secondaryAPI}/api/post/${post?.id}/pin`,
        {
          group_id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      toast({
        title: "Post Pinned",
        description: "This post is pinned to the top of the feed",
      });
      if (refetch) refetch(true);
    } catch (err) {
      handleError(err as AxiosError, () => pinnePost());
    }
  }

  async function unpinPost() {
    try {
      await axios.post(
        `${secondaryAPI}/api/post/${post?.id}/unpin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      toast({
        title: "Post Unpinned",
        description: "This post is unpinned from the top of the feed",
      });
      if (refetch) refetch(false);
    } catch (err) {
      handleError(err as AxiosError, () => unpinPost());
    }
  }

  async function handleDelete() {
    try {
      await axios.delete(`${secondaryAPI}/api/post/${post?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      toast({
        title: "Post Deleted",
        description: "This post has been deleted",
      });
      if (setSuccess) setSuccess(true);
    } catch (err) {
      handleError(err as AxiosError, () => handleDelete());
    }
  }

  const deleteModal = (
    <Dialog open={showDelete} onOpenChange={setShowDelete}>
      <DialogContent className="sm:max-w-[425px] bg-white text-light dark:text-white dark:bg-light/20 p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white py-2 ">
            Delete Post
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="flex items-center gap-2">
            Are you sure you want to delete this post?
          </p>
        </div>
        <DialogFooter>
          <div className="grid grid-cols-2 !justify-between gap-3">
            <Button
              className="!bg-white !rounded-lg !w-full !text-light dark:!text-white dark:!bg-gray-600/20"
              variant="outline"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              className="!bg-hot !rounded-lg !w-full !text-white dark:!bg-gray-600/20"
              variant="outline"
              onClick={() => {
                handleDelete();
                setShowDelete(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  async function handleVote(opt: PollOption) {
    if (selectedAnswer !== opt.name) {
      const previousOption = polls.find((option) => option.has_voted);
      setSelectedAnswer(opt.name);
      const newOptions = polls.map((option) => {
        if (option.name === opt.name) {
          // Increment the count for the newly selected option
          return {
            ...option,
            has_voted: true,
            vote_count: option.has_voted
              ? option.vote_count
              : option.vote_count + 1,
          };
        } else if (option === previousOption) {
          // Decrement the count for the previously selected option
          return {
            ...option,
            has_voted: false,
            vote_count: option.vote_count > 0 ? option.vote_count - 1 : 0,
          };
        }
        // Keep other options unchanged
        return { ...option, has_voted: false };
      });
      setPolls(newOptions);
      setTotalVotes(
        newOptions.reduce((acc, option) => acc + option.vote_count, 0)
      );

      try {
        const res = await axios.post(
          `${secondaryAPI}/api/polls/vote`,
          {
            postId: post?.id,
            optionId: opt.id,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        console.log(res.data);
      } catch (err) {
        handleError(err as AxiosError, () => handleVote(opt));
      }
    }
  }

  async function handleUnsave() {
    try {
      await axios.delete(`${secondaryAPI}/api/post/saved_posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        data: {
          post_id: post?.id,
        },
      });
    } catch (err) {
      handleError(err as AxiosError, () => handleUnsave());
    }
  }

  const saveTypesModal = (
    <Dialog open={showSaveTypes} onOpenChange={setShowSaveTypes}>
      <DialogContent className="p-4 bg-white max-w-sm text-black/80 dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-center py-2">
            Save To Collection
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {collections.map((c) => (
            <button
              type="button"
              className={cn(
                "w-full text-start flex py-2 px-4 gap-2 rounded-lg hover:bg-olive/20 duration-300 bg-ash justify-start items-center",
                collection === c.id && "bg-olive/20"
              )}
              onClick={() => setCollection(c.id)}
              key={c.id}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full",
                  collection === c.id && "bg-olive"
                )}
              ></span>
              {c.title}
            </button>
          ))}
        </div>
        <DialogFooter className="flex !justify-end">
          <Button className="w-20" variant="destructive" size="sm">
            Cancel
          </Button>
          <Button
            className="w-20"
            variant="secondary"
            size="sm"
            onClick={() => handleSave(isSaved, collection)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );


  const handleNextImage = () => {
    const n = post?.images.findIndex((i) => i === showImage);
    console.log(n);
    if (n !== -1 && n < post?.images.length - 1) {
      setTimeout(() => {
        setShowImage(post?.images[n + 1]);
      }, 200);
    } else {
      setShowImage(post?.images[0]);
    }

  }

  const handlePrevImage = () => {
    const n = post?.images.findIndex((i) => i === showImage);
    if (n && n > 0) {
      setTimeout(() => {
        setShowImage(post?.images[n - 1]);
      }, 200);
    }
  }

  const imageModal = (
    <Dialog open={imgShowOpen} onOpenChange={setImgShowOpen}>
      <DialogContent className="w-full max-w-4xl !rounded-2xl text-black sm:!h-auto bg-transparent shadow-none p-2">
        <DialogHeader>
          <DialogTitle className="text-center pt-2"> </DialogTitle>
        </DialogHeader>
        {showImage && (
          <div className="w-auto flex items-center justify-between xl:h-[570px] lg:h-[400px] h-[300px] relative rounded-xl">
            {post?.images.length > 1 && (
              <button type="button" onClick={() => handlePrevImage()} className="bg-white z-[9] text-black rounded-full p-2">
                <ChevronLeft size={20} />
              </button>
            )}
            <Image src={showImage} alt="Preview" fill className="rounded-xl object-contain" />
            {post?.images.length > 1 && (
              <button type="button" onClick={() => handleNextImage()} className="bg-white z-[9] text-black rounded-full p-2">
                <ChevronRight size={20} />
              </button>
            )}
            {/* <button type="button" onClick={() => setImgShowOpen(false)} className="absolute block sm:hidden -top-4 bg-hot/50 text-white rounded-full p-2 right-2">
              <X size={12} />
            </button> */}
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button className="!w-1/2 mx-auto" variant="destructive" size="sm">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {saveTypesModal}
      {reactionList}
      {deleteModal}
      {imageModal}
      <div className="w-full bg-white dark:bg-gray-900/40 md:ring-1 ring-ash dark:ring-ash/20 backdrop-blur-sm rounded-lg md:rounded-xl z-[2]">
        <div className="px-0 py-4 md:px-5 grid gap-4">
          <div className="flex justify-between select-none">
            {/* Author Section */}
            <div className="flex items-start gap-2 px-4 md:px-0">
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src={
                      post?.group_slug && router.pathname.includes("clubs")
                        ? post?.user?.profilePic || post?.user_profile_pic
                        : post?.group_slug
                          ? post?.group_image
                          : post?.user?.profilePic || post?.user_profile_pic || post?.user?.image
                    }
                    alt={
                      post?.group_slug && router.pathname.includes("clubs")
                        ? post?.user?.name || post?.user_name
                        : post?.group_slug
                          ? post?.group_name
                          : post?.user?.name || post?.user_name
                    }
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback>
                    {post?.user
                      ? post?.user?.name
                        ?.split(" ")
                        ?.map((n: string) => n[0])
                        ?.join("")
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                {post?.group_slug && !router.pathname.includes("clubs") && (
                  <Avatar className="w-4 h-4 !absolute bottom-0 right-0">
                    <AvatarImage
                      src={post?.user?.image || post.user_profile_pic || post.userProfilePic}
                      alt={post?.user?.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      {post?.user
                        ? post?.user?.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={
                      post?.group_slug && router.pathname.includes("clubs")
                        ? `/users/${post?.userId}`
                        : post?.group_slug
                          ? `/clubs/${post?.group_slug}`
                          : `/users/${post?.userId}`
                    }
                    className="text-gray-900 dark:text-white duration-300 text-sm font-bold"
                  >
                    {post?.group_slug && router.pathname.includes("clubs")
                      ? post?.user?.name || post?.user_name
                      : post?.group_slug
                        ? post?.group_name
                        : post?.user?.name || post?.user_name}
                  </Link>
                  {user?.id !== post?.userId && (
                    <span>
                      <svg
                        width="4"
                        height="3"
                        viewBox="0 0 4 3"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.74713 0.9C2.95513 1.10267 3.05913 1.35333 3.05913 1.652C3.05913 1.95067 2.95779 2.204 2.75513 2.412C2.55246 2.61467 2.30179 2.716 2.00313 2.716C1.69913 2.716 1.44579 2.61467 1.24313 2.412C1.04046 2.20933 0.939125 1.956 0.939125 1.652C0.939125 1.348 1.03779 1.09467 1.23513 0.892C1.43779 0.689333 1.69113 0.588 1.99513 0.588C2.29379 0.588 2.54446 0.692 2.74713 0.9Z"
                          fill="#575757"
                        />
                      </svg>
                    </span>
                  )}

                  {user?.id !== post?.userId && (
                    <button
                      type="button"
                      className="text-sm font-semibold duration-300 hover:text-life dark:hover:text-green-300 text-olive"
                      onClick={toggleFollow}
                    >
                      {!followLoading
                        ? isFollowing
                          ? "Following"
                          : "Follow"
                        : "Loading..."}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Tagtag tags={post?.tags || [user?.role]} />
                </div>

                <h2 className="text-gray-500 flex items-center dark:text-gray-400 text-sm">
                  {post?.group_name && !router.pathname.includes("clubs") && (
                    <Link
                      href={`/users/${post?.userId}`}
                      className="flex items-center gap-1 hover:text-elegant duration-300 text-gray-500 dark:text-gray-400 pr-1"
                    >
                      <span>{post?.user?.name}</span>
                      <span>
                        <svg
                          width="4"
                          height="4"
                          viewBox="0 0 3 3"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.64752 0.9C2.85552 1.10267 2.95952 1.35333 2.95952 1.652C2.95952 1.95067 2.85818 2.204 2.65552 2.412C2.45285 2.61467 2.20218 2.716 1.90352 2.716C1.59952 2.716 1.34618 2.61467 1.14352 2.412C0.940849 2.20933 0.839516 1.956 0.839516 1.652C0.839516 1.348 0.938182 1.09467 1.13552 0.892C1.33818 0.689333 1.59152 0.588 1.89552 0.588C2.19418 0.588 2.44485 0.692 2.64752 0.9Z"
                            fill="#575757"
                          />
                        </svg>
                      </span>
                    </Link>
                  )}
                  {!post?.group_name && !!post?.subject?.name ? (
                    <>
                      <span>{post?.subject?.name || post?.subjectName}</span>
                      <span className="flex items-center px-1">
                        <svg
                          width="4"
                          height="4"
                          viewBox="0 0 3 3"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.64752 0.9C2.85552 1.10267 2.95952 1.35333 2.95952 1.652C2.95952 1.95067 2.85818 2.204 2.65552 2.412C2.45285 2.61467 2.20218 2.716 1.90352 2.716C1.59952 2.716 1.34618 2.61467 1.14352 2.412C0.940849 2.20933 0.839516 1.956 0.839516 1.652C0.839516 1.348 0.938182 1.09467 1.13552 0.892C1.33818 0.689333 1.59152 0.588 1.89552 0.588C2.19418 0.588 2.44485 0.692 2.64752 0.9Z"
                            fill="#575757"
                          />
                        </svg>
                      </span>
                    </>
                  ) : (post?.subjectName &&
                    <>
                      <span>{post?.subjectName}</span>
                      <span className="flex items-center px-1">
                        <svg
                          width="4"
                          height="4"
                          viewBox="0 0 3 3"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.64752 0.9C2.85552 1.10267 2.95952 1.35333 2.95952 1.652C2.95952 1.95067 2.85818 2.204 2.65552 2.412C2.45285 2.61467 2.20218 2.716 1.90352 2.716C1.59952 2.716 1.34618 2.61467 1.14352 2.412C0.940849 2.20933 0.839516 1.956 0.839516 1.652C0.839516 1.348 0.938182 1.09467 1.13552 0.892C1.33818 0.689333 1.59152 0.588 1.89552 0.588C2.19418 0.588 2.44485 0.692 2.64752 0.9Z"
                            fill="#575757"
                          />
                        </svg>
                      </span>
                    </>
                  )}
                  <span>
                    {fromNow(
                      new Date(post?.created_at || post?.createdAt) as Date
                    )}
                  </span>
                </h2>
              </div>
            </div>

            {/* top right menu */}
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => {
                  if (isSaved) {
                    handleUnsave();
                  } else {
                    setShowSaveTypes(true);
                  }
                }}
                className="!text-start flex justify-start items-center gap-2 p-1 text-gray-900 dark:text-white duration-300 hover:bg-gray-100 dark:hover:bg-green-800"
              >
                {" "}
                <svg
                  width="14"
                  height="16"
                  viewBox="0 0 16 18"
                  fill={isSaved ? "green" : "none"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.3335 13.9841V7.08969C1.3335 4.06189 1.3335 2.54798 2.30981 1.60737C3.28612 0.666748 4.85747 0.666748 8.00016 0.666748C11.1429 0.666748 12.7142 0.666748 13.6905 1.60737C14.6668 2.54798 14.6668 4.06189 14.6668 7.08969V13.9841C14.6668 15.9056 14.6668 16.8664 14.0228 17.2103C12.7756 17.8763 10.4362 15.6544 9.32516 14.9854C8.68083 14.5974 8.35866 14.4034 8.00016 14.4034C7.64167 14.4034 7.3195 14.5974 6.67517 14.9854C5.56416 15.6544 3.22472 17.8763 1.97754 17.2103C1.3335 16.8664 1.3335 15.9056 1.3335 13.9841Z"
                    stroke={isSaved ? "green" : "#575757"}
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <Popover>
                <PopoverTrigger>
                  <span className="!rounded-full !bg-green-100 dark:!bg-green-500 !bg-opacity-50 dark:!bg-opacity-20 hover:!bg-opacity-70 dark:hover:!bg-opacity-20 duration-300">
                    <EllipsisVertical size={20} />
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="!p-0 relative z-[2] rounded-lg !bg-white dark:!bg-gray-900 !min-w-[200px] border-gray-200 dark:border-0"
                >
                  <div className="py-2 grid ring-1 ring-gray-200 dark:ring-green-800 rounded-lg">
                    {(user?.id === post?.user.id || user?.role !== "USER") && (
                      <button className="text-start text-gray-900 dark:text-white flex gap-2 justify-start items-center duration-300 hover:bg-gray-100 dark:hover:bg-green-800 px-3 py-2">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.55039 1.8999C6.45171 1.8999 4.75039 3.60122 4.75039 5.6999C4.75039 7.79858 6.45171 9.4999 8.55039 9.4999C10.6491 9.4999 12.3504 7.79858 12.3504 5.6999C12.3504 3.60122 10.6491 1.8999 8.55039 1.8999ZM5.70039 5.6999C5.70039 4.12589 6.97638 2.8499 8.55039 2.8499C10.1244 2.8499 11.4004 4.12589 11.4004 5.6999C11.4004 7.27391 10.1244 8.5499 8.55039 8.5499C6.97638 8.5499 5.70039 7.27391 5.70039 5.6999ZM3.80868 10.4499C2.75838 10.4499 1.90039 11.2924 1.90039 12.3499C1.90039 13.9565 2.69156 15.1679 3.92863 15.9567C5.14651 16.7332 6.78839 17.0999 8.55039 17.0999H8.55503C8.55473 16.8177 8.61855 16.528 8.75783 16.2491L8.80881 16.147C8.72326 16.1489 8.6371 16.1499 8.55039 16.1499C6.90204 16.1499 5.45641 15.8041 4.43938 15.1556C3.44154 14.5194 2.85039 13.5933 2.85039 12.3499C2.85039 11.8243 3.27586 11.3999 3.80868 11.3999L11.1797 11.3999L11.6542 10.4499L3.80868 10.4499ZM12.9232 10.0258L9.60183 16.6743C9.28605 17.3064 9.74578 18.0499 10.4524 18.0499H17.0983C17.8052 18.0499 18.2649 17.3061 17.9488 16.674L14.6242 10.0255C14.2738 9.32457 13.2734 9.32476 12.9232 10.0258ZM14.2488 11.8702V14.7224C14.2488 14.985 14.036 15.1978 13.7734 15.1978C13.5108 15.1978 13.298 14.985 13.298 14.7224V11.8702C13.298 11.6077 13.5108 11.3949 13.7734 11.3949C14.036 11.3949 14.2488 11.6077 14.2488 11.8702ZM13.7734 17.0993C13.5108 17.0993 13.298 16.8864 13.298 16.6239C13.298 16.3614 13.5108 16.1485 13.7734 16.1485C14.036 16.1485 14.2488 16.3614 14.2488 16.6239C14.2488 16.8864 14.036 17.0993 13.7734 17.0993Z"
                            fill="#575757"
                          />
                        </svg>
                        <span className="leading-none text-sm pt-1">Suspend</span>
                      </button>
                    )}
                    {(user?.id === post?.user.id || user?.role === "ADMIN") && (
                      <button
                        type="button"
                        onClick={() => setShowDelete(true)}
                        className="text-start text-gray-900 dark:text-white flex gap-2 justify-start items-center duration-300 hover:bg-gray-100 dark:hover:bg-green-800 px-3 py-2"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 3.5H9.5C9.5 2.94772 9.05228 2.5 8.5 2.5C7.94772 2.5 7.5 2.94772 7.5 3.5ZM6.5 3.5C6.5 2.39543 7.39543 1.5 8.5 1.5C9.60457 1.5 10.5 2.39543 10.5 3.5H14.5C14.7761 3.5 15 3.72386 15 4C15 4.27614 14.7761 4.5 14.5 4.5H13.9364L12.7313 13.3378C12.5624 14.5765 11.5044 15.5 10.2542 15.5H6.74578C5.49561 15.5 4.43762 14.5765 4.26871 13.3378L3.06355 4.5H2.5C2.22386 4.5 2 4.27614 2 4C2 3.72386 2.22386 3.5 2.5 3.5H6.5ZM7.5 7C7.5 6.72386 7.27614 6.5 7 6.5C6.72386 6.5 6.5 6.72386 6.5 7V12C6.5 12.2761 6.72386 12.5 7 12.5C7.27614 12.5 7.5 12.2761 7.5 12V7ZM10 6.5C10.2761 6.5 10.5 6.72386 10.5 7V12C10.5 12.2761 10.2761 12.5 10 12.5C9.72386 12.5 9.5 12.2761 9.5 12V7C9.5 6.72386 9.72386 6.5 10 6.5ZM5.25954 13.2027C5.36089 13.9459 5.99568 14.5 6.74578 14.5H10.2542C11.0043 14.5 11.6391 13.9459 11.7405 13.2027L12.9272 4.5H4.07281L5.25954 13.2027Z"
                            fill="#575757"
                          />
                        </svg>
                        <span className="leading-none text-sm pt-1">Delete</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="!text-start flex justify-start items-center gap-2 px-3 py-2 text-gray-900 dark:text-white duration-300 hover:bg-gray-100 dark:hover:bg-green-800"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_726_35923)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.4997 8.5001C16.4997 10.4767 15.7213 12.3554 14.3239 13.7529C12.9265 15.1503 11.0477 15.9287 9.07115 15.9287C7.09456 15.9287 5.21582 15.1503 3.8184 13.7529C2.42095 12.3554 1.64258 10.4767 1.64258 8.5001C1.64258 6.52351 2.42095 4.64477 3.8184 3.24735C5.21582 1.8499 7.09456 1.07153 9.07115 1.07153C11.0477 1.07153 12.9265 1.84991 14.3239 3.24735C15.7213 4.64477 16.4997 6.52351 16.4997 8.5001ZM12.8874 3.74315C11.8095 2.87669 10.4707 2.40198 9.07115 2.40198C7.44801 2.40198 5.90662 3.04045 4.75905 4.18801C3.61149 5.33557 2.97302 6.87697 2.97302 8.5001C2.97302 9.89968 3.44774 11.2384 4.31419 12.3164L12.8874 3.74315ZM13.8281 4.6838L5.25485 13.2571C6.33281 14.1235 7.67157 14.5982 9.07115 14.5982C10.6943 14.5982 12.2357 13.9598 13.3832 12.8122C14.5308 11.6646 15.1693 10.1232 15.1693 8.5001C15.1693 7.10053 14.6946 5.76176 13.8281 4.6838Z"
                            fill="#575757"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_726_35923">
                            <rect
                              width="16"
                              height="16"
                              fill="white"
                              transform="translate(0.5 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <span className="leading-none text-sm pt-1">Ban Post</span>
                    </button>

                    {user?.role === "ADMIN" && (
                      <button
                        onClick={() => {
                          if (isPinned) {
                            unpinPost();
                            setIsPinned(false);
                          } else {
                            pinnePost();
                            setIsPinned(true);
                          }
                        }}
                        type="button"
                        className={cn(
                          "!text-start flex justify-start items-center gap-2 px-3 py-2 duration-300 hover:bg-gray-100 dark:hover:bg-olive",
                          isPinned && "!text-life"
                        )}
                      >
                        <svg
                          width="17"
                          height="16"
                          viewBox="0 0 17 16"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.5589 2.44511C9.84701 1.73063 8.64697 1.90829 8.17261 2.79839L6.1526 6.58878L3.3419 7.52568C3.1775 7.58048 3.0532 7.71649 3.01339 7.88514C2.97357 8.0538 3.02392 8.23104 3.14646 8.35357L5.29291 10.5L2.64645 13.1465L2.5 14L3.35356 13.8536L6.00002 11.2071L8.14646 13.3536C8.26899 13.4761 8.44623 13.5265 8.61489 13.4866C8.78354 13.4468 8.91955 13.3225 8.97435 13.1581L9.91143 10.3469L13.6897 8.32423C14.5759 7.84982 14.7538 6.6551 14.0443 5.94305L10.5589 2.44511ZM9.05511 3.2687C9.21323 2.972 9.61324 2.91278 9.85055 3.15094L13.336 6.64889C13.5725 6.88624 13.5131 7.28448 13.2178 7.44262L9.26403 9.55921C9.15137 9.61952 9.06608 9.72068 9.02567 9.84191L8.2815 12.0744L4.42562 8.21853L6.65812 7.47436C6.77966 7.43385 6.88101 7.34823 6.94126 7.23518L9.05511 3.2687Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="leading-none text-sm pt-1">
                          {isPinned ? "Unpin Post" : "Pin To Feature"}
                        </span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (isSaved) {
                          handleUnsave();
                        } else {
                          setShowSaveTypes(true);
                        }
                      }}
                      className="!text-start flex justify-start items-center gap-2 px-3 py-2 text-gray-900 dark:text-white duration-300 hover:bg-gray-100 dark:hover:bg-green-800"
                    >
                      {" "}
                      <svg
                        width="14"
                        height="16"
                        viewBox="0 0 16 18"
                        fill={isSaved ? "green" : "none"}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.3335 13.9841V7.08969C1.3335 4.06189 1.3335 2.54798 2.30981 1.60737C3.28612 0.666748 4.85747 0.666748 8.00016 0.666748C11.1429 0.666748 12.7142 0.666748 13.6905 1.60737C14.6668 2.54798 14.6668 4.06189 14.6668 7.08969V13.9841C14.6668 15.9056 14.6668 16.8664 14.0228 17.2103C12.7756 17.8763 10.4362 15.6544 9.32516 14.9854C8.68083 14.5974 8.35866 14.4034 8.00016 14.4034C7.64167 14.4034 7.3195 14.5974 6.67517 14.9854C5.56416 15.6544 3.22472 17.8763 1.97754 17.2103C1.3335 16.8664 1.3335 15.9056 1.3335 13.9841Z"
                          stroke={isSaved ? "green" : "#575757"}
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="leading-none text-sm pt-1">
                        {isSaved ? "Saved" : "Save Post"}
                      </span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* image & post body  */}
          <div className="grid gap-2 text-gray-900 dark:text-white">

            {post?.body && (
              <AppMath
                className="px-4 md:px-0 !w-full"
                formula={post?.body || ""}
                key={Number(post?.id.replace(/\D/g, ""))}
              />
            )}
            {post?.category === 'homework' &&
              <h2 className="text-sm font-medium text-start text-olive">#{post?.category}</h2>
            }

            {!!post?.image ? (
              <button type="button" onClick={() => {
                setShowImage(post?.image)
                setImgShowOpen(true)
              }} className="relative xl:h-[600px] h-[300px] w-full">
                <Image
                  src={post?.image}
                  fill
                  alt="post-image"
                  className="object-contain aspect-auto md:rounded-xl bg-gray-50 dark:bg-gray-800"
                />
              </button>
            ) : (!!post?.images &&
              <div className={cn("grid gap-2", post?.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                {post?.images.slice(0, 4).map((image, index) => (
                  <button key={index} type="button" onClick={() => {
                    setShowImage(image)
                    setImgShowOpen(true)
                  }}
                    className="relative col-span-1 xl:h-[400px] h-[300px] w-full">
                    <Image
                      src={image}
                      fill
                      alt="post-image"
                      className="object-cover md:rounded-xl bg-gray-50 dark:bg-gray-800"
                    />
                    {index === 3 && post?.images.length > 4 && (
                      <div className="absolute text-2xl font-bold sm:rounded-xl top-0 right-0 flex items-center justify-center bg-black/40 w-full h-full text-white px-2 py-1">
                        <span className="text-white rounded-full p-2 w-12 h-12">
                          +{post?.images.length - 3}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Poll  */}
          <PollComponent
            post={post}
            polls={polls}
            setSelectedAnswer={setSelectedAnswer}
            selectedAnswer={selectedAnswer}
            handleVote={handleVote}
            totalVotes={totalVotes}
          />

          {/* Video  */}
          <VideoComponent videoUrl={post?.video_url || ""} />

          {/* Reaction & comments counts */}
          <div className="flex justify-between items-center gap-2 -mb-2 px-4 md:px-0">
            <button
              disabled={!post?.reactions.length}
              type="button"
              onClick={() => setViewReactionList(!viewRectionList)}
              className="flex items-center hover:text-yellow-500 gap-1"
            >
              {post.reactions.length > 0 && <ReactCounts reacts={post.reactions} />}
              <span>{post?.reactions.length || 0} Reactions</span>
            </button>
            <div className='flex items-center gap-2'>
              {post.ai_enabled && (
                <span className='flex items-center text-sm '>
                  🚀
                </span>
              )}
              <Link
                href={`/post/${post.id}`}
                className="hover:text-light duration-300"
              >
                {post?.commentCount || 0} Comments
              </Link>
            </div>
          </div>

          {/* Reactions Comments & Share */}
          <div className="flex px-4 md:px-0 justify-between items-center gap-2">
            <div className="flex items-center gap-5 w-full justify-between">
              <Popover
                onOpenChange={(v) => setViewReactions(v)}
                open={viewRections}
              >
                <PopoverContent
                  side="top"
                  align="start"
                  className="!rounded-full !p-0 relative z-[2] ring-gray-200 dark:ring-green-800 !ring-1 !border-0 bg-white dark:bg-gray-800"
                  // onMouseEnter={() => setViewReactions(true)}
                  onMouseLeave={() => setViewReactions(false)}
                >
                  <div className="flex p-1.5 gap-2 items-center">
                    {reactionTabs.map((r, index) => (
                      <Button
                        variant="link"
                        type="button"
                        onClick={() => {
                          setReaction(index);
                          updateReaction(r.value);
                          setTimeout(() => {
                            setViewReactions(false);
                          }, 300);
                        }}
                        key={r.id}
                        className={cn(
                          r.color,
                          "!duration-200 !transition-all hover:!scale-125 !rounded-full !p-1",
                          reaction === index && "hover:ring-0 bg-hot/40"
                        )}
                      >
                        {r.icon}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
                <PopoverTrigger
                  asChild
                  onMouseEnter={() => setViewReactions(true)}
                >
                  <p className="rounded-md hover:!text-elegant cursor-pointer duration-500 flex justify-center items-center text-sm font-medium shadow-none !text-gray-900 dark:!text-white">
                    {reaction === 5 ? (
                      <>
                        <span className="p-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.6665 10.4167C1.6665 9.49619 2.4127 8.75 3.33317 8.75C4.71388 8.75 5.83317 9.86929 5.83317 11.25V14.5833C5.83317 15.964 4.71388 17.0833 3.33317 17.0833C2.4127 17.0833 1.6665 16.3371 1.6665 15.4167V10.4167Z"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12.8991 6.5053L12.6772 7.22203C12.4954 7.80934 12.4044 8.10299 12.4744 8.33491C12.5309 8.52254 12.6551 8.68426 12.8243 8.79067C13.0335 8.9222 13.3499 8.9222 13.9828 8.9222H14.3194C16.4611 8.9222 17.532 8.9222 18.0378 9.55616C18.0956 9.62862 18.147 9.70566 18.1915 9.78647C18.5806 10.4935 18.1382 11.446 17.2535 13.351C16.4416 15.0992 16.0356 15.9732 15.2819 16.4877C15.2089 16.5375 15.1339 16.5845 15.0571 16.6285C14.2635 17.0834 13.2803 17.0834 11.3138 17.0834H10.8873C8.50493 17.0834 7.31373 17.0834 6.57361 16.3663C5.8335 15.6492 5.8335 14.495 5.8335 12.1867V11.3754C5.8335 10.1623 5.8335 9.55573 6.04878 9.00058C6.26406 8.44542 6.67629 7.98895 7.50074 7.07601L10.9103 3.30055C10.9958 3.20586 11.0385 3.15851 11.0762 3.12571C11.4281 2.81948 11.9712 2.85395 12.2788 3.20204C12.3118 3.23933 12.3478 3.29167 12.4198 3.39636C12.5325 3.56012 12.5889 3.642 12.638 3.72313C13.0775 4.44936 13.2105 5.31205 13.0092 6.13104C12.9867 6.22251 12.9575 6.31683 12.8991 6.5053Z"
                              stroke="currentColor"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </>
                    ) : (
                      <p className="scale-[0.7] p-1">
                        {reactionTabs[reaction].icon}
                      </p>
                    )}
                    <span
                      className={cn(
                        "pt-1",
                        reaction !== 5 && "text-yellow-600 dark:text-yellow-400"
                      )}
                    >
                      {reactionTabs[reaction]?.name || "রিয়েক্ট"}
                    </span>
                  </p>
                </PopoverTrigger>
              </Popover>

              <Link
                className="rounded-md hover:!text-elegant !cursor-pointer flex gap-2 justify-center p-2 items-center text-sm font-medium shadow-none !transition-opacity !text-gray-900 dark:!text-white"
                href={`/post/${post.id}`}
              // href={user?.is_paid ? `/post/${post.id}` : !!post.group_slug ? '#' : `/post/${post.id}`}
              >
                {" "}
                {/* {!!post.group_slug && !user?.is_paid && ( 
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.875 7.5V5.44375C14.8733 4.33201 14.431 3.26627 13.6449 2.48015C12.8587 1.69402 11.793 1.25165 10.6813 1.25H10.3187C9.20701 1.25165 8.14127 1.69402 7.35515 2.48015C6.56902 3.26627 6.12665 4.33201 6.125 5.44375V7.5C5.62772 7.5 5.15081 7.69754 4.79917 8.04917C4.44754 8.40081 4.25 8.87772 4.25 9.375V15.1875C4.25165 16.1318 4.62752 17.037 5.29526 17.7047C5.963 18.3725 6.86817 18.7483 7.8125 18.75H13.1875C14.1318 18.7483 15.037 18.3725 15.7047 17.7047C16.3725 17.037 16.7483 16.1318 16.75 15.1875V9.375C16.75 8.87772 16.5525 8.40081 16.2008 8.04917C15.8492 7.69754 15.3723 7.5 14.875 7.5ZM7.375 5.44375C7.375 4.66302 7.68514 3.91426 8.2372 3.3622C8.78926 2.81014 9.53802 2.5 10.3187 2.5H10.6813C11.462 2.5 12.2107 2.81014 12.7628 3.3622C13.3149 3.91426 13.625 4.66302 13.625 5.44375V7.5H7.375V5.44375ZM15.5 15.1875C15.5 15.8008 15.2564 16.389 14.8227 16.8227C14.389 17.2564 13.8008 17.5 13.1875 17.5H7.8125C7.19919 17.5 6.61099 17.2564 6.17732 16.8227C5.74364 16.389 5.5 15.8008 5.5 15.1875V9.375C5.5 9.20924 5.56585 9.05027 5.68306 8.93306C5.80027 8.81585 5.95924 8.75 6.125 8.75H14.875C15.0408 8.75 15.1997 8.81585 15.3169 8.93306C15.4342 9.05027 15.5 9.20924 15.5 9.375V15.1875Z" fill="#575757" />
                    <path d="M11.125 12.9502V15.0002C11.125 15.166 11.0592 15.3249 10.9419 15.4421C10.8247 15.5594 10.6658 15.6252 10.5 15.6252C10.3342 15.6252 10.1753 15.5594 10.0581 15.4421C9.94085 15.3249 9.875 15.166 9.875 15.0002V12.9502C9.6367 12.8126 9.45045 12.6003 9.34515 12.346C9.23985 12.0918 9.22137 11.8099 9.29259 11.5442C9.36381 11.2784 9.52074 11.0435 9.73905 10.876C9.95735 10.7085 10.2248 10.6177 10.5 10.6177C10.7752 10.6177 11.0426 10.7085 11.261 10.876C11.4793 11.0435 11.6362 11.2784 11.7074 11.5442C11.7786 11.8099 11.7602 12.0918 11.6549 12.346C11.5495 12.6003 11.3633 12.8126 11.125 12.9502Z" fill="#575757" />
                  </svg>
                 )} */}
                {/* {!post.group_slug && ( */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.3332 9.63901C18.3332 14.0416 14.6017 17.6113 9.99984 17.6113C9.45874 17.612 8.91921 17.5619 8.38768 17.4621C8.00511 17.3903 7.81382 17.3544 7.68028 17.3748C7.54673 17.3951 7.35749 17.4958 6.97899 17.6971C5.90828 18.2665 4.6598 18.4676 3.4591 18.2442C3.91545 17.6829 4.22712 17.0094 4.36465 16.2874C4.44799 15.8458 4.2415 15.4167 3.93224 15.1027C2.52762 13.6764 1.6665 11.7543 1.6665 9.63901C1.6665 5.23639 5.39799 1.66675 9.99984 1.66675C14.6017 1.66675 18.3332 5.23639 18.3332 9.63901Z"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.9961 10H10.0036M13.3257 10H13.3332M6.6665 10H6.67398"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* )} */}
                <span className="">কমেন্ট</span>
              </Link>

              <button
                type="button"
                // disabled={!user?.is_paid && !!post.group_slug}
                onClick={handleShare}
                className="rounded-md flex items-center gap-2 hover:!text-elegant !p-2 shadow-none duration-300 !transition-opacity !text-gray-900 dark:!text-white"
              >
                {" "}
                {/* {!post.group_slug && ( */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5399 2.54402C15.7249 0.589388 2.07223 5.37758 2.0835 7.12575C2.09628 9.10814 7.41523 9.71801 8.88952 10.1316C9.77607 10.3804 10.0135 10.6353 10.2179 11.565C11.1438 15.7753 11.6086 17.8695 12.668 17.9163C14.3566 17.9909 19.3113 4.45159 17.5399 2.54402Z"
                    stroke="currentColor"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M9.5835 10.4167L12.5002 7.5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* )} */}
                {/* {!!post.group_slug && !user?.is_paid && (
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.875 7.5V5.44375C14.8733 4.33201 14.431 3.26627 13.6449 2.48015C12.8587 1.69402 11.793 1.25165 10.6813 1.25H10.3187C9.20701 1.25165 8.14127 1.69402 7.35515 2.48015C6.56902 3.26627 6.12665 4.33201 6.125 5.44375V7.5C5.62772 7.5 5.15081 7.69754 4.79917 8.04917C4.44754 8.40081 4.25 8.87772 4.25 9.375V15.1875C4.25165 16.1318 4.62752 17.037 5.29526 17.7047C5.963 18.3725 6.86817 18.7483 7.8125 18.75H13.1875C14.1318 18.7483 15.037 18.3725 15.7047 17.7047C16.3725 17.037 16.7483 16.1318 16.75 15.1875V9.375C16.75 8.87772 16.5525 8.40081 16.2008 8.04917C15.8492 7.69754 15.3723 7.5 14.875 7.5ZM7.375 5.44375C7.375 4.66302 7.68514 3.91426 8.2372 3.3622C8.78926 2.81014 9.53802 2.5 10.3187 2.5H10.6813C11.462 2.5 12.2107 2.81014 12.7628 3.3622C13.3149 3.91426 13.625 4.66302 13.625 5.44375V7.5H7.375V5.44375ZM15.5 15.1875C15.5 15.8008 15.2564 16.389 14.8227 16.8227C14.389 17.2564 13.8008 17.5 13.1875 17.5H7.8125C7.19919 17.5 6.61099 17.2564 6.17732 16.8227C5.74364 16.389 5.5 15.8008 5.5 15.1875V9.375C5.5 9.20924 5.56585 9.05027 5.68306 8.93306C5.80027 8.81585 5.95924 8.75 6.125 8.75H14.875C15.0408 8.75 15.1997 8.81585 15.3169 8.93306C15.4342 9.05027 15.5 9.20924 15.5 9.375V15.1875Z" fill="#575757" />
                    <path d="M11.125 12.9502V15.0002C11.125 15.166 11.0592 15.3249 10.9419 15.4421C10.8247 15.5594 10.6658 15.6252 10.5 15.6252C10.3342 15.6252 10.1753 15.5594 10.0581 15.4421C9.94085 15.3249 9.875 15.166 9.875 15.0002V12.9502C9.6367 12.8126 9.45045 12.6003 9.34515 12.346C9.23985 12.0918 9.22137 11.8099 9.29259 11.5442C9.36381 11.2784 9.52074 11.0435 9.73905 10.876C9.95735 10.7085 10.2248 10.6177 10.5 10.6177C10.7752 10.6177 11.0426 10.7085 11.261 10.876C11.4793 11.0435 11.6362 11.2784 11.7074 11.5442C11.7786 11.8099 11.7602 12.0918 11.6549 12.346C11.5495 12.6003 11.3633 12.8126 11.125 12.9502Z" fill="#575757" />
                  </svg>
                )} */}
                <span className="">শেয়ার</span>
              </button>
            </div>

            {/* <button type="button" onClick={() => handleSave(!isSaved)}
              className={cn("rounded-md !p-2 shadow-none duration-300 hidden !transition-opacity", isSaved && "text-green-500",
                !isSaved && "text-gray-900 dark:!text-white")}>
              {" "}
              <svg width="18" height="20" viewBox="0 0 16 18" fill={isSaved ? "green" : "none"} xmlns="http://www.w3.org/2000/svg">
                <path d="M1.3335 13.9841V7.08969C1.3335 4.06189 1.3335 2.54798 2.30981 1.60737C3.28612 0.666748 4.85747 0.666748 8.00016 0.666748C11.1429 0.666748 12.7142 0.666748 13.6905 1.60737C14.6668 2.54798 14.6668 4.06189 14.6668 7.08969V13.9841C14.6668 15.9056 14.6668 16.8664 14.0228 17.2103C12.7756 17.8763 10.4362 15.6544 9.32516 14.9854C8.68083 14.5974 8.35866 14.4034 8.00016 14.4034C7.64167 14.4034 7.3195 14.5974 6.67517 14.9854C5.56416 15.6544 3.22472 17.8763 1.97754 17.2103C1.3335 16.8664 1.3335 15.9056 1.3335 13.9841Z"
                  stroke={isSaved ? "green" : "#575757"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button> */}
          </div>
        </div>
      </div >
    </>
  );
};
