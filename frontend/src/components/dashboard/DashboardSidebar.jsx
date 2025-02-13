import { Badge, Sidebar } from "flowbite-react";
import { HiArrowSmRight } from "react-icons/hi";
import { MdAnalytics,MdLibraryAdd } from "react-icons/md";
import { IoFileTrayFull } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Add Job", path: "/dashboard/job/create", icon: MdLibraryAdd },
    { name: "My Jobs", path: `/dashboard/jobs`, icon: IoFileTrayFull },
    { name: "Resume Analyse", path: "/dashboard/resume/analyse", icon: MdAnalytics },
    { name: "Sign In", path: "/sign-in", icon: HiArrowSmRight },
  ];

  return (
    <Sidebar
      aria-label="Sidebar with call to action button example"
      className="flex h-screen"
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {menuItems.map((item) => (
            <Sidebar.Item
              key={item.name}
              onClick={() => navigate(item.path)}
              icon={item.icon}
              className={
                location.pathname === item.path
                  ? "bg-cyan-200 dark:bg-cyan-600 text-black dark:text-white font-semibold"
                  : ""
              }
            >
              {item.name}
            </Sidebar.Item>
          ))}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
      <Sidebar.CTA>
        <div className="mb-3 flex items-center">
          <Badge color="warning">Beta</Badge>
          <button
            aria-label="Close"
            className="-m-1.5 ml-auto inline-flex h-6 w-6 rounded-lg bg-gray-100 p-1 text-cyan-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            type="button"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="mb-3 text-sm text-cyan-900 dark:text-gray-400">
          Preview the new Flowbite dashboard navigation! You can turn the new
          navigation off for a limited time in your profile.
        </div>
        <a
          className="text-sm text-cyan-900 underline hover:text-cyan-800 dark:text-gray-400 dark:hover:text-gray-300"
          href="#"
        >
          Turn new navigation off
        </a>
      </Sidebar.CTA>
    </Sidebar>
  );
}
