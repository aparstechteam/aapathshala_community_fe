import { useState } from 'react';
import { Input, Textarea, Button, Badge, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/components';
import { feedbackAPI } from '@/configs';

export const FeatureRequest = () => {
    const { toast } = useToast();
    const { user } = useUser();

    const [featureRequest, setFeatureRequest] = useState({
        title: '',
        description: '',
        priority: 'medium',
        level: user?.level,
        section: 'feature'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = ({ name, value }: { name: string, value: string }) => {
        setFeatureRequest({
            ...featureRequest,
            [name]: value
        });
    };

    const submitFeatureRequest = async () => {
        setIsSubmitting(true);
        try {
            const data = {
                name: user?.name,
                phone: user?.phone,
                instituteName: user?.school,
                ...featureRequest
            };

            await fetch(`${feedbackAPI}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            toast({
                title: 'Done',
                description: 'Your feedback has been submitted successfully.',
            });

            // Reset form
            setFeatureRequest({
                title: '',
                description: '',
                priority: 'medium',
                level: user?.level,
                section: 'feature'
            });
            setIsSubmitting(false);
        } catch (error) {
            console.error('Error submitting feature request:', error);
            toast({
                title: 'Error',
                description: 'An error occurred while submitting your feature request. Please try again.',
                variant: 'destructive'
            });
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const features = [
        { section: 'searching', description: 'Searching for friends and posts', status: 'completed' },
        { section: 'post', description: 'Text formatting options', status: 'pending' },
        { section: 'comment', description: 'Text formatting and Image upload in comments', status: 'pending' },
        { section: 'group', description: 'Group with friends', status: 'pending' },
        { section: 'studyplan', description: 'Study plan for exams', status: 'pending' },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'pending':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <div className='w-full py-5 min-h-[calc(100vh-70px)]'>
            <div className="max-w-2xl bg-white dark:bg-gray-800 ring-1 ring-ash rounded-xl mt-4 dark:ring-0 p-4 mx-auto space-y-8">
                <header className="space-y-2 text-center">
                    <h1 className="text-xl font-bold text-clip text-transparent bg-clip-text bg-gradient-to-r from-hot via-olive to-blue-600">তোমার অভিজ্ঞতা শেয়ার করো</h1>
                    <p className="text-light !text-sm dark:text-gray-400">
                        ACS স্মার্ট কমিউনিটি সম্পর্কে তোমার অভিজ্ঞতা শেয়ার করো। <br /> তোমার দেয়া মতামতের উপর ভিত্তি করে আমরা পদক্ষেপ গ্রহণ করবো।
                    </p>
                </header>

                <form onSubmit={(e) => {
                    e.preventDefault()
                    submitFeatureRequest();
                }} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="section">ফিডব্যাক সম্পর্কিত সেকশন</Label>
                            <Select required name="section" value={featureRequest.section} onValueChange={(value) => handleChange({ name: 'section', value })}>
                                <SelectTrigger className='!ring-1 !ring-ash focus:!ring-olive/40 duration-300 focus:outline-none focus:ring-offset-0 focus:border-0 focus:!ring-2'>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feature">ফিচার রিকোয়েক্ট করতে চাই</SelectItem>
                                    <SelectItem value="group">গ্রুপ সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="club">ক্লাব সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="teacher">অভিভাবক প্রোগ্রাইল সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="notification">নোটিফিকেশন সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="top_solver">টপ কন্ট্রিবিউটরস্ র‍্যাংকিং সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="post">পোস্ট সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="comment">কমেন্ট সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="profile"> প্রোফাইল আপডেটে সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="school">কলেজ আপডেট করতে চাই</SelectItem>
                                    <SelectItem value="ai">কিউরিওসিটি Ai সম্পর্কিত সমস্যা</SelectItem>
                                    <SelectItem value="other">অন্যান্য</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="title">শিরোনাম</Label>
                            <Input className='!ring-1 !ring-ash !h-10 border-0 focus:!ring-olive/40 duration-300 focus:outline-none focus:ring-offset-0 focus:border-0 focus:!ring-2' id="title" value={featureRequest.title} onChange={(e) => handleChange({ name: 'title', value: e.target.value })} placeholder="Brief title for your feature request" />
                        </div>
                        <div>
                            <Label htmlFor="description">তোমার অভিজ্ঞতা</Label>
                            <Textarea className='!ring-1 focus:!ring-2 !rounded-xl focus:!ring-olive/40 duration-300 !ring-ash' id="description" value={featureRequest.description} onChange={(e) => handleChange({ name: 'description', value: e.target.value })} placeholder="Detailed description of your feature request" rows={4} />
                        </div>
                        <div className="hidden gap-4">
                            {/* <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select required name="priority" value={featureRequest.priority} onValueChange={(value) => handleChange({ name: 'priority', value })}>
                                    <SelectTrigger className="w-full !ring-1 !ring-ash focus:!ring-2 focus:!ring-olive/40 duration-300">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}

                        </div>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full !bg-olive !text-white">
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </form>

                <div className="space-y-6 hidden">
                    <h2 className="text-2xl font-semibold">Recent Features</h2>
                    <ul className="space-y-4">
                        {features.map((feature) => (
                            <li key={feature.section} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{feature.description}</h3>
                                    <Badge variant={getStatusVariant(feature.status)}>
                                        {feature.status}
                                    </Badge>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div >
        </div >
    );
};