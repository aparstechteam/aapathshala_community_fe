import Video from "next-video";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
export function VideoPlayer({
  src,
  thumbnail,
}: {
  src: string;
  thumbnail: string;
}) {
  const [vurl, setVurl] = useState(src);
  const [view, setView] = useState(false);

  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (src) {
      setVurl(src);
    }
  }, [src]);

  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();

        // Check if video is completely out of viewport
        // const isOutOfViewport =
        //   rect.bottom <= 0 || // Element is above viewport
        //   rect.top >= window.innerHeight; // Element is below viewport

        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
          setView(false);
        } else {
          setView(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [src]);

  return src ? (
    view ? (
      <div ref={videoRef} className="w-full p-2 rounded-xl h-full">
        <Video autoPlay src={vurl} className="rounded-xl shadow-lg" />
      </div>
    ) : (
      <div className="w-full relative h-[500px] p-2 rounded-xl">
        <Image
          slot="poster"
          src={thumbnail || "/rocket.png"}
          className="w-full h-full rounded-xl object-cover bg-white"
          fill
          // placeholder="blur"
          alt="Some peeps doing something awesome"
        />{" "}
        {/* </Video> */}
        <button
          className="absolute inset-0 flex rounded-xl items-center justify-center w-full h-full bg-black/40 text-white hover:text-teal-400"
          onClick={() => setView(true)}
        >
          <svg
            className="duration-300 hover:scale-110"
            width="50"
            height="50"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="28" height="28" rx="14" fill="white" />
            <path
              d="M12.7658 9.27776C11.7659 8.68408 10.5 9.40469 10.5 10.5675V17.4324C10.5 18.5953 11.7659 19.3159 12.7658 18.7222L19.2709 14.8598C19.9235 14.4724 19.9235 13.5276 19.2709 13.1401L12.7658 9.27776ZM2 14C2 7.37258 7.37258 2 14 2C20.6274 2 26 7.37258 26 14C26 20.6274 20.6274 26 14 26C7.37258 26 2 20.6274 2 14ZM14 3.5C8.20101 3.5 3.5 8.20101 3.5 14C3.5 19.799 8.20101 24.5 14 24.5C19.799 24.5 24.5 19.799 24.5 14C24.5 8.20101 19.799 3.5 14 3.5Z"
              fill="url(#paint0_linear_4008_83086)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_4008_83086"
                x1="2"
                y1="14"
                x2="26"
                y2="14"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#8A00CA" />
                <stop offset="0.37" stop-color="#4394F0" />
                <stop offset="0.645" stop-color="#F051FF" />
                <stop offset="1" stop-color="#440064" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>
    )
  ) : null;
}
