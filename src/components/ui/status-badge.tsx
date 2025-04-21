import React from 'react';
import { cn } from '@/lib/utils';
import { StatusType, STATUS_DISPLAY_MAP, STATUS_COLOR_MAP } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  // Get display text and colors, with fallback for unknown statuses
  const displayText = STATUS_DISPLAY_MAP[status] || status;
  const colors = STATUS_COLOR_MAP[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        status === 'PUSH_BACK' && 'animate-pulse',
        className
      )}
      aria-label={`Status: ${displayText}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
