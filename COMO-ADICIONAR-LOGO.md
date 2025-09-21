# 🎨 Como Adicionar/Trocar a Logo do Portal

## 📋 **Método 1: Via Dashboard (Recomendado)**

### 1️⃣ **Acesse o Dashboard**
```
http://localhost:3000/admin/settings
```

### 2️⃣ **Localize a Seção "Logotipo"**
- Na seção **"Configurações do Site"**
- Procure pelo campo **"Logotipo"**

### 3️⃣ **Faça o Upload**
- Clique em **"Adicionar Logo"** ou **"Alterar Logo"**
- Selecione sua imagem (PNG, JPG, GIF, SVG)
- Máximo: 5MB
- Recomendado: 180px de largura, altura proporcional

### 4️⃣ **Salve as Alterações**
- A logo aparecerá instantaneamente no preview
- Será aplicada automaticamente no site

---

## 📋 **Método 2: Via Arquivo (Manual)**

### 1️⃣ **Adicione a Logo na Pasta Public**
```bash
# Copie sua logo para:
C:\Users\ASUS\news-portal\public\logo.png

# Ou renomeie sua logo para:
logo.png, logo.jpg, logo.svg, etc.
```

### 2️⃣ **Formatos Suportados**
- ✅ **PNG** (recomendado - fundo transparente)
- ✅ **JPG/JPEG** (boa qualidade)  
- ✅ **SVG** (vetorial - melhor qualidade)
- ✅ **GIF** (animação suportada)

### 3️⃣ **Dimensões Recomendadas**
- **Largura**: 180px - 250px
- **Altura**: 40px - 80px  
- **Proporção**: 3:1 ou 4:1 (largura:altura)

---

## 🔧 **Status Atual**

### ✅ **Sistema Configurado**
- Header agora usa sistema de configurações
- Fallback automático para `/icon.svg`
- Upload via dashboard funcionando
- Preview em tempo real

### 📂 **Arquivos Disponíveis**
```
📁 public/
├── icon.svg ✅ (usado como fallback)
├── favicon.ico ✅
├── og-image.svg ✅
└── [sua-logo] ⏳ (adicione aqui)
```

---

## 🎯 **Teste Rápido**

1. **Servidor rodando?**
   ```bash
   npm run dev
   ```

2. **Acesse o site**
   ```
   http://localhost:3000
   ```

3. **Verifique se a logo aparece** no header superior

---

## 🚨 **Problemas Comuns**

### ❌ **Logo não aparece**
- ✅ Verifique se o arquivo está em `/public/`
- ✅ Nome correto do arquivo
- ✅ Tamanho máximo 5MB
- ✅ Formato suportado

### ❌ **Logo muito grande/pequena**
- ✅ Use CSS `object-fit: contain`
- ✅ Redimensione a imagem original
- ✅ Proporção adequada (3:1 ou 4:1)

### ❌ **Logo não atualiza**
- ✅ Limpe cache do browser (Ctrl+F5)
- ✅ Aguarde 30 segundos (cache do sistema)
- ✅ Verifique o console por erros

---

## 📞 **Suporte**

Se a logo ainda não funcionar, execute:
```bash
node debug-api.js
```

Este script verificará se o sistema está funcionando corretamente.
