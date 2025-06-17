
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class MarkerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Marker Error Boundary caught an error:', error, errorInfo);
    
    // Report to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log performance impact
    console.warn('Marker rendering failed, falling back to simple display');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-red-700">Marker display error</span>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="h-6 px-2 text-xs"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple fallback marker component
export const MarkerFallback: React.FC<{ position: { x: number; y: number } }> = ({ 
  position 
}) => (
  <div
    className="absolute w-4 h-4 bg-gray-400 rounded-full border border-white"
    style={{
      left: `${position.x}%`,
      top: `${position.y}px`,
      transform: 'translate(-50%, 0)'
    }}
  />
);
