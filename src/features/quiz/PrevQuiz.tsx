import { QuizResult } from '@/@types'

type Props = {
    quizResult: QuizResult | null
    loading: boolean
}

export const PrevQuiz = (props: Props) => {

    const { quizResult, loading } = props

    return !loading && quizResult?.results && quizResult?.results.length > 0 ? (
        <div className='bg-white rounded-lg dark:bg-green-900/30 p-4 mt-4 ring-1 dark:divide-ash/20 dark:ring-0 ring-ash'>
            <h2 className='text-center text-lg font-semibold'>পূর্ববর্তী কুইজের ফলাফল</h2>
            <h2 className='flex px-2 items-center justify-between'>
                <span>অংশগ্রহণকারী কুইজের সংখ্যা: {quizResult?.results.length}</span>
                <span>গড় স্কোর: {quizResult?.averageScore}</span>
            </h2>
            <div className='divide-y divide-ash dark:divide-ash/20 pt-4'>
                {quizResult?.results.map((x) => (
                    <div key={x.id} className='p-2'>
                        <div>
                            <p className='text-sm text-center'><strong>তারিখ:</strong> {new Date(x.created_at).toLocaleDateString()}</p>
                            <p className='flex items-center justify-between'>
                                <span className='text-sm'><strong>সময়:</strong> {x.duration} মিনিট</span>
                                <span className='text-sm'><strong>স্কোর:</strong> {x.score}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : null
}