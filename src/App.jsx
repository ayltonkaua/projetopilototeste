import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

// Componente de Loading Visual
const LoadingAnimation = () => {
  const [codeLines, setCodeLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);

  const exampleLines = [
    "<!DOCTYPE html>",
    "<html lang='pt-BR'>",
    "<head>",
    "  <meta charset='UTF-8'>",
    "  <title>Projeto Gerado</title>",
    "  <style>",
    "    body { font-family: Arial; }",
    "    .container { margin: auto; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <div class='container'>",
    "    <h1>Olá Mundo!</h1>",
    "  </div>",
    "</body>",
    "</html>"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        if (prev < exampleLines.length - 1) {
          setCodeLines((prevLines) => [...prevLines, exampleLines[prev]]);
          return prev + 1;
        } else {
          // Reinicia a animação
          setCodeLines([]);
          return 0;
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm">
      <div className="flex items-center mb-4">
        <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full mr-3"></div>
        <span className="text-white">Estamos criando as linhas de código, aguarde...</span>
      </div>
      <div className="bg-black rounded p-4 max-h-64 overflow-auto">
        {codeLines.map((line, index) => (
          <div key={index} className="flex items-center animate-fadeIn">
            <span className="text-gray-500 w-8 text-right mr-3">{index + 1}</span>
            <span className="typing-animation">{line}</span>
          </div>
        ))}
        {codeLines.length > 0 && (
          <div className="flex items-center">
            <span className="text-gray-500 w-8 text-right mr-3">{codeLines.length + 1}</span>
            <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

// Componente do Menu Lateral de Arquivos
const FileExplorer = ({ files, selectedFile, onSelectFile, onDownloadFile }) => {
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons = {
      'html': '🌐',
      'css': '🎨',
      'js': '⚡',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '📘',
      'json': '📋',
      'py': '🐍',
      'php': '🐘',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'md': '📝'
    };
    return icons[ext] || '📄';
  };

  const getFileSize = (content) => {
    const bytes = new Blob([content]).size;
    return bytes < 1024 ? `${bytes}B` : `${(bytes / 1024).toFixed(1)}KB`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          📁 Explorador de Arquivos
          <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {Object.keys(files).length}
          </span>
        </h3>
      </div>
      <div className="p-2">
        {Object.keys(files).map((fileName) => (
          <div
            key={fileName}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${
              selectedFile === fileName
                ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSelectFile(fileName)}
          >
            <div className="flex items-center flex-1 min-w-0">
              <span className="text-xl mr-3">{getFileIcon(fileName)}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fileName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getFileSize(files[fileName])}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownloadFile(fileName, files[fileName]);
              }}
              className="ml-2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Download arquivo"
            >
              ⬇️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

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

  // Função melhorada para extrair arquivos da resposta da IA
  const extractFilesFromResponse = (content) => {
    const files = {};
    
    try {
      // 1. Tentar extrair JSON primeiro (formato preferido)
      const jsonPattern = /\{[\s\S]*?\}/g;
      const jsonMatches = content.match(jsonPattern);
      
      if (jsonMatches) {
        for (const jsonMatch of jsonMatches) {
          try {
            const parsed = JSON.parse(jsonMatch);
            let validFiles = 0;
            
            // Verificar se é um objeto com arquivos válidos
            for (const [key, value] of Object.entries(parsed)) {
              if (typeof key === 'string' && typeof value === 'string' && 
                  key.includes('.') && value.trim().length > 20) {
                files[key] = value;
                validFiles++;
              }
            }
            
            // Se encontrou arquivos válidos, retornar
            if (validFiles > 0) {
              console.log("Arquivos extraídos via JSON:", Object.keys(files));
              return files;
            }
          } catch (e) {
            // Continuar tentando outros JSONs
            continue;
          }
        }
      }

      // 2. Extrair blocos de código com nomes de arquivo
      const codeBlockPattern = /```[\s\S]*?```/g;
      const codeBlocks = content.match(codeBlockPattern);
      
      if (codeBlocks) {
        codeBlocks.forEach((block, index) => {
          const lines = block.split('\n');
          const firstLine = lines[0];
          
          // Tentar extrair nome do arquivo da primeira linha ou linha seguinte
          let fileName = null;
          
          // Procurar por padrões de nome de arquivo
          const filePatterns = [
            /([a-zA-Z0-9_\-\.]+\.(html|css|js|jsx|ts|tsx|py|php|java|cpp|c|json|md))/i,
            /(?:arquivo|file|nome|name):\s*([a-zA-Z0-9_\-\.]+\.(html|css|js|jsx|ts|tsx|py|php|java|cpp|c|json|md))/i
          ];
          
          for (let i = 0; i < Math.min(3, lines.length); i++) {
            for (const pattern of filePatterns) {
              const match = lines[i].match(pattern);
              if (match) {
                fileName = match[1];
                break;
              }
            }
            if (fileName) break;
          }
          
          // Se não encontrou nome, tentar detectar baseado no conteúdo
          if (!fileName) {
            const codeContent = lines.slice(1, -1).join('\n').toLowerCase();
            if (codeContent.includes('<!doctype') || codeContent.includes('<html')) {
              fileName = `index${index > 0 ? index : ''}.html`;
            } else if (codeContent.includes('body {') || codeContent.includes('@media')) {
              fileName = `styles${index > 0 ? index : ''}.css`;
            } else if (codeContent.includes('function') || codeContent.includes('const ') || codeContent.includes('let ')) {
              fileName = `script${index > 0 ? index : ''}.js`;
            } else if (codeContent.includes('def ') || codeContent.includes('import ')) {
              fileName = `main${index > 0 ? index : ''}.py`;
            } else {
              fileName = `arquivo${index + 1}.txt`;
            }
          }

          const code = lines.slice(1, -1).join('\n').trim();
          if (code && code.length > 20) {
            files[fileName] = code;
          }
        });
      }

      // 3. Se ainda não encontrou, tentar extrair código inline
      if (Object.keys(files).length === 0) {
        // Procurar por padrões de HTML, CSS, JS inline
        const htmlMatch = content.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
        if (htmlMatch) {
          files['index.html'] = htmlMatch[0];
        }
        
        const cssMatch = content.match(/(?:\/\*[\s\S]*?\*\/\s*)?[a-zA-Z\.\#][^{]*\{[\s\S]*?\}/g);
        if (cssMatch && cssMatch.length > 0) {
          files['styles.css'] = cssMatch.join('\n\n');
        }
        
        const jsMatch = content.match(/(?:function|const|let|var)[\s\S]*?[;}]/g);
        if (jsMatch && jsMatch.length > 0) {
          files['script.js'] = jsMatch.join('\n\n');
        }
      }

      console.log("Arquivos extraídos:", Object.keys(files));
      return Object.keys(files).length > 0 ? files : null;
      
    } catch (error) {
      console.error("Erro na extração:", error);
      return null;
    }
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
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: `Você é um especialista em desenvolvimento web. Sempre forneça código completo e funcional em formato JSON válido.

FORMATO OBRIGATÓRIO de resposta:
{
  "index.html": "código HTML completo aqui",
  "styles.css": "código CSS completo aqui",
  "script.js": "código JavaScript completo aqui"
}

REGRAS IMPORTANTES:
- Sempre retorne um JSON válido com os arquivos
- Use nomes de arquivo apropriados
- Inclua código completo e funcional
- Adicione comentários explicativos
- Escape aspas dentro das strings com \\"`
            },
            {
              role: "user",
              content: `Crie um projeto web completo e funcional: ${prompt}

Retorne APENAS um JSON válido no formato:
{
  "index.html": "<!DOCTYPE html>\\n<html>...",
  "styles.css": "/* CSS */\\nbody { ... }",
  "script.js": "// JavaScript\\nfunction init() { ... }"
}`
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
      if (extractedFiles && Object.keys(extractedFiles).length > 0) {
        setFiles(extractedFiles);
        setSelectedFile(Object.keys(extractedFiles)[0]);
      } else {
        setError('Não foi possível extrair arquivos da resposta da IA. A IA pode não ter seguido o formato correto. Tente reformular seu prompt ou seja mais específico.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🤖 CodeBuddy IA - Gerador de Projetos v2.0
        </h1>
        
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Uma landing page responsiva para uma pizzaria, um jogo da velha, uma calculadora..."
              className="flex-1 p-4 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyPress={(e) => e.key === 'Enter' && !loading && gerarProjeto()}
            />
            <button
              onClick={gerarProjeto}
              disabled={loading || !prompt.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transform hover:scale-105"
            >
              {loading ? "🔄 Gerando..." : "✨ Gerar Projeto"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-xl border border-red-200 dark:border-red-800">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="mb-8">
            <LoadingAnimation />
          </div>
        )}

        {/* Files Layout */}
        {files && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
            {/* File Explorer - Left Sidebar */}
            <div className="col-span-3">
              <FileExplorer
                files={files}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
                onDownloadFile={downloadFile}
              />
            </div>

            {/* Code Editor - Center */}
            <div className="col-span-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl h-full border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                    💻 Editor de Código
                    {selectedFile && (
                      <span className="ml-3 text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                        {selectedFile}
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadAllFiles}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      📥 Download Todos
                    </button>
                    {Object.keys(files).some(name => name.endsWith('.html')) && (
                      <button
                        onClick={generatePreview}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        👁️ Preview
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="h-[calc(100%-80px)]">
                  {selectedFile ? (
                    <Editor
                      height="100%"
                      language={detectLanguage(selectedFile, files[selectedFile])}
                      theme="vs-dark"
                      value={files[selectedFile]}
                      options={{
                        readOnly: false,
                        minimap: { enabled: true },
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
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📄</div>
                        <p>Selecione um arquivo para editar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview - Right Panel */}
            <div className="col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl h-full border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    🌐 Preview
                  </h3>
                </div>
                
                <div className="h-[calc(100%-80px)] p-4">
                  {showPreview && previewUrl ? (
                    <div className="h-full border rounded-lg overflow-hidden">
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Preview do projeto"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">🖥️</div>
                        {files && Object.keys(files).some(name => name.endsWith('.html')) ? (
                          <div>
                            <p className="mb-3">Clique para ver seu projeto!</p>
                            <button
                              onClick={generatePreview}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              🚀 Abrir Preview
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm">
                            Preview disponível para<br />projetos com HTML
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Screen */}
        {!files && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400">
              <div className="text-8xl mb-6">🎯</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Pronto para começar!</h3>
              <p className="mb-6 text-lg">Descreva o projeto que você quer criar e veja a mágica acontecer.</p>
              <div className="text-sm text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="mb-2">💡 <strong>Exemplos de projetos:</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div>"Uma calculadora colorida"</div>
                  <div>"Site de portfólio pessoal"</div>
                  <div>"Jogo da velha interativo"</div>
                  <div>"Landing page de restaurante"</div>
                  <div>"App de lista de tarefas"</div>
                  <div>"Galeria de fotos responsiva"</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
