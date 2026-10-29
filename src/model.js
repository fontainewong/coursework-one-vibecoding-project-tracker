export const STAGES = [
  { id: 'todo', label: 'To Do' }, { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' }, { id: 'done', label: 'Done' },
];
export const WORKSPACE_KEY = 'vibetracker.workspace.v2';
export const SESSION_KEY = 'vibetracker.session';
export const DEMO_LOGIN_IDS = ['demo-1', 'demo-2', 'demo-3'];
export const CONTEXT_TEMPLATE = '## Background\n\n## Constraints\n\n## Tried so far\n\n## Pick up\n';
export const DELIVERABLES = [
  { id: 'presentation', label: 'Presentation' }, { id: 'demo', label: 'Demo' },
  { id: 'report', label: 'Report' }, { id: 'documentation', label: 'Documentation' },
];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function initials(name) {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}
export function emptyLinks(projectId) {
  return DELIVERABLES.map((item) => ({ ...item, projectId, type: item.id, links: [] }));
}
export function memberUsers(project, users) {
  return users.filter((user) => project.memberUserIds.includes(user.id));
}
export function accessibleProjects(workspace, userId) {
  return workspace.projects.filter((project) => project.memberUserIds.includes(userId));
}
export function authenticate(users, email, password) {
  return users.find((user) => user.password && user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password) ?? null;
}
export function validateProfile(draft, users, id) {
  if (!draft.name.trim()) return { field: 'name', message: 'Enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return { field: 'email', message: 'Enter a valid email address.' };
  if (users.some((user) => user.id !== id && user.email.toLowerCase() === draft.email.trim().toLowerCase())) return { field: 'email', message: 'This email is already used by another account.' };
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(draft.githubUsername.trim()) || draft.githubUsername.includes('--')) return { field: 'githubUsername', message: 'Enter a GitHub username using letters, numbers and single hyphens (up to 39 characters).' };
  return null;
}
export function removeProjectMember(project, userId, replacementId = null) {
  if (replacementId && (replacementId === userId || !project.memberUserIds.includes(replacementId))) throw new Error('Choose a remaining project member.');
  return { ...project, memberUserIds: project.memberUserIds.filter((id) => id !== userId),
    tasks: project.tasks.map((task) => task.assigneeUserId === userId ? { ...task, assigneeUserId: replacementId } : task) };
}
export function saveTaskRecord(fields, previous, projectId, id, now = new Date()) {
  const context = fields.context ?? '';
  const contextTool = fields.contextTool || null;
  const changed = context !== (previous?.context ?? '') || contextTool !== (previous?.contextTool ?? null);
  return { ...previous, ...fields, id: previous?.id ?? id, projectId,
    assigneeUserId: fields.assigneeUserId || null, dueDate: fields.dueDate || null,
    createdDate: previous?.createdDate ?? localDate(now), context, contextTool,
    contextUpdatedAt: changed ? now.toISOString() : previous?.contextUpdatedAt ?? null };
}
export function taskMarkdown(task) {
  return `# ${task.title.trim()}\n\n## Description\n\n${task.description || ''}\n\n## Context\n\n${task.context || ''}`;
}
export function milestoneProgress(milestones) {
  const completed = milestones.filter((item) => item.completed).length;
  return { completed, total: milestones.length, percent: milestones.length ? Math.round(completed / milestones.length * 100) : 0 };
}
export function saveMilestoneRecord(fields, previous, project, id) {
  return { ...previous, id: previous?.id || id, projectId: project.id, title: fields.title.trim(),
    description: fields.description?.trim() || '', targetDate: fields.targetDate || null,
    completed: previous?.completed ?? false,
    taskIds: [...new Set(fields.taskIds || [])].filter((taskId) => project.tasks.some((task) => task.id === taskId)) };
}
export function isWebUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !!url.hostname; }
  catch { return false; }
}
export function saveDeliverableLink(group, fields, id) {
  const url = fields.url.trim();
  if (!isWebUrl(url)) throw new Error('Enter a complete http:// or https:// URL.');
  const link = { id: fields.id || id, projectId: group.projectId, type: group.type, title: fields.title?.trim() || new URL(url).hostname, url };
  return { ...group, links: fields.id ? group.links.map((item) => item.id === fields.id ? link : item) : [...group.links, link] };
}
export function removeDeliverableLink(group, id) {
  return { ...group, links: group.links.filter((link) => link.id !== id) };
}
export function deleteProjectRecord(workspace, projectId, confirmation, userId) {
  const project = workspace.projects.find((item) => item.id === projectId && item.memberUserIds.includes(userId));
  if (!project) throw new Error('This project is not available to your account.');
  if (confirmation !== `delete ${project.name}`) throw new Error(`Type delete ${project.name} exactly to confirm.`);
  const projects = workspace.projects.filter((item) => item.id !== projectId);
  return { ...workspace, projects, activeProjectId: projects.find((item) => item.memberUserIds.includes(userId))?.id ?? null };
}
