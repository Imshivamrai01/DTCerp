"use client";
import React from "react";

const ToggleButton = ({ isOn, onToggle }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer group">
      <input
        type="checkbox"
        checked={isOn}
        onChange={onToggle}
        className="sr-only"
        aria-label="Toggle Active Status"
      />
      <div
        className={`w-12 h-7 flex items-center rounded-full px-1 transition-colors duration-300 ease-in-out
          ${isOn ? "bg-green-500" : "bg-gray-300"}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
            ${isOn ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
      <span
        className={`ml-3 text-sm font-medium transition-colors duration-300 ease-in-out 
          ${isOn ? "text-green-600" : "text-gray-500"}`}
      >
        {isOn ? "Active" : "Inactive"}
      </span>
    </label>
  );
};

export default ToggleButton;
