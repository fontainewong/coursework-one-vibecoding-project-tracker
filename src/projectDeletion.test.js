import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteProjectRecord, accessibleProjects } from './model.js';
import { seedWorkspace, LIVE_DEMO_URL } from './seedData.js';
import { upgradeWorkspace } from './storage.js';

test('project deletion requires exact typed wording and project membership', () => {
  const workspace = seedWorkspace();
  for (const text of ['', 'Coursework Project', 'delete coursework project', ' delete Coursework Project', 'delete Coursework Project ']) assert.throws(() => deleteProjectRecord(workspace, 'demo-project', text, 'demo-1'));
  assert.throws(() => deleteProjectRecord(workspace, 'demo-small-team', 'delete Interface Study', 'demo-4'));
  assert.equal(workspace.projects.length, 2);
});
test('deleting a project removes only its nested contents, retains users and selects an accessible fallback', () => {
  const workspace = seedWorkspace();
  const before = structuredClone(workspace);
  const remaining = deleteProjectRecord(workspace, 'demo-project', 'delete Coursework Project', 'demo-2');
  assert.deepEqual(remaining.projects, [workspace.projects[1]]);
  assert.equal(remaining.activeProjectId, 'demo-small-team');
  assert.deepEqual(remaining.users, workspace.users);
  assert.deepEqual(workspace, before);
  const empty = deleteProjectRecord(remaining, 'demo-small-team', 'delete Interface Study', 'demo-2');
  assert.equal(empty.activeProjectId, null);
  assert.deepEqual(upgradeWorkspace(empty).projects, []);
});
test('A/B/C can see both sample projects, whose teams differ and all members have tasks', () => {
  const workspace = seedWorkspace();
  assert.deepEqual(workspace.projects[1].memberUserIds, ['demo-1', 'demo-2', 'demo-3', 'demo-5', 'demo-8']);
  for (const id of ['demo-1', 'demo-2', 'demo-3']) assert.equal(accessibleProjects(workspace, id).length, 2);
  assert.equal(accessibleProjects(workspace, 'demo-4').some((project) => project.id === 'demo-small-team'), false);
  for (const project of workspace.projects) {
    for (const id of project.memberUserIds) assert.ok(project.tasks.some((task) => task.assigneeUserId === id), `${id} has tasks in ${project.name}`);
    for (const group of project.anchors) assert.equal(group.links[0].url, LIVE_DEMO_URL);
  }
});
test('seed enrichment runs once without replacing user links or resurrecting deleted examples', () => {
  const workspace = seedWorkspace();
  workspace.schemaRevision = 3;
  workspace.projects = [workspace.projects[0]];
  workspace.projects[0].anchors.find((group) => group.type === 'demo').links = [];
  workspace.projects[0].tasks[0].context = '';
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.projects.length, 2);
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
