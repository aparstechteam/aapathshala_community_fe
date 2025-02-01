import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, filterIcon, Popover, PopoverContent, PopoverTrigger, useUser } from '@/components'
import React, { useEffect, useState } from 'react'
import { SubjectFilter } from '../subjects';
import { Subject } from '@/@types';
import { PopoverClose } from '@radix-ui/react-popover';

type Props = {
    subjects: Subject[]
    selectedSubject: string
    setSelectedSubject: (subject: string) => void
    setSort: (sort: string) => void
}

const sortby = ['Sort By Default', 'Sort By Latest']

export const SubjectFilters = (props: Props) => {

    const { user } = useUser();
    const { subjects, selectedSubject, setSelectedSubject, setSort } = props
    const [open, setOpen] = useState<boolean>(false);
    const [sortbySelected, setSortbySelected] = useState<string>(sortby[1])
    const [batchName, setBatchName] = useState<string>('')

    useEffect(() => {
        const batch = localStorage.getItem('hsc_batch')
        if (batch) {
            setBatchName(batch)
        }
    }, [user])

    const filterSubjects = (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="min-w-40 flex sm:justify-self-end z-[2] rounded-full dark:ring-elegant/20 bg-elegant/10 ring-1 ring-elegant/60 text-elegant relative p-1">
                <span className="text-sm px-4 w-full font-medium">{selectedSubject === "all" ? "সব বিষয়" : subjects.find(s => s.id === selectedSubject)?.name}</span>
            </DialogTrigger>
            <DialogContent className="w-full !rounded-xl max-w-sm bg-white p-5">
                <DialogHeader>
                    <DialogTitle className="text-black/80 pt-1">সাবজেক্ট ফিল্টার</DialogTitle>
                </DialogHeader>
                <div className="w-full flex justify-center">
                    <SubjectFilter
                        selectedSubject={selectedSubject}
                        allSubjects={subjects}
                        onClick={(s) => {
                            setSelectedSubject(s)
                            setOpen(false)
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )


    return user.level !== 0 ? (
        <div className="w-full p-4 relative z-[3] flex justify-between rounded-xl ring-1 ring-ash dark:ring-elegant/40 bg-white dark:bg-elegant/10">

            <div className='flex items-center'>
                <Popover>
                    <PopoverTrigger>
                        <p className='flex text-sm md:text-base items-center gap-2'>
                            {filterIcon}
                            <span className="font-medium">{sortbySelected}</span>
                        </p>
                    </PopoverTrigger>
                    <PopoverContent align="start" className='z-[3] bg-white dark:text-white dark:bg-gray-900 w-[200px] grid'>
                        <PopoverClose asChild onClick={() => {
                            setSort('')
                            setSortbySelected(sortby[0])
                        }}>
                            <button type='button' className='text-sm font-medium hover:bg-ash rounded-md p-2'>Sort By Default</button>
                        </PopoverClose>
                        <PopoverClose asChild onClick={() => {
                            setSort('latest')
                            setSortbySelected(sortby[1])
                        }}>
                            <button type='button'
                                className='text-sm font-medium hover:bg-ash rounded-md p-2'>Sort By Latest</button>
                        </PopoverClose>
                    </PopoverContent>
                </Popover>
            </div>

            <div className='text-sm font-medium p-2 rounded-full bg-ash/10'>{batchName || user?.hsc_batch}</div>
            {filterSubjects}
        </div >
    ) : null
}