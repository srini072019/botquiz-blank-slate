
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ExamFilterControlsProps {
  filter: "all" | "upcoming" | "available" | "past";
  setFilter: (filter: "all" | "upcoming" | "available" | "past") => void;
}

const ExamFilterControls = ({ filter, setFilter }: ExamFilterControlsProps) => {
  return (
    <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as any)}>
      <ToggleGroupItem value="all" aria-label="Toggle all exams" className="text-sm">
        All
      </ToggleGroupItem>
      <ToggleGroupItem value="available" aria-label="Toggle available exams" className="text-sm">
        Available & Pending
      </ToggleGroupItem>
      <ToggleGroupItem value="upcoming" aria-label="Toggle upcoming exams" className="text-sm">
        Upcoming
      </ToggleGroupItem>
      <ToggleGroupItem value="past" aria-label="Toggle past exams" className="text-sm">
        Past
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ExamFilterControls;
