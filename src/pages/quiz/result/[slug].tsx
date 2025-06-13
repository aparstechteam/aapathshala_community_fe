import { Layout } from "@/components";
import { secondaryAPI } from "@/configs";
import { handleError } from "@/hooks/error-handle";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import AppMath from "@/components/contexts/MathJAX";
import { Check, X } from "lucide-react";

type Option = {
  id: string;
  option: string;
  is_correct: boolean;
};

type QuestionData = {
  id: string;
  question: string;
  options: Option[];
};

const QuizResult = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  useEffect(() => {
    async function fetchResult() {
      try {
        if (!slug) return;
        const response = await axios.get(
          `${secondaryAPI}/api/exam/${slug}/solution`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setAnswers(response.data.submission.answers);
        setQuestions(response.data.questions);
      } catch (err) {
        handleError(err as AxiosError, () => fetchResult());
      }
    }
    fetchResult();
  }, [slug]);

  const options = ["ক", "খ", "গ", "ঘ"];

  return (
    <>
      <Head>
        <title>Quiz Result</title>
      </Head>
      <Layout>
        <div className="w-full min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-5xl mx-auto h-full p-4 ring-1 ring-ash rounded-xl bg-white dark:bg-[#202127]">
            <h2 className="sm:text-2xl w-full text-2xl py-4 text-center font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
                কুইজের ফলাফল
              </span>
            </h2>

            <div className="grid gap-4">
              {questions.map((question, index) => (
                <div key={index} className="p-2">
                  <div className="mb-2 flex items-start gap-2">
                    <span className="text-sm pt-1">{index + 1}.</span>
                    <AppMath
                      className="!w-full"
                      formula={question?.question || ""}
                    />
                  </div>

                  <div className="flex flex-col gap-2 px-2">
                    {question?.options?.map((option, index) => (
                      <div
                        key={index}
                        className={cn(
                          "py-2 px-4 duration-300 transition-all rounded-lg ring-1 ring-ash text-start flex items-center gap-2",
                          option.is_correct && "bg-rose-500/30",
                          answers.some(
                            (x) => x.q === question?.id && x.a === option?.id
                          ) &&
                            !option.is_correct &&
                            "bg-red-500/30"
                        )}
                      >
                        <span className="text-sm">{options[index]}.</span>
                        <AppMath
                          className="!w-full"
                          formula={option?.option || ""}
                        />
                        {answers.some(
                          (x) => x.q === question?.id && x.a === option?.id
                        ) &&
                          !option.is_correct && (
                            <span className="text-xs text-end text-red-600">
                              <X className="w-4 h-4" />
                            </span>
                          )}
                        {answers.some(
                          (x) => x.q === question?.id && x.a === option?.id
                        ) &&
                          option.is_correct && (
                            <span className="text-xs text-end text-rose-600">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default QuizResult;
