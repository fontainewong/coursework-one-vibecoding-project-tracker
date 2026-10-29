import { useEffect, useRef, useState } from 'react';
import { saveDeliverableLink, removeDeliverableLink } from './model.js';

const button = 'min-h-11 rounded-md border border-due-neutral px-3 py-2 text-sm';
const field = 'mt-1 min-h-11 w-full min-w-0 rounded-md border border-due-neutral bg-surface-card px-3 py-2';

function DeliverableGroup({ group, onSave }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const urlRef = useRef(null);
  const addRef = useRef(null);
  const editRefs = useRef({});
  useEffect(() => { if (editing) urlRef.current?.focus(); }, [editing?.id]);
  function start(link = null) { setEditing(link ? { ...link } : { id: '', title: '', url: '' }); setError(''); }
  function cancel() { const id = editing.id; setEditing(null); setError(''); (editRefs.current[id] || addRef.current)?.focus(); }
  function save(event) {
    event.preventDefault();
    try {
      const updated = saveDeliverableLink(group, editing, crypto.randomUUID());
      onSave(updated); setFeedback(editing.id ? 'Link updated.' : 'Link added.'); setEditing(null); setError(''); addRef.current?.focus();
    } catch (issue) { setError(issue.message); urlRef.current?.focus(); }
  }
  return <section aria-labelledby={`deliverable-${group.id}`} className={`min-w-0 rounded-lg border p-4 ${group.links.length ? 'border-due-neutral' : 'border-dashed border-due-neutral bg-surface-page'}`}>
    <h3 id={`deliverable-${group.id}`} className="text-sm font-semibold">{group.label}</h3>
    <p className="mb-3 mt-1 text-xs text-text-muted">{group.links.length ? `${group.links.length} links added` : 'No links added'}</p>
    <ul className="space-y-3">{group.links.map((link) => <li key={link.id} className="min-w-0 rounded-md border border-due-neutral bg-surface-card p-3">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="break-words text-sm font-medium underline underline-offset-4">{link.title}<span className="sr-only"> (opens in a new tab)</span></a>
      <p className="mt-1 break-all text-xs text-text-muted">{link.url}</p>
      <div className="mt-2 flex flex-wrap gap-2"><button ref={(node) => { editRefs.current[link.id] = node; }} type="button" aria-label={`Edit ${link.title}`} className={button} onClick={() => start(link)}>Edit</button><button type="button" aria-label={`Remove ${link.title}`} className={button} onClick={() => { onSave(removeDeliverableLink(group, link.id)); setFeedback(`${link.title} removed.`); if (editing?.id === link.id) setEditing(null); addRef.current?.focus(); }}>Remove</button></div>
    </li>)}</ul>
    <button ref={addRef} type="button" aria-expanded={!!editing && !editing.id} aria-controls={`link-form-${group.id}`} className={`${button} mt-3`} onClick={() => start()}>Add link<span className="sr-only"> to {group.label}</span></button>
    {editing && <form id={`link-form-${group.id}`} aria-label={`${editing.id ? 'Edit' : 'Add'} ${group.label} link`} noValidate onSubmit={save} className="mt-3 space-y-3 rounded-md border border-due-neutral bg-surface-card p-3">
      <label className="block text-xs">URL (required)<input ref={urlRef} type="url" inputMode="url" required value={editing.url} onChange={(event) => { setEditing({ ...editing, url: event.target.value }); setError(''); }} aria-invalid={!!error} aria-describedby={error ? `link-error-${group.id}` : undefined} className={field}/></label>
      <label className="block text-xs">Link title (optional)<input maxLength={120} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} className={field}/></label>
      {error && <p id={`link-error-${group.id}`} role="alert" className="text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2"><button className={`${button} bg-brand-primary text-white`}>{editing.id ? 'Save changes' : 'Save link'}</button><button type="button" className={button} onClick={cancel}>Cancel</button></div>
    </form>}
    <p role="status" aria-live="polite" className="mt-2 text-xs text-text-muted">{feedback}</p>
  </section>;
}

export default function DeliverablesBoard({ anchors, onSave }) {
  return <section aria-label="Deliverables" className="mb-8 rounded-xl border border-due-neutral bg-surface-card p-4 sm:p-6">
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">{anchors.map((group) => <DeliverableGroup key={group.id} group={group} onSave={onSave}/>)}</div>
  </section>;
}
