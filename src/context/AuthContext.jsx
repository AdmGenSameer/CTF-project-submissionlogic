import { useContext, useState, useEffect, createContext } from "react";
import { account } from "../utils/Config";
import { createBrowserHistory } from "history";
import Loader from "../components/Loader";

// Create contexts
export const ErrorContext = createContext();
export const AuthContext = createContext();

const history = createBrowserHistory();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Set initial value as null
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const loginUser = async (userInfo) => {
    try {
      setLoading(true);
      // Create session using Appwrite's account API
      let sessionResponse = await account.createEmailPasswordSession(
        userInfo.email,
        userInfo.password
      );

      console.log("sessionResponse: ", sessionResponse);
      
      // Explicitly create and fetch the JWT
      let jwtResponse = await account.createJWT();
      console.log("jwtResponse: ", jwtResponse);
      if (!jwtResponse || !jwtResponse.jwt) {
        throw new Error("403: Failed to login - missing JWT");
      }
      
      // If JWT is present, fetch full account details
      let accountDetails = await account.get();
      console.log("accountDetails: ", accountDetails);
      setUser(accountDetails);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setErrorMessage(error.message);
      history.push("/login");
      setLoading(false);
    }
  };

  const logoutUser = () => {
    account.deleteSession("current");
    setUser(null);
  };

  const registerUser = () => {};

  const checkUserStatus = async () => {
    try {
      let accountDetails = await account.get();
      setUser(accountDetails);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const contextData = {
    user,
    loginUser,
    logoutUser,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      <ErrorContext.Provider value={errorMessage}>
        {loading ? <Loader /> : children}
      </ErrorContext.Provider>
    </AuthContext.Provider>
  );
};

// Custom hooks for using the contexts
export const useAuth = () => {
  return useContext(AuthContext);
};

export const useError = () => {
  return useContext(ErrorContext);
};
