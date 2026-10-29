import { initials } from './model.js';

export default function AssigneeBadge({ user }) {
  return <span className="inline-flex max-w-full items-center gap-2 text-xs text-text-muted">
    {user && <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-due-neutral bg-surface-page font-semibold">{initials(user.name)}</span>}
    <span className="min-w-0 break-words"><span className="sr-only">Assignee: </span>{user?.name || 'Unassigned'}</span>
  </span>;
}
