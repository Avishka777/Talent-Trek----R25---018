import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footers from "./components/Footer";
import Home from "./pages/home/Home";
import Signin from "./pages/auth/SignIn";
import Signup from "./pages/auth/SignUp";
import ResumeUpload from "./pages/resume/ResumeUpload";
import JobDetails from "./pages/job/JobDetails";

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
        <Route path="/job/:jobId" element={<JobDetails />} />
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
