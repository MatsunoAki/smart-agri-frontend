import { createContext, useContext } from "react";
import { useAuth } from "../contexts/AuthContext"; // Your Auth Context

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();

  return (
    <UserContext.Provider value={{ userUid: user ? user.uid : null }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
