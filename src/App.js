import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, } from "react-router-dom";

import StockcodeModal from "./pages/StockcodeModal";
import NutraTechForm from "./pages/NutraTechRequestForm";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PrfList from "./pages/PrfList";
import AppLayout from "./components/app-layout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/form" element={<Register />} />
        <Route path="/nutraTech/form" element={<AppLayout><NutraTechForm/></AppLayout>}/>
        <Route path="/stock/modal/form" element={<StockcodeModal />}/>
        <Route path="/prf/list" element={<AppLayout><PrfList /></AppLayout>}/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;