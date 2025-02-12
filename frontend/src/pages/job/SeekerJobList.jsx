import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Select, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import JobCard from "../../components/job/JobCard";
import jobService from "../../services/jobService";
import Loading from "../../components/Loading";

export default function SeekerJobList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getAllJobs();
        if (response.success) {
          setJobs(response.jobs);
        } else {
          setJobs([]);
        }
      } catch (error) {
        setJobs([]);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // Handle search
  const filteredJobs = jobs.filter((job) =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle card click to navigate to the job details page
  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
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
            {filteredJobs.map((job) => (
              <div key={job._id} onClick={() => handleJobClick(job._id)}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-600 text-center mt-10 font-semibold text-xl">
            - Sorry Currently No Jobs Found -
          </p>
        )}
      </div>
    </div>
  );
}
