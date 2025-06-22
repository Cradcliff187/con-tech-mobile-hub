
import { Users, Clock, AlertTriangle } from 'lucide-react';

export const getUtilizationStatus = (rate: number) => {
  if (rate >= 85) {
    return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Excellent',
      icon: Users
    };
  } else if (rate >= 70) {
    return {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Good',
      icon: Clock
    };
  } else {
    return {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Needs Attention',
      icon: AlertTriangle
    };
  }
};
