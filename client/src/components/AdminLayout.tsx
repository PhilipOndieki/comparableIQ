import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  ScrollText,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Navbar } from './Navbar';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/comparables', icon: MapPin, label: 'Comparables', end: false },
  { to: '/admin/users', icon: Users, label: 'Users', end: false },
  { to: '/admin/audit', icon: ScrollText, label: 'Audit Logs', end: false },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col sticky top-16 h-[calc(100vh-64px)]">
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1A3C5E] text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar user footer */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 px-2 py-2">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="h-7 w-7 rounded-full" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-[#1A3C5E] flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{user?.displayName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => logout()}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
