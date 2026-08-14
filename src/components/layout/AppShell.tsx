import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOutIcon, MenuIcon, UserCircle2Icon, XIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NMB_LOGO } from './navigation';
import { ThemeToggle } from '../shared/ThemeToggle';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

/**
 * The single application frame. Page padding (left / right / top) is defined
 * here once and never overridden by a page.
 */
export function AppShell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="fixed right-4 top-4 z-[60] flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
          <UserCircle2Icon className="h-4 w-4" />
          Profile
        </Button>
        <Button variant="outline" size="sm" onClick={signOut} className="text-zinc-600 hover:text-red-700">
          <LogOutIcon className="h-4 w-4" />
          Log out
        </Button>
      </div>

      <div className="flex gap-5 p-5">
        <div className="sticky top-5 hidden h-[calc(100vh-2.5rem)] shrink-0 lg:block">
          <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
        </div>

        <div className="min-w-0 flex-1 pt-16">
          <div className="mb-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 lg:hidden">
            <img src={NMB_LOGO} alt="NMB Bank Limited" className="h-7 w-auto object-contain" />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="rounded-xl border border-zinc-200 p-2 text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
              
              <MenuIcon className="h-4 w-4" />
            </button>
          </div>

          <main className="space-y-5 pb-2">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div
          className="absolute inset-0 bg-navy-900/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true" />
        
          <div className="relative m-3 h-[calc(100%-1.5rem)] w-64">
            <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="absolute -right-2 -top-2 z-10 rounded-xl border border-zinc-200 bg-white p-1.5 text-navy">
            
              <XIcon className="h-3.5 w-3.5" />
            </button>
            <Sidebar
            collapsed={false}
            onToggleCollapsed={() => undefined}
            onNavigate={() => setMobileOpen(false)} />
          
          </div>
        </div>
      }
    </div>);

}
