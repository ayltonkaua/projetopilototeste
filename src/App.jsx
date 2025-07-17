import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import JSZip from "jszip"; // Importe JSZip
import { saveAs } from "file-saver"; // Importe saveAs do file-saver (certifique-se de instalar com `npm install jszip file-saver`)

// Componente de Loading Visual
const LoadingAnimation = () => {
  const [codeLines, setCodeLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);

  const exampleLines = [
    "<!DOCTYPE html>",
    "<html lang='pt-BR'>",
    "<head>",
    "  <meta charset='UTF-8'>",
    "  <title>Projeto Gerado</title>",
    "  <style>",
    "    body { font-family: Arial; }",
    "    .container { margin: auto; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <div class='container'>",
    "    <h1>Olá Mundo!</h1>",
    "  </div>",
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
        <span className="text-gray-500 ml-2">Isto é apenas uma animação, o código real está sendo gerado!</span>
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
      'md': '📝',
      'txt': '📄',
      'xml': '⚙️',
      'yml': '📝',
      'yaml': '📝',
      'svg': '🖼️',
      'vue': '💚',
      'jsonc': '📋'
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
    </div> // Corrigido de `</b>` para `</div>`
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
      'yaml': 'yaml',
      'svg': 'xml', // SVG é XML
      'vue': 'html', // Arquivos Vue podem ser tratados como HTML ou com plugin específico no Monaco
      'jsonc': 'json' // JSON com comentários
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
      alert('Nenhum arquivo HTML encontrado para preview. O preview só funciona com projetos que contenham um arquivo HTML.');
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
          // Se não houver </head>, adicione no início do HTML
          htmlContent = `<style>${cssContent}</style>\n${htmlContent}`;
        }
      }
      // Apenas injeta JS se não for de node_modules ou um arquivo de framework complexo
      if (fileName.endsWith('.js') && !fileName.includes('node_modules') && !fileName.includes('package.json')) {
        const jsContent = files[fileName];
        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace(
            '</body>',
            `<script>${jsContent}</script></body>`
          );
        } else {
          // Se não houver </body>, adicione no final do HTML
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

  // Função para baixar todos os arquivos como ZIP (MELHORADO)
  const downloadAllFiles = async () => {
    if (!files) return;

    const zip = new JSZip();

    Object.keys(files).forEach(fileName => {
      // Aqui você pode adicionar lógica para criar pastas se os nomes de arquivo contiverem caminhos
      // Por exemplo: zip.file("src/components/MyComponent.js", files[fileName]);
      zip.file(fileName, files[fileName]);
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "projeto.zip");
    } catch (err) {
      setError(`Erro ao gerar o ZIP: ${err.message}`);
      console.error('Erro ao gerar o ZIP:', err);
    }
  };

  // Função melhorada para extrair arquivos da resposta da IA
  const extractFilesFromResponse = (content) => {
    const files = {};
    
    try {
      // Tentar extrair JSON primeiro (formato preferido e obrigatório da IA)
      // Aumenta a rigidez para extrair apenas o JSON principal
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonString = content.substring(jsonStart, jsonEnd + 1);
        try {
          const parsed = JSON.parse(jsonString);
          let validFilesCount = 0;

          for (const [key, value] of Object.entries(parsed)) {
            // Validação mais robusta: chave é string e contém ponto (para extensão), valor é string e tem tamanho mínimo
            if (typeof key === 'string' && key.includes('.') && key.length > 2 &&
                typeof value === 'string' && value.trim().length > 10) { // Aumentado para 10 caracteres
              files[key] = value;
              validFilesCount++;
            } else {
                console.warn(`Chave/valor inválido no JSON: ${key}: ${value?.substring(0, 50)}...`);
            }
          }

          if (validFilesCount > 0) {
            console.log("Arquivos extraídos via JSON:", Object.keys(files));
            return files;
          }
        } catch (e) {
          console.warn("Erro ao parsear JSON. Tentando extração por blocos de código.", e);
          setError('Erro ao parsear a resposta da IA como JSON. Tentando modo de compatibilidade...');
        }
      } else {
        console.warn("Nenhum objeto JSON principal encontrado na resposta. Tentando extração por blocos de código.");
        setError('A resposta da IA não contém um objeto JSON válido. Tentando extração por blocos de código...');
      }

      // Fallback para extrair blocos de código com nomes de arquivo
      const codeBlockPattern = /```(?:[a-zA-Z0-9_\-\.]+\n)?([\s\S]*?)```/g; // Ajustado para capturar o nome do arquivo após ``` opcionalmente
      let match;
      let fallbackFiles = {}; // Usar um objeto temporário para fallbacks
      let blockIndex = 0;

      while ((match = codeBlockPattern.exec(content)) !== null) {
        const fullBlock = match[0];
        const codeContent = match[1].trim(); // Conteúdo dentro do bloco de código

        if (codeContent.length < 20) continue; // Ignora blocos muito pequenos

        const lines = fullBlock.split('\n');
        let fileName = null;

        // Tentar extrair nome do arquivo da primeira linha do bloco (após ```linguagem)
        const firstLineAfterTicks = lines[0].replace(/```(\w+)?/, '').trim();
        const fileNamePattern = /([a-zA-Z0-9_\-\.\/]+\.(html|css|js|jsx|ts|tsx|py|php|java|cpp|c|json|md|xml|yml|yaml|svg|vue|jsonc))/i;
        let fileMatch = firstLineAfterTicks.match(fileNamePattern);
        if (fileMatch) {
          fileName = fileMatch[1];
        } else {
          // Se não encontrou nome na primeira linha, tentar inferir pelo conteúdo do código
          const lowerCodeContent = codeContent.toLowerCase();
          if (lowerCodeContent.includes('<!doctype') || lowerCodeContent.includes('<html')) {
            fileName = `index${blockIndex > 0 ? blockIndex : ''}.html`;
          } else if (lowerCodeContent.includes('body {') || lowerCodeContent.includes('@media')) {
            fileName = `styles${blockIndex > 0 ? blockIndex : ''}.css`;
          } else if (lowerCodeContent.includes('function') || lowerCodeContent.includes('const ') || lowerCodeContent.includes('let ') || lowerCodeContent.includes('import ') || lowerCodeContent.includes('export ')) {
            fileName = `script${blockIndex > 0 ? blockIndex : ''}.js`;
          } else if (lowerCodeContent.includes('def ') || lowerCodeContent.includes('class ')) {
            fileName = `main${blockIndex > 0 ? blockIndex : ''}.py`;
          } else {
            fileName = `arquivo${blockIndex + 1}.txt`;
          }
        }
        
        if (fileName) {
            fallbackFiles[fileName] = codeContent;
            blockIndex++;
        }
      }

      // Se encontrou arquivos via fallback de blocos de código, use-os
      if (Object.keys(fallbackFiles).length > 0) {
        console.log("Arquivos extraídos via blocos de código:", Object.keys(fallbackFiles));
        return fallbackFiles;
      }

      // Se ainda não encontrou, tentar extrair código inline (último recurso)
      if (Object.keys(files).length === 0) {
        console.warn("Nenhum arquivo extraído via JSON ou blocos de código. Tentando extração de código inline.");
        setError('Não foi possível extrair arquivos no formato JSON ou blocos de código. Tentando extrair código inline...');

        const htmlMatch = content.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
        if (htmlMatch) {
          files['index.html'] = htmlMatch[0];
        }
        
        const cssMatch = content.match(/(?:\/\*[\s\S]*?\*\/\s*)?[a-zA-Z\.\#][^{]*\{[\s\S]*?\}/g);
        if (cssMatch && cssMatch.length > 0) {
          files['styles.css'] = cssMatch.join('\n\n');
        }
        
        const jsMatch = content.match(/(?:function|const|let|var|import|export)[\s\S]*?[;}]/g);
        if (jsMatch && jsMatch.length > 0) {
          files['script.js'] = jsMatch.join('\n\n');
        }
      }

      console.log("Arquivos extraídos (final):", Object.keys(files));
      return Object.keys(files).length > 0 ? files : null;
      
    } catch (error) {
      console.error("Erro fatal na extração:", error);
      setError(`Erro inesperado ao processar a resposta da IA: ${error.message}`);
      return null;
    }
  };

  async function gerarProjeto() {
    // Verificar se a API key está configurada
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      setError('Por favor, configure sua API key da Groq no arquivo .env (ex: VITE_GROQ_API_KEY=sua_chave_aqui)');
      return;
    }

    setLoading(true);
    setResponseText("");
    setFiles(null);
    setSelectedFile(null);
    setError(null);
    setShowPreview(false);

    try {
      const response = await fetch("[https://api.groq.com/openai/v1/chat/completions](https://api.groq.com/openai/v1/chat/completions)", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Modelo da Groq
          messages: [
            {
              role: "system",
              content: `Você é um especialista em desenvolvimento web e um gerador de código.
              Sua **única e exclusiva tarefa** é gerar o código-fonte de um projeto web **completo e funcional**.
              Você **DEVE retornar APENAS e SOMENTE UM OBJETO JSON válido**.
              **NÃO INCLUA NENHUM TEXTO ANTES, DEPOIS OU FORA DO OBJETO JSON.**
              O formato do JSON é **RIGOROSAMENTE**:
              \`\`\`json
              {
                "nome_do_arquivo.extensao": "conteúdo completo do arquivo escapado",
                "pasta/outro_arquivo.extensao": "conteúdo completo do outro arquivo escapado"
              }
              \`\`\`

              **REGRAS CRÍTICAS PARA O FORMATO E CONTEÚDO:**
              - As **chaves do JSON DEVEM ser os nomes completos e válidos dos arquivos**, incluindo a extensão (ex: "index.html", "styles.css", "script.js", "src/App.js", "public/manifest.json").
              - Os **valores DEVEM ser o conteúdo COMPLETO e EXATO do código de cada arquivo**.
              - **Todas as aspas duplas (") internas ao conteúdo do código devem ser escapadas com barra invertida dupla (\\\\")** para manter o JSON válido.
              - **Caracteres de nova linha no conteúdo do código DEVEM ser escapados com \\\\n.**
              - Garanta que o HTML seja completo (incluindo \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`).
              - Inclua todos os arquivos necessários para que o projeto seja funcional (HTML, CSS, JavaScript, etc.).
              - Adicione comentários explicativos e boas práticas de código quando apropriado.
              - Se o projeto exigir múltiplos arquivos JS, separe-os apropriadamente e referencie-os no HTML ou use módulos.
              - Para projetos simples de HTML/CSS/JS, inclua \`index.html\`, \`styles.css\` e \`script.js\`.
              - **NÃO ENVOLVA O JSON EM BLOCOS DE CÓDIGO MARKDOWN (\`\`\`json\`\`\`)**. Apenas o JSON puro.
              - **NÃO ADICIONE QUALQUER EXPLICAÇÃO OU CONVERSAÇÃO.** APENAS O JSON.
              `
            },
            {
              role: "user",
              content: `Crie um projeto web completo e funcional: ${prompt}
              Lembre-se: Retorne APENAS um objeto JSON válido e completo com todos os arquivos do projeto. Sem texto extra.`
            },
          ],
          response_format: { type: "json_object" } // Informa explicitamente à API para retornar JSON
        }),
      });

      if (!response.ok) {
        let errorBody = await response.text(); // Tenta ler o corpo do erro
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}. Detalhes: ${errorBody}`);
      }

      const data = await response.json();
      // Considerando que a API é instruída a retornar JSON, o content já deve ser o JSON
      const content = data.choices[0]?.message?.content || "";

      setResponseText(content); // Mantém para debug se necessário

      // Extrair arquivos da resposta
      const extractedFiles = extractFilesFromResponse(content);
      if (extractedFiles && Object.keys(extractedFiles).length > 0) {
        setFiles(extractedFiles);
        setSelectedFile(Object.keys(extractedFiles)[0]);
      } else {
        setError(`Não foi possível extrair arquivos da resposta da IA.
                  Isso pode ocorrer se a IA não seguir o formato JSON obrigatório.
                  Verifique o console para mais detalhes ou tente reformular seu prompt.`);
      }
    } catch (err) {
      console.error('Erro ao gerar projeto:', err);
      setError(`Erro ao gerar projeto: ${err.message}. Verifique sua chave da API ou a conexão.`);
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
          🤖 CodeBuddy IA - Gerador de Projetos v2.1
        </b>
        
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
                  </b>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadAllFiles}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      📥 Download Zip
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
                </b>
                
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
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">🖥️</div>
                        {files && Object.keys(files).some(name => name.endsWith('.html')) ? (
                          <div>
                            <p className="mb-3">{"Clique para ver seu projeto!"}</p>
                            <button
                              onClick={generatePreview}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              🚀 Abrir Preview
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-center">
                            {"Preview disponível apenas para"}<br />
                            {"projetos com um arquivo HTML."}<br/>
                            {"O preview não suporta recursos externos ou frameworks complexos."}
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
              <p className="mb-6 text-lg">{"Descreva o projeto que você quer criar e veja a mágica acontecer."}</p>
              <div className="text-sm text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="mb-2">💡 <strong>{"Exemplos de projetos:"}</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div>{"\"Uma calculadora colorida\""}</div>
                  <div>{"\"Site de portfólio pessoal\""}</div>
                  <div>{"\"Jogo da velha interativo\""}</div>
                  <div>{"\"Landing page de restaurante\""}</div>
                  <div>{"\"App de lista de tarefas\""}</div>
                  <div>{"\"Galeria de fotos responsiva\""}</div>
                </div>
                <p className="mt-4 text-gray-500">
                    {"Dica: Seja o mais específico possível no seu prompt para obter melhores resultados!"}<br/>
                    {"Por exemplo: \"Um jogo da velha responsivo com JavaScript puro, com um placar, um botão de reset e animações suaves para a vitória.\""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
