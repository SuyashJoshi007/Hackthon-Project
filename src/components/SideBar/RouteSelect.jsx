import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiDollarSign,
  FiHome,
  FiLink,
  FiPaperclip,
  FiUsers,
} from "react-icons/fi";

const RouteSelect = () => {
  const { pathname } = useLocation(); // to highlight active route

  return (
    <div className="space-y-1">
      <Route
        Icon={FiHome}
        title="Dashboard"
        to="/"
        selected={pathname === "/"}
      />
      <Route
        Icon={FiUsers}
        title="Help"
        to="/help"
        selected={pathname === "/help"}
      />
      <Route
        Icon={FiPaperclip}
        title="Invoices"
        to="/invoices"
        selected={pathname === "/invoices"}
      />
      <Route
        Icon={FiLink}
        title="Integrations"
        to="/integrations"
        selected={pathname === "/integrations"}
      />
      <Route
        Icon={FiDollarSign}
        title="Inventory Form"
        to="/inventory-form"
        selected={pathname === "/inventory-form"}
      />
    </div>
  );
};

const Route = ({ selected, Icon, title, to }) => {
  return (
    <Link
      to={to}
      className={`flex items-center justify-start gap-2 w-full rounded px-3 py-2 text-sm font-medium transition-all duration-200
        ${
          selected
            ? "bg-white text-stone-950 shadow-md hover:bg-violet-100 hover:text-violet-700"
            : "bg-transparent text-stone-500 hover:bg-violet-100 hover:text-violet-600"
        }`}
    >
      <Icon
        className={`transition-colors duration-200 ${
          selected ? "text-violet-500 group-hover:text-violet-700" : ""
        }`}
      />
      <span>{title}</span>
    </Link>
  );
};

export default RouteSelect;
