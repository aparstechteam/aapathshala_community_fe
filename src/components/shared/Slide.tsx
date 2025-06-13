import * as React from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Post } from "@/@types";
import Image from "next/image";
import { fromNow } from "../utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Router from "next/router";
import { PinOff } from "lucide-react";
import { useUser } from "../contexts";
import { ValidImage } from "./ValidImage";
import { Tagtag } from "./Tagtag";
import dynamic from "next/dynamic";
const AppMath = dynamic(() => import("../../components/contexts/MathJAX"), {
  ssr: false,
});

export function PinnedPosts({
  posts,
  unpin,
}: {
  posts: Post[];
  unpin: (id: string) => void;
}) {
  const { user } = useUser();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="max-w-[90vw] lg:max-w-[calc(100vw-56vw)]">
      <Carousel setApi={setApi}>
        <CarouselContent className="-ml-1">
          {posts.slice(0, 5).map((x, index) => (
            <CarouselItem
              onClick={(e) => {
                e.preventDefault();
                Router.push(`/post/${x.id}`);
              }}
              key={index}
              className={cn(
                "pl-1 relative cursor-pointer hover:scale-95 transition-all duration-300",
                posts.length === 1 && "lg:basis-full",
                posts.length > 1 && "lg:basis-1/2"
              )}
            >
              <div className="p-4 h-[350px] content-between grid bg-white ring-1 ring-ash scale-95 dark:bg-gray-800 rounded-lg">
                <div className="grid gap-2 h-full w-full max-w-[350px]">
                  <div className="flex gap-2 items-center p-1">
                    <div>
                      <div className="rounded-full w-[38px] h-[38px]">
                        <ValidImage
                          height={38}
                          width={38}
                          className="rounded-full ring-1 ring-elegant/40 !h-[38px] !w-[38px] cursor-pointer"
                          src={x.user?.image as string}
                          alt="Profile"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-2 w-full">
                      <div>
                        <h2 className="text-base font-medium text-gray-600 dark:text-gray-200">
                          {x.user?.name}

                          <span className="scale-90">
                            <Tagtag tags={x.tags} />
                          </span>
                        </h2>
                        <h2 className="text-xs font-light text-gray-500 dark:text-gray-200">
                          {fromNow(new Date(x.createdAt))}
                        </h2>
                      </div>
                      {user?.role === "ADMIN" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            unpin(x.id);
                          }}
                          className="hover:bg-hot z-10  hover:text-white duration-300 bg-hot/20 text-hot p-1.5 rounded-lg"
                        >
                          <PinOff className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-200 pb-2 overflow-hidden">
                      <AppMath
                        formula={
                          x.body.slice(0, 100) +
                          (x.body.length > 100 ? "..." : "")
                        }
                      />
                    </p>

                    {!!x?.image ? (
                      <div className="relative h-[150px] w-full mx-auto">
                        <Image
                          src={x?.image}
                          fill
                          alt="post-image"
                          className="object-cover md:rounded-lg bg-ash dark:bg-gray-800"
                        />
                      </div>
                    ) : (
                      x.images.length > 0 && (
                        <div className="relative h-[150px] w-full mx-auto">
                          <Image
                            src={x?.images[0]}
                            fill
                            alt="post-image"
                            className="object-cover md:rounded-lg bg-ash dark:bg-gray-800"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex px-4 md:px-0 justify-between items-center gap-2">
                    <div className="flex items-center w-full justify-between gap-5">
                      <div className="rounded-md gap-2 flex justify-center items-center text-sm font-medium shadow-none !text-gray-900 dark:!text-white">
                        <span className="">
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
                        <span className="pt-1">
                          {x?.reactions.length || 0} রিয়েক্ট
                        </span>
                      </div>

                      <Link
                        className="rounded-md flex gap-2 justify-center items-center text-sm font-medium shadow-none !transition-opacity !text-gray-900 dark:!text-white"
                        href={`/post/${x.id}`}
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
                            stroke="#575757"
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9.9961 10H10.0036M13.3257 10H13.3332M6.6665 10H6.67398"
                            stroke="#575757"
                            strokeWidth="1.66667"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="pt-1">{x.commentCount} কমেন্ট</span>
                      </Link>

                      <button
                        type="button"
                        className="rounded-md flex gap-2 items-center shadow-none duration-300 !transition-opacity !text-gray-900 dark:!text-white"
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
                            stroke="#575757"
                            strokeWidth="1.25"
                          />
                          <path
                            d="M9.5835 10.4167L12.5002 7.5"
                            stroke="#575757"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="pt-1">{x.shareCount} শেয়ার</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="py-3 flex justify-center items-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 duration-300 bg-gray-300 dark:bg-ash rounded-full",
              current === index + 1 && "bg-rose-500"
            )}
          ></div>
        ))}
      </div>
    </div>
  );
}
