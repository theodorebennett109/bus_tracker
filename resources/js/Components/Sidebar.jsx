import React from "react";
import { AiFillDashboard } from "react-icons/ai";
import { FaBusAlt } from "react-icons/fa";
import { MdGpsFixed } from "react-icons/md";

export default function Sidebar() {
  return (
    <div className="bg-gray-800 text-white h-screen w-[250px] p-5 flex flex-col">


      <div className="text-xl font-bold mb-6 flex items-center gap-2">
        <FaBusAlt /> Bus Tracker
      </div>


      <nav className="flex flex-col gap-4">
        <a href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md">
          <AiFillDashboard size={20} />
          Dashboard
        </a>
        <a href="/bustracker" className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-md">
          <MdGpsFixed size={20} />
          Bus Tracker
        </a>
      </nav>
    </div>
  );
}
