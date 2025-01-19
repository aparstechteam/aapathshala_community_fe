import { NType } from '@/@types'
import React from 'react'
import {
    Heart,
    MessageCircle,
    UserPlus,
    AtSign,
    Users,
    Mail,
    MessageSquare,
    Check,
    Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
    type: NType | 'default'
}

export const NotificationIcon = (props: Props) => {
    const { type } = props;

    const colors = ["bg-[#FF3B00] text-[#FF3B00]",
        "bg-[#28B400] text-[#28B400]", "bg-[#2A4DFF] text-[#2A4DFF]", "bg-[#FF2B7A] text-[#FF2B7A]",
        "bg-[#8E2BFF] text-[#8E2BFF]", "bg-[#00B2B2] text-[#00B2B2]", "bg-[#D5006D] text-[#D5006D]",
        "bg-[#8CCB00] text-[#8CCB00]",
        "bg-yellow-500 text-yellow-500",
    ]

    const iconMap = {
        reaction: <Heart className="h-4 w-4" />,
        comment: <MessageCircle className="h-4 w-4" />,
        follow: <UserPlus className="h-4 w-4" />,
        mention: <AtSign className="h-4 w-4" />,
        group_post: <Users className="h-4 w-4" />,
        group_invite: <Mail className="h-4 w-4" />,
        group_reply: <MessageSquare className="h-4 w-4" />,
        group_accepted: <Check className="h-4 w-4" />,
        default: <Bell className="h-4 w-4" />
    }
    return (
        <div className={cn("h-10 w-10 rounded-full flex items-center bg-opacity-10 justify-center",
            colors[Object.keys(iconMap).indexOf(type)])}>
            {iconMap[type]}
        </div>
    )
}