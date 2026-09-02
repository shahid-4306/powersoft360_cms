"use client";

import toastBase from "react-hot-toast";
import React, { useRef, useState } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react"; // optional icons
import { motion, PanInfo } from "framer-motion";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info" | "destructive";

export interface ToastActionElement {
  label: string;
  onClick: () => void;
  variant?: "outline" | "solid"; // optional styling
}

export interface ToastProps {
  id?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastActionElement;
  icon?: React.ReactNode; // override default icon
}

/* -----------------------------------------------------
   Icon Mapping
------------------------------------------------------ */
function getIcon(variant: ToastVariant = "default") {
  const iconClass = "w-5 h-5 flex-shrink-0";
  switch (variant) {
    case "success":
      return <CheckCircle className={iconClass} />;
    case "error":
    case "destructive":
      return <AlertCircle className={iconClass} />;
    case "warning":
      return <AlertTriangle className={iconClass} />;
    case "info":
      return <Info className={iconClass} />;
    default:
      return null;
  }
}

/* -----------------------------------------------------
   Variant Styles (Modern Glass + Glow)
------------------------------------------------------ */
function variantOptions(variant?: ToastVariant) {
  switch (variant) {
    case "success":
      return "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/10";
    case "error":
    case "destructive":
      return "bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-red-700 dark:text-red-300 shadow-red-500/10";
    case "warning":
      return "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 text-amber-700 dark:text-amber-300 shadow-amber-500/10";
    case "info":
      return "bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 text-sky-700 dark:text-sky-300 shadow-sky-500/10";
    default:
      return "bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-gray-100";
  }
}

function getAccentColor(variant?: ToastVariant) {
  switch (variant) {
    case "success": return "from-emerald-400 to-emerald-600";
    case "error":
    case "destructive": return "from-red-400 to-red-600";
    case "warning": return "from-amber-400 to-amber-600";
    case "info": return "from-sky-400 to-sky-600";
    default: return "from-purple-400 to-pink-600";
  }
}

/* -----------------------------------------------------
   Custom Toast Component
------------------------------------------------------ */
interface CustomToastProps {
  t: any; // Type from react-hot-toast
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  variant?: ToastVariant;
  action?: ToastActionElement;
  icon?: React.ReactNode;
}

function CustomToast({
  t,
  title,
  description,
  variant = "default",
  action,
  icon,
}: CustomToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragStart = () => {
    setDragging(true);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragging(false);
    const threshold = (toastRef.current?.offsetWidth || 0) * 0.3;
    const velocityThreshold = 500; // pixels per second

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      toastBase.dismiss(t.id);
    }
  };

  return (
    <motion.div
      ref={toastRef}
      className={`
        relative overflow-hidden rounded-xl shadow-2xl backdrop-blur-2xl
        ${variantOptions(variant)}
      `}
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1) inset",
      }}
      initial={{ x: "1rem", opacity: 0, scale: 0.95 }}
      animate={{
        x: t.visible ? 0 : "100%",
        opacity: t.visible ? 1 : 0,
        scale: t.visible ? 1 : 0.95,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      drag={dragging ? false : "x"} // Enable drag only when not already dragging
      dragConstraints={{ left: 0 }}
      dragElastic={{ left: 0, right: 0.5 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      {/* Optional Gradient Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getAccentColor(variant)}`} />

      <div className="flex gap-3 p-4 pl-5 items-start">
        {/* Icon */}
        {(icon ?? getIcon(variant)) && (
          <div className="mt-0.5">
            {icon ?? getIcon(variant)}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-1">
          {title && (
            <p className="font-semibold text-base leading-tight">
              {title}
            </p>
          )}
          {description && (
            <p className="text-sm opacity-90 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => toastBase.dismiss(t.id)}
          className="opacity-60 hover:opacity-100 transition-opacity duration-200"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Button */}
      {action && (
        <div className="px-4 pb-3 pt-1">
          <button
            onClick={() => {
              action.onClick();
              toastBase.dismiss(t.id);
            }}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${action.variant === "solid"
                ? "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
                : "border border-current hover:bg-black/5 dark:hover:bg-white/5"
              }
              backdrop-blur-md hover:shadow-md
            `}
          >
            {action.label}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* -----------------------------------------------------
   Modern Toast Function
------------------------------------------------------ */
export function toast(props: ToastProps) {
  const {
    title,
    description,
    variant = "default",
    duration = 3000,
    action,
    icon,
  } = props;

  return toastBase.custom((t) => (
    <CustomToast
      t={t}
      title={title}
      description={description}
      variant={variant}
      action={action}
      icon={icon}
    />
  ), {
    id: props.id,
    duration,
    position: "top-right", // recommended for modern UIs
  });
}

/* -----------------------------------------------------
   useToast Hook (Shadcn-style)
------------------------------------------------------ */
export function useToast() {
  return { toast };
}