import React from 'react';
import './less/main.less';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import AssignedTicket from './pages/AssignedTicket';
import ActiveTicket from './pages/ActiveTicket';
import History from './pages/Historial';
import Warranties from './pages/Garantias';
import Users from './pages/Usuarios';
import Departures from './pages/Salidas';
import QA from './pages/QA';
import Comments from './pages/Comentarios';

const ProtectedRoute = ({ children, moduleName }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#F3F3F4' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Verificando credenciales...</h2>
          <p>Espera un momento, por favor.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "http://localhost/PortalAplicativos/public/inicio";
    return null;
  }

  if (!moduleName) return children;

  const hasPermission = user.Permissions?.some(p =>
    p.Seccion?.module_name === moduleName && p.permissions_read === 1
  );

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                  <Route path="/tickets/createTicket" element={
                    <ProtectedRoute moduleName="Crear Ticket">
                      <CreateTicket title="Crear Ticket" />
                    </ProtectedRoute>
                  } />

                  <Route path="/tickets/assignedTicket" element={
                    <ProtectedRoute moduleName="Asignar Tickets">
                      <AssignedTicket title="Asignar Tickets" />
                    </ProtectedRoute>
                  } />

                  <Route path="/tickets/activeTicket" element={
                    <ProtectedRoute moduleName="Tickets Activos">
                      <ActiveTicket title="Tickets Activos" />
                    </ProtectedRoute>
                  } />

                  <Route path='/history' element={
                    <ProtectedRoute moduleName="Historial">
                      <History />
                    </ProtectedRoute>
                  } />

                  <Route path='/warranty' element={
                    <ProtectedRoute moduleName="Garantias">
                      <Warranties />
                    </ProtectedRoute>
                  } />

                  <Route path='/users' element={
                    <ProtectedRoute moduleName="Usuarios">
                      <Users />
                    </ProtectedRoute>
                  } />

                  <Route path='/departures' element={
                    <ProtectedRoute moduleName="Salidas">
                      <Departures />
                    </ProtectedRoute>
                  } />

                  <Route path='/qa' element={
                    <ProtectedRoute moduleName="Q&A">
                      <QA />
                    </ProtectedRoute>
                  } />

                  <Route path='/comments' element={
                    <ProtectedRoute moduleName="Comentarios">
                      <Comments />
                    </ProtectedRoute>
                  } />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;