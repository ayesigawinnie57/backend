import { AlertCircle, X } from 'lucide-react'

export function parseError(err: any, fallback = 'Something went wrong.'): string {
  const d = err?.response?.data
  if (!d) return err?.message ?? fallback
  if (typeof d === 'string') return d
  // Django field errors: { field: ['msg'] } or { detail: 'msg' } or { non_field_errors: ['msg'] }
  if (d.detail) return String(d.detail)
  if (d.non_field_errors) return String(d.non_field_errors[0])
  const firstField = Object.values(d)[0]
  if (Array.isArray(firstField)) return String(firstField[0])
  if (typeof firstField === 'string') return firstField
  return fallback
}

export default function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
      <AlertCircle size={15} color="#dc2626" className="mt-0.5 shrink-0" />
      <p className="flex-1 text-[13px] font-semibold text-red-600">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 hover:opacity-70">
          <X size={14} color="#dc2626" />
        </button>
      )}
    </div>
  )
}
