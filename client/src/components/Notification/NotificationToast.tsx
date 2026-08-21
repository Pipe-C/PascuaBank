import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  title: string;
  description: string;
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function NotificationToast({ toast, onClose }: NotificationToastProps) {
  return (
    <div
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md max-w-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor:
                toast.type === 'success'
                  ? 'rgba(4, 120, 87, 0.4)'
                  : 'rgba(239, 68, 68, 0.5)',
              boxShadow:
                toast.type === 'success'
                  ? '0 20px 40px -15px rgba(4, 120, 87, 0.2)'
                  : '0 20px 40px -15px rgba(239, 68, 68, 0.25)',
            }}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <h3
                className={`text-sm font-semibold leading-tight ${
                  toast.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {toast.title}
              </h3>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
              >
                {toast.description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
