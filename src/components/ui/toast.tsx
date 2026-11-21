"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const toast = ToastPrimitive.createToastManager()

type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"

const TOAST_VARIANTS: ToastVariant[] = [
  "default",
  "success",
  "error",
  "warning",
  "info",
  "loading",
]

/**
 * টাইপ-ভিত্তিক স্টাইল — সব ক্লাস লিটারেল, কোনো ডাইনামিক টেমপ্লেট স্ট্রিং নেই,
 * তাই Tailwind স্ক্যান করে ক্লাসগুলো সহজেই ধরে নেয় (purge-এর সমস্যা নেই)।
 * হালকা সারফেসে ডিজাইন টোকেন (brand / destructive) ও ডার্ক সারফেসে
 * সাধারণ কালার স্কেল ব্যবহার করা হয়েছে — দুটোতেই কনট্রাস্ট ঠিক থাকে।
 */
const TOAST_STYLES: Record<
  ToastVariant,
  {
    root: string
    icon: string
    title: string
    description: string
    close: string
  }
> = {
  default: {
    root: "border-border-subtle bg-background text-heading border-l-4 border-l-muted-foreground/60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50 dark:border-l-slate-400",
    icon: "text-body dark:text-slate-300",
    title: "text-heading dark:text-slate-50",
    description: "text-body dark:text-slate-300",
    close: "text-muted-foreground dark:text-slate-400 hover:text-heading dark:hover:text-white",
  },
  success: {
    root: "border-brand/35 bg-brand-tint text-heading border-l-4 border-l-brand dark:border-emerald-500/40 dark:bg-emerald-950/70 dark:text-emerald-50 dark:border-l-emerald-400",
    icon: "text-emerald-700 dark:text-emerald-300",
    title: "text-emerald-900 dark:text-emerald-50",
    description: "text-emerald-800/80 dark:text-emerald-200/80",
    close: "text-emerald-700/70 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white",
  },
  error: {
    root: "border-destructive/35 bg-red-50 text-heading border-l-4 border-l-destructive dark:border-red-500/40 dark:bg-red-950/70 dark:text-red-50 dark:border-l-red-400",
    icon: "text-red-700 dark:text-red-300",
    title: "text-red-900 dark:text-red-50",
    description: "text-red-800/80 dark:text-red-200/80",
    close: "text-red-700/70 dark:text-red-300 hover:text-red-900 dark:hover:text-white",
  },
  warning: {
    root: "border-amber-300 bg-amber-50 text-heading border-l-4 border-l-amber-500 dark:border-amber-500/40 dark:bg-amber-950/70 dark:text-amber-50 dark:border-l-amber-400",
    icon: "text-amber-700 dark:text-amber-300",
    title: "text-amber-900 dark:text-amber-50",
    description: "text-amber-800/80 dark:text-amber-200/80",
    close: "text-amber-700/70 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white",
  },
  info: {
    root: "border-sky-300 bg-sky-50 text-heading border-l-4 border-l-sky-500 dark:border-sky-500/40 dark:bg-sky-950/70 dark:text-sky-50 dark:border-l-sky-400",
    icon: "text-sky-700 dark:text-sky-300",
    title: "text-sky-900 dark:text-sky-50",
    description: "text-sky-800/80 dark:text-sky-200/80",
    close: "text-sky-700/70 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white",
  },
  loading: {
    root: "border-border-subtle bg-background text-heading border-l-4 border-l-muted-foreground/60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50 dark:border-l-slate-400",
    icon: "text-body dark:text-slate-300",
    title: "text-heading dark:text-slate-50",
    description: "text-body dark:text-slate-300",
    close: "text-muted-foreground dark:text-slate-400 hover:text-heading dark:hover:text-white",
  },
}

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  toastVariant = "default",
  ...props
}: ToastPrimitive.Root.Props & { toastVariant?: ToastVariant }) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-toast-type={toastVariant}
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        TOAST_STYLES[toastVariant].root,
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:transform-[translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className
      )}
      {...props}
    >
      {children ?? (
        <XIcon aria-hidden="true" />
      )}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: ToastVariant }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = <CircleCheckIcon aria-hidden="true" />
  }

  if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />
  }

  if (type === "error") {
    icon = <OctagonXIcon aria-hidden="true" />
  }

  if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        TOAST_STYLES[type].icon
      )}
    >
      {icon}
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => {
    const toastType = toastItem.type as ToastVariant
    const variant: ToastVariant = TOAST_VARIANTS.includes(toastType)
      ? toastType
      : "default"
    const styles = TOAST_STYLES[variant]

    return (
      <Toast key={toastItem.id} toast={toastItem} toastVariant={variant}>
        <ToastContent>
          <ToastIcon type={variant} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastTitle className={styles.title} />
            <ToastDescription className={styles.description} />
          </div>
          <ToastAction />
          <ToastClose className={styles.close} />
        </ToastContent>
      </Toast>
    )
  })
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}
