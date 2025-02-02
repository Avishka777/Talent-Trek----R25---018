import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footers from "./components/Footer";
import Home from "./pages/home/Home";
import Signin from "./pages/auth/SignIn";
import Signup from "./pages/auth/SignUp";
import ResumeUpload from "./pages/resume/ResumeUpload";
import JobDetails from "./pages/job/JobDetails";
import SeekerJobList from "./pages/job/SeekerJobList";
import JobCreationPage from "./pages/job/JobCreate";
import RecruiterJobList from "./pages/job/RecruiterJobList";
import ResumeAnalyse from "./pages/dashboard/ResumeAnalyse";

function Layout() {
  const location = useLocation();
  const hideHeaderFooter = ["/sign-in", "/sign-up"].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/seeker/jobs" element={<SeekerJobList />} />
        <Route path="/recruiter/jobs" element={<RecruiterJobList />} />
        <Route path="/job/create" element={<JobCreationPage />} />
        <Route path="/job/:jobId" element={<JobDetails />} />
        <Route path="/dashboard/resume/analyse" element={<ResumeAnalyse />} />
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
