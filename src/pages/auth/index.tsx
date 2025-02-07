/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import Router from "next/router";
import Head from "next/head";
import { AppLoader, Button, copyLink, useUser } from "@/components";
import axios from "axios";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { secondaryAPI } from "@/configs";
import Cookies from 'js-cookie';
import Image from "next/image";
import GoogleSignInButton from "@/components/shared/GoogleSignInButton";


const LoginPage = () => {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const { setUser } = useUser();

  async function getUser(token: string) {
    try {
      localStorage.removeItem('user')
      const response = await axios.get(`${secondaryAPI}/api/auth/user`, {
        // withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await response.data;
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))

      if (!data?.user?.onboarding_complete) {
        Router.push("/auth/register");
      } else {
        localStorage.setItem('hsc_batch', data.user.hsc_batch as string)
        Router.push("/");
      }

    } catch (error) {
      console.error("Error assigning user:", error);
      localStorage.removeItem('user')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGoogleLoginSuccess = async (response: any | unknown) => {
    try {
      setIsLoadingGoogle(true);
      const res = await axios.post(`${secondaryAPI}/api/auth/google`, {
        accessToken: response.credential,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      Cookies.set('accessToken', res.data.accessToken, { path: '/' })
      Cookies.set('refreshToken', res.data.refreshToken, { path: '/' })

      getUser(res.data.accessToken)

    } catch {
      setIsLoadingGoogle(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.log("Error: google login")
  };

  const isLoginSupported =
    typeof window !== "undefined" && !/fban|fbav/i.test(navigator.userAgent);

  const [view, setView] = useState(false);
  useEffect(() => {
    setView(true);
  }, []);

  const openInChrome = () => {
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent.toLowerCase()
    const isAndroid = userAgent.includes('android')
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const currentUrl = window.location.origin + window.location.pathname + window.location.search

    if (isAndroid) {
      window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`
    } else if (isIOS) {
      window.location.href = `googlechrome://${currentUrl}`

      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/us/app/google-chrome/id535886823'
      }, 2000)
    }
  }

  return view ? (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login to Smart Community" />
      </Head>

      <div className='bg-white flex flex-col items-center justify-center min-h-screen w-full'>

        <div className="w-full h-full">
          <Card className="!w-full !max-w-lg mx-auto bg-white !rounded-xl backdrop-blur-md ring-light/30 !shadow-md !border-0 !ring-2 !shadow-light/50">
            <CardHeader className="flex items-center">
              <div className="py-2 px-6 flex flex-col items-center justify-center">
                <Image src="/acs.png" alt="acs-logo" className="mx-auto" width={70} height={70} />
                <span className="text-center text-sm font-semibold py-2">স্মার্ট কমিউনিটি</span>
              </div>
              <p className="text-center pt-4">
                <span className="text-clip bg-gradient-to-r from-sky-500 via-olive to-blue-600 text-transparent bg-clip-text text-base md:text-xl font-semibold tracking-tight">
                  Where knowledge meets collaboration
                </span>
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {isLoginSupported ? (
                <div className="py-4">
                  {!isLoadingGoogle ? (
                    <div className="flex justify-center">
                      <div>
                        <GoogleSignInButton
                          onSuccess={handleGoogleLoginSuccess}
                          onError={handleGoogleLoginError}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center py-2">
                      <AppLoader />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-yellow-800 text-center text-sm">
                    {`[বি:দ্র: এই ব্রাউজারে ওয়েবসাইটটি সাপোর্টেড না। নিচের কপি বাটনে ক্লিক করে ওয়েবসাইটের লিংকটি কপি করে ক্রোম ব্রাউজারে ওপেন করবে।]`}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      size="sm"
                      onClick={() => openInChrome()}
                      className="bg-zinc-800 hover:bg-zinc-700 text-light border-0 transition-colors"
                    >

                      {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                        />
                      </svg> */}
                      Open in Chrome
                    </Button>
                  </div>
                </div>
              )}

              <div>

              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  ) : null;
};

export default LoginPage;