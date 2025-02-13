import { Table, Button, Select } from "flowbite-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useState } from "react";

const sampleData = [
  {
    name: "John Doe",
    experience: 5,
    matching: "85%",
    status: "Approved",
    statusColor: "text-green-500",
  },
  {
    name: "Jane Smith",
    experience: 3,
    matching: "92%",
    status: "Pending",
    statusColor: "text-red-500",
  },
  {
    name: "Michael Johnson",
    experience: 7,
    matching: "78%",
    status: "Reviewing",
    statusColor: "text-yellow-500",
  },
];

const statusOptions = ["Approved", "Pending", "Reviewing", "Rejected"];

const ResumeAnalyse = () => {
  const [statuses, setStatuses] = useState(
    sampleData.map((candidate) => candidate.status)
  );

  const handleStatusChange = (index, newStatus) => {
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = newStatus;
    setStatuses(updatedStatuses);
  };

  return (
    <DashboardLayout>
      <div className="flex mb-4 justify-between">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Resume Analyse
        </h2>
        <Select name="job" required className="flex w-96">
          <option value="">Select Relevent Job for Resume Analyse</option>
          <option value="Backend">Backend Developer</option>
          <option value="Fullstack">Fullstack Developer</option>
        </Select>
      </div>
      <Table hoverable className="w-full text-gray-900 dark:text-gray-300">
        <Table.Head>
          <Table.HeadCell className="py-3 px-4 text-left">Name</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Experience (Years)
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Matching
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            View CV
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Status
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Change Status
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {sampleData.map((candidate, index) => (
            <Table.Row key={index}>
              <Table.Cell className="py-3 px-4">{candidate.name}</Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {candidate.experience}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                {candidate.matching}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                <Button
                  size="xs"
                  gradientMonochrome="info"
                  className="w-full"
                  outline
                >
                  View
                </Button>
              </Table.Cell>
              <Table.Cell
                className={`py-3 px-4 text-center ${candidate.statusColor}`}
              >
                {candidate.status}
              </Table.Cell>
              <Table.Cell className="py-3 px-4 text-center">
                <Select
                  value={statuses[index]}
                  onChange={(e) => handleStatusChange(index, e.target.value)}
                >
                  {statusOptions.map((status, i) => (
                    <option key={i} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ResumeAnalyse;
