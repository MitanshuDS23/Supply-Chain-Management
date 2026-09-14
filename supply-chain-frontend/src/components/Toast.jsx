import { createContext, useContext, useCallback, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
let idSeq = 0

const icons = {
  success: <CheckCircle2 size={18} color="var(--success)" />,
  error: <AlertCircle size={18} color="var(--danger)" />,
  info: <Info size={18} color="var(--info)" />,
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback((type, title, msg) => {
    const id = ++idSeq
    setToasts((t) => [...t, { id, type, title, msg }])
    setTimeout(() => dismiss(id), 4200)
  }, [dismiss])

  const api = {
    success: (title, msg) => push('success', title, msg),
    error: (title, msg) => push('error', title, msg),
    info: (title, msg) => push('info', title, msg),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div style={{ marginTop: 1 }}>{icons[t.type]}</div>
            <div style={{ flex: 1 }}>
              <div className="t-title">{t.title}</div>
              {t.msg && <div className="t-msg">{t.msg}</div>}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => dismiss(t.id)} style={{ margin: -4 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
