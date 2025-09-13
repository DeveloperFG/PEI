import { useState, useContext, useEffect } from "react";
import { UserContext } from '../context/userContext';
import { useAlert } from "../context/alertContext";
import { useNavigate } from "react-router-dom";
import firebase from '../firebase/db';
import "../App.css";

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [revogados, setRevogados] = useState([]);
  const [searchEmail, setSearchEmail] = useState(""); // estado para filtro
  const { showAlert } = useAlert();
  
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  // Autorizar ou revogar permissão
  async function handleAutorizar(uid) {
    try {
      const userRef = firebase.firestore().collection("usuarios").doc(uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        showAlert("Usuário não encontrado!", "info");
        return;
      }

      const currentData = snap.data();
      const newPermission = !currentData.permission;

      await userRef.update({
        permission: newPermission,
      });

      showAlert(`Permissão do usuário foi ${newPermission ? "ATIVADA" : "DESATIVADA"} com sucesso!`, "info");

      // Atualiza no estado local (sem precisar recarregar)
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === uid ? { ...u, permission: newPermission } : u
        )
      );

      setRevogados((prev) =>
        prev.map((u) =>
          u.id === uid ? { ...u, permission: newPermission } : u
        ).filter((u) => u.permission === false)
      );

    } catch (error) {
      console.error("Erro ao autorizar usuário:", error);
    }
  }

  // Excluir usuário
  async function handleExcluir(uid) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await firebase.firestore().collection("usuarios").doc(uid).delete();
      showAlert("Usuário excluído com sucesso!", "success");

      // Remove do estado local
      setUsuarios((prev) => prev.filter((u) => u.id !== uid));
      setRevogados((prev) => prev.filter((u) => u.id !== uid));
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      showAlert("Erro ao excluir usuário!", "error");
    }
  }

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const snapshot = await firebase.firestore().collection("usuarios").get();

        const listaCompleta = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsuarios(listaCompleta);
        setRevogados(listaCompleta.filter((user) => user.permission === false));
      } catch (error) {
        console.error("Erro ao listar usuários:", error);
      }
    }

    fetchUsuarios();
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.log("Erro ao deslogar: " + err.message);
      showAlert("Erro ao deslogar!", "error");
    }
  }

  const irPei = () => {
    navigate("/peiapp");
  }

  // Filtra usuários de acordo com o input de pesquisa
  const usuariosFiltrados = usuarios.filter((user) =>
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className="form-wrapper">
        <div className="logout" onClick={handleLogout}>Sair</div>

        <h1 className="title">Gerenciamento de usuários</h1>

        <div className="welcome">Usuários cadastrados: {usuarios.length}</div>
        <div className="welcome">Usuários não autorizados: {revogados.length}</div>

        {/* Campo de pesquisa */}
        <div style={{ margin: "16px 0" }}>
          <input
            type="text"
            placeholder="Pesquisar por email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{
              padding: "8px",
              width: "300px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div className="list_user">
          <table className="user-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                 <th>Escola</th>
                <th>Status</th>
                <th>Ações</th>
                <th>Excluir</th> {/* Nova coluna */}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.school}</td>
                  <td>
                    <span className={user.online ? "status-online" : "status-offline"}>
                      {user.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-authorize"
                      onClick={() => handleAutorizar(user.id)}
                    >
                      {user.permission ? "Revogar" : "Autorizar"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-excluir"
                      onClick={() => handleExcluir(user.id)}
                      style={{ backgroundColor: "#e74c3c", color: "#fff", padding: "4px 8px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="btn-acesso" onClick={irPei}>Ir para PEI</div>
      </div>
    </div>
  );
}
