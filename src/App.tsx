import { NavLink, Route, Routes } from "react-router-dom";
import { Favorites } from "./pages/Favorites";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Settings } from "./pages/Settings";
import { Stats } from "./pages/Stats";
import { Study } from "./pages/Study";

const navItems = [
  { to: "/", label: "Inicio", end: true },
  { to: "/study", label: "Estudiar", end: false },
  { to: "/quiz", label: "Quiz", end: false },
  { to: "/favorites", label: "Favoritos", end: false },
  { to: "/stats", label: "Estadísticas", end: false },
  { to: "/settings", label: "Ajustes", end: false },
];

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex flex-wrap items-center justify-center gap-2 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study" element={<Study />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
