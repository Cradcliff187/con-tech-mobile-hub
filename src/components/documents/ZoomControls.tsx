
import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange
}) => {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomChange(Math.max(25, zoom - 25))}
        disabled={zoom <= 25}
      >
        <ZoomOut size={16} />
      </Button>
      <span className="text-sm text-slate-600 min-w-[3rem] text-center">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomChange(Math.min(200, zoom + 25))}
        disabled={zoom >= 200}
      >
        <ZoomIn size={16} />
      </Button>
    </>
  );
};
