import { ReactNode } from 'react';

import * as Dialog from '@radix-ui/react-dialog';

type DialogWrapperProps = {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger: ReactNode;
    children: ReactNode;
};

const DialogWrapper = ({ open, onOpenChange, trigger, children }: DialogWrapperProps) => {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[200] bg-black/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />

                <Dialog.Content
                    className="fixed left-1/2 top-1/2 z-[201] w-full overflow-hidden max-w-lg -translate-x-1/2 -translate-y-1/2 
                bg-white dark:bg-zinc-950 dark:border dark:border-zinc-800 rounded-lg shadow-lg 
                data-[state=closed]:animate-zoom-out data-[state=open]:animate-zoom-in"
                >
                    {children}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

const DialogClose = Dialog.Close;
const DialogTitle = Dialog.Title;
const DialogDescription = Dialog.Description;

export { DialogWrapper, DialogClose, DialogTitle, DialogDescription };
