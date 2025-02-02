import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useSelector, useDispatch } from "react-redux";
import { FaSun, FaMoon } from "react-icons/fa";
import { toggleTheme } from "../redux/theme/themeSlice";
import logo from "../assets/public/logo.png";
import { useNavigate } from "react-router-dom";

export default function HeaderComponent() {
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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

        {/* Profile Dropdown */}
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar
              alt="User settings"
              img="https://avatars.githubusercontent.com/u/47731849?v=4"
              rounded
            />
          }
        >
          <Dropdown.Header>
            <span className="block text-sm">Bonnie Green</span>
            <span className="block truncate text-sm font-medium">
              dimesha@walaha.com
            </span>
          </Dropdown.Header>
          <Dropdown.Item onClick={() => navigate(`/profile/:userId`)}>
            My Profile
          </Dropdown.Item>
          <Dropdown.Item onClick={() => navigate(`/dashboard/resume/analyse`)}>
            Dashboard
          </Dropdown.Item>
          <Dropdown.Item onClick={() => navigate(`/sign-in`)}>
            Sign In
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item>
        </Dropdown>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link onClick={() => navigate(`/`)}>Home</Navbar.Link>
        <Navbar.Link onClick={() => navigate(`/seeker/jobs`)}>Jobs</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
