import { useEffect, useRef, useState } from 'react';
import { authenticate, DEMO_LOGIN_IDS, initials } from './model.js';

export default function Login({ users, onSignIn }) {
  const accounts = DEMO_LOGIN_IDS.map((id) => users.find((user) => user.id === id)).filter(Boolean);
  const [selectedId, setSelectedId] = useState(accounts[0]?.id ?? '');
  const selected = accounts.find((account) => account.id === selectedId);
  const [email, setEmail] = useState(accounts[0]?.email ?? '');
  const [password, setPassword] = useState(accounts[0]?.password ?? '');
  const [error, setError] = useState('');
  const emailRef = useRef(null);
  const switchRef = useRef(null);
  useEffect(() => {
    function outside(event) {
      if (!switchRef.current?.contains(event.target)) switchRef.current.open = false;
    }
    function escape(event) {
      if (event.key === 'Escape' && switchRef.current?.open) {
        event.preventDefault();
        switchRef.current.open = false;
        switchRef.current.querySelector('summary').focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);
  function selectAccount(account) {
    setSelectedId(account.id); setEmail(account.email); setPassword(account.password); setError('');
    switchRef.current.open = false; emailRef.current?.focus();
  }
  function submit(event) {
    event.preventDefault();
    if (!email.trim() || !password) { setError('Enter your email and password.'); emailRef.current?.focus(); return; }
    const user = authenticate(users, email, password);
    if (!user) { setError('Email or password is incorrect. Select a demo account using Switch account.'); emailRef.current?.focus(); return; }
    onSignIn(user.id);
  }
  const field = 'mt-2 min-h-11 w-full rounded-md border border-due-neutral bg-surface-card px-3 py-2 text-base font-normal';
  return <main id="main-content" tabIndex={-1} className="relative flex min-h-dvh items-center justify-center bg-surface-page px-6 py-28 font-sans text-text-primary">
    <header className="absolute left-6 top-6 flex flex-wrap items-center gap-3 text-xl font-semibold sm:left-10 sm:top-8">
      <p>Project Tracker</p>
      <span aria-hidden="true" className="font-normal text-text-muted">|</span>
      <h1 id="login-title" className="text-xl font-semibold">Sign in</h1>
    </header>
    <section aria-labelledby="login-title" className="w-full max-w-md rounded-xl border border-due-neutral bg-surface-card p-7 shadow-sm sm:p-10">
      {/* Safari can blur with no relatedTarget before an account button's click. */}
      <details ref={switchRef} onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }} className="relative my-6">
        <summary aria-label={`Switch account. Current account: ${selected?.name || 'None'}`} aria-controls="login-account-choices" className="mx-auto flex w-fit max-w-full cursor-pointer list-none flex-col items-center rounded-md px-3 py-2 text-center [&::-webkit-details-marker]:hidden">
          {selected?.avatarUrl ? <img src={selected.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover"/> : <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full border border-due-neutral bg-surface-page text-xl font-semibold">{selected ? initials(selected.name) : '?'}</span>}
          <span className="mt-3 max-w-full break-words text-base font-semibold">{selected?.name}</span>
          <span className="mt-1 flex min-h-11 items-center text-base font-semibold underline underline-offset-4">Switch account</span>
        </summary>
        <div id="login-account-choices" className="absolute left-0 right-0 top-full z-10 mt-2 max-h-72 overflow-y-auto rounded-lg border border-due-neutral bg-surface-card p-2 shadow-lg">
          <p className="px-3 py-2 text-base font-semibold">Choose an account</p>
          <ul>{accounts.map((account) => <li key={account.id}>
            <button type="button" onClick={() => selectAccount(account)} aria-current={account.id === selectedId ? 'true' : undefined} className="flex min-h-14 w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-surface-page">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-page text-base font-semibold">{initials(account.name)}</span>
              <span className="min-w-0"><span className="block break-words text-base font-semibold">{account.name}</span><span className="mt-1 block break-all text-base text-text-muted">{account.email}</span></span>
              {account.id === selectedId && <span className="ml-auto shrink-0 text-sm font-semibold text-text-muted">Selected</span>}
            </button>
          </li>)}</ul>
        </div>
      </details>
      <p role="status" aria-live="polite" className="sr-only">{selected?.name} selected. Email and password filled in.</p>
      <form noValidate onSubmit={submit} className="space-y-4">
        <label className="block text-base font-semibold">Email (required)<input ref={emailRef} autoFocus required type="email" autoComplete="username" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} className={field}/></label>
        <label className="block text-base font-semibold">Password (required)<input required type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={`demo-login-help${error ? ' login-error' : ''}`} className={field}/></label>
        <p id="demo-login-help" className="text-base text-text-muted">Demo password: <code className="font-mono">{selected?.password}</code></p>
        {error && <p id="login-error" role="alert" className="text-base">{error}</p>}
        <button className="min-h-11 w-full rounded-md bg-brand-primary px-4 py-2 text-base font-semibold text-white">Sign in</button>
      </form>
    </section>
  </main>;
}
