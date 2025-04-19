
import { ReactNode, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants/routes";

interface InstructorLayoutProps {
  children: ReactNode;
}

const InstructorLayout = ({ children }: InstructorLayoutProps) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  
  // For development, allow access without authentication check
  if (import.meta.env.DEV) {
    console.log("Development mode: bypassing authentication check for instructor layout");
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar 
          role="instructor" 
          isAuthenticated={true} 
          onLogout={logout}
        />
        <main className="flex-1 py-8">
          <div className="assessify-container">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Protect the route - redirect if not instructor
  if (authState.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!authState.isAuthenticated || authState.user?.role !== "instructor") {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        role="instructor" 
        isAuthenticated={true} 
        onLogout={logout}
      />
      <main className="flex-1 py-8">
        <div className="assessify-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstructorLayout;
