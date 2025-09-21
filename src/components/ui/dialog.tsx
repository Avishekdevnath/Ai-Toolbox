"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open: currentOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => {
  const { setOpen } = React.useContext(DialogContext);

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => setOpen(true),
    });
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  const { open, setOpen } = React.useContext(DialogContext);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={() => setOpen(false)}
      />

      {/* Content */}
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
  >
    {children}
  </div>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <h2
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
  >
    {children}
  </h2>
);

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
  >
    {children}
  </p>
);

const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
  >
    {children}
  </div>
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
};
