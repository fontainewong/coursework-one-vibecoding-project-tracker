import { useRef, useState } from 'react';
import { authenticate, DEMO_LOGIN_IDS, initials } from './model.js';

// The demo account picker uses a native <select> so it works the same with
// mouse, keyboard, screen readers and touch (including iOS Safari).
export default function Login({ users, onSignIn }) {
  const accounts = DEMO_LOGIN_IDS.map((id) => users.find((user) => user.id === id)).filter(Boolean);
  const [selectedId, setSelectedId] = useState(accounts[0]?.id ?? '');
  const selected = accounts.find((account) => account.id === selectedId);
  const [email, setEmail] = useState(accounts[0]?.email ?? '');
  const [password, setPassword] = useState(accounts[0]?.password ?? '');
  const [error, setError] = useState('');
  const emailRef = useRef(null);
  function selectAccount(id) {
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    setSelectedId(account.id); setEmail(account.email); setPassword(account.password); setError('');
  }
  function submit(event) {
    event.preventDefault();
    if (!email.trim() || !password) { setError('Enter your email and password.'); emailRef.current?.focus(); return; }
    const user = authenticate(users, email, password);
    if (!user) { setError('Email or password is incorrect. Choose a demo account above to fill in its details.'); emailRef.current?.focus(); return; }
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
      <div className="mb-6 flex flex-col items-center text-center">
        {selected?.avatarUrl ? <img src={selected.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover"/> : <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full border border-due-neutral bg-surface-page text-xl font-semibold">{selected ? initials(selected.name) : '?'}</span>}
        <p className="mt-3 max-w-full break-words text-base font-semibold">{selected?.name}</p>
      </div>
      <label className="mb-6 block text-base font-semibold">Demo account
        <select value={selectedId} onChange={(event) => selectAccount(event.target.value)} aria-describedby="demo-account-help" className={field}>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
        </select>
        <span id="demo-account-help" className="mt-2 block text-sm font-normal text-text-muted">Choosing an account fills in its email and password.</span>
      </label>
      <p role="status" aria-live="polite" className="sr-only">{selected?.name} selected. Email and password filled in.</p>
      <form noValidate onSubmit={submit} className="space-y-4">
        <label className="block text-base font-semibold">Email (required)<input ref={emailRef} required type="email" autoComplete="username" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined} className={field}/></label>
        <label className="block text-base font-semibold">Password (required)<input required type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={`demo-login-help${error ? ' login-error' : ''}`} className={field}/></label>
        <p id="demo-login-help" className="text-base text-text-muted">Demo password: <code className="font-mono">{selected?.password}</code></p>
        {error && <p id="login-error" role="alert" className="text-base">{error}</p>}
        <button className="min-h-11 w-full rounded-md bg-brand-primary px-4 py-2 text-base font-semibold text-white">Sign in</button>
      </form>
    </section>
  </main>;
}
