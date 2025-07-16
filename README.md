# 🤖 CodeBuddy IA - Gerador de Projetos v2.0

Um gerador inteligente de projetos que usa IA para criar código funcional e testável!

## ✨ Funcionalidades v2.0

- 🎯 **Geração Inteligente**: Descreva seu projeto e a IA cria códigos completos
- 👁️ **Preview Funcional**: Visualize e teste seus projetos HTML/CSS/JS em tempo real
- 📝 **Editor Integrado**: Monaco Editor com syntax highlighting para múltiplas linguagens
- 📥 **Download de Arquivos**: Baixe arquivos individuais ou projeto completo
- 🎨 **Interface Moderna**: Design responsivo com modo escuro
- 🔧 **Códigos Editáveis**: Modifique o código gerado diretamente na interface

## 🚀 Configuração Rápida

### 1. Clone e Instale
```bash
git clone <repo-url>
cd codebuddy-ia
npm install
```

### 2. Configure a API Key da Groq (OBRIGATÓRIO)

**Passo a passo:**
1. Acesse [console.groq.com](https://console.groq.com/keys)
2. Crie uma conta gratuita
3. Gere uma API key
4. Edite o arquivo `.env` e substitua `your_groq_api_key_here` pela sua chave:

```bash
# Abra o arquivo .env
nano .env

# Substitua por sua chave real:
VITE_GROQ_API_KEY=gsk_SuaChaveAquiReal123456789
```

### 3. Execute o Projeto
```bash
npm run dev
```

## 🔧 Melhorias da v2.0

### ✅ **Problemas Corrigidos:**
- **API Model**: Corrigido modelo da Groq para `llama3-8b-8192`
- **Extração de Arquivos**: Melhorada detecção de JSON e blocos de código
- **Preview**: Corrigido injeção de CSS/JS para HTML sem tags padrão
- **Tratamento de Erros**: Mensagens mais claras e validação de API key
- **Performance**: Otimizações no parsing de respostas da IA

### 🆕 **Novas Funcionalidades:**
- Validação automática da API key
- Melhor detecção de nomes de arquivo
- Suporte a projetos sem estrutura HTML padrão
- Mensagens de erro mais informativas
- Versioning do título da aplicação

## 💡 Exemplos de Prompts que Funcionam

- "Uma landing page para uma pizzaria com cardápio interativo"
- "Um jogo da velha funcional com JavaScript"
- "Uma calculadora científica responsiva"
- "Um portfólio pessoal moderno com animações CSS"
- "Um sistema de to-do list com localStorage"

## 🛠️ Tecnologias

- **React 18** - Interface moderna
- **Vite** - Build tool rápido
- **Monaco Editor** - Editor de código profissional
- **Tailwind CSS** - Estilização
- **Groq API** - IA LLaMA para geração de código

## 🚨 Resolução de Problemas

### Erro: "Configure sua API key da Groq"
**Solução**: Verifique se o arquivo `.env` tem sua chave real da Groq.

### Erro: "Não foi possível extrair arquivos"
**Solução**: Reformule seu prompt sendo mais específico. Ex: "Uma página HTML simples com CSS azul"

### Preview não funciona
**Solução**: Certifique-se de que o projeto gerado inclui um arquivo .html

### Erro de conexão com API
**Solução**: Verifique sua internet e se a chave da Groq está válida

## 🎯 Como Funciona

1. **Descreva**: Digite o que você quer criar
2. **IA Gera**: A Groq IA cria arquivos completos em JSON
3. **Visualize**: Veja o código no Monaco Editor
4. **Teste**: Use o preview para testar funcionalidades
5. **Baixe**: Salve os arquivos para usar em seus projetos

## 📦 Deploy

Para fazer build de produção:
```bash
npm run build
```

## 🤝 Contribuição

Para subir a v2.0 para o GitHub:
```bash
git add .
git commit -m "feat: CodeBuddy IA v2.0 - Funcionalidades corrigidas e melhoradas"
git tag v2.0.0
git push origin main --tags
```

**Agora seus códigos gerados pela IA são totalmente funcionais e testáveis!** 🚀
