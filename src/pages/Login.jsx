import { useState, useContext, useEffect } from "react";
import firebase from '../firebase/db';
import { UserContext } from '../context/userContext';
import { useNavigate } from "react-router-dom";
import Load from "../components/Load";
import AlertBar from "../components/Alert";
import "../App.css";

import { useAlert } from "../context/alertContext";

export default function Login() {

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showAlert } = useAlert();


  const navigate = useNavigate();
   const [alert, setAlert] = useState(null);
  const { setLoading, isAuthenticated, setIsAuthenticated, user, loadRender, setLoadRender, setUserLogged} = useContext(UserContext);

  async function handleLogin() {
    setIsLoading(true);
    setLoading(true);

    try {
      const value = await firebase.auth().signInWithEmailAndPassword(email, password);
      const uid = value.user.uid;
      const userRef = firebase.firestore().collection('usuarios').doc(uid);

      // Atualiza 'online' e 'ultimoLogin'
      await userRef.update({
        online: true,
        ultimoLogin: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const snap = await userRef.get();
      const data = snap.data();

      showAlert("Logado com sucesso!", "success");
      setIsLoading(false);
      setLoading(false);
      setIsAuthenticated(true);

      // Redireciona de acordo com perfil
      if (data.adm) {
        navigate("/admin");
      } else if (data.permission) {
        navigate("/peiapp");
      } else {
        navigate("/user");
      }

      setLoadRender(true);

    } catch (error) {
      console.error("Erro no login:", error);
      showAlert("Erro ao fazer login!", "error");
      setIsLoading(false);
      setLoading(false);
      setLoadRender(false); // 🔹 garante que Load não fique preso
    }
  }

  async function handleRegister() {
    setIsLoading(true);
    try {
      const value = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const uid = value.user.uid;

      await firebase.firestore().collection("usuarios").doc(uid).set({
        name: name,
        email: email,
        online: true,
        school: school,
        daysOfUse: 0,
        subscriptionPrice: 0,
        paidSubscription: true,
        permission: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        ultimoLogin: firebase.firestore.FieldValue.serverTimestamp(),
      });

      showAlert("Usuario cadastrado com sucesso!", "success");
      setName("");
      setEmail("");
      setSchool("");
      setPassword("");
      setIsLoading(false);
      setIsRegister(false);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      showAlert("Erro ao cadastrar usuário!", "error");
      setIsLoading(false);
    }
  }

  // Redirecionamento automático se já estiver logado
  useEffect(() => {
    async function checkUser() {
      if (isAuthenticated && user?.uid) {
        try {
          const snap = await firebase.firestore().collection("usuarios").doc(user.uid).get();
          const data = snap.data();

          if (data.adm) {
            navigate("/admin");
          } else if (data.permission) {
            navigate("/peiapp");
          } else {
            navigate("/user");
          }

          setLoadRender(true);
        } catch (err) {
          console.error("Erro ao verificar usuário:", err);
          setLoadRender(false); // 🔹 se der erro, volta para login
        }
      } else {
        setLoadRender(false); // 🔹 usuário não está logado
      }
    }

    checkUser();
  }, [isAuthenticated, user, navigate, setLoadRender]);


  const irForRecover = () => {
    navigate("./recover")
  }

  return (
    <div className="app-container">
            {alert && (
              <AlertBar
                message={alert.message}
                type={alert.type}
                duration={3000}
                onClose={() => setAlert(null)}
              />
      )}
      {loadRender ? (
        <Load/>
      ) : (
        <div className="form-wrapper">
          <h1 className="title">{isRegister ? "PEI - Cadastro" : "PEI - Login "}</h1>

          {isRegister ? (
            <form onSubmit={handleLogin} className="form">
              <div className="form-group">
                <label style={{fontWeight: 'bold'}}>Nome </label>
                <input type="text" placeholder="Nome e Sobrenome " value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 'bold'}}>Escola </label>
                <input type="text" placeholder="Local de trabalho" value={school} onChange={(e) => setSchool(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 'bold'}}>Email</label>
                <input type="email" placeholder="Digite um email válido"   value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 'bold'}}>Senha</label>
                <input type="password"  placeholder="Digite uma senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="form">
              <div className="form-group">
                <label style={{fontWeight: 'bold'}}>Email</label>
                <input type="email" placeholder="Digite um email válido" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{fontWeight: 'bold'}}>Senha</label>
                <input type="password" placeholder="Digite uma senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </form>
          )}

          {!isRegister && (
            <p className="placeholder">
              <button type="button" onClick={handleLogin} className="btn-primary">
                {isLoading ? "Fazendo login..." : "Fazer login"}
              </button>
            </p>
          )}

          {isRegister && (
            <p className="placholder">
              <button onClick={handleRegister} type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? "Cadastrando usuario..." : "Cadastrar"}
              </button> 
            </p>
          )}

          <p className="placeholder">
            {isRegister ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
            <a className="createLink" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Fazer Login" : "Criar Conta"}
            </a>
          </p>

          <p className="placeholder">
            <a className="createLink" onClick={irForRecover}>
              {"Esqueci minha senha"}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}