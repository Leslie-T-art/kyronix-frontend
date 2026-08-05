import React, { useState } from 'react';
import { Loader2Icon, ShieldCheckIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NMB_LOGO } from '../components/layout/navigation';
import { Button } from '../components/ui/Button';
import type { Role } from '../types';
import { directoryUsers } from '../data/users';

export function Login() {
  const { signIn, status } = useAuth();
  const [role, setRole] = useState<Role>('RiskManager');

  const busy = status === 'redirecting' || status === 'mfa-pending';

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-5 pt-20">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
        <img src={NMB_LOGO} alt="NMB Bank Limited" className="h-12 w-auto object-contain" />
        <div className="mt-6 h-1 w-12 rounded-xl bg-gold" />

        <h1 className="mt-6 text-xl font-semibold text-navy">Kyronix Risk Engine</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enterprise governance, risk and compliance platform.
        </p>

        <div className="mt-6">
          <label htmlFor="role" className="text-xs font-medium text-zinc-500">
            Directory account (demo)
          </label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            disabled={busy}
            className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            
            {directoryUsers.map((user) =>
            <option key={user.id} value={user.role}>
                {user.name} — {user.role}
              </option>
            )}
          </select>
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() => signIn(role)}
          disabled={busy}>
          
          {busy ?
          <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              {status === 'redirecting' ? 'Redirecting to Microsoft…' : 'Awaiting MFA approval…'}
            </> :

          <>
              <MicrosoftMark />
              Sign in with Microsoft
            </>
          }
        </Button>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy" />
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Single sign-on via Microsoft Entra ID. Access restricted to NMB Bank staff; roles are
            assigned from Active Directory group membership.
          </p>
        </div>
      </div>
    </div>);

}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" fill="#f25022" />
      <rect x="11" y="1" width="8" height="8" fill="#7fba00" />
      <rect x="1" y="11" width="8" height="8" fill="#00a4ef" />
      <rect x="11" y="11" width="8" height="8" fill="#ffb900" />
    </svg>);

}
