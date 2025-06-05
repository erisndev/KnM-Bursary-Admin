import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";
import ApplicantDetails from "./pages/ApplicantDetails";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<Admin />} />

        <Route path="/applications/:id" element={<ApplicantDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
