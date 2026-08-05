import { motion, AnimatePresence } from 'framer-motion';

/**
 * Generic yes/no confirmation modal — used for destructive actions
 * (deleting a song, removing a playlist, etc.) across the app.
 */
const ConfirmDialog = ({ title, message, confirmLabel = 'Confirm', isDangerous = true, onConfirm, onCancel, isLoading }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="glass w-full max-w-sm rounded-2xl p-6 shadow-card"
        >
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm text-white/60">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-full px-5 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50 ${
                isDangerous ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-brand'
              }`}
            >
              {isLoading ? 'Please wait...' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
