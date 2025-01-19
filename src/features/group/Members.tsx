/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Tagtag,
  useUser
} from "@/components";
import {
  Check,
  Search,
  MoreVertical,
  Shield,
  UserMinus,
  Ban,
} from "lucide-react";
import React, { useState } from "react";
import { Club, Group } from "@/@types";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { levelArray, secondaryAPI } from "@/configs";
import axios, { AxiosError } from "axios";
import { handleError } from "@/hooks/error-handle";

export type Memberr = {
  user_id: string;
  role:
  | "MEMBER"
  | "GROUP_ADMIN"
  | "GROUP_MODERATOR"
  | "TEACHER"
  | "CLASS_TEACHER"
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "GENERAL_SECRETARY"
  | "CAPTAIN"
  | "VICE_CAPTAIN"
  | "CLUB_ADVISOR";
  name: string;
  school: string;
  level: number;
  image: string;
  institute_name?: string
};

type Props = {
  group: Group | Club;
  members: Memberr[];
  setMembers: (members: Memberr[]) => void;
  id: string;
  page: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  totalPages: number;
};

const GROUP_ROLES = {
  GROUP_ADMIN: "Group Admin",
  GROUP_MODERATOR: "Group Moderator",
  TEACHER: "Teacher",
  CLASS_TEACHER: "Class Teacher",
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  GENERAL_SECRETARY: "General Secretary",
  CAPTAIN: "Captain",
  VICE_CAPTAIN: "Vice Captain",
  MEMBER: "Member",
  CLUB_ADVISOR: "Club Advisor"
} as const;

export const MembersComponent = (props: Props) => {
  const { group, members, setMembers, id, page, setPage, searchQuery, setSearchQuery, totalPages } = props;
  const { toast } = useToast();
  const { user } = useUser()

  // const filteredMembers = members?.filter((member) =>
  //   member.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const handleRoleChange = async (
    memberId: string,
    role: keyof typeof GROUP_ROLES

  ) => {
    try {

      await axios.post(`${secondaryAPI}/api/group/${group?.id}/assign-role`, {
        role,
        userId: memberId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      const newMembers = members.map((m) => {
        if (m.user_id === memberId) {
          return { ...m, role: role };
        }
        return m;
      });
      setMembers(newMembers);
      toast({
        title: "Role Updated",
        description: `Member role updated to ${GROUP_ROLES[role]}`,
      });

    } catch (error) {
      handleError(error as AxiosError)
    }
  };

  const handleRemoveMember = (memberId: string) => {
    // TODO: Implement remove member logic
    toast({
      title: "Member Removed",
      description: `Member has been removed from the group ${memberId}`,
      variant: "destructive",
    });
  };

  const handleBanMember = (memberId: string) => {
    // TODO: Implement ban member logic
    toast({
      title: "Member Banned",
      description: "Member has been banned from the group",
      variant: "destructive",
    });
  };

  return (
    <div className="w-full min-h-screen z-0 dark:text-white text-black">


      {/* Members Section */}
      <div className="mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-semibold">
            Members ({group?.member_count})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 !h-10 bg-white !rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {members?.map((member) => (
            <div
              key={member.user_id}
              className="p-4 flex gap-3 items-center bg-white dark:bg-gray-800/50 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member?.image} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {member?.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </div>
              <div className="space-y-1 flex-1">
                <Link
                  href={`/users/${member.user_id}`}
                  className="flex items-center gap-2 font-medium hover:text-primary transition-colors duration-200"
                >
                  {member?.name}
                  <Tagtag tags={[member.role?.toUpperCase()]} />
                </Link>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member?.institute_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {levelArray[member.level]}
                  </p>
                </div>
                {/* {member.role && member.role !== "MEMBER" && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Shield className="h-3 w-3" />
                    {GROUP_ROLES[member.role as keyof typeof GROUP_ROLES] ||
                      member.role}
                  </span>
                )} */}
              </div>
              {user?.role !== "USER" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Roles Submenu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full">
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>Assign Role</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {member.role !== "MEMBER" &&
                              GROUP_ROLES[
                              member.role as keyof typeof GROUP_ROLES
                              ]}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[200px]">
                        {Object.entries(GROUP_ROLES).map(([key, value]) => (
                          <DropdownMenuItem
                            key={key}
                            onSelect={() =>
                              handleRoleChange(
                                member.user_id,
                                key as keyof typeof GROUP_ROLES
                              )
                            }
                            className={
                              member.role === key ? "bg-primary/10" : ""
                            }
                          >
                            <span>{value}</span>
                            {member.role === key && (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenuSeparator />


                    {/* Remove Member */}
                    <DropdownMenuItem
                      onSelect={() => handleRemoveMember(member.user_id)}
                      className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      <span>Remove from Group</span>
                    </DropdownMenuItem>


                    {/* Ban Member */}
                    <DropdownMenuItem
                      onSelect={() => handleBanMember(member.user_id)}
                      className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      <span>Ban Member</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-5">
          <Button disabled={page === 1} size="sm" className="bg-olive disabled:bg-light text-white !rounded-lg" onClick={() => setPage(page - 1)}>Previous</Button>
          <div className="text-sm text-gray-500 dark:text-gray-400">Page: {page} out of {totalPages}</div>
          <Button disabled={page === totalPages} size="sm" className="bg-olive disabled:bg-light text-white !rounded-lg" onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>
    </div>

  );
};
