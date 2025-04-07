import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StartupErrorHandlerProps {
  children: React.ReactNode;
}

export function StartupErrorHandler({ children }: StartupErrorHandlerProps) {
  const [hasStartupError, setHasStartupError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for the startup error flag in localStorage
    const startupErrorFlag = localStorage.getItem('startup-error');
    if (startupErrorFlag === 'true') {
      setHasStartupError(true);
    }

    // Detect module loading errors - common in client apps
    const handleError = (event: ErrorEvent) => {
      console.log('Error detected:', event.message);

      // Capture more types of errors that might indicate client-side issues
      if (
        event.message.includes('module') ||
        event.message.includes('chunk') ||
        event.message.includes('import') ||
        event.message.includes('failed to load') ||
        event.message.includes('cannot find') ||
        event.message.includes('undefined') ||
        event.message.includes('is not a function')
      ) {
        console.log('Setting startup error flag due to detected error');
        localStorage.setItem('startup-error', 'true');
        setHasStartupError(true);
      }
    };

    // Add more comprehensive error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      console.log('Unhandled rejection:', event.reason);
      if (typeof event.reason === 'string' &&
          (event.reason.includes('module') ||
           event.reason.includes('chunk') ||
           event.reason.includes('network'))) {
        localStorage.setItem('startup-error', 'true');
        setHasStartupError(true);
      }
    });

    // Simulate an error for testing (remove in production)
    if (window.location.search.includes('simulate-error')) {
      console.log('Simulating client-side error');
      localStorage.setItem('startup-error', 'true');
      setHasStartupError(true);
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, []);

  const handleViewTroubleshooting = () => {
    navigate('/troubleshooting');
  };

  const handleDismiss = () => {
    localStorage.removeItem('startup-error');
    setHasStartupError(false);
  };

  return (
    <>
      {hasStartupError && (
        <Alert variant="destructive" className="fixed top-20 right-4 z-50 max-w-md shadow-lg">
          <Info className="h-4 w-4" />
          <AlertTitle>Startup Issues Detected</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              We detected potential issues with your application startup. This might be related to outdated or corrupted node modules.
            </p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleViewTroubleshooting}>
                View Troubleshooting Guide
              </Button>
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
}