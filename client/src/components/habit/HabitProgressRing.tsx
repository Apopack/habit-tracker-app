import { useMemo } from "react";

interface HabitProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  textSize?: number;
}

export default function HabitProgressRing({ 
  percentage, 
  size = 48, 
  strokeWidth = 3,
  textSize = 10
}: HabitProgressRingProps) {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = useMemo(() => {
    return Math.min(100, Math.max(0, percentage));
  }, [percentage]);

  // Calculate SVG parameters
  const radius = useMemo(() => {
    return (size / 2) - (strokeWidth / 2);
  }, [size, strokeWidth]);
  
  const circumference = useMemo(() => {
    return 2 * Math.PI * radius;
  }, [radius]);
  
  const strokeDashoffset = useMemo(() => {
    return circumference - (normalizedPercentage / 100) * circumference;
  }, [circumference, normalizedPercentage]);

  // Center coordinates
  const center = size / 2;

  return (
    <svg className="progress-ring" width={size} height={size}>
      {/* Background circle */}
      <circle 
        className="progress-ring-circle" 
        stroke="#E5E7EB" 
        strokeWidth={strokeWidth} 
        fill="transparent" 
        r={radius} 
        cx={center} 
        cy={center} 
      />
      
      {/* Progress circle */}
      <circle 
        className="progress-ring-circle" 
        stroke="#10B981" 
        strokeWidth={strokeWidth} 
        fill="transparent" 
        r={radius} 
        cx={center} 
        cy={center} 
        strokeDasharray={circumference} 
        strokeDashoffset={strokeDashoffset}
        style={{
          strokeLinecap: 'round',
          transition: 'stroke-dashoffset 0.35s',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%'
        }}
      />
      
      {/* Percentage text */}
      <text 
        x={center} 
        y={center + textSize / 3} 
        textAnchor="middle" 
        fontSize={textSize} 
        fill="#111827" 
        fontWeight="500"
      >
        {Math.round(normalizedPercentage)}%
      </text>
    </svg>
  );
}
