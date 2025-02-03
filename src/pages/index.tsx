/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, PinnedPosts, useUser } from "@/components";
import { Layout } from "@/components/layouts";
import { accessToken, community_video, recaptchaKey, secondaryAPI } from "@/configs";
import { CreatePost, NewsFeed, SubjectFilters } from "@/features";
import { NextPage } from "next";
import Head from "next/head";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Post } from "@/@types";
import axios, { AxiosError } from "axios";
import { handleError } from "@/hooks/error-handle";
import { toast } from "@/hooks/use-toast";
import { useSubject } from "@/hooks";
import Image from "next/image";
import { ChevronDownIcon } from "lucide-react";


// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const { req, res } = context;
//   const { accessToken, refreshToken } = req.cookies;

//   if (!accessToken && !refreshToken) {
//     return {
//       redirect: {
//         destination: '/auth',
//         permanent: false,
//       },
//     };
//   }

//   try {
//     const response = await axios.get(`${secondaryAPI}/api/auth/user`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (response.status === 404) {
//       return {
//         redirect: {
//           destination: '/auth',
//           permanent: false,
//         },
//       };
//     }

//     const user = response.data;

//     return {
//       props: { user },
//     };

//   } catch (error) {

//     if (axios.isAxiosError(error) && error.response?.status === 401) {
//       try {
//         const refreshResponse = await axios.post(
//           `${secondaryAPI}/api/auth/refresh`,
//           { refreshToken },
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           }
//         );

//         const newAccessToken = refreshResponse.data.accessToken;
//         const newRefreshToken = refreshResponse.data.refreshToken;


//         res.setHeader('Set-Cookie', [
//           `accessToken=${newAccessToken}; HttpOnly; Path=/; SameSite=Strict`,
//           `refreshToken=${newRefreshToken}; HttpOnly; Path=/; SameSite=Strict`,
//         ]);


//         const userResponse = await axios.get(`${secondaryAPI}/api/auth/user`, {
//           headers: {
//             Authorization: `Bearer ${newAccessToken}`,
//           },
//         });

//         return {
//           props: { user: userResponse.data },
//         };
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
//         return {
//           redirect: {
//             destination: '/auth',
//             permanent: false,
//           },
//         };
//       }
//     }
//     return {
//       props: { user: null },
//     };
//   }
// };

