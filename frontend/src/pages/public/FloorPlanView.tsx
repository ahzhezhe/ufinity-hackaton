import { useActiveFloorPlan } from '@/hooks/useFloorPlans';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Spinner';
import { Map, ImageOff } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${BACKEND_URL}${imageUrl}`;
}

export function FloorPlanView() {
  const { data: floorPlan, isLoading, error } = useActiveFloorPlan();

  if (isLoading) {
    return <Loading message="Loading floor plan..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Office Floor Plan</h1>
        <p className="text-muted-foreground">View the current office layout</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            {floorPlan?.name || 'Floor Plan'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ImageOff className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">Unable to load floor plan</p>
              <p className="text-sm">Please try again later or contact an administrator.</p>
            </div>
          ) : floorPlan ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border bg-muted/50">
                <img
                  src={getImageUrl(floorPlan.imageUrl)}
                  alt={floorPlan.name}
                  className="w-full h-auto object-contain max-h-[70vh]"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Click and drag to pan, scroll to zoom (if supported by your browser)
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ImageOff className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No floor plan available</p>
              <p className="text-sm">
                The office floor plan has not been uploaded yet.
                <br />
                Please contact an administrator.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
