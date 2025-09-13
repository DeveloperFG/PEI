import { useState, useContext, useEffect } from "react";
import { UserContext } from '../context/userContext';
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/alertContext";
import firebase from '../firebase/db';

import "../App.css";

export default function User() {
     const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
     const { showAlert } = useAlert();


    let { setIsAuthenticated, setIsPermission, isPermission, setLoadRender } = useContext(UserContext);

   async function handleLogout() {
  try {
    const user = firebase.auth().currentUser;

    if (user) {
      const uid = user.uid;

      // Marca como offline no Firestore
      await firebase.firestore().collection("usuarios").doc(uid).update({
        online: false,
      });

      // Faz o signOut no Firebase Auth
      await firebase.auth().signOut();
      showAlert("Usuário deslogado com sucesso!", "success");
      setIsAuthenticated(false)
      setLoadRender(true)
    } else {
      showAlert("Nenhum usuário logado!", "info");
    }
  } catch (error) {
    console.error("Erro ao deslogar:", error);
    showAlert("Erro ao deslogar!", "error");
  }
}


  useEffect(() => {
  const unsubscribeAuth = firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const docRef = firebase.firestore().collection("usuarios").doc(user.uid);

      const unsubscribeDoc = docRef.onSnapshot((docSnap) => {
        if (docSnap.exists) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setUsuarios([data]);
          // Atualiza no contexto também
          setIsPermission(data);
        } else {
          setUsuarios([]);
          setIsPermission(null);
        }
      });

      return () => unsubscribeDoc();
    } else {
      // setUsuarios([]);
      // setIsPermission(null);
    }
  });

  return () => unsubscribeAuth();
}, [setIsPermission]);


const irPei = () => {
    navigate("/peiapp")
} 

  return (
     <div className="app-container">
    <div className="form-wrapper">
       <div className="logout" onClick={handleLogout}>Sair</div>

      <h1 className="title">Aréa de espera</h1>

      <div className="welcome">Você sera redirecionado(a) automaticamente</div>
      <div className="welcome_two">Quando o administrador liberar seu acesso a plataforma.</div>

      <div className="list_user">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Status</th>
              <th>Acesso</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={
                      user.online ? "status-online" : "status-offline"
                    }
                  >
                    {user.online ? "Online" : "Offline"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-authorize"
                    // onClick={() => handleAutorizar(user.id)}
                    onClick={irPei}
                  >
                    {user.permission  ? "Liberado" : "Bloqueado"}
                  </button>
                </td>
              </tr>
            ))}
            {isPermission?.permission && (
                <div className="btn-acesso" onClick={irPei}>Ir para PEI</div>
            )}
           
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  );
}