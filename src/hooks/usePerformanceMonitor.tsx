
import { useState, useEffect, useRef, useCallback } from 'react';

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  markerCount: number;
  isLowPerformance: boolean;
}

export const usePerformanceMonitor = (enabled: boolean = true) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    markerCount: 0,
    isLowPerformance: false
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderStartTime = useRef(0);
  const animationFrame = useRef<number>();

  const startRenderMeasurement = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  const endRenderMeasurement = useCallback((markerCount: number) => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      markerCount,
      isLowPerformance: renderTime > 16.67 || prev.fps < 30 // 60fps threshold
    }));
  }, [enabled]);

  // FPS calculation
  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (now - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }));
        
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      animationFrame.current = requestAnimationFrame(measureFPS);
    };

    animationFrame.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [enabled]);

  return {
    metrics,
    startRenderMeasurement,
    endRenderMeasurement
  };
};
