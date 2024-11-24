import React from 'react';
import { BiHome, BiBookAlt, BiMessage, BiSolidReport, BiStats, BiTask,BiHelpCircle } from 'react-icons/bi';
import '../styles/Sidebar.css';
const Sidebar = () => {
  return (
    <div className="menu">
      {/* Corrected the className attribute */}
      <div className="logo">
        {/* React components need to be capitalized */}
        <BiBookAlt />
        <h2>Academa</h2>
      </div>

      <div className="menu--list">
        {/* Updated className and labels */}
        <a href="#" className="item">
          <BiHome />
          <span>Dashboard</span>
        </a>
        <a href="#" className="item">
          <BiMessage />
          <span>Messages</span>
        </a>
        <a href="#" className="item">
          <BiStats />
          <span>Statistics</span>
        </a>
        <a href="#" className="item">
          <BiTask />
          <span>Projects</span>
        </a>
        <a href="#" className="item">
          <BiSolidReport />
          <span>Reports</span>
        </a>
        <a href="#" className="item">
          <BiHelpCircle />
          <span>Help</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
