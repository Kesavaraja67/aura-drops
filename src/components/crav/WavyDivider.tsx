"use client";

import React from "react";

interface WavyDividerProps {
  fillColor: string;
  inverted?: boolean;
  className?: string;
}

export function WavyDivider({ fillColor, inverted = false, className = "" }: WavyDividerProps) {
  if (inverted) {
    return (
      <div className={`w-full overflow-hidden leading-none pointer-events-none ${className}`}>
        <svg
          className="block w-full h-[60px] sm:h-[100px] md:h-[140px]"
          viewBox="0 0 1536 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M1536,300 H-1 V135 S184.32,235 460.8,145 S860.16,195 1121.28,163 S1413.12,195 1536,195 V300"
            fill={fillColor}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden leading-none pointer-events-none ${className}`}>
      <svg
        className="block w-full h-[60px] sm:h-[100px] md:h-[140px]"
        viewBox="0 0 1536 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M1536,0 H-1 V135 S184.32,65 460.8,155 S860.16,105 1121.28,137 S1413.12,105 1536,105 V0"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}
