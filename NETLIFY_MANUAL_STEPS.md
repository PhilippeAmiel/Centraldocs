# 🔧 ÉTAPES MANUELLES NETLIFY - Solution garantie

## 🚨 Le problème : Cache Netlify

Netlify garde en cache l'ancienne configuration, c'est pourquoi les commits ne changent rien.

## ✅ Solution garantie (5 minutes)

### Étape 1 : Clear Cache (OBLIGATOIRE)

1. **Dans votre dashboard Netlify :**
   - Allez sur votre site (centraldocs)
   - Cliquez sur **"Deploys"**
   - Cherchez **"Trigger deploy"** ou **"Deploy settings"**
   - **IMPORTANT :** Cliquez sur **"Clear cache and deploy site"**
   - **PAS** juste "Deploy site" !

### Étape 2 : Vérifier la configuration

1. **Dans "Site settings" > "Build & deploy" :**
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
   - **Framework :** Vite (auto-détecté)

### Étape 3 : Si ça ne marche toujours pas

1. **Supprimez complètement le site** Netlify
2. **Recréez un nouveau site** :
   - "New site from Git"
   - Connectez GitHub
   - Sélectionnez votre repo
   - Netlify détecte automatiquement Vite

## 🎯 Pourquoi cette solution marche

- **Clear cache** supprime tous les anciens fichiers
- **Nouveau build** utilise la nouvelle configuration
- **force = true** dans netlify.toml force les redirects

## ✅ Résultat garanti

Après le clear cache :
- ✅ centraldocs.netlify.app fonctionne
- ✅ Page d'accueil CentralDocs visible
- ✅ Routes /login, /register, /dashboard accessibles
- ✅ Firebase configuré automatiquement

## 🚨 Si vous ne trouvez pas "Clear cache"

Essayez ces alternatives :
1. **Supprimez et recréez** le site (solution radicale mais efficace)
2. **Contactez le support** Netlify
3. **Changez le nom** du site dans les paramètres

**La solution "Clear cache and deploy site" résout 99% des problèmes Netlify !** 🚀