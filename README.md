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
- [next-intl](https://next-intl.dev/) pour le routage et les traductions multilingues
  (`/fr`, `/en`, `/ar`).
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) pour les
  tests ciblés (sélecteur de langue, actions désactivées).
- Hébergé sur [Vercel](https://vercel.com/) — voir `docs/CONTEXTE_PROJET.md` (dépôt
  vetement-back) pour l'adresse déployée et son état.

## Développement local

```
npm install
cp .env.example .env.local   # puis ajuster NEXT_PUBLIC_API_URL si besoin
npm run dev                  # démarre le serveur de développement (http://localhost:3000)
npm run type-check           # vérifie les types TypeScript
npm run lint                 # vérifie le code
npm test                     # exécute les tests ciblés
npm run build                # construit la version de production
npm run start                # démarre la version construite
```

## Routes

- `/`, redirigée vers la langue mémorisée ou `/fr` par défaut — page d'accueil publique
  (français `/fr`, anglais `/en`, arabe `/ar`, avec mise en page RTL pour l'arabe).
- `/<langue>/diagnostic` — page technique interne de vérification front/back (commit déployé,
  disponibilité de l'API). Non traduite, non destinée aux visiteurs, toujours `noindex`.

## État actuel

Une première page d'accueil publique existe (US-004) : présentation du projet, identité
visuelle évoquant l'Algérie, section « Comment ça marche ? », emplacement d'attente pour les
futures annonces, boutons Connexion/Inscription visibles mais désactivés (« Bientôt
disponible »), et sélecteur de langue fonctionnel (français, anglais, arabe) avec persistance
du choix. Aucune fonctionnalité produit réelle (annonces, comptes, messagerie...) n'existe
encore — voir le fichier de référence pour le détail exact de ce qui est réalisé, prévu ou
bloqué.

Restent à définir : l'organisation entre les cibles web et mobile, le nom de marque définitif
(« Vetement » est utilisé à titre provisoire), et les pages légales/de contact nécessaires au
lancement public.
