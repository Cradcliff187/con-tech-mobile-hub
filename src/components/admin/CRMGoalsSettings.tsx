import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCompanySettings, CRMGoals } from '@/hooks/useCompanySettings';
import { Target, DollarSign, Users, FileText, Gavel, RotateCcw } from 'lucide-react';

export const CRMGoalsSettings = () => {
  const { settings, loading, updateCRMGoals } = useCompanySettings();
  const [formData, setFormData] = useState<CRMGoals>(settings.crm_monthly_goals);
  const [saving, setSaving] = useState(false);

  // Update form data when settings change
  useEffect(() => {
    setFormData(settings.crm_monthly_goals);
  }, [settings.crm_monthly_goals]);

  const handleInputChange = (field: keyof CRMGoals, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCRMGoals(formData);
    setSaving(false);
  };

  const handleReset = () => {
    setFormData(settings.crm_monthly_goals);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="h-5 w-5" />
            CRM Monthly Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Target className="h-5 w-5" />
          CRM Monthly Goals
        </CardTitle>
        <p className="text-sm text-slate-600">
          Set monthly targets for your sales pipeline and revenue goals.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Target */}
          <div className="space-y-3">
            <Label htmlFor="revenue_target" className="flex items-center gap-2 text-slate-700">
              <DollarSign className="h-4 w-4 text-green-600" />
              Monthly Revenue Target
            </Label>
            <Input
              id="revenue_target"
              type="number"
              placeholder="100000"
              value={formData.revenue_target}
              onChange={(e) => handleInputChange('revenue_target', e.target.value)}
              className="text-right"
              min="0"
              step="1000"
            />
            <p className="text-xs text-slate-500">
              Target monthly revenue in dollars
            </p>
          </div>

          {/* Leads Target */}
          <div className="space-y-3">
            <Label htmlFor="leads_target" className="flex items-center gap-2 text-slate-700">
              <Users className="h-4 w-4 text-blue-600" />
              Monthly Leads Target
            </Label>
            <Input
              id="leads_target"
              type="number"
              placeholder="25"
              value={formData.leads_target}
              onChange={(e) => handleInputChange('leads_target', e.target.value)}
              className="text-right"
              min="0"
            />
            <p className="text-xs text-slate-500">
              Target number of new leads per month
            </p>
          </div>

          {/* Estimates Target */}
          <div className="space-y-3">
            <Label htmlFor="estimates_target" className="flex items-center gap-2 text-slate-700">
              <FileText className="h-4 w-4 text-amber-600" />
              Monthly Estimates Target
            </Label>
            <Input
              id="estimates_target"
              type="number"
              placeholder="15"
              value={formData.estimates_target}
              onChange={(e) => handleInputChange('estimates_target', e.target.value)}
              className="text-right"
              min="0"
            />
            <p className="text-xs text-slate-500">
              Target number of estimates to create per month
            </p>
          </div>

          {/* Bids Target */}
          <div className="space-y-3">
            <Label htmlFor="bids_target" className="flex items-center gap-2 text-slate-700">
              <Gavel className="h-4 w-4 text-purple-600" />
              Monthly Bids Target
            </Label>
            <Input
              id="bids_target"
              type="number"
              placeholder="10"
              value={formData.bids_target}
              onChange={(e) => handleInputChange('bids_target', e.target.value)}
              className="text-right"
              min="0"
            />
            <p className="text-xs text-slate-500">
              Target number of bids to submit per month
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label htmlFor="conversion_rate_target" className="flex items-center gap-2 text-slate-700">
            <Target className="h-4 w-4 text-orange-600" />
            Conversion Rate Target (%)
          </Label>
          <Input
            id="conversion_rate_target"
            type="number"
            placeholder="20"
            value={formData.conversion_rate_target}
            onChange={(e) => handleInputChange('conversion_rate_target', e.target.value)}
            className="text-right max-w-xs"
            min="0"
            max="100"
          />
          <p className="text-xs text-slate-500">
            Target overall conversion rate from leads to projects (percentage)
          </p>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Goals'}
          </Button>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Note:</strong> These goals will be used throughout the CRM dashboard 
            to calculate progress indicators and generate performance reports. Changes 
            take effect immediately across all CRM metrics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};