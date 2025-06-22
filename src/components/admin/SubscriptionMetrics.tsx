
import { useState, useEffect } from 'react';
import { Activity, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';
import { subscriptionManager } from '@/services/subscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const SubscriptionMetrics = () => {
  const [healthStatus, setHealthStatus] = useState(subscriptionManager.getHealthStatus());
  const [channelInfo, setChannelInfo] = useState(subscriptionManager.getChannelInfo());

  const refreshData = () => {
    setHealthStatus(subscriptionManager.getHealthStatus());
    setChannelInfo(subscriptionManager.getChannelInfo());
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getHealthBadgeVariant = () => {
    if (healthStatus.connectionErrors > 0) return 'destructive';
    if (healthStatus.reconnectionAttempts > 0) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Real-time Subscription Health</CardTitle>
            <CardDescription>Monitor subscription performance and connection status</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Active Channels</p>
                <p className="text-2xl font-bold">{healthStatus.activeChannels}</p>
                <p className="text-xs text-slate-500">/ {healthStatus.channelUtilization.split('/')[1]} max</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Subscriptions</p>
                <p className="text-2xl font-bold">{healthStatus.totalSubscriptions}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Reconnection Attempts</p>
                <p className="text-2xl font-bold">{healthStatus.reconnectionAttempts}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Connection Errors</p>
                <p className="text-2xl font-bold">{healthStatus.connectionErrors}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Overall Health Status</p>
                <p className="text-xs text-slate-500">
                  Last checked: {healthStatus.lastHealthCheck.toLocaleString()}
                </p>
              </div>
              <Badge variant={getHealthBadgeVariant()}>
                {healthStatus.isHealthy ? 'Healthy' : 'Issues Detected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {channelInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Channels</CardTitle>
            <CardDescription>Detailed information about each active subscription channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {channelInfo.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{channel.config.table}</p>
                    <p className="text-xs text-slate-500">
                      {channel.config.filter ? 
                        `Filtered: ${JSON.stringify(channel.config.filter)}` : 
                        'No filters'
                      }
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge 
                      variant={channel.status === 'SUBSCRIBED' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {channel.status}
                    </Badge>
                    <p className="text-xs text-slate-500">
                      {channel.callbackCount} callback{channel.callbackCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
