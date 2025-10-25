import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, Presentation } from "lucide-react";
import { useState } from "react";

interface Preferences {
  duration: number;
  groupSize: number;
  useLocation: boolean;
  whiteboard: boolean;
}

interface PreferenceSelectorProps {
  onSubmit: (prefs: Preferences) => void;
}

export const PreferenceSelector = ({ onSubmit }: PreferenceSelectorProps) => {
  const [duration, setDuration] = useState(120);
  const [groupSize, setGroupSize] = useState(1);
  const [whiteboard, setWhiteboard] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      duration,
      groupSize,
      useLocation: true,
      whiteboard,
    });
  };

  return (
    <div className="space-y-6 p-6 bg-card rounded-2xl border border-border shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-primary" />
          <span>Study Duration: {duration} minutes</span>
        </div>
        <Slider
          value={[duration]}
          onValueChange={(v) => setDuration(v[0])}
          min={30}
          max={480}
          step={30}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="w-4 h-4 text-primary" />
          <span>Group Size: {groupSize}</span>
        </div>
        <Slider
          value={[groupSize]}
          onValueChange={(v) => setGroupSize(v[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Presentation className="w-4 h-4 text-primary" />
          <span>Need a Whiteboard?</span>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={whiteboard ? "default" : "outline"}
            className="cursor-pointer px-6 py-2 flex-1 justify-center"
            onClick={() => setWhiteboard(true)}
          >
            Yes
          </Badge>
          <Badge
            variant={!whiteboard ? "default" : "outline"}
            className="cursor-pointer px-6 py-2 flex-1 justify-center"
            onClick={() => setWhiteboard(false)}
          >
            No
          </Badge>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full gap-2"
        size="lg"
      >
        <MapPin className="w-4 h-4" />
        Find Spots Near Me
      </Button>
    </div>
  );
};