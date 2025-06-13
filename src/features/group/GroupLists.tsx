import { Club, Group } from "@/@types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  ScrollArea,
  ScrollBar,
} from "@/components";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type Props = {
  groups: Group[] | Club[];
  loading: boolean;
  className?: string;
};

export function GroupLists(props: Props) {
  const { groups, loading, className } = props;

  return (
    <div>
      <ScrollArea className={cn(!className && "max-h-[360px]", className)}>
        <div className="divide-y divide-ash dark:divide-ash/20">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          {groups?.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between gap-2 sm:gap-4 py-2"
            >
              <div className="flex items-center gap-4 w-full">
                <Avatar className="!rounded-xl !p-0">
                  <AvatarImage src={g.image as string} alt={g.name} />
                  <AvatarFallback className="!rounded-xl text-white bg-hot/40">
                    GRP
                  </AvatarFallback>
                </Avatar>
                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="space-y-1 col-span-1 break-before-auto md:!w-full">
                    <Link
                      href={g.disabled ? "#" : `/clubs/${g.slug}`}
                      className="font-medium text-sm leading-none"
                    >
                      {g.name}
                    </Link>
                  </div>
                  <div className="flex col-span-1 items-center gap-2 justify-between">
                    <p className="text-xs text-muted-foreground">
                      {g.member_count}{" "}
                      {Number(g?.member_count) > 1 ? " Members" : "Member"}
                    </p>
                    {g.disabled && (
                      <Badge className="ml-auto !bg-hot/20 text-hot">
                        {"Locked"}
                      </Badge>
                    )}
                    {g.is_member && (
                      <Badge className="ml-auto !bg-hot/20 text-hot">
                        {"Joined"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
