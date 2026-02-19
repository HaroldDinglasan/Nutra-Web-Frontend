import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, } from "react-router-dom";

import StockcodeModal from "./pages/StockcodeModal";
import NutraTechForm from "./pages/NutraTechRequestForm";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PrfList from "./pages/PrfList";
import AppLayout from "./components/app-layout";

import StockApproveAvailability from "./pages/StockApproveAvailability";
import StockRejectAvailability from "./pages/StockRejectAvailability";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/form" element={<Register />} />
        <Route path="/nutraTech/form" element={<AppLayout><NutraTechForm/></AppLayout>}/>
        <Route path="/stock/modal/form" element={<StockcodeModal />}/>
        <Route path="/prf/list" element={<AppLayout><PrfList /></AppLayout>}/>

        <Route path="stock/approve/form" element={<StockApproveAvailability />} />
        <Route path="stock/reject/form" element={<StockRejectAvailability />} />
        
        <Route path="/prf/:prfId" element={<AppLayout><NutraTechForm /></AppLayout>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;