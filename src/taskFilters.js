export function isOverdue(task, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return task.status !== 'done' && !!task.dueDate && task.dueDate < today;
}

export function filterTasks(tasks, { search = '', assignee = '*', type = 'all', overdue = false }, now) {
  return tasks.filter((task) =>
    task.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) &&
    (assignee === '*' || (task.assignee || '') === assignee) &&
    (type === 'all' || task.type === type) &&
    (!overdue || isOverdue(task, now))
  ).sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'));
}
