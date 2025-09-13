import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/alertContext";
import firebase from '../firebase/db';
import "../App.css";

export default function Recover() {

  const [email, setEmail] = useState("");
  const [laod, setLoad] = useState(false);

  const { showAlert } = useAlert();


  const navigate = useNavigate();
 

  async function handleForgotPassword(email) {
  if (!email) {
    showAlert("Por favor, informe o email cadastrado!", "info");
    return;
  }

  try {
    setLoad(true)
    await firebase.auth().sendPasswordResetEmail(email);
    showAlert(`Um email para redefinição de senha foi enviado para ${email}`, "success");
    setTimeout(() => {
         showAlert("Verifique sua caixa de entrada ou spam!", "info");
    },3500);
    setLoad(false)
    setEmail("")
  } catch (error) {
    console.error("Erro ao enviar email de redefinição:", error);
    setLoad(false)
    switch (error.code) {
      case "auth/user-not-found":
         showAlert("Usuário não encontrado. Verifique o email digitado", "warning ");
        break;
      case "auth/invalid-email":
         showAlert("Email inválido. Verifique o email digitado.", "warning ");
        break;
      default:
         showAlert("Erro ao enviar email de redefinição.", "error ");
    }
  }
}

const irForLogin = () =>{
    navigate("/")
}

  return (
    <div className="app-container">
        <div className="form-wrapper">
          <h1 className="title">{"Recupere sua senha..."}</h1>

              <div className="form-group">
                <label>Email</label>
                <input type="email"  placeholder="Email que você cadastrou" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>  
              <p className="placholder">
              <button className="btn-primary" onClick={() => handleForgotPassword(email)}>
                {laod ? "Enviando link..." : "Enviar link"}
              </button> 
            </p>
             <p className="placeholder">
            <a className="createLink" onClick={irForLogin}>
              {"Voltar para login"}
            </a>
          </p>
        </div>
    </div>
  );
}