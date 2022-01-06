import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/about";
import Connect from "./pages/connect";
import Home from "./pages/home";
import Login from "./pages/login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/connect" element={<Connect />} />
      </Routes>
    </BrowserRouter>
  );
}
