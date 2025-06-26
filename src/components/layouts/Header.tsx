import React, { useEffect, useState } from "react";
import { NotificationIcon } from "../shared";
import {
  Button,
  floorNumberD,
  fromNow,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  useUser,
} from "@/components";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Bookmark,
  LayoutDashboard,
  Loader2,
  LoaderCircle,
  LogOut,
  Logs,
  UserRound,
  WandSparkles,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import Router, { useRouter } from "next/router";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "../theme/toggleTheme";
import { Notification } from "@/@types";
import { useToast } from "@/hooks/use-toast";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import Cookies from "js-cookie";
import { navItems } from "@/data/navItems";
import { ValidImage } from "../shared/ValidImage";
import Image from "next/image";

export const Header = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingNotifications, setLoadingNotifications] =
    useState<boolean>(false);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [batchName, setBatchName] = useState<string>("");

  useEffect(() => {
    const batch = localStorage.getItem("hsc_batch");
    if (batch) {
      setBatchName(batch);
    }
  }, []);

  async function handleLogout() {
    try {
      setLoading(true);
      await axios.post(
        `${secondaryAPI}/api/auth/logout`,
        {
          refreshToken: localStorage.getItem("refreshToken"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      localStorage.clear();
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user_session");
      
      setTimeout(() => {
        Router.push("https://guidelinebox.com/signin/google");
      }, 1000);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
      // handleError(err as AxiosError, handleLogout);
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchQuery) {
      Router.push(`/search?q=${searchQuery}`);
    }
  }

  useEffect(() => {
    async function getNotifications() {
      try {
        if (user?.id) {
          setLoadingNotifications(true);
          const res = await axios.get(`${secondaryAPI}/api/notification`, {
            // withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          setAllNotifications(res.data);
          setLoadingNotifications(false);
        }
      } catch (err) {
        setLoadingNotifications(false);
        handleError(err as AxiosError, getNotifications);
      }
    }
    async function getCounts() {
      try {
        const res = await axios.get(`${secondaryAPI}/api/notification/count`, {
          // withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        });
        setNotificationCount(res.data);
      } catch (err) {
        setLoadingNotifications(false);
        handleError(err as AxiosError);
      }
    }

    getCounts();

    getNotifications();
  }, [user, success]);

  async function handleRead(id: string, link: string) {
    try {
      await axios.post(
        `${secondaryAPI}/api/notification/mark-as-read`,
        { notificationId: id },
        {
          headers: {
            "X-Key-Id": user?.id as string,
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess(true);
      toast({
        title: "Marked as read",
        description: "Notification has been marked as read",
      });
      setTimeout(() => {
        const l = link.split("/");
        Router.push(`/post/${l[2]}`);
      }, 1000);
    } catch (err) {
      setLoadingNotifications(false);
      handleError(err as AxiosError, () => handleRead(id, link));
    }
  }

  return (
    <div className="!z-20 relative">
      <header className="dark:bg-gray-900 min-h-[75px] bg-white lg:dark:bg-black/25 lg:bg-white/75 backdrop-blur-lg grid items-center w-full fixed border-b dark:border-gray-800 border-gray-200">
        <div className="lg:px-10 px-2 py-2 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-10">
            {/* <Logo2 size="md" /> */}
            <Link href="/">
              <Image src="/logo.png" alt="acs-logo" width={120} height={56} />
            </Link>
          </div>

          <div className="flex items-center justify-end gap-6 lg:gap-5">
            <form onSubmit={handleSearch} className="relative hidden">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="1.5em"
                  height="1.5em"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.90039 10C5.90039 7.23858 8.13897 5 10.9004 5C13.6618 5 15.9004 7.23858 15.9004 10C15.9004 12.7614 13.6618 15 10.9004 15C8.13897 15 5.90039 12.7614 5.90039 10ZM10.9004 3C7.0344 3 3.90039 6.13401 3.90039 10C3.90039 13.866 7.0344 17 10.9004 17C12.4727 17 13.924 16.4816 15.0926 15.6064L20.1933 20.7071C20.5838 21.0976 21.217 21.0976 21.6075 20.7071C21.998 20.3166 21.998 19.6834 21.6075 19.2929L16.5068 14.1922C17.382 13.0236 17.9004 11.5723 17.9004 10C17.9004 6.13401 14.7664 3 10.9004 3Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                placeholder="পোস্ট অথবা তোমার বন্ধুকে খুঁজে নাও..."
                className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-200 rounded-full pl-10 pr-4 py-2.5 w-[350px] 
                border border-gray-200 dark:border-gray-700/50 
                hover:border-hot/30
                focus:border-hot/50 focus:ring-2 focus:ring-hot/20 
                focus:outline-none transition-all duration-300 
                placeholder:text-gray-500 placeholder:text-sm"
              />
            </form>

            <div className="xl:hidden flex gap-5 items-center px-3">
              <Link
                className={cn(
                  router.pathname === "/notification" &&
                    "text-hot border-b-2 border-b-hot",
                  "text-center py-2 flex justify-center duration-300"
                )}
                href="/notification"
              >
                <p className="relative cursor-pointer !p-0 flex">
                  {router.pathname !== "/notification" ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 21"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.0002 0.160034C5.85804 0.160034 2.50017 3.5179 2.50017 7.66003V11.6624L0.893001 15.6841C0.790407 15.9409 0.821819 16.2318 0.976854 16.4607C1.13189 16.6896 1.39036 16.8267 1.66683 16.8267H6.66683C6.66683 18.674 8.1529 20.16 10.0002 20.16C11.8474 20.16 13.3335 18.674 13.3335 16.8267H18.3335C18.61 16.8267 18.8684 16.6896 19.0235 16.4607C19.1785 16.2318 19.2099 15.9409 19.1073 15.6841L17.5002 11.6624V7.66003C17.5002 3.5179 14.1423 0.160034 10.0002 0.160034ZM11.6668 16.8267C11.6668 17.7535 10.9269 18.4934 10.0002 18.4934C9.07337 18.4934 8.33349 17.7535 8.33349 16.8267H11.6668ZM4.16684 7.66003C4.16684 4.43837 6.77851 1.8267 10.0002 1.8267C13.2218 1.8267 15.8335 4.43837 15.8335 7.66003V11.8227C15.8335 11.9286 15.8537 12.0336 15.893 12.1319L17.1031 15.16H2.89726L4.10734 12.1319C4.14665 12.0336 4.16684 11.9286 4.16684 11.8227V7.66003Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 17.96 19.5"
                    >
                      <path
                        fill="currentColor"
                        d="M11,16.5v.15a1.5,1.5,0,0,1-3-.15Z"
                        transform="translate(-0.52)"
                      />
                      <path
                        fill="currentColor"
                        d="M15.5,11.91,16.85,15H2.16L3.5,11.91V7.5a6,6,0,0,1,12-.22v4.63Z"
                        transform="translate(-0.52)"
                      />
                      <path
                        fill="currentColor"
                        d="M11,16.65V16.5H8a1.5,1.5,0,0,0,3,.15ZM15.5,7.28a6,6,0,0,0-12,.22v4.41L2.16,15H16.85L15.5,11.91V7.28Zm-3,9.22a3,3,0,0,1-6,.18V16.5H1.77a1.34,1.34,0,0,1-.49-.1,1.25,1.25,0,0,1-.65-1.65L2,11.59V7.5a7.5,7.5,0,0,1,15-.25v4.34l1.38,3.16a1.26,1.26,0,0,1-1.15,1.75Z"
                        transform="translate(-0.52)"
                      />
                    </svg>
                  )}

                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 pt-0.5 bg-rose-400 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </p>
              </Link>
              <Link href="/search">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.90039 10C5.90039 7.23858 8.13897 5 10.9004 5C13.6618 5 15.9004 7.23858 15.9004 10C15.9004 12.7614 13.6618 15 10.9004 15C8.13897 15 5.90039 12.7614 5.90039 10ZM10.9004 3C7.0344 3 3.90039 6.13401 3.90039 10C3.90039 13.866 7.0344 17 10.9004 17C12.4727 17 13.924 16.4816 15.0926 15.6064L20.1933 20.7071C20.5838 21.0976 21.217 21.0976 21.6075 20.7071C21.998 20.3166 21.998 19.6834 21.6075 19.2929L16.5068 14.1922C17.382 13.0236 17.9004 11.5723 17.9004 10C17.9004 6.13401 14.7664 3 10.9004 3Z"
                    fill="currentColor"
                  />
                </svg>
              </Link>
            </div>

            <div className={cn("max-h-12 hidden xl:flex")}>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative cursor-pointer !p-0 hidden lg:flex text-hot dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 !shadow-none transition-colors">
                    <svg
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.0002 0.160034C5.85804 0.160034 2.50017 3.5179 2.50017 7.66003V11.6624L0.893001 15.6841C0.790407 15.9409 0.821819 16.2318 0.976854 16.4607C1.13189 16.6896 1.39036 16.8267 1.66683 16.8267H6.66683C6.66683 18.674 8.1529 20.16 10.0002 20.16C11.8474 20.16 13.3335 18.674 13.3335 16.8267H18.3335C18.61 16.8267 18.8684 16.6896 19.0235 16.4607C19.1785 16.2318 19.2099 15.9409 19.1073 15.6841L17.5002 11.6624V7.66003C17.5002 3.5179 14.1423 0.160034 10.0002 0.160034ZM11.6668 16.8267C11.6668 17.7535 10.9269 18.4934 10.0002 18.4934C9.07337 18.4934 8.33349 17.7535 8.33349 16.8267H11.6668ZM4.16684 7.66003C4.16684 4.43837 6.77851 1.8267 10.0002 1.8267C13.2218 1.8267 15.8335 4.43837 15.8335 7.66003V11.8227C15.8335 11.9286 15.8537 12.0336 15.893 12.1319L17.1031 15.16H2.89726L4.10734 12.1319C4.14665 12.0336 4.16684 11.9286 4.16684 11.8227V7.66003Z"
                        fill="#757575"
                      />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-rose-400 text-white text-xs rounded-full min-w-4 h-4 flex items-center justify-center">
                        <text className="px-1">
                          {floorNumberD(notificationCount)}
                        </text>
                      </span>
                    )}
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  align="center"
                  className="lg:w-[350px] mr-10 w-full relative z-[99] mt-4 !p-4 bg-white dark:!bg-gray-900/95 backdrop-blur-lg !border-1 shadow dark:border-purple-700/50 border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-lg py-2 font-semibold text-gray-700 dark:text-gray-200">
                    <NotificationIcon type="default" />
                    নোটিফিকেশন
                  </div>
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="grid divide-y dark:divide-gray-800 divide-gray-200">
                        {allNotifications?.map((x: Notification) => (
                          <div
                            key={x?.id}
                            className="flex items-center gap-2 py-2"
                          >
                            <div>
                              <NotificationIcon type={x?.type} />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleRead(x?.id, x?.link)}
                                className={cn(
                                  !x.read_status && "font-semibold",
                                  x.read_status && "font-normal",
                                  "text-gray-700 text-start outline-none focus:outline-none ring-0 focus:ring-0 border-none focus:border-none dark:text-gray-200 text-sm"
                                )}
                              >
                                {x?.message}
                              </button>
                              <p className="text-xs dark:text-gray-400 text-light">
                                {fromNow(new Date(x?.created_at))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link
                        className="flex items-center justify-center gap-2 text-sm text-hot dark:text-gray-200"
                        href="/notification"
                      >
                        আরও দেখুন
                      </Link>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* My profile */}
            <div className={cn(!user?.image && "", "max-h-12 hidden xl:block")}>
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger
                  asChild
                  onClick={() => setMenuOpen(!setMenuOpen)}
                >
                  <p className="relative w-10 h-10">
                    <ValidImage
                      size="md"
                      height={40}
                      width={40}
                      className="rounded-full w-10 h-10 cursor-pointer ring-2 ring-hot/70 hover:ring-hot/50 transition-all duration-300"
                      src={user?.image as string}
                      alt="My Profile"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-hot rounded-full border-2 border-gray-200 dark:border-gray-900"></span>
                  </p>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[240px] relative z-[99] mt-4 !p-2 bg-white dark:!bg-gray-900/95 backdrop-blur-lg !border-1 shadow dark:border-purple-700/50 border-gray-200 rounded-xl"
                >
                  <div className="grid gap-4 divide-y dark:divide-gray-800 divide-gray-200">
                    <div className="space-y-2 px-2 py-1">
                      <h4 className="font-medium text-gray-400 text-sm dark:text-gray-400">
                        Signed in as
                      </h4>
                      <h4 className="font-semibold text-rose-600 dark:text-rose-400">
                        {user?.name}
                      </h4>
                    </div>
                    <div className="grid gap-1 pt-3">
                      <Link
                        className="flex items-center gap-2 px-2 py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                        href="/profile"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link
                        className="flex items-center gap-2 px-2 py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                        href="/profile"
                      >
                        <Logs size={16} /> My Posts
                      </Link>
                      <Link
                        className="flex items-center gap-2 px-2 py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                        href="/saved"
                      >
                        <Bookmark size={16} /> Saved Posts
                      </Link>
                      <Link
                        className="flex items-center gap-2 px-2 py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                        href="/feature-request"
                      >
                        <WandSparkles size={16} /> Feedback
                      </Link>
                      <div
                        className={cn(
                          user.role === "USER" ? "hidden" : "block"
                        )}
                      >
                        <Select
                          value={batchName || user?.hsc_batch}
                          onValueChange={(value) => {
                            localStorage.setItem("hsc_batch", value);
                            if (batchName !== value) {
                              setBatchName(value);
                              router.reload();
                            }
                          }}
                        >
                          <SelectTrigger className="flex items-center justify-start gap-2 px-2 py-2 !border-0 hover:bg-gray-100 !rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400">
                            <h2 className="flex items-center text-base gap-2">
                              <UserRound size={16} />
                              <span>Switch Batch</span>
                            </h2>
                          </SelectTrigger>
                          <SelectContent className="z-[9999] relative !bg-ash/40 grid gap-2">
                            <SelectItem value="HSC 25">HSC 25</SelectItem>
                            <SelectItem value="HSC 26">HSC 26</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-1 pt-3">
                      <ThemeToggle
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center !outline-none !ring-0 !shadow-none !justify-start text-start gap-2 !px-2 !py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                      />
                      <Button
                        onClick={handleLogout}
                        className="flex items-center !shadow-none !justify-start text-start gap-2 !px-2 !py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        {loading ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <LogOut size={16} />
                        )}
                        Logout
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Mobile Links */}
        <div className="grid text-light grid-cols-5 justify-around xl:hidden">
          {navItems.slice(0, 4).map((x) => (
            <Link
              key={x?.label}
              className={cn(
                router.pathname === x.link &&
                  "text-hot border-b-2 border-b-hot",
                "text-center py-2 flex justify-center duration-300"
              )}
              href={x.link}
            >
              {x.link !== router.pathname ? x.icon.selected : x.icon.unselected}
            </Link>
          ))}

          <div className="xl:hidden flex justify-center">
            <MobileMenu loading={loading} handleLogout={handleLogout} />
          </div>
        </div>
      </header>
    </div>
  );
};
