// import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import { ContextProvider } from './context/userContext.jsx';
import { AlertProvider } from "./context/alertContext.jsx";
import Login from "./pages/Login";
import PEIApp from "./pages/PEIApp";
import Admin from "./pages/Admin";
import User from "./pages/User";
import Recover from "./pages/Recover.jsx";

// import "react-toastify/dist/ReactToastify.css";


function App() {

  return (
    <ContextProvider>
       <AlertProvider>
          <BrowserRouter>
                {/* <ToastContainer autoClose={2000} /> */}
                <Routes>
                  
                  {/* Rota pública */}
                  <Route path="/" element={<Login />} />
                  <Route path="/recover" element={<Recover />} />

                  {/* Rotas protegidas */}
                  
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute>
                        <Admin />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/user"
                    element={
                      <PrivateRoute>
                        <User />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/peiapp"
                    element={
                      <PrivateRoute>
                        <PEIApp />
                      </PrivateRoute>
                    }
                  />

                </Routes>
              </BrowserRouter>
       </AlertProvider>
     
    </ContextProvider>
    
  );
}

export default App;