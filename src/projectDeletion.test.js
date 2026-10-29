import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteProjectRecord, accessibleProjects } from './model.js';
import { seedWorkspace, LIVE_DEMO_URL, defaultProjectId } from './seedData.js';
import { upgradeWorkspace } from './storage.js';

test('project deletion requires exact typed wording and project membership', () => {
  const workspace = seedWorkspace();
  for (const text of ['', 'Coursework Project', 'delete coursework project', ' delete Coursework Project', 'delete Coursework Project ']) assert.throws(() => deleteProjectRecord(workspace, 'demo-project', text, 'demo-1'));
  assert.throws(() => deleteProjectRecord(workspace, 'demo-small-team', 'delete Interface Study', 'demo-4'));
  assert.equal(workspace.projects.length, 3);
});
test('deleting a project removes only its nested contents, retains users and selects an accessible fallback', () => {
  const workspace = seedWorkspace();
  const before = structuredClone(workspace);
  const remaining = deleteProjectRecord(workspace, 'demo-project', 'delete Coursework Project', 'demo-2');
  assert.deepEqual(remaining.projects, workspace.projects.slice(1));
  assert.equal(remaining.activeProjectId, 'demo-presentation');
  assert.deepEqual(remaining.users, workspace.users);
  assert.deepEqual(workspace, before);
  const last = deleteProjectRecord(remaining, 'demo-presentation', 'delete Presentation Prep', 'demo-2');
  assert.equal(last.activeProjectId, null);
  const empty = deleteProjectRecord(last, 'demo-small-team', 'delete Interface Study', 'demo-1');
  assert.equal(empty.activeProjectId, null);
  assert.deepEqual(upgradeWorkspace(empty).projects, []);
});
test('A/B/C have distinct project lists and defaults, with representative seed states', () => {
  const workspace = seedWorkspace();
  assert.deepEqual(workspace.projects[1].memberUserIds, ['demo-1', 'demo-3', 'demo-5', 'demo-8']);
  assert.equal(accessibleProjects(workspace, 'demo-2').some((project) => project.id === 'demo-small-team'), false);
  assert.deepEqual(['demo-1', 'demo-2', 'demo-3'].map((id) => defaultProjectId(workspace, id)), ['demo-project', 'demo-presentation', 'demo-small-team']);
  for (const id of ['demo-1', 'demo-2', 'demo-3']) assert.equal(accessibleProjects(workspace, id).length, 2);
  assert.equal(accessibleProjects(workspace, 'demo-4').some((project) => project.id === 'demo-small-team'), false);
  for (const project of workspace.projects) {
    assert.ok(project.memberUserIds.length <= 6);
    assert.ok(workspace.users.some((user) => !project.memberUserIds.includes(user.id)), 'Add Member has an available user');
    for (const id of project.memberUserIds) assert.ok(project.tasks.some((task) => task.assigneeUserId === id), `${id} has tasks in ${project.name}`);
    assert.ok(project.milestones.length >= 3 && project.milestones.length <= 4);
    assert.ok(project.milestones.some((item) => item.completed));
    assert.ok(project.milestones.some((item) => !item.completed));
    for (const group of project.anchors) {
      if (['report', 'documentation'].includes(group.type)) assert.equal(group.links.length, 0);
      else assert.equal(group.links[0].url, LIVE_DEMO_URL);
    }
  }
});
test('revision 5 opens seed membership slots without deleting tasks or user records', () => {
  const workspace = seedWorkspace();
  workspace.schemaRevision = 5;
  const project = workspace.projects[0];
  project.memberUserIds = workspace.users.map((user) => user.id);
  project.tasks.find((task) => task.id === 'demo-task-6').assigneeUserId = 'demo-5';
  project.tasks.find((task) => task.id === 'demo-task-10').assigneeUserId = 'demo-8';
  project.tasks.push({ id: 'custom-task', title: 'Keep custom notes', context: 'Keep this text', assigneeUserId: 'demo-8' });
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.users.length, 8);
  assert.equal(upgraded.projects[0].memberUserIds.length, 5);
  assert.equal(upgraded.projects[0].tasks.length, project.tasks.length);
  assert.equal(upgraded.projects[0].tasks.find((task) => task.id === 'demo-task-6').assigneeUserId, 'demo-4');
  assert.equal(upgraded.projects[0].tasks.find((task) => task.id === 'custom-task').context, 'Keep this text');
  assert.equal(upgraded.projects[0].tasks.find((task) => task.id === 'custom-task').assigneeUserId, null);
  assert.deepEqual(upgradeWorkspace(upgraded), upgraded);
});

