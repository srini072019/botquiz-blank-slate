
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/types/auth.types";
import { useEffect, useState } from "react";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavItem = ({ href, children, className }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-assessify-primary bg-opacity-10 text-assessify-primary"
          : "text-gray-600 hover:text-assessify-primary hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800",
        className
      )}
    >
      {children}
    </Link>
  );
};

interface NavbarProps {
  role?: UserRole;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({ 
  role = "candidate", 
  isAuthenticated = false,
  onLogout
}: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Nav items based on user role
  const adminNavItems = [
    { label: "Dashboard", href: ROUTES.ADMIN_DASHBOARD },
    { label: "Instructors", href: ROUTES.ADMIN_INSTRUCTORS },
    { label: "Courses", href: ROUTES.ADMIN_COURSES },
    { label: "Exams", href: ROUTES.ADMIN_EXAMS },
  ];

  const instructorNavItems = [
    { label: "Dashboard", href: ROUTES.INSTRUCTOR_DASHBOARD },
    { label: "Courses", href: ROUTES.INSTRUCTOR_COURSES },
    { label: "Questions", href: ROUTES.INSTRUCTOR_QUESTIONS },
    { label: "Exams", href: ROUTES.INSTRUCTOR_EXAMS },
  ];

  const candidateNavItems = [
    { label: "Dashboard", href: ROUTES.CANDIDATE_DASHBOARD },
    { label: "Courses", href: ROUTES.CANDIDATE_COURSES },
    { label: "Exams", href: ROUTES.CANDIDATE_EXAMS },
  ];

  const getNavItems = () => {
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
    <nav
      className={cn(
        "sticky top-0 z-30 w-full transition-shadow duration-300",
        scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}
    >
      <div className="assessify-container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to={isAuthenticated ? `/${role}` : "/"} className="flex-shrink-0">
              <Logo />
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:space-x-2">
                {navItems.map((item) => (
                  <NavItem key={item.href} href={item.href}>
                    {item.label}
                  </NavItem>
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={onLogout}
              >
                Logout
              </Button>
            ) : (
              <>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button className="bg-assessify-primary hover:bg-assessify-primary/90">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          <MobileMenu 
            role={role}
            isAuthenticated={isAuthenticated}
            onLogout={onLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
