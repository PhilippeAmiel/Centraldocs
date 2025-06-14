# Configuration DNS Hostinger pour contact@centraldocs.ai

## 🎯 Objectif
Configurer les enregistrements DNS SPF, DKIM et DMARC pour améliorer la délivrabilité des emails envoyés depuis `contact@centraldocs.ai`.

## 📋 Étapes à suivre dans Hostinger

### 1. Accéder à la gestion DNS

1. **Connectez-vous à votre compte Hostinger**
   - Allez sur [hostinger.com](https://hostinger.com)
   - Cliquez sur "Se connecter"
   - Entrez vos identifiants

2. **Accéder à la gestion DNS**
   - Dans le panneau de contrôle, cliquez sur **"Domaines"**
   - Trouvez `centraldocs.ai` dans la liste
   - Cliquez sur **"Gérer"** à côté du domaine
   - Cliquez sur **"Zone DNS"** ou **"Enregistrements DNS"**

### 2. Ajouter l'enregistrement SPF

**SPF (Sender Policy Framework)** - Autorise Hostinger à envoyer des emails pour votre domaine.

```
Type : TXT
Nom : @ (ou laissez vide)
Valeur : v=spf1 include:_spf.hostinger.com ~all
TTL : 3600 (ou laissez par défaut)
```

#### Instructions détaillées :
1. Cliquez sur **"Ajouter un enregistrement"** ou **"+"**
2. Sélectionnez **"TXT"** dans le type
3. Dans le champ **"Nom"** : tapez `@` (ou laissez vide)
4. Dans le champ **"Valeur"** : copiez exactement `v=spf1 include:_spf.hostinger.com ~all`
5. Cliquez sur **"Ajouter"** ou **"Sauvegarder"**

### 3. Vérifier/Activer DKIM

**DKIM (DomainKeys Identified Mail)** - Signature cryptographique des emails.

#### Option A : Activation automatique (recommandée)
1. Dans le panneau Hostinger, allez dans **"Emails"**
2. Cliquez sur **"Paramètres"** ou **"Configuration"**
3. Cherchez **"DKIM"** et activez-le si ce n'est pas déjà fait
4. Hostinger configurera automatiquement les enregistrements DNS

#### Option B : Configuration manuelle (si nécessaire)
Si DKIM n'est pas automatique, Hostinger vous donnera un enregistrement à ajouter :
```
Type : TXT
Nom : [clé fournie par Hostinger]._domainkey
Valeur : [valeur fournie par Hostinger]
```

### 4. Ajouter l'enregistrement DMARC

**DMARC (Domain-based Message Authentication)** - Politique de gestion des emails non authentifiés.

```
Type : TXT
Nom : _dmarc
Valeur : v=DMARC1; p=quarantine; rua=mailto:contact@centraldocs.ai
TTL : 3600 (ou laissez par défaut)
```

#### Instructions détaillées :
1. Cliquez sur **"Ajouter un enregistrement"** ou **"+"**
2. Sélectionnez **"TXT"** dans le type
3. Dans le champ **"Nom"** : tapez `_dmarc`
4. Dans le champ **"Valeur"** : copiez exactement `v=DMARC1; p=quarantine; rua=mailto:contact@centraldocs.ai`
5. Cliquez sur **"Ajouter"** ou **"Sauvegarder"**

## 🔍 Vérification de la configuration

### Après avoir ajouté les enregistrements :

1. **Attendez la propagation DNS** (15 minutes à 48 heures)
2. **Vérifiez avec des outils en ligne :**

#### Vérification SPF :
- Allez sur [mxtoolbox.com/spf.aspx](https://mxtoolbox.com/spf.aspx)
- Entrez `centraldocs.ai`
- Vérifiez que le résultat contient `include:_spf.hostinger.com`

#### Vérification DKIM :
- Allez sur [mxtoolbox.com/dkim.aspx](https://mxtoolbox.com/dkim.aspx)
- Entrez votre domaine et le sélecteur DKIM (fourni par Hostinger)

#### Vérification DMARC :
- Allez sur [mxtoolbox.com/dmarc.aspx](https://mxtoolbox.com/dmarc.aspx)
- Entrez `centraldocs.ai`
- Vérifiez que la politique DMARC est détectée

### Test complet avec un email :
```bash
# Commande pour tester depuis un terminal (optionnel)
dig TXT centraldocs.ai
dig TXT _dmarc.centraldocs.ai
```

## 📊 Résultat attendu

Une fois configuré, vos enregistrements DNS devraient ressembler à :

```
centraldocs.ai.          TXT    "v=spf1 include:_spf.hostinger.com ~all"
_dmarc.centraldocs.ai.   TXT    "v=DMARC1; p=quarantine; rua=mailto:contact@centraldocs.ai"
[selector]._domainkey.centraldocs.ai. TXT "[clé DKIM]"
```

## ⚠️ Points importants

### Erreurs courantes à éviter :
- ❌ **Ne pas** mettre de guillemets dans l'interface Hostinger
- ❌ **Ne pas** ajouter de point final dans les noms
- ❌ **Ne pas** modifier les enregistrements existants sans vérification
- ✅ **Respecter** exactement la syntaxe fournie
- ✅ **Attendre** la propagation DNS avant de tester

### Si vous avez déjà des enregistrements SPF :
- **Ne créez pas** un deuxième enregistrement SPF
- **Modifiez** l'existant pour inclure `include:_spf.hostinger.com`
- Exemple : `v=spf1 include:_spf.hostinger.com include:autre-service.com ~all`

## 🎯 Bénéfices attendus

Après configuration :
- ✅ **Meilleure délivrabilité** des emails
- ✅ **Réduction du spam** (emails marqués comme légitimes)
- ✅ **Protection contre l'usurpation** de votre domaine
- ✅ **Conformité** aux standards email modernes
- ✅ **Rapports DMARC** pour surveiller l'usage de votre domaine

## 🆘 Support

Si vous rencontrez des difficultés :

1. **Documentation Hostinger :**
   - Cherchez "SPF DKIM DMARC" dans leur centre d'aide
   - Contactez le support Hostinger via chat

2. **Vérification :**
   - Utilisez [mail-tester.com](https://mail-tester.com) pour tester vos emails
   - Consultez [dmarcian.com](https://dmarcian.com) pour l'analyse DMARC

3. **Contact :**
   - Si besoin, contactez-moi avec des captures d'écran de votre interface DNS

## ✅ Checklist finale

- [ ] Enregistrement SPF ajouté : `v=spf1 include:_spf.hostinger.com ~all`
- [ ] DKIM activé dans les paramètres email Hostinger
- [ ] Enregistrement DMARC ajouté : `v=DMARC1; p=quarantine; rua=mailto:contact@centraldocs.ai`
- [ ] Propagation DNS attendue (24-48h max)
- [ ] Tests de vérification effectués
- [ ] Email de test envoyé et reçu avec succès

Une fois ces étapes terminées, votre configuration `contact@centraldocs.ai` sera optimale pour l'envoi d'emails professionnels ! 🚀