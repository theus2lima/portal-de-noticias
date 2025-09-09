# Guia de Instalação - Portal de Notícias

Este guia irá ajudá-lo a configurar e executar o Portal de Notícias em seu ambiente local.

## ⚠️ Requisitos do Sistema

### Obrigatórios
- **Node.js**: versão 18.0 ou superior
- **npm**: versão 8.0 ou superior (vem com Node.js)
- **Git**: para clonagem do repositório

### Recomendado
- **Visual Studio Code**: para edição de código
- **PowerShell** ou **Terminal**: para executar comandos

## 📋 Verificação dos Requisitos

Antes de começar, verifique se você tem os requisitos instalados:

```bash
# Verificar versão do Node.js
node --version
# Deve mostrar v18.0.0 ou superior

# Verificar versão do npm
npm --version
# Deve mostrar 8.0.0 ou superior

# Verificar se o Git está instalado
git --version
```

## 📦 Instalação do Node.js (se necessário)

Se você não tem o Node.js instalado:

1. Acesse [nodejs.org](https://nodejs.org/)
2. Baixe a versão LTS (recomendada)
3. Execute o instalador
4. Reinicie o terminal/PowerShell

## 🚀 Instalação do Projeto

### Passo 1: Instalar Dependências

No diretório do projeto (`C:\\Users\\ASUS\\news-portal`), execute:

```bash
npm install
```

Este comando irá:
- Baixar todas as dependências listadas no `package.json`
- Criar a pasta `node_modules`
- Gerar o arquivo `package-lock.json`

### Passo 2: Configurar Política de Execução (Windows PowerShell)

Se você está usando PowerShell e encontrar erros de execução:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Digite `S` quando solicitado para confirmar.

## 🏃‍♂️ Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em: http://localhost:3000

### Outros Comandos Disponíveis

```bash
# Construir para produção
npm run build

# Executar versão de produção
npm run start

# Executar linting
npm run lint
```

## 🌐 Acessando a Aplicação

Após executar `npm run dev`, abra seu navegador e acesse:

**http://localhost:3000**

Você verá:
- Página inicial com carrossel de manchetes
- Seções de categorias coloridas
- Grid de notícias recentes
- Seção "Mais Lidas"
- Formulário de captura de leads

## 📁 Estrutura de Arquivos

```
news-portal/
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 🎨 globals.css          # Estilos globais e cores do Paraná
│   │   ├── 📄 layout.tsx           # Layout principal
│   │   └── 📄 page.tsx             # Página inicial
│   ├── 📂 components/
│   │   ├── 🏠 Header.tsx           # Cabeçalho com navegação
│   │   ├── 🦶 Footer.tsx           # Rodapé com links
│   │   ├── 🎯 Hero.tsx             # Carrossel de manchetes
│   │   ├── 📑 CategorySection.tsx  # Seção de categorias
│   │   ├── 📰 NewsSection.tsx      # Grid de notícias
│   │   ├── 🔥 MostRead.tsx         # Artigos mais lidos
│   │   └── 📝 LeadForm.tsx         # Formulário de captura
│   ├── 📂 lib/                     # Utilitários e helpers
│   └── 📂 types/                   # Definições TypeScript
├── 📂 public/                      # Arquivos estáticos
├── ⚙️ package.json                 # Dependências e scripts
├── 🎨 tailwind.config.js           # Configuração do Tailwind
├── 📝 tsconfig.json                # Configuração TypeScript
└── ⚙️ next.config.js               # Configuração Next.js
```

## 🎨 Paleta de Cores Implementada

O projeto usa as cores do Governo do Paraná:

- **🔵 Azul Principal**: `bg-primary-900` (#1E3A8A)
- **🔵 Azul Claro**: `bg-primary-500` (#3B82F6)
- **🟢 Verde Destaque**: `bg-secondary-600` (#16A34A)
- **🟢 Verde Claro**: `bg-accent-500` (#10B981)
- **⚪ Neutros**: `bg-neutral-50` a `bg-neutral-900`

## 🔧 Personalizações

### Modificar Cores
Edite o arquivo `tailwind.config.js` para alterar a paleta de cores.

### Adicionar Componentes
Crie novos componentes na pasta `src/components/`.

### Modificar Estilos
Edite `src/app/globals.css` para estilos globais.

## ❗ Solução de Problemas

### Erro: "npm não é reconhecido"
- Instale o Node.js ou adicione-o ao PATH do sistema

### Erro: "Execution Policy"
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Erro: "Port 3000 already in use"
- Use: `npm run dev -- -p 3001` para usar porta 3001

### Erro: "Module not found"
- Execute: `npm install` para instalar dependências

### Página não carrega corretamente
- Verifique se todas as dependências foram instaladas
- Reinicie o servidor de desenvolvimento

## 📞 Suporte

Se você encontrar problemas:

1. Verifique se seguiu todos os passos
2. Confirme que os requisitos estão atendidos
3. Tente reinstalar as dependências: `rm -rf node_modules package-lock.json && npm install`
4. Consulte o arquivo README.md para mais informações

## ✅ Próximos Passos

Após a instalação bem-sucedida:

1. 🗄️ **Configure o banco de dados** (próxima fase)
2. 🔐 **Implemente autenticação** para o CMS
3. 🔍 **Adicione funcionalidade de busca**
4. 📱 **Integre WhatsApp Business API**
5. 🚀 **Configure deploy para produção**

---

**Pronto!** Seu Portal de Notícias está funcionando com as cores do Governo do Paraná! 🎉
