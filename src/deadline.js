function dateParts(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { year, month, day, date };
}
export function deadlineState(task, now = new Date()) {
  if (task.status === 'done') return 'done';
  const parts = dateParts(task.dueDate);
  if (!parts) return 'none';
  // Compare calendar days, avoiding daylight-saving transitions and UTC date shifts.
  const dueDay = Date.UTC(parts.year, parts.month - 1, parts.day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = (dueDay - today) / 86_400_000;
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  return 'later';
}
export function getDeadline(task, now = new Date()) {
  const state = deadlineState(task, now);
  const parts = dateParts(task.dueDate);
  const formatted = parts?.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  if (state === 'done') return { tint: 'bg-due-neutral', label: formatted ? `Completed · Due ${formatted}` : 'Completed · No due date' };
  if (!parts) return { tint: 'bg-surface-card', label: 'No due date' };
  if (state === 'overdue') return { tint: 'bg-due-overdue/10', label: `Overdue · ${formatted}` };
  if (state === 'today') return { tint: 'bg-due-warning/10', label: `Due today · ${formatted}` };
  if (state === 'soon') return { tint: 'bg-due-warning/10', label: `Due soon · ${formatted}` };
  return { tint: 'bg-surface-card', label: `Due ${formatted}` };
}
