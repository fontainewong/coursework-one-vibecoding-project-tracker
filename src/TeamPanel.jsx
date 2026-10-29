import { useRef, useState, useEffect } from 'react';
import { isOverdue } from './taskFilters';
import MemberView from './MemberView';
import useDialog from './useDialog.js';
import DeleteProjectModal from './DeleteProjectModal';
import { initials, memberUsers, removeProjectMember } from './model.js';

const button = 'min-h-11 rounded-md border border-due-neutral px-3 py-2 text-sm';
const field = 'mt-1 min-h-11 w-full rounded-md border border-due-neutral bg-surface-card px-3 py-2';

export default function TeamPanel({ project, users, currentUserId, now, onUpdate, onClose, onEditTask, onDelete }) {
  const ref = useDialog();
  const selectRef = useRef(null);
  const addButton = useRef(null);
  const nameRef = useRef(null);
  const removeButtons = useRef({});
  const [feedback, setFeedback] = useState('');
  const [projectName, setProjectName] = useState(project.name);
  const [nameError, setNameError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);
  const [replacement, setReplacement] = useState('');
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const members = memberUsers(project, users);
  const available = users.filter((user) => !project.memberUserIds.includes(user.id));
  const selectedMember = members.find((member) => member.id === viewing);
  useEffect(() => { if (adding) selectRef.current?.focus(); }, [adding]);
  function addMember(event) {
    event.preventDefault();
    const member = available.find((user) => user.id === newUserId);
    if (!member) { setError('Select a user to add to this project.'); selectRef.current?.focus(); return; }
    onUpdate({ ...project, memberUserIds: [...project.memberUserIds, member.id] });
    setAdding(false); setNewUserId(''); setError(''); setFeedback(`${member.name} added to the project.`); addButton.current?.focus();
  }
  return <dialog ref={ref} onCancel={(event) => { if (event.target !== event.currentTarget) return; event.preventDefault(); event.stopPropagation(); onClose(); }} aria-labelledby="team-panel-title" className="ml-auto mr-0 my-0 h-dvh max-h-dvh w-full max-w-md overflow-y-auto bg-surface-card p-6 text-text-primary shadow-xl backdrop:bg-black/50">
    <header className="mb-6 flex items-center justify-between gap-3"><div><h2 id="team-panel-title" className="text-lg font-semibold">Manage project</h2><p className="mt-1 break-words text-sm text-text-muted">{project.name}</p></div><button autoFocus type="button" onClick={onClose} className={button}>Close</button></header>
    {selectedMember && <MemberView key={selectedMember.id} member={selectedMember} tasks={project.tasks} now={now} onClose={() => setViewing(null)} onEditTask={onEditTask}/>}
    <form noValidate className="mb-6 rounded-lg border border-due-neutral p-4" onSubmit={(event) => {
      event.preventDefault();
      const name = projectName.trim();
      if (!name) { setNameError('Enter a project name.'); nameRef.current?.focus(); return; }
      onUpdate({ ...project, name }); setProjectName(name); setFeedback('Project name saved.');
    }}>
      <h3 className="mb-3 text-sm font-semibold">Project settings</h3>
      <label className="text-sm">Project name (required)<input ref={nameRef} required maxLength={80} value={projectName} onChange={(event) => { setProjectName(event.target.value); setNameError(''); }} aria-invalid={!!nameError} aria-describedby={nameError ? 'project-name-error' : undefined} className={field}/></label>
      {nameError && <p id="project-name-error" role="alert" className="mt-2 text-sm">{nameError}</p>}
      <button disabled={projectName === project.name} className={`${button} mt-2 disabled:opacity-40`}>Save name</button>
    </form>
    <button ref={addButton} type="button" aria-expanded={adding} aria-controls="add-member-form" className={`${button} mb-4 bg-brand-primary text-white`} onClick={() => { setAdding(!adding); setNewUserId(''); setError(''); }}>Add Member</button>
    {adding && <form id="add-member-form" noValidate onSubmit={addMember} className="mb-4 rounded-lg bg-surface-page p-4">
      <label className="text-sm">User (required)<select ref={selectRef} required value={newUserId} onChange={(event) => { setNewUserId(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'add-member-error' : undefined} className={field}>
        <option value="">Select an existing user</option>{available.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}
      </select></label>
      {!available.length && <p className="mt-2 text-sm text-text-muted">All users are already members of this project.</p>}
      {error && <p id="add-member-error" role="alert" className="mt-2 text-sm">{error}</p>}
      <div className="mt-3 flex gap-2"><button disabled={!available.length} className={`${button} bg-brand-primary text-white disabled:opacity-40`}>Add Member</button><button type="button" className={button} onClick={() => { setAdding(false); setError(''); addButton.current?.focus(); }}>Cancel</button></div>
    </form>}
    <p role="status" aria-live="polite" aria-atomic="true" className="mb-3 text-sm text-text-muted">{feedback}</p>
    <p className="mb-3 text-sm text-text-muted">{members.length} members</p>
    <ul className="space-y-3">{members.map((member) => <li key={member.id} className="rounded-lg border border-due-neutral p-4">
      <div className="flex items-center gap-3"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-page text-sm font-semibold">{initials(member.name)}</span>
        <div className="min-w-0"><h3 className="break-words font-medium">{member.name}{member.id === currentUserId ? ' (you)' : ''}</h3><p className="mt-1 break-words text-xs text-text-muted">{member.email}</p>{member.githubUsername && <p className="mt-1 break-words text-xs text-text-muted">GitHub: {member.githubUsername}</p>}</div>
      </div>
      <p className="my-2 text-xs text-text-muted">{project.tasks.filter((task) => task.assigneeUserId === member.id && task.status !== 'done').length} unfinished · {project.tasks.filter((task) => task.assigneeUserId === member.id && isOverdue(task, now)).length} overdue</p>
      <div className="flex flex-wrap gap-2"><button type="button" aria-label={`View tasks assigned to ${member.name}`} className={button} onClick={() => setViewing(member.id)}>View tasks</button><button ref={(node) => { removeButtons.current[member.id] = node; }} type="button" aria-label={`Remove ${member.name}`} aria-expanded={removing === member.id} className={button} onClick={() => { setRemoving(member.id); setReplacement(''); }}>Remove</button></div>
      {removing === member.id && <div className="mt-3 rounded-md bg-surface-page p-3">
        <p className="mb-2 text-sm font-medium">Remove {member.name}?</p><p className="mb-3 text-sm text-text-muted">Their {project.tasks.filter((task) => task.assigneeUserId === member.id).length} tasks will be kept.{member.id === currentUserId ? ' You will lose access to this project until added again.' : ''}</p>
        <label className="text-sm">Reassign tasks to<select value={replacement} onChange={(event) => setReplacement(event.target.value)} className={field}><option value="">Unassigned</option>{members.filter((item) => item.id !== member.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <div className="mt-3 flex gap-2"><button type="button" className={`${button} bg-brand-primary text-white`} onClick={() => { onUpdate(removeProjectMember(project, member.id, replacement || null)); setRemoving(null); setFeedback(`${member.name} removed. Tasks reassigned to ${users.find((item) => item.id === replacement)?.name || 'Unassigned'}.`); addButton.current?.focus(); if (member.id === currentUserId) onClose(); }}>Remove member</button><button type="button" className={button} onClick={() => { setRemoving(null); removeButtons.current[member.id]?.focus(); }}>Cancel</button></div>
      </div>}
    </li>)}</ul>
    <section aria-labelledby="delete-project-section" className="mt-6 rounded-lg border border-type-bug p-4">
      <h3 id="delete-project-section" className="text-sm font-semibold">Delete project</h3><p className="my-3 text-sm text-text-muted">Remove this project and its saved contents. You will need to type its name to confirm.</p>
      <button type="button" className={`${button} bg-brand-primary text-white`} onClick={() => setDeleting(true)}>Delete project</button>
    </section>
    {deleting && <DeleteProjectModal project={project} onDelete={onDelete} onClose={() => setDeleting(false)}/>}
  </dialog>;
}
