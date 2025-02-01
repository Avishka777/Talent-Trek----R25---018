import { Button, Card } from "flowbite-react";
import { Briefcase, MapPin } from "lucide-react";
import { DollarSign, Clock, CalendarDays } from "lucide-react";

export default function JobDetails() {
  const sampleJob = {
    jobTitle: "Senior Software Engineer",
    companyName: "Google Inc.",
    companyLogo:
      "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    location: "San Francisco, CA / Remote",
    salaryRange: "$120,000 - $150,000 / year",
    employmentType: "Full-Time",
    postedDate: "3 days ago",
    applicationDeadline: "March 30, 2024",
    descriptionSnippet:
      "We are looking for a Senior Software Engineer to join our growing team. You'll be working with the latest technologies to build scalable applications.",
    skills: ["React.js", "Node.js", "TypeScript", "GraphQL", "AWS"],
    experience:
      "5+ years in software development, preferably in a senior role.",
    qualifications: [
      "Bachelor’s degree in Computer Science or related field",
      "Proficiency in JavaScript and backend development",
      "Experience with cloud platforms (AWS, GCP)",
    ],
    responsibilities: [
      "Design and implement scalable web applications",
      "Collaborate with cross-functional teams",
      "Write high-quality, maintainable code",
    ],
  };

  return (
    <Card className="w-full max-w-3xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg my-10 mx-auto">
      {/* Header */}
      <div className="flex justify-between space-x-4 mb-4">
        <div className="flex items-center gap-5">
          <img
            src={sampleJob.companyLogo}
            alt={sampleJob.companyName}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {sampleJob.jobTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {sampleJob.companyName}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Button gradientMonochrome="info" size="lg">
            Apply Now
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p className="flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" /> {sampleJob.location}
        </p>
        <p className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-500" />{" "}
          {sampleJob.salaryRange}
        </p>
        <p className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-purple-500" />{" "}
          {sampleJob.employmentType}
        </p>
        <p className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-yellow-500" />{" "}
          {sampleJob.postedDate}
        </p>
        <p className="flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-red-500" /> Deadline:{" "}
          {sampleJob.applicationDeadline}
        </p>
      </div>

      {/* Description Snippet */}
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        {sampleJob.descriptionSnippet}
      </p>

      {/* Required Skills */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Required Skills
        </h4>
        <ul className="flex flex-wrap mt-2 gap-2">
          {sampleJob.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm dark:bg-blue-900 dark:text-blue-300"
            >
              {skill}
            </span>
          ))}
        </ul>
      </div>

      {/* Work Experience */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Work Experience
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          {sampleJob.experience}
        </p>
      </div>

      {/* Qualifications */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Qualifications
        </h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
          {sampleJob.qualifications.map((qualification, index) => (
            <li key={index}>{qualification}</li>
          ))}
        </ul>
      </div>

      {/* Job Responsibilities */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Job Responsibilities
        </h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
          {sampleJob.responsibilities.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
