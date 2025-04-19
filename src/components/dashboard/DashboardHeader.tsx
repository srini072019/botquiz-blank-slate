
import { UserCheck } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  userRole: string;
}

const DashboardHeader = ({ userName, userRole }: DashboardHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
      <div className="flex items-center mt-2">
        <UserCheck className="h-5 w-5 text-assessify-primary mr-2" />
        <p className="text-gray-600 dark:text-gray-400">
          Welcome, <span className="font-semibold">{userName}</span> - 
          <span className="bg-assessify-accent text-assessify-primary px-2 py-0.5 rounded-full text-sm font-medium ml-2">{userRole}</span>
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
