import { useEffect, useState } from 'react';

/**
 * Full-screen notice while the (free-tier) API server wakes up.
 * Driven by the "server-status" event fired from services/api.js, so it only
 * appears when a request actually failed because the server was unreachable.
 */
const ServerStatus = () => {
  const [status, setStatus] = useState('up');

  useEffect(() => {
    const onStatus = (e) => setStatus(e.detail);
    window.addEventListener('server-status', onStatus);
    return () => window.removeEventListener('server-status', onStatus);
  }, []);

  if (status === 'up') return null;

  return (
    <div
      role="alert"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black/90 px-6 text-center text-white backdrop-blur-md"
    >
      {status === 'waking' ? (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-violet-500 motion-reduce:animate-none" />
          <h2 className="text-2xl font-bold">Waking up the server…</h2>
          <p className="max-w-sm text-white/60">
            The free server sleeps when idle. This can take up to a minute, and it will continue by itself.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">Server is unavailable</h2>
          <p className="max-w-sm text-white/60">We couldn't reach the server. Please try again in a moment.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-violet-500 px-6 py-2 font-semibold text-white"
          >
            Retry
          </button>
        </>
      )}
    </div>
  );
};

export default ServerStatus;
