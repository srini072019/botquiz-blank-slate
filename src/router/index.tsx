
import { RouteObject } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home"; // Add import for Home

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Instructor pages
import InstructorDashboard from "@/pages/instructor/Dashboard";
import Courses from "@/pages/instructor/Courses";
import CourseDetail from "@/pages/instructor/CourseDetail";
import Subjects from "@/pages/instructor/Subjects";
import SubjectDetail from "@/pages/instructor/SubjectDetail";
import Questions from "@/pages/instructor/Questions";
import Exams from "@/pages/instructor/Exams";
import CreateExam from "@/pages/instructor/CreateExam";
import EditExam from "@/pages/instructor/EditExam";

// Candidate pages
import CandidateDashboard from "@/pages/candidate/Dashboard";
import CandidateCourses from "@/pages/candidate/Courses";
import CandidateExams from "@/pages/candidate/Exams";
import ExamPage from "@/pages/candidate/ExamPage";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";

// Public pages
import CourseDetails from "@/pages/CourseDetails";

const routes: RouteObject[] = [
  // Root
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
  },
  
  // Home
  {
    path: "/home",
    element: <Home />,
  },
  
  // Auth
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  
  // Instructor
  {
    path: "/instructor/dashboard",
    element: <InstructorDashboard />,
  },
  {
    path: "/instructor/courses",
    element: <Courses />,
  },
  {
    path: "/instructor/courses/:courseId",
    element: <CourseDetail />,
  },
  {
    path: "/instructor/subjects",
    element: <Subjects />,
  },
  {
    path: "/instructor/subjects/:subjectId",
    element: <SubjectDetail />,
  },
  {
    path: "/instructor/questions",
    element: <Questions />,
  },
  {
    path: "/instructor/exams",
    element: <Exams />,
  },
  {
    path: "/instructor/exams/create",
    element: <CreateExam />,
  },
  {
    path: "/instructor/exams/:examId/edit",
    element: <EditExam />,
  },
  
  // Candidate
  {
    path: "/candidate/dashboard",
    element: <CandidateDashboard />,
  },
  {
    path: "/candidate/courses",
    element: <CandidateCourses />,
  },
  {
    path: "/candidate/exams",
    element: <CandidateExams />,
  },
  {
    path: "/candidate/exams/:examId",
    element: <ExamPage />,
  },
  
  // Admin
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },
  
  // Public
  {
    path: "/courses/:courseId",
    element: <CourseDetails />,
  },
];

export default { routes };
