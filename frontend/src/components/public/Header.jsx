import { FaSun, FaMoon, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/auth/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../redux/theme/themeSlice";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import logo from "../../assets/public/logo.png";
import { useEffect, useState } from "react";
import {
  setupNotificationListeners,
  fetchNotifications,
  markAllAsRead,
  markAsRead,
} from "../../services/notificationService";
import { initSocket, disconnectSocket } from "../../services/socketService";

export default function HeaderComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get user from Redux store
  const { theme } = useSelector((state) => state.theme);
  const { user, token } = useSelector((state) => state.auth);

  // Initialize socket and notifications
  useEffect(() => {
    if (token) {
      initSocket(token);
      loadNotifications();

      // Setup notification listeners
      const cleanup = setupNotificationListeners((newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        cleanup();
        disconnectSocket();
      };
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      const response = await fetchNotifications(token);
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // Change theme from Redux store
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Handle Sign Out
  const handleSignOut = () => {
    dispatch(logout());
    disconnectSocket();
    navigate("/sign-in");
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(token, notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
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

        {/* Notification Bell */}
        {user && (
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <FaBell className="text-gray-600 dark:text-gray-300 h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium dark:text-white">Notifications</h3>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-600"
                  >
                    Mark all as read
                  </button>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !notification.is_read
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : ""
                      }`}
                      onClick={() => {
                        handleMarkAsRead(notification._id);
                        if (notification.ref_id) {
                          navigate(notification.link || "#");
                        }
                        setIsNotificationOpen(false);
                      }}
                    >
                      <div className="font-medium dark:text-white">
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown (Only if Logged In) */}
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img={user.profilePicture}
                rounded
                className="border-2 border-gray-300 dark:border-gray-600"
              />
            }
          >
            <Dropdown.Header className="dark:bg-gray-800">
              <span className="block text-xs font-medium dark:text-gray-300">
                Welcome {user.profileType}
              </span>
              <hr className="my-1 dark:border-gray-700" />
              <span className="block text-sm dark:text-white">
                {user.fullName}
              </span>
              <span className="block text-sm dark:text-gray-300">
                {user.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Item
              onClick={() => navigate(`/my-profile`)}
              className="dark:hover:bg-gray-700"
            >
              My Profile
            </Dropdown.Item>
            {user?.profileType === "Recruiter" && (
              <Dropdown.Item
                onClick={() => navigate(`/dashboard/resume/analyse`)}
                className="dark:hover:bg-gray-700"
              >
                Dashboard
              </Dropdown.Item>
            )}
            {user?.profileType === "Job Seeker" && (
              <Dropdown.Item
                onClick={() => navigate(`/resume-create`)}
                className="dark:hover:bg-gray-700"
              >
                Design Resume
              </Dropdown.Item>
            )}
            {user?.profileType === "Job Seeker" && (
              <Dropdown.Item
                onClick={() => navigate(`/jobs/applied`)}
                className="dark:hover:bg-gray-700"
              >
                Applied Jobs
              </Dropdown.Item>
            )}
            <Dropdown.Divider className="dark:border-gray-700" />
            <Dropdown.Item
              onClick={handleSignOut}
              className="dark:hover:bg-gray-700"
            >
              Sign Out
            </Dropdown.Item>
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
        <Navbar.Link
          onClick={() => navigate(`/`)}
          className="dark:text-white dark:hover:text-blue-300"
        >
          Home
        </Navbar.Link>

        {user?.profileType === "Job Seeker" && (
          <Navbar.Link
            onClick={() => navigate(`/seeker/jobs`)}
            className="dark:text-white dark:hover:text-blue-300"
          >
            Jobs
          </Navbar.Link>
        )}
        {user?.profileType === "Job Seeker" && (
          <Navbar.Link
            onClick={() => navigate(`/agent/joblist`)}
            className="dark:text-white dark:hover:text-blue-300"
          >
            Agent Listing
          </Navbar.Link>
        )}

        {user?.profileType === "Recruiter" && (
          <Navbar.Link
            onClick={() => navigate(`/dashboard/jobs`)}
            className="dark:text-white dark:hover:text-blue-300"
          >
            Dashboard
          </Navbar.Link>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
