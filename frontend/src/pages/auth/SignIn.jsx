/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { loginSuccess } from "../../redux/auth/authSlice";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import Swal from "sweetalert2";
import logo from "../../assets/public/logo.png";
import userService from "../../services/userService";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle Input Field Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.login(formData);

      if (response.success) {
        // Store in Redux
        dispatch(
          loginSuccess({
            token: response.data.token,
            user: response.data.user,
          })
        );
        navigate("/");
      } else {
        Swal.fire({
          title: "Login Failed",
          text: response.message || "Something Went Wrong.",
          confirmButtonText: "OK",
          confirmButtonColor: "red",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: error.message || "Something Went Wrong.",
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
        {/* Left Section */}
        <div className="flex flex-col md:w-1/2 items-center justify-center mx-8">
          <img src={logo} className="h-28 sm:h-48" alt="Company Logo" />
          <h1 className="text-3xl mt-5 text-center font-serif text-cyan-500">
            JOB HORIZEN
          </h1>
          <p className="text-lg mt-5 text-center font-serif">
            - Revolutionizing IT recruitment through AI-driven precision,
            connecting talent with opportunity like never before. -
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:w-1/2">
          <div className="text-3xl mb-3 text-center font-serif text-cyan-500">
            Login Your Account
          </div>
          <hr className="shadow-lg mb-4" />

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
            <div>
              <Label value="Password :" />
              <TextInput
                type="password"
                placeholder="Enter Password"
                id="password"
                className="mt-1"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <Button
              gradientMonochrome="info"
              type="submit"
              className="mt-4"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : null}
              <span className="pl-3">
                {loading ? "Logging in..." : "Login"}
              </span>
            </Button>
            <Button type="button" gradientMonochrome="info" outline>
              <FcGoogle className="w-6 h-6 mr-2" />
              Continue with Google
            </Button>
          </form>

          <div className="flex gap-2 text-sm mt-5 font-serif justify-center">
            <span>Don't have an account?</span>
            <Link to="/sign-up" className="text-cyan-500">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
