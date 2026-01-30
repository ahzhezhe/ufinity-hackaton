import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useFloorPlans,
  useUploadFloorPlan,
  useSetActiveFloorPlan,
  useDeleteFloorPlan,
} from '@/hooks/useFloorPlans';
import { getErrorMessage } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Spinner';
import { Upload, Check, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${BACKEND_URL}${imageUrl}`;
}

const uploadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.any().refine((files) => files?.length === 1, 'Image is required'),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export function FloorPlanUpload() {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: floorPlans, isLoading } = useFloorPlans();
  const uploadFloorPlan = useUploadFloorPlan();
  const setActive = useSetActiveFloorPlan();
  const deleteFloorPlan = useDeleteFloorPlan();

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (data: UploadFormData) => {
    setError(null);
    try {
      const file = data.image[0];
      await uploadFloorPlan.mutateAsync({ file, name: data.name });
      form.reset();
      setPreviewUrl(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSetActive = async (id: string) => {
    setError(null);
    try {
      await setActive.mutateAsync(id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this floor plan?')) return;
    setError(null);
    try {
      await deleteFloorPlan.mutateAsync(id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return <Loading message="Loading floor plans..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Floor Plans</h1>
        <p className="text-muted-foreground">Upload and manage office floor plans</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Floor Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Floor Plan Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Level 1 - East Wing"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image File</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  {...form.register('image')}
                  onChange={(e) => {
                    form.register('image').onChange(e);
                    handleFileChange(e);
                  }}
                />
                {form.formState.errors.image && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.image.message as string}
                  </p>
                )}
              </div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-md border object-contain"
                />
              </div>
            )}

            <Button type="submit" disabled={uploadFloorPlan.isPending}>
              {uploadFloorPlan.isPending ? 'Uploading...' : 'Upload Floor Plan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Floor Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {floorPlans && floorPlans.length > 0 ? (
          floorPlans.map((floorPlan) => (
            <Card key={floorPlan.id} className={floorPlan.isActive ? 'ring-2 ring-primary' : ''}>
              <CardContent className="pt-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <img
                    src={getImageUrl(floorPlan.imageUrl)}
                    alt={floorPlan.name}
                    className="relative z-10 h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{floorPlan.name}</h3>
                    {floorPlan.isActive && (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Uploaded {formatDate(floorPlan.uploadedAt || '')}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {!floorPlan.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(floorPlan.id)}
                        disabled={setActive.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(floorPlan.id)}
                      disabled={deleteFloorPlan.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No floor plans uploaded yet. Upload your first floor plan above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
