// AuthProvider.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null); // Remplacez null par un ID utilisateur si disponible

    // Méthodes pour se connecter, se déconnecter, etc. peuvent être ajoutées ici

    return (
        <AuthContext.Provider value={{ userId, setUserId }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
    return useContext(AuthContext);
};
