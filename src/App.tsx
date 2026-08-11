import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import VehicleDetail from "./pages/VehicleDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fleet/:id" element={<VehicleDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
