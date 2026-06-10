/**
 * usePushNotifications hook
 * Handles Service Worker registration, push subscription,
 * and communication with the backend VAPID endpoint.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';

// Convert VAPID base64 URL-safe string to Uint8Array for subscription
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const getDeviceHint = () => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'iOS Safari';
  if (/Android/.test(ua)) return 'Android';
  if (/Chrome/.test(ua)) return 'Chrome';
  if (/Firefox/.test(ua)) return 'Firefox';
  return 'Browser';
};

export default function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscribed, setSubscribed] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Register Service Worker on mount
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setError('Service Workers are not supported in this browser.');
      return;
    }
    if (!('PushManager' in window)) {
      setError('Push notifications are not supported in this browser.');
      return;
    }

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[Push] Service Worker registered:', reg.scope);
        setSwReady(true);
        // Check if already subscribed
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        if (sub) {
          setSubscribed(true);
          console.log('[Push] Already subscribed');
        }
      })
      .catch((err) => {
        console.error('[Push] SW registration failed:', err);
        setError('Failed to register Service Worker.');
      });
  }, []);

  /**
   * Request permission + subscribe to push
   */
  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setError('Notification permission denied. Please allow notifications in your browser settings.');
        return false;
      }

      // 2. Get VAPID public key from backend
      const keyRes = await api.get('/boarding-pass/vapid-public-key');
      const vapidPublicKey = keyRes.data.publicKey;

      // 3. Get service worker registration
      const reg = await navigator.serviceWorker.ready;

      // 4. Subscribe
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 5. Send subscription to backend
      await api.post('/boarding-pass/push-subscribe', {
        subscription: subscription.toJSON(),
        deviceHint: getDeviceHint(),
      });

      setSubscribed(true);
      return true;
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      setError(err.message || 'Failed to subscribe to push notifications.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Unsubscribe from push
   */
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.post('/boarding-pass/push-unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send test push to verify setup
   */
  const sendTestPush = useCallback(async () => {
    try {
      const res = await api.post('/boarding-pass/test-push');
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Test push failed');
    }
  }, []);

  const supported = 'serviceWorker' in navigator && 'PushManager' in window;

  return { permission, subscribed, swReady, loading, error, supported, subscribe, unsubscribe, sendTestPush };
}
