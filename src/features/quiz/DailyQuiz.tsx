import { Exams } from "@/@types";
import { Button, fromNow } from "@/components";
import Router from "next/router";
import React from "react";

type Props = {
  exams: Exams[];
};

export const DailyQuiz = (props: Props) => {
  const { exams } = props;
  return (
    <div className="h-[calc(100vh-80px)] p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto w-full items-center justify-center">
        <h2 className="sm:text-3xl w-full text-2xl py-4 sm:col-span-2 lg:col-span-3 text-center font-bold">
          <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
            আজকের কুইজ
          </span>
        </h2>
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="ring-1 sm:col-span-1 col-span-2 duration-300 hover:scale-95 hover:ring-rose-600/20 hover:shadow-md hover:shadow-rose-300 text-center grid gap-2 bg-white rounded-xl ring-ash p-4"
          >
            <div className="py-2">
              <h1 className="text-xl bg-gradient-to-r from-rose-600 via-purple-400 to-rose-500 bg-clip-text text-transparent font-bold text-center">
                {exam.title}
              </h1>
              <h1 className="text-center text-light">{exam.description}</h1>
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1>{exam.duration} মিনিট</h1>
              <span>|</span>
              <h1>{exam.total_marks} পয়েন্ট</h1>
            </div>
            <h2 className="font-semibold">
              শুরুর সময়: {fromNow(new Date(exam?.start_time) as Date)}
            </h2>
            <h2 className="font-semibold">
              শেষ সময়: {fromNow(new Date(exam?.end_time) as Date)}
            </h2>
            <Button
              type="button"
              onClick={() => {
                Router.push(`/quiz/${exam.id}`);
              }}
              className="w-full ring-1 hover:!shadow-rose-300 hover:shadow-md !duration-300 !transition-shadow ring-ash bg-gradient-to-r from-rose-600 text-white to-rose-500"
            >
              অংশগ্রহণ করো
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
