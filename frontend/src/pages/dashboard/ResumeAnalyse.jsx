import { Table, Button } from "flowbite-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const ResumeAnalyse = () => {
  return (
    <DashboardLayout>
      <Table hoverable className="w-full text-gray-900 dark:text-gray-300">
        <Table.Head>
          <Table.HeadCell className="py-3 px-4 text-left">Name</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">Experience (Years)</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">Matching</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">View CV</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">Status</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">Change Status</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell className="py-3 px-4">John Doe</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">5</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">85%</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">
              <Button size="sm" color="blue">View</Button>
            </Table.Cell>
            <Table.Cell className="py-3 px-4 text-center text-green-500">Approved</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">
              <Button size="sm" color="yellow">Change</Button>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell className="py-3 px-4">Jane Smith</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">3</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">92%</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">
              <Button size="sm" color="blue">View</Button>
            </Table.Cell>
            <Table.Cell className="py-3 px-4 text-center text-red-500">Pending</Table.Cell>
            <Table.Cell className="py-3 px-4 text-center">
              <Button size="sm" color="yellow">Change</Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ResumeAnalyse;