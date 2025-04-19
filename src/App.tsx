
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import router from "./router";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <TooltipProvider>
        <AuthProvider>
          <Routes>
            {router.routes.map((route) => (
              <Route 
                key={route.path}
                path={route.path}
                element={route.element}
                errorElement={route.errorElement}
              />
            ))}
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </TooltipProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
