import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900">English Cards</h1>
      <p className="max-w-md text-gray-600">
        Aprende las 300 palabras más usadas del inglés con pronunciación
        adaptada para hispanohablantes.
      </p>
      <Link
        to="/study"
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
      >
        Empezar a estudiar
      </Link>
    </div>
  );
}
