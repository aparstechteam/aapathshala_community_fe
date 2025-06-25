// import { useUser } from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { navItems } from "@/data/navItems";
import { cn } from "@/lib/utils";
import Router, { useRouter } from "next/router";
import { useState } from "react";
// import { Input } from "@/components/ui/input"

export function Shortcuts() {
  // const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [batchName, setBatchName] = useState<string>("");

  function isActive(link: string) {
    return router.pathname === link;
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchQuery) {
      Router.push(`/search?q=${searchQuery}`);
    }
  }

  return (
    <Card className="w-full !max-w-[350px]">
      <CardContent className="grid gap-4 py-5">
        <h2 className="text-base flex items-center justify-between text-hot gap-2 font-semibold">
          <span>Guideline Community</span>
          {/* <span className="text-xs flex items-center justify-center bg-hot/10 text-hot h-5 font-normal pt-0.5 w-[60px] rounded-full">
            {batchName}
          </span> */}
        </h2>

        <form className="relative hidden lg:flex">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              width="1.5em"
              height="1.5em"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.90039 10C5.90039 7.23858 8.13897 5 10.9004 5C13.6618 5 15.9004 7.23858 15.9004 10C15.9004 12.7614 13.6618 15 10.9004 15C8.13897 15 5.90039 12.7614 5.90039 10ZM10.9004 3C7.0344 3 3.90039 6.13401 3.90039 10C3.90039 13.866 7.0344 17 10.9004 17C12.4727 17 13.924 16.4816 15.0926 15.6064L20.1933 20.7071C20.5838 21.0976 21.217 21.0976 21.6075 20.7071C21.998 20.3166 21.998 19.6834 21.6075 19.2929L16.5068 14.1922C17.382 13.0236 17.9004 11.5723 17.9004 10C17.9004 6.13401 14.7664 3 10.9004 3Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="search"
            placeholder="সার্চ করো..."
            className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-200 rounded-full pl-10 pr-4 py-1.5 w-full 
                 ring-gray-200 dark:ring-hot/40 dark:border-gray-700/50 ring-2 border-0 outline-none focus:outline-none
                focus:border-0 focus:ring-2 focus:ring-hot/50 transition-all duration-300 placeholder:text-gray-500 placeholder:text-sm"
          />
        </form>
        <nav className="space-y-1 text-light dark:text-white">
          {navItems.map((item, index) => (
            <button
              type="button"
              onClick={() => Router.push(item.link)}
              key={index}
              className={cn(
                "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
                isActive(item.link)
                  ? "bg-hot/10 text-hot dark:bg-hot/10 dark:text-hot"
                  : "hover:bg-hot/10 hover:text-hot dark:hover:bg-hot/10 dark:hover:text-hot"
              )}
            >
              {!isActive(item.link) ? item.icon.selected : item.icon.unselected}
              <span className="text-sm sm:text-base font-medium">
                {item.label}
              </span>
              {/* {item.label === 'প্রোফাইল' && (
                <span>
                  <Tagtag tags={[user?.role?.toUpperCase() as string]} />
                </span>
              )} */}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
