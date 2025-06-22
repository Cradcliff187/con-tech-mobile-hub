
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from 'lucide-react';
import { CircularProgressSkeleton } from '../skeletons/CircularProgressSkeleton';
import { MetricCardSkeleton } from '../skeletons/MetricCardSkeleton';

interface ResourceUtilizationLoadingProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ResourceUtilizationLoading = ({ 
  activeTab, 
  onTabChange 
}: ResourceUtilizationLoadingProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-600" />
          Resource Utilization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="labor">Labor</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CircularProgressSkeleton size={120} />
            <div className="space-y-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton showProgress />
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
