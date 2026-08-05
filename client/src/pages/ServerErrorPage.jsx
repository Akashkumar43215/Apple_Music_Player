const ServerErrorPage = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-dark px-4 text-center">
      <h1 className="bg-gradient-brand bg-clip-text text-8xl font-black text-transparent">500</h1>
      <p className="mt-4 text-xl font-semibold text-white">Something skipped a track.</p>
      <p className="mt-2 max-w-sm text-white/50">
        An unexpected error occurred on our end. Please try again shortly.
      </p>
      <button onClick={() => window.location.reload()} className="btn-primary mt-8">
        Reload
      </button>
    </div>
  );
};

export default ServerErrorPage;
