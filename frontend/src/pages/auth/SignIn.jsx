import logo from "../../assets/public/logo.png";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { Button, Label, Spinner, TextInput } from "flowbite-react";

export default function Signin() {
  return (
    <div className="flex min-h-screen m-5">
      <div className="flex flex-col md:flex-row m-auto border-2 p-10 mx-auto gap-5 max-w-6xl rounded-xl border-cyan-500">
        {/* Left */}
        <div className="flex flex-col md:w-1/2 items-center justify-center mx-8">
          <img src={logo} className="h-28 sm:h-48" alt="Company Logo" />
          <h1 className="text-3xl mt-5 text-center font-serif text-cyan-500">
            JOB HORIZEN
          </h1>
          <p className="text-lg mt-5 text-center font-serif">
            - Revolutionizing IT recruitment through AI - driven precision
            connecting talent with opportunity like never before. -
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col md:w-1/2 ">
          <div className="text-3xl mb-3 text-center font-serif text-cyan-500">
            Login Your Account
          </div>
          <hr className="shadow-lg mb-4 " />
          <form className="flex flex-col gap-4">
            <div>
              <Label value="Email :" />
              <TextInput
                type="email"
                placeholder="Enter Email Address"
                id="email"
                className="mt-1"
                required
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
              />
            </div>
            <Button gradientMonochrome="info" type="submit" className="mt-4">
              <Spinner size="sm" />
              <span className="pl-3">Login</span>
            </Button>
            <Button type="button" gradientMonochrome="info" outline>
              <FcGoogle className="w-6 h-6 mr-2" />
              Continue with Google
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5 font-serif justify-center">
            <span>Don not Have An Account?</span>
            <Link to="/sign-up" className="text-cyan-500">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
