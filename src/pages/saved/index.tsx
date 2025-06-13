import { Layout } from "@/components";
import { secondaryAPI } from "@/configs";
// import { collections } from '@/data/saved-types'
import axios from "axios";
import { Loader2 } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export type Collection = {
  count: string;
  collection_id: number;
  collection_name: string;
};

const SavedPostPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getcollections() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${secondaryAPI}/api/post/saved_posts/collections`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (res.data) {
          setCollections(res.data);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }
    getcollections();
  }, []);

  return (
    <>
      <Head>
        <title>Saved Posts</title>
      </Head>
      <Layout>
        <div className="min-h-[calc(100vh-80px)] max-w-6xl mx-auto w-full p-4">
          <div className="grid gap-2 w-full">
            <h2 className="text-lg text-elegant/50 text-center md:text-xl font-bold py-2">
              Saved Collections
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
              {collections?.map((c) => (
                <div
                  key={c?.collection_id}
                  className="text-black dark:text-white rounded-xl ring-1 ring-hot dark:ring-hot/20 bg-white dark:bg-neutral-950 hover:bg-hot/10 hover:text-hot transition-all duration-300"
                >
                  <Link
                    className="flex items-center justify-between px-4 py-4 gap-2 w-full"
                    href={`/saved/${c?.collection_id}`}
                  >
                    <span className="text-base">{c?.collection_name}</span>
                    <span className="text-base">{c?.count}</span>
                  </Link>
                </div>
              ))}
            </div>
            <div className="w-full h-10 flex justify-center items-center">
              {loading && <Loader2 className="animate-spin" />}
              {collections?.length === 0 && !loading && (
                <span className="text-base text-black">
                  No collections found
                </span>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SavedPostPage;
