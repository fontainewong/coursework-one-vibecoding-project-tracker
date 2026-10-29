export default function FeedbackNotice({ message, inline = false }) {
  const layout = inline ? 'mb-4 w-full' : 'fixed bottom-6 right-6 z-50 max-w-[calc(100vw-3rem)] sm:max-w-md';
  return <div role="status" aria-live="polite" aria-atomic="true" className={message ? `${layout} flex items-start gap-2 rounded-lg border border-due-neutral bg-surface-card px-4 py-3 text-sm font-medium text-text-primary shadow-lg` : 'sr-only'}>
    {message && <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><path d="m5 12 4 4L19 6"/></svg>}
    <span className="min-w-0 break-words">{message}</span>
  </div>;
}
