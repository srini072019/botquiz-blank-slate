
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { NavigateFunction } from "react-router-dom";

interface QuickLinksProps {
  navigate: NavigateFunction;
}

const QuickLinks = ({ navigate }: QuickLinksProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Links</h2>
      <div className="mt-4 flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}>
          All Courses
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.INSTRUCTOR_SUBJECTS)}>
          Subjects
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.INSTRUCTOR_QUESTIONS)}>
          Questions
        </Button>
      </div>
    </Card>
  );
};

export default QuickLinks;
