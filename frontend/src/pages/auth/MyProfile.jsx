import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logout } from "../../redux/auth/authSlice";
import { Button, FileInput, Label, Spinner, TextInput } from "flowbite-react";
import Swal from "sweetalert2";
import userService from "../../services/userService";

const MyProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profileType: "",
  });

  // Fetch User Profile
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const fetchProfile = async () => {
      try {
        const response = await userService.getProfile(token);
        setFormData({
          fullName: response.data.fullName,
          email: response.data.email,
          profileType: response.data.profileType,
        });
        dispatch(loginSuccess({ token, user: response.data }));
      } catch (error) {
        console.error("Error Fetching Profile.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, dispatch]);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await userService.updateProfile(
        formData,
        file,
        token
      );
      dispatch(loginSuccess({ token, user: updatedUser.data }));
      if (updatedUser.success) {
        return Swal.fire({
          title: "Profile Updated",
          text:
            updatedUser.message ||
            "Your Profile Has Been Successfully Updated.",
          confirmButtonText: "OK",
          confirmButtonColor: "#28a0b5",
        });
      } else {
        Swal.fire({
          title: "Login Failed",
          text: updatedUser.message || "Something Went Wrong",
          confirmButtonText: "OK",
          confirmButtonColor: "red",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: "Something Went Wrong While Updating Your Profile.",
        confirmButtonColor: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Profile Deletion
  const handleDeleteProfile = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete your account.",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "#28a0b5",
      confirmButtonText: "Yes Delete It",
      cancelButtonText: "No Keep It",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteUser = await userService.deleteProfile(token);
          dispatch(logout());
          navigate("/");
          Swal.fire({
            title: "Deleted",
            text: deleteUser.message || "Your Profile Has Been Deleted.",
            confirmButtonColor: "#28a0b5",
          });
        } catch (error) {
          Swal.fire({
            title: "Deletion Failed",
            text:
              error.message ||
              "Something Went Wrong While Deleting Your Profile.",
            confirmButtonColor: "red",
          });
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col md:flex-row m-auto border-2 p-10 mx-auto gap-5 min-w-6xl rounded-xl border-cyan-500">
        {/* Left Section */}
        <div className="flex flex-col md:w-1/2 items-center justify-center mx-8">
          <img
            src={user?.profilePicture}
            className="h-auto sm:h-auto w-96 rounded-full"
            alt="Company Logo"
          />
        </div>

        {/* Right Section */}
        <div className="flex flex-col md:w-1/2">
          <div className="text-3xl mb-3 text-center font-serif text-cyan-500">
            Update Profile Details
          </div>
          <hr className="shadow-lg mb-4" />

          <form className="flex flex-col gap-4" onSubmit={handleUpdateProfile}>
            <div>
              <Label value="Email :" />
              <TextInput
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1"
                placeholder="Full Name"
              />
            </div>
            <div>
              <Label value="Email :" />
              <TextInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                placeholder="Email"
              />
            </div>
            <div>
              <Label value="Change Profile Picture :" />
              <FileInput
                type="file"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                gradientMonochrome="info"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : null}
                <span className="pl-3">
                  {loading ? "Updating..." : "Update Profile"}
                </span>
              </Button>
              <Button
                onClick={handleDeleteProfile}
                gradientMonochrome="failure"
                className="w-full"
              >
                Delete Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
