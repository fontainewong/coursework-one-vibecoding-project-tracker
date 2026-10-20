import { useState } from 'react';

export const INITIAL_ANCHORS = [
  { id: 'presentation', label: 'Presentation', url: null },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

function isWebUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname;
  } catch {
    return false;
  }
}

function AnchorEditor({ anchor, onSave }) {
  const [draft, setDraft] = useState(anchor.url ?? '');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const hasLink = !!anchor.url && isWebUrl(anchor.url);
  const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';
  const buttonClass = `min-h-11 rounded-md border border-due-neutral px-3 py-2 text-sm font-medium ${focusClass}`;

  function save(event) {
    event.preventDefault();
    const url = draft.trim();
    if (url && !isWebUrl(url)) {
      setError('Enter a complete http:// or https:// URL, or leave blank to remove the link.');
      event.currentTarget.elements.url.focus();
      return;
    }
    onSave(anchor.id, url || null);
    setDraft(url);
    setError('');
    setFeedback(url ? 'Link saved.' : 'Link removed.');
  }

  return (
    <form noValidate onSubmit={save} aria-labelledby={`anchor-${anchor.id}`}
      className={`min-w-0 rounded-lg border p-4 ${hasLink ? 'border-due-neutral bg-surface-card' : 'border-dashed border-due-neutral bg-surface-page'}`}>
      <h3 id={`anchor-${anchor.id}`} className="text-sm font-medium">{anchor.label}</h3>
      <p className="mt-1 text-xs text-text-muted">{hasLink ? 'Link added' : 'No link added'}</p>
      {hasLink && <a href={anchor.url} target="_blank" rel="noopener noreferrer"
        className={`mt-3 inline-block break-all text-sm underline underline-offset-4 ${focusClass}`}>
        Open {anchor.label}<span className="sr-only"> (opens in a new tab)</span>
      </a>}
      <label htmlFor={`url-${anchor.id}`} className="mt-3 block text-xs text-text-muted">{anchor.label} URL</label>
      <input id={`url-${anchor.id}`} name="url" type="url" inputMode="url" value={draft}
        placeholder="https://…" aria-invalid={!!error}
        aria-describedby={error ? `error-${anchor.id}` : undefined}
        onChange={(event) => { setDraft(event.target.value); setError(''); setFeedback(''); }}
        className={`mt-1 w-full min-w-0 rounded-md border border-due-neutral bg-surface-card px-3 py-2 text-base ${focusClass}`} />
      {error && <p id={`error-${anchor.id}`} role="alert" className="mt-2 text-xs leading-relaxed">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className={`${buttonClass} border-brand-primary bg-brand-primary text-white`}>Save link</button>
        <button type="button" disabled={!anchor.url && !draft} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={() => {
            onSave(anchor.id, null);
            setDraft('');
            setError('');
            setFeedback('Link removed.');
          }}>Remove link</button>
      </div>
      <p role="status" className="mt-2 text-xs text-text-muted">{feedback}</p>
    </form>
  );
}

export default function DeliverablesBoard({ anchors, onSave }) {
  return (
    <section aria-label="Deliverables" className="mb-8 rounded-xl border border-due-neutral bg-surface-card p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INITIAL_ANCHORS.map((definition) => {
          const saved = anchors.find((anchor) => anchor.id === definition.id);
          return <AnchorEditor key={definition.id} anchor={{ ...definition, url: saved?.url ?? null }} onSave={onSave} />;
        })}
      </div>
    </section>
  );
}
