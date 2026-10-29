import { useEffect, useState } from 'react';
import TaskModal from './TaskModal';
import DeliverablesBoard from './DeliverablesBoard';
import TaskCalendar from './TaskCalendar';
import TaskType from './TaskType';
import TeamPanel from './TeamPanel';
import CreateTeamModal from './CreateTeamModal';
import ProjectMenu from './ProjectMenu';
import MemberView from './MemberView';
import Login from './Login';
import ProfileModal from './ProfileModal';
import Milestones from './Milestones';
import AssigneeBadge from './AssigneeBadge';
import FeedbackNotice from './FeedbackNotice';
import { getDeadline } from './deadline';
import { filterTasks } from './taskFilters';
import { loadWorkspace } from './storage.js';
import { defaultProjectId } from './seedData.js';
import { WORKSPACE_KEY, SESSION_KEY, STAGES, accessibleProjects, memberUsers, emptyLinks, saveTaskRecord, deleteProjectRecord, initials, assignmentFeedback } from './model.js';

const EMPTY_FILTERS = { search: '', assignee: '*', type: 'all', overdue: false };
const control = 'min-h-11 rounded-md border border-due-neutral bg-surface-card px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

export default function App() {
  const [resetRequested] = useState(() => new URLSearchParams(window.location.search).get('resetDemo') === '1');
  const [loaded] = useState(() => {
    try { return { workspace: loadWorkspace(window.localStorage, { resetDemo: resetRequested }) }; }
    catch { return { error: 'Saved data could not be loaded. It has not been replaced. Please check browser storage and reload.' }; }
  });
  const [workspace, setWorkspace] = useState(loaded.workspace);
  const [storageError, setStorageError] = useState('');
  const [sessionId, setSessionId] = useState(() => {
    if (resetRequested) return null;
    try { return window.sessionStorage.getItem(SESSION_KEY); } catch { return null; }
  });
  const [teamOpen, setTeamOpen] = useState(false);
  const [memberId, setMemberId] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [view, setView] = useState('board');
  const [feedback, setFeedback] = useState('');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(''), 7000);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  useEffect(() => {
    if (!resetRequested) return;
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* The in-memory session is already signed out. */ }
    const url = new URL(window.location.href);
    url.searchParams.delete('resetDemo');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }, [resetRequested]);
  useEffect(() => {
    if (!workspace) return;
    try { window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); setStorageError(''); }
    catch { setStorageError('Changes could not be saved to this browser. Keep this page open and allow browser storage before reloading.'); }
  }, [workspace]);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  function closeViews() { setTeamOpen(false); setMemberId(null); setCreatingProject(false); setProfileOpen(false); setEditing(null); setFilters(EMPTY_FILTERS); setView('board'); setFeedback(''); }
  function signIn(id) {
    closeViews(); setSessionId(id);
    setWorkspace((current) => ({ ...current, activeProjectId: defaultProjectId(current, id) }));
    try { window.sessionStorage.setItem(SESSION_KEY, id); } catch { /* The session can still work until reload. */ }
  }
  function signOut() {
    closeViews(); setSessionId(null);
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* No persisted session when storage is unavailable. */ }
  }
  if (!workspace) return <main className="p-6"><h1 className="text-xl font-semibold">Project Tracker</h1><p role="alert" className="mt-4">{loaded.error}</p></main>;
  const user = workspace.users.find((item) => item.id === sessionId);
  // Do not render any project UI or data before simulated sign-in.
  if (!user) return <>{storageError && <p role="alert" className="p-4 text-sm">{storageError}</p>}<Login users={workspace.users} onSignIn={signIn}/></>;

  const projects = accessibleProjects(workspace, user.id);
  const project = projects.find((item) => item.id === workspace.activeProjectId) ?? projects[0];
  const members = project ? memberUsers(project, workspace.users) : [];
  const menuProject = project ? { ...project, members } : { id: '', name: 'Choose project', members: [] };
  const selectedMember = members.find((member) => member.id === memberId);
  const visibleTasks = filterTasks(project?.tasks || [], filters, now);
  const hasFilters = filters.search !== '' || filters.assignee !== '*' || filters.type !== 'all' || filters.overdue;
  function updateProject(updated) {
    setFeedback('');
    setWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === updated.id ? updated : item) }));
    if (filters.assignee !== '*' && filters.assignee !== '' && !updated.memberUserIds.includes(filters.assignee)) setFilters({ ...filters, assignee: '*' });
  }
  function switchProject(id) {
    if (!projects.some((item) => item.id === id)) return;
    closeViews(); setWorkspace((current) => ({ ...current, activeProjectId: id }));
  }
  function createProject(name) {
    const id = crypto.randomUUID();
    setWorkspace((current) => ({ ...current, activeProjectId: id, projects: [...current.projects, { id, name, memberUserIds: [user.id], tasks: [], milestones: [], anchors: emptyLinks(id) }] }));
    closeViews(); setFeedback('Project created.'); setTeamOpen(true);
  }
  function saveTask(fields) {
    const task = saveTaskRecord(fields, editing.task, project.id, crypto.randomUUID());
    updateProject({ ...project, tasks: editing.task ? project.tasks.map((item) => item.id === task.id ? task : item) : [...project.tasks, task] });
    setFeedback(assignmentFeedback(editing.task, task, workspace.users) || (editing.task ? 'Task saved.' : 'Task created.'));
    setEditing(null);
  }
  function deleteTask(id) { updateProject({ ...project, tasks: project.tasks.filter((item) => item.id !== id), milestones: project.milestones.map((item) => ({ ...item, taskIds: item.taskIds.filter((taskId) => taskId !== id) })) }); setEditing(null); setFeedback('Task deleted.'); }
  function saveAnchor(updated) { updateProject({ ...project, anchors: project.anchors.map((anchor) => anchor.id === updated.id ? updated : anchor) }); }
  function deleteProject(confirmation) {
    const updated = deleteProjectRecord(workspace, project.id, confirmation, user.id);
    closeViews(); setWorkspace(updated); setFeedback('Project deleted.');
  }
  function saveProfile(updated) {
    setWorkspace((current) => ({ ...current, users: current.users.map((item) => item.id === user.id ? updated : item) }));
    setFeedback('Profile saved.');
  }
  const editTask = (task) => { setFeedback(''); setEditing({ task }); };
  return <div className="min-h-screen bg-surface-page p-6 font-sans text-text-primary">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-primary focus:px-4 focus:py-3 focus:text-white">Skip to content</a>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold">Project Tracker</h1>
        <button type="button" onClick={() => setProfileOpen(true)} title="Your profile" aria-label={`Your profile: ${user.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-due-neutral bg-surface-card text-sm font-semibold hover:bg-due-neutral">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover"/> : <span aria-hidden="true">{initials(user.name)}</span>}
        </button>
    </header>
    {storageError && <p role="alert" className="mb-4 rounded-lg border border-due-neutral bg-surface-card p-4 text-sm">{storageError}</p>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
    <div role="group" aria-label="Project views" className="flex flex-wrap items-center gap-2">
      <button type="button" aria-label="Add task" title={view === 'board' ? 'Add task' : 'Add task is available in Board'} disabled={!project || view !== 'board'} onClick={() => { setFeedback(''); setEditing({ task: null }); }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-primary text-white disabled:cursor-not-allowed disabled:opacity-40"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></button>
      <span aria-hidden="true" className="mx-2 text-due-neutral">|</span>
      {['board', 'calendar', 'deliverables', 'milestones'].map((option) => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)} className={`min-h-11 rounded-md border px-4 py-2 text-sm font-medium capitalize ${view === option ? 'border-brand-primary bg-brand-primary text-white' : 'border-due-neutral bg-surface-card'}`}>{option}</button>)}
    </div>
    <div className="ml-auto"><ProjectMenu team={menuProject} teams={projects} onSwitch={switchProject} onCreate={() => setCreatingProject(true)} onManage={project ? () => setTeamOpen(true) : null} onMember={setMemberId}/></div>
    </div>
    <fieldset disabled={!project || !['board', 'calendar'].includes(view)} role="search" aria-label="Find tasks" className="task-filters mb-4 min-w-0 rounded-lg border border-due-neutral bg-surface-card p-4 disabled:opacity-50">
      <label className="min-w-0 text-xs text-text-muted">Search task titles<input type="search" placeholder="Search titles…" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} className={`${control} mt-1 w-full text-text-primary`}/></label>
      <label className="min-w-0 text-xs text-text-muted">Assignee<select value={filters.assignee} onChange={(event) => setFilters({ ...filters, assignee: event.target.value })} className={`${control} mt-1 block w-full min-w-0 text-text-primary`}><option value="*">All members</option><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
      <label className="min-w-0 text-xs text-text-muted">Task type<select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} className={`${control} mt-1 block w-full min-w-0 text-text-primary`}><option value="all">All types</option><option value="bug">Bug</option><option value="feature">Feature</option></select></label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={filters.overdue} onChange={(event) => setFilters({ ...filters, overdue: event.target.checked })} className="h-4 w-4 accent-brand-primary"/>Overdue only</label>
      <button type="button" disabled={!hasFilters} onClick={() => setFilters(EMPTY_FILTERS)} className={`${control} whitespace-nowrap disabled:opacity-40`}>Clear filters</button>
    </fieldset>
    <FeedbackNotice message={feedback}/>
    <main id="main-content" tabIndex={-1} aria-label={view === 'board' ? 'Task board' : view} className="min-w-0 overflow-x-auto">
      {!project ? <p className="rounded-lg border border-dashed border-due-neutral p-6 text-sm text-text-muted">You have no projects yet. Use the project menu to create one.</p> : view === 'deliverables' ? <DeliverablesBoard key={project.id} anchors={project.anchors} onSave={saveAnchor}/> : view === 'milestones' ? <Milestones key={project.id} project={project} onUpdate={updateProject}/> : view === 'calendar' ? <TaskCalendar key={project.id} tasks={visibleTasks} users={workspace.users} today={now} onEdit={editTask}/> :
        <div className="grid w-full min-w-[960px] grid-cols-4 gap-6">{STAGES.map((stage) => {
          const tasks = visibleTasks.filter((task) => task.status === stage.id);
          return <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="min-w-0">
            <header className="mb-4 flex items-center justify-between border-b border-due-neutral pb-3"><h2 id={`stage-${stage.id}`} className="text-base font-semibold uppercase">{stage.label}</h2><span className="font-mono text-xs text-text-muted" aria-label={`${tasks.length} tasks`}>{tasks.length}</span></header>
            {!tasks.length ? <p className="rounded-lg border border-dashed border-due-neutral p-6 text-center text-sm text-text-muted">{hasFilters ? 'No matching tasks.' : 'No tasks yet.'}</p> : <ul className="space-y-4">{tasks.map((task) => {
              const deadline = getDeadline(task, now);
              return <li key={task.id}><article className={`min-w-0 rounded-lg border border-due-neutral p-4 [overflow-wrap:anywhere] ${deadline.tint}`}>
                <TaskType type={task.type}/><h3 className="mt-2 text-sm font-medium"><button type="button" onClick={() => editTask(task)} aria-label={`Edit task: ${task.title}`} className="text-left underline-offset-4 hover:underline">{task.title}</button></h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{task.description}</p><div className="mt-4"><AssigneeBadge user={workspace.users.find((item) => item.id === task.assigneeUserId)}/></div>
                <p className="mt-3 text-xs">{deadline.label}</p>
              </article></li>;
            })}</ul>}
          </section>;
        })}</div>}
    </main>
    {teamOpen && project && <TeamPanel project={project} users={workspace.users} currentUserId={user.id} now={now} onUpdate={updateProject} onClose={() => setTeamOpen(false)} onEditTask={editTask} onDelete={deleteProject} taskFeedback={feedback}/>}
    {selectedMember && <MemberView member={selectedMember} tasks={project.tasks} now={now} onClose={() => setMemberId(null)} onEditTask={editTask} feedback={feedback}/>}
    {creatingProject && <CreateTeamModal onCreate={createProject} onClose={() => setCreatingProject(false)}/>}
    {profileOpen && <ProfileModal user={user} users={workspace.users} onSave={saveProfile} onClose={() => setProfileOpen(false)} onSignOut={signOut}/>}
    {editing && project && <TaskModal task={editing.task} stages={STAGES} team={members} onSave={saveTask} onDelete={deleteTask} onClose={() => setEditing(null)}/>}
  </div>;
}
