import { useState } from 'react';
import './App.css';

export default function App() {
  const [studentData, setStudentData] = useState({
    nome: '',
    idade: '',
    ano: '',
    disciplina: '',
    dificuldades: '',
    objetivos: ''
  });

  const [peiContent, setPeiContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const buildPrompt = () => {
    return `
      Você é um especialista em Educação Inclusiva...
      - Nome: ${studentData.nome}
      - Idade: ${studentData.idade}
      - Ano/Série: ${studentData.ano}
      - Disciplina(s): ${studentData.disciplina}
      - Necessidades/dificuldades observadas: ${studentData.dificuldades}
      - Objetivos de aprendizagem desejados: ${studentData.objetivos}
    `;
  };

  const generatePEI = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const chatHistory = [{ role: "user", parts: [{ text: buildPrompt() }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; 

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erro na resposta da API.');

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) setPeiContent(text);
      else setError('Não foi possível gerar o PEI.');
    } catch (err) {
      console.error("Erro ao gerar o PEI:", err);
      setError('Ocorreu um erro. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (peiContent) {
      const el = document.createElement('textarea');
      el.value = peiContent;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert('Conteúdo copiado!');
    }
  };

  const downloadPEI = () => {
    if (peiContent) {
      const element = document.createElement("a");
      const file = new Blob([peiContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      const fileName = `PEI_${studentData.nome.replace(/\s/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
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
              <input type="text" id="nome" name="nome" value={studentData.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="idade">Idade</label>
              <input type="number" id="idade" name="idade" value={studentData.idade} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="ano">Ano/Série</label>
              <input type="text" id="ano" name="ano" value={studentData.ano} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="disciplina">Disciplina(s)</label>
              <input type="text" id="disciplina" name="disciplina" value={studentData.disciplina} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dificuldades">Necessidades/Dificuldades Observadas</label>
            <textarea id="dificuldades" name="dificuldades" rows="4" value={studentData.dificuldades} onChange={handleChange} required></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="objetivos">Objetivos de Aprendizagem Desejados</label>
            <textarea id="objetivos" name="objetivos" rows="4" value={studentData.objetivos} onChange={handleChange} required></textarea>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Gerando PEI...' : 'Gerar PEI'}
          </button>
        </form>

        <div className="result-box">
          {error && <div className="error">Ocorreu um erro: {error}</div>}

          {peiContent ? (
            <div>
              <h2 className="result-title">PEI Gerado</h2>
              <div
                className="pei-content"
                dangerouslySetInnerHTML={{ __html: peiContent.replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>').replace(/\n/g, '<br/>') }}
              />
              <div className="actions">
                <button onClick={copyToClipboard} className="btn-secondary">Copiar Texto</button>
                <button onClick={downloadPEI} className="btn-success">Baixar PEI</button>
              </div>
            </div>
          ) : (
            <p className="placeholder">Preencha o formulário e clique em "Gerar PEI".</p>
          )}
        </div>
      </div>
    </div>
  );
}