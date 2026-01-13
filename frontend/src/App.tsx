import { Routes, Route, Link, useLocation } from "react-router-dom";
import { HealthPage, SpacesPage } from "./pages";

function App() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Spaces", icon: "🏠" },
    { path: "/health", label: "Health", icon: "💚" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="font-bold text-xl text-gray-900">
                Doublespot
              </span>
            </div>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<SpacesPage />} />
        <Route path="/health" element={<HealthPage />} />
      </Routes>
    </div>
  );
}

export default App;
