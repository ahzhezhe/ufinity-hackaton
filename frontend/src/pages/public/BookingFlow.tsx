import { useState } from 'react';
import { useSeats, useSeatAvailabilityRange } from '@/hooks/useSeats';
import { useBulkCreateBookings } from '@/hooks/useBookings';
import { getErrorMessage } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { formatDate, formatDateForApi, getDatesInRange } from '@/lib/utils';
import { Calendar, Check, AlertCircle } from 'lucide-react';
import type { BookingSlot } from '@/types';

export function BookingFlow() {
  const [step, setStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<BookingSlot[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(formatDateForApi(new Date()));
  const [endDate, setEndDate] = useState(formatDateForApi(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: seats } = useSeats();
  const { isLoading: availabilityLoading } = useSeatAvailabilityRange(
    selectedDates.length > 0 ? selectedDates[0] : startDate,
    selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : endDate
  );
  const bulkBooking = useBulkCreateBookings();

  const handleDateRangeConfirm = () => {
    const dates = getDatesInRange(new Date(startDate), new Date(endDate));
    setSelectedDates(dates.map(formatDateForApi));
    setStep(2);
  };

  const toggleSlot = (slot: BookingSlot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleSubmit = async () => {
    if (selectedSeats.length === 0 || selectedDates.length === 0 || selectedSlots.length === 0) {
      setError('Please select at least one seat, date, and slot');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await bulkBooking.mutateAsync({
        seatIds: selectedSeats,
        dates: selectedDates,
        slots: selectedSlots,
      });

      if (result.created.length > 0) {
        setSuccess(`Successfully created ${result.created.length} booking(s)`);
      }
      if (result.failed.length > 0) {
        setError(`${result.failed.length} booking(s) failed: ${result.failed.map((f) => f.reason).join(', ')}`);
      }

      // Reset
      setSelectedSeats([]);
      setSelectedDates([]);
      setSelectedSlots([]);
      setStep(1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const availableSeats = seats?.filter((s) => !s.isBlocked) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Multi-Day Booking</h1>
        <p className="text-muted-foreground">Book desks across multiple days</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-100 p-3 text-sm text-green-800">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
            <span className={step >= s ? 'font-medium' : 'text-muted-foreground'}>
              {s === 1 ? 'Select Dates' : s === 2 ? 'Select Slots' : 'Select Seats'}
            </span>
            {s < 3 && <div className="h-px w-8 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Step 1: Date Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date Range
            </CardTitle>
            <CardDescription>Choose the dates you want to book</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  min={formatDateForApi(new Date())}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleDateRangeConfirm}>Continue</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Slot Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Time Slots</CardTitle>
            <CardDescription>
              Choose which time slots you need ({selectedDates.length} days selected)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => toggleSlot('AM')}
                className={`flex-1 rounded-md border-2 p-4 text-center transition-colors ${
                  selectedSlots.includes('AM')
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="text-lg font-medium">Morning (AM)</div>
                <div className="text-sm text-muted-foreground">9:00 AM - 1:00 PM</div>
              </button>
              <button
                onClick={() => toggleSlot('PM')}
                className={`flex-1 rounded-md border-2 p-4 text-center transition-colors ${
                  selectedSlots.includes('PM')
                    ? 'border-primary bg-primary/10'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="text-lg font-medium">Afternoon (PM)</div>
                <div className="text-sm text-muted-foreground">1:00 PM - 6:00 PM</div>
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={selectedSlots.length === 0}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Seat Selection */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Seats</CardTitle>
            <CardDescription>
              Choose seats to book ({selectedSlots.join(', ')} slots for {selectedDates.length} days)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availabilityLoading ? (
              <Loading message="Checking availability..." />
            ) : (
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                {availableSeats.map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() => toggleSeat(seat.id)}
                    className={`rounded-md border-2 p-3 text-left transition-colors ${
                      selectedSeats.includes(seat.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{seat.name}</span>
                      {selectedSeats.includes(seat.id) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <Badge variant="secondary" className="mt-1">
                      {seat.type}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedSeats.length === 0 || bulkBooking.isPending}
              >
                {bulkBooking.isPending
                  ? 'Booking...'
                  : `Book ${selectedSeats.length} Seat(s)`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {step > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dates:</span>
                <span>
                  {selectedDates.length > 0
                    ? `${formatDate(selectedDates[0])} - ${formatDate(selectedDates[selectedDates.length - 1])}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slots:</span>
                <span>{selectedSlots.length > 0 ? selectedSlots.join(', ') : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats:</span>
                <span>
                  {selectedSeats.length > 0
                    ? availableSeats
                        .filter((s) => selectedSeats.includes(s.id))
                        .map((s) => s.name)
                        .join(', ')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total Bookings:</span>
                <span>{selectedDates.length * selectedSlots.length * selectedSeats.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
