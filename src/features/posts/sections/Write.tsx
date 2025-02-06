import { RtxEditor } from "@/components";
import { cn } from "@/lib/utils";

export type Err = {
    subject: string;
    chapter: string;
    prompt: string;
    destination: string;
}


interface WriteProps {
    prompt: string;
    setPrompt: (value: string) => void;
    error: Err
    setError: (value: Err) => void;
    poll: boolean;
}
export const WritePost = (props: WriteProps) => {
    const { prompt, setPrompt, error, setError, poll } = props;
    return (
        <div
            className={cn(
                "gap-2",
                poll && "hidden",
                !poll && "grid"
            )}
        >
            <div>
                <RtxEditor
                    content={prompt}
                    onUpdate={(value) => {
                        setPrompt(value);
                        setError({ ...error, prompt: "" });
                    }}
                />

                {error && !prompt && (
                    <p className="text-hot text-xs mt-2">
                        {error.prompt}
                    </p>
                )}
            </div>

        </div>
    )
}
