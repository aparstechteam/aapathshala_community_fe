import { Club, Group } from "@/@types";
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
  ScrollArea,
  ScrollBar,
  useUser,
} from "@/components";
import { ValidImage } from "@/components/shared/ValidImage";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Router from "next/router";
import { useState } from "react";

type Props = {
  clubs: Club[];
  loading: boolean;
};

export function ClubLists(props: Props) {
  const { clubs, loading } = props;

  return (
    <div>
      <ScrollArea className="max-h-[360px]">
        <div className="divide-y divide-ash">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {clubs.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 py-2"
            >
              <div className="flex items-center gap-4">
                {c.image ? (
                  <Avatar className="!rounded-xl">
                    <AvatarImage src={c.image as string} alt={c.name} />
                    <AvatarFallback className="!rounded-xl dark:bg-gray-700/20 bg-elegant/10 pt-1">
                      ME
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <p className="p-2 rounded-xl text-elegant/50 bg-elegant/10">
                    {c.icon}
                  </p>
                )}
                <div className="space-y-1">
                  <Link
                    href={`/clubs/${c.slug}`}
                    className="font-semibold text-sm leading-none"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {c.member_count}{" "}
                    {Number(c?.member_count) > 1 ? " Members" : "Member"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

type Propss = {
  clubs: Club[] | Group[];
  loading: boolean;
  className?: string;
};

export function ClubListCard(props: Propss) {
  const { clubs, loading, className } = props;
  const { user } = useUser();

  const [goribOpen, setGoribOpen] = useState(false);
  const [commingsoonOpen, setCommingsoonOpen] = useState(false);

  function linkv(s: Club) {
    if (user?.is_paid) {
      return `/clubs/${s.slug}`;
    } else if (!s.is_paid) {
      return `/clubs/${s.slug}`;
    } else if (s.is_member) {
      return `/clubs/${s.slug}`;
    }
    return "#";
  }

  const gorib = (
    <Dialog open={goribOpen} onOpenChange={setGoribOpen}>
      <DialogContent className="max-w-[400px] bg-white dark:bg-neutral-950 p-5 text-black">
        <DialogHeader>
          <DialogTitle className="text-hot text-center">Attention!</DialogTitle>
        </DialogHeader>
        <div>
          <h2>এই গ্রুপে জয়েন হবার জন্যে, তোমাকে অবশ্যই কোর্সটি কিনতে হবে।</h2>
        </div>
        <DialogFooter>
          <Button
            size="sm"
            className="bg-hot/10 text-hot"
            onClick={() => Router.push("/profile?tab=courses")}
          >
            কোর্স অ্যাড করো
          </Button>
          <Button
            size="sm"
            className="bg-hot text-white"
            onClick={() => {
              Router.push(`https://aparsclassroom.com/shop`);
              setGoribOpen(false);
            }}
          >
            কোর্স কিনো
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const commingsoon = (
    <Dialog open={commingsoonOpen} onOpenChange={setCommingsoonOpen}>
      <DialogContent className="max-w-[400px] bg-white dark:bg-neutral-950 p-5 text-black">
        <DialogHeader>
          <DialogTitle className="text-black text-center">
            No Access
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <h2>
            দু:খিত, এই কোর্সে এখনো স্মার্ট কমিউনিটি এর এক্সেস দেয়া হয়নি।
          </h2>
          <h2>ধন্যবাদ</h2>
        </div>
        <DialogFooter>
          {/* <Button
            size="sm"
            className="bg-hot/10 text-hot"
            onClick={() => setGoribOpen(false)}
          >
            বাতিল
          </Button> */}
          <Button
            size="sm"
            className="bg-hot text-white"
            onClick={() => {
              setCommingsoonOpen(false);
            }}
          >
            ঠিকাছে
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div>
      {gorib}
      {commingsoon}
      <div
        className={cn(!className && "max-h-[360px] max-w-[340px]", className)}
      >
        <div className="divide-0 divide-ash grid dark:divide-ash/20 w-full">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {clubs.map((g) => (
            <div
              key={g.id}
              className="flex relative items-center justify-between gap-4 p-2 duration-300 hover:bg-hot/10 rounded-lg"
            >
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4 w-full">
                  <ValidImage
                    src={g.image as string}
                    alt={g.name}
                    className="!rounded-xl bg-elegant/10 !w-[40px] !h-[40px]"
                  />

                  <div className="flex flex-col gap-1 w-full">
                    <Link
                      href={
                        g.disabled
                          ? g.is_member
                            ? `/clubs/${g.slug}`
                            : "#"
                          : linkv(g as Club)
                      }
                      className="font-medium hover:text-hot duration-300 flex items-center gap-2 text-sm leading-none"
                    >
                      <span className="max-w-[220px]">{g.name}</span>
                    </Link>
                    <div className="flex items-center justify-between w-full gap-2">
                      <p className="text-xs text-muted-foreground">
                        {g.member_count || "0"}{" "}
                        {Number(g?.member_count) > 1 ? " Members" : "Member"}
                      </p>
                      <div>
                        {g?.is_member ? (
                          <p className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-hot/10 text-hot text-xs">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              stroke-linejoin="round"
                              className="lucide lucide-check h-3 w-3"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span className="pt-0.5 font-medium">Joined</span>
                          </p>
                        ) : g.disabled ? (
                          <span className="text-hot text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-hot/10">
                            <span>Inactive</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {g.disabled && !g.is_member && (
                <button
                  type="button"
                  onClick={() => {
                    setCommingsoonOpen(true);
                  }}
                  className="absolute right-0 top-0 w-full h-full"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
