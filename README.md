# 🤖 CodeBuddy IA - Gerador de Projetos

Um gerador inteligente de projetos que usa IA para criar código funcional e testável!

## ✨ Funcionalidades

- 🎯 **Geração Inteligente**: Descreva seu projeto e a IA cria códigos completos
- 👁️ **Preview Funcional**: Visualize e teste seus projetos HTML/CSS/JS em tempo real
- 📝 **Editor Integrado**: Monaco Editor com syntax highlighting para múltiplas linguagens
- 📥 **Download de Arquivos**: Baixe arquivos individuais ou projeto completo
- 🎨 **Interface Moderna**: Design responsivo com modo escuro
- 🔧 **Códigos Editáveis**: Modifique o código gerado diretamente na interface

## 🚀 Como Usar

1. **Configuração**:
   ```bash
   # Clone o projeto
   git clone <repo-url>
   cd codebuddy-ia
   
   # Instale dependências
   npm install
   
   # Configure a API Key
   cp .env.example .env
   # Edite o arquivo .env com sua chave da Groq
   ```

2. **Obter API Key Groq** (Gratuita):
   - Acesse [console.groq.com](https://console.groq.com/keys)
   - Crie uma conta gratuita
   - Gere uma API key
   - Cole no arquivo `.env`

3. **Executar**:
   ```bash
   npm run dev
   ```

## 💡 Exemplos de Prompts

- "Uma landing page para uma pizzaria com cardápio"
- "Um jogo da velha interativo"
- "Uma calculadora científica"
- "Um portfólio pessoal responsivo"
- "Um sistema de login simples"

## 🛠️ Tecnologias

- **React 18** - Interface moderna
- **Vite** - Build tool rápido
- **Monaco Editor** - Editor de código profissional
- **Tailwind CSS** - Estilização
- **Groq API** - IA LLaMA para geração de código

## 📋 Melhorias Implementadas

✅ **Preview Funcional**: Teste seus projetos em iframe sandbox
✅ **Download de Arquivos**: Baixe códigos individualmente ou completos
✅ **Detecção de Linguagem**: Syntax highlighting automático
✅ **Editor Melhorado**: Edição em tempo real dos códigos gerados
✅ **Interface Responsiva**: Layout em grid para melhor organização
✅ **Extração Inteligente**: Suporte a JSON e blocos de código markdown
✅ **UX Aprimorada**: Emojis, feedback visual e navegação intuitiva

## 🎯 Como Funciona

1. **Descreva**: Digite o que você quer criar
2. **IA Gera**: A Groq IA cria arquivos completos e funcionais
3. **Visualize**: Veja o código no Monaco Editor
4. **Teste**: Use o preview para testar funcionalidades
5. **Baixe**: Salve os arquivos para usar em seus projetos

Agora seus códigos gerados pela IA são totalmente **visíveis**, **editáveis** e **testáveis**! 🚀
