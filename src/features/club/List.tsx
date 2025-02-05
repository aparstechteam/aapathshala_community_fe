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
          <h2>
            এই গ্রুপে জয়েন হবার জন্যে, তোমাকে অবশ্যই কোর্সটি কিনতে হবে।
          </h2>
        </div>
        <DialogFooter>
          <Button
            size="sm"
            className="bg-hot/10 text-hot"
            onClick={() => Router.push('/profile?tab=courses')}
          >
            কোর্স অ্যাড করো
          </Button>
          <Button
            size="sm"
            className="bg-olive text-white"
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
            className="bg-olive text-white"
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
      <div className={cn(!className && "max-h-[360px] max-w-[340px]", className)}>
        <div className="divide-y-0 divide-ash grid dark:divide-ash/20">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {clubs.map((g) => (
            <div
              key={g.id}
              className="flex relative items-center justify-between gap-4 py-2"
            >
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-4">
                  <ValidImage
                    src={g.image as string}
                    alt={g.name}
                    className="!rounded-xl bg-elegant/10 !w-[40px] !h-[40px]"
                  />

                  <div className="grid gap-1">
                    <Link
                      href={g.disabled ? g.is_member ? `/clubs/${g.slug}` : "#" : linkv(g as Club)}
                      className="font-medium flex items-center gap-2 text-sm leading-none"
                    >
                      <span className="max-w-[220px]">{g.name}</span>
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      {g.member_count || "0"}{" "}
                      {Number(g?.member_count) > 1 ? " Members" : "Member"}
                    </p>
                  </div>
                </div>
                <div>
                  {g?.is_member ? (
                    <p className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-olive/10 text-olive text-xs">
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
                  ) : (g?.is_eligiable && (
                    <p className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-elegant/10 text-elegant text-xs">
                      <span className="pt-0.5 font-medium">Paid</span>
                      <span>
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 21 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14.875 7.5V5.44375C14.8733 4.33201 14.431 3.26627 13.6449 2.48015C12.8587 1.69402 11.793 1.25165 10.6813 1.25H10.3187C9.20701 1.25165 8.14127 1.69402 7.35515 2.48015C6.56902 3.26627 6.12665 4.33201 6.125 5.44375V7.5C5.62772 7.5 5.15081 7.69754 4.79917 8.04917C4.44754 8.40081 4.25 8.87772 4.25 9.375V15.1875C4.25165 16.1318 4.62752 17.037 5.29526 17.7047C5.963 18.3725 6.86817 18.7483 7.8125 18.75H13.1875C14.1318 18.7483 15.037 18.3725 15.7047 17.7047C16.3725 17.037 16.7483 16.1318 16.75 15.1875V9.375C16.75 8.87772 16.5525 8.40081 16.2008 8.04917C15.8492 7.69754 15.3723 7.5 14.875 7.5ZM7.375 5.44375C7.375 4.66302 7.68514 3.91426 8.2372 3.3622C8.78926 2.81014 9.53802 2.5 10.3187 2.5H10.6813C11.462 2.5 12.2107 2.81014 12.7628 3.3622C13.3149 3.91426 13.625 4.66302 13.625 5.44375V7.5H7.375V5.44375ZM15.5 15.1875C15.5 15.8008 15.2564 16.389 14.8227 16.8227C14.389 17.2564 13.8008 17.5 13.1875 17.5H7.8125C7.19919 17.5 6.61099 17.2564 6.17732 16.8227C5.74364 16.389 5.5 15.8008 5.5 15.1875V9.375C5.5 9.20924 5.56585 9.05027 5.68306 8.93306C5.80027 8.81585 5.95924 8.75 6.125 8.75H14.875C15.0408 8.75 15.1997 8.81585 15.3169 8.93306C15.4342 9.05027 15.5 9.20924 15.5 9.375V15.1875Z"
                            fill="currentColor"
                          />
                          <path
                            d="M11.125 12.9502V15.0002C11.125 15.166 11.0592 15.3249 10.9419 15.4421C10.8247 15.5594 10.6658 15.6252 10.5 15.6252C10.3342 15.6252 10.1753 15.5594 10.0581 15.4421C9.94085 15.3249 9.875 15.166 9.875 15.0002V12.9502C9.6367 12.8126 9.45045 12.6003 9.34515 12.346C9.23985 12.0918 9.22137 11.8099 9.29259 11.5442C9.36381 11.2784 9.52074 11.0435 9.73905 10.876C9.95735 10.7085 10.2248 10.6177 10.5 10.6177C10.7752 10.6177 11.0426 10.7085 11.261 10.876C11.4793 11.0435 11.6362 11.2784 11.7074 11.5442C11.7786 11.8099 11.7602 12.0918 11.6549 12.346C11.5495 12.6003 11.3633 12.8126 11.125 12.9502Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </p>
                  )
                  )}
                </div>
              </div>
              {/* {g.is_eligible && !g.is_member && (
                <button
                  type="button"
                  onClick={() => {
                    setGoribOpen(true);
                  }}
                  className="absolute right-0 top-0 w-full h-full"
                />
              )} */}

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
