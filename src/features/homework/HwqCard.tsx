import { AlertTriangle, Loader2, Trash, X } from "lucide-react";
import React, { useState } from "react";
import { ValidImage } from "@/components/shared/ValidImage";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Tagtag,
  useUser,
} from "@/components";
import dynamic from "next/dynamic";
import { THomework, TSubmission } from "@/@types/homeworks";
import Link from "next/link";
import Image from "next/image";
import { secondaryAPI } from "@/configs";
import axios from "axios";
import { toast, useCloudflareImage } from "@/hooks";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { ImagePreview } from "@/components/shared/ImagePreview";
import { Gallery } from "@/components/shared/Gallery";
const AppMath = dynamic(() => import("../../components/contexts/MathJAX"), {
  ssr: false,
});

type Props = {
  homework: THomework;
  handleDelete: () => void;
  refetch?: () => void;
  setSubmissions?: (submissions: TSubmission) => void;
};

export const HwqCard = (props: Props) => {
  const { homework, handleDelete, setSubmissions } = props;
  const { user } = useUser();
  const { uploadImage } = useCloudflareImage();
  const router = useRouter();
  const uid = router.query.uid as string;
  const profile = router.query.profile as string;
  const deadline = homework?.deadline_formatted as string;
  const encodedUrl = encodeURIComponent(homework?.attachment_url as string);

  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imgUploading, setImgUploading] = useState(false);
  const [sure, setSure] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  async function submitHomework() {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        `${secondaryAPI}/api/homework/submit`,
        {
          homework_id: homework?.id,
          body: body,
          images: images,
          attachment_url: homework?.attachment_url,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (setSubmissions) setSubmissions(res.data);
      toast({
        title: "হোমওয়ার্ক জমা দেওয়া হয়েছে",
        description: "হোমওয়ার্ক জমা দেওয়া হয়েছে",
        variant: "success",
      });
      setBody("");
      setImages([]);
      setLoading(false);
      setSure(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setImgUploading(true);
      if (event.target.files) {
        const imageLinks = await Promise.all(
          Array.from(event.target.files).map(async (file) => {
            const imagelink = await uploadImage(file);
            return imagelink as string;
          })
        );
        setImages((prevImages) => prevImages.concat(imageLinks));
      }
      setImgUploading(false);
    } catch (error) {
      setImgUploading(false);
      console.log(error);
    }
  };

  const deleteModal = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[400px] p-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium pt-2">
            ডিলিট করুন
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="!text-base">
          আপনি কি নিশ্চিত যে আপনি এই হোমওয়ার্কটি ডিলিট করতে চান?
        </DialogDescription>
        <DialogFooter>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              handleDelete();
              setIsOpen(false);
            }}
          >
            ডিলিট করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const menu = homework?.user_id === user?.id && (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="flex disabled:opacity-50 !outline-none items-center justify-center bg-hot/10 hover:bg-hot/20 text-hot !rounded-full"
      onClick={() => setIsOpen(true)}
    >
      <Trash className="h-4 w-4" />
    </Button>
  );

  const submissionModal = (
    <Dialog open={sure} onOpenChange={setSure}>
      <DialogContent className="max-w-[400px] p-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium pt-2">
            তুমি তোমার হোমওয়ার্ক সাবমিট করতে চাও ?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="!text-sm">
          তুমি একবার হোমওয়ার্ক সাবমিট করে দিলে পরবর্তীতে তা আর এডিট বা ডিলেট
          করতে পারবে না। হোমওয়ার্ক ছাড়া অন্য কিছু সাবমিট করলে তোমাকে ব্যান করা
          হবে।
        </DialogDescription>
        <DialogFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSure(false);
              setLoading(false);
              setError("");
              setBody("");
              setImages([]);
            }}
          >
            Cancel
          </Button>
          <Button size="sm" variant="secondary" onClick={submitHomework}>
            {loading ? <Loader2 className="animate-spin" /> : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const pdf_url = `https://docs.google.com/viewerng/viewer?url=${encodedUrl}`;

  const handleDeleteImage = (image: string) => {
    setImages(images.filter((img) => img !== image));
  };

  return (
    <div className="w-full p-4 ring-1 ring-ash bg-white sm:rounded-xl">
      <div className="border-0 shadow-none">
        {deleteModal}
        {submissionModal}
        <ImagePreview
          selectedImage={selectedImage || ""}
          setSelectedImage={setSelectedImage}
          images={homework?.images || []}
        />
        <div className="grid gap-4 px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              <div>
                <div className="h-10 w-10 ring-2 ring-hot rounded-full">
                  <ValidImage
                    src={homework?.user_image || ""}
                    alt="Teacher"
                    height={40}
                    width={40}
                    className="h-[40px] object-cover w-[40px]"
                  />
                </div>
              </div>
              <div className="w-full grid gap-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/users/${homework?.user_id}`}
                    className="font-semibold hover:text-hot duration-300"
                  >
                    {homework?.user_name}
                  </Link>
                  <Tagtag tags={["TEACHER"]} />
                </div>
                <div className="text-sm w-full flex justify-between gap-2">
                  <p>
                    {homework?.subject_name} · {homework?.chapter_name} .
                  </p>

                  {!homework?.has_ended ? (
                    <p className="flex items-center gap-2 text-amber-600 text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{deadline}</span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-hot text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">সময় শেষ</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">{menu}</div>
          </div>
        </div>

        <div>
          <h2 className="text-xl py-2 text-black font-extrabold">
            {homework?.topic}
          </h2>
          {homework?.body && (
            <div className="w-full py-4">
              <AppMath formula={homework?.body || ""} />
            </div>
          )}

          <div className="grid gap-4">
            {homework?.attachment_url && (
              <div className="p-2 bg-ice/10 ring-1 ring-ice/50 rounded-xl">
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-14 sm:h-16 rounded-lg bg-red-100 relative overflow-hidden">
                    {homework?.attachment_url ? (
                      <div className="cursor-pointer relative h-full z-[4] w-full">
                        <Link
                          href={pdf_url}
                          passHref
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Image
                            src={"/icons/pdf_file.png"}
                            alt="Attachment"
                            fill
                            className="object-contain p-2"
                          />
                        </Link>
                      </div>
                    ) : (
                      <div className="w-full h-full p-1">
                        <p className="text-sm sm:text-base text-center">
                          No attachment
                        </p>
                      </div>
                    )}
                  </div>
                  <Link
                    href={pdf_url}
                    passHref
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h4 className="font-medium">{homework?.topic}</h4>
                    <p className="text-sm text-muted-foreground">
                      হোমওয়ার্ক দেখতে ক্লিক করো
                    </p>
                  </Link>
                </div>
              </div>
            )}

            <Gallery
              images={homework?.images || []}
              setSelectedImage={setSelectedImage}
            />

            {/* Submit Homework */}
            {router.pathname === "/homework/[slug]" &&
              user.level !== 0 &&
              !homework?.has_submitted && (
                <div
                  className={cn(
                    "items-center justify-between gap-2 py-2",
                    homework?.has_ended ? "hidden" : "flex"
                  )}
                >
                  <Input
                    className={cn(
                      "w-full !rounded-full !duration-300 !transition-all",
                      error && "!ring-2 !ring-red-500"
                    )}
                    placeholder="হোমওয়ার্ক জমা দাও"
                    value={body}
                    onChange={(e) => {
                      setError("");
                      setBody(e.target.value);
                    }}
                  />

                  <div
                    className={cn(
                      "relative cursor-pointer duration-300 hover:text-elegant text-light"
                    )}
                  >
                    <Input
                      className={cn(
                        "!p-0 opacity-0 absolute w-full h-full !cursor-pointer"
                      )}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple={true}
                    />

                    {imgUploading ? (
                      <span className="flex items-center p-2 gap-2">
                        <Loader2 className="animate-spin text-center mb-1" />
                      </span>
                    ) : (
                      <p className="flex items-center p-2 gap-2">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.5 2C4.94772 2 4.5 2.44772 4.5 3C4.5 3.55228 4.94772 4 5.5 4H18.5C19.0523 4 19.5 3.55228 19.5 3C19.5 2.44772 19.0523 2 18.5 2H5.5ZM12.7071 5.79289C12.3166 5.40237 11.6834 5.40237 11.2929 5.79289L6.29289 10.7929C5.90237 11.1834 5.90237 11.8166 6.29289 12.2071C6.68342 12.5976 7.31658 12.5976 7.70711 12.2071L11 8.91421V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V8.91421L16.2929 12.2071C16.6834 12.5976 17.3166 12.5976 17.7071 12.2071C18.0976 11.8166 18.0976 11.1834 17.7071 10.7929L12.7071 5.79289Z"
                            fill="#575757"
                          />
                        </svg>
                      </p>
                    )}
                  </div>
                  <div>
                    <Button
                      size="icon"
                      className="bg-hot/10"
                      onClick={() => {
                        if (!body && images.length === 0) {
                          setError(
                            "জমা দেওয়ার আগে টাইটেল এবং ছবি আপলোড করতে হবে।"
                          );
                          toast({
                            title: "Warning!",
                            description:
                              "জমা দেওয়ার আগে টাইটেল এবং ছবি আপলোড করতে হবে।",
                            variant: "destructive",
                          });
                          return;
                        }
                        setSure(true);
                      }}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_3075_79455)">
                            <path
                              d="M18.4164 8.80394L2.29277 0.938738C2.15411 0.871096 2.00184 0.835938 1.84755 0.835938C1.2867 0.835938 0.832031 1.2906 0.832031 1.85145V1.88076C0.832031 2.01703 0.84874 2.15279 0.88179 2.28499L2.42843 8.47152C2.47067 8.64052 2.61355 8.76535 2.78665 8.7846L9.58462 9.53994C9.82036 9.5661 9.9987 9.76535 9.9987 10.0026C9.9987 10.2399 9.82036 10.4391 9.58462 10.4653L2.78665 11.2206C2.61355 11.2399 2.47067 11.3647 2.42843 11.5337L0.88179 17.7202C0.84874 17.8524 0.832031 17.9882 0.832031 18.1244V18.1538C0.832031 18.7146 1.2867 19.1693 1.84755 19.1693C2.00184 19.1693 2.15411 19.1341 2.29277 19.0664L18.4164 11.2013C18.8746 10.9778 19.1654 10.5125 19.1654 10.0026C19.1654 9.49269 18.8746 9.02744 18.4164 8.80394Z"
                              fill="#008643"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_3075_79455">
                              <rect width="20" height="20" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              )}

            {images.length > 0 && (
              <div className="grid md:grid-cols-3 grid-cols-2 gap-2 sm:gap-3 p-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="w-full h-[300px] rounded-xl bg-cover bg-center relative"
                  >
                    <Image
                      src={image}
                      alt="Image"
                      fill
                      className="object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 hover:bg-hot/20 duration-300 rounded-xl w-full h-full flex items-center justify-center"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <span className="p-2 bg-hot/70 rounded-full">
                        <X className="w-4 h-4 text-white" />
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {user.level === 0 &&
              (homework?.has_submitted ? (
                <Link
                  href={`/homework/${homework?.id}?uid=${uid}&profile=${profile}`}
                  className="flex items-center justify-center p-4 rounded-xl font-semibold bg-hot/10 text-hot ring-2 ring-hot/20"
                >
                  আপনার সন্তান এই হোমওয়ার্কটি সাবমিট করেছে
                </Link>
              ) : (
                <Link
                  href={`/homework/${homework?.id}?uid=${uid}&profile=${profile}`}
                  className="flex items-center justify-center p-3 font-semibold rounded-xl bg-hot/10 text-hot ring-2 ring-hot/20"
                >
                  আপনার সন্তান এই হোমওয়ার্কটি সাবমিট করেনি।
                </Link>
              ))}

            <div
              className={cn(
                "grid grid-cols-2 gap-4 items-center justify-between",
                user.level === 0 && "hidden"
              )}
            >
              <Link
                href={
                  !!uid
                    ? `/homework/${homework?.id}?uid=${uid}&profile=${profile}`
                    : `/homework/${homework?.id}`
                }
                className="flex items-center gap-2 text-light hover:text-elegant duration-300"
              >
                <svg
                  width="17"
                  height="20"
                  viewBox="0 0 17 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.5667 10.8346V4.79214C14.5668 4.72636 14.5539 4.66121 14.5287 4.60044C14.5035 4.53966 14.4666 4.48445 14.4201 4.43797L11.7967 1.81464C11.7031 1.72084 11.576 1.66809 11.4434 1.66797H1.7334C1.60079 1.66797 1.47361 1.72065 1.37985 1.81442C1.28608 1.90818 1.2334 2.03536 1.2334 2.16797V17.8346C1.2334 17.9672 1.28608 18.0944 1.37985 18.1882C1.47361 18.282 1.60079 18.3346 1.7334 18.3346H9.56673"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.2334 1.66797V4.5013C11.2334 4.63391 11.2861 4.76109 11.3798 4.85486C11.4736 4.94862 11.6008 5.0013 11.7334 5.0013H14.5667M11.2334 15.8346H16.2334M16.2334 15.8346L13.7334 13.3346M16.2334 15.8346L13.7334 18.3346"
                    stroke="#575757"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {homework?.total_submissions}
                <span className="">Submissions</span>
              </Link>
              <div className="hidden invisible items-center justify-center gap-2 text-light hover:text-elegant duration-300">
                <svg
                  width="17"
                  height="13"
                  viewBox="0 0 17 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.18072 1.78033C6.47361 1.48744 6.47361 1.01256 6.18072 0.71967C5.88783 0.426777 5.41295 0.426777 5.12006 0.71967L0.620061 5.21967C0.327167 5.51256 0.327167 5.98744 0.620061 6.28033L5.12006 10.7803C5.41295 11.0732 5.88783 11.0732 6.18072 10.7803C6.47361 10.4874 6.47361 10.0126 6.18072 9.71967L2.96105 6.5H9.15039C12.326 6.5 14.9004 9.07436 14.9004 12.25C14.9004 12.6642 15.2362 13 15.6504 13C16.0646 13 16.4004 12.6642 16.4004 12.25C16.4004 8.24594 13.1545 5 9.15039 5H2.96105L6.18072 1.78033Z"
                    fill="#575757"
                  />
                </svg>
                0 <span className="hidden sm:block">Reply</span>
              </div>
              {homework?.has_submitted ? (
                <div className="flex items-center justify-end">
                  <p className="text-sm rounded-full bg-hot/10 px-4 py-1 text-hot">
                    জমা দেওয়া হয়েছে
                  </p>
                </div>
              ) : homework?.has_ended ? (
                <div className="flex items-center justify-end">
                  <p className="text-sm rounded-full bg-hot/10 px-4 py-1 text-hot">
                    জমা দেওয়ার সময় শেষ
                  </p>
                </div>
              ) : (
                user.level !== 0 &&
                router.pathname !== "/homework/[slug]" && (
                  <div className="flex items-center justify-end">
                    <Link
                      href={
                        !!uid
                          ? `/homework/${homework?.id}?uid=${uid}`
                          : `/homework/${homework?.id}`
                      }
                      className="text-sm rounded-full bg-light/10 px-4 py-1 text-light"
                    >
                      হোমওয়ার্ক জমা দাও
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
