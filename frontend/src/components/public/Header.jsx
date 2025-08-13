import { FaSun, FaMoon } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../redux/theme/themeSlice";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import logo from "../../assets/public/logo.png";

export default function HeaderComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user from Redux store
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  // Change theme from Redux store
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Handle Sign Out
  const handleSignOut = () => {
    dispatch(logout());
    navigate("/sign-in");
  };

  return (
    <Navbar fluid rounded>
      <Navbar.Brand href="#">
        <img src={logo} className="mr-3 h-6 sm:h-9" alt="TALENT TREK LOGO" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          TALENT TREK
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2 items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          {theme === "light" ? (
            <FaMoon className="w-6 h-6 text-gray-700 dark:text-white" />
          ) : (
            <FaSun className="w-6 h-6 text-gray-700 dark:text-white" />
          )}
        </button>

        {/* Profile Dropdown (Only if Logged In) */}
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="User settings" img={user.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-xs font-medium">
                Welcome {user.profileType}
              </span>
              <hr className="my-1" />
              <span className="block text-sm ">{user.fullName}</span>
              <span className="block text-sm">{user.email}</span>
            </Dropdown.Header>
            <Dropdown.Item onClick={() => navigate(`/my-profile`)}>
              My Profile
            </Dropdown.Item>
            {user && (
              <Dropdown.Item
                onClick={() => navigate(`/dashboard/resume/analyse`)}
              >
                Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
          </Dropdown>
        ) : (
          // Show "Sign In" if User is NOT Logged In
          <Button
            type="button"
            gradientMonochrome="info"
            outline
            onClick={() => navigate("/sign-in")}
          >
            Sign In
          </Button>
        )}

        <Navbar.Toggle />
      </div>

      {/* Navbar Links */}
      <Navbar.Collapse>
        <Navbar.Link className="cursor-pointer" onClick={() => navigate(`/`)}>Home</Navbar.Link>

        {user?.profileType === "Job Seeker" && (
          <Navbar.Link className="cursor-pointer" onClick={() => navigate(`/seeker/jobs`)}>
            Jobs
          </Navbar.Link>
        )}
        {/* {user?.profileType === "Job Seeker" && (
          <Navbar.Link onClick={() => navigate(`/agent/joblist`)}>
            Agent Listing
          </Navbar.Link>
        )} */}

        {user?.profileType === "Recruiter" && (
          <Navbar.Link className="cursor-pointer" onClick={() => navigate(`/dashboard/jobs`)}>
            Dashboard
          </Navbar.Link>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
