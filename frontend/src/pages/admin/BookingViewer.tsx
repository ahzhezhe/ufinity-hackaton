import { useState } from 'react';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { getErrorMessage } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
import { formatDate, formatDateForApi } from '@/lib/utils';
import { Calendar, Search, Trash2 } from 'lucide-react';

export function BookingViewer() {
  const [startDate, setStartDate] = useState(formatDateForApi(new Date()));
  const [endDate, setEndDate] = useState(formatDateForApi(new Date()));
  const [error, setError] = useState<string | null>(null);

  const { data: bookings, isLoading } = useBookings({
    startDate,
    endDate,
  });

  const cancelBooking = useCancelBooking();

  const handleCancel = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to cancel ${userName}'s booking?`)) return;
    setError(null);
    try {
      await cancelBooking.mutateAsync(id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Bookings</h1>
        <p className="text-muted-foreground">View and manage all desk bookings</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-4 w-4" />
            Filter Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bookings
            {bookings && (
              <Badge variant="secondary" className="ml-2">
                {bookings.length} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading message="Loading bookings..." />
          ) : bookings && bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>
                      <Badge variant={booking.slot === 'AM' ? 'default' : 'secondary'}>
                        {booking.slot}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.seat?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{booking.user?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.user?.email || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleCancel(booking.id, booking.user?.name || 'Unknown')
                        }
                        disabled={cancelBooking.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No bookings found for the selected date range.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
