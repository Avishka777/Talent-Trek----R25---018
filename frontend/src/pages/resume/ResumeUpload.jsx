import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Button, FileInput, Label } from "flowbite-react";
import Swal from "sweetalert2";
import Lottie from "lottie-react";
import resumeService from "../../services/resumeService";
import heroAnimation from "../../assets/animations/heroAnimation.json";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  // Fetch Resume Data
  useEffect(() => {
    const fetchResume = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await resumeService.getResume(token);
        if (response.success) {
          setResumeData(response.resume);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error || "Failed to fetch resume data!",
          confirmButtonText: "OK",
          confirmButtonColor: "red",
        });
      }
      setLoading(false);
    };

    fetchResume();
  }, [token]);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      Swal.fire({
        title: "File Selected",
        text: `${uploadedFile.name} is ready to upload!`,
        confirmButtonText: "OK",
        confirmButtonColor: "#28a0b5",
      });
    } else {
      Swal.fire({
        title: "Invalid File",
        text: "Please upload a valid PDF file.",
        confirmButtonText: "OK",
        confirmButtonColor: "red",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      {/* Left Side - Upload Section */}
      <div className="md:w-2/5 p-6 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Upload Your Resume
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          For better accuracy, upload an ATS-friendly resume.
        </p>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Resumes Optimized for ATS
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 my-2">
            Enhancv resumes and cover letters are tested against major ATS
            systems to ensure complete parsability.
          </p>
          <ul className="list-disc pl-4 text-sm text-gray-600 dark:text-gray-300">
            <li>Readable contact information</li>
            <li>Full experience section parsing</li>
            <li>Optimized skills section</li>
          </ul>
        </div>

        <div className="flex w-full items-center justify-center mt-6">
          <Label
            htmlFor="dropzone-file"
            className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pb-6 pt-5">
              <svg
                className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF Only
              </p>
            </div>
            <FileInput
              id="dropzone-file"
              className="hidden"
              onChange={handleFileChange}
              accept="application/pdf"
            />
          </Label>
        </div>
        {file && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 text-center">
            Selected File: {file.name}
          </p>
        )}
        <Button gradientMonochrome="info" className="mt-4">
          Upload Resume
        </Button>
      </div>

      {/* Right Side - Display Resume Data */}
      <div className="md:w-3/5 p-6 overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-6 md:mt-0 md:ml-6 max-h-screen">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Extracted Resume Data
        </h2>
        {loading ? (
          <div className="flex justify-center items-center mt-48">
            <Lottie
              animationData={heroAnimation}
              loop={true}
              className="w-44 h-auto"
            />
          </div>
        ) : resumeData ? (
          <div className="text-sm text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap h-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="my-2">
              <strong>Profession:</strong> {resumeData.profession}
            </p>
            <p className="my-2">
              <strong>Experience Years:</strong>{" "}
              {resumeData.totalExperienceYears} Year
            </p>
            <p className="my-2">
              <strong>Summary:</strong> {resumeData.summary} Year
            </p>

            <p className="my-2">
              <strong>Skills:</strong> {resumeData.skills.join(", ")}
            </p>
            <p className="mt-2">
              <strong>Experience:</strong>
            </p>
            <ul className="list-disc pl-4">
              {resumeData.professionalExperiences.map((exp, index) => {
                const details = [exp.title, exp.company, exp.description]
                  .filter((detail) => detail)
                  .join(" ");

                return <li key={index}>{details}</li>;
              })}
            </ul>
            <p className="mt-2">
              <strong>Educations:</strong>
            </p>
            <ul className="list-disc pl-4">
              {resumeData.educations.map((edu, index) => (
                <li key={index}>{edu.description}</li>
              ))}
            </ul>
            <p className="mt-2">
              <strong>Certifications:</strong>
            </p>
            <ul className="list-disc pl-4">
              {resumeData.trainingsAndCertifications.map((cet, index) => (
                <li key={index}>
                  {cet.description} - {cet.year}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center mt-32">
            <Lottie
              animationData={heroAnimation}
              loop={true}
              className="w-44 h-
              auto"
            />
            <p className="text-gray-600 dark:text-gray-300 text-center mt-20">
              No resume data available. Upload a resume to see extracted
              details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
