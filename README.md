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
cp .env.example .env.local   # puis ajuster NEXT_PUBLIC_API_URL et INTERNAL_API_URL si besoin
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
- `/<langue>/inscription` — création de compte (nom d'utilisateur, mot de passe, confirmation) :
  validation locale immédiate, puis un appel relayé (même origine, `/api/auth/register`) qui crée
  le compte et une session (US-009, US-010). Aucun mot de passe n'est jamais stocké côté front ni
  renvoyé par l'API. Redirige automatiquement vers `/<langue>/espace` en cas de succès, ou vers
  `/<langue>/espace` directement si un visiteur déjà connecté l'ouvre.
- `/<langue>/connexion` — connexion d'un compte existant (US-011) : nom d'utilisateur, mot de
  passe (icône œil réutilisée de l'inscription), aucune validation de format locale (seule la
  présence des deux champs est vérifiée — les règles de création ne s'appliquent pas à la
  connexion). Un nom inconnu et un mot de passe incorrect donnent exactement le même message,
  sans indiquer lequel des deux est en cause. Redirige vers `/<langue>/espace` en cas de succès ou
  si un visiteur déjà connecté l'ouvre.
- `/<langue>/espace` — espace connecté, page « Découvrir » (US-010, US-012) : en-tête avec avatar
  et nom réels, recherche, localisation, catégories, zone d'annonces (état vide, aucune fausse
  annonce), navigation basse sur téléphone — toutes ces commandes sont volontairement de vrais
  boutons désactivés, aucune n'est encore fonctionnelle (aucune API métier, aucune donnée
  d'annonce). Protégé côté serveur (redirection vers l'accueil sans session valide, sans jamais
  laisser apparaître de contenu privé). Session opaque stockée dans PostgreSQL (`app.sessions`),
  cookie `HttpOnly`/`Secure`/`SameSite=Lax`, jamais dans `localStorage`.
- `/<langue>/diagnostic` — page technique interne de vérification front/back (commit déployé,
  disponibilité de l'API). Non traduite, non destinée aux visiteurs, toujours `noindex`.
- `/api/auth/{register,login,me,logout}` — routes relais de même origine vers l'API NestJS
  (`INTERNAL_API_URL`, variable serveur) : le navigateur ne parle jamais directement à Render pour
  ces actions (cookie de session posé sur le domaine du site, jamais un cookie tiers — voir
  CONTEXTE_PROJET.md pour le détail de l'architecture).

## État actuel

La page d'accueil publique (US-004) présente le projet avec une identité visuelle évoquant
l'Algérie, une section « Comment ça marche ? », un emplacement d'attente pour les futures
annonces, et un sélecteur de langue fonctionnel (français, anglais, arabe) avec persistance du
choix. Le bouton **Inscription** ouvre une vraie page connectée au back-end : un compte est
réellement créé en base et connecte automatiquement l'utilisateur à son espace (US-009, US-010).
Une fois connecté, l'en-tête affiche le nom du compte, un avatar par défaut et un bouton de
déconnexion réel à la place des actions Connexion/Inscription. Le bouton **Connexion** ouvre
désormais une vraie page (US-011) permettant à un compte déjà existant de se reconnecter. L'espace
connecté présente désormais une page « Découvrir » complète (US-012) — recherche, catégories,
zone d'annonces, navigation — mais aucune de ces commandes n'est encore fonctionnelle, et aucune
annonce réelle n'existe. Voir le fichier de référence pour le détail exact de ce qui est réalisé,
prévu ou bloqué.

Restent à définir : l'organisation entre les cibles web et mobile, le nom de marque définitif
(« Vetement » est utilisé à titre provisoire), la récupération de compte, et les pages
légales/de contact nécessaires au lancement public.
