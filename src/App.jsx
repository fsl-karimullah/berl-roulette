import React from "react";
import { Routes, Route } from "react-router-dom";
import Roulette from "./pages/Roulette";
import Form from "./pages/Form";
import "./App.css";
import Welcome from "./pages/Welcome";
import InvitationPage from "./pages/InvitationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/roulette" element={<Roulette />} />
      <Route path="/form" element={<Form />} />
      <Route path="/invitation" element={<InvitationPage />} />
    </Routes>
  );
}

export default App;
 