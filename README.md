# vetement-front

## Rôle

Ce dépôt contient le **front-end** du projet vetement : l'interface utilisateur destinée au
site web et aux applications mobiles.

## Supports prévus

- Navigateur web
- iOS
- Android

## Langues prévues

- Français
- Arabe
- Anglais

## Dépôt lié

Le back-end (API, règles métier, accès aux données) vit dans un dépôt séparé et indépendant :
[**vetement-back**](https://github.com/aitslimanemohamed-web/vetement-back).

## Mémoire de référence du projet

L'ensemble du projet (les deux dépôts) est documenté dans un fichier unique de référence,
hébergé dans le dépôt back-end :

- Emplacement relatif dans l'espace de travail : `../vetement-back/docs/CONTEXTE_PROJET.md`
- Lien GitHub réel : https://github.com/aitslimanemohamed-web/vetement-back/blob/main/docs/CONTEXTE_PROJET.md

**Lire ce fichier avant de commencer une intervention**, et **le mettre à jour à la fin du
travail** (dans le dépôt vetement-back) si l'intervention en modifie le contenu.

## Récupérer ce dépôt

```
git clone https://github.com/aitslimanemohamed-web/vetement-front.git
```

## Technologies

- [Next.js](https://nextjs.org/) 16 avec TypeScript (site web uniquement pour le MVP —
  applications iOS/Android reportées).

## Développement local

```
npm install
cp .env.example .env.local   # puis ajuster NEXT_PUBLIC_API_URL si besoin
npm run dev                  # démarre le serveur de développement (http://localhost:3000)
npm run type-check           # vérifie les types TypeScript
npm run lint                 # vérifie le code
npm run build                # construit la version de production
npm run start                # démarre la version construite
```

## État actuel

Une première page de garde existe (nom du projet, présentation courte, indication
« Environnement de test », et une zone de diagnostic qui vérifie en temps réel la
communication avec le back-end). Aucune fonctionnalité produit (annonces, comptes,
messagerie...) n'existe encore — voir le fichier de référence pour le détail exact de ce qui
est réalisé, prévu ou bloqué.

Restent à définir : l'organisation entre les cibles web et mobile, l'hébergement définitif, et
la stratégie de traduction complète (cette page technique est en français pour l'instant).
