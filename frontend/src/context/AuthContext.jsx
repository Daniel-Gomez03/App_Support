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
        if (user && user.user_id) {
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