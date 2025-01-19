import { useUser } from "@/components"
import { Card, CardContent } from "@/components/ui/card"
import { navItems } from "@/data/navItems"
import { cn } from "@/lib/utils"
import Router, { useRouter } from "next/router"
import { useState } from "react"
// import { Input } from "@/components/ui/input"

export function Shortcuts() {

  const { user } = useUser()

  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState<string>("");

  function isActive(link: string) {
    return router.pathname === link
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchQuery) {
      Router.push(`/search?q=${searchQuery}`);
    }
  }


  return (
    <Card className="w-full !max-w-[350px]">
      <CardContent className="space-y-4 py-5">
        <h2 className="text-base font-semibold mb-4">ফিউচার স্কুল স্মার্ট কমিউনিটি</h2>

        <form className="relative hidden lg:flex">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">

            <svg width="1.5em" height="1.5em" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.90039 10C5.90039 7.23858 8.13897 5 10.9004 5C13.6618 5 15.9004 7.23858 15.9004 10C15.9004 12.7614 13.6618 15 10.9004 15C8.13897 15 5.90039 12.7614 5.90039 10ZM10.9004 3C7.0344 3 3.90039 6.13401 3.90039 10C3.90039 13.866 7.0344 17 10.9004 17C12.4727 17 13.924 16.4816 15.0926 15.6064L20.1933 20.7071C20.5838 21.0976 21.217 21.0976 21.6075 20.7071C21.998 20.3166 21.998 19.6834 21.6075 19.2929L16.5068 14.1922C17.382 13.0236 17.9004 11.5723 17.9004 10C17.9004 6.13401 14.7664 3 10.9004 3Z" fill="currentColor" />
            </svg>

            {/* <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 pointer-events-none mr-3 text-green-400"
                >
                  <path
                    d="M10 3.347c1.138 0 2.213.266 3.163.739-.255.462-.74.764-1.283.787l-.87.036A5.636 5.636 0 0010 4.818c-3.038 0-5.5 2.415-5.5 5.394 0 2.906 2.344 5.276 5.279 5.39l.221.004.221-.004c2.935-.114 5.279-2.484 5.279-5.39l-.003-.13.082-.215c.2-.524.676-.893 1.234-.967l.058-.005a6.771 6.771 0 01-.803 4.742 2.849 2.849 0 012.076.657l.157.143 1.872 1.836a2.731 2.731 0 010 3.916 2.864 2.864 0 01-3.852.13l-.14-.13-1.872-1.836a2.732 2.732 0 01-.818-2.19 7.062 7.062 0 01-3.491.914c-3.866 0-7-3.073-7-6.865 0-3.791 3.134-6.865 7-6.865zm5.37 12.13a1.28 1.28 0 00-.097 1.73l.096.106 1.872 1.836c.241.236.552.362.868.378h.135l.135-.013c.269-.04.527-.162.733-.365a1.28 1.28 0 00.097-1.73l-.097-.106-1.871-1.835a1.342 1.342 0 00-1.872 0zm.05-12.056l.044 1.013a2.493 2.493 0 001.648 2.225l.97.355c.457.167.35.83-.138.85l-1.033.044a2.592 2.592 0 00-.304.03l-.05.01c-.08.014-.159.032-.236.054l-.147.046-.18.07-.168.08-.113.063-.141.09-.164.121-.032.026c-.323.27-.579.62-.734 1.026l-.361.95a.43.43 0 01-.373.285h-.078l-.077-.012a.429.429 0 01-.34-.407l-.044-1.014a2.493 2.493 0 00-1.648-2.224l-.97-.355c-.457-.167-.35-.83.138-.85l1.034-.044c.3-.013.588-.077.855-.185l.109-.048c.175-.08.34-.178.49-.294l.148-.122.12-.114.136-.152.045-.056.078-.104.055-.082-.03.046a2.47 2.47 0 00.262-.505l.362-.95c.17-.45.846-.345.867.134z"
                    fill="currentcolor"
                    fillRule="evenodd"
                  ></path>
                </svg> */}
          </span>
          <input
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e as unknown as React.FormEvent<HTMLFormElement>)
              }
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="search"
            placeholder="সার্চ করো..."
            className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-200 rounded-full pl-10 pr-4 py-2.5 w-full 
                border border-gray-200 dark:border-gray-700/50 
                hover:border-green-500/30
                focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 
                focus:outline-none transition-all duration-300 
                placeholder:text-gray-500 placeholder:text-sm"
          />
        </form>
        <nav className="space-y-1 text-light dark:text-white">
          {navItems.map((item, index) => (
            <button type="button" onClick={() => Router.push(item.link)}
              key={index}
              className={cn(
                "flex items-center gap-3 w-full p-2 rounded-lg transition-colors",
                isActive(item.link) ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "hover:bg-green-500/10 hover:text-green-600 dark:hover:bg-green-500/10 dark:hover:text-green-400"
              )}
            >
              {!isActive(item.link) ? item.icon.selected : item.icon.unselected}
              <span className="text-sm sm:text-base font-medium">{item.label}</span>
              {item.label === 'প্রোফাইল' && (
                <span className="text-xs capitalize rounded-full bg-olive/10 px-3 py-1 font-semibold shadow-sm text-olive">{user?.role?.toUpperCase()}</span>
              )}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}