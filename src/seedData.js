import { emptyLinks, localDate } from './model.js';

export const DEMO_PASSWORD = 'Demo123!';
export const LIVE_DEMO_URL = 'https://coursework-one-vibecoding-project-t.vercel.app/';
export function demoLinks(projectId) {
  return emptyLinks(projectId).map((group) => ({ ...group, links: ['report', 'documentation'].includes(group.type) ? [] : [{ id: `seed-live-demo:${projectId}:${group.type}`, projectId, type: group.type, title: group.type === 'demo' ? 'Live prototype' : `${group.label} example`, url: LIVE_DEMO_URL }] }));
}
export function sampleContext(task) {
  return `## Background\n\nWe are working on "${task.title}" for the coursework project tracker.\n\n## Constraints\n\n- Use the existing React components and design tokens.\n- Keep data in localStorage and make the interaction keyboard accessible.\n\n## Tried so far\n\nPrompt: "Suggest a simple approach for ${task.title.toLowerCase()}."\nResult: Keep the change small, reuse the current UI, and check both the normal and empty states.\n\n## Pick up\n\n${task.status === 'done' ? 'The example is complete. Review the result when related work changes.' : 'Continue from the suggested approach, then verify the interaction and record the outcome here.'}\n`;
}
export function demoUsers() {
  return ['Amy Anderson', 'Ben Baker', 'Chloe Carter', 'Daniel Davis', 'Emma Evans', 'Frank Foster', 'Grace Green', 'Henry Hudson'].map((name, index) => ({
    id: `demo-${index + 1}`, name, email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
    password: DEMO_PASSWORD, githubUsername: name.toLowerCase().replace(' ', ''), isDemo: true,
  }));
}
export function demoProject(now = new Date()) {
  const projectId = 'demo-project';
  const date = (offset) => { const day = new Date(now); day.setDate(day.getDate() + offset); return localDate(day); };
  const definitions = [
    ['Design task cards', 'feature', 'todo', 'demo-1', 2],
    ['Fix calendar date labels', 'bug', 'in-progress', 'demo-2', -1],
    ['Review keyboard navigation', 'feature', 'review', 'demo-3', 0],
    ['Set up project workspace', 'feature', 'done', 'demo-1', -2],
    ['Add useful AI context', 'feature', 'todo', 'demo-4', 3],
    ['Check form validation', 'bug', 'in-progress', 'demo-4', 7],
    ['Plan the next review', 'feature', 'todo', null, null],
    ['Check task handoffs', 'feature', 'in-progress', 'demo-6', 4],
    ['Review calendar accessibility', 'feature', 'review', 'demo-7', 2],
    ['Fix long task title wrapping', 'bug', 'todo', 'demo-6', 5],
  ];
  return { id: projectId, name: 'Coursework Project', memberUserIds: ['demo-1', 'demo-2', 'demo-4', 'demo-6', 'demo-7'],
    tasks: definitions.map(([title, type, status, assigneeUserId, offset], index) => ({
      id: `demo-task-${index + 1}`, projectId, title, type, status, assigneeUserId: assigneeUserId === 'demo-3' ? 'demo-1' : assigneeUserId,
      description: 'A sample task for exploring the project tracker.', dueDate: offset === null ? null : date(offset),
      createdDate: date(-3), context: sampleContext({ title, status }), contextTool: 'ChatGPT', contextUpdatedAt: now.toISOString(),
    })),
    milestones: [{ id: 'demo-milestone-1', projectId, title: 'Prototype review', description: 'Review the task board and keyboard navigation before presenting the prototype.', taskIds: ['demo-task-1', 'demo-task-3'], targetDate: date(7), completed: false },
      { id: 'demo-milestone-2', projectId, title: 'Workspace ready', description: 'Agree the initial project structure.', taskIds: ['demo-task-4'], targetDate: date(-2), completed: true },
      { id: 'demo-milestone-3', projectId, title: 'Presentation ready', description: 'Prepare the final walkthrough.', taskIds: ['demo-task-7'], targetDate: date(10), completed: false }],
    anchors: demoLinks(projectId),
  };
}
export function smallTeamProject(now = new Date()) {
  const projectId = 'demo-small-team';
  const date = (offset) => { const day = new Date(now); day.setDate(day.getDate() + offset); return localDate(day); };
  return { id: projectId, name: 'Interface Study', memberUserIds: ['demo-1', 'demo-3', 'demo-5', 'demo-8'],
    tasks: [
      { id: 'small-task-1', title: 'Sketch the navigation', type: 'feature', status: 'in-progress', assigneeUserId: 'demo-3', dueDate: date(2) },
      { id: 'small-task-2', title: 'Check form labels', type: 'bug', status: 'review', assigneeUserId: 'demo-5', dueDate: date(3) },
      { id: 'small-task-3', title: 'Prepare the study notes', type: 'feature', status: 'todo', assigneeUserId: 'demo-8', dueDate: date(5) },
      { id: 'small-task-4', title: 'Draft the study questions', type: 'feature', status: 'todo', assigneeUserId: 'demo-1', dueDate: date(2) },
      { id: 'small-task-5', title: 'Review participant feedback', type: 'feature', status: 'review', assigneeUserId: 'demo-3', dueDate: date(4) },
    ].map((task) => ({ ...task, projectId, description: 'A task for the smaller interface study team.', createdDate: date(-2), context: sampleContext(task), contextTool: 'ChatGPT', contextUpdatedAt: now.toISOString() })),
    milestones: [{ id: 'small-milestone-1', projectId, title: 'Navigation review', description: 'Review the navigation and form labels with the small team.', taskIds: ['small-task-1', 'small-task-2'], targetDate: date(5), completed: false },
      { id: 'small-milestone-2', projectId, title: 'Study brief agreed', description: 'Confirm the study scope.', taskIds: [], targetDate: date(-3), completed: true },
      { id: 'small-milestone-3', projectId, title: 'Participants invited', description: 'Arrange the study sessions.', taskIds: [], targetDate: date(-1), completed: true },
      { id: 'small-milestone-4', projectId, title: 'Findings ready', description: 'Summarise the study findings.', taskIds: ['small-task-5'], targetDate: date(8), completed: false }],
    anchors: demoLinks(projectId),
  };
}
export function seedWorkspace(now = new Date()) {
  return { version: 2, schemaRevision: 7, users: demoUsers(), projects: [demoProject(now), smallTeamProject(now), presentationProject(now)], activeProjectId: 'demo-project' };
}

