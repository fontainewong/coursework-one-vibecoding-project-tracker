import { useState } from 'react';
import useDialog from './useDialog.js';

export default function DeleteProjectModal({ project, onDelete, onClose }) {
  const ref = useDialog();
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const expected = `delete ${project.name}`;
  const button = 'min-h-11 rounded-md border border-due-neutral px-4 py-2 text-sm';
  return <dialog ref={ref} aria-labelledby="delete-project-title" aria-describedby="delete-project-impact" onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl bg-surface-card p-6 text-text-primary shadow-xl backdrop:bg-black/50">
    <form noValidate onSubmit={(event) => {
      event.preventDefault();
      if (confirmation !== expected) { setError('The confirmation does not match. Copy the exact wording shown above.'); event.currentTarget.elements.confirmation.focus(); return; }
      onDelete(confirmation);
    }}>
      <h2 id="delete-project-title" className="text-lg font-semibold">Delete project</h2>
      <p id="delete-project-impact" className="my-4 break-words text-sm">Deleting {project.name} permanently removes its tasks, context, milestones and deliverable links from this browser. Other projects and user accounts are kept.</p>
      <p id="delete-project-phrase" className="mb-3 text-sm">Type <code className="break-words font-semibold">{expected}</code> to confirm.</p>
      <label className="block text-sm">Confirmation (required)<input autoFocus name="confirmation" autoComplete="off" autoCapitalize="off" spellCheck={false} required value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={`delete-project-phrase${error ? ' delete-project-error' : ''}`} className="mt-1 min-h-11 w-full rounded-md border border-due-neutral px-3 py-2"/></label>
      {error && <p id="delete-project-error" role="alert" className="mt-2 text-sm">{error}</p>}
      <div className="mt-6 flex justify-end gap-2"><button type="button" className={button} onClick={onClose}>Cancel</button><button disabled={confirmation !== expected} className={`${button} border-brand-primary bg-brand-primary text-white disabled:cursor-not-allowed disabled:opacity-40`}>Delete project</button></div>
    </form>
  </dialog>;
}
