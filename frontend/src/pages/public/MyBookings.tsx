import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { getErrorMessage } from '@/hooks/useAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/utils';
import { Calendar, Trash2, AlertCircle } from 'lucide-react';

export function MyBookings() {
  const [error, setError] = useState<string | null>(null);
  const { data: bookings, isLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setError(null);
    try {
      await cancelBooking.mutateAsync(id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Separate upcoming and past bookings
  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings?.filter((b) => b.date >= today) || [];
  const pastBookings = bookings?.filter((b) => b.date < today) || [];

  if (isLoading) {
    return <Loading message="Loading your bookings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your desk bookings</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Bookings
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary">{upcomingBookings.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {formatDate(booking.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.slot === 'AM' ? 'default' : 'secondary'}>
                        {booking.slot === 'AM' ? 'Morning' : 'Afternoon'}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.seat?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.seat?.type === 'standing' ? 'Standing' : 'Regular'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelBooking.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No upcoming bookings. Book a desk to get started!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              Past Bookings
              <Badge variant="outline">{pastBookings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastBookings.slice(0, 10).map((booking) => (
                  <TableRow key={booking.id} className="text-muted-foreground">
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {booking.slot === 'AM' ? 'Morning' : 'Afternoon'}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.seat?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {booking.seat?.type === 'standing' ? 'Standing' : 'Regular'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pastBookings.length > 10 && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Showing 10 of {pastBookings.length} past bookings
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
