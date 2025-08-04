import {} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, Button } from "flowbite-react";

const AssessmentIntro = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/skill-bases-assessment/puzzle-game");
  };

  return (
    <Card className="w-full max-w-3xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg my-10 mx-auto space-y-4">
      <div className="text-2xl font-bold">
        Hi {user.fullName}, welcome to your assessment!
      </div>

      <p className="text-gray-700 dark:text-gray-300">
        This application process involves two main stages:
      </p>

      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-4">
        <li><strong>Technical Skill-Based Assessment</strong></li>
        <li><strong>Video-Based HR Interview</strong></li>
      </ul>

      <p className="text-gray-700 dark:text-gray-300">
        You&apos;ll begin with the skill assessment, which has two parts:
      </p>

      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 ml-4">
        <li><strong>Cognitive Ability Assessment</strong></li>
        <li><strong>Technical Knowledge Quiz</strong></li>
      </ul>

      <p className="text-red-600 dark:text-red-400 font-medium">
        Once started, the assessment must be completed without stopping or closing the browser.
      </p>

      <p className="text-gray-700 dark:text-gray-300 font-medium">
        When you&apos;re ready, click the button below to begin.
      </p>

      <div className="flex justify-center pt-2">
        <Button gradientMonochrome="info" size="lg" onClick={handleStartClick}>
          Start Now
        </Button>
      </div>
    </Card>
  );
};

export default AssessmentIntro;
