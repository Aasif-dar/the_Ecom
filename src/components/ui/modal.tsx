"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** One API for centred dialogs and side drawers. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  variant = "dialog",
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "dialog" | "drawer";
  className?: string;
}) {
  if (variant === "drawer") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className={cn("sm:max-w-lg", className)}>
          <SheetHeader className="border-b pr-14">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="thin-scroll flex-1 overflow-y-auto px-6 py-6">{children}</div>
          {footer && <div className="flex flex-col-reverse gap-3 border-t p-6 sm:flex-row sm:justify-end">{footer}</div>}
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
