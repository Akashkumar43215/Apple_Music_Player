import { FiWifiOff } from 'react-icons/fi';

/** Shown instead of the app when it is opened without a network connection while signed in. */
const OfflineScreen = ({ onRetry }) => (
  <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0f] px-6 text-center text-white">
    <FiWifiOff size={48} aria-hidden="true" className="text-white/60" />
    <h1 className="text-2xl font-bold">You're offline</h1>
    <p className="max-w-sm text-white/60">Music needs an internet connection. You're still signed in, and this page will continue by itself once you're back online.</p>
    <button onClick={onRetry} className="rounded-full bg-violet-500 px-6 py-2 font-semibold text-white">
      Try again
    </button>
  </div>
);

export default OfflineScreen;
