import React, { createContext, useState, useContext } from 'react';

interface User{
    id: number,
    role:  'admin' | 'user'
};

interface AuthContextType{
    user: User | null,
    token: string | null,
    login: (accessToken: string, refreshToken: string, userId: number, role: 'user' | 'admin') => void,
    logout: () => void
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}): React.ReactElement {
    const [user, setUser] = useState<User | null>(() => {
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("role") as 'user' | 'admin';
        if (userId && role) {
            return {id: parseInt(userId), role};
        }
        return null;
    });
    
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("accessToken");
    });
    
    function login(accessToken: string, refreshToken: string, userId: number, role: 'user' | 'admin'){
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId.toString());
        localStorage.setItem("role", role);

        setToken(accessToken);
        setUser({id: userId, role});
    }

    function logout(){
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        
        setToken(null);
        setUser(null);
    }

    return (
    <AuthContext.Provider value={{user, token, login, logout}}>
        {children}
    </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(){
    const context = useContext(AuthContext);
    if (!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}