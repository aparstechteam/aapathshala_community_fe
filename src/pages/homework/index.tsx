/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Layout, Tagtag, useDebounce, useUser } from "@/components";
import { levelArray, secondaryAPI } from "@/configs";
import { HomeworkMain, HwCreate, HwFilter, UnpaidMsg } from "@/features";
import { toast } from "@/hooks";
import { Chapter, Profile, Subject } from "@/@types";
import { THomework } from "@/@types/homeworks";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import React, { useEffect, useState } from "react";
// import { Profile } from "../auth";
import Router, { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

const HomeWorkPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { step } = router.query;
  const profile = router?.query.profile;
  const uid = router?.query.uid;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [sort, setSort] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [decodedContent, setDecodedContent] = useState<string>("");
  const [homeworks, setHomeworks] = useState<THomework[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [values, setValues] = useState<THomework>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const dsubject = useDebounce(subject, 300);
  const dchapter = useDebounce(chapter, 300);
  const dsort = useDebounce(sort, 300);
  const dprofile = useDebounce(profile || user?.level, 300);
  const duid = useDebounce(uid || user?.id, 300);

  useEffect(() => {
    async function getProfiles() {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.post(
          `${secondaryAPI}/api/auth/profiles`,
          {
            phone_number: user.phone,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setProfiles(res.data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    if (!!user.phone) {
      getProfiles();
    }
  }, [user]);

  useEffect(() => {
    setHomeworks([]);
    setPage(1);
  }, [chapter, sort]);

  useEffect(() => {
    async function getHomeworks() {
      try {
        setErrorMsg("");
        setLoading(true);
        const res = await axios.get(
          `${secondaryAPI}/api/homework?type=${dsort}&subject=${
            dsubject?.id || ""
          }&chapter=${dchapter?.id || ""}&page=${page}&limit=10&level=${Number(
            dprofile
          )}&user=${duid}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const newPosts = await res.data.data;
        if (homeworks.length === 0) {
          if (res.data.data.length === 0) {
            setErrorMsg(
              "কোনো হোমওয়ার্ক পাওয়া যায়নি। অনুগ্রহপূর্বক অন্যান্য বিষয় ফিল্টার কর।"
            );
          }
          setHomeworks(newPosts);
        } else {
          setHomeworks((prevPosts) => [...prevPosts, ...newPosts]);
        }
        setIsFetching(false);
        setPage(page);
        setHasMore(newPosts.length > 0);
        setLoading(false);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          setErrorMsg(error.response?.data.message || "Something went wrong");
        }
        // setErrorMsg(error.response.data.message);
        setLoading(false);
        console.log(error);
      }
    }
    if (Number(dprofile) !== 0) {
      getHomeworks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dchapter, dsort, page, dprofile, duid, router]);

  async function createHomework() {
    if (
      !values?.subject_id ||
      !values?.chapter_id ||
      !values?.topic ||
      !values?.deadline
    ) {
      toast({
        title: "Warning!",
        description: "অনুগ্রহপূর্বক সবগুলো ফর্ম ফিল্ড পূরণ করুন",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await axios.post(
        `${secondaryAPI}/api/homework`,
        {
          body: decodedContent,
          subject_id: values?.subject_id,
          chapter_id: values?.chapter_id,
          deadline: values?.deadline,
          topic: values?.topic,
          attachment_url: values?.attachment_url,
          images: values?.images || null,
          user_id: user.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setHomeworks([res.data, ...homeworks]);
      toast({
        title: "Homework Created Successfully",
        description: "Your homework has been created successfully",
        variant: "success",
      });
      setIsOpen(false);
      setDecodedContent("");
      setValues({
        ...values,
        subject_id: "",
        chapter_id: "",
        topic: "",
        deadline: "",
        user_id: "",
        attachment_url: "",
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await axios.delete(`${secondaryAPI}/api/homework/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setHomeworks(homeworks.filter((hw) => hw.id !== id));
      toast({
        title: "Homework Deleted Successfully",
        description: "Your homework has been deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.log(error);
    }
  }

  function handleProfile(profile: Profile) {
    Router.push(`/homeworks?profile=${profile.level}&step=1&uid=${profile.id}`);
  }

  return (
    <>
      <Head>
        <title>AFS - Homeworks</title>
      </Head>
      <Layout variant="home">
        <div className="max-w-5xl xl:max-w-[calc(100vw_-_750px)] 2xl:max-w-[calc(100vw_-_850px)] w-full mx-auto z-[2] relative sm:px-4 xl:px-0 sm:py-5">
          {Number(step) !== 1 && user.level === 0 ? (
            <div>
              <div className="p-4">
                <div className="space-y-6">
                  {profiles?.filter((x) => x.id !== user.id && x.is_paid)
                    .length === 0 ? (
                    loading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-10 h-10 animate-spin" />
                      </div>
                    ) : (
                      <UnpaidMsg />
                    )
                  ) : (
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        প্রোফাইল সিলেক্ট করুন
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        আপনার সন্তানের আমলনামা দেখতে নিচের প্রোফাইলগুলো থেকে
                        একটি বেছে নিন
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 justify-center items-center">
                    {profiles
                      .filter((x) => x.id !== user.id && x.is_paid)
                      .map((x) => (
                        <div key={x?.id} className="relative group">
                          <div className="transition-all duration-300 cursor-pointer">
                            <div className="relative mx-auto w-24 h-24">
                              <img
                                src={x.image || "/user.jpg"}
                                alt={x.name}
                                className="w-full h-full object-cover rounded-xl ring-2 ring-gray-100 group-hover:ring-rose-500/80 group-hover:ring-4 transition-all duration-300"
                              />
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm pt-2 font-medium text-gray-900 text-center truncate">
                                {x.name}
                              </p>

                              <div className="flex flex-wrap gap-2 justify-center">
                                {x.is_paid && (
                                  <span className="inline-flex items-center text-xs font-medium text-orange-700 bg-orange-50 rounded-full px-2.5 py-1">
                                    প্রিমিয়াম
                                  </span>
                                )}
                                {!!levelArray[x.level] && (
                                  <span
                                    className={`inline-flex items-center text-xs font-medium rounded-full px-2.5 py-1 ${
                                      x.level === 0
                                        ? "text-sky-700 bg-sky-50"
                                        : "text-hot bg-hot/10"
                                    }`}
                                  >
                                    {levelArray[x.level]}
                                  </span>
                                )}
                                <Tagtag tags={[(x?.role as string) || ""]} />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleProfile(x)}
                              className="absolute inset-0 w-full h-full opacity-0"
                              aria-label={`Select profile ${x.name}`}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : user.level === 0 ? (
            <div className="flex flex-col gap-2 sm:gap-4 pt-10 xl:pt-0">
              {/* Create HW Post  */}
              {user.role !== "USER" && user.level !== 0 && (
                <HwCreate
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  decodedContent={decodedContent}
                  setDecodedContent={setDecodedContent}
                  values={values as THomework}
                  setValues={(key, value) =>
                    setValues({ ...(values as THomework), [key]: value })
                  }
                  onSubmit={createHomework}
                />
              )}

              {/* Filter HW */}
              <HwFilter
                subject={subject}
                setSubject={setSubject}
                chapter={chapter}
                setChapter={setChapter}
                setSort={setSort}
                sort={sort}
                profiles={profiles}
              />

              {errorMsg && (
                <div className="flex px-4 text-center z-[4] justify-center items-center">
                  <p className="text-red-500">{errorMsg}sss</p>
                </div>
              )}
              {loading && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              {/* Homework Feed */}
              <HomeworkMain
                homeworks={homeworks || []}
                loading={loading}
                setPage={setPage}
                page={page}
                handleDelete={handleDelete}
                hasMore={hasMore}
                isFetching={isFetching}
                setIsFetching={setIsFetching}
              />
            </div>
          ) : (
            //  user.id && !user.is_paid ? (
            //   <UnpaidMsg />
            // )
            //
            <div className="flex flex-col gap-2 sm:gap-4 pt-10 xl:pt-0">
              {/* Create HW Post  */}
              {/* {user.role !== "USER" && user.level !== 0 && ( */}
                <HwCreate
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  decodedContent={decodedContent}
                  setDecodedContent={setDecodedContent}
                  values={values as THomework}
                  setValues={(key, value) =>
                    setValues({ ...(values as THomework), [key]: value })
                  }
                  onSubmit={createHomework}
                />
              {/* )} */}

              {/* Filter HW */}
              <HwFilter
                subject={subject}
                setSubject={setSubject}
                chapter={chapter}
                setChapter={setChapter}
                setSort={setSort}
                sort={sort}
                profiles={profiles}
              />

              {errorMsg && (
                <div className="flex px-4 text-center z-[4] justify-center items-center">
                  <p className="text-red-500">{errorMsg}</p>
                </div>
              )}
              {loading && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}

              {/* Homework Feed */}
              <HomeworkMain
                homeworks={homeworks || []}
                loading={loading}
                setPage={setPage}
                page={page}
                handleDelete={handleDelete}
                hasMore={hasMore}
                isFetching={isFetching}
                setIsFetching={setIsFetching}
              />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default HomeWorkPage;
