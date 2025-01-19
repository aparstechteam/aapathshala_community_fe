import React, { useRef, useState, useEffect } from "react";
import { Textarea } from "./textarea";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

import { getCaretCoordinates, getCurrentWord, replaceWord } from "../utils/commandFormate";

export const people = [
    { username: "john_doe" },
    { username: "jane_smith" },
    { username: "mohammad_ahnaf" },
    { username: "alice_wonderland" },
    { username: "bob_builder" },
    // Add more people as necessary
];

export function Write() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [commandValue, setCommandValue] = useState<string>("");
    const [textValue, setTextValue] = useState<string>("");
    const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

    const onTextValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const newTextValue = e.target.value;
        setTextValue(newTextValue);

        const currentWord = getCurrentWord(textareaRef.current!);
        if (currentWord.startsWith("@")) {
            setDropdownVisible(true);
            const { top, left } = getCaretCoordinates(textareaRef.current!, textareaRef.current!.selectionStart!);
            if (dropdownRef.current) {
                dropdownRef.current.style.top = `${top + 20}px`; // Adjust as needed
                dropdownRef.current.style.left = `${left}px`;
            }
        } else {
            setDropdownVisible(false);
        }
    };

    const onCommandSelect = (value: string) => {
        if (textareaRef.current) {
            const newValue = replaceWord(textareaRef.current, value) || ''
            setTextValue(newValue);
            setDropdownVisible(false);
        }
    };



    const handleBlur = () => {
        setDropdownVisible(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent | React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (dropdownVisible && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
                e.preventDefault();
                // Handle keyboard navigation or selection for dropdown
            }
        };

        const textareaElement = textareaRef.current!;
        textareaElement.addEventListener("keydown", (e) => handleKeyDown(e));
        textareaElement.addEventListener("blur", handleBlur);

        return () => {
            textareaElement.removeEventListener("keydown", (e) => handleKeyDown(e));
            textareaElement.removeEventListener("blur", handleBlur);
        };
    }, [dropdownVisible]);

    return (
        <div className="relative w-full">
            <Textarea
                ref={textareaRef}
                value={textValue}
                onChange={onTextValueChange}
                className="w-full"
                placeholder="Type @ to mention someone..."
            />
            {dropdownVisible && (
                <Command
                    ref={dropdownRef}
                    className="absolute z-10 h-auto max-h-32 w-48 overflow-y-scroll border border-gray-300 bg-white shadow-md"
                >
                    <div className="p-2">
                        <CommandInput
                            ref={inputRef}
                            value={commandValue}
                            onValueChange={setCommandValue}
                            placeholder="Search people..."
                        />
                    </div>
                    <CommandList>
                        <CommandGroup>
                            {people
                                .filter((p) =>
                                    p.username.toLowerCase().includes(commandValue.toLowerCase())
                                )
                                .map((p) => (
                                    <CommandItem key={p.username} value={p.username} onSelect={onCommandSelect}>
                                        {p.username}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            )}
        </div>
    );
}
