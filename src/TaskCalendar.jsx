import { useState } from 'react';
import TaskType from './TaskType';
import AssigneeBadge from './AssigneeBadge';
import { getDeadline } from './deadline';

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function TaskCalendar({ tasks, users, today, onEdit }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const leadingDays = (month.getDay() + 6) % 7;
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = dateKey(today);
  const tasksByDate = new Map();
  for (const task of tasks) {
    if (!task.dueDate) continue;
    if (!tasksByDate.has(task.dueDate)) tasksByDate.set(task.dueDate, []);
    tasksByDate.get(task.dueDate).push(task);
  }
  const focusClass = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';

  return (
    <section aria-labelledby="calendar-month" className="rounded-xl border border-due-neutral bg-surface-card p-3 sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="calendar-month" aria-live="polite" aria-atomic="true" className="text-lg font-semibold">{monthLabel}</h2>
        <div className="flex gap-2">
          <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
            className={`min-h-11 rounded-md border border-due-neutral px-3 text-sm ${focusClass}`}>Previous</button>
          <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
            className={`min-h-11 rounded-md border border-due-neutral px-3 text-sm ${focusClass}`}>Next</button>
        </div>
      </header>
      <p className="mb-4 min-h-10 text-sm text-text-muted">{tasks.some((task) => !task.dueDate) ? `${tasks.filter((task) => !task.dueDate).length} matching tasks have no due date. View them on the board.` : 'All matching tasks with a due date appear on the calendar.'}</p>
      <div aria-hidden="true" className="mb-2 hidden grid-cols-7 gap-2 sm:grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <span key={day} className="px-2 text-xs text-text-muted">{day}</span>
        ))}
      </div>
      <ol aria-label={`Tasks due in ${monthLabel}`} className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {Array.from({ length: leadingDays }, (_, index) => (
          <li key={`blank-${index}`} aria-hidden="true" className="hidden sm:block" />
        ))}
        {Array.from({ length: dayCount }, (_, index) => {
          const date = new Date(year, monthIndex, index + 1);
          const key = dateKey(date);
          const dayTasks = tasksByDate.get(key) ?? [];
          const isToday = key === todayKey;
          const fullDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          return (
            <li key={key} className={`min-w-0 rounded-md border p-2 sm:min-h-28 ${isToday ? 'border-brand-primary' : 'border-due-neutral'}`}>
              <time dateTime={key} aria-current={isToday ? 'date' : undefined} className="mb-2 flex flex-wrap items-center gap-1 text-xs">
                <span className="sr-only">{fullDate}</span>
                <span aria-hidden="true" className="sm:hidden">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span aria-hidden="true" className={isToday ? 'rounded-full bg-brand-primary px-2 py-1 font-semibold text-white' : 'px-1 py-1 text-text-muted'}>{index + 1}</span>
                {isToday && <span className="text-xs font-medium">Today</span>}
              </time>
              <ul className="space-y-2">
                {dayTasks.map((task) => (
                  <li key={task.id}>
                    <button type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.type === 'bug' ? 'Bug' : 'Feature'} task: ${task.title}, due ${fullDate}`}
                      className={`min-h-11 w-full whitespace-normal break-words rounded-md border border-due-neutral bg-surface-page p-2 text-left hover:shadow-sm ${focusClass}`}>
                      <TaskType type={task.type}/>
                      <span className="mt-1 block text-sm font-medium">{task.title}</span>
                      <span className="mt-2 block"><AssigneeBadge user={users.find((user) => user.id === task.assigneeUserId)}/></span>
                      <span className="mt-2 block text-xs text-text-muted">{getDeadline(task, today).label}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {dayTasks.length === 0 && <span className="text-xs text-text-muted sm:sr-only">No tasks due</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
