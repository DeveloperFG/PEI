import { useState } from "react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import "./App.css";

export default function App() {
  const [studentData, setStudentData] = useState({
    nome: "",
    idade: "",
    ano: "",
    disciplina: "",
    dificuldades: "",
    objetivos: "",
  });

  const [peiContent, setPeiContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const buildPrompt = () => {
    return `
Você é um especialista em Educação Inclusiva. 
Crie um **Plano Educacional Individualizado (PEI)** completo, bem estruturado e formatado em **Markdown** com os seguintes dados:

- **Nome do aluno:** ${studentData.nome}
- **Idade:** ${studentData.idade}
- **Ano/Série:** ${studentData.ano}
- **Disciplina(s) foco:** ${studentData.disciplina}
- **Necessidades/dificuldades observadas:** ${studentData.dificuldades}
- **Objetivos de aprendizagem desejados:** ${studentData.objetivos}

### Regras de Formatação:
1. Use títulos e subtítulos (##, ###).
2. Use listas numeradas ou marcadores para estratégias e recursos.
3. Inclua seções claras como:
   - Perfil do aluno
   - Objetivos de ensino
   - Estratégias pedagógicas inclusivas
   - Recursos pedagógicos e de acessibilidade
   - Formas de avaliação adaptada
4. Evite texto corrido sem estrutura.
5. Mantenha uma linguagem profissional, mas acessível para professores.

Responda apenas no formato Markdown.
    `;
  };

  const generatePEI = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: buildPrompt() }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (text) setPeiContent(text);
    else setError("Não foi possível gerar o PEI.");
  } catch (err) {
    console.error("Erro ao gerar o PEI:", err);
    setError("Ocorreu um erro. Verifique sua conexão.");
  } finally {
    setIsLoading(false);
  }
};

// const generatePEI = async (e) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError(null);

//   try {
//     // agora chamamos a rota serverless
//     const response = await fetch("/api/gemini", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ prompt: buildPrompt() }),
//     });

//     const data = await response.json();

//     // pega o texto estruturado da resposta
//     const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//     if (text) setPeiContent(text);
//     else setError("Não foi possível gerar o PEI.");
//   } catch (err) {
//     console.error("Erro ao gerar o PEI:", err);
//     setError("Ocorreu um erro. Verifique sua conexão.");
//   } finally {
//     setIsLoading(false);
//   }
// };

  const copyToClipboard = () => {
    if (peiContent) {
      navigator.clipboard.writeText(peiContent);
      alert("Conteúdo copiado!");
    }
  };

const downloadPEI = () => {
  if (peiContent) {
    const doc = new jsPDF({
      orientation: "p", // retrato
      unit: "pt",       // pontos
      format: "a4",     // formato A4
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeight = 20;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Plano Educacional Individualizado (PEI)", margin, margin);

    // Configura texto
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Quebra o conteúdo em linhas do tamanho da página
    const lines = doc.splitTextToSize(peiContent, pageWidth - margin * 2);

    let cursorY = margin + 40; // posição inicial após o título

    lines.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    // Nome do arquivo
    const fileName = `PEI_${studentData.nome.replace(
      /\s/g,
      "_"
    )}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;

    doc.save(fileName);
  }
};
  return (
    <div className="app-container">
      <div className="form-wrapper">
        <h1 className="title">Plano Educacional Individualizado (PEI)</h1>

        <form onSubmit={generatePEI} className="form">
          <div className="grid">
            <div className="form-group">
              <label htmlFor="nome">Nome do Aluno</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={studentData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="idade">Idade</label>
              <input
                type="number"
                id="idade"
                name="idade"
                value={studentData.idade}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ano">Ano/Série</label>
              <input
                type="text"
                id="ano"
                name="ano"
                value={studentData.ano}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="disciplina">Disciplina(s)</label>
              <input
                type="text"
                id="disciplina"
                name="disciplina"
                value={studentData.disciplina}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dificuldades">
              Necessidades/Dificuldades Observadas
            </label>
            <textarea
              id="dificuldades"
              name="dificuldades"
              rows="4"
              value={studentData.dificuldades}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="objetivos">
              Objetivos de Aprendizagem Desejados
            </label>
            <textarea
              id="objetivos"
              name="objetivos"
              rows="4"
              value={studentData.objetivos}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Gerando PEI..." : "Gerar PEI"}
          </button>
        </form>

        <div className="result-box">
          {error && <div className="error">Ocorreu um erro: {error}</div>}

          {peiContent ? (
            <div>
              <h2 className="result-title">PEI Gerado</h2>
              <div className="pei-content">
                <ReactMarkdown>{peiContent}</ReactMarkdown>
              </div>
              <div className="actions">
                <button onClick={copyToClipboard} className="btn-secondary">
                  Copiar Texto
                </button>
                <button onClick={downloadPEI} className="btn-success">
                  Baixar PEI
                </button>
              </div>
            </div>
          ) : (
            <p className="placeholder">
              Preencha o formulário e clique em "Gerar PEI".
            </p>
          )}
        </div>
      </div>
    </div>
  );
}