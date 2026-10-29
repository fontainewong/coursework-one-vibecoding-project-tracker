import TaskType from './TaskType';
import { getDeadline } from './deadline';
import { filterTasks } from './taskFilters';
import useDialog from './useDialog.js';
import AssigneeBadge from './AssigneeBadge';
import FeedbackNotice from './FeedbackNotice';

export default function MemberView({ member, tasks, now = new Date(), onClose, onEditTask, feedback }) {
  const ref = useDialog();
  const assigned = filterTasks(tasks, { assignee: member.id }, now);
  const stages = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
  return <dialog ref={ref} aria-labelledby="member-modal-title" onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }} className="m-auto max-h-[calc(100dvh-3rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl bg-surface-card p-5 text-text-primary shadow-xl backdrop:bg-black/50 sm:p-8">
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-4">
        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover"/> : <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-page text-lg font-semibold">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
        <div className="min-w-0"><h2 id="member-modal-title" className="break-words text-xl font-semibold">{member.name}</h2>
          <p className="mt-1 break-words text-sm text-text-muted">{member.email}</p>
          {member.githubUsername && <p className="mt-1 break-words text-xs text-text-muted">GitHub: {member.githubUsername}</p>}
          <p className="mt-1 text-xs text-text-muted">{assigned.length} assigned tasks</p>
        </div>
      </div>
      <button autoFocus type="button" aria-label="Close member details" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-due-neutral">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
      </button>
    </header>
      <FeedbackNotice inline message={feedback}/>
      <h3 className="mb-3 border-t border-due-neutral pt-5 text-sm font-semibold">Tasks</h3>
      {!assigned.length && <p className="rounded-md border border-dashed border-due-neutral p-4 text-sm text-text-muted">No tasks assigned to this member yet.</p>}
      <ul className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2">{assigned.map((task) => <li key={task.id} className="min-w-0">
        <article className={`h-full min-w-0 rounded-lg border border-due-neutral p-4 [overflow-wrap:anywhere] ${getDeadline(task, now).tint}`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><TaskType type={task.type}/><span className="rounded-md border border-due-neutral bg-surface-page px-2 py-1 text-xs font-semibold"><span className="sr-only">Status: </span>{stages[task.status] || task.status}</span></div>
        <h4 className="mt-2 text-sm font-medium"><button type="button" onClick={() => onEditTask(task)} aria-label={`Edit task: ${task.title}`} className="text-left underline-offset-4 hover:underline">{task.title}</button></h4>
        {task.description && <p className="mt-2 whitespace-pre-wrap text-sm text-text-muted">{task.description}</p>}
        <div className="mt-3"><AssigneeBadge user={member}/></div>
        <p className="mt-3 text-xs text-text-muted">{getDeadline(task, now).label}</p>
        </article>
      </li>)}</ul>
  </dialog>;
}
