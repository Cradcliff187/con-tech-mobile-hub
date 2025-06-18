import React, { useState, useEffect } from 'react';
import { Task } from '@/types/database';
import { Settings, X, Eye, EyeOff, Wifi, WifiOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { subscriptionManager } from '@/services/subscription';
import { useAuth } from '@/hooks/useAuth';
import { ColumnDebugInfo } from './ColumnDebugInfo';
import { GridDebugLines } from './GridDebugLines';
import { PerformanceDebugPanel } from './PerformanceDebugPanel';

interface GanttDebugOverlayProps {
  isVisible: boolean;
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  debugPreferences: {
    showColumnInfo: boolean;
    showTaskDetails: boolean;
    showGridLines: boolean;
    showPerformanceMetrics: boolean;
    showScrollInfo: boolean;
    showSubscriptions: boolean;
    showAuthState: boolean;
  };
  onUpdatePreference: (key: string, value: boolean) => void;
  optimisticUpdatesCount?: number;
  isDragging?: boolean;
  className?: string;
}

export const GanttDebugOverlay: React.FC<GanttDebugOverlayProps> = ({
  isVisible,
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  debugPreferences,
  onUpdatePreference,
  optimisticUpdatesCount = 0,
  isDragging = false,
  className = ''
}) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    activeCount: number;
    channels: Array<{ key: string; callbackCount: number; status: string; config: any }>;
  }>({ activeCount: 0, channels: [] });
  
  const { user, session, loading } = useAuth();

  // Update subscription info every second when visible
  useEffect(() => {
    if (!isVisible || process.env.NODE_ENV !== 'development') return;

    const updateSubscriptionInfo = () => {
      const activeCount = subscriptionManager.getActiveChannelCount();
      const channels = subscriptionManager.getChannelInfo();
      setSubscriptionInfo({ activeCount, channels });
    };

    // Initial update
    updateSubscriptionInfo();

    // Set up interval for real-time updates
    const interval = setInterval(updateSubscriptionInfo, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const togglePreference = (key: keyof typeof debugPreferences) => {
    onUpdatePreference(key, !debugPreferences[key]);
  };

  return (
    <div className={`absolute inset-0 pointer-events-none z-50 ${className}`}>
      {/* Grid Debug Lines */}
      {debugPreferences.showGridLines && (
        <GridDebugLines
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
      )}

      {/* Column Debug Info */}
      {debugPreferences.showColumnInfo && (
        <ColumnDebugInfo
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
      )}

      {/* Mobile Debug Panel */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-96 pointer-events-auto">
        <div className="bg-black/90 text-white text-xs rounded-lg shadow-lg overflow-hidden">
          {/* Debug Header */}
          <div className="flex items-center justify-between p-3 bg-red-900/50 border-b border-red-800/50">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs px-2 py-1">
                DEBUG
              </Badge>
              <span className="font-medium">Gantt Debug Mode</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <Settings size={12} />
            </Button>
          </div>

          {/* Debug Settings */}
          <Collapsible open={isSettingsExpanded} onOpenChange={setIsSettingsExpanded}>
            <CollapsibleContent className="p-3 border-b border-gray-800">
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-300 mb-2">Debug Overlays</div>
                {Object.entries(debugPreferences).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => togglePreference(key as keyof typeof debugPreferences)}
                    className="flex items-center justify-between w-full text-xs p-2 rounded hover:bg-white/10 transition-colors"
                  >
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    {value ? <Eye size={12} className="text-green-400" /> : <EyeOff size={12} className="text-gray-500" />}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Auth State Monitoring */}
          {debugPreferences.showAuthState && (
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Users size={12} className="text-blue-400" />
                <span className="text-xs font-medium text-gray-300">Auth State</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <div className="flex items-center gap-1">
                    {loading ? (
                      <span className="text-yellow-400">Loading...</span>
                    ) : user ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400">Authenticated</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-red-400">Not authenticated</span>
                      </>
                    )}
                  </div>
                </div>
                {user && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-xs font-mono">{user.id.slice(0, 8)}...</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Session:</span>
                  <span className={session ? "text-green-400" : "text-red-400"}>
                    {session ? "Active" : "None"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Monitoring */}
          {debugPreferences.showSubscriptions && (
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                {subscriptionInfo.activeCount > 0 ? (
                  <Wifi size={12} className="text-green-400" />
                ) : (
                  <WifiOff size={12} className="text-red-400" />
                )}
                <span className="text-xs font-medium text-gray-300">Subscriptions</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Channels:</span>
                  <Badge 
                    variant={subscriptionInfo.activeCount > 0 ? "default" : "secondary"}
                    className="text-xs px-2 py-0"
                  >
                    {subscriptionInfo.activeCount}
                  </Badge>
                </div>
                {subscriptionInfo.channels.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Channel Details:</div>
                    <div className="max-h-20 overflow-y-auto space-y-1">
                      {subscriptionInfo.channels.map((channel, index) => (
                        <div key={index} className="text-xs bg-gray-800/50 p-1 rounded">
                          <div className="flex justify-between">
                            <span className="font-mono text-gray-300">
                              {channel.config.table || 'unknown'}
                            </span>
                            <span className={`text-xs ${
                              channel.status === 'SUBSCRIBED' ? 'text-green-400' : 
                              channel.status === 'CHANNEL_ERROR' ? 'text-red-400' : 
                              'text-yellow-400'
                            }`}>
                              {channel.status}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Callbacks: {channel.callbackCount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {debugPreferences.showPerformanceMetrics && (
            <div className="p-3 border-b border-gray-800">
              <div className="text-xs font-medium text-gray-300 mb-2">Performance</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimistic Updates:</span>
                  <Badge 
                    variant={optimisticUpdatesCount > 0 ? "destructive" : "secondary"}
                    className="text-xs px-2 py-0"
                  >
                    {optimisticUpdatesCount}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Drag Active:</span>
                  <div className="flex items-center gap-1">
                    {isDragging ? (
                      <>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-orange-400">Yes</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-gray-500">No</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <PerformanceDebugPanel
                tasks={tasks}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                viewMode={viewMode}
              />
            </div>
          )}

          {/* Basic Debug Info */}
          <div className="p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">View Mode:</span>
              <span className="text-orange-400 font-medium">{viewMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tasks:</span>
              <span>{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Timeline:</span>
              <span>{Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))} days</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800">
              Development mode only - not visible in production
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
