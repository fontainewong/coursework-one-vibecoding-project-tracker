// Lucide Bug and Sparkles icons (ISC license), rendered locally without a runtime dependency.
export default function TaskType({ type }) {
  const bug = type === 'bug';
  return <span className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted">
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={bug ? 'text-type-bug' : 'text-type-feature'}>
      {bug ? <><path d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3 3 0 0 1 6 0v1M12 20v-9M6 13H2M22 13h-4M3 21a4 4 0 0 0 4-4M21 21a4 4 0 0 1-4-4M3 5a4 4 0 0 1 4 4M21 5a4 4 0 0 0-4 4"/><rect x="6" y="7" width="12" height="14" rx="6"/></> : <><path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3ZM5 3v4M3 5h4"/></>}
    </svg>
    {bug ? 'Bug' : 'Feature'}
  </span>;
}
