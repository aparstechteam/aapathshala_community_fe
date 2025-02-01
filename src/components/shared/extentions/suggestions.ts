/* eslint-disable @typescript-eslint/no-explicit-any */
import { secondaryAPI } from "@/configs";
import axios from "axios";

import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { MentionList } from "./Mentions";
import "tippy.js/dist/tippy.css";

type TData = {
    name: string
}

export const fetchSuggestions = async (query: string): Promise<TData[]> => {

    try {
        const { data } = await axios.get(
            `${secondaryAPI}/api/utils/search?search=${query}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return !!data?.users ? data?.users?.data?.map((item: any) => ({ name: item.name })) || [] : [];
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
};

export const suggestion = {
    items: async ({ query }: { query: string }) => {
        const users = await fetchSuggestions(query)
        return users.map((item: any) => item.name)
            .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
            .slice(0, 9);
    },
    render: () => {
        let reactRenderer: ReactRenderer | any;
        let popup: any;

        return {
            onStart: (props: any) => {
                if (!props.clientRect) return;

                reactRenderer = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                });

                popup = tippy("body", {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: reactRenderer.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "bottom-start",
                });
            },
            onUpdate(props: any) {
                reactRenderer.updateProps(props);
                if (!props.clientRect) return;
                popup[0].setProps({ getReferenceClientRect: props.clientRect });
            },
            onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                    popup[0].hide();
                    return true;
                }
                return reactRenderer?.ref?.onKeyDown(props);
            },
            onExit() {
                popup[0].destroy();
                reactRenderer.destroy();
            },
        };
    },
};
