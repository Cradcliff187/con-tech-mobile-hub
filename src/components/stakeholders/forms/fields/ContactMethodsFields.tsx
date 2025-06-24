
import { Label } from '@/components/ui/label';
import { EmailInput } from '@/components/common/EmailInput';
import { PhoneInput } from '@/components/common/PhoneInput';
import { AlertTriangle } from 'lucide-react';

interface ContactMethodsFieldsProps {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  emailError?: string;
  phoneError?: string;
}

export const ContactMethodsFields = ({ 
  email, 
  phone, 
  onEmailChange, 
  onPhoneChange, 
  emailError, 
  phoneError 
}: ContactMethodsFieldsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <EmailInput
          value={email || ''}
          onChange={onEmailChange}
          className={emailError ? 'border-red-500' : ''}
          placeholder="Enter email address"
        />
        {emailError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {emailError}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <PhoneInput
          value={phone || ''}
          onChange={onPhoneChange}
          placeholder="Enter phone number"
          className={phoneError ? 'border-red-500' : ''}
        />
        {phoneError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {phoneError}
          </p>
        )}
      </div>
    </div>
  );
};
