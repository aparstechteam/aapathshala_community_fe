import { Better, Haha, Hard, Sad, Wow } from "@/components";

export type ReactionTypes = {
    id: number;
    name: string;
    value: string;
    icon: JSX.Element;
    color: string;
  };
  
  export const reactionTabs: ReactionTypes[] = [
    {
      id: 2,
      name: "ভালো প্রশ্ন",
      icon: Better,
      value: "good",
      color: "text-red-500",
    },
    {
      id: 3,
      name: "কঠিন",
      icon: Hard,
      value: "hard",
      color: "text-yellow-500",
    },
    {
      id: 4,
      name: "দুর্দান্ত",
      icon: Wow,
      value: "excellent",
      color: "text-teal-500",
    },
    {
      id: 5,
      name: "পারবো না",
      icon: Sad,
      value: "cant",
      color: "text-purple-500",
    },
    {
      id: 6,
      name: "মজার প্রশ্ন",
      icon: Haha,
      value: "funny",
      color: "text-red-600",
    },
  ];
  