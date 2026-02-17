import React from 'react'
import './less/main.less'
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import AssignedTicket from './pages/AssignedTicket';
import ActiveTicket from './pages/ActiveTicket';
import History from './pages/Historial';
import Users from './pages/Usuarios';
import Departures from './pages/Salidas';
import QA from './pages/QA';

function App() {

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets/createTicket" element={<CreateTicket title="Crear Ticket" />} />
          <Route path="/tickets/assignedTicket" element={<AssignedTicket title="Asignar Tickets" />} />
          <Route path="/tickets/activeTicket" element={<ActiveTicket title="Tickets Activos" />} />
          <Route path='/history' element={<History />} />
          <Route path='/users' element={<Users />} />
          <Route path='/departures' element={<Departures />} />
          <Route path='/qa' element={<QA />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
