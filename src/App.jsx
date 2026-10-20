import { useState, useEffect } from 'react';
import TaskModal from './TaskModal';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

// Initial fictional team for M4, not a fixed team-size constraint.
// Tasks retain assignee names as required by the locked Task model.
export const TEAM = ['Maya Chen', 'Oliver Brooks', 'Priya Shah', 'Leo Martins'];

/** @type {Task[]} */
const INITIAL_TASKS = [
  {
    id: 'task-search-filters',
    title: 'Add task search and filters',
    description: 'Let developers find tasks by title and filter the board by task type.',
    type: 'feature',
    status: 'todo',
    assignee: 'Maya Chen',
    dueDate: '2026-10-26',
    createdDate: '2026-10-19',
  },
  {
    id: 'task-date-fix',
    title: 'Fix date shifts across time zones',
    description: 'Keep date-only deadlines on the selected day when displayed in different time zones.',
    type: 'bug',
    status: 'in-progress',
    assignee: 'Oliver Brooks',
    dueDate: '2026-10-23',
    createdDate: '2026-10-18',
  },
  {
    id: 'task-form-validation',
    title: 'Validate the task creation form',
    description: 'Check required titles and show clear validation messages without losing entered values.',
    type: 'feature',
    status: 'review',
    assignee: 'Priya Shah',
    dueDate: '2026-10-22',
    createdDate: '2026-10-17',
  },
  {
    id: 'task-ci-build',
    title: 'Set up automated build checks',
    description: 'Run the production build on pull requests so broken changes are caught before merging.',
    type: 'feature',
    status: 'done',
    assignee: 'Leo Martins',
    dueDate: null,
    createdDate: '2026-10-16',
  },
];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', INITIAL_TASKS);
  // null closes the modal; { task: null } starts a new task.
  const [editing, setEditing] = useState(null);

  function saveTask(fields) {
    const today = new Date();
    const createdDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const task = editing.task
      ? { ...editing.task, ...fields }
      : { ...fields, id: crypto.randomUUID(), createdDate };
    setTasks((current) => editing.task
      ? current.map((item) => item.id === task.id ? task : item)
      : [...current, task]);
    setEditing(null);
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setEditing(null);
  }

  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage('vibetracker.anchors', [...]);

  return (
    <div className="min-h-screen bg-surface-page p-6 font-sans text-text-primary">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-primary">
            Project Tracker
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {/* Replace this line with your team name from PRD §11. */}
            Team starter
          </p>
        </div>
        <button type="button" onClick={() => setEditing({ task: null })}
          className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
          Add Task
        </button>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) above the board. */}

      <main aria-label="Task board" className="overflow-x-auto">
        <div className="grid min-w-[960px] grid-cols-4 gap-6">
          {STAGES.map((stage) => {
            const stageTasks = tasks.filter((task) => task.status === stage.id);

            return (
              <section key={stage.id} aria-labelledby={`stage-${stage.id}`}>
                <header className="mb-4 flex items-center justify-between border-b border-due-neutral pb-3">
                  <h2 id={`stage-${stage.id}`} className="text-base font-semibold uppercase">
                    {stage.label}
                  </h2>
                  <span className="font-mono text-xs text-text-muted" aria-label={`${stageTasks.length} tasks`}>
                    {stageTasks.length}
                  </span>
                </header>
                {stageTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-due-neutral p-6 text-center text-sm text-text-muted">
                    No tasks yet.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {stageTasks.map((task) => (
                      <li key={task.id}>
                        <article className={`rounded-lg border border-l-[3px] border-due-neutral bg-surface-card p-4 hover:shadow-sm ${
                          task.type === 'bug' ? 'border-l-type-bug' : 'border-l-type-feature'
                        }`}>
                          <p className="mb-2 font-mono text-xs text-text-muted">
                            {task.type === 'bug' ? 'Bug' : 'Feature'}
                          </p>
                          <h3 className="text-sm font-medium">
                            <button type="button" onClick={() => setEditing({ task })}
                              className="text-left underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                              aria-label={`Edit task: ${task.title}`}>
                              {task.title}
                            </button>
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-text-muted">{task.description}</p>
                          <span className="mt-4 inline-block max-w-full whitespace-normal break-words rounded-md border border-due-neutral bg-surface-page px-2 py-1 text-xs leading-relaxed text-text-muted">
                            <span className="sr-only">Assignee: </span>
                            {task.assignee?.trim() || 'Unassigned'}
                          </span>
                        </article>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </main>
      {editing && <TaskModal task={editing.task} stages={STAGES} team={TEAM}
        onSave={saveTask} onDelete={deleteTask} onClose={() => setEditing(null)} />}
    </div>
  );
}
