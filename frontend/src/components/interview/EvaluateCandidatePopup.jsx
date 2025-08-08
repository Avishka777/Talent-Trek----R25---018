import { Modal } from "flowbite-react";
import { FaUser, FaEnvelope, FaCode, FaVideo, FaChartBar } from "react-icons/fa";
import { MdSchool } from "react-icons/md";

const EvaluateCandidatePopup = ({ data, quactionList, showModal, onClose }) => {
  if (!data) return null;

  const getBadgeColor = (score) => {
    if (score >= 90) return "green";
    if (score >= 70) return "yellow";
    if (score >= 50) return "purple";
    return "red";
  };

  return (
    <Modal show={showModal} onClose={onClose} size="4xl">
      <Modal.Header>
        Interview Evaluation for {data.userId.fullName}
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-6">
          {/* Candidate Information with Profile Picture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-blue-100">
                <img 
                  src={data.userId.profilePicture} 
                  alt={data.userId.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg">{data.userId.fullName}</h3>
                <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                  <FaEnvelope className="text-gray-500" />
                  <a href={`mailto:${data.userId.email}`} className="text-blue-600 hover:underline">
                    {data.userId.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg col-span-2">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <FaChartBar className="text-purple-500" />
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-gray-500">Average Confidence</p>
                  <p className={`text-2xl font-bold text-${getBadgeColor(data.avgConfidence)}-500`}>
                    {data.avgConfidence.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-gray-500">Average Answer Match</p>
                  <p className={`text-2xl font-bold text-${getBadgeColor(data.avgAnswerMatch)}-500`}>
                    {data.avgAnswerMatch.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="text-2xl font-bold">{data.answerList.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Question-wise Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
              <FaVideo className="text-red-500" />
              Question-wise Performance
            </h3>
            <div className="space-y-4">
              {data.answerList.map((answer, index) => (
                <div key={answer._id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{answer.quactionNo < 10 ? '0' + answer.quactionNo : answer.quactionNo} : {quactionList[index].quaction}</p>
                      <a 
                        href={answer.video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <FaVideo className="text-xs" /> Watch response
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Confidence</p>
                        <p className={`font-bold text-${getBadgeColor(answer.confidene)}-500`}>
                          {answer.confidene.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Answer Match</p>
                        <p className={`font-bold text-${getBadgeColor(answer.answerMatch)}-500`}>
                          {answer.answerMatch.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <FaCode className="text-orange-500" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.jobId.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                <MdSchool className="text-indigo-500" />
                Qualifications
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {data.jobId.qualifications.map((qual, index) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Modal.Body>
      {/* <Modal.Footer>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default EvaluateCandidatePopup;