import {
    AtomIcon,
    BookIcon,
    BrainIcon,
    CalculatorIcon,
    CpuIcon,
    FlaskConicalIcon,
    LeafIcon,
    LucideIcon
} from "lucide-react";

// Define a type for subject names
export type SubjectName =
    | 'সকল বিষয়'
    | 'Physics 1st Paper'
    | 'Chemistry 1st Paper'
    | 'Higher Math 1st Paper'
    | 'Biology 1st Paper'
    | 'ICT'
    | 'Physics 2nd Paper'
    | 'Higher Math 2nd Paper'
    | 'Biology 2nd Paper'
    | 'Bangla 1st Paper'
    | 'English 2nd Paper'
    | 'English 1st Paper'
    | 'Chemistry 2nd Paper'
    | 'Bangla 2nd Paper'
    | 'Psychology 1st Paper';

// Define the subjectIcons object with proper typing
export const subjectIcons: Record<SubjectName, LucideIcon> = {
    'সকল বিষয়': BookIcon,
    'Physics 1st Paper': AtomIcon,
    'Chemistry 1st Paper': FlaskConicalIcon,
    'Higher Math 1st Paper': CalculatorIcon,
    'Biology 1st Paper': LeafIcon,
    'ICT': CpuIcon,
    'Physics 2nd Paper': AtomIcon,
    'Higher Math 2nd Paper': CalculatorIcon,
    'Biology 2nd Paper': LeafIcon,
    'Bangla 1st Paper': BookIcon,
    'English 2nd Paper': BookIcon,
    'English 1st Paper': BookIcon,
    'Chemistry 2nd Paper': FlaskConicalIcon,
    'Bangla 2nd Paper': BookIcon,
    'Psychology 1st Paper': BrainIcon,
};

export type MCQ = {
    question: string
    options: string[]
    correct: 'a' | 'b' | 'c' | 'd'
    explanation: string
}

export const mcqs = [
    {
        "question": "একটি স্পর্শ প্রকাশ দর্শানো হচ্ছে যার দৈর্ঘ্য হল $$ λ $, কত সময়ে দ্রুতি মানের পরিবর্তন ঘটাবে?",
        "options": [
            "০.০১/λ সেকেন্ড",
            "λ সেকেন্ড",
            "১/λ সেকেন্ড",
            "১/λ² সেকেন্ড",
        ],
        "explanation": "সময় $$ t = \\frac{x}{v} = \\frac{λ}{c} = \\frac{1}{f}$$হওয়ায়, $$f = \\frac{1}{λ}$$",
        "correct": "c"
    },
    {
        "question": "যদি একটি বলাকৃতি $$\\vec{A}$$ থেকে অন্য বলাকৃতি $$\\vec{B}$$ পাল্লারের দিকে হয় এবং উভয় এক সমান মান ধারণ করে, তবে দুটি বলাকৃতির মধ্যবর্তী কোণ $$\\theta$$ হবে?",
        "options": [
            "০°",
            "৪৫°",
            "৬০°",
            "৯০°",
        ],
        "explanation": "দুটি সমান বলের উপরিভাগ অনুযায়ী, $$ \\tan \\left(θ \\right) = \\frac{\\left| A \\right|}{\\left| B \\right|} \\implies θ = \\tan^{-1}\\left(\\frac{\\left| A \\right|}{\\left| B \\right|}\\right)$$",
        "correct": "c"
    },
    {
        "question": "সাধারনত কত নম্বর এটি মুদ্রণ?",
        "options": [
            "১",
            "২",
            "৩",
            "৪",
        ],
        "explanation": "নম্বরদ্বয় $$n_l = 10^{3} = 1000$$, কারণ পৃথক নম্বরদ্বয় $$n_s = 10^{0} = 1$$ অতএব $$n_l= 10^{n_s}$$",
        "correct": "b"
    },
    {
        "question": "বেগ  $$\\vec{v}$$ এর সাথে সম্পর্কিত অত্র বৃত্তের কেন্দ্র $$C$$ এবং বৃত্তটির রাইদ্রয়র $$r$$ বহন করলে, বেগ $$\\vec{x}$$ এর মান কত?",
        "options": [
            "$$v= \\frac{d\\phi}{dt},\\;x = C\\cdot r\\cdot ω$$",
            "$$x = C\\cdot r$$",
            "$$v= \\frac{d\\phi}{dt},\\;x = C\\cdot r^2\\cdot ω$$",
            "$$v= \\frac{d\\phi}{dt},\\;x = C\\cdot r^3\\cdot ω$$",
        ],
        "explanation": "মৌলিক বেগ $$\\vec{v} = \\frac{d\\vec{x}}{dt}$$ এবং $$ \\vec{ω} =\\frac{d\\vec{φ}}{dt} \\implies × = C×r×ω$$",
        "correct": "a"
    },
    {
        "question": "শূন্য ধ্রুবক-বৈদ্যুতিক সাক্ষাৎকার নির্ধারণে ব্যবহৃত একটি খোলারবিশিস্ট লোহার নির্দেশে রফতানো হয় (সমীকরণ রহিমঃ $$R =$$. এর নির্দিষ্ট ক্ষমতার লগ $$P_0$$ (ক্ষেত্রফল, $$P_0 = 10^7 N/m^3$$) আপুরণন করার সময় প্রথমট কী তড়িৎচ্চালকতার উৎপাদিত তড়িঅংশ $$d_1$$ কত?",
        "options": [
            "$$d_1 = R\\.2$$",
            "$$d_1 = S\\.2$$",
            "$$d_1 = R $$",
            "$$d_1 = S $$",
        ],
        "explanation": "সমীকরণ রহিমঃ $$\\int ( P - P_0 ) = S = \\; ( P_1 - P_2 ) × where P_1 = 2P_0 = P_2 \\implies d_1 = R\\.2$$",
        "correct": "a"
    }
]
