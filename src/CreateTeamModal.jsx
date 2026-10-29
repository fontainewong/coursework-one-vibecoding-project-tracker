import { useState } from 'react';
import useDialog from './useDialog.js';

export default function CreateTeamModal({ onCreate, onClose }) {
  const ref = useDialog();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  return <dialog ref={ref} onCancel={onClose} aria-labelledby="create-team-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-surface-card p-6 text-text-primary backdrop:bg-black/50">
    <form noValidate onSubmit={(event) => { event.preventDefault(); if (name.trim()) onCreate(name.trim()); else { setError('Enter a project name.'); event.currentTarget.elements.projectName.focus(); } }}>
      <h2 id="create-team-title" className="text-lg font-semibold">Create project</h2>
      <p className="my-3 text-sm text-text-muted">Start with an empty board. Add members and tasks next.</p>
      <label className="text-sm">Project name (required)<input autoFocus required name="projectName" maxLength={80} value={name} aria-invalid={!!error} aria-describedby={error ? 'create-project-error' : undefined} onChange={(event) => { setName(event.target.value); setError(''); }} className="mt-1 min-h-11 w-full rounded-md border border-due-neutral px-3 py-2"/></label>
      {error && <p id="create-project-error" role="alert" className="mt-2 text-sm">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="min-h-11 rounded-md border border-due-neutral px-4 py-2">Cancel</button>
        <button className="min-h-11 rounded-md bg-brand-primary px-4 py-2 text-white">Create project</button>
      </div>
    </form>
  </dialog>;
}
