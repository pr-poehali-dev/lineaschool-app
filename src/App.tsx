
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentLogin from "./pages/StudentLogin";
import StudentCabinet from "./pages/StudentCabinet";
import TeacherLogin from "./pages/TeacherLogin";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/cabinet" element={<StudentCabinet />} />
          <Route path="/dashboard" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;