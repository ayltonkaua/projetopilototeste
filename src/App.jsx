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
  const [previewType, setPreviewType] = useState("html");
  const [previewContent, setPreviewContent] = useState("");

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

  // Função para detectar o tipo de projeto
  const detectProjectType = () => {
    if (!files) return null;
    
    const fileNames = Object.keys(files);
    const extensions = fileNames.map(name => name.split('.').pop()?.toLowerCase());
    
    // Prioridade de detecção
    if (extensions.includes('html')) return 'web';
    if (extensions.includes('jsx') || extensions.includes('tsx')) return 'react';
    if (extensions.includes('py')) return 'python';
    if (extensions.includes('js') && !extensions.includes('html')) return 'javascript';
    if (extensions.includes('java')) return 'java';
    if (extensions.includes('cpp') || extensions.includes('c')) return 'cpp';
    if (extensions.includes('css') && fileNames.length === 1) return 'css';
    if (extensions.includes('json')) return 'json';
    if (extensions.includes('md')) return 'markdown';
    
    return 'generic';
  };

  // Função para gerar preview baseado no tipo de projeto
  const generatePreview = () => {
    if (!files) return;

    const projectType = detectProjectType();
    setPreviewType(projectType);

    switch (projectType) {
      case 'web':
        generateWebPreview();
        break;
      case 'react':
        generateReactPreview();
        break;
      case 'python':
        generatePythonPreview();
        break;
      case 'javascript':
        generateJavaScriptPreview();
        break;
      case 'css':
        generateCSSPreview();
        break;
      case 'json':
        generateJSONPreview();
        break;
      case 'markdown':
        generateMarkdownPreview();
        break;
      case 'java':
      case 'cpp':
      default:
        generateGenericPreview();
        break;
    }
  };

  // Preview para projetos web (HTML/CSS/JS)
  const generateWebPreview = () => {
    const htmlFiles = Object.keys(files).filter(name => name.toLowerCase().endsWith('.html'));
    
    if (htmlFiles.length === 0) {
      // Criar HTML básico se não existir
      let htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview do Projeto</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>`;

      // Injetar CSS e JS
      Object.keys(files).forEach(fileName => {
        if (fileName.endsWith('.css')) {
          htmlContent = htmlContent.replace('</head>', `<style>${files[fileName]}</style></head>`);
        }
        if (fileName.endsWith('.js')) {
          htmlContent = htmlContent.replace('</body>', `<script>${files[fileName]}</script></body>`);
        }
      });

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
      return;
    }

    const mainHtml = htmlFiles[0];
    let htmlContent = files[mainHtml];

    // Injetar CSS e JS inline se existirem
    Object.keys(files).forEach(fileName => {
      if (fileName.endsWith('.css')) {
        const cssContent = files[fileName];
        htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
      }
      if (fileName.endsWith('.js') && !fileName.includes('node_modules')) {
        const jsContent = files[fileName];
        htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);
      }
    });

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Preview para React/JSX
  const generateReactPreview = () => {
    const jsxFiles = Object.keys(files).filter(name => name.endsWith('.jsx') || name.endsWith('.tsx'));
    
    if (jsxFiles.length === 0) return;

    const mainComponent = files[jsxFiles[0]];
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .preview-container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${mainComponent}
        
        // Tentar renderizar o componente principal
        const componentName = Object.keys(window).find(key => 
            typeof window[key] === 'function' && 
            key !== 'React' && 
            key !== 'ReactDOM'
        );
        
        if (componentName) {
            ReactDOM.render(React.createElement(window[componentName]), document.getElementById('root'));
        } else {
            document.getElementById('root').innerHTML = '<div class="preview-container"><h3>Componente React</h3><pre>' + \`${mainComponent.replace(/`/g, '\\`')}\` + '</pre></div>';
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Preview para Python
  const generatePythonPreview = () => {
    const pythonFiles = Object.keys(files).filter(name => name.endsWith('.py'));
    
    if (pythonFiles.length === 0) return;

    const pythonCode = files[pythonFiles[0]];
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Preview</title>
    <script src="https://cdn.jsdelivr.net/npm/pyodide@0.24.1/pyodide.js"></script>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #1e1e1e; color: #fff; }
        .terminal { background: #000; padding: 20px; border-radius: 8px; min-height: 300px; }
        .code-section { background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .output-section { background: #0f3460; padding: 15px; border-radius: 8px; }
        h3 { color: #4fc3f7; margin-top: 0; }
        pre { margin: 0; white-space: pre-wrap; }
        .loading { color: #ffeb3b; }
    </style>
</head>
<body>
    <div class="code-section">
        <h3>🐍 Código Python:</h3>
        <pre>${pythonCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    
    <div class="output-section">
        <h3>📤 Saída:</h3>
        <div id="output" class="loading">Carregando Pyodide...</div>
    </div>

    <script>
        async function runPython() {
            try {
                const pyodide = await loadPyodide();
                
                // Capturar prints
                let output = '';
                pyodide.runPython(\`
import sys
from io import StringIO
sys.stdout = StringIO()
                \`);
                
                // Executar código
                pyodide.runPython(\`${pythonCode.replace(/`/g, '\\`')}\`);
                
                // Capturar saída
                output = pyodide.runPython("sys.stdout.getvalue()");
                
                document.getElementById('output').innerHTML = output ? 
                    '<pre>' + output + '</pre>' : 
                    '<em style="color: #888;">Código executado sem saída de texto</em>';
                    
            } catch (error) {
                document.getElementById('output').innerHTML = 
                    '<div style="color: #f44336;"><strong>Erro:</strong><br><pre>' + error.toString() + '</pre></div>';
            }
        }
        
        runPython();
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Preview para JavaScript puro
  const generateJavaScriptPreview = () => {
    const jsFiles = Object.keys(files).filter(name => name.endsWith('.js'));
    
    if (jsFiles.length === 0) return;

    const jsCode = files[jsFiles[0]];
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript Preview</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; }
        .code-section { background: #2d2d2d; color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .console-section { background: #000; color: #00ff00; padding: 15px; border-radius: 8px; min-height: 200px; }
        .app-section { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd; }
        h3 { margin-top: 0; }
        pre { margin: 0; white-space: pre-wrap; }
        .console-log { margin: 2px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="code-section">
            <h3>⚡ Código JavaScript:</h3>
            <pre>${jsCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
        
        <div class="app-section">
            <h3>🖥️ Área de Execução:</h3>
            <div id="app">
                <!-- Conteúdo gerado pelo JavaScript aparecerá aqui -->
            </div>
        </div>
        
        <div class="console-section">
            <h3>📊 Console:</h3>
            <div id="console"></div>
        </div>
    </div>

    <script>
        // Interceptar console.log
        const originalLog = console.log;
        const consoleDiv = document.getElementById('console');
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            const logDiv = document.createElement('div');
            logDiv.className = 'console-log';
            logDiv.textContent = '> ' + args.join(' ');
            consoleDiv.appendChild(logDiv);
            consoleDiv.scrollTop = consoleDiv.scrollHeight;
        };
        
        // Interceptar erros
        window.onerror = function(msg, url, line, col, error) {
            const errorDiv = document.createElement('div');
            errorDiv.style.color = '#ff6b6b';
            errorDiv.textContent = '❌ Erro: ' + msg;
            consoleDiv.appendChild(errorDiv);
        };
        
        try {
            // Executar código
            ${jsCode}
        } catch (error) {
            console.log('❌ Erro de execução: ' + error.message);
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Preview para CSS
  const generateCSSPreview = () => {
    const cssFiles = Object.keys(files).filter(name => name.endsWith('.css'));
    
    if (cssFiles.length === 0) return;

    const cssCode = files[cssFiles[0]];
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Preview</title>
    <style>
        ${cssCode}
    </style>
    <style>
        .preview-info { 
            background: #f0f0f0; 
            padding: 15px; 
            margin-bottom: 20px; 
            border-left: 4px solid #2196f3;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div class="preview-info">
        <h3>🎨 Preview dos Estilos CSS</h3>
        <p>Os estilos foram aplicados automaticamente. Elementos de exemplo abaixo:</p>
    </div>
    
    <!-- Elementos de exemplo para mostrar os estilos -->
    <div class="container">
        <h1>Título Principal</h1>
        <h2>Subtítulo</h2>
        <h3>Título Menor</h3>
        
        <p>Este é um parágrafo de exemplo para demonstrar os estilos CSS aplicados.</p>
        
        <div class="card">
            <h4>Card de Exemplo</h4>
            <p>Conteúdo do card</p>
        </div>
        
        <button>Botão de Exemplo</button>
        
        <ul>
            <li>Item de lista 1</li>
            <li>Item de lista 2</li>
            <li>Item de lista 3</li>
        </ul>
        
        <div class="box">Box de exemplo</div>
        
        <form>
            <input type="text" placeholder="Campo de exemplo">
            <textarea placeholder="Área de texto"></textarea>
        </form>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Preview para JSON
  const generateJSONPreview = () => {
    const jsonFiles = Object.keys(files).filter(name => name.endsWith('.json'));
    
    if (jsonFiles.length === 0) return;

    const jsonCode = files[jsonFiles[0]];
    
    try {
      const parsedJson = JSON.parse(jsonCode);
      
      const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Preview</title>
    <style>
        body { font-family: 'Courier New', monospace; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; }
        .json-viewer { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
        .json-formatted { background: #2d2d2d; color: #fff; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .key { color: #e91e63; }
        .string { color: #4caf50; }
        .number { color: #ff9800; }
        .boolean { color: #2196f3; }
        .null { color: #9e9e9e; }
        h3 { margin-top: 0; color: #333; }
        pre { margin: 0; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="json-viewer">
            <h3>📄 Visualizador JSON</h3>
            <div id="json-tree"></div>
        </div>
        
        <div class="json-formatted">
            <h3>🔍 JSON Formatado:</h3>
            <pre>${JSON.stringify(parsedJson, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
    </div>

    <script>
        const data = ${jsonCode};
        
        function createJsonTree(obj, container) {
            const ul = document.createElement('ul');
            
            for (const [key, value] of Object.entries(obj)) {
                const li = document.createElement('li');
                const span = document.createElement('span');
                span.className = 'key';
                span.textContent = key + ': ';
                li.appendChild(span);
                
                if (typeof value === 'object' && value !== null) {
                    li.appendChild(span);
                    createJsonTree(value, li);
                } else {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = typeof value;
                    valueSpan.textContent = JSON.stringify(value);
                    li.appendChild(valueSpan);
                }
                
                ul.appendChild(li);
            }
            
            container.appendChild(ul);
        }
        
        createJsonTree(data, document.getElementById('json-tree'));
    </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      generateGenericPreview();
    }
  };

  // Preview para Markdown
  const generateMarkdownPreview = () => {
    const mdFiles = Object.keys(files).filter(name => name.endsWith('.md'));
    
    if (mdFiles.length === 0) return;

    const mdCode = files[mdFiles[0]];
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Preview</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; background: #f9f9f9; }
        .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="container">
        <div id="markdown-content"></div>
    </div>

    <script>
        const markdownText = \`${mdCode.replace(/`/g, '\\`')}\`;
        document.getElementById('markdown-content').innerHTML = marked.parse(markdownText);
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  // Preview genérico para outros tipos
  const generateGenericPreview = () => {
    const fileNames = Object.keys(files);
    const mainFile = fileNames[0];
    const fileContent = files[mainFile];
    const language = detectLanguage(mainFile, fileContent);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizador de Código</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 900px; margin: 0 auto; }
        .file-section { background: #fff; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .file-header { background: #2d2d2d; color: #fff; padding: 15px; font-family: 'Courier New', monospace; }
        .file-content { padding: 0; }
        pre { margin: 0; }
        code { font-size: 14px; line-height: 1.5; }
        .info { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="info">
            <h3>📁 Visualizador de Projeto</h3>
            <p><strong>Tipo detectado:</strong> ${language.toUpperCase()}</p>
            <p><strong>Arquivos:</strong> ${fileNames.length}</p>
            <p>Este é um preview genérico para visualização do código. Para execução, considere usar um ambiente específico para ${language}.</p>
        </div>
        
        ${fileNames.map(fileName => `
            <div class="file-section">
                <div class="file-header">
                    📄 ${fileName} (${detectLanguage(fileName, files[fileName])})
                </div>
                <div class="file-content">
                    <pre><code class="language-${detectLanguage(fileName, files[fileName])}">${files[fileName].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        hljs.highlightAll();
    </script>
</body>
</html>`;

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
    
    // Tentar extrair JSON primeiro
    const jsonMatch = content.match(/\{[\s\S]*\}$/m);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log("JSON não encontrado, tentando extrair blocos de código...");
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
        if (firstLine.includes('.')) {
          const matches = firstLine.match(/[\w\-\.]+\.(html|css|js|jsx|ts|tsx|py|php|java|cpp|c|json|md)/);
          if (matches) {
            fileName = matches[0];
          }
        } else if (firstLine.includes('html')) {
          fileName = 'index.html';
        } else if (firstLine.includes('css')) {
          fileName = 'styles.css';
        } else if (firstLine.includes('js') || firstLine.includes('javascript')) {
          fileName = 'script.js';
        } else if (firstLine.includes('python') || firstLine.includes('py')) {
          fileName = 'main.py';
        }

        const code = lines.slice(1, -1).join('\n');
        if (code.trim()) {
          files[fileName] = code;
        }
      });
    }

    return Object.keys(files).length > 0 ? files : null;
  };

  async function gerarProjeto() {
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
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: "Você é um especialista em desenvolvimento. Sempre que gerar código, forneça arquivos completos e funcionais. Organize o código em arquivos separados e inclua comentários explicativos."
            },
            {
              role: "user",
              content: `Crie um projeto completo e funcional com: ${prompt}. 

Requisitos:
- Forneça arquivos completos e funcionais
- Use nomes de arquivo apropriados com extensões corretas
- Inclua comentários explicativos
- Certifique-se de que o código seja executável

Formato de resposta:
Explique brevemente o projeto e depois forneça os arquivos em formato JSON:

{
  "nome_arquivo.extensao": "código completo aqui",
  "outro_arquivo.ext": "código completo aqui"
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
      }
    } catch (err) {
      setError(err.message);
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

  // Função para obter o tipo de preview em texto amigável
  const getPreviewTypeLabel = () => {
    const types = {
      'web': '🌐 Web (HTML/CSS/JS)',
      'react': '⚛️ React Component',
      'python': '🐍 Python',
      'javascript': '⚡ JavaScript',
      'css': '🎨 CSS Styles',
      'json': '📄 JSON Data',
      'markdown': '📝 Markdown',
      'generic': '📁 Visualizador'
    };
    return types[previewType] || '👁️ Preview';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          🤖 CodeBuddy IA - Gerador de Projetos
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Um jogo da velha em Python, uma calculadora em JavaScript, uma API em Java..."
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
                  <button
                    onClick={generatePreview}
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                  >
                    👁️ Preview
                  </button>
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
                {showPreview ? getPreviewTypeLabel() : '🌐 Preview do Projeto'}
              </h2>
              
              {showPreview && previewUrl ? (
                <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600 flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      🚀 {getPreviewTypeLabel()} em execução
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
                    {files ? (
                      <div className="mb-4">
                        <p className="text-sm mb-2">Tipo detectado: <strong>{detectProjectType()?.toUpperCase()}</strong></p>
                        <button
                          onClick={generatePreview}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          🚀 Abrir Preview
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        Gere um projeto primeiro para ver o preview
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
              <div className="text-sm text-gray-400 space-y-1">
                <p>💡 <strong>Web:</strong> "Uma landing page para restaurante"</p>
                <p>🐍 <strong>Python:</strong> "Um programa que calcula fibonacci"</p>
                <p>⚡ <strong>JavaScript:</strong> "Um gerador de senhas aleatórias"</p>
                <p>⚛️ <strong>React:</strong> "Um componente de lista de tarefas"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