export function presentationProject(now = new Date()) {
  const source = smallTeamProject(now);
  const id = 'demo-presentation';
  const owners = ['demo-2', 'demo-3', 'demo-4', 'demo-8', 'demo-2'];
  return { ...source, id, name: 'Presentation Prep', memberUserIds: ['demo-2', 'demo-3', 'demo-4', 'demo-8'],
    tasks: source.tasks.map((task, index) => ({ ...task, id: `presentation-task-${index + 1}`, projectId: id, title: ['Draft presentation outline', 'Review demo script', 'Prepare screenshots', 'Check presentation timing', 'Rehearse the walkthrough'][index], assigneeUserId: owners[index] })),
    milestones: source.milestones.slice(0, 3).map((item, index) => ({ ...item, id: `presentation-milestone-${index + 1}`, projectId: id, title: ['Final rehearsal', 'Outline agreed', 'Demo script ready'][index], taskIds: [] })), anchors: demoLinks(id) };
}

export function defaultProjectId(workspace, userId) {
  const preferred = { 'demo-1': 'demo-project', 'demo-2': 'demo-presentation', 'demo-3': 'demo-small-team' }[userId];
  return workspace.projects.find((project) => project.id === preferred && project.memberUserIds.includes(userId))?.id
    ?? workspace.projects.find((project) => project.memberUserIds.includes(userId))?.id ?? null;
}
