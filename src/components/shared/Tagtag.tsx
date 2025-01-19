import React from 'react'
import { Admin, Captain, ClassTeacher, ClubAdvisor, GeneralSecretary, GroupAdmin, Moderator, President, Teacher, ViceCaptain, VicePresident } from './icons'

type Props = {
    tags: string[]
}

export const Tagtag = (props: Props) => {
    const { tags = [] } = props
    return (
        <div className='flex items-center gap-2'>
            {tags?.map((t) => {
                return (
                    <span key={t}>
                        {t === "TEACHER" && <Teacher />}
                        {t === "CLASS_TEACHER" && <ClassTeacher />}
                        {t === "ADMIN" && <Admin />}
                        {t === "MODERATOR" && <Moderator />}
                        {t === "PRESIDENT" && <President />}
                        {t === "GROUP_ADMIN" && <GroupAdmin />}
                        {t === "VICE_PRESIDENT" && <VicePresident />}
                        {t === "GENERAL_SECRETARY" && <GeneralSecretary />}
                        {t === "CAPTAIN" && <Captain />}
                        {t === "VICE_CAPTAIN" && <ViceCaptain />}
                        {t === "CLUB_ADVISOR" && <ClubAdvisor />}
                    </span>
                )
            })}
        </div>
    )
}