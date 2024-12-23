//import { useState } from "react";
//import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import CreatorsPage from "./pages/CreatorsPage";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">E aí, qual a boa?</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={() => navigate("/creators")}
      >
        Manage Creators
      </button>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/creators" element={<CreatorsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
