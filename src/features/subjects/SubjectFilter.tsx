import { Subject } from "@/@types"
import { ScrollArea } from "@/components"
import { Card, CardContent } from "@/components/ui/card"
import { Book, GraduationCap, Calculator, Atom, Brain, SettingsIcon as Functions } from 'lucide-react'

interface Subjects {
    icon: React.ReactNode
    name: string
    count: number
    color: string
}
type Props = {
    allSubjects: Subject[]
    onClick: (subject: string) => void
    selectedSubject: string | undefined
}

export function SubjectFilter(props: Props) {

    const { allSubjects, onClick, selectedSubject } = props

    const subjects: Subjects[] = [
        { icon: <Book className="h-5 w-5" />, name: "সকল বিষয়", count: 415, color: "text-emerald-500" },
        { icon: <Atom className="h-5 w-5" />, name: "Physics", count: 415, color: "text-green-500" },
        { icon: <Calculator className="h-5 w-5" />, name: "Higher Math", count: 415, color: "text-rose-500" },
        { icon: <GraduationCap className="h-5 w-5" />, name: "বাংলা", count: 415, color: "text-orange-500" },
        { icon: <Brain className="h-5 w-5" />, name: "Biology", count: 415, color: "text-purple-500" },
        { icon: <Book className="h-5 w-5" />, name: "ইংরেজি", count: 415, color: "text-green-500" },
        { icon: <Atom className="h-5 w-5" />, name: "জীববিজ্ঞান", count: 415, color: "text-green-500" },
        { icon: <Calculator className="h-5 w-5" />, name: "উচ্চতর গণিত", count: 415, color: "text-rose-500" },
        { icon: <Functions className="h-5 w-5" />, name: "সাধারণ গণিত", count: 415, color: "text-green-500" },
        { icon: <GraduationCap className="h-5 w-5" />, name: "বাংলা", count: 415, color: "text-orange-500" },
        { icon: <Book className="h-5 w-5" />, name: "ইংরেজি", count: 415, color: "text-green-500" },
        { icon: <Brain className="h-5 w-5" />, name: "মনোবিজ্ঞান", count: 415, color: "text-purple-500" },
        { icon: <Functions className="h-5 w-5" />, name: "সাধারণ গণিত", count: 415, color: "text-green-500" },

    ]

    return (
        <Card className="w-full max-w-sm !ring-0">
            <CardContent className="px-0 py-4 !ring-0">
                <ScrollArea className="h-[380px]">
                    <div className="space-y-2 px-4">
                        <div className={`w-full flex  relative items-center justify-between hover:bg-green-50 dark:hover:bg-gray-700/30 p-2 rounded-lg text-sm
                          ${selectedSubject === 'all'
                                ? "bg-gray-100 dark:bg-gray-500/30"
                                : "bg-white dark:bg-gray-800/30"
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`${subjects[0]?.color}`}>{subjects[0]?.icon}</div>
                                <span className="text-sm font-medium pt-1">সকল বিষয়</span>
                            </div>
                            <span className="text-sm text-muted-foreground pt-1">{subjects[0]?.count}</span>
                            <button onClick={() => onClick('all')} className="absolute right-0 w-full h-full"></button>
                        </div>
                        {allSubjects?.map((subject, index) => (
                            <div
                                key={index}
                                className={`w-full flex relative items-center justify-between hover:bg-green-50 dark:hover:bg-gray-700/30 p-2 rounded-lg text-sm
                                ${selectedSubject === subject?.id
                                        ? "bg-gray-100 dark:bg-gray-500/30"
                                        : "bg-white dark:bg-gray-800/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`${subjects[index + 1]?.color}`}>{subjects[index + 1]?.icon}</div>
                                    <span className="text-sm font-medium pt-1">{subject.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground pt-1">{subject.count}</span>
                                <button onClick={() => onClick(subject.id)} className="absolute right-0 w-full h-full"></button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}