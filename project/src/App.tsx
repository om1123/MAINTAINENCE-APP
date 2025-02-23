import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MachineList from './pages/MachineList';
import CreateWorkOrder from './pages/CreateWorkOrder';
import WorkOrderList from './pages/WorkOrderList';
import Notifications from './pages/Notifications';
import ExportData from './pages/ExportData';
import Settings from './pages/Settings';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="machines" element={<MachineList />} />
            <Route path="create-work-order" element={<CreateWorkOrder />} />
            <Route path="work-orders" element={<WorkOrderList />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="export" element={<ExportData />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;