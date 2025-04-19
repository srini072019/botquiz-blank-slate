
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  
  // Redirect to appropriate dashboard if user is already authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !authState.isLoading) {
      goToDashboard();
    }
  }, [authState.isAuthenticated, authState.user, authState.isLoading]);
  
  const goToDashboard = () => {
    if (!authState.isAuthenticated || !authState.user) return;
    
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
    }
  };

  // If auth is still loading, show loading indicator
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
          <p className="text-xl text-gray-600">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        isAuthenticated={authState.isAuthenticated} 
        onLogout={logout}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-20 md:py-32">
          <div className="assessify-container text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Modern Online Examination Platform
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Create, manage, and conduct online examinations with ease. Perfect for educational institutions and organizations.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              {authState.isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="bg-assessify-primary hover:bg-assessify-primary/90 text-white"
                  onClick={goToDashboard}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-assessify-primary hover:bg-assessify-primary/90 text-white"
                    onClick={() => navigate(ROUTES.REGISTER)}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate(ROUTES.LOGIN)}
                  >
                    Log In
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="assessify-container">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Features
            </h2>
            <p className="mt-4 text-xl text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to create and manage online examinations
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="assessify-card flex flex-col items-center text-center p-8">
                <div className="h-14 w-14 bg-assessify-accent rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-7 w-7 text-assessify-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Course Management
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Create and organize courses, subjects, and manage enrollments with an intuitive interface.
                </p>
              </div>

              <div className="assessify-card flex flex-col items-center text-center p-8">
                <div className="h-14 w-14 bg-assessify-accent rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-assessify-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Question Bank
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Create and manage a diverse repository of questions with various formats and difficulty levels.
                </p>
              </div>

              <div className="assessify-card flex flex-col items-center text-center p-8">
                <div className="h-14 w-14 bg-assessify-accent rounded-full flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-assessify-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Role-Based Access
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Different interfaces and permissions for administrators, instructors, and candidates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-assessify-primary bg-opacity-10">
          <div className="assessify-container text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ready to get started?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of educational institutions using Assessify for their examination needs.
            </p>
            <Button 
              size="lg" 
              className="mt-8 bg-assessify-primary hover:bg-assessify-primary/90"
              onClick={() => navigate(ROUTES.REGISTER)}
            >
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
