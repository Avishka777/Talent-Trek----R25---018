import { Table, Button, TextInput } from "flowbite-react";
import { Search } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useState } from "react";

const jobData = [
  {
    jobTitle: "Frontend Developer",
    postedDate: "2024-02-01",
    applicationDeadline: "2024-02-28",
    employmentType: "Full-Time",
  },
  {
    jobTitle: "Backend Developer",
    postedDate: "2024-01-20",
    applicationDeadline: "2024-02-15",
    employmentType: "Part-Time",
  },
  {
    jobTitle: "Data Scientist",
    postedDate: "2024-02-05",
    applicationDeadline: "2024-03-01",
    employmentType: "Contract",
  },
];

const RecruiterJobList = () => {
  const [jobs, setJobs] = useState(jobData);

  const handleUpdate = (index) => {
    console.log("Update job at index:", index);
  };

  const handleDelete = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="flex mb-4 justify-between">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          My Job List
        </h2>
        <div className="">
          <TextInput
            icon={Search}
            placeholder="Search jobs..."
            className="flex w-96 rounded-lg"
          />
        </div>
      </div>
      <Table hoverable className="w-full text-gray-900 dark:text-gray-300">
        <Table.Head>
          <Table.HeadCell className="py-3 px-4 text-left">
            Job Title
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Posted Date
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Application Deadline
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Employment Type
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Actions
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {jobs.map((job, index) => (
            <Table.Row key={index}>
              <Table.Cell className="py-3 px-4">{job.jobTitle}</Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {job.postedDate}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {job.applicationDeadline}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {job.employmentType}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center flex space-x-2">
                <Button
                  size="xs"
                  gradientMonochrome="info"
                  className="w-full"
                  outline
                  onClick={() => handleUpdate(index)}
                >
                  Update
                </Button>
                <Button
                  size="xs"
                  gradientMonochrome="failure"
                  className="w-full"
                  outline
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default RecruiterJobList;
