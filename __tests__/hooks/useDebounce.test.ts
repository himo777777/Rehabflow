import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );

    // Rapid updates
    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(200); });

    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(200); });

    rerender({ value: 'd' });

    // Value should still be 'a' since we keep resetting
    expect(result.current).toBe('a');

    // Wait for debounce
    act(() => { vi.advanceTimersByTime(500); });

    expect(result.current).toBe('d');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call multiple times
    result.current('a');
    result.current('b');
    result.current('c');

    expect(callback).not.toHaveBeenCalled();

    // Wait for debounce
    act(() => { vi.advanceTimersByTime(500); });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('should handle multiple arguments', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current('arg1', 'arg2', 123);

    act(() => { vi.advanceTimersByTime(300); });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });
});

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call immediately on first call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    result.current();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    // First call - should execute
    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    // Immediate second call - should be throttled
    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    // After throttle period
    act(() => { vi.advanceTimersByTime(500); });

    result.current();
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
