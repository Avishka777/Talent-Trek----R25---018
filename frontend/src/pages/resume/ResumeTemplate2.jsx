import axios from "axios";
import html2pdf from "html2pdf.js";
import { useState, useEffect } from "react";

const ResumeTemplate2 = () => {
  const [formData, setFormData] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      const data = JSON.parse(localStorage.getItem("ResumeData"));
      if (data) {
        setFormData(data);
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}learn/get-quiz-results/${
            user._id
          }`
        );

        if (response.data && response.data.results) {
          const results = response.data.results;
          setQuizResults(results);
          localStorage.setItem("QuizResults", JSON.stringify(results));
        }
      } catch (err) {
        console.error("Error fetching quiz results:", err);
      }
    };

    fetchData();
  }, [user._id]);

  const handleDownloadPDF = () => {
    const resumeElement = document.getElementById("resume-preview");
    html2pdf()
      .set({
        margin: 0.5,
        filename: `${formData.firstName}_${formData.lastName}_Resume.pdf`,
        html2canvas: { scale: 4, letterRendering: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(resumeElement)
      .save();
  };

  const prettifyFilename = (filename) => {
    if (!filename) return "";
    const nameWithoutExt = filename.replace(".pdf", "");
    const nameWithoutTutorial = nameWithoutExt.replace("_tutorial", "");
    const nameWithSpaces = nameWithoutTutorial.replace(/_/g, " ");
    return nameWithSpaces;
  };

  // Format skills into bullet points
  const formatSkills = (skills) => {
    if (!skills) return [];
    return skills.split(",").map((skill) => skill.trim());
  };

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Resume Builder</h1>
        <button
          onClick={handleDownloadPDF}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-700 transition-colors w-full md:w-auto text-center"
        >
          Download as PDF
        </button>
      </div>

      {/* Resume Preview */}
      <div
        id="resume-preview"
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6 md:p-8"
        style={{
          fontFamily: "'Calibri', 'Arial', sans-serif",
          fontSize: "11pt",
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-6 border-b border-gray-200 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
            {formData.firstName} {formData.lastName}
          </h1>
          {formData.jobTitle && (
            <p className="text-lg text-gray-600 font-medium mb-4">
              {formData.jobTitle}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700">
            {formData.email && (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {formData.email}
              </span>
            )}
            {formData.contactNumber && (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {formData.contactNumber}
              </span>
            )}
            {formData.linkedin && (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                {formData.linkedin}
              </span>
            )}
            {formData.github && (
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {formData.github}
              </span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Summary */}
          {formData.summary && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700">{formData.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {formData.workExperience?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                Work Experience
              </h2>
              {formData.workExperience.map((work, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{work.position}</h3>
                    <p className="text-sm text-gray-500">{work.timeRange}</p>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    {work.company}
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {work.responsibilities?.map((resp, i) => (
                      <li key={i} className="text-gray-700">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {formData.education?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                Education
              </h2>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                    <p className="text-sm text-gray-500">{edu.timeRange}</p>
                  </div>
                  <p className="text-gray-600 font-medium">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-gray-700 mt-1">
                      <span className="font-semibold">GPA:</span> {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.technicalSkills && (
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                  Technical Skills
                </h2>
                <ul className="list-disc pl-5">
                  {formatSkills(formData.technicalSkills).map(
                    (skill, index) => (
                      <li key={index} className="text-gray-700">
                        {skill}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              {formData.softSkills && (
                <div>
                  <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                    Soft Skills
                  </h2>
                  <ul className="list-disc pl-5">
                    {formatSkills(formData.softSkills).map((skill, index) => (
                      <li key={index} className="text-gray-700">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.languages && (
                <div>
                  <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                    Languages
                  </h2>
                  <ul className="list-disc pl-5">
                    {formatSkills(formData.languages).map((language, index) => (
                      <li key={index} className="text-gray-700">
                        {language}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Results */}
          {quizResults && quizResults.quizAttempts?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
                Skills Assessment
              </h2>
              <div className="mb-4">
                <p className="font-semibold text-gray-800">
                  Learning Style:{" "}
                  <span className="font-normal">
                    {quizResults.learningType}
                  </span>
                </p>
                <p className="font-semibold text-gray-800">
                  Learning Score:{" "}
                  <span className="font-normal">
                    {quizResults.learningTypePoints}
                  </span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                        Topic
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                        Score
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                        Correct Answers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.quizAttempts.map((quiz, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {prettifyFilename(quiz.filename) || "N/A"}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {quiz.score}%
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplate2;
