
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access';
  timestamp: Date;
  userId?: string;
  details?: any;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  const logSecurityEvent = useCallback((type: SecurityEvent['type'], details?: any) => {
    const event: SecurityEvent = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      userId: user?.id,
      details
    };

    setSecurityEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    
    // Log to console for monitoring
    console.log('Security Event:', event);
    
    // In production, you would send this to a monitoring service
    
    return event;
  }, [user?.id]);

  const getFailedLoginAttempts = useCallback((timeWindow: number = 3600000) => {
    const since = new Date(Date.now() - timeWindow);
    return securityEvents.filter(
      event => event.type === 'failed_login' && event.timestamp > since
    ).length;
  }, [securityEvents]);

  const isRateLimited = useCallback(() => {
    return getFailedLoginAttempts() >= 5; // Max 5 failed attempts per hour
  }, [getFailedLoginAttempts]);

  useEffect(() => {
    if (user) {
      logSecurityEvent('login');
    }
    
    return () => {
      if (user) {
        logSecurityEvent('logout');
      }
    };
  }, [user, logSecurityEvent]);

  return {
    securityEvents,
    logSecurityEvent,
    getFailedLoginAttempts,
    isRateLimited
  };
};
