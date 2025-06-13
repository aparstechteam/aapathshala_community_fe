import React from "react";
import Head from "next/head";
import Image from "next/image";
import { Footer } from "@/components";
import Link from "next/link";

const ErrorPage = () => {
  return (
    <>
      <Head>
        <title>Smart Community | 404</title>
      </Head>
      <div className="grid items-center justify-center h-screen bg-[#E4E9F5]">
        <div className="flex py-2 flex-col items-center justify-center gap-2">
          <Image src={"/404.png"} alt="404" width={800} height={800} />
          <Link
            href="/"
            className="bg-primary lg:text-xl text-lg text-black hover:text-black/80 hover:scale-90 text-semibold transition-all duration-300 shadow-lg shadow-hot/50 bg-hot px-4 py-2 text-center rounded-md"
          >
            হোম এ ফিরে যাও
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ErrorPage;
