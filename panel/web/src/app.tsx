import { lazy } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
const About = lazy(() => import("./pages/about"));
const Connect = lazy(() => import("./pages/connect"));
const Login = lazy(() => import("./pages/login"));
const LogOut = lazy(() => import("./pages/logout"));
const Servers = lazy(() => import("./pages/servers"));

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
