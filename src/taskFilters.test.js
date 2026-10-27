import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks, isOverdue } from './taskFilters.js';

const now = new Date(2026, 9, 27, 12);
const tasks = [
  { id: 'none', title: 'No deadline', assignee: '', type: 'feature', status: 'todo', dueDate: null },
  { id: 'today', title: 'Search UI', assignee: 'Maya', type: 'feature', status: 'todo', dueDate: '2026-10-27' },
  { id: 'old', title: 'Fix SEARCH', assignee: 'Maya', type: 'bug', status: 'review', dueDate: '2026-10-20' },
  { id: 'done', title: 'Search complete', assignee: 'Maya', type: 'bug', status: 'done', dueDate: '2026-10-21' },
  { id: 'same', title: 'Other bug', assignee: 'Leo', type: 'bug', status: 'todo', dueDate: '2026-10-27' },
];

test('overdue excludes today, completed tasks, and missing deadlines', () => {
  assert.equal(isOverdue(tasks[2], now), true);
  for (const index of [0, 1, 3, 4]) assert.equal(isOverdue(tasks[index], now), false);
});
test('search, assignee, type and overdue combine', () => {
  assert.deepEqual(filterTasks(tasks, { search: ' SEARCH ', assignee: 'Maya', type: 'bug', overdue: true }, now).map((task) => task.id), ['old']);
});
test('deadline sort is stable, places missing dates last, and preserves source order', () => {
  assert.deepEqual(filterTasks(tasks, {}, now).map((task) => task.id), ['old', 'done', 'today', 'same', 'none']);
  assert.equal(tasks[0].id, 'none');
});
test('unassigned and empty results', () => {
  assert.deepEqual(filterTasks(tasks, { assignee: '' }, now).map((task) => task.id), ['none']);
  assert.deepEqual(filterTasks(tasks, { search: 'nonexistent' }, now), []);
});
test('local date boundary changes overdue status at midnight', () => {
  assert.equal(isOverdue(tasks[1], new Date(2026, 9, 27, 23, 59, 59)), false);
  assert.equal(isOverdue(tasks[1], new Date(2026, 9, 28, 0, 0, 0)), true);
});
