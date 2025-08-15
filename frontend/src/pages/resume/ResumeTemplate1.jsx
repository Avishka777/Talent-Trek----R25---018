import axios from "axios";
import html2pdf from "html2pdf.js";
import { useState, useEffect } from "react";

const ResumeTemplate1 = () => {
  const [formData, setFormData] = useState({});
  const [profilePhotoBase64, setProfilePhotoBase64] = useState("");
  const [quizResults, setQuizResults] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      const data = JSON.parse(localStorage.getItem("ResumeData"));
      if (data) {
        setFormData(data);
        if (data.profilePhoto) {
          setProfilePhotoBase64(data.profilePhoto);
        }
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}learn/get-quiz-results/${
            user._id
          }`
        );

        if (response.data?.results) {
          setQuizResults(response.data.results);
          localStorage.setItem("QuizResults", JSON.stringify(response.data.results));
        }
      } catch (err) {
        console.error("Error fetching quiz results:", err);
      }
    };

    fetchData();
  }, [user._id]);

  const handleDownloadPDF = () => {
    const resumeElement = document.getElementById("resume-preview");
    const opt = {
      margin: 0.5,
      filename: `${formData.firstName}_${formData.lastName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, letterRendering: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(resumeElement).save();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      setProfilePhotoBase64(base64String);
      setFormData(prev => ({
        ...prev,
        profilePhoto: base64String
      }));
      localStorage.setItem("ResumeData", JSON.stringify({
        ...formData,
        profilePhoto: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const prettifyFilename = (filename) => {
    if (!filename) return "";
    return filename
      .replace(".pdf", "")
      .replace("_tutorial", "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSkills = (skills) => {
    if (!skills) return [];
    return skills.split(",").map(skill => skill.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-6">
          <label className="flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg shadow-md cursor-pointer transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Photo
            <input
              type="file"
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Resume Preview */}
        <div
          id="resume-preview"
          className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200"
          style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white p-8">
            <div className="flex items-center">
              {profilePhotoBase64 && (
                <div className="mr-6">
                  <img
                    src={profilePhotoBase64}
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {formData.firstName} {formData.lastName}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2">
                  {formData.email && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {formData.email}
                    </div>
                  )}
                  {formData.contactNumber && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {formData.contactNumber}
                    </div>
                  )}
                  {formData.github && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <a href={formData.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        GitHub
                      </a>
                    </div>
                  )}
                  {formData.linkedin && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Summary Section */}
            {formData.summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-sky-700 border-b-2 border-sky-200 pb-1 mb-3">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed">{formData.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                {/* Education Section */}
                {formData.education?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-sky-700 border-b-2 border-sky-200 pb-1 mb-3">Education</h2>
                    {formData.education.map((edu, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                          <span className="text-sm text-gray-600">{edu.timeRange}</span>
                        </div>
                        <p className="text-gray-600">{edu.institution}</p>
                        {edu.description && (
                          <p className="text-gray-700 mt-1 text-sm">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Section */}
                {(formData.technicalSkills || formData.softSkills) && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-sky-700 border-b-2 border-sky-200 pb-1 mb-3">Skills</h2>
                    {formData.technicalSkills && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Technical Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {formatSkills(formData.technicalSkills).map((skill, index) => (
                            <span key={index} className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.softSkills && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Soft Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {formatSkills(formData.softSkills).map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div>
                {/* Work Experience Section */}
                {formData.workExperience?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-sky-700 border-b-2 border-sky-200 pb-1 mb-3">Work Experience</h2>
                    {formData.workExperience.map((work, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{work.position}</h3>
                          <span className="text-sm text-gray-600">{work.timeRange}</span>
                        </div>
                        <p className="text-gray-600">{work.company}</p>
                        {work.responsibilities?.length > 0 && (
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {work.responsibilities.map((resp, i) => (
                              <li key={i} className="text-gray-700 text-sm">{resp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Interests & Languages */}
                {(formData.interests || formData.languages) && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-sky-700 border-b-2 border-sky-200 pb-1 mb-3">Additional Information</h2>
                    {formData.interests && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {formatSkills(formData.interests).map((interest, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.languages && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {formatSkills(formData.languages).map((language, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Results Section */}
            {quizResults && quizResults.quizAttempts?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-sky-700 border-b-2 border-sky-200 pb-1 mb-3">Learning Profile</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800">Learning Style</h3>
                    <p className="text-gray-700">{quizResults.learningType} (Score: {quizResults.learningTypePoints})</p>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Quiz Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quizResults.quizAttempts.map((quiz, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{prettifyFilename(quiz.filename)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{quiz.score}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{quiz.timeTaken}s</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{quiz.correctAnswers}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{quiz.totalQuestions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplate1;