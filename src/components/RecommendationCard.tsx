import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Volume2, Clock, AlertCircle, TrendingUp, Wifi } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import type { RankedSpot } from "@/lib/recommend";

interface RecommendationCardProps {
  spot: RankedSpot;
  rank: number;
}

export const RecommendationCard = ({ spot, rank }: RecommendationCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occupancy, setOccupancy] = useState(spot.occupancyPercent || 50);
  const [noiseLevel, setNoiseLevel] = useState<"Quiet" | "Medium" | "Loud" | null>(null);

  const timeSinceUpdate = spot.updatedAt ? Math.round((Date.now() - new Date(spot.updatedAt).getTime()) / 60000) : null;

  // Convert distance to miles and walking time
  const distanceMiles = spot.distanceMeters ? (spot.distanceMeters * 0.000621371).toFixed(2) : "N/A";
  const walkingMinutes = spot.distanceMeters ? Math.round(spot.distanceMeters / 80) : null;

  const handleSubmitUpdate = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-status", {
        body: {
          spotId: spot.id,
          occupancyPercent: occupancy,
          noiseLevel: noiseLevel,
        },
      });

      if (error) throw error;

      toast.success("Thanks for the update!", {
        description: "Your feedback helps other students find the best spots.",
      });
    } catch (error) {
      console.error("Error submitting update:", error);
      toast.error("Failed to submit update", {
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-5 space-y-4 hover:shadow-md transition-shadow animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-semibold">
              #{rank}
            </Badge>
            <h3 className="font-semibold text-base leading-tight">{spot.name}</h3>
          </div>
          {(spot.building || spot.floor) && (
            <p className="text-sm text-muted-foreground">
              {spot.building} {spot.floor && `• ${spot.floor}`}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm">
          <div className={`p-1.5 rounded-lg ${spot.occupancyPercent !== null && spot.occupancyPercent !== undefined ? "bg-primary/10" : "bg-muted"}`}>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">
              {spot.occupancyPercent !== null && spot.occupancyPercent !== undefined ? `${spot.occupancyPercent}% full` : "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground">Occupancy</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 rounded-lg bg-secondary">
            <MapPin className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div>
            <div className="font-medium">
              {distanceMiles} mi {walkingMinutes && `• ${walkingMinutes} min`}
            </div>
            <div className="text-xs text-muted-foreground">Walking distance</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 rounded-lg bg-secondary">
            <Clock className="w-4 h-4 text-secondary-foreground" />
          </div>
          <div>
            <div className="font-medium">{timeSinceUpdate !== null ? `${timeSinceUpdate}m ago` : "N/A"}</div>
            <div className="text-xs text-muted-foreground">Last updated</div>
          </div>
        </div>
      </div>

      {spot.warnings && spot.warnings.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">{spot.warnings.join(" • ")}</p>
        </div>
      )}

      {spot.reasons && spot.reasons.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-primary">
            <span className="font-medium">Why this matched:</span> {spot.reasons.join(", ")}
          </p>
        </div>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            Submit Quick Update
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Spot Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Occupancy: {occupancy}%</label>
              <Slider value={[occupancy]} onValueChange={(v) => setOccupancy(v[0])} min={0} max={100} step={5} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Noise Level</label>
              <div className="flex gap-2">
                {(["Quiet", "Medium", "Loud"] as const).map((level) => (
                  <Badge
                    key={level}
                    variant={noiseLevel === level ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 flex-1 justify-center"
                    onClick={() => setNoiseLevel(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleSubmitUpdate} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
