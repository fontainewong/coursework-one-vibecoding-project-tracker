import { deadlineState } from './deadline.js';

export function isOverdue(task, now = new Date()) { return deadlineState(task, now) === 'overdue'; }

export function filterTasks(tasks, { search = '', assignee = '*', type = 'all', overdue = false }, now) {
  return tasks.filter((task) =>
    task.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) &&
    (assignee === '*' || (task.assigneeUserId || '') === assignee) &&
    (type === 'all' || task.type === type) &&
    (!overdue || isOverdue(task, now))
  ).sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'));
}
