import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import assessmentService from "../../services/assessmentService";

const McqQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const { assessmentId, questionSetId } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Validate IDs
  useEffect(() => {
    if (!assessmentId || !questionSetId) {
      navigate("/dashboard");
    }
  }, [assessmentId, questionSetId, navigate]);

  // Load MCQ questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await assessmentService.getMCQQuestions(
          assessmentId,
          questionSetId,
          token
        );
        console.log("MCQ API response:", response.data);
        const fetchedQuestions = response.data?.questions || [];

        // if (!fetchedQuestions.length) {
        //   navigate(`/assessment/${assessmentId}/puzzle`);
        //   return;
        // }

        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId && questionSetId) loadQuestions();
  }, [assessmentId, questionSetId, token, navigate]);

  // Handle selecting an answer
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Handle Next / Submit button
  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit answers to backend (backend calculates correct answers)
      try {
        await assessmentService.submitMCQResult(
          assessmentId,
          answers,        // send user answers
          timeTaken,      // send time taken
          questionSetId,  // send question set ID
          token
        );
        navigate(`/assessment/${assessmentId}/puzzle`);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to submit MCQ results.");
      }
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!questions.length) return null;

  const currentQuestion = questions[currentIndex];

  return (
     <Card className="w-full max-w-3xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg my-10 mx-auto space-y-4">

    
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="mb-4">{currentQuestion.questionText}</p>
      <div className="space-y-2">
        {currentQuestion.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(currentQuestion._id, opt)}
            className={`w-full p-2 border rounded ${
              answers[currentQuestion._id] === opt
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Time elapsed: {Math.floor(timeTaken / 60)}:
        {(timeTaken % 60).toString().padStart(2, "0")}
      </p>
      <button
        onClick={handleNext}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {currentIndex + 1 < questions.length ? "Next" : "Submit"}
      </button>
    </div>
     </Card>
  );
};

export default McqQuiz;
