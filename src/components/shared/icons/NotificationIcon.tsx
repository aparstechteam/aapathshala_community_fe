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

export const iconMap = {
    reaction: <Heart className="h-4 w-4" />,
    reaction_given: <Heart className="h-4 w-4" />,
    comment: <MessageCircle className="h-4 w-4" />,
    follow: <UserPlus className="h-4 w-4" />,
    mention: <AtSign className="h-4 w-4" />,
    group_post: <Users className="h-4 w-4" />,
    group_invite: <Mail className="h-4 w-4" />,
    group_reply: <MessageSquare className="h-4 w-4" />,
    group_accepted: <Check className="h-4 w-4" />,
    default: <Bell className="h-4 w-4" />,
    score_count: <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect
            x="0.5"
            y="0.5"
            width="32"
            height="32"
            rx="16"
            fill="#FFF6EA"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.6391 8.9855C15.7992 8.66297 16.1281 8.45898 16.4882 8.45898C16.8483 8.45898 17.1772 8.66297 17.3373 8.9855L18.9909 12.3174L22.6707 12.8604C23.0269 12.913 23.3226 13.1629 23.4339 13.5053C23.5451 13.8477 23.4528 14.2236 23.1955 14.4756L20.5376 17.0778L21.1583 20.7454C21.2184 21.1004 21.0721 21.4588 20.7808 21.6704C20.4896 21.8821 20.1035 21.9104 19.7844 21.7435L16.4882 20.0199L13.192 21.7435C12.8729 21.9104 12.4868 21.8821 12.1955 21.6704C11.9042 21.4588 11.758 21.1004 11.8181 20.7454L12.4388 17.0778L9.7809 14.4756C9.5236 14.2236 9.43124 13.8477 9.54253 13.5053C9.65377 13.1629 9.94944 12.913 10.3057 12.8604L13.9855 12.3174L15.6391 8.9855Z"
            fill="url(#paint0_linear_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.4883 8.51074C16.8483 8.51074 17.1773 8.71473 17.3374 9.03726L18.991 12.3692L22.6708 12.9122C23.027 12.9648 23.3227 13.2146 23.434 13.557C23.4357 13.5625 23.4374 13.568 23.4391 13.5735L16.4883 15.8138V8.51074Z"
            fill="url(#paint1_linear_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.488 15.8138L9.53711 13.5735C9.53874 13.568 9.54048 13.5625 9.54228 13.557C9.65351 13.2146 9.94919 12.9648 10.3054 12.9122L13.9853 12.3692L15.6389 9.03726C15.7989 8.71473 16.1279 8.51074 16.488 8.51074V15.8138Z"
            fill="url(#paint2_linear_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.7863 21.6524C20.7775 21.6592 20.7687 21.6658 20.7596 21.6723C20.4683 21.8821 20.0823 21.9102 19.7632 21.7448L16.467 20.0359L13.1707 21.7448C12.8571 21.9074 12.4789 21.883 12.1895 21.683L16.467 15.8145L20.7863 21.6524Z"
            fill="url(#paint3_linear_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.2539 21.6979V24.8909C16.2539 25.0201 16.3588 25.125 16.488 25.125C16.6172 25.125 16.7221 25.0201 16.7221 24.8909V21.6979C16.7221 21.5688 16.6172 21.4639 16.488 21.4639C16.3588 21.4639 16.2539 21.5688 16.2539 21.6979Z"
            fill="url(#paint4_radial_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.1322 17.7249L25.1499 18.7683C25.272 18.8105 25.4054 18.7456 25.4476 18.6235C25.4899 18.5015 25.425 18.368 25.3029 18.3258L22.2852 17.2824C22.1631 17.2402 22.0297 17.3051 21.9875 17.4272C21.9453 17.5493 22.0102 17.6827 22.1322 17.7249Z"
            fill="url(#paint5_radial_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.6899 17.2824L7.67231 18.3258C7.55017 18.368 7.48534 18.5015 7.52753 18.6235C7.56978 18.7456 7.70315 18.8105 7.82529 18.7683L10.843 17.7249C10.9651 17.6827 11.0299 17.5493 10.9877 17.4272C10.9455 17.3051 10.8121 17.2402 10.6899 17.2824Z"
            fill="url(#paint6_radial_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20.4796 10.8478L22.2895 8.21733C22.3627 8.11092 22.3358 7.96502 22.2294 7.89182C22.1229 7.81856 21.9771 7.84553 21.9038 7.95199L20.0939 10.5824C20.0207 10.6888 20.0477 10.8347 20.1541 10.9079C20.2606 10.9812 20.4064 10.9542 20.4796 10.8478Z"
            fill="url(#paint7_radial_593_34939)"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.1118 10.5642L11.0588 8.11869C10.9757 8.01976 10.828 8.00684 10.7291 8.08993C10.6301 8.17302 10.6172 8.32077 10.7003 8.4197L12.7532 10.8652C12.8363 10.9641 12.9841 10.977 13.083 10.894C13.182 10.8109 13.1948 10.6631 13.1118 10.5642Z"
            fill="url(#paint8_radial_593_34939)"
        />
        <defs>
            <linearGradient
                id="paint0_linear_593_34939"
                x1="16.4882"
                y1="13.8469"
                x2="16.4882"
                y2="20.7043"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FFB541" />
                <stop offset="1" stopColor="#F59500" />
            </linearGradient>
            <linearGradient
                id="paint1_linear_593_34939"
                x1="16.2542"
                y1="8.82046"
                x2="21.1917"
                y2="15.6032"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FFD952" />
                <stop offset="1" stopColor="#FFA501" />
            </linearGradient>
            <linearGradient
                id="paint2_linear_593_34939"
                x1="12.6878"
                y1="9.78333"
                x2="17.3319"
                y2="14.1922"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FFDF6C" />
                <stop offset="1" stopColor="#FFA501" />
            </linearGradient>
            <linearGradient
                id="paint3_linear_593_34939"
                x1="16.4879"
                y1="13.3608"
                x2="16.4879"
                y2="20.6873"
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#FFA841" />
                <stop offset="1" stopColor="#F27B00" />
            </linearGradient>
            <radialGradient
                id="paint4_radial_593_34939"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(16.488 15.8138) rotate(18.8508) scale(9.18389 9.18389)"
            >
                <stop stopColor="#FFA501" />
                <stop offset="0.57" stopColor="#FFAF0E" />
                <stop offset="1" stopColor="#FFD541" />
            </radialGradient>
            <radialGradient
                id="paint5_radial_593_34939"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(16.4873 15.8138) rotate(18.8508) scale(9.18389)"
            >
                <stop stopColor="#FFA501" />
                <stop offset="0.57" stopColor="#FFAF0E" />
                <stop offset="1" stopColor="#FFD541" />
            </radialGradient>
            <radialGradient
                id="paint6_radial_593_34939"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(16.4879 15.8138) rotate(18.8508) scale(9.18389)"
            >
                <stop stopColor="#FFA501" />
                <stop offset="0.57" stopColor="#FFAF0E" />
                <stop offset="1" stopColor="#FFD541" />
            </radialGradient>
            <radialGradient
                id="paint7_radial_593_34939"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(16.4883 15.814) rotate(18.8508) scale(9.18389)"
            >
                <stop stopColor="#FFA501" />
                <stop offset="0.57" stopColor="#FFAF0E" />
                <stop offset="1" stopColor="#FFD541" />
            </radialGradient>
            <radialGradient
                id="paint8_radial_593_34939"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(16.4879 15.8135) rotate(18.8508) scale(9.18389)"
            >
                <stop stopColor="#FFA501" />
                <stop offset="0.57" stopColor="#FFAF0E" />
                <stop offset="1" stopColor="#FFD541" />
            </radialGradient>
        </defs>
    </svg>,
    post: <Heart className="h-4 w-4" />,
    post_with_curiosity: <Heart className="h-4 w-4" />,
    teacher_reaction: <Heart className="h-4 w-4" />,
    admin_reaction: <Heart className="h-4 w-4" />,
    teacher_comment: <MessageCircle className="h-4 w-4" />,
    admin_comment: <MessageCircle className="h-4 w-4" />,
    comment_reply: <MessageCircle className="h-4 w-4" />,
    share: <UserPlus className="h-4 w-4" />,
    save_post: <AtSign className="h-4 w-4" />,
    save_post_given: <Users className="h-4 w-4" />,
    poll_participate: <Mail className="h-4 w-4" />,
    teacher_comment_reaction: <MessageSquare className="h-4 w-4" />,
    admin_comment_reaction: <Check className="h-4 w-4" />,
    comment_reaction: <Bell className="h-4 w-4" />,
    teacher_satisfied: <Bell className="h-4 w-4" />,
    admin_satisfied: <Bell className="h-4 w-4" />,
    user_satisfied: <Bell className="h-4 w-4" />,
    click_through: <Bell className="h-4 w-4" />,
}

