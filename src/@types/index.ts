
export type Comment = {
    id: string;
    post_id: string;
    user_id: string | number;
    content: string;
    image: string | null;
    satisfied: boolean;
    satisfied_count: number;
    dissatisfied_count: number;
    created_at: Date | string
    updated_at: Date | string
    parent_comment_id: string | null;
    user: {
        id: string;
        name: string;
        profilePic: string;
        image: string;
    };
    replies: Comment[];
    reactions: Reaction[];
};

export type Subject = {
    id: string
    name: string
    count: number | string
}

export type Chapter = {
    id: string
    name: string
    subject_id: string
    level: number
    order: number
}


export type Reply = {
    id: string;
    postId: string;
    userId: string;
    content: string;
    image: string | null;
    satisfied: boolean;
    satisfiedCount: number;
    dissatisfiedCount: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    parentCommentId: string | null;
    user: {
        id: string;
        name: string;
        profilePic: string;
    };
    reactions: Reaction[];
};

export type UserData = {
    is_paid: boolean;
    email: string;
    gender?: string | null;
    goal?: string | null;
    handle?: string;
    hsc_batch: string;
    id: string;
    instituteName?: string;
    school?: string;
    name: string;
    phone: string;
    profilePic: string | ''
    image?: string | ''
    role?: "ADMIN" | "USER" | "MODERATOR";
    status?: "active" | "inactive" | "banned";
    district?: string | null
    joiningId?: string | null
    thana?: string | null
    group?: string | null
    is_waiting?: boolean
    level?: number
    isFollowing?: boolean
    religion?: string
    bio?: string
    institute_name?: string
    course_enrolled?: string[]
};

export type Club = {
    cover: string | null;
    disabled: boolean;
    id: string;
    group_id: string;
    is_member: boolean;
    name: string;
    icon: React.ReactNode | string;
    image: string | null;
    member_count: string;
    slug: string;
    description: string | null;
    visibility: "PUBLIC" | "PRIVATE" | "PROTECTED";
    is_paid: boolean;
    is_eligiable: boolean;
    type: string;
    data: {
        type: string;
        subject: string;
    };
}

export type Group = {
    name: string;
    description: string | null;
    cover: string | null;
    group_id: string;
    image: string | null;
    slug: string;
    created_at: Date | string;
    updated_at: Date | string;
    data: {
        type: string;
        subject: string;
    };
    disabled: boolean;
    visibility: "PUBLIC" | "PRIVATE" | "PROTECTED";
    id: string;
    member_count: string;
    is_member: boolean;
    is_paid: boolean;
    is_eligiable: boolean;
    type: string;
};

export type Member = {
    user_id: string;
    role: "ADMIN" | "MEMBER" | "MODERATOR";
    name: string;
    hsc_batch: string;
    instituteName: string;
    handle: string | null;
    profilePic: string;
    image: string;
};

export type Post = {
    id: string;
    group_name: string;
    group_slug: string;
    group_image: string;
    group_id: string;
    isPinned: boolean | string;
    isSaved: boolean | string;
    body: string;
    image: string | null;
    images: string[];
    category: string;
    canComment: boolean;
    subjectId: string | null;
    chapterId: string | null;
    userId: string;
    user_name: string;
    user_profile_pic: string;
    batch: string;
    commentCount: number;
    status: string;
    createdAt: string;
    created_at: string;
    updatedAt: string;
    data: Record<string, unknown> | null;
    userName: string;
    userProfilePic: string;
    userRole?: string;
    subjectName: string | null;
    chapterName: string | null;
    user_priority: number;
    relevance_score: number;
    user_role: string;
    reactions: Reaction[];
    reaction_count: number;
    isFollowing: boolean;
    reach_score: number;
    user_view_count: number;
    shareCount: number;
    reachCount: number;
    total_comments: number;
    isActive?: boolean;
    poll?: string;
    pollType?: string;
    video_url?: string;
    totalVotes: number;
    pollOptions?: PollOption[];
    ai_enabled: boolean;
    subject?: {
        name: string;
        id: string;
    }
    user: {
        id: string;
        name: string;
        profilePic: string;
        image: string;
        isFollowing: boolean;
        isActive: boolean;
        role: string;
    };
    chapter: {
        id: string;
        name: string;
    } | null;
    tags: string[]
};

export type PollOption = {
    id: string;
    name: string;
    is_correct: boolean;
    vote_count: number;
    has_voted: boolean;
}


export type Reaction = {
    type: string,
    user: {
        id: string
        name: string
        profilePic: string
        role?: string
        isFollowing?: boolean
        image?: string
    }
}

export type Teacher = {
    id: string
    email: string
    name: string
    profilePic: string
}


export type Option = {
    id: string
    option: string
    is_correct: boolean
}

export type QuizQuestion = {
    id: string
    question: string
    explanation: string
    data: Record<string, string | number> | null
    options: Option[]
}

export type QuizResult = {
    success: boolean;
    averageScore: string;
    results: {
        id: string;
        score: number;
        duration: string;
        created_at: string;
    }[];
};

export type Pagination = {
    currentPage: number;
    totalPages: number;
    totalItems: number | string;
    itemsPerPage: number;
};

export type LeaderboardEntry = {
    id: string;
    name: string;
    profilePic: string;
    instituteName: string;
    institute_name?: string;
    satisfiedCount: number;
    image: string;
    school: string;
    satisfied_count: number;
};
export type UserComment = {
    id: string;
    user_id: string;
    post_id: string;
    user_profile_pic: string;
    user_name: string;
    parent_comment_id: string | null;
    content: string;
    created_at: Date | string;
    updated_at: Date | string;
    dissatisfied_count: number;
    satisfied_count: number;
    satisfied: boolean;
    post_body: string;
    image: string | null;
};

export type NType =
    | "reaction"
    | "comment"
    | "follow"
    | "mention"
    | "group_post"
    | "group_invite"
    | "group_reply"
    | "group_accepted";

export type Notification = {
    id: string;
    message: string;
    link: string;
    image: string | null;
    type: NType;
    created_at: string;
    updatedAt: string;
    read_status: boolean;
}

export type Summary = {
    id: string;
    subject_id: string;
    chapter_id: string;
    question: string;
    answer: string;
    type: string;
    created_at: string;
    updated_at: string;
};

export type Exams = {
    id: number;
    user_id: number | null;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    start_time: string;
    end_time: string;
    duration: number;
    total_marks: number;
    marks: number | null;
    pass_marks: number;
    passed: boolean | null;

}
