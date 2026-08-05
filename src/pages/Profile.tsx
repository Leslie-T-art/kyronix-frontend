import React, { useEffect } from 'react';
import { RefreshCwIcon, ShieldCheckIcon, UserCircle2Icon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

function DetailRow({ label, value }: {label: string;value: string;}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-navy">{value}</p>
    </div>
  );
}

export function Profile() {
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  if (!user) return null;

  return (
    <>
      <PageBanner
        title="Profile"
        subtitle="Profile information"
        breadcrumb={['Kyronix', 'Profile']}
        action={
          <Button variant="outline" size="sm" onClick={() => void refreshProfile()}>
            <RefreshCwIcon className="h-4 w-4" />
            Refresh profile
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white">
              <UserCircle2Icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-navy">{user.name}</p>
              <p className="text-sm text-zinc-500">{user.username}</p>
              <div className="mt-3 inline-flex rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-700">
                {user.role}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <DetailRow label="User ID" value={user.id} />
            <DetailRow label="Department ID" value={user.departmentId ?? 'Not provided'} />
            <DetailRow label="Branch ID" value={user.branchId ?? 'Not provided'} />
            <DetailRow label="Session Expires" value={user.expiresAt ?? 'Not provided'} />
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Access Control"
          description="These role and permission values are persisted by your administrator."
        >
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Backend Roles
              </div>
              <div className="flex flex-wrap gap-2">
                {user.backendRoles.map((role) => (
                  <span key={role} className="rounded-full border border-navy/15 bg-navy/5 px-3 py-1 text-xs font-medium text-navy">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Permissions
              </div>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </>
  );
}
