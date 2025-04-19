
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, UserRole, AuthState } from "@/types/auth.types";
import { ROUTES } from "@/constants/routes";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  const navigate = useNavigate();
  
  // Set up auth state listener on mount
  useEffect(() => {
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Set authenticated state immediately for better UX
          setAuthState(prevState => ({
            ...prevState,
            isAuthenticated: true,
            isLoading: false,
          }));
          
          // Fetch profile in a non-blocking way
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Set authenticated state immediately
          setAuthState(prevState => ({
            ...prevState,
            isAuthenticated: true,
            isLoading: false,
          }));
          
          // Fetch profile in a non-blocking way
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      if (profile) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const userData: User = {
            id: user.id,
            email: user.email || '',
            displayName: profile.display_name || user.email?.split('@')[0] || '',
            role: profile.role as UserRole,
            avatarUrl: profile.avatar_url,
            createdAt: new Date(user.created_at),
          };
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Navigate based on user role if this is a fresh login
          if (!document.referrer.includes(window.location.host)) {
            navigateByRole(userData.role);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Helper function to navigate based on user role
  const navigateByRole = (role: UserRole) => {
    switch (role) {
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
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Login successful", {
        description: "Welcome back!",
      });
      
      // Navigation will be handled by the auth state listener
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
            role
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Registration successful", {
        description: `Welcome to Assessify, ${displayName}!`,
      });
      
      // Navigation will be handled by the auth state listener
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      toast.success("Logged out", {
        description: "You have been successfully logged out.",
      });
      
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Logout error:", error);
      
      toast.error("Logout failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + ROUTES.LOGIN,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent", {
        description: `If ${email} is associated with an account, you will receive password reset instructions.`,
      });
      
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error("Password reset failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
