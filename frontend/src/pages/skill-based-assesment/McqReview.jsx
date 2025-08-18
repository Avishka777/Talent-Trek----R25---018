import { Card } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import assessmentService from "../../services/assessmentService";

const McqReview = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await assessmentService.getMCQReview(assessmentId, token);
        console.log("API Response Data:", response.data); // Debug
        setReviewData(response.data); // Store the data directly
      } catch (error) {
        console.error("Fetch error:", error);
        Swal.fire("Error", error.message || "Failed to load review", "error");
      }
    };
    fetchReview();
  }, [assessmentId, token]);

  if (!reviewData) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Loading review data...</p>
      </div>
    </div>
  );

  const { questions = [], total = 0, correct = 0, wrong = 0 } = reviewData;
  console.log("Processed questions:", questions); // Debug log

  const percentage = total > 0 ? (correct / total) * 100 : 0;
  let status = "Needs Improvement 😕";
  if (percentage >= 80) status = "Excellent 🎉";
  else if (percentage >= 50) status = "Good 👍";

  const handleContinue = () => {
    Swal.fire({
      title: "Ready for Puzzle Game?",
      text: "Click OK to continue!",
      icon: "info",
      confirmButtonColor: "#3085d6",
    }).then(() => {
      navigate(`/skill-bases-assessment/${assessmentId}/puzzle-game`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r rounded-xl from-blue-600 to-blue-800 p-6 text-white">
            <h2 className="text-3xl font-bold">Assessment Review</h2>
            <p className="mt-2 opacity-90">Detailed breakdown of your performance</p>
          </div>

          {/* Summary Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mx-6 mt-4 z-10 relative">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600 font-medium">Total Questions</p>
                <p className="text-2xl font-bold text-blue-800">{total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600 font-medium">Correct</p>
                <p className="text-2xl font-bold text-green-800">{correct}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-red-600 font-medium">Wrong</p>
                <p className="text-2xl font-bold text-red-800">{wrong}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Overall Status:</span>
                <span className={`px-4 py-2 rounded-full text-white font-medium ${
                  percentage >= 80 ? "bg-green-500" : 
                  percentage >= 50 ? "bg-blue-500" : "bg-orange-500"
                }`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Question Breakdown</h3>
            
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAnswer = q.userAnswer;
                const correctAnswer = q.correctAnswer || q.options[q.correctAnswerIndex];
                const isCorrect = q.isCorrect !== undefined 
                  ? q.isCorrect 
                  : userAnswer === correctAnswer;

                return (
                  <Card 
                    key={q._id} 
                    className={`p-6 rounded-lg transition-all duration-200 hover:shadow-md ${
                      isCorrect ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">
                          {q.questionText}
                        </h3>
                        
                        <div className="mt-3 space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Your answer: </span>
                            <span className={`px-2 py-1 rounded ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {userAnswer || "Not answered"}
                            </span>
                          </p>

                          {!isCorrect && (
                            <div className="space-y-2">
                              <p className="text-gray-700">
                                <span className="font-medium">Correct answer: </span>
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  {correctAnswer}
                                </span>
                              </p>
                              {q.explanation && (
                                <div className="bg-gray-50 p-3 rounded-lg mt-2">
                                  <p className="text-sm text-gray-700 flex items-start">
                                    <span className="mr-2">💡</span>
                                    <span>{q.explanation}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleContinue}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center"
              >
                Continue to Puzzle Game
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default McqReview;