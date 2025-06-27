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
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Eye,
  Flag,
} from "lucide-react";
import { useRouter } from "next/router";
import { PollComponent, VideoComponent } from "./index";
import { reactionTabs } from "@/data/reactions";
import { collections } from "@/data/saved-types";
import { ReactCounts } from "@/components/shared/ReactCounts";
import { FeaturedComments } from "../comments";
import { VideoPlayer } from "./sections";
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

      copyLink(`${router.basePath}/post/${post?.id}`);

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
                <span className="absolute bottom-1 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-gray-200 dark:border-gray-900">
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
                  <button type="button" className="font-semibold text-sm text-hot hover:text-elegant duration-300">
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
                "w-full text-start flex py-2 px-4 gap-2 rounded-lg hover:bg-hot/20 duration-300 bg-ash justify-start items-center",
                collection === c.id && "bg-hot/20"
              )}
              onClick={() => setCollection(c.id)}
              key={c.id}
            >
              <span
                className={cn(
                  "w-4 h-4 rounded-full",
                  collection === c.id && "bg-hot"
                )}
              ></span>
              {c.title}
            </button>
          ))}
        </div>
        <DialogFooter className="!flex !justify-end !gap-2">
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
  };

  const handlePrevImage = () => {
    const n = post?.images.findIndex((i) => i === showImage);
    if (n && n > 0) {
      setTimeout(() => {
        setShowImage(post?.images[n - 1]);
      }, 200);
    }
  };

  const imageModal = (
    <Dialog open={imgShowOpen} onOpenChange={setImgShowOpen}>
      <DialogContent className="w-full max-w-4xl !rounded-2xl text-black sm:!h-auto bg-transparent shadow-none p-2">
        <DialogHeader>
          <DialogTitle className="text-center pt-2"> </DialogTitle>
        </DialogHeader>
        {showImage && (
          <div className="w-auto flex items-center justify-between xl:h-[570px] lg:h-[400px] h-[300px] relative rounded-xl">
            {post?.images.length > 1 && (
              <button
                type="button"
                onClick={() => handlePrevImage()}
                className="bg-white z-[9] text-black rounded-full p-2"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <Image
              src={showImage}
              alt="Preview"
              fill
              className="rounded-xl object-contain"
            />
            {post?.images.length > 1 && (
              <button
                type="button"
                onClick={() => handleNextImage()}
                className="bg-white z-[9] text-black rounded-full p-2"
              >
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
            <Button className="!w-1/2 mx-auto" variant="destructive" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    setAspectRatio(img.naturalHeight / img.naturalWidth);
  };

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
                        : post?.user?.profilePic ||
                          post?.user_profile_pic ||
                          post?.user?.image
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
                      src={
                        post?.user?.image ||
                        post.user_profile_pic ||
                        post.userProfilePic
                      }
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
                      className="text-sm font-semibold duration-300 hover:text-hot dark:hover:text-rose-300 text-hot"
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
                  <Tagtag tags={post?.tags || []} />
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
                  {!!post?.subject?.name ? (
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
                  ) : (
                    post?.subjectName && (
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
                    )
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
                className="!text-start flex justify-start items-center gap-2 p-1 text-gray-900 dark:text-white duration-300 hover:bg-gray-100 dark:hover:bg-rose-800"
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
                  <span className="!rounded-full !bg-rose-100 dark:!bg-rose-500 !bg-opacity-50 dark:!bg-opacity-20 hover:!bg-opacity-70 dark:hover:!bg-opacity-20 duration-300">
                    <EllipsisVertical size={20} />
                  </span>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="!p-0 relative z-[2] rounded-lg !bg-white dark:!bg-gray-900 !min-w-[200px] border-gray-200 dark:border-0"
                >
                  <div className="py-2 grid ring-1 ring-gray-200 dark:ring-rose-800 rounded-lg">
                    {(user?.id === post?.user.id || user?.role === "ADMIN") && (
                      <button
                        type="button"
                        onClick={() => setShowDelete(true)}
                        className="text-start text-gray-900 dark:text-white flex gap-2 justify-start items-center duration-300 hover:bg-gray-100 dark:hover:bg-rose-800 px-3 py-2"
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
                        <span className="leading-none text-sm pt-1">
                          Delete
                        </span>
                      </button>
                    )}

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
                          "!text-start flex justify-start items-center gap-2 px-3 py-2 duration-300 hover:bg-gray-100 dark:hover:bg-hot",
                          isPinned && "!text-hot"
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
                      disabled
                      type="button"
                      className="!text-start flex justify-start items-center gap-2 px-3 py-2 text-gray-600 cursor-not-allowed dark:text-white duration-300 hover:bg-gray-100 dark:hover:bg-rose-800"
                    >
                      {" "}
                      <Flag size={17} strokeWidth={1.1} />
                      <span className="leading-none text-sm pt-1">Report</span>
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
            {post?.category === "homework" && (
              <Link
                href={`/search?q=homework`}
                className="text-sm font-medium text-start text-hot"
              >
                #{post?.category}
              </Link>
            )}

            {!!post?.image ? (
              <button
                type="button"
                onClick={() => {
                  setShowImage(post?.image);
                  setImgShowOpen(true);
                }}
              >
                <div
                  className="relative md:rounded-xl w-full overflow-hidden bg-gray-200"
                  style={{
                    paddingBottom: aspectRatio
                      ? `${aspectRatio * 100}%`
                      : "56.25%",
                  }}
                >
                  <Image
                    src={post?.image}
                    alt="Post image"
                    layout="fill"
                    objectFit="cover"
                    className="md:rounded-xl"
                    onLoad={handleImageLoad}
                  />
                </div>
              </button>
            ) : (
              !!post?.images && (
                <div
                  className={cn(
                    "grid gap-2",
                    post?.images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {post?.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setShowImage(image);
                        setImgShowOpen(true);
                      }}
                      className="col-span-1 w-full"
                    >
                      <div
                        className="relative w-full overflow-hidden bg-gray-200 md:rounded-xl"
                        style={{
                          paddingBottom: aspectRatio
                            ? `${aspectRatio * 100}%`
                            : "56.25%",
                        }}
                      >
                        <Image
                          src={image}
                          alt="Post image"
                          layout="fill"
                          objectFit="cover"
                          className="md:rounded-xl"
                          onLoad={handleImageLoad}
                        />
                        {index === 3 && post?.images.length > 4 && (
                          <div className="absolute text-2xl font-bold sm:rounded-xl top-0 right-0 flex items-center justify-center bg-black/40 w-full h-full text-white px-2 py-1">
                            <span className="text-white rounded-full p-2 w-12 h-12">
                              +{post?.images.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )
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
          {post?.video_url?.includes("embed") ? (
            <VideoComponent videoUrl={post?.video_url || ""} />
          ) : (
            <VideoPlayer
              src={post?.video_url || ""}
              thumbnail={post?.image || ""}
            />
          )}

          {/* Reaction & comments counts */}
          <div className="grid grid-cols-2 justify-between items-center gap-2 -mb-2 px-4 md:px-0">
            {user.role === "ADMIN" && router.pathname === "/post/[slug]" && (
              <div className="flex text-sm font-medium col-span-2 items-center gap-2 w-full justify-end">
                <span className="rounded-full flex items-center gap-1 px-3 py-0.5 bg-hot/20 text-hot">
                  {post?.reach_count}
                  <Eye size={16} />
                </span>
                <span className="rounded-full px-4 py-0.5 bg-yellow-500/20 text-yellow-700">
                  {post?.costing?.toFixed(2)} BDT
                </span>
              </div>
            )}
            <button
              disabled={!post?.reactions.length}
              type="button"
              onClick={() => setViewReactionList(!viewRectionList)}
              className="flex items-center hover:text-yellow-500 gap-1"
            >
              {post.reactions.length > 0 && (
                <ReactCounts reacts={post.reactions} />
              )}
              <span>{post?.reactions.length || 0} Reactions</span>
            </button>
            <div className="flex items-center gap-2 justify-end">
              {post.ai_enabled && (
                <span className="relative p-0.5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="5"
                    height="6"
                    viewBox="0 0 10 12"
                    fill="none"
                    className="animate-pulse animate-delay-500 absolute -left-[3px] -top-[3px]"
                  >
                    <path
                      fill="#1488FC"
                      d="M5.332 1.064a.5.5 0 0 0-.972 0c-.37 1.528-.76 2.45-1.315 3.092-.547.635-1.298 1.05-2.513 1.461a.5.5 0 0 0 0 .948c1.27.428 2.03.88 2.568 1.528.546.657.908 1.57 1.26 3.024a.5.5 0 0 0 .972 0c.37-1.527.761-2.448 1.314-3.091.547-.635 1.298-1.05 2.514-1.461a.5.5 0 0 0 0-.948c-1.272-.43-2.032-.88-2.568-1.526-.546-.656-.907-1.568-1.26-3.027Z"
                    ></path>
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8"
                    height="9.6"
                    viewBox="0 0 10 12"
                    fill="none"
                    className="animate-pulse"
                  >
                    <path
                      fill="#1488FC"
                      d="M5.332 1.064a.5.5 0 0 0-.972 0c-.37 1.528-.76 2.45-1.315 3.092-.547.635-1.298 1.05-2.513 1.461a.5.5 0 0 0 0 .948c1.27.428 2.03.88 2.568 1.528.546.657.908 1.57 1.26 3.024a.5.5 0 0 0 .972 0c.37-1.527.761-2.448 1.314-3.091.547-.635 1.298-1.05 2.514-1.461a.5.5 0 0 0 0-.948c-1.272-.43-2.032-.88-2.568-1.526-.546-.656-.907-1.568-1.26-3.027Z"
                    ></path>
                  </svg>
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
                  className="!rounded-full !p-0 relative z-[2] ring-gray-200 dark:ring-rose-800 !ring-1 !border-0 bg-white dark:bg-gray-800"
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
                  className="!p-0"
                >
                  <p className="hover:!text-elegant cursor-pointer duration-500 flex justify-center items-center text-sm font-medium shadow-none !text-gray-900 dark:!text-white">
                    {reaction === 5 ? (
                      <>
                        <span>
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
                      <p className="scale-[0.7]">
                        {reactionTabs[reaction].icon}
                      </p>
                    )}
                    <span
                      className={cn(
                        "pt-1 pl-2",
                        reaction !== 5 && "text-yellow-600 dark:text-yellow-400"
                      )}
                    >
                      {reactionTabs[reaction]?.name || "রিয়েক্ট"}
                    </span>
                  </p>
                </PopoverTrigger>
              </Popover>

              <Link
                className="hover:!text-elegant !cursor-pointer flex gap-2 justify-center items-center text-sm font-medium shadow-none !transition-opacity !text-gray-900 dark:!text-white"
                href={`/post/${post.id}`}
              >
                {" "}
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
                <span className="">কমেন্ট</span>
              </Link>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 hover:!text-elegant shadow-none duration-300 !transition-opacity !text-gray-900 dark:!text-white"
              >
                {" "}
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
                <span>শেয়ার</span>
              </button>
            </div>
          </div>

          <div className="border-t border-ash border-dashed"></div>

          {/* Recent Comments */}
          {post?.recentComments && post?.recentComments.length > 0 && (
            <div className="grid gap-3 py-2">
              {post.recentComments.map((c) => (
                <FeaturedComments key={c.id} comment={c} postId={post.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
