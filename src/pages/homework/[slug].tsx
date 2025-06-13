import { Layout, useDebounce } from "@/components";
import { HWDetails } from "@/features";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { secondaryAPI } from "@/configs";
import { Loader } from "lucide-react";
import { THomework, TSubmission } from "@/@types/homeworks";
// import { THomework, TSubmission } from "@/types/homeworks";

const HWDetailsPage = () => {
  const router = useRouter();
  const { slug, uid } = router.query;

  const [homework, setHomework] = useState<THomework>();
  const [submissions, setSubmissions] = useState<TSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [evaluation, setEvaluation] = useState("");
  //   const [totalPage, setTotalPage] = useState(0);

  const duid = useDebounce(uid, 300);
  const devaluation = useDebounce(evaluation, 300);

  useEffect(() => {
    setSubmissions([]);
    setPage(1);
  }, [evaluation]);

  useEffect(() => {
    async function fetchHomework() {
      try {
        setLoading(true);
        const res = await axios.get(`${secondaryAPI}/api/homework/${slug}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setHomework(res.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    }

    if (!!slug) {
      fetchHomework();
    }
  }, [slug, refetch]);

  useEffect(() => {
    async function getSubmissions() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${secondaryAPI}/api/homework/${slug}/submissions?page=${page}&limit=10&user=${
            duid || ""
          }&evaluated=${devaluation || ""}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const newPosts = await res.data.data;
        if (submissions.length === 0) {
          setSubmissions(newPosts);
        } else {
          setSubmissions((prevPosts) => [...prevPosts, ...newPosts]);
        }
        setIsFetching(false);
        setHasMore(newPosts.length > 0);
        setLoading(false);
        // setTotalPage(res.data.total_pages);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    }

    if (!!slug) {
      getSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, refetch, page, duid, devaluation]);

  function handleNewSubmission(s: TSubmission) {
    console.log(s);
    setSubmissions([]);
    setRefetch(!refetch);
  }

  return (
    <>
      <Head>
        <title>Homework Details</title>
      </Head>
      <Layout>
        {submissions.length === 0 && loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <HWDetails
            data={{
              homework: homework as THomework,
              submissions: submissions as TSubmission[],
            }}
            setSubmissions={(s) => handleNewSubmission(s)}
            loading={loading}
            hasMore={hasMore}
            isFetching={isFetching}
            setIsFetching={setIsFetching}
            setPage={setPage}
            page={page}
            refetch={() => setRefetch(true)}
            evaluation={evaluation}
            setEvaluation={setEvaluation}
          />
        )}
      </Layout>
    </>
  );
};

export default HWDetailsPage;
