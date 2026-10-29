import { useEffect, useRef, useState } from 'react';
import useDialog from './useDialog.js';
import { initials, validateProfile } from './model.js';

function FieldIcon({ kind }) {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'edit' ? <path d="m16 3 5 5M4 15 15.5 3.5a3.54 3.54 0 0 1 5 5L9 20l-6 1 1-6Z"/> : kind === 'save' ? <path d="m5 12 4 4L19 6"/> : <path d="m6 6 12 12M18 6 6 18"/>}
  </svg>;
}

export default function ProfileModal({ user, users, onSave, onClose, onSignOut }) {
  const ref = useDialog();
  const inputRef = useRef(null);
  const editButtons = useRef({});
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  useEffect(() => { if (editing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [editing]);
  function cancelEdit() {
    const field = editing;
    setEditing(null); setError('');
    requestAnimationFrame(() => editButtons.current[field]?.focus());
  }
  function save(event) {
    event.preventDefault();
    const updated = { ...user, [editing]: value.trim() };
    const issue = validateProfile(updated, users, user.id);
    if (issue) { setError(issue.message); inputRef.current?.focus(); return; }
    onSave(updated);
    setFeedback(`${editing === 'githubUsername' ? 'GitHub username' : editing === 'email' ? 'Email' : 'Name'} updated.`);
    cancelEdit();
  }
  const iconButton = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-page hover:text-text-primary';
  return <dialog ref={ref} aria-label="Your profile" onCancel={(event) => { event.preventDefault(); if (editing) cancelEdit(); else onClose(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl bg-surface-card p-6 text-text-primary shadow-xl backdrop:bg-black/50 sm:p-8">
    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-due-neutral bg-surface-page text-xl font-semibold">
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover"/> : <span aria-hidden="true">{initials(user.name)}</span>}
    </div>
    <div className="space-y-3">{[['name', 'Name'], ['email', 'Email'], ['githubUsername', 'GitHub username']].map(([field, label]) => <section key={field} aria-label={label} className="min-w-0">
      {editing === field ? <form noValidate onSubmit={save} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelEdit(); } }}>
        <label htmlFor={`profile-${field}`} className="mb-1 block text-xs text-text-muted">{label} (required)</label>
        <div className="flex items-center gap-1">
          <input ref={inputRef} id={`profile-${field}`} name={field} required type={field === 'email' ? 'email' : 'text'} maxLength={field === 'githubUsername' ? 39 : 120} value={value} onChange={(event) => { setValue(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'profile-error' : undefined} className="min-h-11 w-full min-w-0 rounded-md border border-due-neutral px-3 py-2 text-sm"/>
          <button type="submit" aria-label={`Save ${label.toLowerCase()}`} title={`Save ${label.toLowerCase()}`} className={iconButton}><FieldIcon kind="save"/></button>
          <button type="button" aria-label={`Cancel editing ${label.toLowerCase()}`} title="Cancel edit" onClick={cancelEdit} className={iconButton}><FieldIcon kind="cancel"/></button>
        </div>
        {error && <p id="profile-error" role="alert" className="mt-2 text-sm">{error}</p>}
      </form> : <>
        {field !== 'name' && <p className="text-center text-xs text-text-muted">{label}</p>}
        <div className="flex min-h-11 items-center justify-center gap-1">
          {field === 'name' ? <h2 className="min-w-0 break-words text-center text-xl font-semibold">{user.name}</h2> : <p className="min-w-0 break-words text-center text-sm">{user[field]}</p>}
          <button ref={(node) => { editButtons.current[field] = node; }} type="button" aria-label={`Edit ${label.toLowerCase()}`} title={`Edit ${label.toLowerCase()}`} className={iconButton} onClick={() => { setEditing(field); setValue(user[field]); setError(''); setFeedback(''); }}><FieldIcon kind="edit"/></button>
        </div>
      </>}
    </section>)}</div>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 text-center text-xs text-text-muted">{feedback}</p>
    <footer className="mt-4 flex justify-center gap-4 border-t border-due-neutral pt-4">
      <button type="button" onClick={onSignOut} className="min-h-11 rounded-md px-3 py-2 text-sm underline-offset-4 hover:bg-surface-page hover:underline">Sign out</button>
      <button autoFocus type="button" onClick={onClose} className="min-h-11 rounded-md px-3 py-2 text-sm hover:bg-surface-page">Cancel</button>
    </footer>
  </dialog>;
}
