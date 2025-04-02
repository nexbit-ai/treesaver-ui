import React from 'react';
import { cn } from '@/lib/utils';
import { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, { color: string; label: string }> = {
  pending: {
    color: 'bg-status-pending/20 text-status-pending border-status-pending/30',
    label: 'Pending'
  },
  InReview: {
    color: 'bg-status-review/20 text-status-review border-status-review/30',
    label: 'In Review'
  },
  approved: {
    color: 'bg-status-approved/20 text-status-approved border-status-approved/30',
    label: 'Approved'
  },
  rejected: {
    color: 'bg-status-rejected/20 text-status-rejected border-status-rejected/30',
    label: 'Rejected'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { color, label } = statusStyles[status];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300',
        color,
        status === 'rejected' && 'animate-pulse-subtle', // Changed from 'review' to 'rejected'
        className
      )}
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
