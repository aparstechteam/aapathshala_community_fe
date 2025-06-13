/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input, useUser } from "@/components";
import { ValidImage } from "@/components/shared/ValidImage";
import Image from "next/image";
import { cn } from "@/lib/utils";
import * as React from "react";
import { Loader2, LoaderCircle, X } from "lucide-react";

export interface IAppProps {
  authorId?: string;
}

export default function CreateReply(props: IAppProps) {
  const { user } = useUser();
  const [preview, setPreview] = React.useState<string>("");
  const [commentText, setCommentText] = React.useState<string>("");
  const [imgUploading, setImgUploading] = React.useState<boolean>(false);
  const [replying, setReplying] = React.useState<boolean>(false);

  return (
    <div>
      <div
        className={cn(
          "flex gap-2 pb-8",
          !!preview ? "items-start" : "items-center"
        )}
      >
        <div
          className={cn(
            "flex justify-between w-full gap-4",
            !!preview ? "items-start" : "items-center"
          )}
          id="commentbox"
        >
          <ValidImage src={user?.image || ""} alt={user?.name || ""} />
          <div className="flex-1 pt-1">
            <Input
              type="text"
              className="!bg-transparent !h-full !rounded-full !text-gray-900 dark:!text-gray-100"
              value={commentText}
              onChange={(e) => {
                e.preventDefault();
                setCommentText(e.target.value);
              }}
              placeholder={`Reply to Student's HW`}
            />
            {/* <span className="text-xs font-semibold text-teal-500">Replying to @{mention}</span> */}
            {preview && (
              <div className="w-full h-full flex justify-center py-4">
                <div className="max-w-[180px] min-h-[180px] relative">
                  <div>
                    <Image
                      src={preview as string}
                      alt="preview"
                      width={180}
                      height={180}
                      className="rounded-lg object-contain ring-1 ring-ash"
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute duration-300 hover:opacity-100 opacity-0 rounded-lg top-0 right-0 w-full h-full flex items-center justify-center hover:bg-black/40"
                  >
                    <span className="p-2 rounded-lg bg-red-500">
                      <X className="w-4 h-4 text-white" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="!rounded-full !cursor-pointer flex items-center gap-2 relative !text-black dark:!text-hot dark:bg-hot/20 bg-white p-2">
          <Input
            className="!p-0 opacity-0 absolute w-full h-full !cursor-pointer"
            type="file"
            accept="image/*"
            // onChange={handleImageChange}
          />
          {imgUploading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <svg
              className="cursor-pointer"
              width="22"
              height="21"
              viewBox="0 0 22 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="6.5"
                cy="6"
                r="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1.5 10.5C1.5 6.02166 1.5 3.78249 2.89124 2.39124C4.28249 1 6.52166 1 11 1C15.4783 1 17.7175 1 19.1088 2.39124C20.5 3.78249 20.5 6.02166 20.5 10.5C20.5 14.9783 20.5 17.2175 19.1088 18.6088C17.7175 20 15.4783 20 11 20C6.52166 20 4.28249 20 2.89124 18.6088C1.5 17.2175 1.5 14.9783 1.5 10.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M4 19.4999C8.37246 14.275 13.2741 7.384 20.4975 12.0424"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </div>

        <div
          className={cn(
            !commentText ? "text-light" : "text-hot bg-hot/10",
            "duration-300 rounded-full transition-all text-right"
          )}
        >
          <button
            type="submit"
            disabled={!commentText}
            // onClick={submitComment}
            className="!rounded-full p-2"
          >
            {replying ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.4164 9.30198L2.29277 1.43678C2.15411 1.36914 2.00184 1.33398 1.84755 1.33398C1.2867 1.33398 0.832031 1.78865 0.832031 2.3495V2.37881C0.832031 2.51508 0.84874 2.65083 0.88179 2.78303L2.42843 8.96957C2.47067 9.13857 2.61355 9.2634 2.78665 9.28265L9.58462 10.038C9.82036 10.0642 9.9987 10.2634 9.9987 10.5007C9.9987 10.7379 9.82036 10.9372 9.58462 10.9633L2.78665 11.7187C2.61355 11.7379 2.47067 11.8627 2.42843 12.0317L0.88179 18.2182C0.84874 18.3505 0.832031 18.4862 0.832031 18.6225V18.6518C0.832031 19.2127 1.2867 19.6673 1.84755 19.6673C2.00184 19.6673 2.15411 19.6322 2.29277 19.5645L18.4164 11.6993C18.8746 11.4758 19.1654 11.0106 19.1654 10.5007C19.1654 9.99074 18.8746 9.52548 18.4164 9.30198Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
