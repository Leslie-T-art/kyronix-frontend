import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <PageBanner
        title="Access denied"
        subtitle="Your Active Directory role does not grant access to this engine."
        breadcrumb={['Kyronix', '403']} />
      
      <SurfaceCard>
        <div className="flex flex-col items-center py-10 text-center">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <LockIcon className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-navy">Insufficient permissions</p>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            You are signed in as <span className="font-medium text-navy">{user?.role}</span>. Request
            access through the risk governance team if this engine is required for your role.
          </p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </SurfaceCard>
    </>);

}