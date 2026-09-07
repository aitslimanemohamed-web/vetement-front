# Instructions pour Claude Code — vetement-front

## Rôle de ce dépôt

Ce dépôt est le **front-end** du projet vetement (site web + applications mobiles iOS/Android).
Il est indépendant du dépôt **vetement-back** (API, règles métier, données) : les deux dépôts
ont chacun leur propre historique Git et leur propre dépôt GitHub. Ne jamais supposer un accès
direct au code du back-end depuis ce dépôt.

## Mémoire de référence du projet

Le contexte complet du projet (les deux dépôts) est documenté dans un fichier unique, hébergé
dans le dépôt back-end :
- Emplacement relatif dans l'espace de travail : `../vetement-back/docs/CONTEXTE_PROJET.md`
- Lien GitHub réel : https://github.com/aitslimanemohamed-web/vetement-back/blob/main/docs/CONTEXTE_PROJET.md

**Lire ce fichier avant toute intervention.** À la fin du travail, si l'intervention modifie
des informations qu'il contient (organisation, décisions, état du projet...), **le mettre à
jour dans le dépôt vetement-back** — ne pas en créer de copie dans ce dépôt.

## Avant de travailler

Toujours lire le ticket concerné avant de commencer un travail dans ce dépôt. Ne pas déduire le
périmètre d'une tâche à partir du code existant seul.

## Ce qu'il ne faut pas faire sans validation explicite

- Ne pas ajouter de fonctionnalité qui ne figure pas dans le ticket en cours.
- Ne pas choisir un framework, une librairie ou une technologie qui n'a pas été validée par
  l'utilisateur au préalable.
- Ne pas créer de configuration de déploiement ou d'outillage non demandé.

## Préservation du travail existant

Avant de modifier ou remplacer un fichier, vérifier s'il contient déjà du travail — ne rien
écraser ni supprimer sans certitude que ce n'est plus nécessaire.

## Secrets

Ne jamais committer de secret (mot de passe, clé d'API, jeton, certificat...). Un fichier
`.env.example` sans valeur réelle peut être versionné ; un `.env` réel ne doit jamais l'être.

## Documentation

Mettre à jour le `README.md` de ce dépôt dès qu'un changement rend une information existante
obsolète (nouvelles technologies choisies, nouvelle organisation, etc.).

## Avant chaque commit

- Exécuter `npm run type-check`, `npm run lint` et `npm run build` — les 3 doivent réussir
  (c'est aussi ce que vérifie automatiquement la CI sur push).
- Vérifier qu'aucun secret n'est inclus dans les fichiers ajoutés.
- Vérifier que les fichiers ajoutés correspondent bien au périmètre du ticket en cours.
- Vérifier que la documentation reflète l'état réel du projet.

## Commits et push

Les commits et les push de ce dépôt se font uniquement dans **vetement-front**. Si un ticket
futur modifie à la fois le front-end et le back-end, les changements de chaque dépôt doivent
être vérifiés et publiés séparément, chacun dans son propre dépôt.
