/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { UserData } from "@/@types";
import { Button, useUser } from "@/components";
import { ValidImage } from "@/components/shared/ValidImage";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { Loader2, UserPlus, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

type Props = {
  users: UserData[];
  setUsers: (users: UserData[]) => void;
};

export const ActiveUsers = (props: Props) => {
  const { users, setUsers } = props;
  const { user } = useUser();
  const [followLoading, setFollowLoading] = useState(false);


  const toggleFollow = async (id: string) => {
    // if (isFollowing) return;

    setFollowLoading(true);
    try {
      const res = await axios.post(
        `${secondaryAPI}/api/follow`,
        {
          followingId: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(res.data);
      setFollowLoading(false);
      const newUser = users.map((a) =>
        a.id === id ? { ...a, isFollowing: !a.isFollowing } : a
      );
      toast({
        title: "Followed",
        description: "You are now following this user",
        variant: "default",
      });
      setUsers(newUser);
    } catch (error) {
      setFollowLoading(false);
      handleError(error as AxiosError, () => toggleFollow(id));
    }
  };

  return users.length > 0 ? (
    <div className="grid p-3 ring-1 rounded-xl ring-ash bg-white dark:bg-neutral-950 dark:ring-ash/10">
      <h2 className="text-start flex items-center gap-3 mb-2">
        <span className="font-semibold pt-1 text-black/80 dark:text-white px-2">
          অ্যাক্টিভ সদস্যগণ
        </span>
      </h2>
      {users?.map((x) => {
        return (
          <div
            key={x.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
          >
            <div className="relative w-10 h-10">
              <ValidImage
                size="md"
                src={x?.image as string}
                alt="Profile"
                height={40}
                width={40}
                className="rounded-full cursor-pointer h-10 w-10 ring-2 ring-green-500/70 hover:ring-green-500/50 transition-all duration-300"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-100 dark:border-gray-900"></span>
            </div>
            <Link
              href={`/users/${x.id}`}
              className="flex max-w-[200px] flex-col"
            >
              <p className="flex items-center gap-2">
                <span className="text-sm capitalize truncate font-medium dark:text-gray-200">
                  {x.name}
                </span>
                {!!x?.role && (
                  <span className="text-xs font-medium px-3 h-4 flex items-center text-center bg-olive/20 text-olive pt-0.5 rounded-full capitalize">
                    {x?.role?.toLowerCase()}
                  </span>
                )}
              </p>
              <span className="text-xs w-[200px] truncate dark:text-gray-400">
                {x.institute_name}
              </span>
            </Link>
            <div>
              <button
                onClick={() => toggleFollow(x.id)}
                className={cn(x.id === user.id && 'hidden',
                  "!rounded-lg py-1 px-2",
                  x.isFollowing ? "text-olive" : "text-black"
                )}
              >
                {followLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (x.isFollowing ? (
                  <UserRoundCheck size={16} />
                ) : (
                  <UserPlus size={16} />
                ))}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  ) : null;
};
