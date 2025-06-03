import React from "react";
import { Routes, Route } from "react-router-dom";
import Roulette from "./pages/Roulette";
import Form from "./pages/Form";
import Welcome from "./pages/Welcome";
import InvitationPage from "./pages/InvitationPage";
import { ToastContainer } from "react-toastify";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import ThanksPage from "./pages/ThanksPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/:slug" element={<LandingPage />} />
        <Route path="/polling/:slug" element={<Welcome />} /> 
        <Route path="/roulette" element={<Roulette />} />
        <Route path="/form" element={<Form />} />
        <Route path="/invitation" element={<InvitationPage />} />
        <Route path="/thanks" element={<ThanksPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;