import { useEffect, useRef, useState } from 'react';

export default function TaskModal({ task, stages, team, onSave, onDelete, onClose }) {
  const dialogRef = useRef(null);
  const [draft, setDraft] = useState(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    type: task?.type ?? 'feature',
    status: task?.status ?? stages[0].id,
    assignee: task?.assignee ?? team[0] ?? '',
    dueDate: task?.dueDate ?? '',
    context: task?.context ?? '',
    contextTool: task?.contextTool ?? '',
  }));
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  function update(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    if (name === 'title') setError('');
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
    <dialog ref={dialogRef} aria-labelledby="task-modal-title" onCancel={onClose}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl bg-surface-card p-5 font-sans text-text-primary shadow-xl backdrop:bg-black/50 sm:p-6">
      <form onSubmit={submit}>
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
          <label className="block" htmlFor="task-assignee">Assignee (required)
            <select required id="task-assignee" name="assignee" value={draft.assignee} onChange={update} className={fieldClass}>
              <option value="" disabled>Select a team member</option>
              {team.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          <label className="block" htmlFor="task-due-date">Due date (optional)
            <input type="date" id="task-due-date" name="dueDate" value={draft.dueDate} onChange={update} className={fieldClass} />
          </label>
          <label className="block" htmlFor="task-context">Context / AI Briefing
            <textarea id="task-context" name="context" rows={6} value={draft.context} onChange={update}
              aria-describedby="task-context-help" className={`${fieldClass} resize-y font-mono text-sm`} />
          </label>
          <p id="task-context-help" className="text-xs leading-relaxed text-text-muted">
            Keep useful prompts, results, decisions and next steps here. Select the text to copy it into your AI tool.
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
            Context last saved: <time dateTime={task.contextUpdatedAt}>{task.contextUpdatedAt}</time>
          </p>}
          {task && <p className="text-xs text-text-muted">Created: <time dateTime={task.createdDate}>{task.createdDate}</time></p>}
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
