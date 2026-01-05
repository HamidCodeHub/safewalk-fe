import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, Users, Route, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/trips', icon: Route, label: 'Trips' },
  { path: '/locations', icon: MapPin, label: 'Locations' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-colors',
                isActive && 'bg-accent'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
