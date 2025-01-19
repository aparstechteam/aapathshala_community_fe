import { PollOption, Post } from '@/@types'
import { RadioGroup } from '@/components'
import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
    post: Post
    polls: PollOption[]
    setSelectedAnswer: (answer: string) => void
    selectedAnswer: string
    handleVote: (option: PollOption) => void
    totalVotes: number
}

export const PollComponent = (props: Props) => {
    const { post, polls, setSelectedAnswer, selectedAnswer, handleVote, totalVotes } = props

    const _width = (vote_count: number) => {
        if (!vote_count) return '0%'
        return `${((vote_count / totalVotes) * 100).toFixed(1)}%`
    }

    return (
        <>
            {post?.pollType === 'survey' && (
                <div className='px-4 py-6 rounded-xl ring-1 ring-ash/50'>
                    <div className="px-4 md:px-0 !w-full grid gap-2">
                        <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer} className="space-y-1">
                            {polls?.map((option, index) => (
                                <div key={index}>

                                    <div className="flex items-center gap-1 w-full mb-2">
                                        {/* <RadioGroupItem value={option.name} checked={option.has_voted} /> */}
                                        <button className="w-full flex items-center hover:!text-life justify-between" type='button' onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setSelectedAnswer(option.name)
                                            handleVote(option)
                                        }}>
                                            <span className={cn("ml-2 !text-base font-medium",
                                                option.has_voted && "text-olive",
                                                !option.has_voted && "text-light",
                                            )}>
                                                {option.name}
                                            </span>
                                            <span className="text-base text-light">
                                                {`${_width(option?.vote_count)} (${option.vote_count})`}
                                            </span>
                                        </button>
                                    </div>


                                    <div className="flex rounded-full relative items-center bg-ash/50 gap-2 group">

                                        <div className={cn("absolute z-[1] duration-300 overflow-hidden inset-0 rounded-full",
                                            option.vote_count > 0 ? "w-full max-w-[100%]" : "w-0"
                                        )}
                                            style={{
                                                width: `${(option?.vote_count / totalVotes) * 100}%`,
                                            }}
                                        >
                                            <div
                                                className={cn("rounded-full relative z-[2] h-full w-full duration-700 transition-all",
                                                    option.has_voted && option.vote_count > 0 && "bg-gradient-to-r from-olive to-life animate-progress",
                                                    !option.has_voted && option.vote_count > 0 && "bg-light animate-progress",
                                                )}
                                            />
                                        </div>

                                        <div className={cn("flex-1 z-10 flex items-center justify-between duration-300 rounded-full h-1",
                                            // selectedAnswer === option.name && "bg-life/20 text-life",
                                            // selectedAnswer !== option.name && "bg-ash/50"
                                        )}>

                                        </div>
                                        {/* <button type='button' className='absolute z-20 right-0 top-0 w-full h-full' onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setSelectedAnswer(option.name)
                                            handleVote(option)
                                        }} /> */}
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
            )}

            {post?.pollType === 'question' && (
                <div>
                    <div className="px-4 md:px-0 !w-full grid gap-2">
                        <RadioGroup onValueChange={setSelectedAnswer} value={selectedAnswer} className={cn("space-y-2")}>
                            {polls?.map((option, index) => (
                                <div key={index} className="grid relative items-center gap-2 group">
                                    <div className="flex items-center space-x-1 w-full">
                                        {/* <RadioGroupItem checked={option.has_voted} value={option.name} className={cn(
                                            option.has_voted
                                                ? option.is_correct
                                                    ? "!text-olive"
                                                    : "!text-hot"
                                                : ""
                                        )} /> */}

                                        <span>
                                            {option.has_voted ? (

                                                option.is_correct ?
                                                    <svg className='h-4 w-4' viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5ZM8.62028 4.66398L5.74953 7.54242L4.35355 6.14645C4.15829 5.95118 3.84171 5.95118 3.64645 6.14645C3.45118 6.34171 3.45118 6.65829 3.64645 6.85355L5.39645 8.60355C5.59189 8.799 5.90884 8.79879 6.10403 8.60308L9.32833 5.37014C9.52333 5.17462 9.52291 4.85804 9.32738 4.66304C9.13186 4.46803 8.81528 4.46846 8.62028 4.66398Z" fill="#008643" />
                                                    </svg>
                                                    :
                                                    <svg className='h-4 w-4' viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M6.5 0.324951C9.81371 0.324951 12.5 3.01124 12.5 6.32495C12.5 9.63866 9.81371 12.325 6.5 12.325C3.18629 12.325 0.5 9.63866 0.5 6.32495C0.5 3.01124 3.18629 0.324951 6.5 0.324951ZM5.03431 4.16354C4.83944 4.02855 4.57001 4.04783 4.39645 4.2214L4.33859 4.29065C4.2036 4.48551 4.22288 4.75494 4.39645 4.9285L5.793 6.32495L4.39645 7.7214L4.33859 7.79065C4.2036 7.98551 4.22288 8.25494 4.39645 8.4285L4.46569 8.48636C4.66056 8.62136 4.92999 8.60207 5.10355 8.4285L6.5 7.03195L7.89645 8.4285L7.96569 8.48636C8.16056 8.62136 8.42999 8.60207 8.60355 8.4285L8.66141 8.35926C8.7964 8.16439 8.77712 7.89496 8.60355 7.7214L7.207 6.32495L8.60355 4.9285L8.66141 4.85926C8.7964 4.66439 8.77712 4.39496 8.60355 4.2214L8.53431 4.16354C8.33944 4.02855 8.07001 4.04783 7.89645 4.2214L6.5 5.61795L5.10355 4.2214L5.03431 4.16354Z" fill="#FC465D" />
                                                    </svg>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-ash/50 ring-1 ring-ash" />
                                            )}
                                        </span>

                                        <p className="ml-2 justify-between flex items-center w-full">
                                            <span className={cn(
                                                option.has_voted
                                                    ? option.is_correct
                                                        ? "!text-olive"
                                                        : "!text-hot"
                                                    : " hover:text-life"
                                            )}>
                                                {option.name}
                                            </span>
                                            <span>
                                                {option.vote_count} / {totalVotes}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex rounded-full relative items-center bg-ash/50 gap-2 group">

                                        <div className={cn("absolute z-[1] duration-300 overflow-hidden inset-0 rounded-full",
                                            option.vote_count > 0 ? "w-full max-w-[100%]" : "w-0"
                                        )} style={{
                                            width: _width(option?.vote_count),
                                        }}>
                                            <div
                                                className={cn("rounded-full relative z-[2] h-full w-full duration-700 animate-progress transition-all",
                                                    option.has_voted ?
                                                        option.is_correct ?
                                                            "bg-olive" :
                                                            "bg-hot" :
                                                        "bg-light",
                                                )}
                                            />
                                        </div>

                                        <div className={cn("flex-1 z-10 flex items-center justify-between duration-300 rounded-full h-1",
                                            // selectedAnswer === option.name && "bg-life/20 text-life",
                                            // selectedAnswer !== option.name && "bg-ash/50"
                                        )}>

                                        </div>
                                    </div>
                                    <button type='button' className='absolute right-0 top-0 w-full h-full' onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setSelectedAnswer(option.name)
                                        handleVote(option)
                                    }} />
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
            )}
        </>
    )
}