import { useState } from 'react';
import { milestoneProgress, saveMilestoneRecord, STAGES } from './model.js';
import useDialog from './useDialog.js';

const button = 'min-h-11 rounded-md border border-due-neutral px-4 py-2 text-sm';
const field = 'mt-1 min-h-11 w-full rounded-md border border-due-neutral px-3 py-2';

function MilestoneModal({ milestone, project, onSave, onClose }) {
  const ref = useDialog();
  const [draft, setDraft] = useState({ title: milestone?.title || '', description: milestone?.description || '', targetDate: milestone?.targetDate || '', taskIds: milestone?.taskIds || [] });
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    if (!draft.title.trim()) { setError('Enter a milestone title.'); event.currentTarget.elements.title.focus(); return; }
    onSave(saveMilestoneRecord(draft, milestone, project, crypto.randomUUID()));
  }
  return <dialog ref={ref} aria-labelledby="milestone-modal-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl bg-surface-card p-6 text-text-primary shadow-xl backdrop:bg-black/50">
    <form noValidate onSubmit={submit}>
      <header className="mb-5 flex items-center justify-between gap-3"><h2 id="milestone-modal-title" className="text-lg font-semibold">{milestone ? 'Edit milestone' : 'Add milestone'}</h2><button type="button" className={button} onClick={onClose}>Close</button></header>
      <div className="space-y-4">
        <label className="block text-sm">Title (required)<input autoFocus name="title" required maxLength={160} value={draft.title} aria-invalid={!!error} aria-describedby={error ? 'milestone-error' : undefined} onChange={(event) => { setDraft({ ...draft, title: event.target.value }); setError(''); }} className={field}/></label>
        {error && <p id="milestone-error" role="alert" className="text-sm">{error}</p>}
        <label className="block text-sm">Description (optional)<textarea name="description" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className={`${field} resize-y`}/></label>
        <label className="block text-sm">Target date (optional)<input name="targetDate" type="date" value={draft.targetDate} onChange={(event) => setDraft({ ...draft, targetDate: event.target.value })} className={field}/></label>
        <fieldset className="rounded-lg border border-due-neutral p-3"><legend className="px-1 text-sm font-medium">Related tasks (optional)</legend>
          <p className="mb-2 text-xs text-text-muted">Select tasks from this project. Tasks can belong to more than one milestone.</p>
          {!project.tasks.length && <p className="text-sm text-text-muted">No tasks in this project yet.</p>}
          <div className="max-h-64 space-y-1 overflow-y-auto">{project.tasks.map((task) => <label key={task.id} className="flex min-h-11 items-start gap-3 rounded-md p-2 hover:bg-surface-page">
            <input type="checkbox" checked={draft.taskIds.includes(task.id)} onChange={(event) => setDraft({ ...draft, taskIds: event.target.checked ? [...draft.taskIds, task.id] : draft.taskIds.filter((id) => id !== task.id) })} className="mt-1 h-4 w-4 shrink-0 accent-brand-primary"/>
            <span className="min-w-0 break-words text-sm">{task.title}<span className="mt-1 block text-xs text-text-muted">{STAGES.find((stage) => stage.id === task.status)?.label}</span></span>
          </label>)}</div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" className={button} onClick={onClose}>Cancel</button><button className={`${button} bg-brand-primary text-white`}>{milestone ? 'Save changes' : 'Create milestone'}</button></div>
    </form>
  </dialog>;
}

export default function Milestones({ project, onUpdate }) {
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState('');
  const progress = milestoneProgress(project.milestones);
  function save(milestone) {
    onUpdate({ ...project, milestones: editing.milestone ? project.milestones.map((item) => item.id === milestone.id ? milestone : item) : [...project.milestones, milestone] });
    setFeedback(editing.milestone ? 'Milestone saved.' : 'Milestone created.'); setEditing(null);
  }
  return <section aria-labelledby="milestones-title" className="rounded-xl border border-due-neutral bg-surface-card p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 id="milestones-title" className="text-lg font-semibold">Milestones</h2><button type="button" className={`${button} bg-brand-primary text-white`} onClick={() => setEditing({ milestone: null })}>Add milestone</button></header>
    <p className="mb-2 mt-3 text-sm">{progress.completed} of {progress.total} complete · {progress.percent}%</p>
    <progress aria-label="Milestone completion" max="100" value={progress.percent} className="mb-6 h-3 w-full accent-brand-primary"/>
    <p role="status" className="mb-3 text-sm text-text-muted">{feedback}</p>
    {!project.milestones.length && <p className="rounded-lg border border-dashed border-due-neutral p-6 text-sm text-text-muted">No milestones yet. Add one to start tracking progress.</p>}
    <ul className="space-y-3">{project.milestones.map((item) => {
      const related = project.tasks.filter((task) => item.taskIds.includes(task.id));
      return <li key={item.id} className="overflow-hidden rounded-lg border border-due-neutral">
        <button type="button" aria-label={`Edit milestone: ${item.title}`} onClick={() => setEditing({ milestone: item })} className="block w-full p-4 text-left hover:bg-surface-page">
          <span className="flex items-start justify-between gap-3"><span className="min-w-0 break-words font-medium">{item.title}</span><span className="shrink-0 text-xs text-text-muted">Edit</span></span>
          {item.description && <span className="mt-2 block whitespace-pre-wrap break-words text-sm text-text-muted">{item.description}</span>}
          <span className="mt-3 block text-xs">{item.completed ? 'Complete' : 'Not complete'} · {item.targetDate ? `Target: ${item.targetDate}` : 'No target date'}</span>
          <span className="mt-3 block text-xs font-semibold">Related tasks · {related.length}</span>
          {!related.length && <span className="mt-1 block text-xs text-text-muted">No related tasks selected.</span>}
          {related.map((task) => <span key={task.id} className="mt-1 block break-words text-xs text-text-muted">{task.title} · {STAGES.find((stage) => stage.id === task.status)?.label}</span>)}
        </button>
        <label className="flex min-h-11 items-center gap-2 border-t border-due-neutral px-4 py-2 text-sm"><input type="checkbox" checked={item.completed} onChange={(event) => { onUpdate({ ...project, milestones: project.milestones.map((milestone) => milestone.id === item.id ? { ...milestone, completed: event.target.checked } : milestone) }); setFeedback(`${item.title} marked ${event.target.checked ? 'complete' : 'incomplete'}.`); }} className="h-4 w-4 accent-brand-primary"/>Mark {item.title} complete</label>
      </li>;
    })}</ul>
    {editing && <MilestoneModal milestone={editing.milestone} project={project} onSave={save} onClose={() => setEditing(null)}/>}
  </section>;
}
