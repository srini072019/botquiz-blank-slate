
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/auth.types";
import { ROUTES } from "@/constants/routes";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MobileMenuProps {
  role?: UserRole;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const MobileMenu = ({ 
  role,
  isAuthenticated,
  onLogout
}: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const adminNavItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.ADMIN_DASHBOARD },
    { label: "Instructors", href: ROUTES.ADMIN_INSTRUCTORS },
    { label: "Candidates", href: ROUTES.ADMIN_CANDIDATES },
    { label: "Courses", href: ROUTES.ADMIN_COURSES },
    { label: "Exams", href: ROUTES.ADMIN_EXAMS },
    { label: "Statistics", href: ROUTES.ADMIN_STATISTICS },
  ];

  const instructorNavItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.INSTRUCTOR_DASHBOARD },
    { label: "Courses", href: ROUTES.INSTRUCTOR_COURSES },
    { label: "Subjects", href: ROUTES.INSTRUCTOR_SUBJECTS },
    { label: "Questions", href: ROUTES.INSTRUCTOR_QUESTIONS },
    { label: "Exams", href: ROUTES.INSTRUCTOR_EXAMS },
    { label: "Results", href: ROUTES.INSTRUCTOR_RESULTS },
  ];

  const candidateNavItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.CANDIDATE_DASHBOARD },
    { label: "Courses", href: ROUTES.CANDIDATE_COURSES },
    { label: "Exams", href: ROUTES.CANDIDATE_EXAMS },
    { label: "Profile", href: ROUTES.CANDIDATE_PROFILE },
  ];

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "admin":
        return adminNavItems;
      case "instructor":
        return instructorNavItems;
      case "candidate":
        return candidateNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="md:hidden">
      <button 
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-assessify-primary"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile menu panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-gray-900 z-50 shadow-lg transform transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 flex justify-between border-b">
          <Logo size="sm" />
          <button
            onClick={closeMenu}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4">
          {isAuthenticated ? (
            <>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-4 mt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-4">
              <Link to={ROUTES.LOGIN} onClick={closeMenu}>
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} onClick={closeMenu}>
                <Button className="w-full bg-assessify-primary hover:bg-assessify-primary/90">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
