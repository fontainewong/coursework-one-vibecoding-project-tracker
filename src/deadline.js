// Date-only deadlines expire at the end of the user's local calendar day.
export function getDeadline(task, now = new Date()) {
  const neutral = {
    tint: task.status === 'done' ? 'bg-due-neutral' : 'bg-surface-card',
    label: task.status === 'done' ? 'Completed · No due date' : 'No due date',
  };
  if (!task.dueDate) return neutral;

  const [year, month, day] = task.dueDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (!Number.isFinite(date.getTime()) || date.getFullYear() !== year ||
      date.getMonth() !== month - 1 || date.getDate() !== day) return neutral;

  const formatted = date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  if (task.status === 'done') {
    return { tint: 'bg-due-neutral', label: `Completed · Due ${formatted}` };
  }

  const deadline = new Date(year, month - 1, day, 23, 59, 59, 999);
  const remaining = deadline.getTime() - now.getTime();
  if (remaining < 0) return { tint: 'bg-due-overdue/10', label: `Overdue · ${formatted}` };
  if (date.toDateString() === now.toDateString()) {
    return { tint: 'bg-due-warning/10', label: `Due today · ${formatted}` };
  }
  return { tint: 'bg-surface-card', label: `Due ${formatted}` };
}
