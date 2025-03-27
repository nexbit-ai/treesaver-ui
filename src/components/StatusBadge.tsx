
import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'pending' | 'uploaded' | 'review' | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  pending: {
    color: 'bg-status-pending/20 text-status-pending border-status-pending/30',
    label: 'Pending'
  },
  uploaded: {
    color: 'bg-status-uploaded/20 text-status-uploaded border-status-uploaded/30',
    label: 'Uploaded'
  },
  review: {
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
  const { color, label } = statusConfig[status];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300',
        color,
        status === 'review' && 'animate-pulse-subtle',
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
