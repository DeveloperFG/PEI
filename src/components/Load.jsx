// components/Loader.js
import React from "react";
import "./Load.css"; // estilos do spinner

export default function Load() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Carregando...</p>
    </div>
  );
}