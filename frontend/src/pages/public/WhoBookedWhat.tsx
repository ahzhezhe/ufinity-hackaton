import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
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
import { Users, Calendar, Search } from 'lucide-react';

export function WhoBookedWhat() {
  const today = formatDateForApi(new Date());
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: bookings, isLoading } = useBookings({ date: selectedDate });

  // Group bookings by seat
  const bookingsBySeat = bookings?.reduce(
    (acc, booking) => {
      const seatName = booking.seat?.name || 'Unknown';
      if (!acc[seatName]) {
        acc[seatName] = { AM: null, PM: null };
      }
      acc[seatName][booking.slot] = booking.user?.name || 'Unknown';
      return acc;
    },
    {} as Record<string, { AM: string | null; PM: string | null }>
  );

  const seatNames = Object.keys(bookingsBySeat || {}).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Who Booked What</h1>
        <p className="text-muted-foreground">See who has booked which desks</p>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bookings for {formatDate(selectedDate)}
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
          ) : seatNames.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seat</TableHead>
                  <TableHead>Morning (AM)</TableHead>
                  <TableHead>Afternoon (PM)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seatNames.map((seatName) => {
                  const seatBookings = bookingsBySeat![seatName];
                  return (
                    <TableRow key={seatName}>
                      <TableCell className="font-medium">{seatName}</TableCell>
                      <TableCell>
                        {seatBookings.AM ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            {seatBookings.AM}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Available</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {seatBookings.PM ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            {seatBookings.PM}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Available</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No bookings found for {formatDate(selectedDate)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {bookings && bookings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {bookings.filter((b) => b.slot === 'AM').length}
                </div>
                <p className="text-sm text-muted-foreground">Morning Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {bookings.filter((b) => b.slot === 'PM').length}
                </div>
                <p className="text-sm text-muted-foreground">Afternoon Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{seatNames.length}</div>
                <p className="text-sm text-muted-foreground">Seats Booked</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
