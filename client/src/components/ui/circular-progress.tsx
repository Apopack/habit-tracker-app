import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.SVGAttributes<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  textSize?: number;
  textFormatter?: (value: number) => string;
  progressColor?: string;
  backgroundColor?: string;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({
    value,
    max = 100,
    size = 48,
    strokeWidth = 3,
    showText = true,
    textSize = 10,
    textFormatter = (value) => `${Math.round(value)}%`,
    progressColor = "currentColor",
    backgroundColor = "#E5E7EB",
    className,
    ...props
  }, ref) => {
    // Normalize value between 0 and max
    const normalizedValue = Math.min(max, Math.max(0, value));
    const percentage = (normalizedValue / max) * 100;
    
    // Calculate SVG parameters
    const radius = (size / 2) - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // Center coordinates
    const center = size / 2;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn("transform -rotate-90", className)}
        {...props}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.35s" }}
        />
        
        {/* Display the text in the center */}
        {showText && (
          <text
            x={center}
            y={center}
            dy=".3em"
            fill="currentColor"
            fontSize={textSize}
            fontWeight="500"
            textAnchor="middle"
            className="transform rotate-90"
            style={{ transform: `rotate(90deg) translateX(0px) translateY(0px)` }}
          >
            {textFormatter(normalizedValue)}
          </text>
        )}
      </svg>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export { CircularProgress };
