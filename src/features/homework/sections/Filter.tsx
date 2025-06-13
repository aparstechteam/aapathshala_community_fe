/* eslint-disable @typescript-eslint/no-unused-vars */
import { Popover, PopoverContent, PopoverTrigger, useUser } from "@/components";
import { useSubject } from "@/hooks";
import { Profile } from "@/@types";
import { Chapter, Subject } from "@/@types";
import { PopoverClose } from "@radix-ui/react-popover";
import { useRouter } from "next/router";
import React, { useState } from "react";

type Props = {
  subject: Subject | null;
  setSubject: (subject: Subject) => void;
  chapter: Chapter | null;
  setChapter: (chapter: Chapter | null) => void;
  setSort: (sort: string) => void;
  sort: string;
  profiles: Profile[];
};

export const HwFilter = (props: Props) => {
  const { subject, setSubject, chapter, setChapter, setSort, sort, profiles } =
    props;
  const { subjects, chapters, getChapters } = useSubject();
  const { user } = useUser();
  const router = useRouter();
  const { profile } = router.query;
  const [isOpen, setIsOpen] = useState(false);

  const filters = (
    <>
      <Popover>
        <PopoverTrigger className="flex items-center gap-2 py-2 px-3 sm:rounded-xl sm:bg-ash/50 text-sm">
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.56738 5.83333C2.56738 4.66656 2.56738 4.08317 2.79445 3.63752C2.99419 3.24552 3.3129 2.92681 3.7049 2.72707C4.15055 2.5 4.73394 2.5 5.90072 2.5C7.06749 2.5 7.65088 2.5 8.09653 2.72707C8.48853 2.92681 8.80724 3.24552 9.00698 3.63752C9.23405 4.08317 9.23405 4.66656 9.23405 5.83333V14.1667C9.23405 15.3334 9.23405 15.9168 9.00698 16.3625C8.80724 16.7545 8.48853 17.0732 8.09653 17.2729C7.65088 17.5 7.06749 17.5 5.90072 17.5C4.73394 17.5 4.15055 17.5 3.7049 17.2729C3.3129 17.0732 2.99419 16.7545 2.79445 16.3625C2.56738 15.9168 2.56738 15.3334 2.56738 14.1667V5.83333Z"
              stroke="#0992E2"
              strokeWidth="0.875"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.90039 14.168H5.90788"
              stroke="#0992E2"
              strokeWidth="1.16667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.56738 5.83203H9.23405"
              stroke="#0992E2"
              strokeWidth="0.875"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.4412 6.89036C10.1455 5.78198 9.99761 5.2278 10.0995 4.74666C10.189 4.32344 10.4098 3.93956 10.73 3.65004C11.094 3.3209 11.6459 3.17241 12.7496 2.87542C13.8534 2.57843 14.4053 2.42994 14.8844 2.53221C15.3059 2.62217 15.6882 2.8438 15.9765 3.16534C16.3042 3.53089 16.4521 4.08507 16.7479 5.19344L18.8602 13.1096C19.1559 14.218 19.3038 14.7722 19.202 15.2533C19.1124 15.6766 18.8917 16.0604 18.5715 16.35C18.2074 16.6791 17.6556 16.8276 16.5518 17.1246C15.448 17.4216 14.8962 17.5701 14.417 17.4678C13.9956 17.3778 13.6133 17.1562 13.325 16.8347C12.9972 16.4691 12.8493 15.9149 12.5536 14.8066L10.4412 6.89036Z"
              stroke="#0992E2"
              strokeWidth="0.875"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.7178 13.9141L15.725 13.9121"
              stroke="#0992E2"
              strokeWidth="1.16667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.9004 6.66682L16.3172 5"
              stroke="#0992E2"
              strokeWidth="0.875"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{subject?.name || "বিষয়"}</span>
        </PopoverTrigger>
        <PopoverContent className="z-[3] grid divide-y divide-ash py-2 max-h-[300px] overflow-y-auto">
          <PopoverClose>
            <button
              className="px-4 py-2 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
              onClick={() => {
                setSubject({ id: "", name: "All", count: 0 });
                setChapter({
                  id: "",
                  name: "All",
                  subject_id: "",
                  level: 0,
                  order: 0,
                });
              }}
            >
              All
            </button>
          </PopoverClose>
          {subjects.map((sub) => (
            <PopoverClose key={sub.id}>
              <button
                className="px-4 py-2 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => {
                  if (subject?.id !== sub.id) {
                    setSubject(sub);
                    getChapters(sub.id);
                    // setChapter(null)
                  } else {
                    setSubject({ ...subject, id: "" });
                    // setChapter(null)
                  }
                }}
              >
                {sub.name}
              </button>
            </PopoverClose>
          ))}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger
          disabled={!subject}
          className="flex items-center gap-2 py-2 px-3 sm:rounded-xl sm:bg-ash/50 text-sm"
        >
          <svg
            width="21"
            height="20"
            viewBox="0 0 16 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 3.5C5.44772 3.5 5 3.94772 5 4.5V5.5C5 6.05229 5.44772 6.5 6 6.5H10C10.5523 6.5 11 6.05228 11 5.5V4.5C11 3.94772 10.5523 3.5 10 3.5H6ZM6 4.5H10V5.5H6V4.5Z"
              fill="#FAA82A"
            />
            <path
              d="M11 1.5H5C3.89543 1.5 3 2.39543 3 3.5V13.5C3 14.6046 3.89543 15.5 5 15.5H12.5C12.7761 15.5 13 15.2761 13 15C13 14.7239 12.7761 14.5 12.5 14.5H5C4.44772 14.5 4 14.0523 4 13.5V13.4969H12.5C12.7761 13.4969 13 13.2731 13 12.9969V3.5C13 2.39543 12.1046 1.5 11 1.5ZM4 12.4969V3.5C4 2.94771 4.44771 2.5 5 2.5H11C11.5523 2.5 12 2.94772 12 3.5V12.4969H4Z"
              fill="#FAA82A"
            />
          </svg>
          <span>{chapter?.name || "অধ্যায়"}</span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="z-[3] grid divide-y divide-ash py-2 max-h-[300px] overflow-y-auto"
        >
          <PopoverClose>
            <button
              className="px-4 py-2 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
              onClick={() => {
                setIsOpen(false);
                setChapter({
                  id: "",
                  name: "All",
                  subject_id: "",
                  level: 0,
                  order: 0,
                });
              }}
            >
              All
            </button>
          </PopoverClose>
          {chapters?.map((ch) => (
            <PopoverClose key={ch.id}>
              <button
                className="px-4 py-2 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => {
                  setIsOpen(false);
                  if (chapter?.id !== ch.id) {
                    setChapter(ch);
                  } else {
                    setChapter({ ...chapter, id: "" });
                  }
                }}
              >
                {ch.name}
              </button>
            </PopoverClose>
          ))}
        </PopoverContent>
      </Popover>

      {user?.level !== 0 ? (
        <Popover>
          <PopoverTrigger className="flex items-center text-sm">
            <p className="h-10 sm:h-9 gap-2 min-w-10 sm:rounded-xl sm:px-4 rounded-full flex items-center justify-center sm:bg-hot/10 text-hot">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.650391 0.75C0.650391 0.335786 0.986177 0 1.40039 0H12.4004C12.8146 0 13.1504 0.335786 13.1504 0.75C13.1504 1.16421 12.8146 1.5 12.4004 1.5H1.40039C0.986177 1.5 0.650391 1.16421 0.650391 0.75ZM2.65039 4.75C2.65039 4.33579 2.98618 4 3.40039 4H10.4004C10.8146 4 11.1504 4.33579 11.1504 4.75C11.1504 5.16421 10.8146 5.5 10.4004 5.5H3.40039C2.98618 5.5 2.65039 5.16421 2.65039 4.75ZM4.65039 8.75C4.65039 8.33579 4.98618 8 5.40039 8H8.40039C8.8146 8 9.15039 8.33579 9.15039 8.75C9.15039 9.16421 8.8146 9.5 8.40039 9.5H5.40039C4.98618 9.5 4.65039 9.16421 4.65039 8.75Z"
                  fill="currentColor"
                />
              </svg>
              <span className="hidden font-medium sm:block">
                {sort || "Filter"}
              </span>
            </p>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="z-[3] w-40 grid divide-y divide-ash rounded-l-2xl rounded-b-2xl py-2 max-h-[300px] overflow-y-auto"
          >
            <PopoverClose>
              <button
                className="px-4 py-1.5 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => {
                  setSort("");
                  setIsOpen(false);
                }}
              >
                All
              </button>
            </PopoverClose>
            <PopoverClose>
              <button
                className="px-4 py-1.5 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => {
                  setSort("ongoing");
                  setIsOpen(false);
                }}
              >
                Ongoing
              </button>
            </PopoverClose>
            <PopoverClose>
              <button
                className="px-4 py-1.5 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                onClick={() => {
                  setSort("past");
                  setIsOpen(false);
                }}
              >
                Past
              </button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover>
          <PopoverTrigger className="flex items-center text-sm">
            <p className="h-10 sm:h-9 gap-2 min-w-10 sm:rounded-xl sm:px-4 rounded-full flex items-center justify-center sm:bg-hot/10 text-hot">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.650391 0.75C0.650391 0.335786 0.986177 0 1.40039 0H12.4004C12.8146 0 13.1504 0.335786 13.1504 0.75C13.1504 1.16421 12.8146 1.5 12.4004 1.5H1.40039C0.986177 1.5 0.650391 1.16421 0.650391 0.75ZM2.65039 4.75C2.65039 4.33579 2.98618 4 3.40039 4H10.4004C10.8146 4 11.1504 4.33579 11.1504 4.75C11.1504 5.16421 10.8146 5.5 10.4004 5.5H3.40039C2.98618 5.5 2.65039 5.16421 2.65039 4.75ZM4.65039 8.75C4.65039 8.33579 4.98618 8 5.40039 8H8.40039C8.8146 8 9.15039 8.33579 9.15039 8.75C9.15039 9.16421 8.8146 9.5 8.40039 9.5H5.40039C4.98618 9.5 4.65039 9.16421 4.65039 8.75Z"
                  fill="currentColor"
                />
              </svg>
              <span className="hidden font-medium sm:block">
                {`Class ${profile}` || "চেঞ্জ ক্লাস"}
              </span>
            </p>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="z-[3] w-40 grid divide-y divide-ash rounded-l-2xl rounded-b-2xl py-2 max-h-[300px] overflow-y-auto"
          >
            {profiles
              .filter((p) => p.level !== 0)
              .map((p) => {
                return (
                  <PopoverClose key={p.id}>
                    <button
                      className="px-4 py-1.5 w-full hover:bg-hot text-sm hover:text-white transition-all duration-300"
                      onClick={() => {
                        router.push(
                          `/homeworks?profile=${p.level}&step=1&uid=${user?.id}`
                        );
                        setIsOpen(false);
                        setTimeout(() => {
                          router.reload();
                        }, 150);
                      }}
                    >
                      Class {p.level}
                    </button>
                  </PopoverClose>
                );
              })}
          </PopoverContent>
        </Popover>
      )}
    </>
  );

  return (
    <div className="flex gap-2 items-center justify-between sm:rounded-xl bg-white p-3 sm:p-4 ring-1 ring-ash w-full">
      <h2 className="sm:text-lg text-base flex items-center gap-2 text-center font-semibold">
        <svg
          width="31"
          height="30"
          viewBox="0 0 31 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0.900391" width="30" height="30" rx="15" fill="#E6F3EC" />
          <path
            d="M11.5662 8.26248L11.5209 8.25394C10.9886 8.15379 10.5174 8.06514 10.1197 8.06256C9.67267 8.05966 9.26741 8.16321 8.89854 8.47539C8.51759 8.79779 8.35404 9.21288 8.28057 9.67893C8.21283 10.1087 8.21286 10.6474 8.21289 11.2785L8.21289 16.1607C8.21288 16.7445 8.21287 17.2289 8.25533 17.6133C8.29933 18.0117 8.39591 18.3869 8.65227 18.7003C8.91894 19.0263 9.30595 19.1938 9.71804 19.3148C10.1279 19.4351 10.6663 19.5363 11.3277 19.6607L11.3583 19.6664C12.5299 19.8868 13.4321 20.2356 14.0723 20.5768L14.086 20.5841C14.4148 20.7593 14.6798 20.9006 14.8828 20.997C14.9863 21.0461 15.0874 21.0903 15.1823 21.1229C15.2708 21.1533 15.3921 21.1875 15.5254 21.1875C15.8361 21.1875 16.0879 20.9357 16.0879 20.625V11.4C16.0879 11.3599 16.0879 11.3398 16.0898 11.3253C16.096 11.278 16.1016 11.2634 16.1292 11.2245C16.1377 11.2125 16.1612 11.1871 16.2082 11.1361C16.5177 10.8009 17.6424 10.0208 19.6895 9.6412C20.2607 9.53529 20.5957 9.4759 20.8469 9.47429C21.0495 9.473 21.1227 9.51014 21.1951 9.57051C21.252 9.61805 21.3148 9.69031 21.3567 9.95267C21.404 10.2481 21.4061 10.6545 21.4061 11.3071V13.3566C21.4061 13.7465 21.7266 14.0625 22.122 14.0625C22.5174 14.0625 22.8379 13.7465 22.8379 13.3566L22.8379 11.2554C22.8379 10.6705 22.838 10.1512 22.7711 9.73283C22.6969 9.26902 22.5275 8.83286 22.12 8.49287C21.728 8.1657 21.2963 8.05963 20.8376 8.06256C20.4415 8.06509 19.9775 8.15121 19.4784 8.24383L19.4249 8.25375C17.7645 8.56162 16.5457 9.12408 15.7879 9.64815C15.6434 9.74807 15.5712 9.79803 15.5017 9.79844C15.4322 9.79886 15.3598 9.75004 15.2149 9.6524C14.4422 9.13169 13.2223 8.57391 11.5662 8.26248Z"
            fill="#005E2F"
          />
          <path
            d="M20.8343 15.7904C21.0843 15.5404 21.2093 15.4154 21.3393 15.3403C21.6922 15.1366 22.127 15.1366 22.4799 15.3403C22.61 15.4154 22.735 15.5404 22.985 15.7904C23.235 16.0404 23.36 16.1654 23.4351 16.2955C23.6388 16.6484 23.6388 17.0832 23.4351 17.4361C23.36 17.5661 23.235 17.6911 22.985 17.9411L19.7541 21.172C19.2585 21.6676 18.5104 21.6878 17.8487 21.8293C17.3312 21.9399 17.0725 21.9953 16.9263 21.8491C16.7801 21.7029 16.8355 21.4442 16.9461 20.9267C17.0876 20.265 17.1078 19.5169 17.6034 19.0213L20.8343 15.7904Z"
            fill="#005E2F"
          />
        </svg>
        <span>হোমওয়ার্ক সমূহ</span>
      </h2>

      {/* mobile filter  */}
      <div className="flex sm:hidden items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger className="flex items-center">
            <span className="h-10 w-10 rounded-full flex items-center justify-center bg-hot/10 text-hot">
              <svg
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.650391 0.75C0.650391 0.335786 0.986177 0 1.40039 0H12.4004C12.8146 0 13.1504 0.335786 13.1504 0.75C13.1504 1.16421 12.8146 1.5 12.4004 1.5H1.40039C0.986177 1.5 0.650391 1.16421 0.650391 0.75ZM2.65039 4.75C2.65039 4.33579 2.98618 4 3.40039 4H10.4004C10.8146 4 11.1504 4.33579 11.1504 4.75C11.1504 5.16421 10.8146 5.5 10.4004 5.5H3.40039C2.98618 5.5 2.65039 5.16421 2.65039 4.75ZM4.65039 8.75C4.65039 8.33579 4.98618 8 5.40039 8H8.40039C8.8146 8 9.15039 8.33579 9.15039 8.75C9.15039 9.16421 8.8146 9.5 8.40039 9.5H5.40039C4.98618 9.5 4.65039 9.16421 4.65039 8.75Z"
                  fill="#242424"
                />
              </svg>
            </span>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="z-[3] grid divide-y divide-ash py-2 max-h-[300px] overflow-y-auto"
          >
            <div className="grid gap-2">{filters}</div>
          </PopoverContent>
        </Popover>
      </div>

      {/* desktop filters  */}
      <div className="sm:flex hidden items-center gap-4">{filters}</div>
    </div>
  );
};
