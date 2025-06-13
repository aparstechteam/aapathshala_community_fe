/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import {
  ArrowLeft,
  Search,
  Loader2,
  Shield,
  UserRoundCheck,
  UserPlus,
  School,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  Input,
  Layout,
  PostSkeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useUser,
} from "@/components";
import { PostComponent } from "@/features";
import { Post, UserData } from "@/@types";
import Head from "next/head";
import Link from "next/link";
import { levelArray, secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";

export default function SearchPage() {
  const { user } = useUser();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const loadMoreTrigger = useRef<HTMLDivElement>(null);

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
  }, [loading, hasMore, isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    setTimeout(() => {
      setPage(page + 1);
      setIsFetching(false);
    }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  const performSearch = () => {
    if (searchQuery.trim().length >= 3) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      router.push(`/search?${params.toString()}`);
    }
  };

  // Handle search params changes
  useEffect(() => {
    const getsearch = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${secondaryAPI}/api/utils/search?search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setUsers(data?.users.data);
        setPosts(data?.posts.data);
        setLoading(false);
        setError("");
      } catch (err) {
        setLoading(false);
        setError("Error");
        handleError(err as AxiosError, () => getsearch());
      }
    };
    if (searchQuery) {
      getsearch();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, activeTab, user, searchQuery, router]);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const toggleFollow = async (id: string) => {
    // if (isFollowing) return;

    setFollowLoading(true);
    try {
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
      console.log(res.data);
      setFollowLoading(false);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === id ? { ...u, isFollowing: !u.isFollowing } : u
        )
      );
    } catch (error) {
      setFollowLoading(false);
      handleError(error as AxiosError, () => toggleFollow(id));
    }
  };

  return (
    <>
      <Head>
        <title>Search</title>
      </Head>
      <Layout>
        <div className="p-4">
          <div className="max-w-3xl min-h-[calc(100vh-80px)] px-4 pt-4 rounded-xl bg-white dark:bg-gray-900 dark:ring-gray-700 ring-ash ring-1 mx-auto space-y-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className=""
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Search Bar */}
            <div className="flex items-center space-x-2 ">
              <div className="relative flex-grow">
                <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search a friend or a post..."
                  className="w-full pl-10 pr-4 !ring-2 dark:!ring-gray-800 focus:!ring-rose-500 focus:ring-2 focus:!border-none !duration-300 !transition-all !ring-rose-500 !rounded-full"
                  onKeyDown={(e) => e.key === "Enter" && performSearch()}
                />
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <p className="text-sm capitalize text-muted-foreground">
                Showing results for: {searchQuery}
              </p>
            )}

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              {/* Posts Tab */}
              <TabsContent value="posts">
                {loading && !posts ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </div>
                ) : !!error ? (
                  <div className="p-4 text-center text-red-500">
                    Error: {error}
                  </div>
                ) : posts?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for {searchQuery}
                  </div>
                ) : (
                  posts.length > 0 && (
                    <div className="space-y-4">
                      {posts?.map((post) => (
                        <PostComponent key={post.id} post={post as Post} />
                      ))}
                      {loading && <PostSkeleton />}
                      {hasMore && (
                        <div ref={loadMoreTrigger} className="h-10 w-full" />
                      )}
                    </div>
                  )
                )}
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : users && users.length === 0 ? (
                  !!error && (
                    <div className="p-4 text-center text-muted-foreground">
                      No users found for {searchQuery}
                    </div>
                  )
                ) : (
                  users &&
                  users.length > 0 && (
                    <div className="grid gap-3">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className="p-4 flex gap-4 items-start bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/80 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          <div className="relative">
                            <Avatar className="h-14 w-14 border-2 border-primary/10">
                              <AvatarImage src={u?.image} alt={u?.name} />
                              <AvatarFallback className="text-lg bg-primary/5 text-primary">
                                {u?.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                          </div>

                          <div className="space-y-2 flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <Link
                                  href={`/users/${u.id}`}
                                  className="font-semibold text-lg hover:text-primary transition-colors duration-200 block"
                                >
                                  {u?.name}
                                </Link>
                                {u?.institute_name && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    {u.institute_name}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {u.role && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                      <Shield className="h-3 w-3" />
                                      {u.role}
                                    </span>
                                  )}
                                  <span className="text-sm text-muted-foreground">
                                    {levelArray[u.level as number]}
                                  </span>
                                </div>
                              </div>

                              <Button
                                onClick={() => toggleFollow(u.id)}
                                size="sm"
                                className={`rounded-full transition-all duration-300 ${
                                  u.isFollowing
                                    ? "bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-800 dark:hover:bg-rose-700 dark:text-rose-300"
                                    : "bg-rose-500 hover:bg-rose-600 text-white"
                                }`}
                              >
                                {u.isFollowing ? (
                                  <span className="flex items-center gap-1.5">
                                    <UserRoundCheck className="h-4 w-4" />
                                    Following
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <UserPlus className="h-4 w-4" />
                                    Follow
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </>
  );
}
