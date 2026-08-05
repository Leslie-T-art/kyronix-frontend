import React, { useState } from 'react';
import { Loader2Icon, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NMB_LOGO } from '../components/layout/navigation';
import { Button } from '../components/ui/Button';
import { Field, TextInput } from '../components/ui/Field';

export function Login() {
  const { signIn, status, error } = useAuth();
  const [username, setUsername] = useState('system.admin');
  const [password, setPassword] = useState('ChangeMe123!');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const busy = status === 'signing-in';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    try {
      await signIn(username, password);
    } catch (requestError) {
      const message =
        typeof requestError === 'object' &&
        requestError !== null &&
        'message' in requestError &&
        typeof requestError.message === 'string'
          ? requestError.message
          : 'Unable to sign in. Check your credentials and try again.';
      setSubmitError(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-5 pt-20">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
        <img src={NMB_LOGO} alt="NMB Bank Limited" className="h-12 w-auto object-contain" />
        <div className="mt-6 h-1 w-12 rounded-xl bg-gold" />

        <h1 className="mt-6 text-xl font-semibold text-navy">Kyronix Risk Engine</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enterprise governance, risk and compliance platform.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Field label="Username" htmlFor="username">
            <TextInput
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              disabled={busy}
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={busy}
            />
          </Field>

          {(submitError || error) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {submitError ?? error?.message}
            </div>
          )}

          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy" />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Authentication is routed through the centralized auth service. The access token,
            backend roles, and permissions are stored locally for session continuity and RBAC.
          </p>
        </div>
      </div>
    </div>);

}
