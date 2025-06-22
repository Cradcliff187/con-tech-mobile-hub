
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, Activity } from 'lucide-react';
import { subscriptionManager } from '@/services/subscription';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { config } from '@/config/environment';

interface SubscriptionStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const SubscriptionStatusIndicator = ({ 
  showDetails = false, 
  className = "" 
}: SubscriptionStatusIndicatorProps) => {
  const [healthStatus, setHealthStatus] = useState(subscriptionManager.getHealthStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show indicator in development mode or when there are issues
    const shouldShow = config.app.isDevelopment || !healthStatus.isHealthy;
    setIsVisible(shouldShow);

    const interval = setInterval(() => {
      const newStatus = subscriptionManager.getHealthStatus();
      setHealthStatus(newStatus);
      
      const shouldShowNow = config.app.isDevelopment || !newStatus.isHealthy;
      setIsVisible(shouldShowNow);
    }, 2000);

    return () => clearInterval(interval);
  }, [healthStatus.isHealthy]);

  if (!isVisible) return null;

  const getStatusIcon = () => {
    if (healthStatus.connectionErrors > 0) {
      return <WifiOff className="h-3 w-3 text-red-500" />;
    }
    if (healthStatus.reconnectionAttempts > 0) {
      return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    }
    return <Wifi className="h-3 w-3 text-green-500" />;
  };

  const getStatusColor = () => {
    if (healthStatus.connectionErrors > 0) return 'destructive';
    if (healthStatus.reconnectionAttempts > 0) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (healthStatus.connectionErrors > 0) return 'Connection Issues';
    if (healthStatus.reconnectionAttempts > 0) return 'Reconnecting';
    return 'Connected';
  };

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div>Status: {getStatusText()}</div>
      <div>Active Channels: {healthStatus.channelUtilization}</div>
      <div>Total Subscriptions: {healthStatus.totalSubscriptions}</div>
      {healthStatus.reconnectionAttempts > 0 && (
        <div>Reconnection Attempts: {healthStatus.reconnectionAttempts}</div>
      )}
      {healthStatus.connectionErrors > 0 && (
        <div>Connection Errors: {healthStatus.connectionErrors}</div>
      )}
      <div className="text-slate-400">
        Last Check: {healthStatus.lastHealthCheck.toLocaleTimeString()}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
            <Badge 
              variant={getStatusColor()}
              className="flex items-center gap-1 px-2 py-1 cursor-help"
            >
              {getStatusIcon()}
              {showDetails && (
                <>
                  <span className="text-xs">{getStatusText()}</span>
                  {config.app.isDevelopment && (
                    <span className="text-xs opacity-75">
                      ({healthStatus.activeChannels})
                    </span>
                  )}
                </>
              )}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
