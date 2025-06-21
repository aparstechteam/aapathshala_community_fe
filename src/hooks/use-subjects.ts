import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { secondaryAPI } from "@/configs";
import { handleError } from "./error-handle";
import { useUser } from "@/components";
import { Chapter, Subject } from "@/@types";

export const useSubject = () => {
  const { user } = useUser();
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: "647881769f21f713debc9690",
      name: "Bangla 1st Paper",
    },
    {
      id: "647ff2d1f75163e4d79200e4",
      name: "Bangla 2nd Paper",
    },
    {
      id: "6496c0f3f7055154d512f788",
      name: "English 1st Paper",
    },
    {
      id: "647ff2d1f75163e4d79200f5",
      name: "English 2nd Paper",
    },
    {
      id: "647ff2d1f75163e4d79200d7",
      name: "ICT",
    },
    {
      id: "64798aa4330fd9518a1783db",
      name: "Physics 1st Paper",
    },
    {
      id: "64798aa4330fd9518a1783f0",
      name: "Physics 2nd Paper",
    },
    {
      id: "64798aa4330fd9518a178407",
      name: "Chemistry 1st Paper",
    },
    {
      id: "64798aa4330fd9518a178412",
      name: "Chemistry 2nd Paper",
    },
    {
      id: "64798aa4330fd9518a17841d",
      name: "Higher Math 1st Paper",
    },
    {
      id: "64798aa4330fd9518a178432",
      name: "Higher Math 2nd Paper",
    },
    {
      id: "64798aa4330fd9518a178447",
      name: "Biology 1st Paper",
    },
    {
      id: "64798aa4330fd9518a178460",
      name: "Biology 2nd Paper",
    },
    {
      id: "6479d2bc4f4ac7a73bd618a0",
      name: "Geography 1st Paper",
    },
    {
      id: "6479d2bc4f4ac7a73bd618ab",
      name: "Geography 2nd Paper",
    },
    {
      id: "656d53d7338dbaf1cd81b4c6",
      name: "Statistics 1st Paper",
    },
    {
      id: "656d53d7338dbaf1cd81b4c8",
      name: "Statistics 2nd Paper",
    },
    {
      id: "6592820112985d289999cc08",
      name: "Agriculture 1st Paper",
    },
    {
      id: "6592821a12985d289999cc0b",
      name: "Agriculture 2nd Paper",
    },
    {
      id: "6596872900e14248e3974f37",
      name: "Psychology 1st Paper",
    },
    {
      id: "6596876100e14248e3975acf",
      name: "Psychology 2nd Paper",
    },
  ]);
  const [topicLoading, setTopicLoading] = useState<boolean>(false);
  const [subLoading, setSubLoading] = useState<boolean>(false);
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: "647881e29f21f713debc96bc",
      name: "অপরিচিতা",
    },
    {
      id: "64788f69d64586fab8a37679",
      name: "বিলাসী",
    },
    {
      id: "647891a6b117eeba8a323c69",
      name: "আমার পথ",
    },
    {
      id: "64789523061177bf42dca187",
      name: "মানব-কল্যান",
    },
    {
      id: "647896d693c8ad6733035872",
      name: "মাসি-পিসি",
    },
    {
      id: "647896dd93c8ad673303587e",
      name: "বায়ান্নর দিনগুলো",
    },
    {
      id: "647896e493c8ad673303588b",
      name: "রেইনকোট",
    },
    {
      id: "647896f393c8ad6733035899",
      name: "সোনার তরী",
    },
    {
      id: "647896fa93c8ad67330358a8",
      name: "বিদ্রোহী",
    },
    {
      id: "6478970193c8ad67330358b8",
      name: "তাহারেই পড়ে মনে",
    },
    {
      id: "6478970c93c8ad67330358c9",
      name: "আঠারো বছর বয়স",
    },
    {
      id: "6478971493c8ad67330358db",
      name: "ফেব্রুয়ারী ১৯৬৯",
    },
    {
      id: "6478971b93c8ad67330358ee",
      name: "আমি কিংবদন্তি কথা বলছি",
    },
    {
      id: "647d4af29377b8b9bf3d6616",
      name: "সিরাজউদ্দৌলা",
    },
    {
      id: "647d4b215bdd6b28824901ff",
      name: "লালসালু",
    },
    {
      id: "64b048ee3d085c0fef560bc2",
      name: "প্রতিদান",
    },
    {
      id: "663f4a2c27a71ab8f15f8864",
      name: "মহুয়া",
    },
    {
      id: "663f4a3427a71ab8f15fb04d",
      name: "আত্মচরিত",
    },
    {
      id: "663f4a3f27a71ab8f15fd51d",
      name: "বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন",
    },
    {
      id: "663f4a4627a71ab8f15fd898",
      name: "কারবালা-প্রান্তর",
    },
    {
      id: "663f4a4d27a71ab8f15fe751",
      name: "বর্ষা",
    },
    {
      id: "663f4a5527a71ab8f15fe87f",
      name: "গৃহ",
    },
    {
      id: "663f4a5a27a71ab8f15fea6b",
      name: "শিক্ষাচিন্তা",
    },
    {
      id: "663f4a6027a71ab8f15feb48",
      name: "আহ্বান",
    },
    {
      id: "663f4a6727a71ab8f15ff883",
      name: "তাজমহল",
    },
    {
      id: "663f4a6e27a71ab8f1601bc8",
      name: "ভুলের মূল্য",
    },
    {
      id: "663f4a7627a71ab8f1601e81",
      name: "জীবন ও বৃক্ষ",
    },
    {
      id: "663f4a7d27a71ab8f1602003",
      name: "গন্তব্য কাবুল",
    },
    {
      id: "663f4a9327a71ab8f1603353",
      name: "সৌদামিনী মালো",
    },
    {
      id: "663f4a9a27a71ab8f1604aa4",
      name: "কলিমদ্দি দফাদার",
    },
    {
      id: "663f4aa327a71ab8f1604bb2",
      name: "চেতনার অ্যালবাম",
    },
    {
      id: "663f4aaa27a71ab8f1605672",
      name: "একটি তুলসী গাছের কাহিনি",
    },
    {
      id: "663f4ab027a71ab8f160692f",
      name: "মানুষ",
    },
    {
      id: "663f4ab627a71ab8f1607053",
      name: "মৌসুম",
    },
    {
      id: "663f4abc27a71ab8f1607e8a",
      name: "গহন কোন বনের ধারে",
    },
    {
      id: "663f4ac227a71ab8f160d820",
      name: "কপিলদাস মুর্মুর শেষ কাজ",
    },
    {
      id: "663f4ac727a71ab8f160d9f6",
      name: "জাদুঘরে কেন যাব",
    },
    {
      id: "663f4acd27a71ab8f160e589",
      name: "মহাজাগতিক কিউরেটর",
    },
    {
      id: "663f4b3727a71ab8f161bb75",
      name: "নেকলেস",
    },
    {
      id: "663f4b4327a71ab8f161bf3f",
      name: "ঋতু-বর্ণনা",
    },
    {
      id: "663f4b4d27a71ab8f161c212",
      name: "ফুল্লরার বারোমাস্যা",
    },
    {
      id: "663f4b5527a71ab8f161c8e1",
      name: "স্বদেশ",
    },
    {
      id: "663f4b5e27a71ab8f161c986",
      name: "বিভীষণের প্রতি মেঘনাদ",
    },
    {
      id: "663f4b6527a71ab8f161caeb",
      name: "মানব-বন্দনা",
    },
    {
      id: "663f4b6b27a71ab8f161cb4f",
      name: "সুখ",
    },
    {
      id: "663f4b7227a71ab8f161f656",
      name: "ঐকতান",
    },
    {
      id: "663f4b7927a71ab8f161f746",
      name: "নবান্ন",
    },
    {
      id: "663f4b7f27a71ab8f1621f97",
      name: "সাম্যবাদী",
    },
    {
      id: "663f4b8627a71ab8f1622286",
      name: "প্রতিদান",
    },
    {
      id: "663f4b8b27a71ab8f16224bd",
      name: "সুচেতনা",
    },
    {
      id: "663f4b9327a71ab8f1622d71",
      name: "সেই অস্ত্র",
    },
    {
      id: "663f4b9a27a71ab8f1622fca",
      name: "পদ্মা",
    },
    {
      id: "663f4ba027a71ab8f1624a17",
      name: "আলো চাই",
    },
    {
      id: "663f4ba827a71ab8f1624ad3",
      name: "আগে কী সুন্দর দিন কাটাইতাম",
    },
    {
      id: "663f4bb227a71ab8f16252c0",
      name: "তোমার আপন পতাকা",
    },
    {
      id: "663f4bbc27a71ab8f162765a",
      name: "হাড়",
    },
    {
      id: "663f4bc427a71ab8f1627a5a",
      name: "নূরলদীনের কথা মনে পড়ে যায়",
    },
    {
      id: "663f4bce27a71ab8f1627dc8",
      name: "ছবি",
    },
    {
      id: "663f4bd927a71ab8f162a475",
      name: "ভূমিহীন কৃষিজীবী ইচ্ছে তার",
    },
    {
      id: "663f4be027a71ab8f162a50c",
      name: "প্রত্যাবর্তনের লজ্জা",
    },
    {
      id: "663f4be727a71ab8f162a56a",
      name: "মানুষ সকল সত্য",
    },
    {
      id: "663f4bef27a71ab8f162b406",
      name: "ব্ল‍্যাক আউটের পূর্ণিমায়",
    },
    {
      id: "663f4bf727a71ab8f162bd6b",
      name: "শান্তির গান",
    },
    {
      id: "663f4f5f27a71ab8f16b9287",
      name: "এই পৃথিবীতে এক স্থান আছে",
    },
    {
      id: "663f5c6a27a71ab8f17e3005",
      name: "রক্তে আমার অনাদি অস্থি",
    },
    {
      id: "663f5d3727a71ab8f17fda38",
      name: "চাষার দুক্ষু",
    },
    {
      id: "664039de83c064108408c14e",
      name: "বিড়াল",
    },
    {
      id: "6640671583c0641084667eda",
      name: "লোক-লোকান্তর",
    },
  ]);
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubLoading(true);
        const subjectResponse = await axios.get(
          `${secondaryAPI}/api/subjects`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (subjectResponse.data.length > 0) {
          setSubjects(subjectResponse.data);
        }
      } catch (err) {
        handleError(err as AxiosError, fetchSubjects);
      } finally {
        setSubLoading(false);
      }
    };

    fetchSubjects();
  }, [user]);

  async function getChapters(subjectId: string) {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJpYXQiOjE3NDk5MjA3NzUsImV4cCI6MTc1MDAwNzE3NX0.a86bvWFpBlN-teFR6c4VC_ZOVy-j6rwJed9bJDnmVIc";
    try {
      setTopicLoading(true);
      const response = await axios.get(
        `${secondaryAPI}/api/subjects/${subjectId}/chapters`,
        {
          headers: {
            // Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTopicLoading(false);
      if (response.data.chapters.length > 0) {
        setChapters(response.data.chapters as Chapter[]);
      }
      return response.data.chapters as Chapter[];
    } catch (error) {
      setTopicLoading(false);
      handleError(error as AxiosError, () => getChapters(subjectId));
      return [] as Chapter[];
    }
  }

  return { subjects, getChapters, topicLoading, subLoading, chapters };
};
