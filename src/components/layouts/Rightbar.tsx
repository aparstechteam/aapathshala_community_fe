import { ActiveUsers, TopSolvers } from "@/features";
import React, { useEffect, useState } from "react";

import { GraduationCap, Info } from "lucide-react";
import axios, { AxiosError } from "axios";
import { LeaderboardEntry, Pagination, Teacher, UserData } from "@/@types";
import { ScrollArea, ScrollBar } from "../ui";
import Image from "next/image";
import { months } from "@/data/months";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import Link from "next/link";
import { useUser } from "../contexts";

export const Rightbar = () => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth()
  );
  const [data, setData] = useState<{
    leaderboard: LeaderboardEntry[] | [];
    pagination: Pagination;
    first_3: LeaderboardEntry[] | [];
  }>();

  const { user } = useUser();
  const [activeUsers, setActiveUsers] = useState<UserData[]>([]);

  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const currentMonth = months[currentMonthIndex];

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${secondaryAPI}/api/utils/leaderboard`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            params: {
              monthYear: currentMonth,
              limit: 8,
              page: page,
            },
          }
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        handleError(err as AxiosError, () => getLeaderboard());
      }
    };
    getLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, page]);

  const nextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setCurrentMonthIndex((prev: number) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex((prev: number) => prev - 1);
    }
  };

  useEffect(() => {
    async function getActiveUsers() {
      try {
        const response = await axios.get(`${secondaryAPI}/api/active/list`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.data.length > 0) {
          setActiveUsers(response.data);
        }
      } catch (err) {
        handleError(err as AxiosError, () => getActiveUsers());
      }
    }
    getActiveUsers();
  }, []);

  return (
    <div className="min-w-[350px] py-4">
      <div className="grid gap-4 p-1">
        <div className="p-3 bg-white dark:bg-gray-900/40 !border-0 ring-1 rounded-xl shadow ring-ash dark:ring-ash/20 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-start flex items-center gap-3 py-2">
              <span className="font-semibold pt-1 px-2 text-black/80 dark:text-white">
                টপ কন্ট্রিবিউটরস্
              </span>
            </h2>
            <Link href={`/leaderboard/points?uid=${user?.id}`}>
              <Info size={16} />
            </Link>
          </div>
          {!!data?.leaderboard && (
            <TopSolvers
              nextMonth={nextMonth}
              prevMonth={prevMonth}
              currentMonthIndex={currentMonthIndex}
              currentMonth={currentMonth}
              data={
                data as {
                  leaderboard: LeaderboardEntry[] | [];
                  pagination: Pagination;
                  first_3: LeaderboardEntry[] | [];
                }
              }
              page={page}
              setPage={setPage}
              loading={loading}
            />
          )}
        </div>

        <ActiveUsers users={activeUsers} setUsers={setActiveUsers} />
      </div>
    </div>
  );
};

export const TeachersLists = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const TEACHERS_PER_SLIDE = 3;
  const SCROLL_SPEED = 16; // seconds for one complete rotation

  useEffect(() => {
    async function getTeachers() {
      try {
        const cachedData = localStorage.getItem(`teachers`);
        if (cachedData) {
          setTeachers(JSON.parse(cachedData));
          return;
        }
        // const response = await axios.get(`${secondaryAPI}/api/utils/teachers`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        //   }
        // });
        // setTeachers(response.data);
        // localStorage.setItem(`teachers`, JSON.stringify(response.data));
      } catch {
        // handleError(err as AxiosError)
      }
    }
    getTeachers();
  }, []);

  // Clone teachers array to create seamless loop
  const extendedTeachers = [...teachers, ...teachers, ...teachers];

  return (
    <div className="p-4 hidden bg-white dark:bg-gray-900/40 !border-0 ring-1 rounded-xl shadow ring-ash dark:ring-purple-700/50 backdrop-blur-sm">
      <h2 className="text-start flex items-center gap-3 mb-4">
        <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <GraduationCap />
        </span>
        <span className="font-semibold pt-1 text-rose-600 dark:text-rose-400">
          টিচার্স লিস্ট
        </span>
      </h2>

      <div className="relative group">
        <ScrollArea className="w-[300px] pb-3">
          <div className="overflow-hidden">
            <div
              className="flex transition-all duration-1000 ease-linear"
              style={{
                animation: `scroll ${SCROLL_SPEED}s linear infinite`,
              }}
            >
              {extendedTeachers.map((teacher, index) => (
                <div
                  key={`${teacher.id}-${index}`}
                  className="flex flex-col items-center gap-2.5"
                  style={{
                    width: `${300 / TEACHERS_PER_SLIDE}px`,
                    flexShrink: 0,
                  }}
                >
                  <div className="relative p-1">
                    {teacher?.profilePic && (
                      <Image
                        height={75}
                        width={75}
                        className="rounded-full cursor-pointer ring-2 ring-rose-500/70 hover:ring-rose-500/50 transition-all duration-300"
                        src={teacher?.profilePic as string}
                        alt="Profile"
                      />
                    )}
                    <span className="absolute bottom-1.5 right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-gray-100 dark:border-gray-900"></span>
                  </div>
                  <span
                    className="text-xs font-medium text-gray-600/90 dark:text-gray-300/90 truncate w-full 
                text-center group-hover/item:text-rose-600 dark:group-hover/item:text-rose-400 
                transition-colors duration-300"
                  >
                    {teacher.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};
