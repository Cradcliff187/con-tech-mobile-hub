
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface CalculationCache {
  [key: string]: any;
}

export const useDebouncedCalculations = <T,>(
  calculation: () => T,
  dependencies: any[],
  delay: number = 16 // 60fps = 16.67ms
) => {
  const [result, setResult] = useState<T | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const cache = useRef<CalculationCache>({});
  const calculationRef = useRef<() => void>();

  // Create cache key from dependencies
  const cacheKey = useMemo(() => {
    return JSON.stringify(dependencies);
  }, dependencies);

  // Debounced dependency change detection
  const debouncedDeps = useDebounce(dependencies, delay);

  const performCalculation = useCallback(() => {
    // Check cache first
    if (cache.current[cacheKey]) {
      setResult(cache.current[cacheKey]);
      return;
    }

    setIsCalculating(true);
    
    // Use requestAnimationFrame for smooth calculations
    requestAnimationFrame(() => {
      try {
        const newResult = calculation();
        cache.current[cacheKey] = newResult;
        setResult(newResult);
      } catch (error) {
        console.error('Calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    });
  }, [calculation, cacheKey]);

  // Store calculation reference for cancellation
  calculationRef.current = performCalculation;

  useEffect(() => {
    performCalculation();
  }, [debouncedDeps, performCalculation]);

  // Clear cache when it gets too large
  useEffect(() => {
    const cacheSize = Object.keys(cache.current).length;
    if (cacheSize > 100) {
      cache.current = {};
    }
  }, [cacheKey]);

  return { result, isCalculating };
};

// Helper hook for memoized calculations with shallow comparison
export const useMemoizedCalculation = <T,>(
  calculation: () => T,
  dependencies: any[]
): T => {
  const prevDeps = useRef<any[]>([]);
  const prevResult = useRef<T>();

  // Shallow comparison
  const depsChanged = dependencies.some((dep, index) => 
    dep !== prevDeps.current[index]
  );

  if (depsChanged || !prevResult.current) {
    prevResult.current = calculation();
    prevDeps.current = dependencies;
  }

  return prevResult.current;
};
