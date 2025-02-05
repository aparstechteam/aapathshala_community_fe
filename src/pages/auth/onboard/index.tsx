/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Subject, UserData } from "@/@types";
import {
    Back,
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Layout,
    Rocket,
    ScrollArea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    useUser,
} from "@/components";
import { ValidImage } from "@/components/shared/ValidImage";
import { community_video, secondaryAPI } from "@/configs";
import {
    contentCreators,
    hobbies,
    lifeGoals,
    personalityTypes,
    socialContents,
    sources,
} from "@/data/subjects";
import { Step2, Steps } from "@/features";
import { useCloudflareImage } from "@/hooks";
import { handleError } from "@/hooks/error-handle";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import {
    ArrowRight,
    ChevronRight,
    ImageUp,
    Loader2,
    Plus,
    X,
} from "lucide-react";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";

type City = {
    id: string;
    name: string;
    district_name: string;
    thana_name: string;
    school_name: string;
};

type Creator = {
    id: number;
    type: string;
};

const OnboardPage = () => {
    const { user, setUser } = useUser();
    const { uploadImage } = useCloudflareImage();
    const router = useRouter();
    const tab = router.query.tab as string;

    const [currentStep, setCurrentStep] = useState<number>(0);
    const [subject, setSubject] = useState<string[]>([]);
    const [hobby, setHobby] = useState<(number | string)[]>([]);
    const [content, setContent] = useState<(number | string)[]>([]);
    const [socialPlatforms, setSocialPlatforms] = useState<(number | string)[]>([]);
    const [contentCreator, setContentCreator] = useState<Creator[]>([]);

    const [media, setMedia] = useState<number>(0);
    const [search, setSearch] = useState<string>("");
    const [lifeGoal, setLifeGoal] = useState<number[]>([]);
    const [error, setError] = useState<string>("");
    const [cities, setCities] = useState<City[]>([]);
    const [thanas, setThanas] = useState<City[]>([]);
    const [schools, setSchools] = useState<City[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [city, setCity] = useState<string>("");
    const [area, setArea] = useState<string>("");
    const [school, setSchool] = useState<string>("");

    const [personality, setPersonality] = useState<number>(0);
    const [cityLoading, setCityLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [disabledNext, setDisabledNext] = useState<boolean>(false);

    const [addSchool, setAddSchool] = useState<boolean>(false);
    const [schoolName, setSchoolName] = useState<string>("");
    const [sLoading, setSLoading] = useState<boolean>(false);
    const [openInfo, setOpenInfo] = useState<boolean>(false);
    const [imgloading, setImgLoading] = useState<boolean>(false);
    const [preview, setPreview] = useState<string>(user?.image || "");
    const [infoStep, setInfoStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [myinfo, setMyInfo] = useState({
        bio: "",
        image: preview ?? preview,
        gender: "",
        religion: "",
        hsc_batch: "",
        phone: "",
    });

    useEffect(() => {
        if (tab === 'info') {
            setOpenInfo(true);
        }
    }, [tab]);

    const [friends, setFriends] = useState<UserData[]>([]);
    const [followLoading, setFollowLoading] = useState(false);

    const toggleFollow = async (id: string) => {
        // if (isFollowing) return;

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
            const newUser = friends.map((a) =>
                a.id === id ? { ...a, isFollowing: !a.isFollowing } : a
            );
            toast({
                title: "Followed",
                description: "You are now following this user",
                variant: "default",
            });
            setFriends(newUser);
        } catch (error) {
            setFollowLoading(false);
            handleError(error as AxiosError, () => toggleFollow(id));
        }
    };

    useEffect(() => {
        async function fetchFriends() {
            try {
                const res = await axios.get(`${secondaryAPI}/api/follow/suggestions`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                setFriends(res.data.suggestions);
            } catch (err) {
                handleError(err as AxiosError, fetchFriends);
            }
        }
        fetchFriends();
    }, [user]);

    useEffect(() => {
        async function fetchCities() {
            try {
                setCityLoading(true);
                const res = await axios.get(`${secondaryAPI}/api/location/districts`);
                setCities(res.data.data);
                setCityLoading(false);
            } catch (error) {
                handleError(error as AxiosError);
            }
        }
        fetchCities();
    }, []);

    useEffect(() => {
        async function fetchSubjects() {
            try {
                setSubjects([]);
                const res = await axios.get(
                    `${secondaryAPI}/api/subjects`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );
                setSubjects(res.data);
            } catch (error) {
                // handleError(error as AxiosError)
            }
        }
        fetchSubjects();
    }, [user]);

    useEffect(() => {
        async function fetchCities() {
            try {
                setCityLoading(true);
                const res = await axios.get(
                    `${secondaryAPI}/api/location/thanas/${city}`
                );
                setThanas(res.data.data);
                setCityLoading(false);
            } catch (error) {
                handleError(error as AxiosError);
            }
        }
        if (city) fetchCities();
    }, [city]);

    useEffect(() => {
        async function fetchSchools() {
            try {
                setCityLoading(true);
                const res = await axios.get(
                    `${secondaryAPI}/api/location/schools/${area}`
                );
                setSchools(res.data.data);
                setCityLoading(false);
            } catch (error) {
                handleError(error as AxiosError);
            }
        }
        if (area) fetchSchools();
    }, [area, search, sLoading]);

    const errors = [
        "সোর্স সিলেকট করো",
        "জেলা, থানা এবং স্কুল সিলেকট করো",
        "সাবজেক্ট সিলেকট করো",
        "পছন্দের সাবজেক্ট সিলেকট করো",
        "তোমার শখ সিলেকট করো",
        "পছন্দের কন্টেন্ট সিলেকট করো",
        "পছন্দের কন্টেন্ট ক্রিয়েটর সিলেকট করো",
        "লক্ষ্য সিলেক্ট করো",
        "পারসনালিটি টাইপ সিলেক্ট করো",
    ];

    async function handleSubmit() {
        try {
            setLoading(true);
            const data = {
                favorite_subjects: subject,
                school_id: school,
                where_you_heard: media,
                institute_id: school,
                institute_name: schools.find((x) => x.id === school)?.school_name,
                hobbies: hobby,
                preferred_social_content: content,
                social_platforms: socialPlatforms,
                content_creators: {
                    educational: contentCreator
                        .filter((x) => x.type === "EDUCATIONAL")
                        .map((x) => x.id),
                    entertainment: contentCreator
                        .filter((x) => x.type === "ENTERTAINMENT")
                        .map((x) => x.id),
                    technology: contentCreator
                        .filter((x) => x.type === "TECHNOLOGY")
                        .map((x) => x.id),
                    gaming: contentCreator
                        .filter((x) => x.type === "GAMING")
                        .map((x) => x.id),
                    beauty_fashion: contentCreator
                        .filter((x) => x.type === "BEAUTY_FASHION")
                        .map((x) => x.id),
                },
                life_goals: lifeGoal,
                personality_type: personality,
            };
            const res = await axios.post(
                `${secondaryAPI}/api/auth/onboarding`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setLoading(false);
            toast({
                title: "অভিনন্দন",
                description: "তোমার অনবোর্ডিং সম্পন্ন হয়েছে।",
                variant: "success",
            });
            localStorage.setItem("onboarded", "true");
            if (res.data.message === "Onboarding data updated successfully") {
                if (!user?.religion) {
                    setOpenInfo(true);
                    router.push("/auth/onboard?tab=info");
                } else {
                    Router.push("/");
                }
            }
        } catch (error) {
            handleError(error as AxiosError);
            setLoading(false);
            toast({
                title: "দুঃখিত",
                description: "কিছু ত্রুটি দেখাচ্ছে। আবার চেষ্টা করো।",
                variant: "destructive",
            });
        }
    }

    function handleSteps() {
        if (disabledNext) {
            setError(errors[currentStep]);
        } else {
            setError("");
            if (currentStep < 8) {
                setCurrentStep((prev) => prev + 1);
                setDisabledNext(true);
            }
            if (currentStep === 8) {
                handleSubmit();
            }
        }
    }

    async function handleAddSchool() {
        try {
            setSLoading(true);
            const res = await axios.post(
                `${secondaryAPI}/api/location/create-school`,
                {
                    name: schoolName,
                    thana_id: area,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSchools([...schools, res.data]);
            setSchool(res.data.id);
            setAddSchool(false);
            setSLoading(false);
            setDisabledNext(false);
        } catch (error) {
            handleError(error as AxiosError);
        }
    }

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

    async function handleInfoSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        console.log(myinfo);
        if (!myinfo.phone || myinfo.phone.length !== 11) {
            toast({
                title: "দুঃখিত",
                description: "সঠিক ফোন নম্বর দিতে হবে!",
                variant: "destructive",
            });
            setError("d");
            return;
        }
        if (!myinfo.gender) {
            toast({
                title: "দুঃখিত",
                description: "ছেলে না মেয়ে সিলেক্ট করো",
                variant: "destructive",
            });
            setError("d");
            return;
        }
        if (!myinfo.religion) {
            toast({
                title: "দুঃখিত",
                description: "ধর্ম সিলেক্ট করো",
                variant: "destructive",
            });
            setError("d");
            return;
        }
        // if (!myinfo.bio) {
        //     setError('তুমি নিজের সম্পর্কে লিখো')
        //     return
        // }
        // if (!preview) {
        //     setError('তুমি প্রোফাইল পিকচার যুক্ত করো')
        //     return
        // }
        try {
            setIsLoading(true);
            const res = await axios.put(`${secondaryAPI}/api/auth/update`,
                myinfo,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            console.log(res);
            toast({
                title: "অভিনন্দন",
                description: "তোমার প্রোফাইল সম্পন্ন হয়েছে।",
                variant: "success",
            });
            localStorage.removeItem("user");
            await getme();
            setIsLoading(false);
        } catch (error) {
            console.log(error)
            setIsLoading(false);
        }

    }

    async function getme() {

        const batch = localStorage.getItem('hsc_batch') || ''

        try {
            const response = await axios.get(`${secondaryAPI}/api/auth/user`, {

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });
            setUser(response.data.user as UserData)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('hsc_batch', response.data.user?.hsc_batch)
            setInfoStep(infoStep + 1);
        } catch (error) {
            handleError(error as AxiosError, getme)
        }

    }

    const titles = [
        "অলমোস্ট শেষ! তোমার কিছু তথ্য দাও",
        "কমিউনিটি এর ব্যবহারবিধি",
        "তোমার সহপাঠীদের ফলো করো",
    ];

    const userinfo = (
        <Dialog
            open={openInfo}
            onOpenChange={(v) => {
                setOpenInfo(v);
                setInfoStep(0);
            }}
        >
            <DialogContent
                className={cn(
                    "bg-white duration-300 text-black p-5",
                    infoStep < 2 && "max-w-[470px]",
                    infoStep === 2 && "max-w-2xl overflow-y-auto"
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-center py-2">
                        {titles[infoStep]}
                    </DialogTitle>
                </DialogHeader>
                {infoStep === 0 && (
                    <div className="grid gap-4 p-4">
                        {/* <h2 className='text-2xl font-semibold'>তোমার প্রোফাইল দেখো</h2> */}
                        <div className="min-w-24 mx-auto space-y-2">
                            <Label className="text-center w-full">প্রোফাইল পিকচার</Label>
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
                                    <p className="flex items-center gap-2 w-full">
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
                        </div>
                        <div className="w-full  ">
                            <Label>তোমার ফোন নম্বর</Label>
                            <Input required
                                className={cn(
                                    "w-full !px-4 !pb-1 focus:!ring-2 !rounded-lg !border-0 !ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                                    error && !myinfo.phone && "ring-hot ring-2"
                                )}
                                type='tel'
                                value={myinfo.phone}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Only allow valid phone number formats
                                    const phoneRegex = /^[0-9]*$/;
                                    if (phoneRegex.test(value) || value === "") {
                                        setMyInfo({ ...myinfo, phone: value });
                                    }
                                }}
                                placeholder="ফোন নম্বর"

                            />
                        </div>

                        <div className="w-full  ">
                            <Label>নিজের সম্পর্কে লিখো</Label>
                            <Input
                                className="w-full !rounded-lg !h-10"
                                value={myinfo.bio}
                                onChange={(e) => setMyInfo({ ...myinfo, bio: e.target.value })}
                                placeholder="বায়ো"
                            />
                            <span className="text-xs text-light flex justify-end text-end pt-2">
                                {myinfo.bio.length}/100
                            </span>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                            <Label className="col-span-2">তুমি একজন</Label>
                            <button
                                onClick={() => {
                                    setError("");
                                    setMyInfo({ ...myinfo, gender: "boy" });
                                }}
                                type="button"
                                className={cn(
                                    "text-sm text-black ring-2 h-10 duration-300 px-4 py-0.5 rounded-lg",
                                    error && !myinfo.gender
                                        ? "ring-hot"
                                        : myinfo.gender === "boy"
                                            ? "ring-olive"
                                            : myinfo.gender !== "boy" && "ring-ash"
                                )}
                            >
                                ছাত্র
                            </button>

                            <button
                                onClick={() => {
                                    setMyInfo({ ...myinfo, gender: "girl" });
                                    setError("");
                                }}
                                type="button"
                                className={cn(
                                    "text-sm text-black ring-2 h-10 duration-300 px-4 py-1 rounded-lg",
                                    error && !myinfo.gender
                                        ? "ring-hot"
                                        : myinfo.gender === "girl"
                                            ? "ring-olive"
                                            : myinfo.gender !== "girl" && "ring-ash"
                                )}
                            >
                                ছাত্রী
                            </button>
                        </div>
                        <div className="w-full">
                            <div className="flex flex-col gap-3">
                                <Label>তোমার ধর্ম কী?</Label>
                                <Select
                                    value={myinfo?.religion}
                                    required
                                    onValueChange={(value) => {
                                        setMyInfo({ ...myinfo, religion: value });
                                        setError("");
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                                            error && !myinfo.religion && "ring-hot ring-2"
                                        )}
                                    >
                                        <SelectValue placeholder={"তুমি কোন ধর্মের অনুসারী?"} />
                                    </SelectTrigger>
                                    <SelectContent
                                        align="start"
                                        className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                    >
                                        <SelectItem
                                            value={"ISLAM"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            ইসলাম
                                        </SelectItem>

                                        <SelectItem
                                            value={"SANATAN"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            সনাতন
                                        </SelectItem>
                                        <SelectItem
                                            value={"CHRISTIANITY"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            খৃষ্টান
                                        </SelectItem>
                                        <SelectItem
                                            value={"BUDDHIST"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            বৌদ্ধ
                                        </SelectItem>

                                        <SelectItem
                                            value={"OTHERS"}
                                            className="hover:!text-white text-black dark:text-white"
                                        >
                                            অন্যান্য
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {error && !myinfo.religion && (
                                    <p className="text-hot text-xs">ধর্ম সিলেক্ট করো</p>
                                )}
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="flex flex-col gap-3">
                                <Label>তোমার ব্যাচ সিলেক্ট করো</Label>
                                <Select
                                    value={myinfo?.hsc_batch}
                                    required
                                    onValueChange={(value) => {
                                        setMyInfo({ ...myinfo, hsc_batch: value });
                                        setError("");
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                                            error && !myinfo.hsc_batch && "ring-hot ring-2"
                                        )}
                                    >
                                        <SelectValue placeholder={"তুমি কোন ব্যাচে পড়ো?"} />
                                    </SelectTrigger>
                                    <SelectContent
                                        align="start"
                                        className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                    >
                                        <SelectItem
                                            value={"HSC 25"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            HSC 2025
                                        </SelectItem>

                                        <SelectItem
                                            value={"HSC 26"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            HSC 2026
                                        </SelectItem>

                                    </SelectContent>
                                </Select>
                                {error && !myinfo.hsc_batch && (
                                    <p className="text-hot text-xs">ব্যাচ সিলেক্ট করো</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {infoStep === 1 && (
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <h2 className="text-center">
                            কমিউনিটি কিভাবে ব্যবহার করবে তার বিস্তারিত জেনে নাও এই ভিডিও দেখে
                        </h2>
                        <iframe
                            className="w-full rounded-xl"
                            width="100%"
                            height="255"
                            src={community_video}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
                {infoStep === 2 && (
                    <ScrollArea className="overflow-y-auto h-[400px]">

                        {/* <h2 className="font-medium py-2 w-full">তোমার সহপাঠীদের ফলো করো</h2> */}
                        <div className="flex flex-wrap items-center justify-center  pb-4 gap-2">
                            {friends?.map((x, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col w-[120px] items-center justify-center gap-2"
                                >
                                    <ValidImage
                                        src={x.image as string}
                                        alt="profile"
                                        width={80}
                                        height={96}
                                        className="w-20 h-24 !rounded-xl"
                                    />
                                    <h2 className="text-xs text-center">{x.name}</h2>
                                    <h2 className="text-xs text-center">{x.institute_name}</h2>
                                    <button
                                        type="button"
                                        onClick={() => toggleFollow(x.id)}
                                        className={cn(
                                            "text-sm duration-300 px-4 py-0.5 rounded-full",
                                            x.isFollowing
                                                ? "bg-olive text-white"
                                                : "bg-life/20 text-olive"
                                        )}
                                    >
                                        {x.isFollowing ? "Following" : "Follow"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* <h2 className="font-medium py-2 w-full">তোমার শিক্ষকদের ফলো করো</h2>
                        <div className="flex flex-wrap items-center pb-4 justify-center gap-2">
                            {teachers?.map((x, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col w-[120px] items-center justify-center gap-2"
                                >
                                    <ValidImage
                                        src={x.image as string}
                                        alt="profile"
                                        width={80}
                                        height={96}
                                        className="w-20 h-24 !rounded-xl"
                                    />
                                    <h2 className="text-xs text-center">{x.name}</h2>
                                    <button
                                        type="button"
                                        onClick={() => toggleFollow(x.id)}
                                        className={cn(
                                            "text-sm duration-300 px-4 py-0.5 rounded-full",
                                            x.isFollowing
                                                ? "bg-olive text-white"
                                                : "bg-life/20 text-olive"
                                        )}
                                    >
                                        {x.isFollowing ? "Following" : "Follow"}
                                    </button>
                                </div>
                            ))}
                        </div> */}

                        {/* <h2 className="font-medium py-2 w-full">
                            ক্লাব এক্সিকিউটিভ মেম্বারদের ফলো করো
                        </h2>
                        <div className="flex flex-wrap items-center pb-4 justify-center gap-2">
                            {authorities?.map((x, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col w-[120px] items-center justify-center gap-2"
                                >
                                    <ValidImage
                                        src={x.image as string}
                                        alt="profile"
                                        width={80}
                                        height={96}
                                        className="w-20 h-24 !rounded-xl"
                                    />
                                    <h2 className="text-xs text-center">{x.name}</h2>
                                    <button
                                        type="button"
                                        onClick={() => toggleFollow(x.id)}
                                        className={cn(
                                            "text-sm duration-300 px-4 py-0.5 rounded-full",
                                            x.isFollowing
                                                ? "bg-olive text-white"
                                                : "bg-life/20 text-olive"
                                        )}
                                    >
                                        {x.isFollowing ? "Following" : "Follow"}
                                    </button>
                                </div>
                            ))}
                        </div> */}
                    </ScrollArea>
                )}
                <DialogFooter>
                    <div className="flex items-center justify-end gap-4 w-full">
                        {infoStep > 0 && (
                            <Button
                                variant="secondary"
                                className="flex items-center gap-2 !w-28 !h-9 !rounded-xl  !bg-light"
                                size="sm"
                                onClick={() => {
                                    if (infoStep === 0) setOpenInfo(false);
                                    else setInfoStep(infoStep - 1);
                                }}
                            >
                                {infoStep === 0 ? "স্কিপ করো" : "ফিরে যাও"}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex !w-28 items-center !rounded-xl gap-2 !h-9"
                            size="sm"
                            onClick={(e) => {
                                if (infoStep === 0) handleInfoSubmit(e);
                                if (infoStep === 1) setInfoStep(infoStep + 1);
                                if (infoStep === 2) Router.push("/");
                            }}
                        >
                            {infoStep === 2 ? "শেষ করো" : "এগিয়ে যাও"}
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight />}
                        </Button>
                    </div>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );

    return (
        <>
            <Head>
                <title>ACS Community</title>
            </Head>
            <Layout variant="other">
                <div className="flex flex-col w-full bg-white dark:bg-ash/20 items-center justify-start h-full min-h-[calc(100vh-80px)]">
                    {userinfo}
                    <div className="flex flex-col gap-4 items-center justify-center w-full max-w-screen-xl">
                        <div className="flex items-center px-4 justify-between pt-10 w-full gap-4">
                            {currentStep > 0 && (
                                <button
                                    disabled={currentStep === 0}
                                    type="button"
                                    onClick={() => {
                                        setCurrentStep((prev) => prev - 1);
                                        setDisabledNext(false);
                                    }}
                                >
                                    <Back />
                                </button>
                            )}
                            <div className="relative flex items-center justify-center bg-ash/50 rounded-full w-full h-2">
                                <div
                                    className={cn(
                                        "absolute z-[1] duration-300 inset-0 rounded-full",
                                        currentStep > 0 ? "w-full" : "w-0"
                                    )}
                                    style={{
                                        width: `${(currentStep / 8) * 100}%`,
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "rounded-full relative z-[2] h-full w-full duration-700 animate-progress transition-all",
                                            currentStep > 0 && "bg-gradient-to-r from-olive to-life",
                                            currentStep === 0 && "bg-light"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {currentStep === 0 && (
                            <div className="grid items-center justify-center h-[500px]">
                                <div className="grid items-center justify-center lg:p-0 p-4 gap-3 lg:relative text-black dark:text-white">
                                    <h2 className="lg:!hidden block">
                                        <Rocket />
                                    </h2>
                                    <div className="lg:!absolute bottom-[100px] right-[-328px] lg:!w-[328px] w-full bg-zemer p-4 rounded-lg">
                                        <h2 className="flex items-center gap-2 font-semibold">
                                            <span>কিউরিসিটি</span>
                                            <svg
                                                width="36"
                                                height="17"
                                                viewBox="0 0 36 17"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <rect
                                                    y="0.5"
                                                    width="36.0003"
                                                    height="16"
                                                    rx="8"
                                                    fill="#8A00CA"
                                                />
                                                <path
                                                    opacity="0.4"
                                                    d="M12.3957 3.5C12.5588 3.5 12.7001 3.61304 12.736 3.77218L12.9865 4.88454C13.1695 5.69664 13.8037 6.33083 14.6158 6.51377L15.7281 6.76434C15.8873 6.80019 16.0003 6.94153 16.0003 7.10465C16.0003 7.26777 15.8873 7.40911 15.7281 7.44496L14.6158 7.69553C13.8037 7.87847 13.1695 8.51266 12.9865 9.32476L12.736 10.4371C12.7001 10.5963 12.5588 10.7093 12.3957 10.7093C12.2325 10.7093 12.0912 10.5963 12.0554 10.4371L11.8048 9.32476C11.6218 8.51266 10.9877 7.87847 10.1756 7.69553L9.06319 7.44496C8.90406 7.40911 8.79102 7.26777 8.79102 7.10465C8.79102 6.94153 8.90406 6.80019 9.06319 6.76434L10.1756 6.51377C10.9877 6.33083 11.6218 5.69664 11.8048 4.88454L12.0554 3.77218C12.0912 3.61304 12.2325 3.5 12.3957 3.5Z"
                                                    fill="white"
                                                />
                                                <path
                                                    d="M8.67442 8.15137C8.83754 8.15137 8.97888 8.26441 9.01473 8.42355L9.19371 9.21809C9.31592 9.76061 9.73959 10.1843 10.2821 10.3065L11.0767 10.4855C11.2358 10.5213 11.3488 10.6627 11.3488 10.8258C11.3488 10.9889 11.2358 11.1302 11.0767 11.1661L10.2821 11.3451C9.73959 11.4673 9.31592 11.891 9.19371 12.4335L9.01473 13.228C8.97888 13.3872 8.83754 13.5002 8.67442 13.5002C8.5113 13.5002 8.36996 13.3872 8.33411 13.228L8.15513 12.4335C8.03292 11.891 7.60925 11.4673 7.06672 11.3451L6.27218 11.1661C6.11304 11.1302 6 10.9889 6 10.8258C6 10.6627 6.11304 10.5213 6.27218 10.4855L7.06672 10.3065C7.60925 10.1843 8.03292 9.76062 8.15513 9.21809L8.33411 8.42355C8.36996 8.26441 8.5113 8.15137 8.67442 8.15137Z"
                                                    fill="white"
                                                />
                                                <path
                                                    d="M21.0005 9.08L20.8925 9.428H23.1725L23.0645 9.068C22.7925 8.204 22.5685 7.48 22.3925 6.896C22.2245 6.304 22.1205 5.932 22.0805 5.78L22.0325 5.54C21.9605 5.94 21.6165 7.12 21.0005 9.08ZM19.9205 12.5H18.3365L21.0725 4.412H23.0285L25.7645 12.5H24.1325L23.5565 10.664H20.4965L19.9205 12.5ZM28.5344 12.5H27.0224V4.412H28.5344V12.5Z"
                                                    fill="white"
                                                />
                                            </svg>
                                        </h2>

                                        <h2 className="text-base font-medium">
                                            কমিউনিটিতে তোমাকে স্বাগতম। 🚀
                                        </h2>
                                        <h2 className=" text-light font-medium">
                                            তোমার পার্সোনালইজড হোমপেইজের জন্য তোমাকে কিছু প্রশ্নের
                                            উত্তর দিতে হবে, যেন তোমার ইন্টারেস্টের উপর ভিত্তি করে
                                            হোমপেইজ বানিয়ে দিতে পারি।{" "}
                                        </h2>
                                    </div>
                                    <h2 className="lg:block hidden">
                                        <Rocket />
                                    </h2>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <Steps
                                error={error}
                                datas={sources}
                                data={media}
                                setData={(data) => {
                                    setMedia(data as number);
                                    setDisabledNext(false);
                                }}
                                ques="তুমি ACS এর নাম কোথায় শুনেছো?"
                            />
                        )}

                        {currentStep === 2 && (
                            <div className="grid items-start justify-center min-h-[500px] p-4">
                                <div className="flex gap-4 items-center justify-center relative text-black dark:text-white">
                                    <h2>
                                        <Rocket />
                                    </h2>
                                    <div className="sm:w-[328px] bg-zemer p-4 rounded-lg">
                                        <h2>তোমার এলাকা এবং কলেজ সিলেক্ট করো</h2>
                                    </div>
                                </div>
                                <div className={cn("space-y-5", addSchool && "pb-[150px] sm:pb-0")}>
                                    <div className="flex flex-col gap-3">
                                        <Label>জেলা</Label>
                                        <Select
                                            value={city}
                                            required
                                            onValueChange={(value) => {
                                                setArea("");
                                                setCity(value);
                                            }}
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-ash/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-green-200/20",
                                                    error && !city && "ring-hot ring-2"
                                                )}
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        cityLoading ? (
                                                            <Loader2 className="animate-spin text-center mb-1" />
                                                        ) : (
                                                            "জেলা"
                                                        )
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent
                                                align="start"
                                                className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                            >
                                                {cities?.map((x) => (
                                                    <SelectItem
                                                        key={x.id}
                                                        value={x.id}
                                                        className="hover:!text-white hover:!bg-ice"
                                                    >
                                                        {x.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {error && !city && (
                                            <p className="text-hot text-xs">জেলা সিলেক্ট করো</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Label>থানা</Label>
                                        <Select
                                            disabled={!city}
                                            value={area}
                                            required
                                            onValueChange={(value) => {
                                                setArea(value);
                                            }}
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-ash/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-green-200/20",
                                                    error && !area && "ring-hot ring-2"
                                                )}
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        cityLoading ? (
                                                            <Loader2 className="animate-spin text-center mb-1" />
                                                        ) : (
                                                            "থানা"
                                                        )
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent
                                                align="start"
                                                className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                            >
                                                {thanas?.map((x) => (
                                                    <SelectItem
                                                        key={x.id}
                                                        value={x.id}
                                                        className="hover:!text-white hover:!bg-ice"
                                                    >
                                                        {x.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {error && !area && (
                                            <p className="text-hot text-xs">থানা সিলেক্ট করো</p>
                                        )}
                                    </div>
                                    {addSchool ? (
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-base w-full">তোমার স্কুল যোগ করো</Label>
                                            <div className="flex gap-2 items-center justify-center">
                                                <Input
                                                    className="w-full !h-10 !rounded-lg !text-black !ring-0 ring-olive !shadow-none !bg-white !border-none !outline-none"
                                                    value={schoolName}
                                                    onChange={(e) => setSchoolName(e.target.value)}
                                                    placeholder="স্কুল নাম"
                                                />
                                                <Button
                                                    onClick={handleAddSchool}
                                                    size="sm"
                                                    className="w-10 rounded-full !h-10 !ring-0 !shadow-none !bg-olive/20 !border-none !outline-none"
                                                >
                                                    {sLoading ? (
                                                        <Loader2 className="animate-spin text-center mb-1" />
                                                    ) : (
                                                        <Plus />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Label>কলেজ</Label>
                                            <Select
                                                disabled={!area}
                                                value={school}
                                                required
                                                onValueChange={(value) => {
                                                    setSchool(value);
                                                    setDisabledNext(false);
                                                }}
                                            >
                                                <SelectTrigger
                                                    className={cn(
                                                        "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-green-200/20",
                                                        error && !school && "ring-hot ring-2"
                                                    )}
                                                >
                                                    <SelectValue
                                                        placeholder={
                                                            cityLoading ? (
                                                                <Loader2 className="animate-spin text-center mb-1" />
                                                            ) : (
                                                                schoolName || "কলেজ"
                                                            )
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent
                                                    align="start"
                                                    className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                                >
                                                    <div className="px-2 hidden">
                                                        {!addSchool && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setAddSchool(true)}
                                                                className="w-full flex py-2 px-4 rounded-full items-center justify-start gap-2 text-left"
                                                            >
                                                                <Plus />
                                                                <span>কলেজ যোগ করো</span>
                                                            </button>

                                                        )}
                                                    </div>
                                                    {!addSchool && (
                                                        <div className="flex flex-col gap-2">
                                                            {schools?.map((x) => (
                                                                <SelectItem
                                                                    key={x.id}
                                                                    value={x.id}
                                                                    className="hover:!text-white hover:!bg-ice"
                                                                >
                                                                    {x.school_name}
                                                                </SelectItem>
                                                            ))}
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {error && !school && (
                                                <p className="text-hot text-xs">কলেজ সিলেক্ট করো</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <Step2
                                error={error}
                                datas={subjects.map((x) => ({ id: x.id, name: x.name }))}
                                data={subject}
                                setData={(i) => {
                                    if (subject.includes(i as string)) {
                                        const newVal = subject.filter((x) => x !== i);
                                        setSubject(newVal);
                                        if (newVal.length === 0) {
                                            setDisabledNext(true);
                                            setError("error");
                                        }
                                    } else {
                                        setSubject([...subject, i as string]);
                                        setDisabledNext(false);
                                        setError("");
                                    }
                                }}
                                ques="তোমার পছন্দের সাবজেক্ট কী কী?"
                            />
                        )}

                        {currentStep === 4 && (
                            <Step2
                                icon={
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g clip-path="url(#clip0_1932_41685)">
                                            <path
                                                d="M17.4545 0H6.54545C2.9305 0 0 2.9305 0 6.54545V17.4545C0 21.0695 2.9305 24 6.54545 24H17.4545C21.0695 24 24 21.0695 24 17.4545V6.54545C24 2.9305 21.0695 0 17.4545 0Z"
                                                fill="#EAF7FF"
                                            />
                                            <path
                                                d="M5.90854 16.3696H5.52295C5.52384 16.8798 5.72704 17.3689 6.08799 17.7295C6.44893 18.0901 6.93817 18.2929 7.4484 18.2933V17.9086C7.4484 17.8064 7.48898 17.7085 7.56122 17.6362C7.63345 17.564 7.73142 17.5234 7.83358 17.5234C7.93573 17.5234 8.0337 17.564 8.10594 17.6362C8.17817 17.7085 8.21875 17.8064 8.21875 17.9086V18.2933H8.98826V17.9086C8.98826 17.8064 9.02884 17.7085 9.10108 17.6362C9.17331 17.564 9.27128 17.5234 9.37344 17.5234C9.47559 17.5234 9.57356 17.564 9.6458 17.6362C9.71803 17.7085 9.75861 17.8064 9.75861 17.9086V18.2933H10.529V17.9086C10.529 17.8065 10.5695 17.7087 10.6417 17.6365C10.7138 17.5644 10.8117 17.5238 10.9137 17.5238C11.0158 17.5238 11.1136 17.5644 11.1858 17.6365C11.2579 17.7087 11.2985 17.8065 11.2985 17.9086V18.2933H12.0688V17.9086C12.0688 17.8064 12.1094 17.7085 12.1816 17.6362C12.2539 17.564 12.3518 17.5234 12.454 17.5234C12.5562 17.5234 12.6541 17.564 12.7264 17.6362C12.7986 17.7085 12.8392 17.8064 12.8392 17.9086V18.2933H13.6087V17.9086C13.6087 17.858 13.6186 17.8079 13.638 17.7612C13.6574 17.7144 13.6857 17.672 13.7215 17.6362C13.7573 17.6005 13.7997 17.5721 13.8465 17.5527C13.8932 17.5334 13.9433 17.5234 13.9939 17.5234C14.0444 17.5234 14.0945 17.5334 14.1413 17.5527C14.188 17.5721 14.2305 17.6005 14.2662 17.6362C14.302 17.672 14.3304 17.7144 14.3497 17.7612C14.3691 17.8079 14.379 17.858 14.379 17.9086V18.2933H15.1494V17.9086C15.1494 17.8065 15.1899 17.7087 15.2621 17.6365C15.3342 17.5644 15.4321 17.5238 15.5341 17.5238C15.6362 17.5238 15.734 17.5644 15.8062 17.6365C15.8784 17.7087 15.9189 17.8065 15.9189 17.9086V18.2933H16.37C17.4025 18.2933 17.9132 17.0475 17.1874 16.3217L7.49545 6.63056C6.76794 5.90305 5.52295 6.41718 5.52295 7.44711V7.89823H5.90854C6.0107 7.89823 6.10867 7.93881 6.1809 8.01105C6.25314 8.08328 6.29372 8.18125 6.29372 8.28341C6.29372 8.38556 6.25314 8.48353 6.1809 8.55577C6.10867 8.628 6.0107 8.66858 5.90854 8.66858H5.52295V9.43809H5.90854C6.0107 9.43809 6.10867 9.47867 6.1809 9.55091C6.25314 9.62314 6.29372 9.72111 6.29372 9.82327C6.29372 9.92542 6.25314 10.0234 6.1809 10.0956C6.10867 10.1679 6.0107 10.2084 5.90854 10.2084H5.52295V10.9788H5.90854C6.01059 10.9788 6.10845 11.0193 6.18061 11.0915C6.25276 11.1636 6.2933 11.2615 6.2933 11.3635C6.2933 11.4656 6.25276 11.5635 6.18061 11.6356C6.10845 11.7078 6.01059 11.7483 5.90854 11.7483H5.52295V12.5187H5.90854C6.0107 12.5187 6.10867 12.5592 6.1809 12.6315C6.25314 12.7037 6.29372 12.8017 6.29372 12.9038C6.29372 13.006 6.25314 13.104 6.1809 13.1762C6.10867 13.2484 6.0107 13.289 5.90854 13.289H5.52295V14.0585H5.90854C6.0107 14.0585 6.10867 14.0991 6.1809 14.1713C6.25314 14.2436 6.29372 14.3415 6.29372 14.4437C6.29372 14.5458 6.25314 14.6438 6.1809 14.716C6.10867 14.7883 6.0107 14.8289 5.90854 14.8289H5.52295V15.5992H5.90854C6.01059 15.5992 6.10845 15.6397 6.18061 15.7119C6.25276 15.7841 6.2933 15.8819 6.2933 15.984C6.2933 16.086 6.25276 16.1839 6.18061 16.256C6.10845 16.3282 6.01059 16.3696 5.90854 16.3696ZM8.21875 11.4434C8.21928 11.4056 8.23084 11.3689 8.252 11.3377C8.27316 11.3064 8.303 11.2821 8.33783 11.2676C8.37267 11.2531 8.41098 11.2492 8.44804 11.2562C8.4851 11.2633 8.51929 11.281 8.54638 11.3073L12.5099 15.2707C12.5361 15.2978 12.5538 15.332 12.5609 15.3691C12.5679 15.4061 12.564 15.4445 12.5495 15.4793C12.535 15.5141 12.5107 15.544 12.4795 15.5651C12.4482 15.5863 12.4115 15.5978 12.3738 15.5984H8.60351C8.50161 15.5984 8.40387 15.558 8.33174 15.486C8.25961 15.414 8.21898 15.3164 8.21875 15.2145V11.4434ZM12.8845 5.86021C12.6678 5.64393 12.3742 5.52246 12.068 5.52246C11.7618 5.52246 11.4681 5.64393 11.2514 5.86021L10.8003 6.31133C10.5838 6.52808 10.4621 6.82192 10.4621 7.1283C10.4621 7.43468 10.5838 7.72853 10.8003 7.94528L16.1911 13.3352C16.4061 13.5503 16.7035 13.6738 17.0076 13.6738H18.0359C18.1891 13.6735 18.336 13.6126 18.4443 13.5042C18.5527 13.3959 18.6136 13.249 18.6139 13.0958V12.0684C18.6139 11.7601 18.4937 11.4694 18.2753 11.2518L12.8845 5.86021ZM12.0688 8.12421L11.3464 7.40091C11.3105 7.36516 11.282 7.32268 11.2626 7.2759C11.2431 7.22912 11.2331 7.17896 11.2331 7.1283C11.2331 7.07765 11.2431 7.02749 11.2626 6.98071C11.282 6.93393 11.3105 6.89145 11.3464 6.8557L11.7966 6.40458C11.8324 6.36881 11.8748 6.34044 11.9215 6.32108C11.9682 6.30173 12.0183 6.29176 12.0688 6.29176C12.1194 6.29176 12.1694 6.30173 12.2161 6.32108C12.2628 6.34044 12.3053 6.36881 12.341 6.40458L13.0643 7.12788L12.0688 8.12421Z"
                                                fill="#0992E2"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1932_41685">
                                                <rect width="24" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                }
                                error={error}
                                datas={hobbies.map((x) => ({ id: x.id, name: x.name }))}
                                data={hobby}
                                setData={(i) => {
                                    if (hobby.includes(i as string)) {
                                        const newVal = hobby.filter((x) => x !== i);
                                        setHobby(newVal);
                                        if (newVal.length === 0) {
                                            setDisabledNext(true);
                                            setError("error");
                                        }
                                    } else {
                                        setHobby([...hobby, i as string]);
                                        setDisabledNext(false);
                                        setError("");
                                    }
                                }}
                                ques="তোমার শখ কী কী?"
                            />
                        )}
                        {currentStep === 5 && (
                            <Step2
                                icon={
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g clip-path="url(#clip0_1932_41685)">
                                            <path
                                                d="M17.4545 0H6.54545C2.9305 0 0 2.9305 0 6.54545V17.4545C0 21.0695 2.9305 24 6.54545 24H17.4545C21.0695 24 24 21.0695 24 17.4545V6.54545C24 2.9305 21.0695 0 17.4545 0Z"
                                                fill="#EAF7FF"
                                            />
                                            <path
                                                d="M5.90854 16.3696H5.52295C5.52384 16.8798 5.72704 17.3689 6.08799 17.7295C6.44893 18.0901 6.93817 18.2929 7.4484 18.2933V17.9086C7.4484 17.8064 7.48898 17.7085 7.56122 17.6362C7.63345 17.564 7.73142 17.5234 7.83358 17.5234C7.93573 17.5234 8.0337 17.564 8.10594 17.6362C8.17817 17.7085 8.21875 17.8064 8.21875 17.9086V18.2933H8.98826V17.9086C8.98826 17.8064 9.02884 17.7085 9.10108 17.6362C9.17331 17.564 9.27128 17.5234 9.37344 17.5234C9.47559 17.5234 9.57356 17.564 9.6458 17.6362C9.71803 17.7085 9.75861 17.8064 9.75861 17.9086V18.2933H10.529V17.9086C10.529 17.8065 10.5695 17.7087 10.6417 17.6365C10.7138 17.5644 10.8117 17.5238 10.9137 17.5238C11.0158 17.5238 11.1136 17.5644 11.1858 17.6365C11.2579 17.7087 11.2985 17.8065 11.2985 17.9086V18.2933H12.0688V17.9086C12.0688 17.8064 12.1094 17.7085 12.1816 17.6362C12.2539 17.564 12.3518 17.5234 12.454 17.5234C12.5562 17.5234 12.6541 17.564 12.7264 17.6362C12.7986 17.7085 12.8392 17.8064 12.8392 17.9086V18.2933H13.6087V17.9086C13.6087 17.858 13.6186 17.8079 13.638 17.7612C13.6574 17.7144 13.6857 17.672 13.7215 17.6362C13.7573 17.6005 13.7997 17.5721 13.8465 17.5527C13.8932 17.5334 13.9433 17.5234 13.9939 17.5234C14.0444 17.5234 14.0945 17.5334 14.1413 17.5527C14.188 17.5721 14.2305 17.6005 14.2662 17.6362C14.302 17.672 14.3304 17.7144 14.3497 17.7612C14.3691 17.8079 14.379 17.858 14.379 17.9086V18.2933H15.1494V17.9086C15.1494 17.8065 15.1899 17.7087 15.2621 17.6365C15.3342 17.5644 15.4321 17.5238 15.5341 17.5238C15.6362 17.5238 15.734 17.5644 15.8062 17.6365C15.8784 17.7087 15.9189 17.8065 15.9189 17.9086V18.2933H16.37C17.4025 18.2933 17.9132 17.0475 17.1874 16.3217L7.49545 6.63056C6.76794 5.90305 5.52295 6.41718 5.52295 7.44711V7.89823H5.90854C6.0107 7.89823 6.10867 7.93881 6.1809 8.01105C6.25314 8.08328 6.29372 8.18125 6.29372 8.28341C6.29372 8.38556 6.25314 8.48353 6.1809 8.55577C6.10867 8.628 6.0107 8.66858 5.90854 8.66858H5.52295V9.43809H5.90854C6.0107 9.43809 6.10867 9.47867 6.1809 9.55091C6.25314 9.62314 6.29372 9.72111 6.29372 9.82327C6.29372 9.92542 6.25314 10.0234 6.1809 10.0956C6.10867 10.1679 6.0107 10.2084 5.90854 10.2084H5.52295V10.9788H5.90854C6.01059 10.9788 6.10845 11.0193 6.18061 11.0915C6.25276 11.1636 6.2933 11.2615 6.2933 11.3635C6.2933 11.4656 6.25276 11.5635 6.18061 11.6356C6.10845 11.7078 6.01059 11.7483 5.90854 11.7483H5.52295V12.5187H5.90854C6.0107 12.5187 6.10867 12.5592 6.1809 12.6315C6.25314 12.7037 6.29372 12.8017 6.29372 12.9038C6.29372 13.006 6.25314 13.104 6.1809 13.1762C6.10867 13.2484 6.0107 13.289 5.90854 13.289H5.52295V14.0585H5.90854C6.0107 14.0585 6.10867 14.0991 6.1809 14.1713C6.25314 14.2436 6.29372 14.3415 6.29372 14.4437C6.29372 14.5458 6.25314 14.6438 6.1809 14.716C6.10867 14.7883 6.0107 14.8289 5.90854 14.8289H5.52295V15.5992H5.90854C6.01059 15.5992 6.10845 15.6397 6.18061 15.7119C6.25276 15.7841 6.2933 15.8819 6.2933 15.984C6.2933 16.086 6.25276 16.1839 6.18061 16.256C6.10845 16.3282 6.01059 16.3696 5.90854 16.3696ZM8.21875 11.4434C8.21928 11.4056 8.23084 11.3689 8.252 11.3377C8.27316 11.3064 8.303 11.2821 8.33783 11.2676C8.37267 11.2531 8.41098 11.2492 8.44804 11.2562C8.4851 11.2633 8.51929 11.281 8.54638 11.3073L12.5099 15.2707C12.5361 15.2978 12.5538 15.332 12.5609 15.3691C12.5679 15.4061 12.564 15.4445 12.5495 15.4793C12.535 15.5141 12.5107 15.544 12.4795 15.5651C12.4482 15.5863 12.4115 15.5978 12.3738 15.5984H8.60351C8.50161 15.5984 8.40387 15.558 8.33174 15.486C8.25961 15.414 8.21898 15.3164 8.21875 15.2145V11.4434ZM12.8845 5.86021C12.6678 5.64393 12.3742 5.52246 12.068 5.52246C11.7618 5.52246 11.4681 5.64393 11.2514 5.86021L10.8003 6.31133C10.5838 6.52808 10.4621 6.82192 10.4621 7.1283C10.4621 7.43468 10.5838 7.72853 10.8003 7.94528L16.1911 13.3352C16.4061 13.5503 16.7035 13.6738 17.0076 13.6738H18.0359C18.1891 13.6735 18.336 13.6126 18.4443 13.5042C18.5527 13.3959 18.6136 13.249 18.6139 13.0958V12.0684C18.6139 11.7601 18.4937 11.4694 18.2753 11.2518L12.8845 5.86021ZM12.0688 8.12421L11.3464 7.40091C11.3105 7.36516 11.282 7.32268 11.2626 7.2759C11.2431 7.22912 11.2331 7.17896 11.2331 7.1283C11.2331 7.07765 11.2431 7.02749 11.2626 6.98071C11.282 6.93393 11.3105 6.89145 11.3464 6.8557L11.7966 6.40458C11.8324 6.36881 11.8748 6.34044 11.9215 6.32108C11.9682 6.30173 12.0183 6.29176 12.0688 6.29176C12.1194 6.29176 12.1694 6.30173 12.2161 6.32108C12.2628 6.34044 12.3053 6.36881 12.341 6.40458L13.0643 7.12788L12.0688 8.12421Z"
                                                fill="#0992E2"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1932_41685">
                                                <rect width="24" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                }
                                error={error}
                                datas={socialContents.map((x) => ({ id: x.id, name: x.name }))}
                                data={content}
                                setData={(i) => {
                                    if (lifeGoal.includes(i as number)) {
                                        const newVal = content.filter((x) => x !== i);
                                        setContent(newVal);
                                        if (newVal.length === 0) {
                                            setDisabledNext(true);
                                            setError("error");
                                        }
                                    } else {
                                        setContent([...content, i as number]);
                                        setDisabledNext(false);
                                        setError("");
                                    }
                                }}
                                ques="তোমার সোশাল মিডিয়ায় পছন্দের কন্টেন্ট কী কী?"
                            />
                        )}

                        {currentStep === 6 && (
                            <div className="grid items-start justify-start min-h-[500px] p-4">
                                <div className="flex gap-4 items-center justify-start relative text-black dark:text-white">
                                    <h2>
                                        <Rocket />
                                    </h2>
                                    <div className="sm:w-[328px] bg-zemer p-4 rounded-lg">
                                        <h2>
                                            তোমার সোশাল মিডিয়া কনটেন্ট ক্রিয়েটর প্রেফারেন্স কে কে?
                                        </h2>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 items-center justify-between w-full gap-5 py-5">
                                    {contentCreators.map((x, index) => (
                                        <div
                                            key={index}
                                            className="grid col-span-1 grid-cols-3 w-full sm:grid-cols-4 gap-3 items-start justify-between pb-5"
                                        >
                                            <h2 className="col-span-3 sm:col-span-4 text-lg font-bold">
                                                {x.title}
                                            </h2>
                                            {x.list.map((item, index) => {
                                                const isSelected = contentCreator
                                                    .filter((z) => z.type === x.type)
                                                    .map((y) => y.id)
                                                    .includes(item.id);
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                const newVal = contentCreator.filter(
                                                                    (a) => a.id !== item.id
                                                                );
                                                                setContentCreator(newVal);
                                                                if (newVal.length === 0) {
                                                                    setDisabledNext(true);
                                                                    setError("error");
                                                                }
                                                            } else {
                                                                setContentCreator([
                                                                    ...contentCreator,
                                                                    { id: item.id, type: x.type },
                                                                ]);
                                                                setDisabledNext(false);
                                                                setError("");
                                                            }
                                                        }}
                                                        className="p-4 sm:p-0 sm:w-[150px] col-span-1 grid items-start justify-center gap-2"
                                                    >
                                                        <p className="w-[100px] h-[120px] mx-auto">
                                                            <img
                                                                src={item.icon}
                                                                alt={index.toString()}
                                                                className={cn(
                                                                    "grid w-[100px] h-[120px] object-cover bg-white text-sm mx-auto items-center justify-center rounded-lg duration-300",
                                                                    isSelected
                                                                        ? "ring-olive ring-4 opacity-100 shadow-xl shadow-life"
                                                                        : "ring-ash opacity-80 shadow-none ring-2 shadow-elegant/50"
                                                                )}
                                                            />
                                                        </p>
                                                        <span className="text-sm sm:text-base">
                                                            {item.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 7 && (
                            <Steps
                                col={1}
                                icon={
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g clip-path="url(#clip0_1932_41685)">
                                            <path
                                                d="M17.4545 0H6.54545C2.9305 0 0 2.9305 0 6.54545V17.4545C0 21.0695 2.9305 24 6.54545 24H17.4545C21.0695 24 24 21.0695 24 17.4545V6.54545C24 2.9305 21.0695 0 17.4545 0Z"
                                                fill="#EAF7FF"
                                            />
                                            <path
                                                d="M5.90854 16.3696H5.52295C5.52384 16.8798 5.72704 17.3689 6.08799 17.7295C6.44893 18.0901 6.93817 18.2929 7.4484 18.2933V17.9086C7.4484 17.8064 7.48898 17.7085 7.56122 17.6362C7.63345 17.564 7.73142 17.5234 7.83358 17.5234C7.93573 17.5234 8.0337 17.564 8.10594 17.6362C8.17817 17.7085 8.21875 17.8064 8.21875 17.9086V18.2933H8.98826V17.9086C8.98826 17.8064 9.02884 17.7085 9.10108 17.6362C9.17331 17.564 9.27128 17.5234 9.37344 17.5234C9.47559 17.5234 9.57356 17.564 9.6458 17.6362C9.71803 17.7085 9.75861 17.8064 9.75861 17.9086V18.2933H10.529V17.9086C10.529 17.8065 10.5695 17.7087 10.6417 17.6365C10.7138 17.5644 10.8117 17.5238 10.9137 17.5238C11.0158 17.5238 11.1136 17.5644 11.1858 17.6365C11.2579 17.7087 11.2985 17.8065 11.2985 17.9086V18.2933H12.0688V17.9086C12.0688 17.8064 12.1094 17.7085 12.1816 17.6362C12.2539 17.564 12.3518 17.5234 12.454 17.5234C12.5562 17.5234 12.6541 17.564 12.7264 17.6362C12.7986 17.7085 12.8392 17.8064 12.8392 17.9086V18.2933H13.6087V17.9086C13.6087 17.858 13.6186 17.8079 13.638 17.7612C13.6574 17.7144 13.6857 17.672 13.7215 17.6362C13.7573 17.6005 13.7997 17.5721 13.8465 17.5527C13.8932 17.5334 13.9433 17.5234 13.9939 17.5234C14.0444 17.5234 14.0945 17.5334 14.1413 17.5527C14.188 17.5721 14.2305 17.6005 14.2662 17.6362C14.302 17.672 14.3304 17.7144 14.3497 17.7612C14.3691 17.8079 14.379 17.858 14.379 17.9086V18.2933H15.1494V17.9086C15.1494 17.8065 15.1899 17.7087 15.2621 17.6365C15.3342 17.5644 15.4321 17.5238 15.5341 17.5238C15.6362 17.5238 15.734 17.5644 15.8062 17.6365C15.8784 17.7087 15.9189 17.8065 15.9189 17.9086V18.2933H16.37C17.4025 18.2933 17.9132 17.0475 17.1874 16.3217L7.49545 6.63056C6.76794 5.90305 5.52295 6.41718 5.52295 7.44711V7.89823H5.90854C6.0107 7.89823 6.10867 7.93881 6.1809 8.01105C6.25314 8.08328 6.29372 8.18125 6.29372 8.28341C6.29372 8.38556 6.25314 8.48353 6.1809 8.55577C6.10867 8.628 6.0107 8.66858 5.90854 8.66858H5.52295V9.43809H5.90854C6.0107 9.43809 6.10867 9.47867 6.1809 9.55091C6.25314 9.62314 6.29372 9.72111 6.29372 9.82327C6.29372 9.92542 6.25314 10.0234 6.1809 10.0956C6.10867 10.1679 6.0107 10.2084 5.90854 10.2084H5.52295V10.9788H5.90854C6.01059 10.9788 6.10845 11.0193 6.18061 11.0915C6.25276 11.1636 6.2933 11.2615 6.2933 11.3635C6.2933 11.4656 6.25276 11.5635 6.18061 11.6356C6.10845 11.7078 6.01059 11.7483 5.90854 11.7483H5.52295V12.5187H5.90854C6.0107 12.5187 6.10867 12.5592 6.1809 12.6315C6.25314 12.7037 6.29372 12.8017 6.29372 12.9038C6.29372 13.006 6.25314 13.104 6.1809 13.1762C6.10867 13.2484 6.0107 13.289 5.90854 13.289H5.52295V14.0585H5.90854C6.0107 14.0585 6.10867 14.0991 6.1809 14.1713C6.25314 14.2436 6.29372 14.3415 6.29372 14.4437C6.29372 14.5458 6.25314 14.6438 6.1809 14.716C6.10867 14.7883 6.0107 14.8289 5.90854 14.8289H5.52295V15.5992H5.90854C6.01059 15.5992 6.10845 15.6397 6.18061 15.7119C6.25276 15.7841 6.2933 15.8819 6.2933 15.984C6.2933 16.086 6.25276 16.1839 6.18061 16.256C6.10845 16.3282 6.01059 16.3696 5.90854 16.3696ZM8.21875 11.4434C8.21928 11.4056 8.23084 11.3689 8.252 11.3377C8.27316 11.3064 8.303 11.2821 8.33783 11.2676C8.37267 11.2531 8.41098 11.2492 8.44804 11.2562C8.4851 11.2633 8.51929 11.281 8.54638 11.3073L12.5099 15.2707C12.5361 15.2978 12.5538 15.332 12.5609 15.3691C12.5679 15.4061 12.564 15.4445 12.5495 15.4793C12.535 15.5141 12.5107 15.544 12.4795 15.5651C12.4482 15.5863 12.4115 15.5978 12.3738 15.5984H8.60351C8.50161 15.5984 8.40387 15.558 8.33174 15.486C8.25961 15.414 8.21898 15.3164 8.21875 15.2145V11.4434ZM12.8845 5.86021C12.6678 5.64393 12.3742 5.52246 12.068 5.52246C11.7618 5.52246 11.4681 5.64393 11.2514 5.86021L10.8003 6.31133C10.5838 6.52808 10.4621 6.82192 10.4621 7.1283C10.4621 7.43468 10.5838 7.72853 10.8003 7.94528L16.1911 13.3352C16.4061 13.5503 16.7035 13.6738 17.0076 13.6738H18.0359C18.1891 13.6735 18.336 13.6126 18.4443 13.5042C18.5527 13.3959 18.6136 13.249 18.6139 13.0958V12.0684C18.6139 11.7601 18.4937 11.4694 18.2753 11.2518L12.8845 5.86021ZM12.0688 8.12421L11.3464 7.40091C11.3105 7.36516 11.282 7.32268 11.2626 7.2759C11.2431 7.22912 11.2331 7.17896 11.2331 7.1283C11.2331 7.07765 11.2431 7.02749 11.2626 6.98071C11.282 6.93393 11.3105 6.89145 11.3464 6.8557L11.7966 6.40458C11.8324 6.36881 11.8748 6.34044 11.9215 6.32108C11.9682 6.30173 12.0183 6.29176 12.0688 6.29176C12.1194 6.29176 12.1694 6.30173 12.2161 6.32108C12.2628 6.34044 12.3053 6.36881 12.341 6.40458L13.0643 7.12788L12.0688 8.12421Z"
                                                fill="#0992E2"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1932_41685">
                                                <rect width="24" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                }
                                error={error}
                                datas={lifeGoals.map((x) => ({ id: x.id, name: x.name }))}
                                data={lifeGoal[0]}
                                setData={(data) => {
                                    setLifeGoal([data as number]);
                                    setDisabledNext(false);
                                }}
                                ques="ভর্তি পরীক্ষায় তোমার লক্ষ্য কী?"
                            />
                        )}

                        {currentStep === 8 && (
                            <Steps
                                error={error}
                                icon={
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g clip-path="url(#clip0_1932_41685)">
                                            <path
                                                d="M17.4545 0H6.54545C2.9305 0 0 2.9305 0 6.54545V17.4545C0 21.0695 2.9305 24 6.54545 24H17.4545C21.0695 24 24 21.0695 24 17.4545V6.54545C24 2.9305 21.0695 0 17.4545 0Z"
                                                fill="#EAF7FF"
                                            />
                                            <path
                                                d="M5.90854 16.3696H5.52295C5.52384 16.8798 5.72704 17.3689 6.08799 17.7295C6.44893 18.0901 6.93817 18.2929 7.4484 18.2933V17.9086C7.4484 17.8064 7.48898 17.7085 7.56122 17.6362C7.63345 17.564 7.73142 17.5234 7.83358 17.5234C7.93573 17.5234 8.0337 17.564 8.10594 17.6362C8.17817 17.7085 8.21875 17.8064 8.21875 17.9086V18.2933H8.98826V17.9086C8.98826 17.8064 9.02884 17.7085 9.10108 17.6362C9.17331 17.564 9.27128 17.5234 9.37344 17.5234C9.47559 17.5234 9.57356 17.564 9.6458 17.6362C9.71803 17.7085 9.75861 17.8064 9.75861 17.9086V18.2933H10.529V17.9086C10.529 17.8065 10.5695 17.7087 10.6417 17.6365C10.7138 17.5644 10.8117 17.5238 10.9137 17.5238C11.0158 17.5238 11.1136 17.5644 11.1858 17.6365C11.2579 17.7087 11.2985 17.8065 11.2985 17.9086V18.2933H12.0688V17.9086C12.0688 17.8064 12.1094 17.7085 12.1816 17.6362C12.2539 17.564 12.3518 17.5234 12.454 17.5234C12.5562 17.5234 12.6541 17.564 12.7264 17.6362C12.7986 17.7085 12.8392 17.8064 12.8392 17.9086V18.2933H13.6087V17.9086C13.6087 17.858 13.6186 17.8079 13.638 17.7612C13.6574 17.7144 13.6857 17.672 13.7215 17.6362C13.7573 17.6005 13.7997 17.5721 13.8465 17.5527C13.8932 17.5334 13.9433 17.5234 13.9939 17.5234C14.0444 17.5234 14.0945 17.5334 14.1413 17.5527C14.188 17.5721 14.2305 17.6005 14.2662 17.6362C14.302 17.672 14.3304 17.7144 14.3497 17.7612C14.3691 17.8079 14.379 17.858 14.379 17.9086V18.2933H15.1494V17.9086C15.1494 17.8065 15.1899 17.7087 15.2621 17.6365C15.3342 17.5644 15.4321 17.5238 15.5341 17.5238C15.6362 17.5238 15.734 17.5644 15.8062 17.6365C15.8784 17.7087 15.9189 17.8065 15.9189 17.9086V18.2933H16.37C17.4025 18.2933 17.9132 17.0475 17.1874 16.3217L7.49545 6.63056C6.76794 5.90305 5.52295 6.41718 5.52295 7.44711V7.89823H5.90854C6.0107 7.89823 6.10867 7.93881 6.1809 8.01105C6.25314 8.08328 6.29372 8.18125 6.29372 8.28341C6.29372 8.38556 6.25314 8.48353 6.1809 8.55577C6.10867 8.628 6.0107 8.66858 5.90854 8.66858H5.52295V9.43809H5.90854C6.0107 9.43809 6.10867 9.47867 6.1809 9.55091C6.25314 9.62314 6.29372 9.72111 6.29372 9.82327C6.29372 9.92542 6.25314 10.0234 6.1809 10.0956C6.10867 10.1679 6.0107 10.2084 5.90854 10.2084H5.52295V10.9788H5.90854C6.01059 10.9788 6.10845 11.0193 6.18061 11.0915C6.25276 11.1636 6.2933 11.2615 6.2933 11.3635C6.2933 11.4656 6.25276 11.5635 6.18061 11.6356C6.10845 11.7078 6.01059 11.7483 5.90854 11.7483H5.52295V12.5187H5.90854C6.0107 12.5187 6.10867 12.5592 6.1809 12.6315C6.25314 12.7037 6.29372 12.8017 6.29372 12.9038C6.29372 13.006 6.25314 13.104 6.1809 13.1762C6.10867 13.2484 6.0107 13.289 5.90854 13.289H5.52295V14.0585H5.90854C6.0107 14.0585 6.10867 14.0991 6.1809 14.1713C6.25314 14.2436 6.29372 14.3415 6.29372 14.4437C6.29372 14.5458 6.25314 14.6438 6.1809 14.716C6.10867 14.7883 6.0107 14.8289 5.90854 14.8289H5.52295V15.5992H5.90854C6.01059 15.5992 6.10845 15.6397 6.18061 15.7119C6.25276 15.7841 6.2933 15.8819 6.2933 15.984C6.2933 16.086 6.25276 16.1839 6.18061 16.256C6.10845 16.3282 6.01059 16.3696 5.90854 16.3696ZM8.21875 11.4434C8.21928 11.4056 8.23084 11.3689 8.252 11.3377C8.27316 11.3064 8.303 11.2821 8.33783 11.2676C8.37267 11.2531 8.41098 11.2492 8.44804 11.2562C8.4851 11.2633 8.51929 11.281 8.54638 11.3073L12.5099 15.2707C12.5361 15.2978 12.5538 15.332 12.5609 15.3691C12.5679 15.4061 12.564 15.4445 12.5495 15.4793C12.535 15.5141 12.5107 15.544 12.4795 15.5651C12.4482 15.5863 12.4115 15.5978 12.3738 15.5984H8.60351C8.50161 15.5984 8.40387 15.558 8.33174 15.486C8.25961 15.414 8.21898 15.3164 8.21875 15.2145V11.4434ZM12.8845 5.86021C12.6678 5.64393 12.3742 5.52246 12.068 5.52246C11.7618 5.52246 11.4681 5.64393 11.2514 5.86021L10.8003 6.31133C10.5838 6.52808 10.4621 6.82192 10.4621 7.1283C10.4621 7.43468 10.5838 7.72853 10.8003 7.94528L16.1911 13.3352C16.4061 13.5503 16.7035 13.6738 17.0076 13.6738H18.0359C18.1891 13.6735 18.336 13.6126 18.4443 13.5042C18.5527 13.3959 18.6136 13.249 18.6139 13.0958V12.0684C18.6139 11.7601 18.4937 11.4694 18.2753 11.2518L12.8845 5.86021ZM12.0688 8.12421L11.3464 7.40091C11.3105 7.36516 11.282 7.32268 11.2626 7.2759C11.2431 7.22912 11.2331 7.17896 11.2331 7.1283C11.2331 7.07765 11.2431 7.02749 11.2626 6.98071C11.282 6.93393 11.3105 6.89145 11.3464 6.8557L11.7966 6.40458C11.8324 6.36881 11.8748 6.34044 11.9215 6.32108C11.9682 6.30173 12.0183 6.29176 12.0688 6.29176C12.1194 6.29176 12.1694 6.30173 12.2161 6.32108C12.2628 6.34044 12.3053 6.36881 12.341 6.40458L13.0643 7.12788L12.0688 8.12421Z"
                                                fill="#0992E2"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1932_41685">
                                                <rect width="24" height="24" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                }
                                datas={personalityTypes}
                                col={1}
                                data={personality}
                                setData={(data) => {
                                    setPersonality(data as number);
                                    setDisabledNext(false);
                                }}
                                ques="তোমার পার্সোনালিটি টাইপ কি?"
                            />
                        )}

                        <div className="pb-10">
                            <Button
                                type="button"
                                onClick={handleSteps}
                                className={cn(
                                    "w-[200px] !h-[44px] !text-lg !font-medium  text-white shadow-none ",
                                    disabledNext ? "bg-light/50" : "bg-olive shadow-life"
                                )}
                            >
                                {currentStep === 8 ? (
                                    <>
                                        <span>শেষ করো</span>
                                        {loading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <svg
                                                width="17"
                                                height="16"
                                                viewBox="0 0 17 16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g clip-path="url(#clip0_1977_41078)">
                                                    <path
                                                        d="M4.38879 4.32031L3.00262 4.42741C2.6169 4.45722 2.27337 4.65937 2.06006 4.98203L0.461417 7.39988C0.299637 7.64457 0.273918 7.95078 0.392574 8.21903C0.51126 8.48728 0.755165 8.67422 1.04501 8.71912L2.31421 8.91568C2.61112 7.34007 3.32186 5.76833 4.38879 4.32031Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M7.40283 14.0043L7.59942 15.2735C7.64433 15.5633 7.83127 15.8072 8.09948 15.9259C8.21108 15.9752 8.3292 15.9996 8.44673 15.9996C8.61182 15.9996 8.77576 15.9515 8.91866 15.857L11.3366 14.2584C11.6592 14.0451 11.8614 13.7015 11.8911 13.3159L11.9982 11.9297C10.5502 12.9966 8.97848 13.7074 7.40283 14.0043Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M6.92565 13.1246C6.96971 13.1246 7.01403 13.121 7.05824 13.1136C7.71836 13.0033 8.35461 12.8173 8.96154 12.5739L3.74502 7.35742C3.50165 7.96432 3.31571 8.60057 3.20534 9.26072C3.16184 9.52094 3.24912 9.78603 3.43565 9.97259L6.34637 12.8833C6.50125 13.0382 6.71028 13.1246 6.92565 13.1246Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M15.0434 7.09379C16.3199 4.62587 16.3672 2.01789 16.3004 0.794775C16.2776 0.375685 15.9435 0.0415622 15.5243 0.0187186C15.3252 0.00784369 15.0892 0 14.8231 0C13.4555 0 11.2914 0.207155 9.22534 1.2758C7.58341 2.12508 5.4304 3.99509 4.16016 6.45264C4.17516 6.46435 4.18981 6.47679 4.20362 6.49061L9.82858 12.1156C9.84239 12.1294 9.8548 12.144 9.86652 12.159C12.3241 10.8887 14.1941 8.73571 15.0434 7.09379ZM9.62214 3.38247C10.5359 2.4687 12.0228 2.46861 12.9366 3.38247C13.3793 3.82513 13.6231 4.41371 13.6231 5.03974C13.6231 5.66577 13.3793 6.25436 12.9366 6.69701C12.4798 7.15385 11.8795 7.38232 11.2794 7.38238C10.6791 7.38241 10.0791 7.15398 9.62214 6.69701C9.17946 6.25436 8.93565 5.66577 8.93565 5.03974C8.93565 4.41371 9.17946 3.82513 9.62214 3.38247Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M10.2849 6.03373C10.8332 6.58201 11.7254 6.58204 12.2737 6.03373C12.5393 5.7681 12.6855 5.41498 12.6855 5.03935C12.6855 4.66373 12.5393 4.3106 12.2737 4.04501C11.9995 3.77085 11.6394 3.63379 11.2793 3.63379C10.9192 3.63379 10.5591 3.77085 10.285 4.04501C10.0194 4.3106 9.87305 4.66373 9.87305 5.03935C9.87305 5.41498 10.0193 5.76813 10.2849 6.03373Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M0.797379 13.1857C0.917348 13.1857 1.03732 13.1399 1.12882 13.0484L2.65922 11.518C2.84229 11.3349 2.84229 11.0381 2.65922 10.8551C2.47619 10.672 2.17938 10.672 1.99632 10.8551L0.46591 12.3855C0.282848 12.5685 0.282848 12.8653 0.46591 13.0484C0.557441 13.1399 0.67741 13.1857 0.797379 13.1857Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M4.06188 12.2574C3.87885 12.0744 3.58204 12.0744 3.39898 12.2574L0.456633 15.1998C0.27357 15.3828 0.27357 15.6796 0.456633 15.8627C0.548164 15.9542 0.668133 15.9999 0.788102 15.9999C0.90807 15.9999 1.02804 15.9542 1.11954 15.8626L4.06185 12.9203C4.24495 12.7373 4.24495 12.4405 4.06188 12.2574Z"
                                                        fill="white"
                                                    />
                                                    <path
                                                        d="M4.80146 13.6598L3.27109 15.1902C3.08802 15.3732 3.08802 15.67 3.27109 15.8531C3.36262 15.9446 3.48259 15.9904 3.60252 15.9904C3.72246 15.9904 3.84246 15.9446 3.93396 15.8531L5.46437 14.3227C5.64743 14.1396 5.64743 13.8428 5.46437 13.6598C5.28134 13.4767 4.98452 13.4767 4.80146 13.6598Z"
                                                        fill="white"
                                                    />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_1977_41078">
                                                        <rect
                                                            width="16"
                                                            height="16"
                                                            fill="white"
                                                            transform="translate(0.318848)"
                                                        />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        )}
                                    </>
                                ) : currentStep === 0 ? (
                                    <span>শুরু করো</span>
                                ) : (
                                    <>
                                        <span>পরবর্তী</span>
                                        <ArrowRight />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default OnboardPage;
