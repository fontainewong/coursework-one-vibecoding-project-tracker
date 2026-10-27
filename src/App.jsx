import { useState, useEffect } from 'react';
import TaskModal from './TaskModal';
import { getDeadline } from './deadline';
import DeliverablesBoard, { INITIAL_ANCHORS } from './DeliverablesBoard';
import TaskCalendar from './TaskCalendar';
import TaskType from './TaskType';
import TeamPanel from './TeamPanel';
import CreateTeamModal from './CreateTeamModal';
import { filterTasks } from './taskFilters';
import ProjectMenu from './ProjectMenu';
import MemberView from './MemberView';

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
 * @property {string} context
 * @property {string|null} contextTool
 * @property {string|null} contextUpdatedAt ISO timestamp
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
      return raw != null ? JSON.parse(raw) : typeof initialValue === 'function' ? initialValue() : initialValue;
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
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

const EMPTY_FILTERS = { search: '', assignee: '*', type: 'all', overdue: false };

function initialWorkspace() {
  function readLegacy(key, fallback) {
    try { return JSON.parse(window.localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  const tasks = readLegacy('vibetracker.tasks', INITIAL_TASKS);
  const names = [...new Set([...TEAM, ...tasks.map((task) => task.assignee).filter(Boolean)])];
  return { activeTeamId: 'starter', teams: [{ id: 'starter', name: 'Team starter',
    members: names.map((name, index) => ({ id: `member-${index}`, name })),
    tasks, anchors: readLegacy('vibetracker.anchors', INITIAL_ANCHORS),
  }] };
}

export default function App() {
  const [workspace, setWorkspace] = useLocalStorage('vibetracker.workspace.v1', initialWorkspace);
  const team = workspace.teams.find((item) => item.id === workspace.activeTeamId) ?? workspace.teams[0];
  const tasks = team.tasks;
  const anchors = team.anchors;
  const [teamOpen, setTeamOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const selectedMember = team.members.find((member) => member.id === memberId);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const hasFilters = filters.search !== '' || filters.assignee !== '*' || filters.type !== 'all' || filters.overdue;
  function updateTeam(updated) {
    setWorkspace((current) => ({ ...current, teams: current.teams.map((item) => item.id === updated.id ? updated : item) }));
    setFilters((current) => current.assignee !== '*' && current.assignee !== '' && !updated.members.some((member) => member.name === current.assignee) ? { ...current, assignee: '*' } : current);
  }
  function setTasks(update) { updateTeam({ ...team, tasks: typeof update === 'function' ? update(team.tasks) : update }); }
  function switchTeam(id) {
    setWorkspace((current) => ({ ...current, activeTeamId: id }));
    setFilters(EMPTY_FILTERS); setEditing(null); setTeamOpen(false);
  }
  function createTeam(name) {
    const id = crypto.randomUUID();
    setWorkspace((current) => ({ activeTeamId: id, teams: [...current.teams, { id, name, members: [], tasks: [], anchors: INITIAL_ANCHORS.map((anchor) => ({ ...anchor, url: null })) }] }));
    setFilters(EMPTY_FILTERS); setCreatingTeam(false); setTeamOpen(true);
  }
  // null closes the modal; { task: null } starts a new task.
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('board');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  function saveTask(fields) {
    const today = new Date();
    const context = fields.context ?? '';
    const contextTool = fields.contextTool || null;
    const contextChanged = context !== (editing.task?.context ?? '') ||
      contextTool !== (editing.task?.contextTool ?? null);
    const contextUpdatedAt = contextChanged
      ? today.toISOString()
      : editing.task?.contextUpdatedAt ?? null;
    const savedFields = { ...fields, context, contextTool, contextUpdatedAt };
    const createdDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const task = editing.task
      ? { ...editing.task, ...savedFields }
      : { ...savedFields, id: crypto.randomUUID(), createdDate };
    setTasks((current) => editing.task
      ? current.map((item) => item.id === task.id ? task : item)
      : [...current, task]);
    setEditing(null);
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setEditing(null);
  }

  function saveAnchor(id, url) {
    updateTeam({ ...team, anchors: INITIAL_ANCHORS.map((definition) => ({
      ...definition,
      url: definition.id === id ? url : anchors.find((anchor) => anchor.id === definition.id)?.url ?? null,
    })) });
  }

  const visibleTasks = filterTasks(tasks, filters, now);
  const controlClass = 'min-h-11 rounded-md border border-due-neutral bg-surface-card px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

  return (
    <div className="min-h-screen bg-surface-page p-6 font-sans text-text-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-primary focus:px-4 focus:py-3 focus:text-white">Skip to content</a>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-primary">
            Project Tracker
          </h1>
        </div>
        <ProjectMenu team={team} teams={workspace.teams} onSwitch={switchTeam} onCreate={() => setCreatingTeam(true)} onManage={() => setTeamOpen(true)} onMember={setMemberId}/>
      </header>

      <div role="group" aria-label="Board controls" className="mb-4 flex flex-wrap items-center gap-2">
        <button type="button" aria-label="Add task" title="Add task" onClick={() => setEditing({ task: null })}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
        <span aria-hidden="true" className="mx-2 text-due-neutral">|</span>
        {['board', 'calendar', 'deliverables'].map((option) => (
          <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}
            className={`min-h-11 rounded-md border px-4 py-2 text-sm font-medium capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${view === option ? 'border-brand-primary bg-brand-primary text-white' : 'border-due-neutral bg-surface-card text-text-primary'}`}>
            {option}
          </button>
        ))}
      </div>
      <fieldset disabled={view === 'deliverables'} role="search" aria-label="Find tasks" className="task-filters mb-4 min-w-0 rounded-lg border border-due-neutral bg-surface-card p-4 disabled:opacity-50">
        <label className="min-w-0 text-xs text-text-muted">Search task titles
          <input type="search" placeholder="Search titles…" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className={`${controlClass} mt-1 w-full text-text-primary`} />
        </label>
        <label className="min-w-0 text-xs text-text-muted">Assignee<select value={filters.assignee} onChange={(event) => setFilters({ ...filters, assignee: event.target.value })} className={`${controlClass} mt-1 block w-full min-w-0 text-text-primary`}>
          <option value="*">All members</option><option value="">Unassigned</option>
          {team.members.map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}
        </select></label>
        <label className="min-w-0 text-xs text-text-muted">Task type<select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} className={`${controlClass} mt-1 block w-full min-w-0 text-text-primary`}>
          <option value="all">All types</option><option value="bug">Bug</option><option value="feature">Feature</option>
        </select></label>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.checked })} className="h-4 w-4 accent-brand-primary"/>Overdue only</label>
        <button type="button" disabled={!hasFilters} onClick={() => setFilters(EMPTY_FILTERS)} className={`${controlClass} whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40`}>Clear filters</button>
      </fieldset>
      <main id="main-content" tabIndex={-1} aria-label={view === 'deliverables' ? 'Deliverables' : view === 'board' ? 'Task board' : 'Task calendar'} className="min-w-0 overflow-x-auto">
        {view === 'deliverables' ? <DeliverablesBoard key={team.id} anchors={anchors} onSave={saveAnchor} /> : view === 'calendar' ? <TaskCalendar key={team.id} tasks={visibleTasks} today={now} onEdit={(task) => setEditing({ task })} /> : (
        <div className="grid w-full min-w-[960px] grid-cols-4 gap-6">
          {STAGES.map((stage) => {
            const stageTasks = visibleTasks.filter((task) => task.status === stage.id);

            return (
              <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="min-w-0">
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
                    {hasFilters ? 'No matching tasks.' : 'No tasks yet.'}
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {stageTasks.map((task) => {
                      const deadline = getDeadline(task, now);
                      return (
                      <li key={task.id}>
                        <article className={`min-w-0 [overflow-wrap:anywhere] rounded-lg border border-l-[3px] border-due-neutral p-4 hover:shadow-sm ${deadline.tint} ${
                          task.type === 'bug' ? 'border-l-type-bug' : 'border-l-type-feature'
                        }`}>
                          <div className="mb-2"><TaskType type={task.type}/></div>
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
                          <p className="mt-3 text-xs leading-relaxed text-text-primary">{deadline.label}</p>
                        </article>
                      </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
        )}
      </main>
      {teamOpen && <TeamPanel team={team} now={now} onUpdate={updateTeam} onClose={() => setTeamOpen(false)} onEditTask={(task) => setEditing({ task })}/>}
      {selectedMember && <MemberView member={selectedMember} tasks={team.tasks} now={now} onClose={() => setMemberId(null)} onEditTask={(task) => setEditing({ task })}/>}
      {creatingTeam && <CreateTeamModal onCreate={createTeam} onClose={() => setCreatingTeam(false)}/>}
      {editing && <TaskModal task={editing.task} stages={STAGES} team={team.members.map((member) => member.name)}
        onSave={saveTask} onDelete={deleteTask} onClose={() => setEditing(null)} />}
    </div>
  );
}
