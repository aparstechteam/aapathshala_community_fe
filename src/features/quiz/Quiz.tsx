import { useEffect, useState } from 'react'
import { Check, Lightbulb, Loader2, X } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogTitle, DialogDescription, DialogOverlay, ftime, ScrollArea, DialogHeader, DialogFooter, DialogClose, source } from '@/components'
import axios, { AxiosError } from 'axios'
import { QuizQuestion, QuizResult } from '@/@types'
import Confetti from 'react-confetti'
import { useToast } from '@/hooks/use-toast'
import { secondaryAPI } from '@/configs'
import { handleError } from '@/hooks/error-handle'
import { PrevQuiz } from './PrevQuiz'
import dynamic from 'next/dynamic'
// import Router from 'next/router'
const AppMath = dynamic(() => import('@/components/contexts/MathJAX'), { ssr: false })


export function QuizComponent(props: { post_id: string }) {

    const { post_id } = props
    const { toast } = useToast()

    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
    const [score, setScore] = useState<number>(0);
    const [answered, setAnswered] = useState<{ qid: string, optn: boolean }[]>([]);
    const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [endExam, setEndExam] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
    const [key, setKey] = useState<number>(0);
    const [startExam, setStartExam] = useState<boolean>(false);
    const [time, setTime] = useState<number>(-1);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
    const [loading, setLoading] = useState(false)

    const handleOptionSelect = (questionIndex: number, optionIndex: string, isCorrect: boolean) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
        setAnswered(prev => {
            const existingAnswerIndex = answered.findIndex(a => a.qid === quizData[questionIndex].id.toString());
            if (existingAnswerIndex !== -1) {
                const updatedAnswers = [...prev];
                updatedAnswers[existingAnswerIndex].optn = isCorrect;
                return updatedAnswers;
            } else {
                return [...prev, { qid: quizData[questionIndex].id.toString(), optn: isCorrect }];
            }
        });

        // Update score based on the correctness of the selected option
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        } else {
            setScore(prevScore => prevScore + 0);
        }
    };

    useEffect(() => {
        async function getQuiz() {
            setError('')
            try {
                setLoadingQuiz(true)
                const response = await axios.get(`${secondaryAPI}/api/post/${post_id}/quiz`, {
                    // withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    }
                })
                setQuizData(response?.data?.questions || [])
                if (!response?.data?.questions) {
                    setError("Quiz is not yet availavle.")
                }
                setLoadingQuiz(false)
            } catch (error) {
                setLoadingQuiz(false)
                handleError(error as AxiosError, () => getQuiz())
            }
        }
        getQuiz()
    }, [post_id, startExam])

    useEffect(() => {
        const countdown = setInterval(() => {
            if (startExam) {
                setTime(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(countdown);
                        setEndExam(true);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }
        }, 1000);

        return () => clearInterval(countdown);
    }, [startExam]);

    useEffect(() => {
        async function getQuiz() {
            try {
                setLoading(true)
                if (post_id) {
                    const res = await axios.get<QuizResult>(`${secondaryAPI}/api/post/${post_id}/quiz/results`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    })
                    setQuizResult(res.data)
                }
                setLoading(false)
            } catch (err) {
                handleError(err as AxiosError, () => getQuiz())
            }
        }
        getQuiz()
    }, [post_id, startExam])

    const handleSubmitExam = async () => {
        try {
            await axios.post(`${secondaryAPI}/api/post/${post_id}/quiz/submit`, {
                "score": score,
                "duration": ftime(time)
            }, {
                // withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }
            })
            toast({
                title: "Success",
                description: "Quiz submitted successfully",
            })
            setTime(0)
            setShowResult(true)
        } catch (error) {
            setStartExam(false)
            handleError(error as AxiosError, () => handleSubmitExam())
        }
    }

    const endQuizDialog = (
        <Dialog open={endExam} onOpenChange={() => {
            setEndExam(false)
            setKey(key + 1)
        }}>
            <DialogOverlay className='!bg-gradientje bg-opacity-20 z-[99] dark:!bg-gray-800/80'>

            </DialogOverlay>
            <DialogContent className='p-4 z-[100] w-full max-w-xl bg-white dark:bg-gray-900'>
                <DialogHeader>
                    <DialogTitle className="sr-only">Quiz Result</DialogTitle>
                    <DialogDescription className="sr-only">Your quiz performance and score</DialogDescription>
                </DialogHeader>
                <div className='dark:text-white text-gray-900 p-8 flex flex-col items-center gap-6'>
                    <div className='text-4xl'>🏆</div>
                    <h2 className='text-2xl font-bold text-center bg-gradientje bg-clip-text text-transparent'>
                        Congratulations!
                    </h2>
                    <p className='dark:text-gray-200 text-gray-900 text-lg font-semibold text-center'>
                        {score / quizData.length < 0.3 && (
                            "Keep practicing! Every attempt brings you closer to mastery."
                        )}
                        {score / quizData.length >= 0.3 && score / quizData.length < 0.5 && (
                            "Good effort! You're making progress. Keep pushing forward!"
                        )}
                        {score / quizData.length >= 0.5 && (
                            "Outstanding performance! You've demonstrated excellent understanding!"
                        )}
                    </p>
                    <div className='flex items-center gap-3 bg-gradientje px-6 py-2 rounded-full'>
                        <span className='text-xl'>🌟</span>
                        <span className='font-semibold text-white text-lg pt-1'>Your Score: {score}</span>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type='button' className='w-full !rounded-full !bg-gradient-to-r from-green-400 via-green-800 to-green-500 text-white pb-1'
                            onClick={() => {
                                setEndExam(false)
                            }}>
                            দেখুন বিস্তারিত
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    const quizQuestion = (
        <Dialog open={startExam} onOpenChange={() => {
            setStartExam(false)
        }}>
            <DialogOverlay className='!bg-white/80 dark:!bg-gray-800/80'></DialogOverlay>
            <DialogContent className='bg-white w-full max-w-2xl dark:bg-gray-900'>
                <DialogHeader>
                    <DialogTitle className="pt-4 px-4 text-center text-black dark:text-white">Quiz Question</DialogTitle>
                </DialogHeader>
                <div className="w-full mx-auto grid gap-4">

                    <div className='flex px-4 items-center justify-between text-base font-medium text-black dark:text-white'>
                        <h2 className='pt-3 pb-2 px-4 rounded-lg ring-1 ring-ash bg-white dark:bg-gray-900'>
                            {time === 0 ? (
                                `Your Score: ${score}`
                            ) : (
                                `Total Score: ${quizData.length}`
                            )}

                        </h2>
                        <h2 className='pt-3 pb-2 px-4 rounded-lg ring-1 ring-ash bg-white dark:bg-gray-900'>Time Remaining: {ftime(time)}</h2>
                    </div>
                    <ScrollArea className='h-[calc(100vh-10rem)] p-2 lg:p-4'>
                        {error && <div className='text-center text-white bg-rose-900/30 p-4 rounded-lg'>{error}</div>}
                        <div className='space-y-2'>
                            {quizData?.map((mcq, index) => {
                                const x = [
                                    `${mcq?.data?.subject}`,
                                    `${mcq?.data?.topic}`,
                                    `${mcq?.data?.board}`,
                                    `${mcq?.data?.year}`,
                                ]
                                return (
                                    <div key={index} className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-md rounded-lg p-2 lg:p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="text-sm flex font-semibold">
                                                {index + 1}.{' '}
                                                <AppMath formula={mcq.question || ''} key={key} />
                                            </div>
                                        </div>
                                        {mcq?.data && (
                                            <p className="text-xs text-end text-gray-500 dark:text-gray-400">
                                                {source(x)}
                                            </p>
                                        )}
                                        <div className="space-y-2">
                                            {mcq.options.map((option, optionIndex) => {
                                                const letter = String.fromCharCode(97 + optionIndex)
                                                const isSelected = selectedAnswers[index] === letter
                                                const isCorrect = option.is_correct;
                                                let bgColor = 'bg-green-500 bg-opacity-10';
                                                if (isSelected && showResult) {
                                                    bgColor = isCorrect ? 'dark:bg-green-500/40 bg-green-200' : 'dark:bg-red-500/40 bg-red-200';
                                                } else if (isSelected && !showResult) {
                                                    bgColor = 'bg-green-500/30 ring-green-500 ring-2';
                                                } else if (!isSelected && showResult && isCorrect) {
                                                    bgColor = 'bg-green-600/40';
                                                }
                                                if (isSelected && !showResult) {
                                                    bgColor = 'bg-green-500/30 ring-green-500 ring-2'
                                                }
                                                if (!isSelected && showResult && option.is_correct) {
                                                    bgColor = 'bg-green-600/40'
                                                }

                                                return (
                                                    <button type='button' disabled={showResult}
                                                        key={optionIndex}
                                                        className={`w-full text-left p-2 rounded ${bgColor} 'hover:!bg-green-500 dark:hover:!bg-green-500/20 !duration-300 flex justify-between items-center`}
                                                        onClick={() => {
                                                            setKey(key + 1);
                                                            handleOptionSelect(index, letter, isCorrect);
                                                        }}
                                                    >
                                                        <div className='flex gap-2 items-center'>
                                                            <span>{letter}.</span>
                                                            <AppMath formula={option?.option || ''} key={key} />
                                                        </div>
                                                        {showResult && isSelected && (
                                                            isCorrect ? <Check className="w-5 h-5 text-[green]" /> : <X className="w-5 h-5 text-[red]" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        {showResult && mcq?.explanation && (
                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                                                <h3 className="font-semibold">Explanation:</h3>
                                                <AppMath formula={mcq.explanation || ''} key={key} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        {time !== 0 && quizData.length > 0 && (

                            <Button type='button' className='w-full mt-2 !rounded-full !bg-gradient-to-r from-green-800 to-green-500 text-white pb-1'
                                onClick={() => {
                                    handleSubmitExam()
                                    setEndExam(true)
                                    setKey(key + Math.random())
                                }}>
                                সাবমিট করুন
                            </Button>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )

    return (
        <>
            {endExam && (
                <div className='fixed inset-0 z-[9999]'>
                    <Confetti />
                </div>
            )}
            {endQuizDialog}
            {quizQuestion}
            {loadingQuiz && quizData.length === 0 ? (
                <div className='flex items-center justify-center py-10'>
                    <Loader2 className='w-10 h-10 animate-spin' />
                </div>
            ) : (quizData.length > 0 ? (
                <div className='grid items-center justify-center gap-5 p-5 rounded-xl bg-white dark:bg-gray-900'>
                    <div className='space-y-4'>
                        <h2 className='flex items-center justify-between font-semibold'>
                            <span>Total Marks: {quizData.length}</span>
                            <span>Total Time: {ftime(quizData.length * 60)} Minuites</span>
                        </h2>
                        <h2 className='text-center text-base font-normal'>এই কুইজে তোনার কাছে {quizData.length} মিনিট সময় থাকবে। প্রতিটি সঠিক উত্তরের জন্য +1 স্কোর পাবে।
                            কুইজ শুরু করার পর সময় গননা শুরু হবে। সময় শেষ হলে কুইজ অটমেটিক সাবমিট হয়ে যাবে।
                        </h2>
                    </div>
                    <Button type='button' className='w-full !rounded-full !bg-gradient-to-r from-green-400 via-green-800 to-green-500 text-white pb-1'
                        onClick={() => {
                            setTime(quizData.length * 60);
                            setStartExam(true)
                        }}>
                        কুইজ শুরু করো
                    </Button>
                </div>
            ) : (
                <div className='bg-white shadow rounded-lg dark:bg-green-900/30 p-4'>
                    <h2 className='text-xl font-semibold py-3 flex items-center gap-2'>
                        <span className='p-2 rounded-full bg-gradient-to-r text-green-600 from-teal-600/20 to-green-300/20'><Lightbulb /></span>
                        <span className='bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent'>কুইজ</span>
                    </h2>
                    <p className='text-center text-gray-500 dark:text-gray-100'>Quiz is not available for this post.</p>
                </div>
            ))}
            <PrevQuiz quizResult={quizResult} loading={loading} />
        </>
    )
}