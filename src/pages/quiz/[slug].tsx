import { Button, Layout } from "@/components";
import { secondaryAPI } from "@/configs";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import AppMath from "@/components/contexts/MathJAX";
import { cn } from "@/lib/utils";
import { handleError } from "@/hooks/error-handle";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Option = {
  id: string;
  option: string;
};

type QuestionData = {
  id: string;
  question: string;
  options: Option[];
};

const ExamPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchExam() {
      try {
        if (!slug) return;
        const res = await axios.get(
          `${secondaryAPI}/api/exam/${slug}/questions`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setQuestions(res.data);
      } catch (err) {
        handleError(err as AxiosError, () => fetchExam());
      }
    }
    fetchExam();
  }, [slug]);

  const options = ["ক", "খ", "গ", "ঘ"];

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex(
        (answer) => answer.q === questionId
      );
      if (existingAnswerIndex > -1) {
        // Update the existing answer
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex].a = optionId;
        return updatedAnswers;
      }
      // Add new answer if it doesn't exist
      return [...prev, { q: questionId, a: optionId }];
    });
  };

  async function submitAnswer() {
    try {
      setLoading(true);
      const response = await axios.post(
        `${secondaryAPI}/api/exam/${slug}/submit`,
        answers,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      toast({
        title: `Success ${response.status}`,
        description: response.data.message,
        variant: "success",
      });
      router.push(`/quiz/result/${slug}`);
      setLoading(false);
    } catch (err) {
      handleError(err as AxiosError, () => submitAnswer());
      setLoading(false);
      toast({
        title: `Error ${err}`,
        description: "Something went wrong, try Again",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <Head>
        <title>Daily Exam</title>
      </Head>
      <Layout>
        <div className="w-full min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-5xl mx-auto h-full p-4 ring-1 ring-ash rounded-xl bg-white dark:bg-[#202127]">
            <h2 className="sm:text-2xl w-full text-2xl py-4 text-center font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
                আজকের কুইজ
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
                      <button
                        type="button"
                        onClick={() => handleAnswer(question?.id, option?.id)}
                        key={index}
                        className={cn(
                          "py-2 px-4 duration-300 transition-all rounded-lg ring-1 ring-ash text-start flex items-center gap-2",
                          answers.some(
                            (x) => x.q === question?.id && x.a === option?.id
                          ) &&
                            "bg-gradient-to-r from-rose-500 to-rose-600 text-white"
                        )}
                      >
                        <span className="text-sm">{options[index]}.</span>
                        <AppMath
                          className="!w-full"
                          formula={option?.option || ""}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center py-4">
              <Button
                className="w-full max-w-sm bg-gradient-to-r from-rose-500 to-rose-600 text-white"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  submitAnswer();
                }}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ExamPage;
