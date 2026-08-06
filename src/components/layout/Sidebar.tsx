import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronsLeftIcon, ChevronsRightIcon, LogOutIcon, UserCircle2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { canAccess, scopeLabel } from '../../lib/auth/roles';
import { NAV_ITEMS, NMB_LOGO } from './navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => canAccess(user.role, item.key));

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex h-full flex-col rounded-xl border border-zinc-200 bg-white transition-all duration-200',
        collapsed ? 'w-[76px]' : 'w-64'
      )}>
      
      <div className={cn('flex items-center gap-2 px-4 py-5', collapsed && 'justify-center px-2')}>
        <img
          src={NMB_LOGO}
          alt="NMB Bank Limited"
          className={cn('object-contain', collapsed ? 'h-8 w-10' : 'h-10 w-auto')} />
        
      </div>

      <div className="mx-4 border-t border-zinc-200" />

      {!collapsed &&
      <p className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Risk Engines
        </p>
      }

      <ul className={cn('flex-1 space-y-1 overflow-y-auto p-3', collapsed && 'px-2')}>
        {items.map((item) =>
        <li key={item.key}>
            <NavLink
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
              collapsed && 'justify-center px-0',
              isActive ?
              'bg-navy text-white' :
              'text-zinc-600 hover:bg-zinc-100 hover:text-navy'
            )
            }>
            
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {item.key === 'notifications' && unreadCount > 0 &&
            <span
              className={cn(
                'tabular rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-white',
                collapsed && 'absolute ml-6 -mt-5 px-1'
              )}>
              
                  {unreadCount}
                </span>
            }
            </NavLink>
          </li>
        )}
      </ul>

      <div className="mx-4 border-t border-zinc-200" />

      <div className={cn('p-3', collapsed && 'px-2')}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-2 py-2',
            collapsed && 'justify-center px-0'
          )}>
          
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white ring-2 ring-gold">
            {user.initials}
          </span>
          {!collapsed &&
          <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-navy">{user.name}</p>
              <p className="truncate text-[11px] text-zinc-500">
                {user.role} · {scopeLabel(user.role, user.unit)}
              </p>
            </div>
          }
        </div>

        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            onNavigate?.();
          }}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-navy',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
            collapsed && 'justify-center px-0'
          )}>
          <UserCircle2Icon className="h-4 w-4 shrink-0" />
          {!collapsed && 'Profile'}
        </button>

        <button
          type="button"
          onClick={signOut}
          className={cn(
            'mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
            collapsed && 'justify-center px-0'
          )}>
          
          <LogOutIcon className="h-4 w-4 shrink-0" />
          {!collapsed && 'Log out'}
        </button>

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className={cn(
            'mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-navy lg:flex',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
            collapsed && 'justify-center px-0'
          )}>
          
          {collapsed ?
          <ChevronsRightIcon className="h-4 w-4" /> :

          <>
              <ChevronsLeftIcon className="h-4 w-4" />
              Collapse
            </>
          }
        </button>
      </div>
    </nav>);

}
