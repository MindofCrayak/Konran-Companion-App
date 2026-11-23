import { useState, useEffect, useCallback } from 'react';
import { GlobePin } from '../types/slabletOS';

export type LKBridgeStatus = 'LOADING' | 'LIVE' | 'CREDENTIALS_REQUIRED';

export interface UseGlobePinsResult {
  pins: GlobePin[];
  loading: boolean;
  bridgeStatus: LKBridgeStatus;
  diagnostic: string | null;
  errorDetail: string | null;
  refreshPins: () => Promise<void>;
}

/**
 * Live LegendKeeper v3 Globe Pin Loader (Zero Mock / Placeholder Pins)
 * Connects directly to `/api/lore/legendkeeper?pins=1`.
 * When `LK_API_KEY` / `LEGENDKEEPER_API_KEY` or root map ID is missing or unauthorized,
 * surfaces `[LK BRIDGE: CREDENTIALS REQUIRED]` diagnostic status with an empty pin array.
 */
export function useGlobePins(): UseGlobePinsResult {
  const [pins, setPins] = useState<GlobePin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bridgeStatus, setBridgeStatus] = useState<LKBridgeStatus>('LOADING');
  const [diagnostic, setDiagnostic] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const refreshPins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lore/legendkeeper?pins=1');
      if (!res.ok) {
        setPins([]);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnostic('[LK BRIDGE: CREDENTIALS REQUIRED]');
        setErrorDetail(`Cloudflare Worker /api/lore/legendkeeper returned HTTP ${res.status}.`);
        return;
      }
      const json: any = await res.json();
      if (json.status === 'CREDENTIALS_REQUIRED' || json.diagnostic === '[LK BRIDGE: CREDENTIALS REQUIRED]') {
        setPins([]);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnostic('[LK BRIDGE: CREDENTIALS REQUIRED]');
        setErrorDetail(json.error || 'Missing LEGENDKEEPER_API_KEY / LK_API_KEY or root map resource.');
        return;
      }
      if (Array.isArray(json.data)) {
        setPins(json.data);
        setBridgeStatus('LIVE');
        setDiagnostic(null);
        setErrorDetail(null);
      } else {
        setPins([]);
        setBridgeStatus('CREDENTIALS_REQUIRED');
        setDiagnostic('[LK BRIDGE: CREDENTIALS REQUIRED]');
        setErrorDetail('Unexpected response payload from LegendKeeper bridge.');
      }
    } catch (err: any) {
      setPins([]);
      setBridgeStatus('CREDENTIALS_REQUIRED');
      setDiagnostic('[LK BRIDGE: CREDENTIALS REQUIRED]');
      setErrorDetail(err?.message || 'LegendKeeper Worker endpoint unreachable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPins();
  }, [refreshPins]);

  return {
    pins,
    loading,
    bridgeStatus,
    diagnostic,
    errorDetail,
    refreshPins,
  };
}

export default useGlobePins;
