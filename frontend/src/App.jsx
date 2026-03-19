import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  CircleDollarSign,
  Receipt,
  FileText,
  Users,
  HeartPulse,
  Swords,
  Menu,
  X
} from "lucide-react";

import rooster from "./assets/icons8-rooster-50.png";

import "./App.css";

import Birds from "./pages/Birds";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Health from "./pages/Health";
import Reports from "./pages/Reports";
import Buyers from "./pages/Buyers";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", name: "Dashboard", icon: LayoutDashboard },
    { path: "/birds", name: "Birds", icon: "rooster" },
    { path: "/sales", name: "Sales", icon: CircleDollarSign },
    { path: "/expenses", name: "Expenses", icon: Receipt },
    { path: "/health", name: "Health", icon: HeartPulse },
    { path: "/matches", name: "Matches", icon: Swords },
    { path: "/reports", name: "Reports", icon: FileText },
    { path: "/buyers", name: "Buyers", icon: Users }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r z-30 transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">

          <div className="flex items-center gap-2">

            <img src={rooster} className="w-6 h-6" />

            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">KANTHAN FARM</span>
              <span className="text-xs text-green-600">Mathan Sevals</span>
            </div>

          </div>

          <button
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">

          {navItems.map((item) => {

            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition
                ${
                  active
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >

                {item.icon === "rooster" ? (
                  <img src={rooster} className="w-5 h-5" />
                ) : (
                  <item.icon className="w-5 h-5" />
                )}

                {item.name}

              </Link>
            );
          })}

        </nav>
      </div>
    </>
  );
};

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center h-16 px-4 bg-white border-b">

          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="ml-4 flex items-center gap-2">

            <img src={rooster} className="w-5 h-5" />

            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">KANTHAN FARM</span>
              <span className="text-xs text-green-600">Mathan Sevals</span>
            </div>

          </div>

        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">

          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/birds/*" element={<Birds />} />
              <Route path="/sales/*" element={<Sales />} />
              <Route path="/expenses/*" element={<Expenses />} />
              <Route path="/health/*" element={<Health />} />
              <Route path="/matches/*" element={<Matches />} />
              <Route path="/reports/*" element={<Reports />} />
              <Route path="/buyers/*" element={<Buyers />} />
            </Routes>

          </div>

        </main>

      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;