export const colors = [
    "bg-[#FF3B00] text-[#FF3B00]", // post
    "bg-[#FF3B00] text-[#FF3B00]", // post_with_curiosity
    "bg-[#28B400] text-[#28B400]", // teacher_reaction
    "bg-[#2A4DFF] text-[#2A4DFF]", // admin_reaction
    "bg-[#FF2B7A] text-[#FF2B7A]", // reaction
    "bg-[#8E2BFF] text-[#8E2BFF]", // reaction_given
    "bg-[#00B2B2] text-[#00B2B2]", // teacher_comment
    "bg-[#D5006D] text-[#D5006D]", // admin_comment
    "bg-[#D5006D] text-[#D5006D]", // admin_comment
    "bg-[#8CCB00] text-[#8CCB00]", // comment
    "bg-[#8CCB00] text-[#8CCB00]", // comment
    "bg-yellow-500 text-yellow-500", // comment_reply
    "bg-yellow-500 text-yellow-500", // comment_reply
    "bg-[#FF3B00] text-[#FF3B00]", // post_with_curiosity
    "bg-[#28B400] text-[#28B400]", // teacher_reaction
    "bg-[#2A4DFF] text-[#2A4DFF]", // admin_reaction
    "bg-[#FF2B7A] text-[#FF2B7A]", // reaction
    "bg-[#8E2BFF] text-[#8E2BFF]", // reaction_given
    "bg-[#00B2B2] text-[#00B2B2]", // teacher_comment
    "bg-[#D5006D] text-[#D5006D]", // admin_comment
    "bg-[#8CCB00] text-[#8CCB00]", // comment
];

export const NotificationIcon = (props: Props) => {
    const { type } = props;


    return (
        <div className={cn("h-10 w-10 rounded-full flex items-center bg-opacity-10 justify-center",
            colors[Object.keys(iconMap).indexOf(type)])}>
            {iconMap[type]}
        </div>
    )
}