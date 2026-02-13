import React, { createContext, useState, useContext } from 'react';

interface User{
    id: number,
    role:  'admin' | 'user',
    firstName: string;
    lastName: string;
};

interface AuthContextType{
    user: User | null,
    token: string | null,
    login: (accessToken: string, refreshToken: string, userId: number, role: 'user' | 'admin', firstName: string, lastName: string) => void,
    logout: () => void
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}): React.ReactElement {
    const [user, setUser] = useState<User | null>(() => {
        const userId = localStorage.getItem("userId");
        const role = localStorage.getItem("role") as 'user' | 'admin';
        const firstName = localStorage.getItem("firstName");
        const lastName = localStorage.getItem("lastName");
        
        if (userId && role && firstName && lastName) {
            return {
                id: parseInt(userId), 
                role,
                firstName,
                lastName
            };
        }
        return null;
    });
    
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("accessToken");
    });
    
    function login(accessToken: string, refreshToken: string, userId: number, role: 'user' | 'admin', firstName: string, lastName: string){
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId.toString());
        localStorage.setItem("role", role);
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);

        setToken(accessToken);
        setUser({
            id: userId, 
            role,
            firstName,
            lastName
        });
    }

    function logout(){
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        
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