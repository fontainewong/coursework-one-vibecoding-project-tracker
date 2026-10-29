import test from 'node:test';
import assert from 'node:assert/strict';
import { loadWorkspace, migrateWorkspace } from './storage.js';
import { WORKSPACE_KEY, accessibleProjects } from './model.js';

function memory(entries = {}) { const values = new Map(Object.entries(entries)); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }
const legacy = { activeTeamId: 'p-old', teams: [{ id: 'p-old', name: 'Old work',
  members: [{ id: 'm1', name: 'Maya Chen', email: 'maya@example.com' }],
  tasks: [
    { id: 't1', title: 'Keep me', assignee: 'Maya Chen', createdDate: '2026-01-01', dueDate: '2026-10-10', context: 'Important results', contextTool: 'Claude', contextUpdatedAt: '2026-10-01T00:00:00Z', status: 'review', type: 'bug' },
    { id: 't2', title: 'Orphan owner', assignee: 'Former Member', status: 'todo' },
    { id: 't3', title: 'Nobody', assignee: '', status: 'todo' },
  ], anchors: [{ id: 'report', url: 'https://example.com/report' }] }] };

test('legacy workspace migration preserves tasks/context/dates/links and converts owners to IDs', () => {
  const original = structuredClone(legacy);
  const result = migrateWorkspace(legacy);
  const project = result.projects.find((item) => item.id === 'p-old');
  assert.equal(result.version, 2);
  assert.equal(result.activeProjectId, 'p-old');
  assert.equal(project.tasks.length, 3);
  const owner = result.users.find((user) => user.email === 'maya@example.com');
  assert.ok(project.memberUserIds.includes(owner.id));
  const task = project.tasks[0];
  for (const field of ['id', 'title', 'createdDate', 'dueDate', 'context', 'contextTool', 'contextUpdatedAt', 'status', 'type']) assert.deepEqual(task[field], legacy.teams[0].tasks[0][field]);
  assert.equal(task.assigneeUserId, owner.id);
  assert.equal(task.projectId, 'p-old');
  assert.equal('assignee' in task, false);
  assert.equal(project.anchors.find((item) => item.type === 'report').url, 'https://example.com/report');
  assert.ok(project.anchors.every((item) => item.projectId === project.id));
  assert.equal(project.tasks[2].assigneeUserId, null);
  assert.ok(result.users.some((user) => user.id === project.tasks[1].assigneeUserId && user.name === 'Former Member'));
  assert.deepEqual(legacy, original);
  assert.ok(accessibleProjects(result, 'demo-1').some((item) => item.id === 'p-old'));
});
test('same name in different projects with different emails keeps distinct identities', () => {
  const result = migrateWorkspace({ teams: ['one', 'two'].map((id) => ({ id, name: id, members: [{ id: 'm1', name: 'Alex Smith', email: `${id}@example.com` }], tasks: [{ id: id + '-task', assignee: 'Alex Smith' }] })) });
  assert.notEqual(result.projects[0].tasks[0].assigneeUserId, result.projects[1].tasks[0].assigneeUserId);
});
test('loading the legacy keys does not modify or delete them; migrated data round-trips', () => {
  const raw = JSON.stringify(legacy);
  const storage = memory({ 'vibetracker.workspace.v1': raw });
  const result = loadWorkspace(storage);
  assert.equal(storage.getItem('vibetracker.workspace.v1'), raw);
  assert.equal(result.projects.find((project) => project.id === 'p-old').anchors.find((group) => group.type === 'report').links[0].url, 'https://example.com/report');
  storage.setItem(WORKSPACE_KEY, JSON.stringify(result));
  assert.deepEqual(loadWorkspace(storage), result);
  assert.equal(migrateWorkspace(result), result);
});
test('old standalone task/anchor storage is also migrated without losing data', () => {
  const storage = memory({ 'vibetracker.tasks': JSON.stringify(legacy.teams[0].tasks), 'vibetracker.anchors': JSON.stringify(legacy.teams[0].anchors) });
  assert.equal(loadWorkspace(storage).projects.find((project) => project.id === 'starter').tasks[0].context, 'Important results');
});
test('fresh storage seeds eight users; invalid saved JSON stops rather than overwriting', () => {
  assert.equal(loadWorkspace(memory()).users.length, 8);
  const storage = memory({ [WORKSPACE_KEY]: 'broken' });
  assert.throws(() => loadWorkspace(storage));
  assert.equal(storage.getItem(WORKSPACE_KEY), 'broken');
});
test('explicit demo reset discards custom projects/profile edits but normal loads retain them', () => {
  const initial = loadWorkspace(memory());
  initial.users[0].name = 'Changed name';
  initial.projects.push({ id: 'custom', name: 'new new project', memberUserIds: ['demo-1'], tasks: [], milestones: [], anchors: [] });
  const storage = memory({ [WORKSPACE_KEY]: JSON.stringify(initial) });
  assert.ok(loadWorkspace(storage).projects.some((project) => project.id === 'custom'));
  const fresh = loadWorkspace(storage, { resetDemo: true });
  assert.equal(fresh.projects.length, 2);
  assert.equal(fresh.projects[0].id, 'demo-project');
  assert.equal(fresh.users[0].name, 'Amy Anderson');
  assert.ok(fresh.projects[0].tasks.every((task) => task.context.includes('## Pick up')));
  storage.setItem(WORKSPACE_KEY, JSON.stringify(fresh));
  assert.deepEqual(loadWorkspace(storage), fresh);
});
