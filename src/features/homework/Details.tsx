import React, { useEffect, useRef, useState } from "react";
import { HwqCard } from "./HwqCard";
import { HwsCard } from "./HwsCard";
import { THomework, TSubmission } from "@/@types/homeworks";
import axios from "axios";
import { secondaryAPI } from "@/configs";
import { toast } from "@/hooks";
import Router from "next/router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PostSkeleton,
  useUser,
} from "@/components";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";

type Props = {
  data: {
    homework: THomework;
    submissions: TSubmission[];
  };
  refetch?: () => void;
  loading: boolean;
  hasMore: boolean;
  isFetching: boolean;
  setIsFetching: (isFetching: boolean) => void;
  setPage: (page: number) => void;
  page: number;
  evaluation: string;
  setEvaluation: (evaluation: string) => void;
  setSubmissions: (submissions: TSubmission) => void;
};

type TTeacher = {
  id: string;
  name: string;
  image: string;
  role: string;
};

export type Replies = {
  created_at: string;
  id: number;
  reply: string;
  user_id: string;
};

export const HWDetails = (props: Props) => {
  const {
    data,
    refetch,
    loading,
    hasMore,
    isFetching,
    setIsFetching,
    setPage,
    page,
    evaluation,
    setEvaluation,
    setSubmissions,
  } = props;
  const { user } = useUser();
  const loadMoreTrigger = useRef<HTMLDivElement>(null);
  const [isSolution, setIsSolution] = useState<string | null>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<Replies[]>([]);

  useEffect(() => {
    async function getSuggestedReplies() {
      try {
        const res = await axios.get(
          `${secondaryAPI}/api/homework/saved-replies`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setSuggestedReplies(res.data);
        // console.log(res);
      } catch (error) {
        console.error(error);
      }
    }
    getSuggestedReplies();
  }, []);

  async function handleDelete(id: string) {
    try {
      await axios.delete(`${secondaryAPI}/api/homework/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      toast({
        title: "Homework Deleted Successfully",
        description: "Your homework has been deleted successfully",
        variant: "success",
      });
      Router.back();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteSubmission(sid: string, hwid: string) {
    try {
      await axios.delete(
        `${secondaryAPI}/api/homework/${hwid}/submissions/${sid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      toast({
        title: "Homework Deleted Successfully",
        description: "Your homework has been deleted successfully",
        variant: "success",
      });
      if (refetch) refetch();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore || isFetching) return;

      const triggerElement = loadMoreTrigger.current;
      if (!triggerElement) return;

      const { top } = triggerElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (top <= windowHeight) {
        setIsFetching(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore, isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    setTimeout(() => {
      setPage(page + 1);
      setIsFetching(false);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  async function handleSubmitMarks(s: TSubmission) {
    const { id, is_best, marks, reply, reply_audience, is_solution } = s;
    try {
      const res = await axios.post(
        `${secondaryAPI}/api/homework/mark`,
        {
          submission_id: id,
          marks: marks,
          is_best: is_best,
          reply: reply,
          reply_audience: reply_audience,
          is_solution: is_solution,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(res);
      toast({
        title: "Success!",
        description: "HW Evaluation Updated Successfully",
        variant: "success",
      });
    } catch (error) {
      console.log(error);
    }
  }

  const teacher = {
    id: data?.homework?.user_id,
    name: data?.homework?.user_name,
    image: data?.homework?.user_image,
    role: "TEACHER",
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full pt-4 sm:py-4">
      <HwqCard
        homework={data.homework}
        handleDelete={() => handleDelete(data.homework.id)}
        setSubmissions={(sub) => {
          setSubmissions(sub);
        }}
        refetch={() => {
          if (refetch) refetch();
        }}
      />

      <div
        className={cn(
          "items-center justify-end py-3 px-4 bg-white rounded-xl gap-2",
          user?.role !== "USER" ? "flex" : "hidden"
        )}
      >
        <Popover>
          <PopoverTrigger className="flex items-center text-sm">
            <p className="h-10 sm:h-9 gap-2 min-w-10 sm:rounded-xl sm:px-4 rounded-full flex items-center justify-center sm:bg-hot/10 text-hot">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.650391 0.75C0.650391 0.335786 0.986177 0 1.40039 0H12.4004C12.8146 0 13.1504 0.335786 13.1504 0.75C13.1504 1.16421 12.8146 1.5 12.4004 1.5H1.40039C0.986177 1.5 0.650391 1.16421 0.650391 0.75ZM2.65039 4.75C2.65039 4.33579 2.98618 4 3.40039 4H10.4004C10.8146 4 11.1504 4.33579 11.1504 4.75C11.1504 5.16421 10.8146 5.5 10.4004 5.5H3.40039C2.98618 5.5 2.65039 5.16421 2.65039 4.75ZM4.65039 8.75C4.65039 8.33579 4.98618 8 5.40039 8H8.40039C8.8146 8 9.15039 8.33579 9.15039 8.75C9.15039 9.16421 8.8146 9.5 8.40039 9.5H5.40039C4.98618 9.5 4.65039 9.16421 4.65039 8.75Z"
                  fill="currentColor"
                />
              </svg>
              <span className="hidden font-medium sm:block">
                {evaluation === "false" ? "Unevaluated" : "All Submissions"}
              </span>
            </p>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="z-[3] w-40 grid divide-y divide-ash rounded-l-2xl rounded-b-2xl py-2 max-h-[300px] overflow-y-auto"
          >
            <PopoverClose>
              <button
                className="px-4 py-1.5 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => setEvaluation("")}
              >
                All Submissions
              </button>
            </PopoverClose>
            <PopoverClose>
              <button
                className="px-4 py-1.5 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => setEvaluation("false")}
              >
                Unevaluated
              </button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </div>

      {isSolution && data?.homework?.has_submitted
        ? data?.submissions?.some((sub) => sub.is_solution) && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-ice/10 ring-1 ring-ice/50 rounded-xl">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="30"
                    height="30"
                    rx="15"
                    fill="#AFC4DF"
                    fill-opacity="0.3"
                  />
                  <path
                    d="M18.0938 10.6406C18.0938 10.5633 18.0305 10.5 17.9531 10.5H11.2031C11.1258 10.5 11.0625 10.5633 11.0625 10.6406V11.4844C11.0625 11.5617 11.1258 11.625 11.2031 11.625H17.9531C18.0305 11.625 18.0938 11.5617 18.0938 11.4844V10.6406ZM17.9531 13.0312H11.2031C11.1258 13.0312 11.0625 13.0945 11.0625 13.1719V14.0156C11.0625 14.093 11.1258 14.1562 11.2031 14.1562H17.9531C18.0305 14.1562 18.0938 14.093 18.0938 14.0156V13.1719C18.0938 13.0945 18.0305 13.0312 17.9531 13.0312ZM14.4375 15.5625H11.2031C11.1258 15.5625 11.0625 15.6258 11.0625 15.7031V16.5469C11.0625 16.6242 11.1258 16.6875 11.2031 16.6875H14.4375C14.5148 16.6875 14.5781 16.6242 14.5781 16.5469V15.7031C14.5781 15.6258 14.5148 15.5625 14.4375 15.5625ZM13.5938 20.9766H9.65625V8.60156H19.5V14.6484C19.5 14.7258 19.5633 14.7891 19.6406 14.7891H20.625C20.7023 14.7891 20.7656 14.7258 20.7656 14.6484V7.89844C20.7656 7.5873 20.5143 7.33594 20.2031 7.33594H8.95312C8.64199 7.33594 8.39062 7.5873 8.39062 7.89844V21.6797C8.39062 21.9908 8.64199 22.2422 8.95312 22.2422H13.5938C13.6711 22.2422 13.7344 22.1789 13.7344 22.1016V21.1172C13.7344 21.0398 13.6711 20.9766 13.5938 20.9766ZM19.8656 19.6687C20.3754 19.2064 20.6953 18.5385 20.6953 17.7949C20.6953 16.3975 19.5615 15.2637 18.1641 15.2637C16.7666 15.2637 15.6328 16.3975 15.6328 17.7949C15.6328 18.5385 15.9527 19.2064 16.4625 19.6687C15.4605 20.24 14.7715 21.2982 14.7188 22.5182C14.7152 22.5973 14.7803 22.6641 14.8594 22.6641H15.7049C15.7787 22.6641 15.8402 22.6061 15.8455 22.5305C15.9141 21.3141 16.9283 20.3438 18.1641 20.3438C19.3998 20.3438 20.4141 21.3141 20.4826 22.5305C20.4861 22.6043 20.5477 22.6641 20.6232 22.6641H21.4688C21.5496 22.6641 21.6129 22.5973 21.6094 22.5182C21.5584 21.2965 20.8676 20.24 19.8656 19.6687ZM18.1641 16.3887C18.941 16.3887 19.5703 17.018 19.5703 17.7949C19.5703 18.5719 18.941 19.2012 18.1641 19.2012C17.3871 19.2012 16.7578 18.5719 16.7578 17.7949C16.7578 17.018 17.3871 16.3887 18.1641 16.3887Z"
                    fill="#3D70B2"
                  />
                </svg>

                <span className="">হোমওয়ার্ক সল্যুশন</span>
              </h3>
              {data?.submissions
                .filter((sub) => sub.id === isSolution)
                .map((sub) => (
                  <HwsCard
                    setSuggestedReplies={setSuggestedReplies}
                    suggestedReplies={suggestedReplies}
                    isSolution={isSolution}
                    setIsSolution={setIsSolution}
                    key={sub.id}
                    submission={sub}
                    submitMarks={(marks) =>
                      handleSubmitMarks({ ...sub, ...marks })
                    }
                    handleDelete={(hwid) =>
                      handleDeleteSubmission(sub.id, hwid)
                    }
                  />
                ))}
            </div>
          )
        : data.homework?.has_ended &&
          data.submissions.some((sub) => sub.is_solution) && (
            <div className="flex flex-col gap-4">
              <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-ice/10 ring-1 ring-ice/50 rounded-xl">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="30"
                    height="30"
                    rx="15"
                    fill="#AFC4DF"
                    fill-opacity="0.3"
                  />
                  <path
                    d="M18.0938 10.6406C18.0938 10.5633 18.0305 10.5 17.9531 10.5H11.2031C11.1258 10.5 11.0625 10.5633 11.0625 10.6406V11.4844C11.0625 11.5617 11.1258 11.625 11.2031 11.625H17.9531C18.0305 11.625 18.0938 11.5617 18.0938 11.4844V10.6406ZM17.9531 13.0312H11.2031C11.1258 13.0312 11.0625 13.0945 11.0625 13.1719V14.0156C11.0625 14.093 11.1258 14.1562 11.2031 14.1562H17.9531C18.0305 14.1562 18.0938 14.093 18.0938 14.0156V13.1719C18.0938 13.0945 18.0305 13.0312 17.9531 13.0312ZM14.4375 15.5625H11.2031C11.1258 15.5625 11.0625 15.6258 11.0625 15.7031V16.5469C11.0625 16.6242 11.1258 16.6875 11.2031 16.6875H14.4375C14.5148 16.6875 14.5781 16.6242 14.5781 16.5469V15.7031C14.5781 15.6258 14.5148 15.5625 14.4375 15.5625ZM13.5938 20.9766H9.65625V8.60156H19.5V14.6484C19.5 14.7258 19.5633 14.7891 19.6406 14.7891H20.625C20.7023 14.7891 20.7656 14.7258 20.7656 14.6484V7.89844C20.7656 7.5873 20.5143 7.33594 20.2031 7.33594H8.95312C8.64199 7.33594 8.39062 7.5873 8.39062 7.89844V21.6797C8.39062 21.9908 8.64199 22.2422 8.95312 22.2422H13.5938C13.6711 22.2422 13.7344 22.1789 13.7344 22.1016V21.1172C13.7344 21.0398 13.6711 20.9766 13.5938 20.9766ZM19.8656 19.6687C20.3754 19.2064 20.6953 18.5385 20.6953 17.7949C20.6953 16.3975 19.5615 15.2637 18.1641 15.2637C16.7666 15.2637 15.6328 16.3975 15.6328 17.7949C15.6328 18.5385 15.9527 19.2064 16.4625 19.6687C15.4605 20.24 14.7715 21.2982 14.7188 22.5182C14.7152 22.5973 14.7803 22.6641 14.8594 22.6641H15.7049C15.7787 22.6641 15.8402 22.6061 15.8455 22.5305C15.9141 21.3141 16.9283 20.3438 18.1641 20.3438C19.3998 20.3438 20.4141 21.3141 20.4826 22.5305C20.4861 22.6043 20.5477 22.6641 20.6232 22.6641H21.4688C21.5496 22.6641 21.6129 22.5973 21.6094 22.5182C21.5584 21.2965 20.8676 20.24 19.8656 19.6687ZM18.1641 16.3887C18.941 16.3887 19.5703 17.018 19.5703 17.7949C19.5703 18.5719 18.941 19.2012 18.1641 19.2012C17.3871 19.2012 16.7578 18.5719 16.7578 17.7949C16.7578 17.018 17.3871 16.3887 18.1641 16.3887Z"
                    fill="#3D70B2"
                  />
                </svg>

                <span className="">হোমওয়ার্ক সল্যুশন</span>
              </h3>
              {data.submissions
                .filter((sub) => sub.id === isSolution)
                .map((sub) => (
                  <HwsCard
                    setSuggestedReplies={setSuggestedReplies}
                    suggestedReplies={suggestedReplies}
                    isSolution={isSolution}
                    setIsSolution={setIsSolution}
                    key={sub.id}
                    submission={sub}
                    submitMarks={(marks) =>
                      handleSubmitMarks({ ...sub, ...marks })
                    }
                    handleDelete={(hwid) =>
                      handleDeleteSubmission(sub.id, hwid)
                    }
                  />
                ))}
            </div>
          )}

      {
        loading && data?.submissions?.length === 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-center text-gray-500">
              এখনো কোনো হোমওয়ার্ক জমা হয়নি
            </p>
          </div>
        ) : user?.role !== "USER" ? (
          data?.submissions && (
            <>
              {data.submissions.some((sub) => sub.user_id === user.id) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-white ring-1 ring-ash rounded-xl">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="30" height="30" rx="15" fill="#E6F3EC" />
                      <path
                        d="M10.6658 8.26248L10.6205 8.25394C10.0882 8.15379 9.617 8.06514 9.21934 8.06256C8.77227 8.05966 8.36702 8.16321 7.99815 8.47539C7.6172 8.79779 7.45365 9.21288 7.38018 9.67893C7.31244 10.1087 7.31247 10.6474 7.3125 11.2785L7.3125 16.1607C7.31249 16.7445 7.31248 17.2289 7.35493 17.6133C7.39894 18.0117 7.49552 18.3869 7.75188 18.7003C8.01855 19.0263 8.40556 19.1938 8.81765 19.3148C9.2275 19.4351 9.76586 19.5363 10.4273 19.6607L10.4579 19.6664C11.6295 19.8868 12.5317 20.2356 13.1719 20.5768L13.1856 20.5841C13.5144 20.7593 13.7794 20.9006 13.9824 20.997C14.0859 21.0461 14.187 21.0903 14.2819 21.1229C14.3704 21.1533 14.4917 21.1875 14.625 21.1875C14.9357 21.1875 15.1875 20.9357 15.1875 20.625V11.4C15.1875 11.3599 15.1875 11.3398 15.1894 11.3253C15.1956 11.278 15.2013 11.2634 15.2288 11.2245C15.2373 11.2125 15.2608 11.1871 15.3078 11.1361C15.6173 10.8009 16.742 10.0208 18.7891 9.6412C19.3604 9.53529 19.6953 9.4759 19.9465 9.47429C20.1491 9.473 20.2223 9.51014 20.2947 9.57051C20.3517 9.61805 20.4144 9.69031 20.4564 9.95267C20.5036 10.2481 20.5057 10.6545 20.5057 11.3071V13.3566C20.5057 13.7465 20.8262 14.0625 21.2216 14.0625C21.617 14.0625 21.9375 13.7465 21.9375 13.3566L21.9375 11.2554C21.9376 10.6705 21.9376 10.1512 21.8707 9.73283C21.7966 9.26902 21.6271 8.83286 21.2197 8.49287C20.8276 8.1657 20.396 8.05963 19.9372 8.06256C19.5411 8.06509 19.0771 8.15121 18.578 8.24383L18.5245 8.25375C16.8641 8.56162 15.6453 9.12408 14.8875 9.64815C14.743 9.74807 14.6708 9.79803 14.6013 9.79844C14.5318 9.79886 14.4594 9.75004 14.3145 9.6524C13.5418 9.13169 12.3219 8.57391 10.6658 8.26248Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M19.9339 15.7904C20.1839 15.5404 20.3089 15.4154 20.4389 15.3403C20.7918 15.1366 21.2266 15.1366 21.5795 15.3403C21.7096 15.4154 21.8346 15.5404 22.0846 15.7904C22.3346 16.0404 22.4596 16.1654 22.5347 16.2955C22.7384 16.6484 22.7384 17.0832 22.5347 17.4361C22.4596 17.5661 22.3346 17.6911 22.0846 17.9411L18.8537 21.172C18.3581 21.6676 17.61 21.6878 16.9483 21.8293C16.4308 21.9399 16.1721 21.9953 16.0259 21.8491C15.8797 21.7029 15.9351 21.4442 16.0457 20.9267C16.1872 20.265 16.2074 19.5169 16.703 19.0213L19.9339 15.7904Z"
                        fill="#005E2F"
                      />
                    </svg>
                    <span className="">আমার হোমওয়ার্ক</span>
                  </h3>
                  {data.submissions
                    .filter((sub) => sub.user_id === user.id)
                    .map((sub) => (
                      <HwsCard
                        setSuggestedReplies={setSuggestedReplies}
                        suggestedReplies={suggestedReplies}
                        isSolution={isSolution}
                        setIsSolution={setIsSolution}
                        key={sub.id}
                        submission={sub}
                        submitMarks={(marks) =>
                          handleSubmitMarks({ ...sub, ...marks })
                        }
                        handleDelete={(hwid) =>
                          handleDeleteSubmission(sub.id, hwid)
                        }
                      />
                    ))}
                </div>
              )}
              {data?.submissions.some((sub) => sub.user_id !== user.id) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-white ring-1 ring-ash rounded-xl">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="30" height="30" rx="15" fill="#E6F3EC" />
                      <path
                        d="M10.6658 8.26248L10.6205 8.25394C10.0882 8.15379 9.617 8.06514 9.21934 8.06256C8.77227 8.05966 8.36702 8.16321 7.99815 8.47539C7.6172 8.79779 7.45365 9.21288 7.38018 9.67893C7.31244 10.1087 7.31247 10.6474 7.3125 11.2785L7.3125 16.1607C7.31249 16.7445 7.31248 17.2289 7.35493 17.6133C7.39894 18.0117 7.49552 18.3869 7.75188 18.7003C8.01855 19.0263 8.40556 19.1938 8.81765 19.3148C9.2275 19.4351 9.76586 19.5363 10.4273 19.6607L10.4579 19.6664C11.6295 19.8868 12.5317 20.2356 13.1719 20.5768L13.1856 20.5841C13.5144 20.7593 13.7794 20.9006 13.9824 20.997C14.0859 21.0461 14.187 21.0903 14.2819 21.1229C14.3704 21.1533 14.4917 21.1875 14.625 21.1875C14.9357 21.1875 15.1875 20.9357 15.1875 20.625V11.4C15.1875 11.3599 15.1875 11.3398 15.1894 11.3253C15.1956 11.278 15.2013 11.2634 15.2288 11.2245C15.2373 11.2125 15.2608 11.1871 15.3078 11.1361C15.6173 10.8009 16.742 10.0208 18.7891 9.6412C19.3604 9.53529 19.6953 9.4759 19.9465 9.47429C20.1491 9.473 20.2223 9.51014 20.2947 9.57051C20.3517 9.61805 20.4144 9.69031 20.4564 9.95267C20.5036 10.2481 20.5057 10.6545 20.5057 11.3071V13.3566C20.5057 13.7465 20.8262 14.0625 21.2216 14.0625C21.617 14.0625 21.9375 13.7465 21.9375 13.3566L21.9375 11.2554C21.9376 10.6705 21.9376 10.1512 21.8707 9.73283C21.7966 9.26902 21.6271 8.83286 21.2197 8.49287C20.8276 8.1657 20.396 8.05963 19.9372 8.06256C19.5411 8.06509 19.0771 8.15121 18.578 8.24383L18.5245 8.25375C16.8641 8.56162 15.6453 9.12408 14.8875 9.64815C14.743 9.74807 14.6708 9.79803 14.6013 9.79844C14.5318 9.79886 14.4594 9.75004 14.3145 9.6524C13.5418 9.13169 12.3219 8.57391 10.6658 8.26248Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M19.9339 15.7904C20.1839 15.5404 20.3089 15.4154 20.4389 15.3403C20.7918 15.1366 21.2266 15.1366 21.5795 15.3403C21.7096 15.4154 21.8346 15.5404 22.0846 15.7904C22.3346 16.0404 22.4596 16.1654 22.5347 16.2955C22.7384 16.6484 22.7384 17.0832 22.5347 17.4361C22.4596 17.5661 22.3346 17.6911 22.0846 17.9411L18.8537 21.172C18.3581 21.6676 17.61 21.6878 16.9483 21.8293C16.4308 21.9399 16.1721 21.9953 16.0259 21.8491C15.8797 21.7029 15.9351 21.4442 16.0457 20.9267C16.1872 20.265 16.2074 19.5169 16.703 19.0213L19.9339 15.7904Z"
                        fill="#005E2F"
                      />
                    </svg>
                    <span className="">সহপাঠীদের হোমওয়ার্ক</span>
                  </h3>
                  {data.submissions
                    .filter((sub) => sub.user_id !== user.id)
                    .map((sub) => (
                      <HwsCard
                        setSuggestedReplies={setSuggestedReplies}
                        suggestedReplies={suggestedReplies}
                        isSolution={isSolution}
                        setIsSolution={setIsSolution}
                        key={sub.id}
                        submission={sub}
                        submitMarks={(marks) =>
                          handleSubmitMarks({ ...sub, ...marks })
                        }
                        handleDelete={(hwid) =>
                          handleDeleteSubmission(sub.id, hwid)
                        }
                      />
                    ))}
                </div>
              )}
            </>
          )
        ) : data?.homework?.has_ended ? (
          data?.submissions && (
            <>
              {data.submissions.some((sub) => sub.user_id === user.id) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-white ring-1 ring-ash rounded-xl">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="30" height="30" rx="15" fill="#E6F3EC" />
                      <path
                        d="M10.6658 8.26248L10.6205 8.25394C10.0882 8.15379 9.617 8.06514 9.21934 8.06256C8.77227 8.05966 8.36702 8.16321 7.99815 8.47539C7.6172 8.79779 7.45365 9.21288 7.38018 9.67893C7.31244 10.1087 7.31247 10.6474 7.3125 11.2785L7.3125 16.1607C7.31249 16.7445 7.31248 17.2289 7.35493 17.6133C7.39894 18.0117 7.49552 18.3869 7.75188 18.7003C8.01855 19.0263 8.40556 19.1938 8.81765 19.3148C9.2275 19.4351 9.76586 19.5363 10.4273 19.6607L10.4579 19.6664C11.6295 19.8868 12.5317 20.2356 13.1719 20.5768L13.1856 20.5841C13.5144 20.7593 13.7794 20.9006 13.9824 20.997C14.0859 21.0461 14.187 21.0903 14.2819 21.1229C14.3704 21.1533 14.4917 21.1875 14.625 21.1875C14.9357 21.1875 15.1875 20.9357 15.1875 20.625V11.4C15.1875 11.3599 15.1875 11.3398 15.1894 11.3253C15.1956 11.278 15.2013 11.2634 15.2288 11.2245C15.2373 11.2125 15.2608 11.1871 15.3078 11.1361C15.6173 10.8009 16.742 10.0208 18.7891 9.6412C19.3604 9.53529 19.6953 9.4759 19.9465 9.47429C20.1491 9.473 20.2223 9.51014 20.2947 9.57051C20.3517 9.61805 20.4144 9.69031 20.4564 9.95267C20.5036 10.2481 20.5057 10.6545 20.5057 11.3071V13.3566C20.5057 13.7465 20.8262 14.0625 21.2216 14.0625C21.617 14.0625 21.9375 13.7465 21.9375 13.3566L21.9375 11.2554C21.9376 10.6705 21.9376 10.1512 21.8707 9.73283C21.7966 9.26902 21.6271 8.83286 21.2197 8.49287C20.8276 8.1657 20.396 8.05963 19.9372 8.06256C19.5411 8.06509 19.0771 8.15121 18.578 8.24383L18.5245 8.25375C16.8641 8.56162 15.6453 9.12408 14.8875 9.64815C14.743 9.74807 14.6708 9.79803 14.6013 9.79844C14.5318 9.79886 14.4594 9.75004 14.3145 9.6524C13.5418 9.13169 12.3219 8.57391 10.6658 8.26248Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M19.9339 15.7904C20.1839 15.5404 20.3089 15.4154 20.4389 15.3403C20.7918 15.1366 21.2266 15.1366 21.5795 15.3403C21.7096 15.4154 21.8346 15.5404 22.0846 15.7904C22.3346 16.0404 22.4596 16.1654 22.5347 16.2955C22.7384 16.6484 22.7384 17.0832 22.5347 17.4361C22.4596 17.5661 22.3346 17.6911 22.0846 17.9411L18.8537 21.172C18.3581 21.6676 17.61 21.6878 16.9483 21.8293C16.4308 21.9399 16.1721 21.9953 16.0259 21.8491C15.8797 21.7029 15.9351 21.4442 16.0457 20.9267C16.1872 20.265 16.2074 19.5169 16.703 19.0213L19.9339 15.7904Z"
                        fill="#005E2F"
                      />
                    </svg>
                    <span className="">আমার হোমওয়ার্ক</span>
                  </h3>
                  {data.submissions
                    .filter((sub) => sub.user_id === user.id)
                    .map((sub) => (
                      <HwsCard
                        setSuggestedReplies={setSuggestedReplies}
                        suggestedReplies={suggestedReplies}
                        isSolution={isSolution}
                        setIsSolution={setIsSolution}
                        key={sub.id}
                        teacher={teacher as TTeacher}
                        submission={sub}
                        submitMarks={(marks) =>
                          handleSubmitMarks({ ...sub, ...marks })
                        }
                        handleDelete={(hwid) =>
                          handleDeleteSubmission(sub.id, hwid)
                        }
                      />
                    ))}
                </div>
              )}
              {data.submissions.some((sub) => sub.user_id !== user.id) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-white ring-1 ring-ash rounded-xl">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="30" height="30" rx="15" fill="#E6F3EC" />
                      <path
                        d="M10.6658 8.26248L10.6205 8.25394C10.0882 8.15379 9.617 8.06514 9.21934 8.06256C8.77227 8.05966 8.36702 8.16321 7.99815 8.47539C7.6172 8.79779 7.45365 9.21288 7.38018 9.67893C7.31244 10.1087 7.31247 10.6474 7.3125 11.2785L7.3125 16.1607C7.31249 16.7445 7.31248 17.2289 7.35493 17.6133C7.39894 18.0117 7.49552 18.3869 7.75188 18.7003C8.01855 19.0263 8.40556 19.1938 8.81765 19.3148C9.2275 19.4351 9.76586 19.5363 10.4273 19.6607L10.4579 19.6664C11.6295 19.8868 12.5317 20.2356 13.1719 20.5768L13.1856 20.5841C13.5144 20.7593 13.7794 20.9006 13.9824 20.997C14.0859 21.0461 14.187 21.0903 14.2819 21.1229C14.3704 21.1533 14.4917 21.1875 14.625 21.1875C14.9357 21.1875 15.1875 20.9357 15.1875 20.625V11.4C15.1875 11.3599 15.1875 11.3398 15.1894 11.3253C15.1956 11.278 15.2013 11.2634 15.2288 11.2245C15.2373 11.2125 15.2608 11.1871 15.3078 11.1361C15.6173 10.8009 16.742 10.0208 18.7891 9.6412C19.3604 9.53529 19.6953 9.4759 19.9465 9.47429C20.1491 9.473 20.2223 9.51014 20.2947 9.57051C20.3517 9.61805 20.4144 9.69031 20.4564 9.95267C20.5036 10.2481 20.5057 10.6545 20.5057 11.3071V13.3566C20.5057 13.7465 20.8262 14.0625 21.2216 14.0625C21.617 14.0625 21.9375 13.7465 21.9375 13.3566L21.9375 11.2554C21.9376 10.6705 21.9376 10.1512 21.8707 9.73283C21.7966 9.26902 21.6271 8.83286 21.2197 8.49287C20.8276 8.1657 20.396 8.05963 19.9372 8.06256C19.5411 8.06509 19.0771 8.15121 18.578 8.24383L18.5245 8.25375C16.8641 8.56162 15.6453 9.12408 14.8875 9.64815C14.743 9.74807 14.6708 9.79803 14.6013 9.79844C14.5318 9.79886 14.4594 9.75004 14.3145 9.6524C13.5418 9.13169 12.3219 8.57391 10.6658 8.26248Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M19.9339 15.7904C20.1839 15.5404 20.3089 15.4154 20.4389 15.3403C20.7918 15.1366 21.2266 15.1366 21.5795 15.3403C21.7096 15.4154 21.8346 15.5404 22.0846 15.7904C22.3346 16.0404 22.4596 16.1654 22.5347 16.2955C22.7384 16.6484 22.7384 17.0832 22.5347 17.4361C22.4596 17.5661 22.3346 17.6911 22.0846 17.9411L18.8537 21.172C18.3581 21.6676 17.61 21.6878 16.9483 21.8293C16.4308 21.9399 16.1721 21.9953 16.0259 21.8491C15.8797 21.7029 15.9351 21.4442 16.0457 20.9267C16.1872 20.265 16.2074 19.5169 16.703 19.0213L19.9339 15.7904Z"
                        fill="#005E2F"
                      />
                    </svg>
                    <span className="">সহপাঠীদের হোমওয়ার্ক</span>
                  </h3>
                  {data.submissions
                    .filter((sub) => sub.user_id !== user.id)
                    .map((sub) => (
                      <HwsCard
                        setSuggestedReplies={setSuggestedReplies}
                        suggestedReplies={suggestedReplies}
                        isSolution={isSolution}
                        setIsSolution={setIsSolution}
                        key={sub.id}
                        teacher={teacher as TTeacher}
                        submission={sub}
                        submitMarks={(marks) =>
                          handleSubmitMarks({ ...sub, ...marks })
                        }
                        handleDelete={(hwid) =>
                          handleDeleteSubmission(sub.id, hwid)
                        }
                      />
                    ))}
                </div>
              )}
            </>
          )
        ) : data?.homework?.has_submitted ? (
          data?.submissions && (
            <>
              {data.submissions.some((sub) => sub.user_id === user.id) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-white ring-1 ring-ash rounded-xl">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="30" height="30" rx="15" fill="#E6F3EC" />
                      <path
                        d="M10.6658 8.26248L10.6205 8.25394C10.0882 8.15379 9.617 8.06514 9.21934 8.06256C8.77227 8.05966 8.36702 8.16321 7.99815 8.47539C7.6172 8.79779 7.45365 9.21288 7.38018 9.67893C7.31244 10.1087 7.31247 10.6474 7.3125 11.2785L7.3125 16.1607C7.31249 16.7445 7.31248 17.2289 7.35493 17.6133C7.39894 18.0117 7.49552 18.3869 7.75188 18.7003C8.01855 19.0263 8.40556 19.1938 8.81765 19.3148C9.2275 19.4351 9.76586 19.5363 10.4273 19.6607L10.4579 19.6664C11.6295 19.8868 12.5317 20.2356 13.1719 20.5768L13.1856 20.5841C13.5144 20.7593 13.7794 20.9006 13.9824 20.997C14.0859 21.0461 14.187 21.0903 14.2819 21.1229C14.3704 21.1533 14.4917 21.1875 14.625 21.1875C14.9357 21.1875 15.1875 20.9357 15.1875 20.625V11.4C15.1875 11.3599 15.1875 11.3398 15.1894 11.3253C15.1956 11.278 15.2013 11.2634 15.2288 11.2245C15.2373 11.2125 15.2608 11.1871 15.3078 11.1361C15.6173 10.8009 16.742 10.0208 18.7891 9.6412C19.3604 9.53529 19.6953 9.4759 19.9465 9.47429C20.1491 9.473 20.2223 9.51014 20.2947 9.57051C20.3517 9.61805 20.4144 9.69031 20.4564 9.95267C20.5036 10.2481 20.5057 10.6545 20.5057 11.3071V13.3566C20.5057 13.7465 20.8262 14.0625 21.2216 14.0625C21.617 14.0625 21.9375 13.7465 21.9375 13.3566L21.9375 11.2554C21.9376 10.6705 21.9376 10.1512 21.8707 9.73283C21.7966 9.26902 21.6271 8.83286 21.2197 8.49287C20.8276 8.1657 20.396 8.05963 19.9372 8.06256C19.5411 8.06509 19.0771 8.15121 18.578 8.24383L18.5245 8.25375C16.8641 8.56162 15.6453 9.12408 14.8875 9.64815C14.743 9.74807 14.6708 9.79803 14.6013 9.79844C14.5318 9.79886 14.4594 9.75004 14.3145 9.6524C13.5418 9.13169 12.3219 8.57391 10.6658 8.26248Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M19.9339 15.7904C20.1839 15.5404 20.3089 15.4154 20.4389 15.3403C20.7918 15.1366 21.2266 15.1366 21.5795 15.3403C21.7096 15.4154 21.8346 15.5404 22.0846 15.7904C22.3346 16.0404 22.4596 16.1654 22.5347 16.2955C22.7384 16.6484 22.7384 17.0832 22.5347 17.4361C22.4596 17.5661 22.3346 17.6911 22.0846 17.9411L18.8537 21.172C18.3581 21.6676 17.61 21.6878 16.9483 21.8293C16.4308 21.9399 16.1721 21.9953 16.0259 21.8491C15.8797 21.7029 15.9351 21.4442 16.0457 20.9267C16.1872 20.265 16.2074 19.5169 16.703 19.0213L19.9339 15.7904Z"
                        fill="#005E2F"
                      />
                    </svg>
                    <span className="">আমার হোমওয়ার্ক</span>
                  </h3>
                  {data.submissions
                    .filter((sub) => sub.user_id === user.id)
                    .map((sub) => (
                      <HwsCard
                        setSuggestedReplies={setSuggestedReplies}
                        suggestedReplies={suggestedReplies}
                        isSolution={isSolution}
                        setIsSolution={setIsSolution}
                        key={sub.id}
                        submission={sub}
                        submitMarks={(marks) =>
                          handleSubmitMarks({ ...sub, ...marks })
                        }
                        handleDelete={(hwid) =>
                          handleDeleteSubmission(sub.id, hwid)
                        }
                      />
                    ))}
                </div>
              )}
              {data.submissions.some((sub) => sub.user_id !== user.id) && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-base flex items-center gap-2 font-semibold py-3 px-4 bg-white ring-1 ring-ash rounded-xl">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="30" height="30" rx="15" fill="#E6F3EC" />
                      <path
                        d="M10.6658 8.26248L10.6205 8.25394C10.0882 8.15379 9.617 8.06514 9.21934 8.06256C8.77227 8.05966 8.36702 8.16321 7.99815 8.47539C7.6172 8.79779 7.45365 9.21288 7.38018 9.67893C7.31244 10.1087 7.31247 10.6474 7.3125 11.2785L7.3125 16.1607C7.31249 16.7445 7.31248 17.2289 7.35493 17.6133C7.39894 18.0117 7.49552 18.3869 7.75188 18.7003C8.01855 19.0263 8.40556 19.1938 8.81765 19.3148C9.2275 19.4351 9.76586 19.5363 10.4273 19.6607L10.4579 19.6664C11.6295 19.8868 12.5317 20.2356 13.1719 20.5768L13.1856 20.5841C13.5144 20.7593 13.7794 20.9006 13.9824 20.997C14.0859 21.0461 14.187 21.0903 14.2819 21.1229C14.3704 21.1533 14.4917 21.1875 14.625 21.1875C14.9357 21.1875 15.1875 20.9357 15.1875 20.625V11.4C15.1875 11.3599 15.1875 11.3398 15.1894 11.3253C15.1956 11.278 15.2013 11.2634 15.2288 11.2245C15.2373 11.2125 15.2608 11.1871 15.3078 11.1361C15.6173 10.8009 16.742 10.0208 18.7891 9.6412C19.3604 9.53529 19.6953 9.4759 19.9465 9.47429C20.1491 9.473 20.2223 9.51014 20.2947 9.57051C20.3517 9.61805 20.4144 9.69031 20.4564 9.95267C20.5036 10.2481 20.5057 10.6545 20.5057 11.3071V13.3566C20.5057 13.7465 20.8262 14.0625 21.2216 14.0625C21.617 14.0625 21.9375 13.7465 21.9375 13.3566L21.9375 11.2554C21.9376 10.6705 21.9376 10.1512 21.8707 9.73283C21.7966 9.26902 21.6271 8.83286 21.2197 8.49287C20.8276 8.1657 20.396 8.05963 19.9372 8.06256C19.5411 8.06509 19.0771 8.15121 18.578 8.24383L18.5245 8.25375C16.8641 8.56162 15.6453 9.12408 14.8875 9.64815C14.743 9.74807 14.6708 9.79803 14.6013 9.79844C14.5318 9.79886 14.4594 9.75004 14.3145 9.6524C13.5418 9.13169 12.3219 8.57391 10.6658 8.26248Z"
                        fill="#005E2F"
                      />
                      <path
                        d="M19.9339 15.7904C20.1839 15.5404 20.3089 15.4154 20.4389 15.3403C20.7918 15.1366 21.2266 15.1366 21.5795 15.3403C21.7096 15.4154 21.8346 15.5404 22.0846 15.7904C22.3346 16.0404 22.4596 16.1654 22.5347 16.2955C22.7384 16.6484 22.7384 17.0832 22.5347 17.4361C22.4596 17.5661 22.3346 17.6911 22.0846 17.9411L18.8537 21.172C18.3581 21.6676 17.61 21.6878 16.9483 21.8293C16.4308 21.9399 16.1721 21.9953 16.0259 21.8491C15.8797 21.7029 15.9351 21.4442 16.0457 20.9267C16.1872 20.265 16.2074 19.5169 16.703 19.0213L19.9339 15.7904Z"
                        fill="#005E2F"
                      />
                    </svg>
                    <span className="">সহপাঠীদের হোমওয়ার্ক</span>
                  </h3>
                  {data.submissions
                    .filter((sub) => sub.user_id !== user.id)
                    .map((sub) => (
                      <HwsCard
                        setSuggestedReplies={setSuggestedReplies}
                        suggestedReplies={suggestedReplies}
                        isSolution={isSolution}
                        setIsSolution={setIsSolution}
                        key={sub.id}
                        submission={sub}
                        submitMarks={(marks) =>
                          handleSubmitMarks({ ...sub, ...marks })
                        }
                        handleDelete={(hwid) =>
                          handleDeleteSubmission(sub.id, hwid)
                        }
                      />
                    ))}
                </div>
              )}
            </>
          )
        ) : null
        // <div
        //   className={cn(
        //     data?.homework?.has_submitted
        //       ? "hidden"
        //       : data?.homework?.has_ended
        //         ? "hidden"
        //         : "grid",
        //     "gap-4 h-full my-auto pt-4"
        //   )}
        // >
        //   <div className="flex relative h-20 w-20 mx-auto justify-center items-center">
        //     <Image src="/icons/no-hw.png" alt="submission" fill />
        //   </div>
        //   <p className="text-center text-xl text-black">
        //     সহপাঠীদের হোমোয়ার্ক দেখতে চাইলে তোমাকে প্রথমে সাবমিট করতে হবে
        //   </p>
        //   <p className="text-center text-light">
        //     তুমি নিজে যদি আগে হোমওয়ার্ক জমা না দাও তাহলে সহপাঠীদের হোমওয়ার্ক
        //     দেখতে পাড়বে না
        //   </p>
        // </div>
      }

      {user.level !== 0 && user.role === "USER" && (
        <div
          className={cn(
            data?.homework?.has_submitted
              ? "hidden"
              : data?.homework?.has_ended
              ? "hidden"
              : "grid",
            "gap-4 h-full my-auto pt-4"
          )}
        >
          <div className="flex relative h-20 w-20 mx-auto justify-center items-center">
            <Image src="/icons/no-hw.png" alt="submission" fill />
          </div>
          <p className="text-center text-xl text-black">
            সহপাঠীদের হোমোয়ার্ক দেখতে চাইলে তোমাকে প্রথমে সাবমিট করতে হবে
          </p>
          <p className="text-center text-light">
            তুমি নিজে যদি আগে হোমওয়ার্ক জমা না দাও তাহলে সহপাঠীদের হোমওয়ার্ক
            দেখতে পাড়বে না
          </p>
        </div>
      )}

      {loading && <PostSkeleton />}
      {loading &&
        data?.submissions?.length === 0 &&
        Array.from({ length: 4 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      {hasMore && <div ref={loadMoreTrigger} className="h-10 w-full" />}
    </div>
  );
};
