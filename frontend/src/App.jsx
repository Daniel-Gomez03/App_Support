import React from 'react'
import './less/main.less'
import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/CreateTicket';
import CreateTicket from './pages/CreateTicket';

function App() {

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets/create" element={<Tickets title="Crear Ticket" />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
