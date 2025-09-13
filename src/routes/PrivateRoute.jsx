import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from '../context/userContext';

function PrivateRoute({ children }) {
  let { loading, isAuthenticated } = useContext(UserContext);


  // console.log("isAuthenticated", isAuthenticated)
  // console.log("loading", loading)

  
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>
      Carregando...
    </div>; // pode trocar por seu <Load/>
  }
  return isAuthenticated ? children : <Navigate to="/"   />;
}

export default PrivateRoute;