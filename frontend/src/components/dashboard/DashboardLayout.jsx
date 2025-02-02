/* eslint-disable react/prop-types */
import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

const DashboardLayout = ({ children }) => {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="flex-grow p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg m-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 capitalize">{activeSection}</h2>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;