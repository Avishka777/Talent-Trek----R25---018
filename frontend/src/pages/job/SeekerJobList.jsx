import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";
import { Select, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import JobCard from "../../components/job/JobCard";
import jobService from "../../services/jobService";
import Loading from "../../components/public/Loading";

const SeekerJobList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState("recommended");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  // Fetch jobs based on filter selection
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        let response;
        if (jobFilter === "recommended") {
          response = await jobService.getMatchingJobs(token);
          // For matching jobs, our endpoint returns { success: true, jobs: [...] }
          if (response.success && response.jobs && Array.isArray(response.jobs)) {
            setJobs(response.jobs);
          } else {
            setJobs([]);
          }
        } else {
          response = await jobService.getAllJobs();
          // For all jobs, our endpoint returns { success: true, jobs: [...] }
          if (response.success && response.jobs && Array.isArray(response.jobs)) {
            setJobs(response.jobs);
          } else {
            setJobs([]);
          }
        }
      } catch (error) {
        console.error("Error fetching jobs.", error);
        setJobs([]);
      }
      setLoading(false);
    };

    fetchJobs();
  }, [jobFilter, token]);

  // Filter jobs based on search term.
  // Use top-level jobTitle if available; otherwise, fallback to the nested job.jobTitle.
  const filteredJobs = jobs.filter((job) => {
    const title = job.jobTitle || (job.job && job.job.jobTitle) || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle navigation when a job card is clicked.
  // Use the nested job._id if available.
  const handleJobClick = (job) => {
    const jobId = job.job ? job.job._id : job._id;
    const matchPercentage = job.overall_match_percentage
      ? job.overall_match_percentage.toFixed(2)
      : "0.00";
    navigate(`/job/${jobId}/${matchPercentage}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Explore Job Opportunities
      </h1>
      <div className="flex gap-4 mb-6 w-full max-w-3xl">
        <TextInput
          icon={Search}
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg"
        />
        <Select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="flex w-72"
        >
          <option value="all">All Jobs</option>
          <option value="recommended">Recommended Jobs</option>
        </Select>
      </div>
      <div className="flex justify-center">
        {loading ? (
          <div>
            <Loading />
            <p className="text-gray-600 text-center mt-10 font-semibold text-xl">
              Loading jobs...
            </p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 min-w-full">
            {filteredJobs.map((job, index) => (
              <div key={index} onClick={() => handleJobClick(job)}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-600 text-center mt-10 font-semibold text-xl">
            - Sorry, Currently No Jobs Found -
          </p>
        )}
      </div>
    </div>
  );
};

export default SeekerJobList;
