import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticate, accessibleProjects, memberUsers, removeProjectMember, validateProfile, saveTaskRecord, taskMarkdown, milestoneProgress, CONTEXT_TEMPLATE, DEMO_LOGIN_IDS, assignmentFeedback } from './model.js';
import { seedWorkspace, DEMO_PASSWORD } from './seedData.js';

test('eight distinct A–H demo accounts sign in; invalid credentials do not', () => {
  const { users } = seedWorkspace();
  assert.equal(users.length, 8);
  assert.deepEqual(users.map((user) => user.name[0]), [...'ABCDEFGH']);
  assert.equal(new Set(users.map((user) => user.id)).size, 8);
  for (const user of users) {
    assert.equal(authenticate(users, ` ${user.email.toUpperCase()} `, DEMO_PASSWORD)?.id, user.id);
    assert.ok(user.githubUsername);
  }
  assert.equal(authenticate(users, users[0].email, 'wrong'), null);
  assert.equal(authenticate(users, 'unknown@example.com', DEMO_PASSWORD), null);
});
test('project visibility is limited to memberships, including after removal', () => {
  const workspace = seedWorkspace();
  workspace.projects.push({ id: 'private', memberUserIds: ['demo-1'], tasks: [] });
  assert.deepEqual(accessibleProjects(workspace, 'demo-2').map((project) => project.id), ['demo-project', 'demo-presentation']);
  assert.equal(accessibleProjects(workspace, null).length, 0);
  const project = removeProjectMember(workspace.projects[0], 'demo-2');
  workspace.projects[0] = project;
  assert.deepEqual(accessibleProjects(workspace, 'demo-2').map((project) => project.id), ['demo-presentation']);
});
test('A–C are the three offered demo logins and each can access seeded project data', () => {
  const workspace = seedWorkspace();
  assert.deepEqual(workspace.users.filter((user) => DEMO_LOGIN_IDS.includes(user.id)).map((user) => user.name), ['Amy Anderson', 'Ben Baker', 'Chloe Carter']);
  for (const id of DEMO_LOGIN_IDS) {
    const projects = accessibleProjects(workspace, id);
    assert.equal(projects.length, 2);
    assert.ok(projects[0].tasks.length);
  }
});
test('profile changes preserve ID-based task and project membership', () => {
  const workspace = seedWorkspace();
  const before = workspace.projects[0].tasks.filter((task) => task.assigneeUserId === 'demo-1');
  workspace.users[0] = { ...workspace.users[0], name: 'Amy Updated', email: 'amy.updated@example.com' };
  assert.equal(memberUsers(workspace.projects[0], workspace.users)[0].name, 'Amy Updated');
  assert.deepEqual(workspace.projects[0].tasks.filter((task) => task.assigneeUserId === 'demo-1'), before);
  assert.equal(authenticate(workspace.users, 'amy.updated@example.com', DEMO_PASSWORD)?.id, 'demo-1');
});
test('profile validation rejects missing name, invalid/duplicate email and invalid GitHub', () => {
  const { users } = seedWorkspace();
  const user = users[0];
  assert.equal(validateProfile(user, users, user.id), null);
  assert.equal(validateProfile({ ...user, name: '  ' }, users, user.id).field, 'name');
  assert.equal(validateProfile({ ...user, email: 'bad' }, users, user.id).field, 'email');
  assert.equal(validateProfile({ ...user, email: users[1].email.toUpperCase() }, users, user.id).field, 'email');
  for (const githubUsername of ['', '-bad', 'bad--name', 'two words']) assert.equal(validateProfile({ ...user, githubUsername }, users, user.id).field, 'githubUsername');
});
test('member removal keeps tasks and transfers or unassigns all statuses', () => {
  const project = seedWorkspace().projects[0];
  const before = structuredClone(project);
  const transferred = removeProjectMember(project, 'demo-1', 'demo-2');
  assert.equal(transferred.tasks.length, project.tasks.length);
  assert.equal(transferred.tasks.filter((task) => task.assigneeUserId === 'demo-1').length, 0);
  assert.ok(transferred.tasks.find((task) => task.status === 'done' && task.assigneeUserId === 'demo-2'));
  const unassigned = removeProjectMember(project, 'demo-1');
  for (const task of project.tasks.filter((item) => item.assigneeUserId === 'demo-1')) assert.equal(unassigned.tasks.find((item) => item.id === task.id).assigneeUserId, null);
  assert.deepEqual(project, before);
  assert.throws(() => removeProjectMember(project, 'demo-1', 'not-a-member'));
  assert.throws(() => removeProjectMember(project, 'demo-1', 'demo-1'));
});
test('task edits keep creation date and only change context timestamp when needed', () => {
  const now = new Date(2026, 9, 28, 15);
  const fields = { title: 'Task', description: '', context: CONTEXT_TEMPLATE, contextTool: null, assigneeUserId: '', dueDate: '' };
  const task = saveTaskRecord(fields, null, 'p1', 't1', now);
  assert.equal(task.assigneeUserId, null);
  assert.equal(task.dueDate, null);
  assert.equal(task.createdDate, '2026-10-28');
  assert.equal(task.projectId, 'p1');
  assert.equal(task.contextUpdatedAt, now.toISOString());
  const later = new Date(2026, 10, 2);
  const edited = saveTaskRecord({ ...task, title: 'Updated' }, task, 'p1', 'ignored', later);
  assert.equal(edited.id, 't1');
  assert.equal(edited.createdDate, task.createdDate);
  assert.equal(edited.contextUpdatedAt, task.contextUpdatedAt);
  assert.equal(saveTaskRecord({ ...task, contextTool: 'ChatGPT' }, task, 'p1', 'ignored', later).contextUpdatedAt, later.toISOString());
});
test('Markdown contains title, description and full context, even when context is empty', () => {
  assert.equal(taskMarkdown({ title: 'Title', description: 'Details', context: '## Background\nText' }), '# Title\n\n## Description\n\nDetails\n\n## Context\n\n## Background\nText');
  assert.ok(taskMarkdown({ title: 'Title', description: '', context: '' }).includes('# Title'));
});
test('milestone progress handles empty, mixed and complete lists', () => {
  assert.deepEqual(milestoneProgress([]), { completed: 0, total: 0, percent: 0 });
  assert.deepEqual(milestoneProgress([{ completed: true }, { completed: false }, { completed: false }]), { completed: 1, total: 3, percent: 33 });
  assert.equal(milestoneProgress([{ completed: true }]).percent, 100);
});
test('assignment feedback identifies the task/new owner, unassignment and unchanged ownership', () => {
  const { users } = seedWorkspace();
  const before = { title: 'Review forms', assigneeUserId: 'demo-1' };
  assert.equal(assignmentFeedback(before, { ...before, assigneeUserId: 'demo-2' }, users), 'Assigned “Review forms” to Ben Baker.');
  assert.equal(assignmentFeedback(before, { ...before, assigneeUserId: null }, users), '“Review forms” is now unassigned.');
  assert.equal(assignmentFeedback(before, before, users), '');
  assert.equal(assignmentFeedback(null, { title: 'New task', assigneeUserId: null }, users), '');
});
