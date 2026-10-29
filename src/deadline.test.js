import test from 'node:test';
import assert from 'node:assert/strict';
import { deadlineState, getDeadline } from './deadline.js';

test('three-day due-soon window includes tomorrow through day three, excludes day four', () => {
  const now = new Date(2026, 9, 28, 12);
  for (const [dueDate, expected] of [['2026-10-27', 'overdue'], ['2026-10-28', 'today'], ['2026-10-29', 'soon'], ['2026-10-30', 'soon'], ['2026-10-31', 'soon'], ['2026-11-01', 'later']]) assert.equal(deadlineState({ status: 'todo', dueDate }, now), expected);
  assert.match(getDeadline({ status: 'todo', dueDate: '2026-10-31' }, now).label, /^Due soon/);
});
test('completed, absent and invalid dates do not become overdue', () => {
  const now = new Date(2026, 9, 28);
  assert.equal(deadlineState({ status: 'done', dueDate: '2020-01-01' }, now), 'done');
  for (const dueDate of [null, '', '2026-02-30', 'bad']) assert.equal(deadlineState({ status: 'todo', dueDate }, now), 'none');
});
test('calendar-day comparisons span DST, month and year boundaries', () => {
  assert.equal(deadlineState({ status: 'todo', dueDate: '2026-10-26' }, new Date(2026, 9, 23, 23, 59)), 'soon');
  assert.equal(deadlineState({ status: 'todo', dueDate: '2027-01-02' }, new Date(2026, 11, 30)), 'soon');
  assert.equal(deadlineState({ status: 'todo', dueDate: '2026-10-28' }, new Date(2026, 9, 28, 23, 59, 59)), 'today');
});