const HomePage: NextPage = () => {

  const { user } = useUser();

  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sort, setSort] = useState<string>("");
  const [pinnedPosts, setPinnedPosts] = useState<Post[]>([]);
  const [refetchPinnedPosts, setRefetchPinnedPosts] = useState<boolean>(false);
  const { subjects } = useSubject()

  useEffect(() => {
    const fetchPinnedPosts = async () => {
      try {
        const batchName = localStorage.getItem("hsc_batch") || user?.hsc_batch;
        const response = await axios.get(`${secondaryAPI}/api/post/pinned_posts?hsc_batch=${batchName}`, {
          headers: {
            'Authorization': `Bearer ${accessToken()}`
          }
        });
        const data = await response.data;
        if (data?.data.length > 0) setPinnedPosts(data.data);
      } catch (err) {
        handleError(err as AxiosError, () => fetchPinnedPosts())
      }
    }
    fetchPinnedPosts()
  }, [refetchPinnedPosts, user])

  async function unpinPost(id: string | number) {
    try {
      await axios.post(`${secondaryAPI}/api/post/${id}/unpin`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      toast({
        title: "Post Unpinned",
        description: "This post is unpinned from the top of the feed"
      })
      setRefetchPinnedPosts((prev) => !prev)
    } catch (err) {
      handleError(err as AxiosError, () => unpinPost(id))
    }
  }

  const [tutorialOpen, setTutorialOpen] = useState(false)

  const tutorial = (
    <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
      <DialogContent className="max-w-2xl z-[99] bg-white text-black p-5">
        <DialogHeader>
          <DialogTitle>
            <h2 className="text-xl font-bold text-center">কমিউনিটি এর ব্যবহারবিধি</h2>
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className='flex flex-col gap-4 items-center justify-center'>
            <h2 className='text-center'>কমিউনিটি কিভাবে ব্যবহার করবে তার বিস্তারিত জেনে নাও এই ভিডিও দেখে</h2>
            <iframe className='w-full rounded-xl' width="100%" height="315"
              src={community_video}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
          </div>
        </div>
        <DialogFooter className="flex !justify-center">
          <Button className="bg-olive !w-full !rounded-lg text-white" onClick={() => setTutorialOpen(false)}>বুঝেছি</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <>
      <Head>
        <title>Smart Community</title>
      </Head>

      {user?.is_waiting ? (
        <div className='min-h-[calc(100vh)] text-black bg-white flex flex-col justify-center gap-4'>

          <div className='w-full h-full grid gap-4 items-center justify-center max-w-5xl mx-auto'>
            <Image src={'/images/coming-soon.svg'} alt='marketplace' width={100} height={100} className='mx-auto' />
            <h2 className='text-xl font-bold text-center'>শীঘ্রই আসছে! </h2>
            {/* <h2 className='text-base text-center'>চোখ রাখো ACS ফিউচার স্কুল, স্টাডি কমিউনিটিতে...</h2> */}
          </div>
        </div>
      ) : (
        <Layout variant="home" selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject}>

          <div className="w-full h-full pt-4 xl:pt-0 mx-auto md:px-2 max-w-5xl xl:max-w-[calc(100vw_-_750px)] 2xl:max-w-[calc(100vw_-_850px)]">
            {!!recaptchaKey ? (
              <GoogleReCaptchaProvider
                reCaptchaKey={recaptchaKey ?? "NOT DEFINED"}
                scriptProps={{
                  async: true,
                  defer: true,
                  appendTo: 'head',
                  nonce: undefined,
                }}
              >
                <div className="w-full space-y-2 py-1 max-w-4xl mx-auto h-full">
                  <CreatePost />
                  {tutorial}

                  <div className="w-full z-[2] relative bg-white rounded-lg">
                    <button type="button" onClick={() => setTutorialOpen(true)} className="w-full z-[2] relative text-hot bg-hot/15 rounded-lg py-2 px-4 flex justify-between items-center">
                      <span>
                        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.8751 14H1.12515C0.845584 14 0.618896 14.2267 0.618896 14.5062C0.618896 14.7858 0.845584 15.0125 1.12515 15.0125H16.8751C17.1547 15.0125 17.3814 14.7858 17.3814 14.5062C17.3814 14.2267 17.1547 14 16.8751 14Z" fill="currentColor" />
                          <path d="M14.5133 0.492188H3.48718C2.49324 0.492188 1.68774 1.29769 1.68774 2.29163V9.93206C1.68774 10.926 2.49324 11.7315 3.48718 11.7315H14.5127C15.5067 11.7315 16.3122 10.926 16.3122 9.93206V2.29163C16.3127 1.29769 15.5072 0.492188 14.5133 0.492188ZM10.8829 7.00425L8.88493 8.41612C8.16099 8.92744 7.16143 8.40994 7.16143 7.52344V4.69969C7.16143 3.81319 8.16099 3.29569 8.88493 3.807L10.8829 5.21887C11.4994 5.65481 11.4994 6.56888 10.8829 7.00425Z" fill="currentColor" />
                        </svg>
                      </span>
                      <h2 className="text-base font-semibold">কমিউনিটি এর ব্যবহারবিধি</h2>
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <SubjectFilters
                    setSort={(s) => setSort(s)}
                    subjects={subjects}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                  />
                  {pinnedPosts.length > 0 && (
                    <div className="relative z-[2] mx-auto gap-2 w-full justify-center p-4 md:rounded-xl md:ring-1 ring-ash dark:ring-ash/20 bg-white dark:bg-gray-900/40 backdrop-blur-sm">
                      <h2 className='text-base font-semibold py-2'>পিন করা পোস্ট </h2>
                      <div className="w-full flex justify-center">
                        <PinnedPosts posts={pinnedPosts} unpin={unpinPost} />
                      </div>
                    </div>
                  )}
                  <NewsFeed selectedSubject={selectedSubject} sort={sort} refetch={() => setRefetchPinnedPosts((prev) => !prev)} />
                </div>
              </GoogleReCaptchaProvider>
            ) : (
              <></>
            )}
          </div>
        </Layout>
      )}
    </>
  )
}


export default memo(HomePage)