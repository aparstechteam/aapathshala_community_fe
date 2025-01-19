import { Teacher } from '@/@types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface TeachersProps {
    teachers: Teacher[]
}

export const Teachers = ({ teachers }: TeachersProps) => {
    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="flex flex-col gap-3">
                {teachers.map((teacher) => (
                    <div 
                        key={teacher.id} 
                        className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
                    >
                        <Avatar className="h-10 w-10 border border-gray-800">
                            <AvatarImage src={teacher.profilePic} alt={teacher.name} />
                            <AvatarFallback className="bg-gray-800 text-gray-400">
                                {teacher.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-200">{teacher.name}</span>
                            <span className="text-xs text-gray-400">{teacher.email}</span>
                        </div>
                    </div>
                ))}
            </div>
            <ScrollBar orientation="vertical" className="bg-gray-800/20" />
        </ScrollArea>
    )
}