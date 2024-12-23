import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreatorsPage from "./pages/CreatorsPage";
import BlacklistedCreatorsPage from "./pages/BlacklistedCreatorsPage";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Sup?</h1>
    </div>
  );
};

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">R34 Manager</h1>
      <nav className="flex gap-4">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Home
        </Link>
        <Link
          to="/creators"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Creators
        </Link>
        <Link
          to="/blacklisted-creators"
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Blacklisted
        </Link>
      </nav>
    </header>
  );
};

const App = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/creators" element={<CreatorsPage />} />
            <Route
              path="/blacklisted-creators"
              element={<BlacklistedCreatorsPage />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
