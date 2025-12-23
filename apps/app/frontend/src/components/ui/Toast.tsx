import { Toast as ArkToast, Toaster as ArkToaster, createToaster } from '@ark-ui/solid/toast';
import type { Component } from 'solid-js';
import { Portal } from 'solid-js/web';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-solid';

// Create a global toaster instance
export const toaster = createToaster({
    placement: 'top',
    gap: 16,
    overlap: true,
    duration: 5000,
});

export type ToastType = 'success' | 'error' | 'info';

// Helper function to create toasts
export const addToast = (type: ToastType, message: string) => {
    toaster.create({
        title: message,
        type,
    });
};

// Toast component with styled versions
export const Toaster: Component = () => {
    return (
        <Portal>
            <ArkToaster toaster={toaster}>
                {(toast) => {
                    const toastType = toast().type as ToastType;
                    const bgColor = toastType === 'success'
                        ? 'bg-green-900 border-green-700'
                        : toastType === 'error'
                            ? 'bg-red-900 border-red-700'
                            : 'bg-blue-900 border-blue-700';

                    const textColor = toastType === 'success'
                        ? 'text-green-100'
                        : toastType === 'error'
                            ? 'text-red-100'
                            : 'text-blue-100';

                    const icon = toastType === 'success'
                        ? <CheckCircle size={20} />
                        : toastType === 'error'
                            ? <AlertCircle size={20} />
                            : <Info size={20} />;

                    return (
                        <ArkToast.Root
                            class={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md w-full mx-4 sm:mx-0 ${bgColor} ${textColor}`}
                        >
                            <div class="flex-shrink-0 mt-0.5">
                                {icon}
                            </div>
                            <ArkToast.Title class="flex-1 text-sm font-medium">
                                {toast().title}
                            </ArkToast.Title>
                            <ArkToast.CloseTrigger
                                class="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                                aria-label="閉じる"
                            >
                                <X size={16} />
                            </ArkToast.CloseTrigger>
                        </ArkToast.Root>
                    );
                }}
            </ArkToaster>
        </Portal>
    );
};
