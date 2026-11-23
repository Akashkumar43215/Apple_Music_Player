/**
 * Full-screen loading spinner, used while checking auth state / initial data fetches.
 */
const Spinner = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-violet-500" />
    </div>
  );
};

export default Spinner;
