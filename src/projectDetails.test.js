import test from 'node:test';
import assert from 'node:assert/strict';
import { saveMilestoneRecord, saveDeliverableLink, removeDeliverableLink, emptyLinks, CONTEXT_TEMPLATE } from './model.js';
import { seedWorkspace } from './seedData.js';
import { upgradeWorkspace } from './storage.js';

test('milestone editing preserves identity/completion and saves description, date and valid project tasks', () => {
  const project = seedWorkspace().projects[0];
  const previous = { ...project.milestones[0], completed: true };
  const saved = saveMilestoneRecord({ title: ' Updated ', description: ' Description ', targetDate: '2026-12-01', taskIds: ['demo-task-2', 'demo-task-2', 'other-project-task'] }, previous, project, 'unused');
  assert.equal(saved.id, previous.id);
  assert.equal(saved.completed, true);
  assert.equal(saved.title, 'Updated');
  assert.equal(saved.description, 'Description');
  assert.equal(saved.targetDate, '2026-12-01');
  assert.deepEqual(saved.taskIds, ['demo-task-2']);
  assert.deepEqual(saveMilestoneRecord({ title: 'New', targetDate: '', taskIds: [] }, null, project, 'new').targetDate, null);
});
test('multiple links can be added, edited and removed independently', () => {
  const original = emptyLinks('project')[0];
  const first = saveDeliverableLink(original, { title: 'Slides', url: 'https://example.com/slides' }, 'one');
  const both = saveDeliverableLink(first, { title: 'Recording', url: 'https://example.com/video' }, 'two');
  assert.equal(both.links.length, 2);
  const edited = saveDeliverableLink(both, { id: 'one', title: 'New slides', url: 'https://example.com/new' }, 'unused');
  assert.equal(edited.links[0].id, 'one');
  assert.equal(edited.links[0].title, 'New slides');
  assert.deepEqual(edited.links[1], both.links[1]);
  const remaining = removeDeliverableLink(edited, 'one');
  assert.deepEqual(remaining.links, [both.links[1]]);
  assert.equal(both.links.length, 2);
  assert.equal(original.links.length, 0);
  assert.throws(() => saveDeliverableLink(original, { url: 'javascript:alert(1)' }, 'bad'));
  assert.throws(() => saveDeliverableLink(original, { url: '' }, 'bad'));
});
test('workspace cleanup keeps exactly eight demo identities, profile edits and all legacy tasks', () => {
  const workspace = seedWorkspace();
  workspace.users[0].name = 'Amy Updated';
  workspace.users.push({ id: 'legacy-user', name: 'Old User', email: 'old@example.com' });
  workspace.projects[0].memberUserIds.push('legacy-user');
  workspace.projects[0].tasks.push({ id: 'custom-task', title: 'Keep', assigneeUserId: 'legacy-user', context: 'My original notes' });
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.users.length, 8);
  assert.equal(upgraded.users[0].name, 'Amy Updated');
  assert.equal(upgraded.projects[0].memberUserIds.includes('legacy-user'), false);
  assert.equal(upgraded.projects[0].tasks.length, workspace.projects[0].tasks.length);
  assert.equal(upgraded.projects[0].tasks.at(-1).assigneeUserId, null);
  assert.equal(upgraded.projects[0].tasks.at(-1).context, 'My original notes');
});
test('single URLs migrate without loss, and schema upgrade is idempotent', () => {
  const workspace = seedWorkspace();
  workspace.projects[0].anchors[0] = { id: 'presentation', projectId: 'demo-project', type: 'presentation', url: 'https://example.com/old' };
  workspace.projects[0].milestones[0] = { id: 'old-milestone', title: 'Preserve', completed: true, targetDate: '2026-11-01' };
  const upgraded = upgradeWorkspace(workspace);
  assert.equal(upgraded.projects[0].anchors[0].links[0].url, 'https://example.com/old');
  assert.equal(upgraded.projects[0].milestones[0].completed, true);
  assert.deepEqual(upgraded.projects[0].milestones[0].taskIds, []);
  assert.deepEqual(upgradeWorkspace(upgraded), upgraded);
});
test('seed context has populated Markdown sections; upgrades do not overwrite custom or later-cleared context', () => {
  const workspace = seedWorkspace();
  for (const task of workspace.projects[0].tasks) {
    for (const title of ['Background', 'Constraints', 'Tried so far', 'Pick up']) assert.match(task.context, new RegExp(`## ${title}\\n\\n\\S`));
    assert.ok(task.contextUpdatedAt);
  }
  workspace.projects[0].tasks[0].context = CONTEXT_TEMPLATE;
  workspace.projects[0].tasks[1].context = 'My own notes';
  workspace.schemaRevision = 2;
  const upgraded = upgradeWorkspace(workspace);
  assert.notEqual(upgraded.projects[0].tasks[0].context, CONTEXT_TEMPLATE);
  assert.equal(upgraded.projects[0].tasks[1].context, 'My own notes');
  upgraded.projects[0].tasks[0].context = '';
  assert.equal(upgradeWorkspace(upgraded).projects[0].tasks[0].context, '');
});
