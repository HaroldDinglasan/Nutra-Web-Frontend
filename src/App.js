import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import RequestForm from "./pages/RequestForm";

const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/request/form" element={< RequestForm/>} />
              
              <Route path="*" element={<Navigate to="/request/form" />} />
          </Routes>
      </Router>
  );
};

export default App;