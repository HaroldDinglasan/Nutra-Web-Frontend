import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import RequestForm from "./pages/RequestForm";
import Register from "./pages/Register";

const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/request/form" element={< RequestForm/>} />
              <Route path="/register/form" element={<Register/>} />
              <Route path="*" element={<Navigate to="/request/form" />} />
          </Routes>
      </Router>
  );
};

export default App;