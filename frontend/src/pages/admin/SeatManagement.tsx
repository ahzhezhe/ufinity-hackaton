import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSeats,
  useCreateSeat,
  useUpdateSeat,
  useDeleteSeat,
  useToggleSeatBlock,
} from '@/hooks/useSeats';
import { useFloorPlans } from '@/hooks/useFloorPlans';
import { getErrorMessage } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Plus, Pencil, Trash2, Lock, Unlock, X } from 'lucide-react';
import type { Seat, SeatType } from '@/types';

const seatSchema = z.object({
  name: z.string().min(1, 'Seat name is required'),
  type: z.enum(['regular', 'standing']),
  floorPlanId: z.string().optional(),
});

type SeatFormData = z.infer<typeof seatSchema>;

export function SeatManagement() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: seats, isLoading } = useSeats();
  const { data: floorPlans } = useFloorPlans();
  const createSeat = useCreateSeat();
  const updateSeat = useUpdateSeat();
  const deleteSeat = useDeleteSeat();
  const toggleBlock = useToggleSeatBlock();

  const form = useForm<SeatFormData>({
    resolver: zodResolver(seatSchema),
    defaultValues: {
      name: '',
      type: 'regular',
    },
  });

  const handleCreate = async (data: SeatFormData) => {
    setError(null);
    try {
      await createSeat.mutateAsync({
        name: data.name,
        type: data.type,
        floorPlanId: data.floorPlanId || null,
      });
      form.reset();
      setIsCreating(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdate = async (data: SeatFormData) => {
    if (!editingSeat) return;
    setError(null);
    try {
      await updateSeat.mutateAsync({
        id: editingSeat.id,
        data: {
          name: data.name,
          type: data.type,
        },
      });
      form.reset();
      setEditingSeat(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seat?')) return;
    try {
      await deleteSeat.mutateAsync(id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleToggleBlock = async (seat: Seat) => {
    try {
      await toggleBlock.mutateAsync({ id: seat.id, isBlocked: !seat.isBlocked });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const openEditForm = (seat: Seat) => {
    setEditingSeat(seat);
    setIsCreating(false);
    form.reset({
      name: seat.name,
      type: seat.type,
      floorPlanId: seat.floorPlanId || undefined,
    });
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingSeat(null);
    setError(null);
    form.reset();
  };

  if (isLoading) {
    return <Loading message="Loading seats..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seat Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage hot desk seats</p>
        </div>
        {!isCreating && !editingSeat && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Seat
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingSeat) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingSeat ? 'Edit Seat' : 'Add New Seat'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={closeForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(editingSeat ? handleUpdate : handleCreate)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Seat Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Desk A1"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={form.watch('type')}
                    onValueChange={(value: SeatType) => form.setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Desk</SelectItem>
                      <SelectItem value="standing">Standing Desk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floorPlan">Floor Plan (Optional)</Label>
                  <Select
                    value={form.watch('floorPlanId') || 'none'}
                    onValueChange={(value) => form.setValue('floorPlanId', value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {floorPlans?.map((fp) => (
                        <SelectItem key={fp.id} value={fp.id}>
                          {fp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSeat.isPending || updateSeat.isPending}
                >
                  {editingSeat
                    ? updateSeat.isPending
                      ? 'Updating...'
                      : 'Update Seat'
                    : createSeat.isPending
                    ? 'Creating...'
                    : 'Create Seat'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Seats Table */}
      <Card>
        <CardContent className="pt-6">
          {seats && seats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Floor Plan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seats.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="font-medium">{seat.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {seat.type === 'standing' ? 'Standing' : 'Regular'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {seat.isBlocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="success">Available</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {floorPlans?.find((fp) => fp.id === seat.floorPlanId)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleBlock(seat)}
                          title={seat.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {seat.isBlocked ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditForm(seat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(seat.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No seats found. Create your first seat to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
