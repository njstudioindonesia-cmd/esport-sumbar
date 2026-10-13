import React, { useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'danger' | 'warning' | 'success';
}

export interface DashboardLayoutProps {
  portal: 'eo' | 'admin';
  title: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  navItems: NavItem[];
  currentPath?: string;
  onLogout?: () => void;
  onOpenCommandPalette?: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  switchPortals?: Array<{
    label: string;
    href: string;
    type: 'public' | 'eo' | 'admin';
  }>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  portal,
  title,
  user,
  navItems,
  currentPath,
  onLogout,
  onOpenCommandPalette,
  children,
  actions,
  switchPortals = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEO = portal === 'eo';
  const portalName = isEO ? 'EO STUDIO' : 'ADMIN CONSOLE';
  const portalBadgeColor = isEO
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  const portalIcon = isEO ? (
    <Building2 className="w-4 h-4 text-emerald-400" />
  ) : (
    <ShieldCheck className="w-4 h-4 text-rose-400" />
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-black">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-amber-500/20">
              ES
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-xs text-amber-400 uppercase">
                ESPORT SUMBAR
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold border ${portalBadgeColor}`}
              >
                {portalIcon}
                {portalName}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden p-1 text-neutral-400 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search / Command trigger */}
        {onOpenCommandPalette && (
          <div className="px-4 py-3 border-b border-neutral-800/80">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-400 bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                Cari menu / aksi...
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-400">
                Ctrl+K
              </kbd>
            </button>
          </div>
        )}

        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== '/' && currentPath?.startsWith(item.href));

            let badgeClass = 'bg-neutral-800 text-neutral-300';
            if (item.badgeVariant === 'danger')
              badgeClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            else if (item.badgeVariant === 'warning')
              badgeClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            else if (item.badgeVariant === 'success')
              badgeClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <span
                      className={isActive ? 'text-amber-400' : 'text-neutral-500'}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
                  >
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Switch portal links */}
        {switchPortals.length > 0 && (
          <div className="p-3 border-t border-neutral-800/80 space-y-1">
            <div className="px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Pindah Portal
            </div>
            {switchPortals.map((sw) => (
              <a
                key={sw.href}
                href={sw.href}
                className="flex items-center justify-between px-3 py-1.5 rounded text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <span>{sw.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            ))}
          </div>
        )}

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-200 shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-neutral-200 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                {user?.role || 'Guest'}
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 border-b border-neutral-800 bg-neutral-900/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold text-neutral-100 flex items-center gap-2">
              {title}
            </h1>
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-b from-neutral-950 via-neutral-950 to-black">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
