import { useState } from 'react';
import { useSeatAvailability } from '@/hooks/useSeats';
import { useCreateBooking } from '@/hooks/useBookings';
import { getErrorMessage } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { formatDate, formatDateForApi, getSeatTypeLabel } from '@/lib/utils';
import { Calendar, Check, X } from 'lucide-react';
import type { Seat, BookingSlot } from '@/types';

export function Availability() {
  const [selectedDate, setSelectedDate] = useState(formatDateForApi(new Date()));
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: seats, isLoading } = useSeatAvailability(selectedDate);
  const createBooking = useCreateBooking();

  const handleBook = async () => {
    if (!selectedSeat || !selectedSlot) return;

    setError(null);
    setSuccess(null);

    try {
      await createBooking.mutateAsync({
        seatId: selectedSeat.id,
        date: selectedDate,
        slot: selectedSlot,
      });
      setSuccess(`Successfully booked ${selectedSeat.name} for ${selectedSlot} on ${formatDate(selectedDate)}`);
      setSelectedSeat(null);
      setSelectedSlot(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const availableSeats = seats?.filter((s) => !s.isBlocked) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book a Desk</h1>
        <p className="text-muted-foreground">Check availability and book your desk</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-100 p-3 text-sm text-green-800">
          {success}
        </div>
      )}

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
              min={formatDateForApi(new Date())}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSeat(null);
                setSelectedSlot(null);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seat Grid */}
      {isLoading ? (
        <Loading message="Loading seat availability..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableSeats.length > 0 ? (
            availableSeats.map((seat) => (
              <SeatCard
                key={seat.id}
                seat={seat}
                isSelected={selectedSeat?.id === seat.id}
                selectedSlot={selectedSeat?.id === seat.id ? selectedSlot : null}
                onSelect={(slot) => {
                  setSelectedSeat(seat);
                  setSelectedSlot(slot);
                  setError(null);
                  setSuccess(null);
                }}
              />
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No available seats for this date.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Booking Confirmation */}
      {selectedSeat && selectedSlot && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Confirm Booking</CardTitle>
            <CardDescription>
              You are about to book the following desk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{selectedSeat.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedDate)} - {selectedSlot === 'AM' ? 'Morning' : 'Afternoon'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSeat(null);
                    setSelectedSlot(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleBook} disabled={createBooking.isPending}>
                  {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SeatCard({
  seat,
  isSelected,
  selectedSlot,
  onSelect,
}: {
  seat: Seat;
  isSelected: boolean;
  selectedSlot: BookingSlot | null;
  onSelect: (slot: BookingSlot) => void;
}) {
  const amAvailable = seat.availability?.am ?? true;
  const pmAvailable = seat.availability?.pm ?? true;

  return (
    <Card className={isSelected ? 'ring-2 ring-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{seat.name}</CardTitle>
          <Badge variant="secondary">{getSeatTypeLabel(seat.type)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <SlotButton
            label="AM"
            available={amAvailable}
            selected={isSelected && selectedSlot === 'AM'}
            onSelect={() => onSelect('AM')}
          />
          <SlotButton
            label="PM"
            available={pmAvailable}
            selected={isSelected && selectedSlot === 'PM'}
            onSelect={() => onSelect('PM')}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SlotButton({
  label,
  available,
  selected,
  onSelect,
}: {
  label: string;
  available: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  if (!available) {
    return (
      <div className="flex items-center justify-center gap-1 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        <X className="h-4 w-4" />
        {label}
      </div>
    );
  }

  return (
    <button
      onClick={onSelect}
      className={`flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-green-100 text-green-800 hover:bg-green-200'
      }`}
    >
      {selected && <Check className="h-4 w-4" />}
      {label}
    </button>
  );
}
