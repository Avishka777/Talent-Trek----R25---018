import Loading from "../../components/public/Loading";
import AppliedJobCard from "../../components/job/AppliedJobCard";
import appliedJobService from "../../services/appliedJobService";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Badge } from "flowbite-react";
import { Briefcase, Clock, XCircle, CheckCircle, Search } from "lucide-react";

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Tab configuration
  const tabs = [
    { id: "all", label: "All Applications", icon: Briefcase },
    { id: "applied", label: "Applied", icon: Briefcase },
    { id: "interview", label: "Interview", icon: Clock },
    { id: "rejected", label: "Rejected", icon: XCircle },
    { id: "hired", label: "Hired", icon: CheckCircle },
  ];

  // Fetch user's applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await appliedJobService.getUserApplications(token);
        if (response.success) {
          setAppliedJobs(response.applications || []);
          setFilteredJobs(response.applications || []);
        } else {
          setError(response.message || "Failed to load applications");
        }
      } catch (err) {
        console.error("Failed to fetch applied jobs:", err);
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppliedJobs();
    } else {
      setError("Authentication required");
      setLoading(false);
    }
  }, [token]);

  // Filter jobs based on active tab and search term
  useEffect(() => {
    let result = [...appliedJobs];

    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter((job) => job.status.toLowerCase() === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter((job) => {
        const jobData = job.job || {};
        const title = jobData.jobTitle || "";
        const company = jobData.company?.companyName || "";
        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort jobs
    if (sortOption === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "deadline") {
      result.sort((a, b) => {
        const deadlineA = a.job?.applicationDeadline || "";
        const deadlineB = b.job?.applicationDeadline || "";
        return new Date(deadlineA) - new Date(deadlineB);
      });
    }

    setFilteredJobs(result);
  }, [activeTab, appliedJobs, searchTerm, sortOption]);

  const getStatusBadge = (status) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "applied":
        return (
          <Badge color="info" icon={Briefcase}>
            {status}
          </Badge>
        );
      case "interview":
        return (
          <Badge color="purple" icon={Clock}>
            {status}
          </Badge>
        );
      case "rejected":
        return (
          <Badge color="failure" icon={XCircle}>
            {status}
          </Badge>
        );
      case "hired":
        return (
          <Badge color="success" icon={CheckCircle}>
            {status}
          </Badge>
        );
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  if (loading) {
    return <Loading message="Loading your applications..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center justify-center">
        <div className="text-red-500 dark:text-red-400 text-lg font-medium">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderJobList = () => {
    if (filteredJobs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No job applications found{" "}
            {searchTerm ? "matching your search" : "in this category"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 min-w-full">
        {filteredJobs.map((application) => (
          <div
            key={application._id}
            className="relative"
            onClick={() => navigate(`/jobs/${application.job?._id}`)}
          >
            <div className="absolute top-4 right-4 z-10">
              {getStatusBadge(application.status)}
            </div>
            <AppliedJobCard
              job={{
                ...(application.job || {}),
                status: application.status,
                appliedDate: application.createdAt,
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        My Job Applications
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6 w-full max-w-6xl">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full md:w-48"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="deadline">By Deadline</option>
        </Select>
      </div>

      {/* Custom Tailwind CSS Tabs */}
      <div className="w-full max-w-6xl mb-6">
        <div className="flex overflow-x-auto">
          <nav
            className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1"
            aria-label="Tabs"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 shadow"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-6xl">{renderJobList()}</div>
    </div>
  );
};

export default AppliedJobs;
