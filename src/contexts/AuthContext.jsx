import React, { createContext, useContext, useState, useEffect } from "react";
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
return useContext(AuthContext);
}

export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const auth = getAuth(); // Ensure auth is initialized here

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
    });

    return () => unsubscribe();
}, [auth]);

function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

function logout() {
    return signOut(auth);
}

const value = {
    user,
    loading,
    signup,
    login,
    logout,
};

return (
    <AuthContext.Provider value={value}>
    {!loading ? children : <p>Loading...</p>}
    </AuthContext.Provider>
);
}
