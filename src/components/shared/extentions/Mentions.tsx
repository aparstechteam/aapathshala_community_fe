import { forwardRef, useImperativeHandle, useState } from "react";

interface MentionListProps {
    items: string[];
    command: (item: { id: string }) => void;
}

export const MentionList = forwardRef(({ items, command }: MentionListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = items[index];
        if (item) command({ id: item });
    };

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
                return true;
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev + 1) % items.length);
                return true;
            }
            if (event.key === "Enter") {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="">
            {items.length ? (
                items.map((item, index) => (
                    <button
                        key={index}
                        className={`p-2 w-full text-left rounded-md hover:bg-gray-200 ${index === selectedIndex ? "bg-light/50" : ""
                            }`}
                        onClick={() => selectItem(index)}
                    >
                        {item}
                    </button>
                ))
            ) : (
                <div className="p-2 text-gray-500">No result</div>
            )}
        </div>
    );
});

MentionList.displayName = "MentionList";