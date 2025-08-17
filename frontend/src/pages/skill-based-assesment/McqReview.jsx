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

   if (!reviewData) return <div>Loading review data...</div>;

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
    <Card className="max-w-4xl mx-auto my-10 p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Assessment Review</h2>

      <div className="space-y-4">
       {questions.map((q, idx) => {
          // Safely get all answer data
          const userAnswer = q.userAnswer;
          const correctAnswer = q.correctAnswer || q.options[q.correctAnswerIndex];
          const isCorrect = q.isCorrect !== undefined 
            ? q.isCorrect 
            : userAnswer === correctAnswer;

          return (
            <Card key={q._id} className={`p-4 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
              <h3 className="font-semibold">
                Q{idx + 1}. {q.questionText}
              </h3>
              <p>
                Your Answer: <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                  {userAnswer || "Not answered"}
                </span>
              </p>

              {!isCorrect && (
                <>
                  <p>
                    ✅ Correct Answer: <span className="font-semibold">{correctAnswer}</span>
                  </p>
                  {q.explanation && (
                    <p className="text-sm text-gray-600 mt-1">💡 {q.explanation}</p>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Summary</h3>
        <p>Total Questions: {total}</p>
        <p>✅ Correct: {correct}</p>
        <p>❌ Wrong: {wrong}</p>
        <p className="text-lg font-semibold mt-2">Overall Status: {status}</p>
      </div>

      <button
        onClick={handleContinue}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        Continue to Puzzle Game
      </button>
    </Card>
  );
};

export default McqReview;