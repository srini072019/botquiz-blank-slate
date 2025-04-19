
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard based on role
    if (authState.isAuthenticated && authState.user) {
      switch (authState.user.role) {
        case "admin":
          navigate(ROUTES.ADMIN_DASHBOARD);
          break;
        case "instructor":
          navigate(ROUTES.INSTRUCTOR_DASHBOARD);
          break;
        case "candidate":
          navigate(ROUTES.CANDIDATE_DASHBOARD);
          break;
        default:
          navigate(ROUTES.HOME);
      }
    } else if (!authState.isLoading) {
      // If not authenticated and not loading, redirect to login page
      navigate(ROUTES.LOGIN);
    }
  }, [navigate, authState.isAuthenticated, authState.isLoading, authState.user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting...</h1>
        <p className="text-xl text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default Index;
