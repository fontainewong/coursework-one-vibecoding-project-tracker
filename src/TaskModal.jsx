import { useRef, useState } from 'react';
import TaskType from './TaskType';
import useDialog from './useDialog.js';
import { CONTEXT_TEMPLATE, taskMarkdown } from './model.js';

function readableDate(value) {
  if (!value) return 'Not available';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    ...(!dateOnly && { hour: '2-digit', minute: '2-digit' }),
  });
}

export default function TaskModal({ task, stages, team, onSave, onDelete, onClose }) {
  const dialogRef = useDialog();
  const [draft, setDraft] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    type: task?.type ?? 'feature',
    status: task?.status ?? stages[0].id,
    assigneeUserId: task?.assigneeUserId ?? '',
    dueDate: task?.dueDate ?? '',
    context: task?.context ?? (task ? '' : CONTEXT_TEMPLATE),
    contextTool: task?.contextTool ?? '',
  }));
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const copyRequest = useRef(0);

  function update(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    if (name === 'title') setError('');
    if (['title', 'description', 'context'].includes(name)) {
      copyRequest.current += 1;
      setCopyStatus('');
    }
  }

  async function copyContext() {
    if (!draft.title.trim()) { setError('Enter a task title before copying.'); dialogRef.current.querySelector('#task-title').focus(); return; }
    const request = ++copyRequest.current;
    setCopyStatus('copying');
    try {
      await navigator.clipboard.writeText(taskMarkdown(draft));
      if (request === copyRequest.current) setCopyStatus('success');
    } catch {
      if (request === copyRequest.current) setCopyStatus('error');
    }
  }

  function submit(event) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError('Enter a task title.');
      event.currentTarget.elements.title.focus();
      return;
    }
    onSave({ ...draft, title: draft.title.trim(), dueDate: draft.dueDate || null,
      contextTool: draft.contextTool || null });
  }

  const fieldClass = 'mt-1 w-full min-w-0 rounded-md border border-due-neutral bg-surface-card px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';
  const buttonClass = 'rounded-md border border-due-neutral px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

  return (
    <dialog ref={dialogRef} aria-labelledby="task-modal-title" onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl bg-surface-card p-5 font-sans text-text-primary shadow-xl backdrop:bg-black/50 sm:p-6">
      <form noValidate onSubmit={submit}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="task-modal-title" className="text-lg font-semibold">{task ? 'Edit Task' : 'Add Task'}</h2>
          <button type="button" onClick={onClose} className={buttonClass}>Close</button>
        </div>
        <div className="space-y-4 text-sm">
          <label className="block" htmlFor="task-title">Title (required)
            <input autoFocus required id="task-title" name="title" value={draft.title} onChange={update}
              aria-invalid={!!error} aria-describedby={error ? 'task-title-error' : undefined} className={fieldClass} />
          </label>
          {error && <p id="task-title-error" role="alert">{error}</p>}
          <label className="block" htmlFor="task-description">Description
            <textarea id="task-description" name="description" rows={3} value={draft.description} onChange={update} className={`${fieldClass} resize-y`} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label htmlFor="task-type">Type
              <span className="ml-2"><TaskType type={draft.type}/></span>
              <select id="task-type" name="type" value={draft.type} onChange={update} className={fieldClass}>
                <option value="feature">Feature</option><option value="bug">Bug</option>
              </select>
            </label>
            <label htmlFor="task-status">Status
              <select id="task-status" name="status" value={draft.status} onChange={update} className={fieldClass}>
                {stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}
              </select>
            </label>
          </div>
          <label className="block" htmlFor="task-assignee">Assignee
            <select id="task-assignee" name="assigneeUserId" value={draft.assigneeUserId} onChange={update} className={fieldClass}>
              <option value="">Unassigned</option>
              {team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="task-due-date">Due date (optional)
            <input type="date" id="task-due-date" name="dueDate" value={draft.dueDate} onChange={update} className={fieldClass} />
          </label>
          <label className="block" htmlFor="task-context">Context / AI Briefing
            <textarea id="task-context" name="context" rows={6} value={draft.context} onChange={update}
              aria-describedby="task-context-help" className={`${fieldClass} resize-y font-mono text-sm`} />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyContext}
              disabled={copyStatus === 'copying'}
              className={`${buttonClass} min-h-11 disabled:cursor-not-allowed disabled:opacity-50`}>
              Copy as Markdown
            </button>
            <p role="status" aria-live="polite" aria-atomic="true" className="text-xs leading-relaxed text-text-muted">
              {copyStatus === 'success' && 'Copied!'}
              {copyStatus === 'copying' && 'Copying…'}
              {copyStatus === 'error' && 'Could not copy. Check clipboard permissions, then try again.'}
            </p>
          </div>
          <p id="task-context-help" className="text-xs leading-relaxed text-text-muted">
            Keep useful prompts, results, decisions and next steps here. Copy as Markdown includes the title, description and context.
          </p>
          <label className="block" htmlFor="task-context-tool">AI Tool (optional)
            <select id="task-context-tool" name="contextTool" value={draft.contextTool} onChange={update} className={fieldClass}>
              <option value="">None</option>
              {['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'].map((tool) => (
                <option key={tool} value={tool}>{tool}</option>
              ))}
            </select>
          </label>
          {task?.contextUpdatedAt && <p className="text-xs text-text-muted">
            Context last saved: <time dateTime={task.contextUpdatedAt}>{readableDate(task.contextUpdatedAt)}</time>
          </p>}
          {task && <p className="text-xs text-text-muted">Created: <time dateTime={task.createdDate}>{readableDate(task.createdDate)}</time></p>}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {task && <button type="button" className={`${buttonClass} mr-auto`} onClick={() => {
            if (window.confirm('Delete this task? This cannot be undone.')) onDelete(task.id);
          }}>Delete task</button>}
          <button type="button" onClick={onClose} className={buttonClass}>Cancel</button>
          <button type="submit" className={`${buttonClass} border-brand-primary bg-brand-primary text-white`}>
            {task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
