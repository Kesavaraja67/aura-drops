"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface BlobButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "red" | "mustard" | "maroon" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
}

export function BlobButton({
  children,
  onClick,
  isLoading = false,
  disabled = false,
  variant = "red",
  size = "md",
  className = "",
  type = "button",
}: BlobButtonProps) {
  const getFillColor = () => {
    switch (variant) {
      case "red":
        return "#F91814";
      case "mustard":
        return "#FFD750";
      case "maroon":
        return "#4C0016";
      case "white":
        return "#FFFFFF";
      default:
        return "#F91814";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "mustard":
        return "text-[#4C0016]";
      case "white":
        return "text-[#F91814]";
      default:
        return "text-[#F5E3CD]";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-5 py-2 text-base md:text-lg";
      case "lg":
        return "px-10 py-4 text-2xl md:text-3xl";
      case "md":
      default:
        return "px-7 py-3 text-xl md:text-2xl";
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative inline-block border-none bg-transparent p-0 cursor-pointer outline-none select-none blob-button group ${className}`}
    >
      {/* SVG Blob Background */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-10 -10 602 475"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full z-0 pointer-events-none drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300"
      >
        <path
          stroke="#4C0016"
          strokeWidth="16"
          fill={getFillColor()}
          d="M310.777 0.20434C424.154 2.91791 540.733 50.9739 574.176 159.34C606.479 264.014 533.962 365.999 442.064 425.623C364.995 475.626 270.863 455.893 193.524 406.309C93.8313 342.395 -27.3608 259.503 5.48889 145.729C40.0621 25.9857 186.179 -2.77783 310.777 0.20434Z"
          className="transition-colors duration-200"
        />
      </svg>

      {/* Button Content */}
      <span
        className={`relative z-10 font-mouse-memoirs uppercase font-bold tracking-wider inline-flex items-center justify-center gap-2 ${getTextColor()} ${getSizeClasses()}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
