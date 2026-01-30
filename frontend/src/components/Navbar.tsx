import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User, Calendar, LayoutDashboard, Settings } from 'lucide-react';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="border-b bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Hot Desk</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {isAdmin ? (
                <>
                  <NavLink to="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/seats">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Seats
                  </NavLink>
                  <NavLink to="/admin/bookings">
                    <Calendar className="mr-2 h-4 w-4" />
                    All Bookings
                  </NavLink>
                  <NavLink to="/admin/floor-plans">
                    Floor Plans
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/">Book a Desk</NavLink>
                  <NavLink to="/my-bookings">My Bookings</NavLink>
                  <NavLink to="/who-booked">Who Booked What</NavLink>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span>{user.name}</span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {user.role}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}
