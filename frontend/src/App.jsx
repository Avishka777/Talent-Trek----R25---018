import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/public/Header";
import Footers from "./components/public/Footer";
import Home from "./pages/home/Home";
import Signin from "./pages/auth/SignIn";
import Signup from "./pages/auth/SignUp";
import ResumeUpload from "./pages/resume/ResumeUpload";
import JobDetails from "./pages/job/JobDetails";
import SeekerJobList from "./pages/job/SeekerJobList";
import JobCreate from "./pages/job/JobCreate";
import ResumeAnalyse from "./pages/dashboard/ResumeAnalyse";
import RecruiterJobList from "./pages/dashboard/RecruiterJobList";
import MyProfile from "./pages/auth/MyProfile";
import JobUpdate from "./pages/job/JobUpdate";
import ProtectedRoute from "./components/public/ProtectedRoute";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter = ["/sign-in", "/sign-up"].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/my-profile" element={<MyProfile />} />

        {/* Protected Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Job Seeker"]} />}>
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/seeker/jobs" element={<SeekerJobList />} />
          <Route path="/job/:jobId/:matchPercentage?" element={<JobDetails />} />
        </Route>

        {/* Protected Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Recruiter"]} />}>
          <Route path="/dashboard/job/create" element={<JobCreate />} />
          <Route path="/dashboard/job/update/:jobId" element={<JobUpdate />} />
          <Route path="/dashboard/resume/analyse" element={<ResumeAnalyse />} />
          <Route path="/dashboard/jobs" element={<RecruiterJobList />} />
        </Route>
      </Routes>
      {!hideHeaderFooter && <Footers />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
