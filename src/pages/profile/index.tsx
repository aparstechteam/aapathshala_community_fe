import { Layout, PageLoaders, useUser } from "@/components";
import { secondaryAPI } from "@/configs";
import { ProfileComponent } from "@/features";
import { handleError } from "@/hooks/error-handle";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";

type UserData = {
  id: string;
  name: string;
  institute: string;
  profilePic: string;
  courses: string[];
  followers: number;
  following: number;
  school: string;
  thana: string;
  district: string;
  bio: string;
  is_paid: boolean;
  user_profile_pic: string;
  image: string;
  role: string;
  level: number;
  isFollowing: boolean;
  facebook: string;
  instagram: string;
  gender: string;
  religion: string;
  institute_name: string;
  hsc_batch: string;
};

type DashboardData = {
  totalPosts: number;
  totalComments: number;
  totalSatisfied: number;
};

export type UserProfile = {
  userData: UserData;
  dashboard: DashboardData;
  course_enrolled: string[];
};

const MyProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const { user } = useUser();

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      if (!user?.id) return;
      const response = await axios.get(
        `${secondaryAPI}/api/auth/profile/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setUserProfile(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error as AxiosError, () => getProfile());
    }
  }, [user]);

  useEffect(() => {
    if (user?.id)
      getProfile();
  }, [user, getProfile]);


  return (
    <>
      <Head>
        <title>Smart Community | User</title>
      </Head>
      <Layout variant="other">
        {!userProfile?.userData?.id ? (
          <PageLoaders loading={loading} />
        ) : (
          <ProfileComponent
            userProfile={userProfile as UserProfile}
            id={user.id as string}
            isFollowing={isFollowing}
            setIsFollowing={setIsFollowing}
            refetch={getProfile}
          />
        )}

      </Layout>
    </>
  );
};

export default MyProfilePage;
