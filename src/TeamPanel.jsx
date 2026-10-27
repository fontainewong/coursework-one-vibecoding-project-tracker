import { useEffect, useRef, useState } from 'react';
import { isOverdue } from './taskFilters';

const button = 'min-h-11 rounded-md border border-due-neutral px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary';
const field = 'mt-1 min-h-11 w-full rounded-md border border-due-neutral bg-surface-card px-3 py-2';

export default function TeamPanel({ team, now, onUpdate, onViewTasks, onClose }) {
  const ref = useRef(null);
  const memberInput = useRef(null);
  const [feedback, setFeedback] = useState('');
  const [teamName, setTeamName] = useState(team.name);
  const [memberName, setMemberName] = useState('');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [replacement, setReplacement] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, []);

  function saveMember(event) {
    event.preventDefault();
    const name = memberName.trim();
    if (!name || team.members.some((member) => member.id !== editing && member.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setError('Enter a unique member name.'); memberInput.current?.focus(); return;
    }
    const oldName = team.members.find((member) => member.id === editing)?.name;
    onUpdate({ ...team,
      members: editing ? team.members.map((member) => member.id === editing ? { ...member, name } : member) : [...team.members, { id: crypto.randomUUID(), name }],
      tasks: oldName ? team.tasks.map((task) => task.assignee === oldName ? { ...task, assignee: name } : task) : team.tasks,
    });
    setEditing(null); setMemberName(''); setError('');
    setFeedback(oldName ? `Member renamed to ${name}. Assigned tasks updated.` : `${name} added to the team.`);
    memberInput.current?.focus();
  }

  return <dialog ref={ref} onCancel={onClose} aria-labelledby="team-panel-title" className="ml-auto mr-0 my-0 h-dvh max-h-dvh w-full max-w-md overflow-y-auto bg-surface-card p-6 text-text-primary shadow-xl backdrop:bg-black/50">
    <header className="mb-6 flex items-center justify-between gap-3">
      <div><h2 id="team-panel-title" className="text-lg font-semibold">Manage team</h2><p className="mt-1 text-sm text-text-muted">{team.name}</p></div>
      <button autoFocus type="button" onClick={onClose} className={button}>Close</button>
    </header>
    <form className="mb-6 rounded-lg border border-due-neutral p-4" onSubmit={(event) => { event.preventDefault(); const name = teamName.trim(); if (name) { onUpdate({ ...team, name }); setTeamName(name); setFeedback('Project name saved.'); } }}>
      <h3 className="mb-3 text-sm font-semibold">Project settings</h3>
      <label className="text-sm">Project name<input name="name" required maxLength={80} value={teamName} onChange={(event) => setTeamName(event.target.value)} className={field}/></label>
      <button disabled={!teamName.trim() || teamName.trim() === team.name} className={`${button} mt-2 disabled:opacity-40`}>Save name</button>
    </form>
    <form onSubmit={saveMember} className="mb-4 rounded-lg bg-surface-page p-4">
      <h3 className="mb-3 text-sm font-semibold">{editing ? 'Rename member' : 'Add a member'}</h3>
      <label className="text-sm">Member name<input ref={memberInput} required maxLength={80} value={memberName} aria-invalid={!!error} aria-describedby={error ? 'member-name-error' : undefined} onChange={(event) => { setMemberName(event.target.value); setError(''); }} className={field}/></label>
      {error && <p id="member-name-error" role="alert" className="mt-2 text-sm">{error}</p>}
      <div className="mt-3 flex gap-2"><button className={`${button} bg-brand-primary text-white`}>{editing ? 'Save changes' : 'Add member'}</button>
        {editing && <button type="button" className={button} onClick={() => { setEditing(null); setMemberName(''); setError(''); memberInput.current?.focus(); }}>Cancel</button>}
      </div>
    </form>
    <p role="status" aria-live="polite" aria-atomic="true" className="mb-3 text-sm text-text-muted">{feedback}</p>
    <p className="mb-3 text-sm text-text-muted">{team.members.length} members · {team.name}</p>
    {!team.members.length && <p className="rounded-md border border-dashed border-due-neutral p-4 text-sm text-text-muted">Add your first member, then assign tasks to them.</p>}
    <ul className="space-y-3">
      {team.members.map((member) => <li key={member.id} className="rounded-lg border border-due-neutral p-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-page text-sm font-semibold">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
          <h3 className="min-w-0 break-words font-medium">{member.name}</h3>
        </div>
        <p className="my-2 text-xs text-text-muted">{team.tasks.filter((task) => task.assignee === member.name && task.status !== 'done').length} unfinished · {team.tasks.filter((task) => task.assignee === member.name && isOverdue(task, now)).length} overdue</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-label={`View tasks assigned to ${member.name}`} className={button} onClick={() => onViewTasks(member.name)}>View tasks</button>
          <button type="button" aria-label={`Rename ${member.name}`} className={button} onClick={() => { setEditing(member.id); setMemberName(member.name); setRemoving(null); setError(''); memberInput.current?.focus(); }}>Rename</button>
          <button type="button" aria-label={`Remove ${member.name}`} aria-expanded={removing?.id === member.id} className={button} onClick={() => { setRemoving(member); setReplacement(''); setEditing(null); setMemberName(''); setError(''); }}>Remove</button>
        </div>
        {removing?.id === member.id && <div className="mt-3 rounded-md bg-surface-page p-3">
          <p className="mb-2 text-sm font-medium">Remove {member.name}?</p>
          <p className="mb-3 text-sm text-text-muted">{team.tasks.filter((task) => task.assignee === member.name).length} tasks will be kept. Choose who takes them over.</p>
          <label className="text-sm">Reassign their tasks to<select value={replacement} onChange={(event) => setReplacement(event.target.value)} className={field}>
            <option value="">Unassigned</option>
            {team.members.filter((item) => item.id !== member.id).map((item) => <option key={item.id}>{item.name}</option>)}
          </select></label>
          <p className="my-2 text-xs text-text-muted">Tasks will be kept when this member is removed.</p>
          <div className="flex gap-2">
            <button type="button" className={`${button} bg-brand-primary text-white`} onClick={() => { onUpdate({ ...team, members: team.members.filter((item) => item.id !== member.id), tasks: team.tasks.map((task) => task.assignee === member.name ? { ...task, assignee: replacement } : task) }); setRemoving(null); setFeedback(`${member.name} removed. Tasks reassigned to ${replacement || 'Unassigned'}.`); memberInput.current?.focus(); if (editing === member.id) { setEditing(null); setMemberName(''); } }}>Remove member</button>
            <button type="button" className={button} onClick={() => setRemoving(null)}>Cancel</button>
          </div>
        </div>}
      </li>)}
    </ul>
  </dialog>;
}
