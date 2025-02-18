import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TextInput } from "flowbite-react";
import { Pencil, Search, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Loading from "../../components/public/Loading";
import jobService from "../../services/jobService";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const RecruiterJobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useSelector((state) => state.auth);

  // Fetch User Created Job Details
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getJobsByUser(token);
        if (response.success) {
          setJobs(response.jobs);
        } else {
          setJobs([]);
        }
      } catch (error) {
        Swal.fire({
          title: "Fetching Failed",
          text: error.message || "Error Fetching Jobs.",
          confirmButtonColor: "red",
        });
        setJobs([]);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // Navigate to Update Page
  const handleUpdate = (jobId) => {
    navigate(`/dashboard/job/update/${jobId}`);
  };

  // Handle Delete Function
  const handleDelete = async (jobId) => {
    Swal.fire({
      title: "Are You Sure?",
      text: "This Action Will Permanently Delete Post.",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#28a0b5",
      confirmButtonText: "Yes Delete It!",
      cancelButtonText: "No Keep It!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await jobService.deleteJob(jobId, token);
          if (response.success) {
            setJobs(jobs.filter((job) => job._id !== jobId));
            Swal.fire({
              title: "Deleted",
              text: response.message || "The Job Has Been Deleted.",
              confirmButtonColor: "#28a0b5",
            });
          } else {
            Swal.fire({
              title: "Error",
              text: response.message || "Failed to Delete Job.",
              confirmButtonColor: "red",
            });
          }
        } catch (error) {
          console.error("Error Deleting Job:", error);
          Swal.fire({
            title: "Deletion Failed",
            text: error.message || "Something Went Wrong.",
            confirmButtonColor: "red",
          });
        }
      }
    });
  };

  // Filter Jobs
  const filteredJobs = jobs.filter((job) =>
    job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Set Loading
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center mt-40">
          <Loading />
          <p className="text-gray-600 text-center mt-10 font-semibold text-xl">
            Loading Jobs...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex mb-4 justify-between">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-600">
          My Job List
        </h2>
        <TextInput
          icon={Search}
          placeholder="Search jobs..."
          className="flex w-96 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Table hoverable className="w-full text-gray-900 dark:text-gray-300">
        <Table.Head>
          <Table.HeadCell className="py-3 px-4 text-left">
            Job Title
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Work Experience
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Employment Type
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Posted Date
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Application Deadline
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {filteredJobs.map((job) => (
            <Table.Row key={job._id}>
              <Table.Cell className="py-3 px-4">{job.jobTitle}</Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {job.workExperience}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {job.employmentType}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {new Date(job.createdAt).toISOString().split("T")[0]}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {new Date(job.applicationDeadline).toISOString().split("T")[0]}
              </Table.Cell>
              <Table.Cell className="flex justify-center gap-4">
                <Pencil
                  className="cursor-pointer text-green-500 hover:text-green-700"
                  size={20}
                  onClick={() => handleUpdate(job._id)}
                />
                <Trash2
                  className="cursor-pointer text-red-500 hover:text-red-700"
                  size={20}
                  onClick={() => handleDelete(job._id)}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default RecruiterJobList;