test('revision 6 refreshes examples once while preserving custom links, milestones and tasks', () => {
  const workspace = seedWorkspace();
  workspace.schemaRevision = 6;
  workspace.projects.pop();
  const project = workspace.projects[0];
  project.memberUserIds.push('demo-3');
  project.milestones = [{ ...project.milestones[0], title: 'My milestone title' }];
  const report = project.anchors.find((group) => group.type === 'report');
  report.links = [
    { id: 'seed-live-demo:demo-project:report', url: LIVE_DEMO_URL },
    { id: 'custom-report', url: 'https://example.com/my-report' },
  ];
  project.tasks.push({ id: 'custom-task', title: 'Keep me', context: 'My notes', assigneeUserId: 'demo-3' });
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.projects.length, 3);
  assert.equal(upgraded.projects[0].milestones[0].title, 'My milestone title');
  assert.equal(upgraded.projects[0].milestones.length, 3);
  assert.deepEqual(upgraded.projects[0].anchors.find((group) => group.type === 'report').links.map((link) => link.id), ['custom-report']);
  assert.equal(upgraded.projects[0].tasks.at(-1).context, 'My notes');
  assert.equal(upgraded.projects[0].tasks.at(-1).assigneeUserId, null);
  upgraded.projects[0].milestones.pop();
  upgraded.projects.pop();
  assert.deepEqual(upgradeWorkspace(upgraded), upgraded, 'Deleted examples stay deleted after the one-time upgrade');
});
test('seed enrichment runs once without replacing user links or resurrecting deleted examples', () => {
  const workspace = seedWorkspace();
  workspace.schemaRevision = 3;
  workspace.projects = [workspace.projects[0]];
  workspace.projects[0].anchors.find((group) => group.type === 'demo').links = [];
  workspace.projects[0].tasks[0].context = '';
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.projects.length, 3);
  assert.equal(upgraded.projects[0].anchors.find((group) => group.type === 'demo').links[0].url, LIVE_DEMO_URL);
  assert.equal(upgraded.projects[0].tasks[0].context, '');
  upgraded.projects = [upgraded.projects[0]];
  upgraded.projects[0].anchors.find((group) => group.type === 'demo').links = [];
  assert.deepEqual(upgradeWorkspace(upgraded), upgraded);
  workspace.projects[0].anchors.find((group) => group.type === 'demo').links = [{ id: 'mine', title: 'My link', url: 'https://example.com/mine' }];
  assert.equal(upgradeWorkspace(workspace).projects[0].anchors.find((group) => group.type === 'demo').links[0].url, 'https://example.com/mine');
});
test('revision 4 upgrades task coverage and A/C membership once, preserving edited tasks and links', () => {
  const workspace = seedWorkspace();
  workspace.schemaRevision = 4;
  workspace.projects[0].tasks = workspace.projects[0].tasks.filter((task) => !['demo-task-8', 'demo-task-9', 'demo-task-10'].includes(task.id));
  workspace.projects[0].tasks[0].title = 'My edited title';
  workspace.projects[0].anchors[0].links = [{ id: 'my-link', title: 'Mine', url: 'https://example.com/mine' }];
  workspace.projects[1].memberUserIds = ['demo-2', 'demo-5', 'demo-8'];
  workspace.projects[1].tasks = workspace.projects[1].tasks.filter((task) => !['small-task-4', 'small-task-5'].includes(task.id));
  workspace.projects[1].anchors[0].links = [];
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.projects[0].tasks[0].title, 'My edited title');
  assert.equal(upgraded.projects[0].anchors[0].links[0].url, 'https://example.com/mine');
  assert.equal(upgraded.projects[1].anchors[0].links[0].url, LIVE_DEMO_URL);
  for (const project of upgraded.projects) {
    assert.equal(new Set(project.tasks.map((task) => task.id)).size, project.tasks.length);
    for (const id of project.memberUserIds) assert.ok(project.tasks.some((task) => task.assigneeUserId === id));
  }
  for (const id of ['demo-1', 'demo-2', 'demo-3']) assert.equal(accessibleProjects(upgraded, id).length, 2);
  assert.deepEqual(upgradeWorkspace(upgraded), upgraded);
});
