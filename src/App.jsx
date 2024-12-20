import React from "react";
import { Routes, Route } from "react-router-dom";
import Roulette from "./pages/Roulette";
import Form from "./pages/Form";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Form />} />
      <Route path="/roulette" element={<Roulette />} />
    </Routes>
  );
}

export default App;
