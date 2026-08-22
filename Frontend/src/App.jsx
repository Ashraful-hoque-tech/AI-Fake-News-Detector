import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import History from "./pages/History";

import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <Navbar />

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/history"
            element={<History />}
          />

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;