export type THomework = {
  total_submissions?: number;
  id: string;
  body: string;
  subject_id: string;
  chapter_id: string;
  subject_name?: string;
  chapter_name?: string;
  deadline: string;
  deadline_formatted: string;
  topic: string;
  user_id: string;
  user_name?: string;
  user_image?: string;
  user_role?: string;
  attachment_url?: string;
  has_ended: boolean
  has_submitted: boolean
  images: string[];
  user?: {
    name?: string;
    image?: string;
    role?: string;
  };
};

export type TSubmission = {
  id: string;
  body: string;
  images: string[];
  attachment_url: string;
  marks: number | null;
  is_best: boolean;
  is_bookmarked?: boolean;
  created_at: string;
  user_id: string;
  user_name: string;
  user_image: string;
  user_role: string;
  homework_id: string;
  homework_topic: string;
  homework_deadline: string;
  marked_by: string | null;
  marked_by_name: string | null;
  marked_by_image: string | null;
  marked_by_role: string;
  reply: string;
  reply_audience: string;
  is_solution: boolean;
};
