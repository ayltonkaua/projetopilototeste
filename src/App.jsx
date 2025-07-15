import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [files, setFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  async function gerarProjeto() {
    setLoading(true);
    setResponseText("");
    setFiles(null);
    setSelectedFile(null);
    setError(null);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: `Gere os arquivos de um projeto com: ${prompt}. Pode responder com texto e JSON misturados.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || "";

      setResponseText(content);

      // Extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}$/m);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          setFiles(parsed);
          if (Object.keys(parsed).length > 0) {
            setSelectedFile(Object.keys(parsed)[0]);
          }
        } catch (e) {
          console.error("Erro ao parsear JSON:", e);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Gerador de Projetos IA
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva seu projeto..."
              className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={gerarProjeto}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "Gerando..." : "Gerar"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {responseText && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Resposta da IA
            </h2>
            <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto max-h-96 text-sm text-gray-800 dark:text-gray-200">
              {responseText}
            </pre>
          </div>
        )}

        {files && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Arquivos Gerados
            </h2>
            
            <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
              {Object.keys(files).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedFile === fileName
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            {selectedFile && (
              <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
                <Editor
                  height="400px"
                  defaultLanguage="html"
                  theme="vs-dark"
                  value={files[selectedFile]}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on"
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
