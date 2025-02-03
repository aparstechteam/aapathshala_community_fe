/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  DashCard,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  formatBnNumber,
  Input,
  Label,
  PostSkeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tagtag,
  Textarea,
  useDebounce,
  useUser,
} from "@/components";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { UserComments } from "../comments";
import Router, { useRouter } from "next/router";
import {
  BookOpenText,
  Check,
  ImageUp,
  Loader2,
  UserPen,
  UserRoundPlus,
  UserRoundPlusIcon,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { secondaryAPI } from "@/configs";
import { Post } from "@/@types";
import { PostComponent } from "../posts";
import { handleError } from "@/hooks/error-handle";
import { useCloudflareImage } from "@/hooks";
import { Collection } from "@/pages/saved";
import { ValidImage } from "@/components/shared/ValidImage";
import Image from "next/image";
import Link from "next/link";
import { validateFbLink } from "@/hooks/link-validation";

type UserData = {
  id: string;
  name: string;
  school: string;
  profilePic: string;
  image: string;
  courses: string[];
  followers: number;
  following: number;
  bio: string;
  thana: string;
  district: string;
  is_paid: boolean;
  user_profile_pic: string;
  role: string;
  level: number;
  isFollowing: boolean;
  facebook: string;
  instagram: string;
  gender: string;
  religion: string;
  institute_name: string;
};

type DashboardData = {
  totalPosts: number;
  totalComments: number;
  totalSatisfied: number;
};

export type UserProfile = {
  userData: UserData
  dashboard: DashboardData
  course_enrolled: string[]
};

type Props = {
  userProfile: UserProfile;
  id: string;
  isFollowing?: boolean;
  setIsFollowing?: (f: boolean) => void;
};

export const ProfileComponent = (props: Props) => {

  const { userProfile, id, isFollowing, setIsFollowing } = props;

  const { uploadImage } = useCloudflareImage();
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const router = useRouter();
  const tab = router.query.tab as string;

  const [currTab, setCurrTab] = useState("posts");
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [imgloading, setImgLoading] = useState(false);
  const [error, setError] = useState("");
  const [bio, setBio] = useState(userProfile.userData?.bio || "");
  const [name, setName] = useState(userProfile.userData?.name || "");
  const [fb, setFb] = useState(userProfile.userData?.facebook || "");
  const [insta, setInsta] = useState(userProfile.userData?.instagram || "");
  const [gender, setGender] = useState(userProfile.userData?.gender || "");
  const [religion, setReligion] = useState(userProfile.userData?.religion || "");
  const [editOpen, setEditOpen] = useState(false);
  const [preview, setPreview] = useState(userProfile?.userData?.image || "");
  const [collections, setCollections] = useState<Collection[]>([]);

  const [openCourse, setOpenCourse] = useState(false);

  useEffect(() => {
    if (tab === 'courses') {
      setOpenCourse(true);
    }
  }, [tab]);

  useEffect(() => {
    async function getcollections() {
      try {
        const res = await axios.get(
          `${secondaryAPI}/api/post/saved_posts/collections`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (!!res.data) setCollections(res.data);
      } catch (error) {
        console.log(error);
      }
    }
    getcollections();
  }, []);

  const loadMoreTrigger = useRef<HTMLDivElement>(null);

  const toggleUnfollow = async () => {
    // if (isFollowing) return;

    try {
      setFollowLoading(false);
      const res = await axios.delete(
        `${secondaryAPI}/api/follow`,
        {
          data: {
            followingId: id,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (setIsFollowing) setIsFollowing(!isFollowing);
      setFollowLoading(false);
      toast({
        title: "Success!",
        description: `You're now unfollowing ${userProfile?.userData?.name}`,
      });
    } catch (error) {
      handleError(error as AxiosError, toggleFollow);
    }
  };

  const toggleFollow = async () => {
    if (isFollowing) {
      toggleUnfollow();
      return;
    }

    try {
      setFollowLoading(true);
      const res = await axios.post(
        `${secondaryAPI}/api/follow`,
        {
          followingId: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (setIsFollowing) setIsFollowing(!isFollowing);
      setFollowLoading(false);
      toast({
        title: "Success!",
        description: `You're now following ${userProfile?.userData?.name}`,
      });
    } catch (error) {
      handleError(error as AxiosError, toggleFollow);
    }
  };

  const dpage = useDebounce(page, 300);

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        // const baseUrl = `${secondaryAPI}/api/post/user/${id}`;
        // const params = new URLSearchParams({
        //     page: String(dpage),
        //     pageSize: "10",
        // });

        // const POST_API_URL = `${secondaryAPI}/api/post/user/${id}?page=${dpage}&pageSize=10`;

        const response = await axios.get(
          `${secondaryAPI}/api/post/user/${id}?page=${page}&pageSize=10`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "X-Key-Id": user?.id,
            },
          }
        );

        const newPosts = response.data.data;
        if (posts.length === 0) {
          setPosts(newPosts);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }
        setHasMore(newPosts.length > 0);
        setLoading(false);
        setIsFetching(false);
      } catch (err) {
        setError("Failed to fetch posts");
        setLoading(false);
        handleError(err as AxiosError, () => getPosts());
      }
    };

    if (user?.id) {
      getPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpage, user, id]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore || isFetching) return;

      const triggerElement = loadMoreTrigger.current;
      if (!triggerElement) return;

      const { top } = triggerElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (top <= windowHeight) {
        setIsFetching(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore]);

  useEffect(() => {
    if (!isFetching) return;

    setTimeout(() => {
      setPage(page + 1);
      setIsFetching(false);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  const updateReact = async (postId: string, t: string) => {
    const u = posts?.map((post) => {
      if (post.id === postId) {
        const existingReaction = post.reactions.find(
          (x) => x.user.id === user.id
        );
        if (existingReaction) {
          existingReaction.type = t;
        } else {
          post?.reactions?.push({
            type: t,
            user: {
              id: user?.id,
              name: user?.name,
              profilePic: user?.profilePic,
              role: user?.role as string,
            },
          });
        }
      }
      return post;
    });
    setPosts(u);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setImgLoading(true);
        // setImgSrc(file)
        const imagelink = await uploadImage(file as File);
        setPreview(imagelink as string);
        // setEditOpen(false)
        setImgLoading(false);
      } catch {
        setImgLoading(false);
        toast({
          title: "Image Upload Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  async function fetchUser() {
    try {
      const response = await axios.get(`${secondaryAPI}/api/auth/user`, {
        // withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (error) {
      handleError(error as AxiosError, fetchUser);
    }
  }

  async function handleSave() {
    try {
      setLoading(true);
      const res = await axios.put(
        `${secondaryAPI}/api/auth/update`,
        {
          name: name,
          facebook: fb,
          instagram: insta,
          bio: bio,
          image: preview,
          gender: gender
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log(res);
      setEditOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated",
        variant: "default",
      });
      localStorage.removeItem("user");
      fetchUser();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error as AxiosError);
      toast({
        title: "Profile Update Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }

  const handleBio = (value: string) => {
    if (value.length > 100) {
      toast({
        title: "Bio too long",
        description: "Bio must be less than 100 characters",
        variant: "destructive",
      });
      return;
    }
    setBio(value);
  };

  const [fberror, setfbError] = useState('')

  const [course, setCourse] = useState<string>('');

  async function handleAddCourse() {
    if (!course) {
      toast({
        title: "Course code is required",
        description: "Please enter a course code",
        variant: "destructive",
      });
      return;
    }
    try {
      await axios.post(`${secondaryAPI}/api/auth/verify-joining-id`, {
        joiningId: course
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      toast({
        title: "Course added",
        description: "You have been added to the course",
        variant: "default",
      });

    } catch (error) {
      handleError(error as AxiosError);
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error",
          description: error.response?.data.errors[0]?.message || "Please try again",
          variant: "destructive",
        });
      }
    }
  }

  const editprofile = (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="w-full max-w-md text-black bg-white rounded-xl shadow-md shadow-ash p-4">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="relative flex items-center justify-center cursor-pointer duration-300 hover:text-elegant text-light">
            <Input
              disabled={imgloading}
              className="!p-0 !opacity-0 !bg-transparent !text-transparent absolute w-full h-full !cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {imgloading ? (
              <Loader2 className="animate-spin text-center mb-1" />
            ) : (
              <p className="flex items-center gap-2">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="rounded-lg object-cover h-20 w-20"
                  />
                ) : (
                  <span className="text-base flex items-center mx-auto justify-center h-20 w-20 text-center rounded-xl ring-2 ring-ash">
                    <ImageUp size={40} strokeWidth={1.1} />
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">নাম</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="name"
              placeholder="Name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Update Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => handleBio(e.target.value)}
              id="bio"
              placeholder="Bio"
            />
            <p className="text-xs text-light text-end">
              Characters left: {100 - bio.length}/100
            </p>
          </div>
          <div className='w-full grid grid-cols-2 gap-x-4 gap-y-2'>
            <Label className='col-span-2'>তুমি একজন</Label>
            <button onClick={() => {
              setError('')
              setGender('MALE')
            }} type='button'
              className={cn('text-sm text-black ring-2 h-10 duration-300 px-4 py-0.5 rounded-lg',
                (error && !gender) ? 'ring-hot' :
                  gender === 'MALE' ? 'ring-olive' :
                    gender !== 'MALE' && 'ring-ash',
              )}>
              ছাত্র
            </button>

            <button onClick={() => {
              setGender('FEMALE')
              setError('')
            }}
              type='button'
              className={cn('text-sm text-black ring-2 h-10 duration-300 px-4 py-1 rounded-lg',
                (error && !gender) ? 'ring-hot' :
                  gender === 'FEMALE' ? 'ring-olive' :
                    gender !== 'FEMALE' && 'ring-ash',
              )}>
              ছাত্রী
            </button>


          </div>
          <div className='w-full'>

            <div className='flex flex-col gap-3'>
              <Label>তোমার ধর্ম কী?</Label>
              <Select disabled value={religion}
                onValueChange={(value) => {
                  setReligion(value)
                  setError('')
                }}>
                <SelectTrigger className={cn("w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                  error && !religion && "ring-hot ring-2"
                )}>
                  <SelectValue placeholder={"তুমি কোন ধর্মের অনুসারী?"} />
                </SelectTrigger>
                <SelectContent align='start' className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]">

                  <SelectItem value={'ISLAM'} className='hover:!text-white !text-black dark:text-white'>
                    ইসলাম
                  </SelectItem>

                  <SelectItem value={'SANATAN'} className='hover:!text-white !text-black dark:text-white'>
                    সনাতন
                  </SelectItem>
                  <SelectItem value={'CHRISTIANITY'} className='hover:!text-white !text-black dark:text-white'>
                    খৃষ্টান
                  </SelectItem>

                  <SelectItem value={'OTHERS'} className='hover:!text-white text-black dark:text-white'>
                    অন্যান্য
                  </SelectItem>

                </SelectContent>
              </Select>
              {error && !religion && <p className='text-hot text-xs'>
                ধর্ম সিলেক্ট করো
              </p>}
            </div>
          </div>
          <h2 className="text-sm font-medium text-black">তোমার সোশ্যাল মিডিয়া</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="facebook">
              <Image src={"/facebook.png"} alt="facebook" width={30} height={30} />
            </Label>
            <Input className={cn("!h-10 !shadow-none !rounded-lg", fberror === 'fb' && '!ring-hot !ring-2')} value={fb} onChange={(e) => {
              if (!!validateFbLink(e.target.value)) {
                setFb(e.target.value)
                setfbError('')
              } else {
                setFb(e.target.value)
                setfbError('fb')
                toast({
                  title: "Invalid Facebook Link",
                  description: "Please enter a valid Facebook link",
                  variant: "destructive",
                });
              }
            }} id="facebook" placeholder="Facebook" />
            {fberror === 'fb' &&
              <span className="text-xs text-hot">
                Please enter a valid Facebook link
              </span>
            }
          </div>

          <div className="hidden items-center gap-2">
            <Label htmlFor="instagram">
              <Image src={"/instagram.png"} alt="instagram" width={30} height={30} />
            </Label>
            <Input className="!h-10 !shadow-none !rounded-lg" value={insta} onChange={(e) => setInsta(e.target.value)} id="instagram" placeholder="Instagram" />
          </div>

        </div>
        <DialogFooter className="!flex !items-center !justify-end gap-2">
          <Button className="w-20" variant="destructive" size="sm">
            Cancel
          </Button>
          <Button
            className="w-20"
            onClick={handleSave}
            variant="secondary"
            size="sm"
          >
            {loading ? (
              <Loader2 className="animate-spin text-center" />
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const courseDialog = (
    <Dialog open={openCourse} onOpenChange={setOpenCourse}>
      <DialogContent className="!w-full !max-w-md text-black !bg-white rounded-xl shadow-md shadow-ash p-4">
        <DialogHeader>
          <DialogTitle>কোর্স যোগ করো</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>কোর্স কোড</Label>
          <Input
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (course.length === 0) {
                  toast({
                    title: "Course code is required",
                    description: "Please enter a course code",
                    variant: "destructive",
                  });
                  return;
                }
                handleAddCourse()
              }
            }} placeholder="কোর্স কোড" value={course} onChange={(e) => setCourse(e.target.value)} />
        </div>
        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="destructive" className="!w-16 !text-xs" onClick={() => setOpenCourse(false)}>Cancel</Button>
            <Button size="sm" type="button" variant="secondary" className="!w-16 !text-xs"
              onClick={(e) => {
                e.preventDefault()
                handleAddCourse()
              }}>Add</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {editprofile}
      {courseDialog}
      <div className="w-full min-h-screen bg-[#f5f5f5] dark:bg-[#171717] z-0 text-gray-900">
        <div className="max-w-6xl grid grid-cols-1 px-0 md:px-4 w-full mx-auto">
          {/* Cover & Profile Photo  */}
          <div className="w-full p-5 bg-white dark:bg-gray-800/20 rounded-xl shadow-md shadow-ash dark:shadow-ash/20 mt-4">
            <button
              type="button"
              onClick={() => Router.back()}
              className="flex items-center gap-2 text-base sm:text-lg font-semibold text-black/80 dark:text-white mb-4"
            >
              <svg
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.29492 15.7162C7.68833 16.1038 8.32148 16.0991 8.7091 15.7057C9.09672 15.3123 9.09203 14.6792 8.69862 14.2915L3.32827 9.00014H16.9995C17.5517 9.00014 17.9995 8.55243 17.9995 8.00014C17.9995 7.44786 17.5517 7.00014 16.9995 7.00014H3.33488L8.69862 1.71525C9.09203 1.32763 9.09672 0.694485 8.7091 0.301079C8.32148 -0.0923269 7.68833 -0.0970152 7.29492 0.290606L0.370733 7.11299C-0.126181 7.6026 -0.126182 8.40419 0.370733 8.8938L7.29492 15.7162Z"
                  fill="currentColor"
                />
              </svg>
              <span>কমিউনিটি প্রোফাইল</span>
            </button>
            <div className="z-[2] sm:flex grid items-center gap-4">
              <div className="max-w-[100px]">
                <div className="h-[100px] w-[100px] relative">
                  <ValidImage
                    height={100}
                    width={100}
                    src={preview}
                    className="rounded-full z-[4] h-[100px] w-[100px]"
                    alt="User Image"
                  />
                </div>

              </div>

              <div className="flex justify-between w-full gap-2">
                <div>
                  <div className="flex flex-col gap-3">
                    <div className="grid items-center gap-1">
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg flex items-center gap-2 sm:text-xl font-semibold text-gray-900">

                          {userProfile.userData.name}
                          <span>
                            <Image src={userProfile.userData.gender === 'MALE' ?
                              'https://img.icons8.com/officel/80/male.png' :
                              'https://img.icons8.com/officel/80/female.png'} alt="gender" width={20} height={20} />
                          </span>
                        </h1>
                        {userProfile.userData?.role !== "USER" && (
                          <span>
                            <Tagtag tags={[userProfile.userData?.role || "User"]} />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                      <span>{userProfile?.userData?.followers} Followers</span>
                      <span>•</span>
                      <span>{userProfile?.userData?.following} Following</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {userProfile?.course_enrolled?.map((course: string) => (
                        <span className="text-sm text-elegant hover:text-white hover:bg-elegant duration-300 px-3 py-0.5 rounded-full bg-elegant/10" key={course}>{course}</span>
                      ))}
                      <button type="button" onClick={() => setOpenCourse(true)} className="text-sm text-olive px-3 py-0.5 rounded-full bg-olive/10 hover:bg-olive hover:text-white transition-colors duration-300">Add +</button>
                    </div>
                  </div>

                  <Tabs
                    className="hidden"
                    value={currTab}
                    onValueChange={(value) => setCurrTab(value)}
                  >
                    <TabsList className="!bg-gray-100 !rounded-full !w-full">
                      <TabsTrigger
                        className="!rounded-full w-full"
                        value="dashboard"
                      >
                        Comments
                      </TabsTrigger>
                      <TabsTrigger
                        className="!rounded-full w-full"
                        value="posts"
                      >
                        Posts
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts"></TabsContent>
                    <TabsContent value="comments"></TabsContent>
                  </Tabs>
                </div>
                <div>

                  {user.id !== userProfile?.userData?.id && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={toggleFollow}
                      className={cn("text-white px-5 !rounded-lg !ring-0 !shadow-none flex items-center gap-2 transition-colors",
                        isFollowing ? "bg-olive hover:bg-olive/90" : "bg-sky-500 hover:bg-sky-600")}
                    >
                      {followLoading ? (
                        <Loader2 className="animate-spin text-center" />
                      ) : (isFollowing ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <UserRoundPlusIcon className="h-4 w-4" />
                      ))}
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="gap-4 pb-4 w-full px-5 bg-white dark:bg-[#171717] pt-8 hidden">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl flex items-center gap-1 font-semibold capitalize truncate">
                  {userProfile?.userData?.name}
                </h2>
                {user.id !== userProfile?.userData?.id ? (
                  <Button
                    size="sm"
                    disabled={followLoading}
                    onClick={toggleFollow}
                    type="button"
                    className="bg-white text-olive !rounded-none !p-0 !ring-0 !shadow-none"
                  >
                    {isFollowing ? <Check /> : <UserRoundPlus />}
                    <span
                      className={cn(
                        "pt-1 text-sm font-semibold",
                        isFollowing ? "text-olive" : "text-gray-500"
                      )}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={followLoading}
                    onClick={() => Router.push(`/profile/edit`)}
                    type="button"
                    className="bg-white text-olive !rounded-none !p-0 !ring-0 !shadow-none"
                  >
                    <UserPen />
                    <span
                      className={cn(
                        "pt-1 text-sm font-semibold",
                        isFollowing ? "text-olive" : "text-gray-500"
                      )}
                    >
                      Edit Profile
                    </span>
                  </Button>
                )}
              </div>
              <h2 className="font-medium text-light">
                <span className="text-sm font-semibold">
                  {userProfile?.userData?.followers} Followers |{" "}
                </span>
                <span className="text-sm font-semibold">
                  {userProfile?.userData?.following} Following
                </span>
              </h2>
            </div>
          </div>

          <div>
            <div className="w-full p-5 space-y-2 bg-white dark:shadow-olive/20 dark:bg-green-800/10 rounded-lg shadow md:hidden block">
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-semibold text-black dark:text-white">
                  Intro
                </h2>
                <h2 className="text-base font-medium text-light text-center">
                  <span className={cn(!bio && "italic")}>
                    {bio || "[ No bio added yet ]"}
                  </span>
                </h2>

                <h4 className="text-base text-black font-medium flex items-start gap-2">
                  <span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.793 11.195C13.9385 10.7584 14.4105 10.5225 14.8471 10.668C14.9289 10.6953 15.0108 10.7223 15.0921 10.7491C15.415 10.8556 15.7297 10.9594 16.0037 11.0679C16.3525 11.206 16.7085 11.3786 17.0152 11.6388C17.6971 12.2176 17.9169 13.0325 17.9169 14.0938V18.1252C17.9169 18.5855 17.5438 18.9586 17.0836 18.9586C16.6233 18.9586 16.2502 18.5855 16.2502 18.1252V14.0938C16.2502 13.2454 16.0766 13.0282 15.9367 12.9095C15.8325 12.8211 15.6706 12.7286 15.39 12.6174C15.1658 12.5286 14.9124 12.445 14.597 12.3409C14.5097 12.312 14.4176 12.2816 14.32 12.2491C13.8834 12.1036 13.6475 11.6317 13.793 11.195Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.2489 11.195C6.39444 11.6317 6.15848 12.1036 5.72186 12.2491C5.62432 12.2816 5.53223 12.312 5.44489 12.3409C5.12954 12.445 4.87612 12.5286 4.65188 12.6174C4.37129 12.7286 4.2094 12.8211 4.10519 12.9095C3.96534 13.0282 3.79167 13.2454 3.79167 14.0938V18.1252C3.79167 18.5855 3.41857 18.9586 2.95833 18.9586C2.4981 18.9586 2.125 18.5855 2.125 18.1252V14.0938C2.125 13.0325 2.34482 12.2176 3.02671 11.6388C3.33337 11.3786 3.68942 11.206 4.03818 11.0679C4.31216 10.9594 4.62687 10.8556 4.94976 10.7491C5.0311 10.7223 5.11295 10.6953 5.19481 10.668C5.63143 10.5225 6.10336 10.7584 6.2489 11.195Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.833008 18.1253C0.833008 17.6651 1.2061 17.292 1.66634 17.292H18.333C18.7932 17.292 19.1663 17.6651 19.1663 18.1253C19.1663 18.5856 18.7932 18.9587 18.333 18.9587H1.66634C1.2061 18.9587 0.833008 18.5856 0.833008 18.1253Z"
                        fill="#757575"
                      />
                      <path
                        d="M13.3333 4.77707H10.625V5.83356C10.625 6.17873 10.3452 6.45856 10 6.45856C9.65484 6.45856 9.37501 6.17873 9.37501 5.83356V2.47551L9.37501 2.44681C9.37494 2.2747 9.37487 2.08924 9.39578 1.93281C9.42021 1.75004 9.48296 1.51637 9.67881 1.31937C10.0123 0.983935 10.4766 1.02936 10.7074 1.06983C10.991 1.11955 11.296 1.23172 11.5714 1.35195C12.1299 1.59574 12.7044 1.93451 13.0113 2.12347C13.8089 2.61464 13.9583 3.53793 13.9583 4.15207C13.9583 4.49724 13.6785 4.77707 13.3333 4.77707Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.33797 5.38282C9.52787 5.2862 9.74361 5.20801 9.99968 5.20801C10.2557 5.20801 10.4715 5.2862 10.6614 5.38282C10.8316 5.46941 11.02 5.59213 11.2193 5.72192L12.9998 6.88113C13.3544 7.11195 13.6564 7.30853 13.8924 7.49627C14.1441 7.69645 14.3569 7.91359 14.5127 8.20249C14.6682 8.49103 14.7331 8.78865 14.7632 9.1098C14.7914 9.41171 14.7914 9.77458 14.7913 10.2019V18.333C14.7913 18.6782 14.5115 18.958 14.1663 18.958H11.6691C12.013 18.9566 12.2913 18.6773 12.2913 18.333L12.2914 15.7957V15.7957V15.7957C12.2914 15.435 12.2914 15.1043 12.2553 14.8353C12.2154 14.5391 12.1217 14.226 11.8642 13.9685C11.6067 13.711 11.2936 13.6173 10.9974 13.5774C10.7283 13.5413 10.3977 13.5413 10.037 13.5413H9.96239C9.60171 13.5413 9.27102 13.5413 9.00201 13.5774C8.70577 13.6173 8.39267 13.711 8.13515 13.9685C7.87763 14.226 7.78392 14.5391 7.7441 14.8353C7.70793 15.1044 7.70797 15.435 7.70801 15.7957L7.70801 18.333C7.70801 18.6773 7.98638 18.9566 8.33031 18.958H5.83301C5.48783 18.958 5.20801 18.6782 5.20801 18.333V10.2019V10.2019C5.208 9.77457 5.20799 9.41171 5.2362 9.1098C5.26621 8.78865 5.33112 8.49103 5.48667 8.20249C5.64241 7.91359 5.85522 7.69645 6.10693 7.49627C6.34301 7.30853 6.64496 7.11195 6.99952 6.88113L6.99953 6.88113L8.78004 5.72192L8.78005 5.72191L8.78006 5.72191C8.97935 5.59213 9.1678 5.4694 9.33797 5.38282ZM8.33572 18.958H11.6636C11.3197 18.9566 11.0413 18.6773 11.0413 18.333V15.833C11.0413 15.4225 11.04 15.1775 11.0164 15.0019C10.9976 14.8616 10.9645 14.8343 10.8308 14.8163C10.6552 14.7927 10.4102 14.7913 9.99968 14.7913C9.58918 14.7913 9.34417 14.7927 9.16857 14.8163C9.03483 14.8343 9.00181 14.8616 8.98295 15.0019C8.95934 15.1775 8.95801 15.4225 8.95801 15.833V18.333C8.95801 18.6773 8.67965 18.9566 8.33572 18.958ZM9.16634 10.833C9.16634 10.3728 9.53777 9.99967 9.99595 9.99967H10.0034C10.4616 9.99967 10.833 10.3728 10.833 10.833C10.833 11.2932 10.4616 11.6663 10.0034 11.6663H9.99595C9.53777 11.6663 9.16634 11.2932 9.16634 10.833Z"
                        fill="#757575"
                      />
                    </svg>
                  </span>
                  <span className={cn("capitalize")}>
                    {userProfile?.userData?.institute_name?.toLowerCase() ||
                      "ACS Future School"}
                  </span>
                </h4>

                <h4 className="text-base text-black font-medium flex items-start gap-2">
                  <span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.33333 2.29102C3.79357 2.29102 4.16667 2.66411 4.16667 3.12435V6.53965C4.16667 6.99988 3.79357 7.37298 3.33333 7.37298C2.8731 7.37298 2.5 6.99988 2.5 6.53965L2.5 3.12435C2.5 2.66411 2.8731 2.29102 3.33333 2.29102Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.66667 14.5826C6.66667 14.1223 6.29357 13.7492 5.83333 13.7492C5.3731 13.7492 5 14.1223 5 14.5826V17.2077C5 17.4434 5 17.5612 4.92678 17.6345C4.85355 17.7077 4.7357 17.7077 4.5 17.7077H2.5C2.15482 17.7077 1.875 17.4279 1.875 17.0827V10.7374C1.875 10.5925 1.875 10.52 1.91208 10.4742C1.94915 10.4283 2.03095 10.4108 2.19454 10.3758C2.58036 10.2933 2.9422 10.0846 3.21316 9.75631L5.81481 6.6043C5.92393 6.4721 5.97849 6.406 6.05215 6.40249C6.1258 6.39898 6.1864 6.45958 6.3076 6.58079L9.23933 9.51287C9.33274 9.60733 9.47083 9.74697 9.64983 9.88636C9.72182 9.94242 9.75781 9.97045 9.77474 10.0051C9.79167 10.0397 9.79167 10.0818 9.79167 10.1659L9.79167 17.0827C9.79167 17.4279 9.51185 17.7077 9.16667 17.7077H7.16667C6.93096 17.7077 6.81311 17.7077 6.73989 17.6345C6.66667 17.5612 6.66667 17.4434 6.66667 17.2077V14.5826ZM6.67318 10.4159C6.67318 10.8761 6.30175 11.2492 5.84357 11.2492H5.83612C5.37794 11.2492 5.00651 10.8761 5.00651 10.4159C5.00651 9.95565 5.37794 9.58255 5.83612 9.58255H5.84357C6.30175 9.58255 6.67318 9.95565 6.67318 10.4159Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.8832 10.4575C10.9335 10.4084 11.0267 10.4107 11.2132 10.4154C11.2922 10.4174 11.3622 10.417 11.42 10.4167L17.7924 10.4164C17.9484 10.4164 18.0264 10.4164 18.0752 10.4651C18.124 10.5138 18.1242 10.5915 18.1244 10.7469C18.1245 10.8326 18.1245 10.9201 18.1245 11.0094L18.1245 17.083C18.1245 17.4282 17.8447 17.708 17.4995 17.708H11.2063C10.9978 17.708 10.8935 17.708 10.844 17.654C10.7944 17.5999 10.8051 17.4763 10.8266 17.2289C10.8307 17.1808 10.8329 17.1322 10.8329 17.083V10.7678C10.8329 10.5936 10.8329 10.5065 10.8832 10.4575ZM14.9997 13.5413C15.3449 13.5413 15.6247 13.2615 15.6247 12.9163C15.6247 12.5712 15.3449 12.2913 14.9997 12.2913L13.333 12.2913C12.9878 12.2913 12.708 12.5712 12.708 12.9163C12.708 13.2615 12.9878 13.5413 13.333 13.5413L14.9997 13.5413Z"
                        fill="#757575"
                      />
                      <path
                        d="M14.3584 3.34152C13.8936 3.12382 13.3748 3.12438 12.7197 3.12508L5.83368 3.12516C5.828 3.12516 5.82233 3.12524 5.81667 3.12539C5.77849 3.12642 5.75941 3.12694 5.75575 3.12693C5.7521 3.12692 5.73787 3.12648 5.70942 3.12558C5.47961 3.11837 5.24898 3.21418 5.09038 3.40633L1.22136 8.0938C0.947774 8.42526 0.992131 8.91789 1.32044 9.19411C1.64875 9.47033 2.13668 9.42554 2.41027 9.09408L5.62476 5.1996C5.78843 5.00131 5.87026 4.90216 5.98074 4.89689C6.09123 4.89162 6.18213 4.98253 6.36393 5.16433L9.95066 8.75121C10.142 8.94366 10.3485 9.15138 10.6208 9.26415C10.893 9.37692 11.1859 9.37607 11.4573 9.37529L18.3337 9.37516C18.5762 9.37516 18.7968 9.23487 18.8997 9.01526C19.0025 8.79564 18.9691 8.53635 18.8138 8.35004L15.5737 4.46183C15.1549 3.95815 14.8232 3.55921 14.3584 3.34152Z"
                        fill="#757575"
                      />
                    </svg>
                  </span>

                  <span>
                    {userProfile?.userData?.thana || "Mirpur"},{" "}
                    {userProfile?.userData?.district || "Dhaka"}
                  </span>
                </h4>
                {userProfile?.userData?.facebook && (
                  <div>
                    <Link href={userProfile?.userData?.facebook || '#'} className="flex text-blue-700 font-semibold items-center gap-2">
                      <Image src='/facebook.png' height={20} width={20} alt="facebook" />
                      <span>@Facebook</span>
                    </Link>
                  </div>
                )}
              </div>
              {userProfile.userData.id === user?.id && (
                <div className="flex justify-center p-2 items-center w-full h-full">
                  <Button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 px-4 md:px-0 flex gap-4">
            <div className="w-[400px] content-between p-5 space-y-2 bg-white dark:shadow-olive/20 dark:bg-green-800/10 rounded-lg shadow hidden md:grid">
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-black dark:text-white">
                  Intro
                </h2>
                <h2 className="text-base font-medium text-light text-center">
                  <span className={cn(!userProfile?.userData?.bio && "italic")}>
                    {bio || "[ No bio added yet ]"}
                  </span>
                </h2>
                {userProfile.userData.level === 0 && (
                  <h4 className="py-1 px-4 bg-green-500/10 text-olive text-center dark:text-green-400 rounded-full">
                    Guardian Account
                  </h4>
                )}
                {userProfile.userData.level !== 0 && (
                  <>
                    <h4 className="text-base text-black font-medium flex items-start gap-2">
                      <span className="text-[#757575]">
                        <BookOpenText size={20} />
                      </span>
                      <div>
                        <span>
                          {" "}
                          Student of class {userProfile.userData.level}
                        </span>
                      </div>
                    </h4>

                    <h4 className="text-base text-black font-medium flex items-start gap-2">
                      <span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13.793 11.195C13.9385 10.7584 14.4105 10.5225 14.8471 10.668C14.9289 10.6953 15.0108 10.7223 15.0921 10.7491C15.415 10.8556 15.7297 10.9594 16.0037 11.0679C16.3525 11.206 16.7085 11.3786 17.0152 11.6388C17.6971 12.2176 17.9169 13.0325 17.9169 14.0938V18.1252C17.9169 18.5855 17.5438 18.9586 17.0836 18.9586C16.6233 18.9586 16.2502 18.5855 16.2502 18.1252V14.0938C16.2502 13.2454 16.0766 13.0282 15.9367 12.9095C15.8325 12.8211 15.6706 12.7286 15.39 12.6174C15.1658 12.5286 14.9124 12.445 14.597 12.3409C14.5097 12.312 14.4176 12.2816 14.32 12.2491C13.8834 12.1036 13.6475 11.6317 13.793 11.195Z"
                            fill="#757575"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.2489 11.195C6.39444 11.6317 6.15848 12.1036 5.72186 12.2491C5.62432 12.2816 5.53223 12.312 5.44489 12.3409C5.12954 12.445 4.87612 12.5286 4.65188 12.6174C4.37129 12.7286 4.2094 12.8211 4.10519 12.9095C3.96534 13.0282 3.79167 13.2454 3.79167 14.0938V18.1252C3.79167 18.5855 3.41857 18.9586 2.95833 18.9586C2.4981 18.9586 2.125 18.5855 2.125 18.1252V14.0938C2.125 13.0325 2.34482 12.2176 3.02671 11.6388C3.33337 11.3786 3.68942 11.206 4.03818 11.0679C4.31216 10.9594 4.62687 10.8556 4.94976 10.7491C5.0311 10.7223 5.11295 10.6953 5.19481 10.668C5.63143 10.5225 6.10336 10.7584 6.2489 11.195Z"
                            fill="#757575"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.833008 18.1253C0.833008 17.6651 1.2061 17.292 1.66634 17.292H18.333C18.7932 17.292 19.1663 17.6651 19.1663 18.1253C19.1663 18.5856 18.7932 18.9587 18.333 18.9587H1.66634C1.2061 18.9587 0.833008 18.5856 0.833008 18.1253Z"
                            fill="#757575"
                          />
                          <path
                            d="M13.3333 4.77707H10.625V5.83356C10.625 6.17873 10.3452 6.45856 10 6.45856C9.65484 6.45856 9.37501 6.17873 9.37501 5.83356V2.47551L9.37501 2.44681C9.37494 2.2747 9.37487 2.08924 9.39578 1.93281C9.42021 1.75004 9.48296 1.51637 9.67881 1.31937C10.0123 0.983935 10.4766 1.02936 10.7074 1.06983C10.991 1.11955 11.296 1.23172 11.5714 1.35195C12.1299 1.59574 12.7044 1.93451 13.0113 2.12347C13.8089 2.61464 13.9583 3.53793 13.9583 4.15207C13.9583 4.49724 13.6785 4.77707 13.3333 4.77707Z"
                            fill="#757575"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.33797 5.38282C9.52787 5.2862 9.74361 5.20801 9.99968 5.20801C10.2557 5.20801 10.4715 5.2862 10.6614 5.38282C10.8316 5.46941 11.02 5.59213 11.2193 5.72192L12.9998 6.88113C13.3544 7.11195 13.6564 7.30853 13.8924 7.49627C14.1441 7.69645 14.3569 7.91359 14.5127 8.20249C14.6682 8.49103 14.7331 8.78865 14.7632 9.1098C14.7914 9.41171 14.7914 9.77458 14.7913 10.2019V18.333C14.7913 18.6782 14.5115 18.958 14.1663 18.958H11.6691C12.013 18.9566 12.2913 18.6773 12.2913 18.333L12.2914 15.7957V15.7957V15.7957C12.2914 15.435 12.2914 15.1043 12.2553 14.8353C12.2154 14.5391 12.1217 14.226 11.8642 13.9685C11.6067 13.711 11.2936 13.6173 10.9974 13.5774C10.7283 13.5413 10.3977 13.5413 10.037 13.5413H9.96239C9.60171 13.5413 9.27102 13.5413 9.00201 13.5774C8.70577 13.6173 8.39267 13.711 8.13515 13.9685C7.87763 14.226 7.78392 14.5391 7.7441 14.8353C7.70793 15.1044 7.70797 15.435 7.70801 15.7957L7.70801 18.333C7.70801 18.6773 7.98638 18.9566 8.33031 18.958H5.83301C5.48783 18.958 5.20801 18.6782 5.20801 18.333V10.2019V10.2019C5.208 9.77457 5.20799 9.41171 5.2362 9.1098C5.26621 8.78865 5.33112 8.49103 5.48667 8.20249C5.64241 7.91359 5.85522 7.69645 6.10693 7.49627C6.34301 7.30853 6.64496 7.11195 6.99952 6.88113L6.99953 6.88113L8.78004 5.72192L8.78005 5.72191L8.78006 5.72191C8.97935 5.59213 9.1678 5.4694 9.33797 5.38282ZM8.33572 18.958H11.6636C11.3197 18.9566 11.0413 18.6773 11.0413 18.333V15.833C11.0413 15.4225 11.04 15.1775 11.0164 15.0019C10.9976 14.8616 10.9645 14.8343 10.8308 14.8163C10.6552 14.7927 10.4102 14.7913 9.99968 14.7913C9.58918 14.7913 9.34417 14.7927 9.16857 14.8163C9.03483 14.8343 9.00181 14.8616 8.98295 15.0019C8.95934 15.1775 8.95801 15.4225 8.95801 15.833V18.333C8.95801 18.6773 8.67965 18.9566 8.33572 18.958ZM9.16634 10.833C9.16634 10.3728 9.53777 9.99967 9.99595 9.99967H10.0034C10.4616 9.99967 10.833 10.3728 10.833 10.833C10.833 11.2932 10.4616 11.6663 10.0034 11.6663H9.99595C9.53777 11.6663 9.16634 11.2932 9.16634 10.833Z"
                            fill="#757575"
                          />
                        </svg>
                      </span>
                      <span className={cn("capitalize")}>
                        {userProfile?.userData?.institute_name?.toLowerCase() ||
                          "ACS Future School"}
                      </span>
                    </h4>
                  </>
                )}
                <h4
                  className={cn(
                    "text-base text-black font-medium flex items-start gap-2",
                    userProfile.userData.level === 0 ? "hidden" : ""
                  )}
                >
                  <span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.33333 2.29102C3.79357 2.29102 4.16667 2.66411 4.16667 3.12435V6.53965C4.16667 6.99988 3.79357 7.37298 3.33333 7.37298C2.8731 7.37298 2.5 6.99988 2.5 6.53965L2.5 3.12435C2.5 2.66411 2.8731 2.29102 3.33333 2.29102Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.66667 14.5826C6.66667 14.1223 6.29357 13.7492 5.83333 13.7492C5.3731 13.7492 5 14.1223 5 14.5826V17.2077C5 17.4434 5 17.5612 4.92678 17.6345C4.85355 17.7077 4.7357 17.7077 4.5 17.7077H2.5C2.15482 17.7077 1.875 17.4279 1.875 17.0827V10.7374C1.875 10.5925 1.875 10.52 1.91208 10.4742C1.94915 10.4283 2.03095 10.4108 2.19454 10.3758C2.58036 10.2933 2.9422 10.0846 3.21316 9.75631L5.81481 6.6043C5.92393 6.4721 5.97849 6.406 6.05215 6.40249C6.1258 6.39898 6.1864 6.45958 6.3076 6.58079L9.23933 9.51287C9.33274 9.60733 9.47083 9.74697 9.64983 9.88636C9.72182 9.94242 9.75781 9.97045 9.77474 10.0051C9.79167 10.0397 9.79167 10.0818 9.79167 10.1659L9.79167 17.0827C9.79167 17.4279 9.51185 17.7077 9.16667 17.7077H7.16667C6.93096 17.7077 6.81311 17.7077 6.73989 17.6345C6.66667 17.5612 6.66667 17.4434 6.66667 17.2077V14.5826ZM6.67318 10.4159C6.67318 10.8761 6.30175 11.2492 5.84357 11.2492H5.83612C5.37794 11.2492 5.00651 10.8761 5.00651 10.4159C5.00651 9.95565 5.37794 9.58255 5.83612 9.58255H5.84357C6.30175 9.58255 6.67318 9.95565 6.67318 10.4159Z"
                        fill="#757575"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.8832 10.4575C10.9335 10.4084 11.0267 10.4107 11.2132 10.4154C11.2922 10.4174 11.3622 10.417 11.42 10.4167L17.7924 10.4164C17.9484 10.4164 18.0264 10.4164 18.0752 10.4651C18.124 10.5138 18.1242 10.5915 18.1244 10.7469C18.1245 10.8326 18.1245 10.9201 18.1245 11.0094L18.1245 17.083C18.1245 17.4282 17.8447 17.708 17.4995 17.708H11.2063C10.9978 17.708 10.8935 17.708 10.844 17.654C10.7944 17.5999 10.8051 17.4763 10.8266 17.2289C10.8307 17.1808 10.8329 17.1322 10.8329 17.083V10.7678C10.8329 10.5936 10.8329 10.5065 10.8832 10.4575ZM14.9997 13.5413C15.3449 13.5413 15.6247 13.2615 15.6247 12.9163C15.6247 12.5712 15.3449 12.2913 14.9997 12.2913L13.333 12.2913C12.9878 12.2913 12.708 12.5712 12.708 12.9163C12.708 13.2615 12.9878 13.5413 13.333 13.5413L14.9997 13.5413Z"
                        fill="#757575"
                      />
                      <path
                        d="M14.3584 3.34152C13.8936 3.12382 13.3748 3.12438 12.7197 3.12508L5.83368 3.12516C5.828 3.12516 5.82233 3.12524 5.81667 3.12539C5.77849 3.12642 5.75941 3.12694 5.75575 3.12693C5.7521 3.12692 5.73787 3.12648 5.70942 3.12558C5.47961 3.11837 5.24898 3.21418 5.09038 3.40633L1.22136 8.0938C0.947774 8.42526 0.992131 8.91789 1.32044 9.19411C1.64875 9.47033 2.13668 9.42554 2.41027 9.09408L5.62476 5.1996C5.78843 5.00131 5.87026 4.90216 5.98074 4.89689C6.09123 4.89162 6.18213 4.98253 6.36393 5.16433L9.95066 8.75121C10.142 8.94366 10.3485 9.15138 10.6208 9.26415C10.893 9.37692 11.1859 9.37607 11.4573 9.37529L18.3337 9.37516C18.5762 9.37516 18.7968 9.23487 18.8997 9.01526C19.0025 8.79564 18.9691 8.53635 18.8138 8.35004L15.5737 4.46183C15.1549 3.95815 14.8232 3.55921 14.3584 3.34152Z"
                        fill="#757575"
                      />
                    </svg>
                  </span>

                  <span>
                    {userProfile?.userData?.thana},{" "}
                    {userProfile?.userData?.district}
                  </span>
                </h4>
                <div className="flex items-center gap-2">
                  {userProfile?.userData?.facebook && (
                    <Link href={userProfile?.userData?.facebook || '#'} className="flex font-semibold text-blue-700 items-center justify-center gap-2">
                      <Image src='/facebook.png' height={18} width={18} alt="facebook" />
                      <span>@Facebook</span>
                    </Link>
                  )}
                  {/* <Link href={userProfile?.userData?.instagram || '#'}>
                    <Image src='/instagram.png' height={20} width={20} alt="instagram" />
                  </Link> */}
                </div>
              </div>
              {userProfile.userData.id === user?.id && (
                <div>
                  <div className="flex justify-center items-center w-full h-full">
                    <Button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid w-full grid-cols-2 gap-4 justify-between">
              <DashCard
                onClick={() => setCurrTab("posts")}
                title="টোটাল পোস্ট"
                stat={formatBnNumber(userProfile?.dashboard?.totalPosts)}
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="32" height="32" rx="16" fill="#F3E6FA" />
                    <path
                      d="M20.8463 14.1239L19.754 14.5651C19.6134 14.6221 19.4656 14.6509 19.315 14.6509C18.9922 14.6509 18.68 14.5147 18.4591 14.2772C18.2393 14.0414 18.1258 13.7208 18.1485 13.3981L18.231 12.2233L17.4731 11.322C17.3048 11.1216 17.2207 10.8763 17.209 10.625H10.027C8.72602 10.625 7.66309 11.6879 7.66309 12.9945V19.5826C7.66309 20.8891 8.72602 21.9465 10.027 21.9465H11.8263L11.7875 23.0482C11.7764 23.4966 12.0145 23.9063 12.4131 24.1167C12.5847 24.2053 12.7674 24.2496 12.9556 24.2496C13.1992 24.2496 13.4428 24.1665 13.6477 24.0115L16.3936 21.9465H19.5602C20.8612 21.9465 21.9242 20.8891 21.9242 19.5826V14.5596L20.8463 14.1239ZM15.0688 18.0435H12.1629C11.8877 18.0435 11.6646 17.8204 11.6646 17.5452C11.6646 17.2701 11.8877 17.047 12.1629 17.047H15.0688C15.3439 17.047 15.567 17.2701 15.567 17.5452C15.567 17.8204 15.3439 18.0435 15.0688 18.0435ZM17.6447 15.5267H12.164C11.8888 15.5267 11.6657 15.3036 11.6657 15.0285C11.6657 14.7533 11.8888 14.5302 12.164 14.5302H17.6447C17.9199 14.5302 18.143 14.7533 18.143 15.0285C18.143 15.3036 17.9199 15.5267 17.6447 15.5267Z"
                      fill="#8A00CA"
                    />
                    <path
                      d="M21.1345 8.58979L21.9367 9.87363L23.4054 10.2396C23.649 10.3005 23.7448 10.595 23.5837 10.7877L22.6104 11.9469L22.7162 13.4567C22.7339 13.7069 22.4831 13.8896 22.25 13.7955L20.8466 13.228L19.4432 13.7955C19.2107 13.8896 18.9594 13.7074 18.9771 13.4567L19.0828 11.9469L18.1096 10.7877C17.9479 10.5956 18.0442 10.3005 18.2878 10.2396L19.7566 9.87363L20.5587 8.58979C20.6911 8.37665 21.0016 8.37665 21.1345 8.58979Z"
                      fill="#8A00CA"
                    />
                  </svg>
                }
              />

              <DashCard
                onClick={() => setCurrTab("comments")}
                title="টোটাল কমেন্টস"
                stat={formatBnNumber(userProfile?.dashboard?.totalComments)}
                icon={
                  <svg
                    width="33"
                    height="33"
                    viewBox="0 0 33 33"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="32"
                      height="32"
                      rx="16"
                      fill="#E6F3EC"
                    />
                    <g clipPath="url(#clip0_593_34961)">
                      <path
                        d="M17.9843 9.53754C16.8621 8.84542 15.5324 8.46484 14.1587 8.46484C10.4194 8.46484 7.27637 11.2507 7.27637 14.8178C7.27637 16.0684 7.66488 17.2673 8.40288 18.3028L7.37194 21.5394C7.26303 21.8813 7.51912 22.2295 7.87647 22.2295C7.95818 22.2295 8.04041 22.2107 8.1163 22.1721L11.2515 20.5779C11.3785 20.6326 11.507 20.6835 11.6369 20.7307C10.911 19.5977 10.5234 18.2971 10.5234 16.9354C10.5234 12.8802 13.9356 9.76268 17.9843 9.53754Z"
                        fill="#008643"
                      />
                      <path
                        d="M24.2202 20.4199C24.9582 19.3845 25.3467 18.1856 25.3467 16.935C25.3467 13.3666 22.2023 10.582 18.4644 10.582C14.7251 10.582 11.582 13.3679 11.582 16.935C11.582 20.5033 14.7265 23.2879 18.4644 23.2879C19.4673 23.2879 20.4667 23.0835 21.3714 22.695L24.5068 24.2892C24.6971 24.386 24.9269 24.359 25.0896 24.2207C25.2523 24.0825 25.316 23.8601 25.2512 23.6567L24.2202 20.4199ZM16.3114 17.4644C16.0191 17.4644 15.782 17.2273 15.782 16.935C15.782 16.6426 16.0191 16.4056 16.3114 16.4056C16.6038 16.4056 16.8409 16.6426 16.8409 16.935C16.8409 17.2273 16.6038 17.4644 16.3114 17.4644ZM18.4291 17.4644C18.1367 17.4644 17.8997 17.2273 17.8997 16.935C17.8997 16.6426 18.1367 16.4056 18.4291 16.4056C18.7215 16.4056 18.9585 16.6426 18.9585 16.935C18.9585 17.2273 18.7215 17.4644 18.4291 17.4644ZM20.5467 17.4644C20.2544 17.4644 20.0173 17.2273 20.0173 16.935C20.0173 16.6426 20.2544 16.4056 20.5467 16.4056C20.8391 16.4056 21.0761 16.6426 21.0761 16.935C21.0761 17.2273 20.8391 17.4644 20.5467 17.4644Z"
                        fill="#008643"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_593_34961">
                        <rect
                          width="18.0706"
                          height="18.0706"
                          fill="white"
                          transform="translate(7.27637 7.37012)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                }
              />
              <DashCard
                title="টোটাল পয়েন্টস"
                stat={formatBnNumber(userProfile?.dashboard?.totalSatisfied)}
                icon={
                  <svg
                    width="33"
                    height="33"
                    viewBox="0 0 33 33"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="32"
                      height="32"
                      rx="16"
                      fill="#FFF6EA"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.6391 8.9855C15.7992 8.66297 16.1281 8.45898 16.4882 8.45898C16.8483 8.45898 17.1772 8.66297 17.3373 8.9855L18.9909 12.3174L22.6707 12.8604C23.0269 12.913 23.3226 13.1629 23.4339 13.5053C23.5451 13.8477 23.4528 14.2236 23.1955 14.4756L20.5376 17.0778L21.1583 20.7454C21.2184 21.1004 21.0721 21.4588 20.7808 21.6704C20.4896 21.8821 20.1035 21.9104 19.7844 21.7435L16.4882 20.0199L13.192 21.7435C12.8729 21.9104 12.4868 21.8821 12.1955 21.6704C11.9042 21.4588 11.758 21.1004 11.8181 20.7454L12.4388 17.0778L9.7809 14.4756C9.5236 14.2236 9.43124 13.8477 9.54253 13.5053C9.65377 13.1629 9.94944 12.913 10.3057 12.8604L13.9855 12.3174L15.6391 8.9855Z"
                      fill="url(#paint0_linear_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.4883 8.51074C16.8483 8.51074 17.1773 8.71473 17.3374 9.03726L18.991 12.3692L22.6708 12.9122C23.027 12.9648 23.3227 13.2146 23.434 13.557C23.4357 13.5625 23.4374 13.568 23.4391 13.5735L16.4883 15.8138V8.51074Z"
                      fill="url(#paint1_linear_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.488 15.8138L9.53711 13.5735C9.53874 13.568 9.54048 13.5625 9.54228 13.557C9.65351 13.2146 9.94919 12.9648 10.3054 12.9122L13.9853 12.3692L15.6389 9.03726C15.7989 8.71473 16.1279 8.51074 16.488 8.51074V15.8138Z"
                      fill="url(#paint2_linear_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M20.7863 21.6524C20.7775 21.6592 20.7687 21.6658 20.7596 21.6723C20.4683 21.8821 20.0823 21.9102 19.7632 21.7448L16.467 20.0359L13.1707 21.7448C12.8571 21.9074 12.4789 21.883 12.1895 21.683L16.467 15.8145L20.7863 21.6524Z"
                      fill="url(#paint3_linear_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M16.2539 21.6979V24.8909C16.2539 25.0201 16.3588 25.125 16.488 25.125C16.6172 25.125 16.7221 25.0201 16.7221 24.8909V21.6979C16.7221 21.5688 16.6172 21.4639 16.488 21.4639C16.3588 21.4639 16.2539 21.5688 16.2539 21.6979Z"
                      fill="url(#paint4_radial_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M22.1322 17.7249L25.1499 18.7683C25.272 18.8105 25.4054 18.7456 25.4476 18.6235C25.4899 18.5015 25.425 18.368 25.3029 18.3258L22.2852 17.2824C22.1631 17.2402 22.0297 17.3051 21.9875 17.4272C21.9453 17.5493 22.0102 17.6827 22.1322 17.7249Z"
                      fill="url(#paint5_radial_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.6899 17.2824L7.67231 18.3258C7.55017 18.368 7.48534 18.5015 7.52753 18.6235C7.56978 18.7456 7.70315 18.8105 7.82529 18.7683L10.843 17.7249C10.9651 17.6827 11.0299 17.5493 10.9877 17.4272C10.9455 17.3051 10.8121 17.2402 10.6899 17.2824Z"
                      fill="url(#paint6_radial_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M20.4796 10.8478L22.2895 8.21733C22.3627 8.11092 22.3358 7.96502 22.2294 7.89182C22.1229 7.81856 21.9771 7.84553 21.9038 7.95199L20.0939 10.5824C20.0207 10.6888 20.0477 10.8347 20.1541 10.9079C20.2606 10.9812 20.4064 10.9542 20.4796 10.8478Z"
                      fill="url(#paint7_radial_593_34939)"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M13.1118 10.5642L11.0588 8.11869C10.9757 8.01976 10.828 8.00684 10.7291 8.08993C10.6301 8.17302 10.6172 8.32077 10.7003 8.4197L12.7532 10.8652C12.8363 10.9641 12.9841 10.977 13.083 10.894C13.182 10.8109 13.1948 10.6631 13.1118 10.5642Z"
                      fill="url(#paint8_radial_593_34939)"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_593_34939"
                        x1="16.4882"
                        y1="13.8469"
                        x2="16.4882"
                        y2="20.7043"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FFB541" />
                        <stop offset="1" stopColor="#F59500" />
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear_593_34939"
                        x1="16.2542"
                        y1="8.82046"
                        x2="21.1917"
                        y2="15.6032"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FFD952" />
                        <stop offset="1" stopColor="#FFA501" />
                      </linearGradient>
                      <linearGradient
                        id="paint2_linear_593_34939"
                        x1="12.6878"
                        y1="9.78333"
                        x2="17.3319"
                        y2="14.1922"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FFDF6C" />
                        <stop offset="1" stopColor="#FFA501" />
                      </linearGradient>
                      <linearGradient
                        id="paint3_linear_593_34939"
                        x1="16.4879"
                        y1="13.3608"
                        x2="16.4879"
                        y2="20.6873"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FFA841" />
                        <stop offset="1" stopColor="#F27B00" />
                      </linearGradient>
                      <radialGradient
                        id="paint4_radial_593_34939"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(16.488 15.8138) rotate(18.8508) scale(9.18389 9.18389)"
                      >
                        <stop stopColor="#FFA501" />
                        <stop offset="0.57" stopColor="#FFAF0E" />
                        <stop offset="1" stopColor="#FFD541" />
                      </radialGradient>
                      <radialGradient
                        id="paint5_radial_593_34939"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(16.4873 15.8138) rotate(18.8508) scale(9.18389)"
                      >
                        <stop stopColor="#FFA501" />
                        <stop offset="0.57" stopColor="#FFAF0E" />
                        <stop offset="1" stopColor="#FFD541" />
                      </radialGradient>
                      <radialGradient
                        id="paint6_radial_593_34939"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(16.4879 15.8138) rotate(18.8508) scale(9.18389)"
                      >
                        <stop stopColor="#FFA501" />
                        <stop offset="0.57" stopColor="#FFAF0E" />
                        <stop offset="1" stopColor="#FFD541" />
                      </radialGradient>
                      <radialGradient
                        id="paint7_radial_593_34939"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(16.4883 15.814) rotate(18.8508) scale(9.18389)"
                      >
                        <stop stopColor="#FFA501" />
                        <stop offset="0.57" stopColor="#FFAF0E" />
                        <stop offset="1" stopColor="#FFD541" />
                      </radialGradient>
                      <radialGradient
                        id="paint8_radial_593_34939"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientUnits="userSpaceOnUse"
                        gradientTransform="translate(16.4879 15.8135) rotate(18.8508) scale(9.18389)"
                      >
                        <stop stopColor="#FFA501" />
                        <stop offset="0.57" stopColor="#FFAF0E" />
                        <stop offset="1" stopColor="#FFD541" />
                      </radialGradient>
                    </defs>
                  </svg>
                }
              />
              <DashCard
                title="স্যাটিস্ফাইড কমেন্টস"
                stat={formatBnNumber(userProfile?.dashboard?.totalSatisfied)}
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="32" height="32" rx="16" fill="#FFF6EA" />
                    <path
                      d="M18.7848 14.8531L16.1568 11.0497C16.1394 11.0242 16.1159 11.0034 16.0886 10.989C16.0612 10.9746 16.0307 10.967 15.9998 10.967C15.9689 10.967 15.9384 10.9746 15.9111 10.989C15.8837 11.0034 15.8603 11.0242 15.8428 11.0497L13.2149 14.8531C13.1897 14.8898 13.1525 14.9165 13.1097 14.9287C13.0669 14.9409 13.0212 14.9378 12.9805 14.9199L9.25157 13.2634C9.21828 13.2488 9.18151 13.2439 9.14556 13.2494C9.10962 13.2549 9.07598 13.2705 9.04857 13.2944C9.02117 13.3183 9.00113 13.3496 8.9908 13.3844C8.98047 13.4193 8.98028 13.4564 8.99025 13.4913L11.1524 20.8953C11.1639 20.935 11.188 20.9699 11.2211 20.9947C11.2542 21.0195 11.2944 21.0329 11.3358 21.0329H20.6645C20.7058 21.0329 20.7461 21.0195 20.7791 20.9947C20.8122 20.9699 20.8363 20.935 20.8479 20.8953L23.01 13.4913C23.0199 13.4564 23.0197 13.4193 23.0094 13.3844C22.9991 13.3496 22.9791 13.3183 22.9516 13.2944C22.9242 13.2705 22.8906 13.2549 22.8547 13.2494C22.8187 13.2439 22.7819 13.2488 22.7486 13.2634L19.0197 14.9199C18.9789 14.9376 18.9332 14.9406 18.8903 14.9284C18.8475 14.9163 18.8102 14.8896 18.7848 14.8531Z"
                      fill="#FF8000"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="p-4 md:px-0 flex gap-4">
            {collections.length > 0 &&
              userProfile?.userData?.id === user.id && (
                <div className="p-5 w-[400px] hidden md:block h-[300px] ring-1 ring-ash rounded-lg shadow-md shadow-ash bg-white dark:bg-neutral-950">
                  <div className="">
                    <h2 className="text-xl text-center font-medium pb-4">
                      Saved Collections
                    </h2>
                    <div className="grid gap-2">
                      {collections?.map((c) => (
                        <button
                          type="button"
                          className={cn(
                            "w-full text-start flex py-2 px-4 gap-2 rounded-lg ring-1 ring-ash justify-start items-center"
                          )}
                          onClick={() =>
                            Router.push(`/saved/${c.collection_id}`)
                          }
                          key={c.collection_id}
                        >
                          <span className={cn("w-4 h-4 rounded-full")}></span>
                          {c.collection_name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {currTab === "posts" ? (
              <div className="grid gap-2 w-full">
                {posts?.map((x) => (
                  <PostComponent
                    key={x.id}
                    post={x}
                    updateReact={(t) => updateReact(x.id, t)}
                  />
                ))}
                {loading && <PostSkeleton />}
                {hasMore && (
                  <div ref={loadMoreTrigger} className="h-10 w-full" />
                )}
              </div>
            ) : (
              <UserComments
                user={userProfile?.userData}
                startDate={"2024-10-01"}
                endDate={new Date().toISOString().split("T")[0]}
                authorId={id}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
