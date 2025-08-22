# Configuração do Firebase

## Conta a ser utilizada: **jhonatann.andrade@gmail.com**

1. **Verificar/trocar conta:**
   - Acesse: https://console.firebase.google.com/
   - No canto superior direito, verifique se está logado com: **jhonatann.andrade@gmail.com**
   - Se não estiver, clique em "Trocar conta" e selecione a conta correta

## Passos para configurar:

1. **Criar projeto Firebase:**
   - Acesse: https://console.firebase.google.com/
   - Clique em "Criar projeto"
   - Nome: "Move Up Fit"

2. **Configurar Authentication:**
   - No console, vá em "Authentication"
   - Clique "Começar"
   - Vá na aba "Sign-in method"
   - Ative "Email/senha"

3. **Configurar Firestore:**
   - No console, vá em "Firestore Database"
   - Clique "Criar banco de dados"
   - Escolha "Iniciar no modo de teste"

4. **Obter configuração:**
   - Vá em "Configurações do projeto" (ícone engrenagem)
   - Role até "Seus aplicativos"
   - Clique no ícone "</>" (Web)
   - Copie as configurações

5. **Atualizar arquivo:**
   - Abra `js/firebase-config.js`
   - Substitua as configurações pelas suas
   - O projectId será "move-up-fit" (ou o nome que você escolheu)

6. **Confirmar conta:**
   - No console Firebase, vá em "Configurações do projeto"
   - Em "Geral" deve aparecer: **Proprietário: jhonatann.andrade@gmail.com**

## Regras de segurança (Firestore):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## IMPORTANTE: Configurar regras no Firebase Console:
1. Vá em "Firestore Database"
2. Clique na aba "Regras" (Rules)
3. Substitua o conteúdo pelas regras acima
4. Clique "Publicar" (Publish)

## Funcionalidades:
- ✅ Sincronização automática
- ✅ Tempo real
- ✅ Multiplataforma
- ✅ Gratuito até 1GB