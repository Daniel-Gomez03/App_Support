// ============================================
// CONTEXT: AUTH CONTEXT
// Proveedor global de autenticación. Expone el usuario activo,
// el estado de carga inicial y utilidades de sesión a toda la app.
//
// VALOR DEL CONTEXTO:
//   user             — objeto del usuario autenticado (null si no hay sesión)
//   setUser          — actualiza el usuario manualmente (usado en logout/force_logout)
//   loading          — true durante la verificación inicial de sesión
//   verificarSesion  — recarga el usuario desde el servidor (útil tras cambios de permisos)
//   socket           — instancia de Socket.IO compartida (para componentes que emiten eventos)
//
// FLUJO:
//   1. Al montar: verificarSesion() consulta /api/current-user.
//      Si la sesión es válida, setUser(data.user); en caso contrario, setUser(null).
//   2. Cuando user.user_id está disponible: conecta el socket, une al room del usuario
//      y registra dos listeners:
//        permisos_actualizados — recarga el usuario para reflejar cambios de permisos en tiempo real.
//        force_logout          — muestra alerta (si el servidor envía mensaje), limpia el usuario
//                               y redirige al portal de aplicativos.
//      El cleanup del useEffect desregistra ambos listeners para evitar duplicados
//      si user_id cambia (cambio de sesión).
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, socket } from '../services/Userservice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const verificarSesion = async () => {
        try {
            const data = await getCurrentUser();
            if (data.status === 'success') {
                setUser(data.user);
            }
        } catch (error) {
            console.error("Error de sesión:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        verificarSesion();
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            if (!socket.connected) socket.connect();

            socket.emit('join_room', user.user_id);

            socket.on('permisos_actualizados', () => {
                verificarSesion();
            });

            socket.on('force_logout', (data) => {
                if (data?.message) alert(data.message);
                setUser(null);
                window.location.href = "http://localhost/PortalAplicativos/public/inicio";
            });

            return () => {
                socket.off('permisos_actualizados');
                socket.off('force_logout');
            };
        }
    }, [user?.user_id]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, verificarSesion, socket }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);