import { createContext, useState, useEffect } from 'react'
import firebase from '../firebase/db';
// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext({});

export function ContextProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userLogged, setUserLogged] = useState([])
    const [user, setUser] = useState(null);  
    const [loadRender, setLoadRender] = useState(false);

     const [isPermission, setIsPermission] = useState(null);


     const logout = async () => {
      const currentUser = firebase.auth().currentUser;

      try {
        if (currentUser) {
      try {
        await firebase.firestore().collection("usuarios").doc(currentUser.uid).update({
          online: false,
        });
      } catch (err) {
        console.warn("Erro ao marcar offline:", err);
      }
    }

    await firebase.auth().signOut();
  } catch (err) {
    console.error("Erro no signOut:", err);
    throw err;
  } finally {
    // garante reset consistente do contexto
    setUser(null);
    setIsAuthenticated(false);
    setIsPermission(null);
    setLoadRender(false);
    setLoading(false);
  }
};

  
 useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setLoadRender(true);

        try {
          const snap = await firebase
            .firestore()
            .collection("usuarios")
            .doc(currentUser.uid)
            .get();

          if (!snap.exists) {
            console.warn("Usuário não encontrado no Firestore:", currentUser.uid);
          }
        } catch (err) {
          console.error("Erro ao buscar usuário:", err);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setLoadRender(false);
      }

      // 👈 só libera o loading no FINAL, independente do if/else
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

    return (
        <UserContext.Provider value={{ isAuthenticated, setIsAuthenticated, userLogged, setUserLogged, loading, setLoading, user, setUser, isPermission, setIsPermission,
          loadRender, setLoadRender, logout
        }}>
            {children}
        </UserContext.Provider>
    )
}