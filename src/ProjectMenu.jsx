import { useEffect, useRef } from 'react';

export default function ProjectMenu({ team, teams, onSwitch, onCreate, onManage, onMember }) {
  const ref = useRef(null);
  useEffect(() => {
    function outside(event) {
      if (!ref.current.contains(event.target)) ref.current.open = false;
    }
    function escape(event) {
      if (event.key === 'Escape' && ref.current.open) {
        ref.current.open = false;
        ref.current.querySelector('summary').focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  function run(action) { ref.current.open = false; ref.current.querySelector('summary').focus(); action(); }
  const itemClass = 'min-h-11 w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-page focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary';
  return <details ref={ref} className="relative shrink-0">
    <summary aria-label={`Project: ${team.name}`} className="flex min-h-11 w-fit max-w-[calc(100vw-3rem)] cursor-pointer list-none items-center gap-2 rounded-md border border-due-neutral bg-surface-card px-4 py-2 text-sm font-medium text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary [&::-webkit-details-marker]:hidden">
      <span className="truncate">{team.name}</span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="m6 9 6 6 6-6"/></svg>
    </summary>
    <div className="absolute right-0 top-full z-20 mt-2 max-h-[70dvh] w-72 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-due-neutral bg-surface-card p-2 shadow-lg">
      <p className="px-3 py-2 text-xs font-semibold text-text-muted">PROJECTS</p>
      {teams.map((project) => <button key={project.id} type="button" aria-current={project.id === team.id ? 'true' : undefined} className={`${itemClass} flex items-center justify-between gap-2 ${project.id === team.id ? 'bg-surface-page font-medium' : ''}`} onClick={() => run(() => onSwitch(project.id))}>
        <span className="min-w-0 break-words">{project.name}</span>{project.id === team.id && <span aria-hidden="true">✓</span>}
      </button>)}
      <div className="my-2 border-t border-due-neutral"/>
      <p className="px-3 py-2 text-xs font-semibold text-text-muted">MEMBERS · {team.members.length}</p>
      {team.members.length ? team.members.map((member) => <button key={member.id} type="button" className={`${itemClass} flex items-center gap-2`} onClick={() => run(() => onMember(member.id))}>
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-page text-xs">{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
        <span className="min-w-0 break-words">{member.name}</span>
      </button>) : <p className="px-3 py-2 text-sm text-text-muted">No members yet.</p>}
      <div className="my-2 border-t border-due-neutral"/>
      {onManage && <button type="button" className={itemClass} onClick={() => run(onManage)}>Manage project</button>}
      <button type="button" className={itemClass} onClick={() => run(onCreate)}>Create project</button>
    </div>
  </details>;
}
