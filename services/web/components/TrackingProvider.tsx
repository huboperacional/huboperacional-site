'use client';

import { useEffect } from 'react';
import { captureOnFirstVisit } from '@/lib/tracking';

export function TrackingProvider() {
  useEffect(() => {
    captureOnFirstVisit();
  }, []);
  return null;
}
