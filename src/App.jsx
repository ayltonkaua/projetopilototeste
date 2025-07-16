import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [files, setFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Função para detectar a linguagem do arquivo
  const detectLanguage = (fileName, content) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap = {
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'py': 'python',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'md': 'markdown',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[extension] || 'plaintext';
  };

  // Função para gerar preview do projeto
  const generatePreview = () => {
    if (!files) return;

    // Procurar por arquivo HTML principal
    const htmlFiles = Object.keys(files).filter(name => 
      name.toLowerCase().includes('index.html') || 
      name.toLowerCase().endsWith('.html')
    );
    
    if (htmlFiles.length === 0) {
      alert('Nenhum arquivo HTML encontrado para preview');
      return;
    }

    const mainHtml = htmlFiles[0];
    let htmlContent = files[mainHtml];

    // Injetar CSS e JS inline se existirem
    Object.keys(files).forEach(fileName => {
      if (fileName.endsWith('.css')) {
        const cssContent = files[fileName];
        if (htmlContent.includes('</head>')) {
          htmlContent = htmlContent.replace(
            '</head>',
            `<style>${cssContent}</style></head>`
          );
        } else {
          htmlContent = `<style>${cssContent}</style>\n${htmlContent}`;
        }
      }
      if (fileName.endsWith('.js') && !fileName.includes('node_modules')) {
        const jsContent = files[fileName];
        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace(
            '</body>',
            `<script>${jsContent}</script></body>`
          );
        } else {
          htmlContent = `${htmlContent}\n<script>${jsContent}</script>`;
        }
      }
    });

    // Criar blob URL para o preview
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Função para baixar arquivo individual
  const downloadFile = (fileName, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para baixar todos os arquivos como ZIP
  const downloadAllFiles = async () => {
    if (!files) return;

    // Para simplicidade, vamos criar um arquivo com todos os códigos
    let allContent = "# Projeto Gerado pela IA\n\n";
    
    Object.keys(files).forEach(fileName => {
      allContent += `## ${fileName}\n\n\`\`\`${detectLanguage(fileName, files[fileName])}\n${files[fileName]}\n\`\`\`\n\n`;
    });

    downloadFile('projeto-completo.md', allContent);
  };

  // Melhorar extração de arquivos da resposta da IA
  const extractFilesFromResponse = (content) => {
    const files = {};
    
    // Tentar extrair JSON primeiro - melhorar a regex
    const jsonMatches = content.match(/\{[\s\S]*?"[^"]*\.(html|css|js|jsx|ts|tsx|py|php|java|cpp|c|json|md)"[\s\S]*?\}/g);
    if (jsonMatches) {
      for (const jsonMatch of jsonMatches) {
        try {
          const parsed = JSON.parse(jsonMatch);
          // Verificar se é um objeto com arquivos válidos
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof key === 'string' && typeof value === 'string' && 
                key.includes('.') && value.trim().length > 10) {
              files[key] = value;
            }
          }
          if (Object.keys(files).length > 0) {
            return files;
          }
        } catch (e) {
          console.log("JSON parse failed:", e.message);
        }
      }
    }

    // Extrair blocos de código com nomes de arquivo
    const codeBlocks = content.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block, index) => {
        const lines = block.split('\n');
        const firstLine = lines[0];
        
        // Tentar extrair nome do arquivo da primeira linha
        let fileName = `arquivo${index + 1}`;
        
        // Procurar por extensões comuns na primeira linha
        const fileNameMatch = firstLine.match(/[\w\-\.]+\.(html|css|js|jsx|ts|tsx|py|php|java|cpp|c|json|md)/i);
        if (fileNameMatch) {
          fileName = fileNameMatch[0];
        } else {
          // Detectar baseado no tipo de código
          const cleanFirstLine = firstLine.toLowerCase();
          if (cleanFirstLine.includes('html')) {
            fileName = 'index.html';
          } else if (cleanFirstLine.includes('css')) {
            fileName = 'styles.css';
          } else if (cleanFirstLine.includes('js') || cleanFirstLine.includes('javascript')) {
            fileName = 'script.js';
          } else if (cleanFirstLine.includes('python') || cleanFirstLine.includes('py')) {
            fileName = 'main.py';
          }
        }

        const code = lines.slice(1, -1).join('\n');
        if (code.trim() && code.length > 10) {
          files[fileName] = code;
        }
      });
    }

    return Object.keys(files).length > 0 ? files : null;
  };

  async function gerarProjeto() {
    // Verificar se a API key está configurada
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      setError('Por favor, configure sua API key da Groq no arquivo .env');
      return;
    }

    setLoading(true);
    setResponseText("");
    setFiles(null);
    setSelectedFile(null);
    setError(null);
    setShowPreview(false);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Modelo correto da Groq
          messages: [
            {
              role: "system",
              content: "Você é um especialista em desenvolvimento web. Sempre que gerar código, forneça arquivos completos e funcionais organizados em um JSON válido. Use nomes de arquivo apropriados e inclua comentários explicativos."
            },
            {
              role: "user",
              content: `Crie um projeto web completo e funcional: ${prompt}

Requisitos importantes:
- Forneça arquivos completos (HTML, CSS, JS se necessário)
- Use nomes de arquivo apropriados (index.html, styles.css, script.js)
- Inclua comentários explicativos no código
- Certifique-se de que o código seja funcional e bem estruturado

Formato de resposta OBRIGATÓRIO - retorne APENAS o JSON:
{
  "index.html": "<!DOCTYPE html>\\n<html>\\n<head>\\n...",
  "styles.css": "/* Estilos para o projeto */\\nbody { ... }",
  "script.js": "// JavaScript funcional\\nfunction init() { ... }"
}`,
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

      // Extrair arquivos da resposta
      const extractedFiles = extractFilesFromResponse(content);
      if (extractedFiles) {
        setFiles(extractedFiles);
        if (Object.keys(extractedFiles).length > 0) {
          setSelectedFile(Object.keys(extractedFiles)[0]);
        }
      } else {
        setError('Não foi possível extrair arquivos da resposta da IA. Tente reformular seu prompt.');
      }
    } catch (err) {
      console.error('Erro ao gerar projeto:', err);
      setError(`Erro ao gerar projeto: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Cleanup do preview URL quando componente desmonta
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          🤖 CodeBuddy IA - Gerador de Projetos v2.0
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Uma landing page responsiva para uma pizzaria, um jogo da velha, uma calculadora..."
              className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && !loading && gerarProjeto()}
            />
            <button
              onClick={gerarProjeto}
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? "🔄 Gerando..." : "✨ Gerar"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              ❌ {error}
            </div>
          )}
        </div>

        {responseText && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              📝 Resposta da IA
            </h2>
            <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto max-h-96 text-sm text-gray-800 dark:text-gray-200">
              {responseText}
            </pre>
          </div>
        )}

        {files && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seção de arquivos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  📁 Arquivos Gerados ({Object.keys(files).length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadAllFiles}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    📥 Download Todos
                  </button>
                  {Object.keys(files).some(name => name.endsWith('.html')) && (
                    <button
                      onClick={generatePreview}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                    >
                      👁️ Preview
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {Object.keys(files).map((fileName) => (
                  <div key={fileName} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedFile(fileName)}
                      className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                        selectedFile === fileName
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      📄 {fileName}
                    </button>
                    <button
                      onClick={() => downloadFile(fileName, files[fileName])}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Download arquivo"
                    >
                      ⬇️
                    </button>
                  </div>
                ))}
              </div>

              {selectedFile && (
                <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                      {selectedFile} • {detectLanguage(selectedFile, files[selectedFile])}
                    </span>
                  </div>
                  <Editor
                    height="400px"
                    language={detectLanguage(selectedFile, files[selectedFile])}
                    theme="vs-dark"
                    value={files[selectedFile]}
                    options={{
                      readOnly: false,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true
                    }}
                    onChange={(value) => {
                      setFiles(prev => ({
                        ...prev,
                        [selectedFile]: value
                      }));
                    }}
                  />
                </div>
              )}
            </div>

            {/* Seção de preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                🌐 Preview do Projeto
              </h2>
              
              {showPreview && previewUrl ? (
                <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600 flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      🚀 Projeto em execução
                    </span>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  <iframe
                    src={previewUrl}
                    className="w-full h-96 border-0"
                    title="Preview do projeto"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-4">🖥️</div>
                    <p className="mb-4">Clique em "Preview" para ver seu projeto funcionando!</p>
                    {files && Object.keys(files).some(name => name.endsWith('.html')) ? (
                      <button
                        onClick={generatePreview}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        🚀 Abrir Preview
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400">
                        (Preview disponível apenas para projetos com arquivos HTML)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!files && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Pronto para começar!</h3>
              <p className="mb-4">Descreva o projeto que você quer criar e veja a mágica acontecer.</p>
              <div className="text-sm text-gray-400">
                <p>💡 Exemplos: "Uma calculadora colorida", "Site de portfólio", "Jogo da velha"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
