import { Component, JSX, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { X } from "lucide-solid";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: JSX.Element;
}

export const Dialog: Component<DialogProps> = (props) => {
    return (
        <Show when={props.isOpen}>
            <Portal>
                <div class="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={props.onClose}
                    />

                    {/* Dialog Content */}
                    <div class="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-6 mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-white">{props.title}</h3>
                            <button
                                onClick={props.onClose}
                                class="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div>
                            {props.children}
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    );
};
