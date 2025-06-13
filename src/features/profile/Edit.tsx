import React from "react";
import Image from "next/image";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useUser,
} from "@/components";
import { Loader2 } from "lucide-react";

export type UserEdit = {
  name: string;
  phone: string;
  email: string;
  instituteName: string | undefined;
  hsc_batch: string | undefined;
  group: string | undefined | null;
  gender: string | undefined | null;
  goal: string | undefined | null;
};

type Props = {
  me: UserEdit;
  setImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
};

export const ProfileEdit = (props: Props) => {
  const { user } = useUser();
  const { me, setImage, handleChange, onSubmit, loading } = props;

  return (
    <div className="flex items-center py-6 justify-center h-full min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-xl bg-white ring-ash ring-1 rounded-lg shadow-md mx-auto p-6">
        <div>
          <h2 className="text-center pb-4 text-xl font-semibold">
            ব্যক্তিগত তথ্যসমূহ
          </h2>
        </div>
        <div>
          <form
            onSubmit={onSubmit}
            className="gap-4 grid grid-cols-2 justify-center"
          >
            <div className="flex flex-col col-span-2 items-center">
              {user?.profilePic && (
                <div className="relative w-24 h-24 mb-2">
                  <Image
                    src={user?.profilePic}
                    alt="Profile"
                    layout="fill"
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <Label
                htmlFor="profile-image"
                className="cursor-pointer bg-primary text-primary-foreground px-3 py-1 rounded-md"
              >
                Change
              </Label>
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={setImage}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">নাম</Label>
              <Input
                disabled
                value={user?.name}
                id="name"
                placeholder="নাম"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-1 col-span-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input
                disabled
                value={user?.phone}
                id="phone"
                placeholder="ফোন নম্বর"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-1 col-span-2">
              <Label htmlFor="email">ই-মেইল এড্রেস</Label>
              <Input
                disabled
                value={user?.email}
                id="email"
                type="email"
                placeholder="ই-মেইল এড্রেস"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="school">কলেজ</Label>
              <Input
                disabled
                value={user?.instituteName}
                id="school"
                placeholder="কলেজের নাম"
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-1 col-span-2">
              <Label htmlFor="hsc-batch">এইচ এস সি ব্যাচ</Label>
              <Select
                disabled
                value={user?.hsc_batch || ""}
                onValueChange={(value) =>
                  handleChange({
                    target: { id: "hsc_batch", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              >
                <SelectTrigger className="ring-ash ring-1">
                  <SelectValue placeholder="ব্যাচ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HSC 26">HSC 26</SelectItem>
                  <SelectItem value="HSC 25">HSC 25</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="group">তুমি কোন গ্রুপে পড়ো?</Label>
              <Select
                disabled
                value={user?.group || ""}
                onValueChange={(value) =>
                  handleChange({
                    target: { id: "group", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              >
                <SelectTrigger className="ring-ash ring-1">
                  <SelectValue placeholder="গ্রুপ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="science">বিজ্ঞান</SelectItem>
                  <SelectItem value="commerce">বাণিজ্য</SelectItem>
                  <SelectItem value="arts">মানবিক</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="preferred-subject">তুমি ছেলে না মেয়ে?</Label>
              <Select
                value={me?.gender || ""}
                onValueChange={(value) =>
                  handleChange({
                    target: { id: "gender", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              >
                <SelectTrigger className="ring-ash ring-1">
                  <SelectValue placeholder="ছেলে না মেয়ে?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boy">ছেলে</SelectItem>
                  <SelectItem value="girl">মেয়ে</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="preferred-subject">তোমার পছন্দের বিষয় কী?</Label>
              <Select
                value={me?.goal || ""}
                onValueChange={(value) =>
                  handleChange({
                    target: { id: "goal", value },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              >
                <SelectTrigger className="ring-ash ring-1">
                  <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">ইঞ্জিনিয়ারিং</SelectItem>
                  <SelectItem value="medical">মেডিকেল</SelectItem>
                  <SelectItem value="general">সাধারণ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r !text-white from-rose-500 to-rose-700 !rounded-full"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "প্রোফাইল আপডেট করুন"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
