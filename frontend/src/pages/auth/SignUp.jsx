import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label } from "flowbite-react";
import { TextInput, Select, Spinner } from "flowbite-react";
import Swal from "sweetalert2";
import logo from "../../assets/public/logo.png";
import userService from "../../services/userService";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileType: "Job Seeker",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input field changes and update state
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    // Validate password match in real time
    if (formSubmitted && (id === "confirmPassword" || id === "password")) {
      setPasswordMatchError(
        value !== formData.password ? "Passwords do not match!" : ""
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await userService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        profileType: formData.profileType,
      });
      if (!response.success) {
        return Swal.fire({
          title: "Registration Failed",
          text: response.message || "Something went wrong. Please try again.",
          confirmButtonText: "OK",
          confirmButtonColor: "red",
        });
      }
      setLoading(false);
      Swal.fire({
        title: "Account Created!",
        text: "Your account has been successfully created.",
        confirmButtonText: "OK",
        confirmButtonColor: "green",
      }).then(() => {
        navigate("/sign-in");
      });
    } catch (error) {
      Swal.fire({
        title: "Registration Failed",
        text: error.message || "Something went wrong. Please try again.",
        confirmButtonText: "OK",
        confirmButtonColor: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col md:flex-row m-auto border-2 p-10 mx-auto gap-5 max-w-6xl rounded-xl border-cyan-500">
        {/* Left */}
        <div className="flex flex-col md:w-1/2 items-center justify-center mx-8">
          <img src={logo} className="h-28 sm:h-48" alt="Company Logo" />
          <h1 className="text-3xl mt-5 text-center font-serif text-cyan-500">
            TALENT TREK
          </h1>
          <p className="text-lg mt-5 text-center font-serif">
            - Revolutionizing IT recruitment through AI-driven precision,
            connecting talent with opportunity like never before. -
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col md:w-1/2">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <Label value="Full Name :" />
              <TextInput
                type="text"
                placeholder="Enter Full Name"
                id="fullName"
                className="mt-1"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <Label value="Email :" />
              <TextInput
                type="email"
                placeholder="Enter Email Address"
                id="email"
                className="mt-1"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Profile Type Selection */}
            <div>
              <Label value="Profile Type :" />
              <Select
                id="profileType"
                className="mt-1"
                value={formData.profileType}
                onChange={handleChange}
                required
              >
                <option value="Job Seeker">Job Seeker</option>
                <option value="Recruiter">Recruiter</option>
              </Select>
            </div>

            {/* Password Field */}
            <div>
              <Label value="Password :" />
              <div className="relative">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  id="password"
                  className="mt-1"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="relative bottom-11">
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <HiEyeOff size={20} />
                    ) : (
                      <HiEye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <Label value="Confirm Password :" />
              <div className="relative">
                <TextInput
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  id="confirmPassword"
                  className="mt-1"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="relative bottom-11">
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <HiEyeOff size={20} />
                    ) : (
                      <HiEye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Match Error (only shown after clicking Sign Up) */}
            {formSubmitted && passwordMatchError && (
              <Alert color="failure" className="mt-4 py-2">
                <p className="text-red-700 font-semibold text-sm">
                  {passwordMatchError}
                </p>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              gradientMonochrome="info"
              type="submit"
              className="mt-2"
              disabled={loading || !!passwordMatchError}
            >
              {loading ? <Spinner size="sm" /> : "Sign Up"}
            </Button>
          </form>

          {/* Redirect to Sign In */}
          <div className="flex gap-2 text-sm mt-5 font-serif justify-center">
            <span>Already have an account?</span>
            <Link to="/sign-in" className="text-cyan-500">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
