/**
 * Generic empty-state block — icon, headline, message, and an optional
 * action button. Reused for "no songs", "no search results", empty
 * playlists, etc. across the app.
 */
const EmptyState = ({ icon: Icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <Icon className="h-6 w-6 text-white/40" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {message && <p className="max-w-sm text-sm text-white/50">{message}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
