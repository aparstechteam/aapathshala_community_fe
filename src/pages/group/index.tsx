/* eslint-disable @typescript-eslint/no-unused-vars */
import { Group } from "@/@types";
import { Layout, useUser } from "@/components";
import { secondaryAPI } from "@/configs";
import { ClubListCard, GroupLists } from "@/features";
import { handleError } from "@/hooks";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import React, { useEffect, useState } from "react";

const GroupPage = () => {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getClubs = async () => {
      try {
        const batchName = localStorage.getItem("hsc_batch") || user.hsc_batch;
        setLoading(true);
        const response = await axios.get(
          `${secondaryAPI}/api/group/mygroups?hsc_batch=${batchName}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (response.data.groups.length > 0) {
          setGroups(response.data.groups);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        handleError(err as AxiosError, () => getClubs());
      }
    };

    getClubs();
  }, [user.hsc_batch]);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const batchName = localStorage.getItem("hsc_batch") || user.hsc_batch;
        setLoading(true);
        const response = await axios.get(
          `${secondaryAPI}/api/group/?group_type=GENERAL`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (response.data.groups.others.length > 0) {
          setCourses(response.data.groups.others);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        handleError(err as AxiosError, () => getGroups());
      }
    };

    getGroups();
  }, [user.hsc_batch]);

  return (
    <>
      <Head>
        <title>Smart Community | Groups</title>
      </Head>
      <Layout>
        <div className="px-2 grid w-full gap-4 pt-6 lg:pt-4 pb-5 max-w-5xl mx-auto min-h-[calc(100vh-80px)] !text-black dark:!text-white">
          <div className="flex flex-col gap-4">
            {courses?.length > 0 && (
              <div className="w-full space-y-4">
                <div className="p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20">
                  <h2 className="text-lg font-medium">পশ গ্রুপ সমূহ</h2>
                  <ClubListCard
                    clubs={courses}
                    loading={loading}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {groups?.length > 0 && (
              <div className="w-full">
                <div className="p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20">
                  <h2 className="text-lg font-medium">আমার গ্রুপ সমূহ</h2>
                  <ClubListCard
                    clubs={groups}
                    loading={loading}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default GroupPage;
