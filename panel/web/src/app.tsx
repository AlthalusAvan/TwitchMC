import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/about";
import Connect from "./pages/connect";
import Home from "./pages/home";
import Login from "./pages/login";
import LogOut from "./pages/logout";
import Servers from "./pages/servers";
import { FirebaseAuthProvider } from "./providers/authProvider";

export default function App() {
  return (
    <FirebaseAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<LogOut />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/servers" element={<Servers />} />
        </Routes>
      </BrowserRouter>
    </FirebaseAuthProvider>
  );
}
