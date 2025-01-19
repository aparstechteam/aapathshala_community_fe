/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { BookIcon, Loader2 } from "lucide-react";

import { ClubListCard, Shortcuts } from "@/features";
import { SubjectName, subjectIcons } from "@/data";
import { Club } from "@/@types";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import { useUser } from "../contexts";


type Props = {
  selectedSubject?: string
  setSelectedSubject?: (subject: string) => void
}

export const Sidebar = (props: Props) => {
  const { user } = useUser();
  const [groups, setGroups] = useState<Club[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getClubs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${secondaryAPI}/api/group?group_type=CLUB`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (response.data.groups.length > 0) {
          setClubs(response.data.groups);
          // localStorage.setItem('clubs', JSON.stringify(response.data.groups));
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        handleError(err as AxiosError, () => getClubs())
      }
    };

    getClubs();
  }, []);

  useEffect(() => {
    const getGroups = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${secondaryAPI}/api/group/mygroups`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (response.data.groups.length > 0) {
          setGroups(response.data.groups);
          // localStorage.setItem('groups', JSON.stringify(response.data.groups));
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        handleError(err as AxiosError, () => getGroups())
      }
    };

    getGroups();
  }, []);

  return (
    <div className="min-w-[350px] py-4 relative z-20">
      <div className="grid gap-4 p-1">

        <Shortcuts />

        {loading ? (
          <div className="w-full h-10 flex justify-center items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            {groups.length > 0 && (
              <div className="flex w-[340px] flex-col gap-2 p-4 rounded-xl ring-1 ring-ash dark:ring-ash/20 bg-white dark:bg-neutral-950">
                <h2 className='font-semibold'>
                  {user.level === 0 ? 'গ্রুপ সমূহ' : 'প্রিমিয়াম গ্রুপ সমূহ'}
                </h2>
                <ClubListCard className="h-full !max-w-[340px]" clubs={groups} loading={loading} />
              </div>
            )}

            {clubs.length > 0 && (
              <div className="flex w-[340px] flex-col gap-2 p-4 rounded-xl ring-1 ring-ash dark:ring-ash/20 bg-white dark:bg-neutral-950">
                <h2 className='font-semibold'>ক্লাব সমূহ</h2>
                <ClubListCard className="h-full !max-w-[340px]" clubs={clubs} loading={loading} />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export const SubjectIcon = ({ subject }: { subject: SubjectName }) => {
  const IconComponent = subjectIcons[subject] || BookIcon;
  return <IconComponent size={16} className="dark:text-foreground text-green-600" />;
};


