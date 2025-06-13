/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import Image from "next/image";
// import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo = ({ size = "md", className }: LogoProps) => {
  const sizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative hidden sm:block">
        <div className="relative">
          <p
            className={cn(
              "-mt-0.5 font-bold dark:text-white text-gray-700 tracking-tight leading-none",
              sizeClasses[size]
            )}
          >
            SMART <span className="text-hot">COMMUNITY</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const Logo2 = ({ size = "md", className }: LogoProps) => {
  const router = useRouter();
  const sizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link
      href={router.pathname.includes("/auth") ? "/auth" : "/"}
      className={cn(
        "hover:scale-105 transition-all duration-300 flex items-center",
        className,
        sizeClasses[size]
      )}
    >
      {size === "md" && (
        <img src="/logo.png" alt="acs-logo" width={46} height={46} />
      )}
      {size === "sm" && (
        <Image src={"/logo.png"} alt="acs-logo" width={36} height={36} />
      )}
      {size === "lg" && (
        <Image src={"/logo.png"} alt="acs-logo" width={66} height={66} />
      )}
    </Link>
  );
};
