import { useEffect, useRef, useState } from 'react';

export default function CreateTeamModal({ onCreate, onClose }) {
  const ref = useRef(null);
  const [name, setName] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={ref} onCancel={onClose} aria-labelledby="create-team-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-surface-card p-6 text-text-primary backdrop:bg-black/50">
    <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) onCreate(name.trim()); }}>
      <h2 id="create-team-title" className="text-lg font-semibold">Create team</h2>
      <p className="my-3 text-sm text-text-muted">Start with an empty board. Add members and tasks next.</p>
      <label className="text-sm">Team name<input autoFocus required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-due-neutral px-3 py-2"/></label>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="min-h-11 rounded-md border border-due-neutral px-4 py-2">Cancel</button>
        <button disabled={!name.trim()} className="min-h-11 rounded-md bg-brand-primary px-4 py-2 text-white disabled:opacity-50">Create team</button>
      </div>
    </form>
  </dialog>;
}
