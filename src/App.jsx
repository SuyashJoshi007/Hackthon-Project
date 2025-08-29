import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/SideBar/Sidebar";

// Your page components
import Dashboard from "./components/Dashboard/Dashboard";
import Help from "./components/Help/Help";
import Invoices from "./components/Invoices/Invoices";
import Integrations from "./components/Integrations/Integrations";
import EquipmentForm from "./components/Inventory_Form/EquipmentForm";
function App() {
  return (
    <Router>
      <div className="h-screen w-screen grid grid-cols-[220px_1fr]">
        {/* Sidebar always visible */}
        <Sidebar />

        {/* Main content changes */}
        <main className="p-6 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/help" element={<Help />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/inventory-form" element={<EquipmentForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
