
import { Button } from "@/components/ui/button";

interface ExamFilterControlsProps {
  filter: "all" | "upcoming" | "available" | "past";
  setFilter: (filter: "all" | "upcoming" | "available" | "past") => void;
}

const ExamFilterControls = ({ filter, setFilter }: ExamFilterControlsProps) => (
  <div className="flex space-x-2">
    <Button 
      variant={filter === "all" ? "default" : "outline"}
      size="sm"
      onClick={() => setFilter("all")}
    >
      All
    </Button>
    <Button 
      variant={filter === "upcoming" ? "default" : "outline"}
      size="sm"
      onClick={() => setFilter("upcoming")}
    >
      Upcoming
    </Button>
    <Button 
      variant={filter === "available" ? "default" : "outline"}
      size="sm"
      onClick={() => setFilter("available")}
    >
      Available
    </Button>
    <Button 
      variant={filter === "past" ? "default" : "outline"}
      size="sm"
      onClick={() => setFilter("past")}
    >
      Past
    </Button>
  </div>
);

export default ExamFilterControls;
