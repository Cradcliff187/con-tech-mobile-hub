import { useState } from 'react';
import { TextField, TextAreaField, SelectField } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calculator, Info } from 'lucide-react';
import { useStakeholders } from '@/hooks/useStakeholders';
import type { EstimateFormData } from '../hooks/useEstimateForm';

interface EstimateFormFieldsProps {
  formData: EstimateFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
}

export const EstimateFormFields = ({ 
  formData, 
  onInputChange,
  errors = {}
}: EstimateFormFieldsProps) => {
  const { stakeholders } = useStakeholders();
  const [calculationMode, setCalculationMode] = useState<'markup' | 'margin'>('markup');

  const stakeholderOptions = stakeholders.map(stakeholder => ({
    value: stakeholder.id,
    label: stakeholder.company_name || stakeholder.contact_person
  }));

  // Calculate derived values
  const labor = parseFloat(formData.labor_cost?.toString() || '0') || 0;
  const material = parseFloat(formData.material_cost?.toString() || '0') || 0;
  const equipment = parseFloat(formData.equipment_cost?.toString() || '0') || 0;
  const percentage = parseFloat(formData.markup_percentage?.toString() || '0') || 0;
  
  const subtotal = labor + material + equipment;
  
  // Calculate total based on mode
  const calculateTotal = (mode: 'markup' | 'margin', percent: number, sub: number) => {
    if (sub === 0) return 0;
    if (mode === 'markup') {
      return sub * (1 + percent / 100);
    } else {
      // Margin mode: total = subtotal / (1 - margin/100)
      if (percent >= 100) return sub; // Prevent division by zero or negative
      return sub / (1 - percent / 100);
    }
  };

  const total = calculateTotal(calculationMode, percentage, subtotal);
  const markupAmount = total - subtotal;
  const grossMargin = total > 0 ? ((total - subtotal) / total * 100) : 0;
  const actualMarkup = subtotal > 0 ? ((total - subtotal) / subtotal * 100) : 0;

  const handleCalculationModeChange = (mode: string) => {
    if (mode === 'markup' || mode === 'margin') {
      setCalculationMode(mode);
      // Recalculate and update total
      const newTotal = calculateTotal(mode, percentage, subtotal);
      onInputChange('amount', newTotal);
    }
  };

  const handleCostChange = (field: string, value: number) => {
    onInputChange(field, value);
    // Trigger recalculation after state update
    setTimeout(() => {
      const newSubtotal = (field === 'labor_cost' ? value : labor) + 
                         (field === 'material_cost' ? value : material) + 
                         (field === 'equipment_cost' ? value : equipment);
      const newTotal = calculateTotal(calculationMode, percentage, newSubtotal);
      onInputChange('amount', newTotal);
    }, 0);
  };

  const handlePercentageChange = (value: number) => {
    onInputChange('markup_percentage', value);
    setTimeout(() => {
      const newTotal = calculateTotal(calculationMode, value, subtotal);
      onInputChange('amount', newTotal);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Basic Information</h3>
        
        <SelectField
          label="Stakeholder"
          required
          value={formData.stakeholder_id}
          onChange={(value) => onInputChange('stakeholder_id', value)}
          options={stakeholderOptions}
          placeholder="Select stakeholder"
          error={errors.stakeholder_id?.[0]}
        />

        <TextField
          label="Estimate Title"
          required
          value={formData.title}
          onChange={(value) => onInputChange('title', value)}
          placeholder="e.g., Kitchen Renovation Project"
          error={errors.title?.[0]}
        />

        <TextAreaField
          label="Description"
          value={formData.description || ''}
          onChange={(value) => onInputChange('description', value)}
          placeholder="Detailed description of work to be performed"
          rows={3}
          error={errors.description?.[0]}
        />
      </div>

      {/* Calculation Mode Toggle */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-slate-900">Pricing Calculation</h3>
        </div>
        
        <ToggleGroup
          type="single"
          value={calculationMode}
          onValueChange={handleCalculationModeChange}
          className="justify-start"
        >
          <ToggleGroupItem value="markup" variant="outline">
            Markup %
          </ToggleGroupItem>
          <ToggleGroupItem value="margin" variant="outline">
            Target Margin %
          </ToggleGroupItem>
        </ToggleGroup>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Markup</strong> is profit added to costs (cost + markup = price). 
            <strong>Margin</strong> is profit as % of final price (price - cost = margin).
          </AlertDescription>
        </Alert>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Cost Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Labor Cost"
            type="number"
            value={formData.labor_cost?.toString() || ''}
            onChange={(value) => handleCostChange('labor_cost', parseFloat(value) || 0)}
            placeholder="0"
            error={errors.labor_cost?.[0]}
          />

          <TextField
            label="Material Cost"
            type="number"
            value={formData.material_cost?.toString() || ''}
            onChange={(value) => handleCostChange('material_cost', parseFloat(value) || 0)}
            placeholder="0"
            error={errors.material_cost?.[0]}
          />

          <TextField
            label="Equipment Cost"
            type="number"
            value={formData.equipment_cost?.toString() || ''}
            onChange={(value) => handleCostChange('equipment_cost', parseFloat(value) || 0)}
            placeholder="0"
            error={errors.equipment_cost?.[0]}
          />

          <TextField
            label={calculationMode === 'markup' ? 'Markup Percentage' : 'Target Margin Percentage'}
            type="number"
            value={formData.markup_percentage?.toString() || ''}
            onChange={(value) => handlePercentageChange(parseFloat(value) || 0)}
            placeholder="0"
            hint={calculationMode === 'markup' ? 'Profit added to costs' : 'Profit as % of final price'}
            error={errors.markup_percentage?.[0]}
          />
        </div>
      </div>

      {/* Cost Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Subtotal (Costs):</span>
              <p className="font-medium">{formatCurrency(subtotal)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Markup Amount:</span>
              <p className="font-medium">{formatCurrency(markupAmount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Actual Markup %:</span>
              <p className="font-medium">{actualMarkup.toFixed(2)}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Gross Margin %:</span>
              <p className="font-medium">{grossMargin.toFixed(2)}%</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Amount (Read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Total Amount <span className="text-red-500">*</span>
        </label>
        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          {formatCurrency(total)}
        </div>
        <p className="text-xs text-slate-500">
          Auto-calculated based on cost breakdown and markup/margin
        </p>
        {errors.amount?.[0] && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <span className="inline-block w-3 h-3 text-red-500">⚠</span>
            {errors.amount[0]}
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Terms and Conditions</h3>
        
        <TextField
          label="Valid Until"
          type="date"
          value={formData.valid_until || ''}
          onChange={(value) => onInputChange('valid_until', value)}
          error={errors.valid_until?.[0]}
        />

        <TextAreaField
          label="Terms and Conditions"
          value={formData.terms_and_conditions || ''}
          onChange={(value) => onInputChange('terms_and_conditions', value)}
          placeholder="Payment terms, warranty information, project timeline, etc."
          rows={4}
          error={errors.terms_and_conditions?.[0]}
        />

        <TextAreaField
          label="Notes"
          value={formData.notes || ''}
          onChange={(value) => onInputChange('notes', value)}
          placeholder="Additional notes or special instructions"
          rows={3}
          error={errors.notes?.[0]}
        />
      </div>
    </div>
  );
};