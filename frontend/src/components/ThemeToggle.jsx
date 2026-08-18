import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative z-50 p-2.5 rounded-full transition-colors duration-200 bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-amber-400 hover:bg-gray-300 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 cursor-pointer flex items-center justify-center"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400 pointer-events-none" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 pointer-events-none" />
      )}
    </button>
  );
};

export default ThemeToggle;