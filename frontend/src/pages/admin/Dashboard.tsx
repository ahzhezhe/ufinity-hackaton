import { useSeats } from '@/hooks/useSeats';
import { useBookings } from '@/hooks/useBookings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Spinner';
import { formatDateForApi } from '@/lib/utils';
import { Calendar, Armchair, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const today = formatDateForApi(new Date());
  const { data: seats, isLoading: seatsLoading } = useSeats();
  const { data: todayBookings, isLoading: bookingsLoading } = useBookings({ date: today });

  if (seatsLoading || bookingsLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  const totalSeats = seats?.length || 0;
  const blockedSeats = seats?.filter((s) => s.isBlocked).length || 0;
  const availableSeats = totalSeats - blockedSeats;
  const todayBookingCount = todayBookings?.length || 0;

  // Calculate occupancy rate
  const maxPossibleBookings = availableSeats * 2; // AM + PM slots
  const occupancyRate = maxPossibleBookings > 0
    ? Math.round((todayBookingCount / maxPossibleBookings) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of hot desk booking system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Seats"
          value={totalSeats}
          icon={<Armchair className="h-4 w-4 text-muted-foreground" />}
          description={`${blockedSeats} blocked`}
        />
        <StatCard
          title="Available Seats"
          value={availableSeats}
          icon={<Armchair className="h-4 w-4 text-green-500" />}
          description="Ready for booking"
        />
        <StatCard
          title="Today's Bookings"
          value={todayBookingCount}
          icon={<Calendar className="h-4 w-4 text-blue-500" />}
          description={`${today}`}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          description="Today's utilization"
        />
      </div>

      {/* Today's Bookings Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayBookings && todayBookings.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-900">Morning (AM)</h4>
                  <p className="mt-1 text-2xl font-bold text-blue-600">
                    {todayBookings.filter((b) => b.slot === 'AM').length}
                  </p>
                  <p className="text-sm text-blue-600/70">bookings</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-4">
                  <h4 className="font-medium text-orange-900">Afternoon (PM)</h4>
                  <p className="mt-1 text-2xl font-bold text-orange-600">
                    {todayBookings.filter((b) => b.slot === 'PM').length}
                  </p>
                  <p className="text-sm text-orange-600/70">bookings</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Recent Bookings</h4>
                <div className="space-y-2">
                  {todayBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{booking.user?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">
                        {booking.seat?.name} - {booking.slot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No bookings for today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
