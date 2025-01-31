import { Button, Card } from "flowbite-react";
import { useSelector } from "react-redux";
import { Briefcase, UserCheck, Search, Users, Star } from "lucide-react";
import Lottie from "lottie-react";
import light from "../assets/background/light.png";
import dark from "../assets/background/dark.png";
import heroAnimation from "../assets/animations/heroAnimation.json";

export default function Home() {
  const { theme } = useSelector((state) => state.theme);
  const heroBg = theme === "dark" ? dark : light;

  return (
    <div className={theme}>
      <div className="bg-white text-gray-700 dark:text-gray-100 dark:bg-gray-900 min-h-screen">
        {/* Hero Section */}
        <section
          className="relative w-full h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-black dark:text-white px-4 mb-24">
            <div className="flex mb-10">
              <Lottie
                animationData={heroAnimation}
                loop={true}
                className="w-44 h-auto max-w-lg mx-auto"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              AI-Powered Hiring Made Simple
            </h1>
            <p className="text-lg max-w-2xl mb-6">
              Revolutionizing recruitment with AI-driven skill profiling,
              automated assessments, and smart job matching.
            </p>
            <Button gradientMonochrome="info" size="lg">
              Get Started
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-8 bg-white text-center dark:bg-gray-800">
          <h2 className="text-3xl font-bold mb-8">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <Search className="h-10 w-10 text-cyan-500 mx-auto" />
              <h3 className="text-xl font-semibold">AI-Driven Job Matching</h3>
              <p>
                Connects job seekers with the best roles using advanced AI
                algorithms.
              </p>
            </Card>
            <Card>
              <UserCheck className="h-10 w-10 text-cyan-500  mx-auto" />
              <h3 className="text-xl font-semibold">
                Automated Resume Screening
              </h3>
              <p>Analyzes and scores resumes for precise job fit.</p>
            </Card>
            <Card>
              <Users className="h-10 w-10 text-cyan-500  mx-auto" />
              <h3 className="text-xl font-semibold">
                Gamified Skill Assessments
              </h3>
              <p>
                Interactive quizzes and leaderboards to evaluate technical
                skills.
              </p>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-8 bg-gray-100 text-center dark:bg-gray-700">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <Briefcase className="h-10 w-10 text-cyan-500 mx-auto" />
              <h3 className="text-lg font-semibold">Step 1</h3>
              <p>Create a profile and upload your resume.</p>
            </Card>
            <Card>
              <Search className="h-10 w-10 text-cyan-500 mx-auto" />
              <h3 className="text-lg font-semibold">Step 2</h3>
              <p>Our AI scans and analyzes your skills.</p>
            </Card>
            <Card>
              <UserCheck className="h-10 w-10 text-cyan-500 mx-auto" />
              <h3 className="text-lg font-semibold">Step 3</h3>
              <p>Complete assessments & interviews.</p>
            </Card>
            <Card>
              <Users className="h-10 w-10 text-cyan-500 mx-auto" />
              <h3 className="text-lg font-semibold">Step 4</h3>
              <p>Get matched with the perfect job!</p>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-8 bg-white text-center dark:bg-gray-800">
          <h2 className="text-3xl font-bold mb-8">What People Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <p>
                “This platform completely changed how we hire. AI-powered resume
                analysis is a game-changer!”
              </p>
              <div className="flex gap-1 justify-center">
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
              </div>
              <p className="font-semibold">John Doe - HR Manager</p>
            </Card>
            <Card>
              <p>
                “The skill-based assessments helped me land my dream job. Highly
                recommended!”
              </p>
              <div className="flex gap-1 justify-center">
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
              </div>
              <p className="font-semibold">Jane Smith - Software Developer</p>
            </Card>
            <Card>
              <p>
                “The skill-based assessments helped me land my dream job. Highly
                recommended!”
              </p>
              <div className="flex gap-1 justify-center">
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
                <Star className="h-6 w-6 text-yellow-500 mt-4" />
              </div>
              <p className="font-semibold">Jane Smith - Software Developer</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
