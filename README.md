# Hanzi · Leçon 1

Site front-end en TypeScript et Vite pour apprendre le vocabulaire chinois, organisé par leçons. La leçon 1 contient actuellement **18 mots et expressions** :

你好 · 好 · 你 · 是 · 老师 · 吗 · 不 · 我 · 学生 · 他 · 她 · 谢谢 · 不客气 · 您 · 留学生 · 叫 · 什么 · 名字

## Lancer le site

```sh
npm install
npm run dev
```

Ouvrir http://localhost:5173.

## Apprentissage

- Une leçon avec quatre explications de grammaire et un rappel des tons.
- Fiches des 18 mots : pinyin et traductions fournis, explications, exemple traduit et réponse masquable pour travailler la mémoire.
- Lecture des mots et des phrases à partir de 34 fichiers MP3 mandarin inclus dans le site.
- Recherche par chinois, français ou pinyin, avec ou sans espaces et accents ; filtres des mots mémorisés ou à apprendre.
- Trois quiz : pinyin et traduction vers chinois, français vers chinois sans indice, chinois vers français sans indice. Jusqu’à 10 questions, quatre choix, correction immédiate et révision des erreurs.
- Quiz sur une leçon, toutes les leçons, ou uniquement les mots mémorisés de la sélection (au moins quatre). Les distracteurs viennent eux aussi de la sélection.

## Oral

Une section dédiée propose 10 questions sur une leçon ou toutes les leçons. Le navigateur prononce le mot et l’élève choisit parmi quatre propositions chinoises. Le pinyin et la traduction sont révélés dans la correction. La lecture démarre au lancement et à chaque question suivante ; deux boutons permettent de réécouter à vitesse normale ou plus lentement.

- Les homophones (notamment 他 / 她) ne sont pas proposés ensemble.
- Les réponses deviennent disponibles après la première lecture terminée. Une erreur audio affiche un message et permet de réessayer.
- Les résultats et les erreurs à revoir utilisent le même suivi que les autres quiz.
- Aucune voix à installer : les cours, quiz et dictées partagent les mêmes MP3 mandarin, servis depuis `public/audio/`. Le bouton « Tester le son : bonjour » permet de vérifier la lecture. Le ralenti conserve la hauteur de la voix. Aucune capture du microphone n’est utilisée.

Les fichiers ont été générés avec la voix neuronale mandarin `zh-CN-XiaoxiaoNeural` via `edge-tts 7.2.8`. Le manifeste `public/audio/sources.json` associe chaque texte à son MP3. `scripts/generate-audio.py` permet de les régénérer avec Python et cette dépendance ; cela nécessite Internet seulement lors de la génération. À l’utilisation, aucun service de synthèse vocale n’est appelé.

Les tests contrôlent la couverture des 18 mots et de leurs exemples, le décodage des 34 MP3, leur durée et leur signal non silencieux, ainsi que la lecture réelle dans Chrome sans Web Speech API. Les tests de parcours plus rapides simulent le lecteur audio. Ces vérifications techniques ne remplacent pas une évaluation humaine de la prononciation.

### Dictée dessinée

Dans **Oral**, sélectionner **Écouter et écrire · dessiner les caractères**, puis démarrer. La dictée propose cinq mots de la leçon, prononcés sans montrer leur écriture ni leur pinyin. Les caractères d’un mot composé se tracent successivement, sans modèle ni indice automatique.

- Réécoute normale ou lente, tracé à la souris, au stylet ou au doigt.
- Vérification de la forme, du sens et de l’ordre des traits.
- Indice volontaire pour montrer le modèle, ou affichage de la réponse pour passer un mot.
- Un point par mot entièrement tracé sans erreur ni aide ; effacer ne remet pas les erreurs à zéro. Le score de dictée est sauvegardé séparément par son mode dans les résultats.
- Pour des homophones comme 他 / 她, le sens français précise le caractère demandé.
- Après un mot, la correction donne le chinois, le pinyin et la traduction. Une panne audio ou de chargement permet de réessayer ; un exercice interrompu ne produit pas de score.

## Écriture

Les mots contiennent **22 caractères distincts**. L’atelier utilise [Hanzi Writer](https://hanziwriter.org/docs.html) pour :

1. Voir l’animation de l’ordre des traits.
2. Tracer à la souris, au stylet ou au doigt, avec le modèle et un indice après une erreur.
3. Tracer sans modèle ni indice automatique : seule une tentative sans erreur est enregistrée comme réussie de mémoire.

Les mots composés sont décomposés en caractères sélectionnables. Les réussites guidées et sans modèle sont comptées séparément. La reconnaissance est une aide à l’apprentissage de la forme, du sens et de l’ordre des traits ; ce n’est pas une évaluation de la calligraphie.

Les 22 fichiers JSON sont inclus dans `public/strokes/`, sans requête vers un CDN de données pendant l’utilisation. Ils proviennent de `hanzi-writer-data` (Make Me a Hanzi, données issues des polices Arphic). La licence Arphic est incluse dans ce dossier et accessible depuis l’atelier. Hanzi Writer est distribué sous licence MIT.

## Ajouter une leçon

Le contenu est séparé de l’interface : chaque leçon est un fichier dans `src/lessons/`. Pour en ajouter une :

1. Copier `src/lessons/lesson.template.ts` en `lesson-2.ts`, compléter les mots et lui donner un `id` et un `number` uniques.
2. Importer et ajouter la leçon dans le tableau `lessons` de `src/lessons/index.ts`.
3. Générer les nouveaux MP3 avec `python scripts/generate-audio.py`, puis ajouter les fichiers de traits manquants dans `public/strokes/`.
4. Lancer `npm run build` et `npm run test:production`.

Le catalogue fournit automatiquement les sélections « une leçon » et « toutes les leçons » à l’écriture, aux quiz, à l’oral, à la dictée et au dictionnaire. Les acquis sont identifiés par la leçon et le mot, afin que le même caractère dans deux leçons n’écrase pas la progression.

## Progression

Les acquis, résultats et tracés sont stockés dans le navigateur, sous `hanzi-progress-v2`, sans compte ni serveur. La progression de la précédente clé de la leçon 1 est importée une fois, sans supprimer cette ancienne clé. Les acquis sont maintenant associés à leur leçon. En cas de blocage du stockage, l’apprentissage reste utilisable pendant la session, avec un message explicite.

## Vérifications et production

```sh
npm run build
npm run preview
npm run test
```

Les tests Playwright utilisent Chromium installé via `npx playwright install chromium`. La variable `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` permet de choisir un autre exécutable. Ils couvrent les mots exacts, les fiches, la progression, les trois quiz, le tracé réel à la souris et au toucher, le chargement des modèles et le mobile.

Le dossier `dist/` peut être publié sur un hébergement statique. Les polices Google sont facultatives : des polices système prennent le relais si elles sont indisponibles. Les fichiers audio sont déployés avec le site ; une erreur de lecture affiche un bouton de réécoute et bloque la réponse tant qu’aucun son n’a été lu.

## Déploiement VPS via GitHub Actions

Le workflow `.github/workflows/deploy.yml` conserve les secrets existants :

| Secret | Contenu |
| --- | --- |
| `VPS_HOST` | Nom d’hôte ou IPv4 du VPS, sans `https://`, chemin ni port |
| `VPS_USER` | Utilisateur SSH ayant accès en écriture au dossier du site |
| `VPS_SSH_KEY` | Clé privée SSH complète, avec ses lignes BEGIN/END, sans passphrase |
| `VPS_KNOWN_HOSTS` (facultatif, recommandé) | Clé d’hôte du VPS vérifiée, au format `known_hosts` |

Les trois premiers secrets suffisent, comme dans le workflow initial. Sans `VPS_KNOWN_HOSTS`, le workflow récupère la clé du serveur avec `ssh-keyscan` et signale cette vérification initiale non épinglée. Pour épingler la clé, comparer son empreinte avec celle affichée depuis la console du VPS avant de l’enregistrer.

Variables GitHub facultatives :

- `VPS_PORT` : port SSH, `22` par défaut.
- `SITE_URL` : URL publique complète du site, par exemple `https://learn.example.com/`. Lorsqu’elle est renseignée, le workflow compare les fichiers servis en HTTP avec le build envoyé, y compris les 34 MP3. Un échec de cette vérification signale le déploiement en erreur mais n’effectue pas de rollback automatique.

### Préparation du VPS

Le VPS doit disposer d’OpenSSH, `rsync`, `sha256sum` et d’un serveur statique tel que Nginx. Il n’a pas besoin de Node, Python ni de clé de synthèse vocale. Le dossier dédié est **`/var/www/TSINGHUA-Open-source-Chinese-learning`**. Le créer une fois avec un administrateur, puis en donner la propriété à l’utilisateur choisi dans `VPS_USER` (remplacer `deploy` ci-dessous) :

```sh
sudo install -d -m 755 -o deploy -g deploy /var/www/TSINGHUA-Open-source-Chinese-learning
```

La clé publique correspondant à `VPS_SSH_KEY` doit figurer dans `~/.ssh/authorized_keys` de cet utilisateur. Une clé privée protégée par passphrase n’est pas prise en charge par ce workflow non interactif.

`deploy/nginx.conf.example` est un exemple pour un domaine dédié. Adapter le nom de domaine et conserver la configuration HTTPS existante. Tester avec `sudo nginx -t` avant de recharger Nginx. Le workflow ne modifie pas la configuration Nginx et n’utilise pas `sudo` sur le VPS.

Vite génère des liens JS/CSS relatifs (`base: "./"`). Un hébergement sous un sous-dossier est donc possible ; le serveur doit rediriger l’URL du dossier sans barre finale vers l’URL avec `/`. Les MP3 et JSON doivent être servis tels quels, avec leur type MIME, et une ressource manquante doit répondre 404, pas renvoyer `index.html`.

### Vérification et publication

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:production
```

Les tests utilisent un serveur de prévisualisation du **build compilé**, sur le port 4173, et couvrent cours, quiz, dictée, audio MP3 réel et mobile. Pour utiliser un Chrome déjà installé :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome npm run test:production
```

Le workflow vérifie les pull requests, sans exposer les secrets VPS aux tests. Un push sur `main`, ou un lancement manuel depuis Actions sur `main`, déclenche ensuite le déploiement si les tests réussissent. L’artefact envoyé est exactement le build testé ; les rapports sont conservés sept jours.

L’envoi vérifie les secrets, la clé SSH, la connexion et les droits du répertoire. Il transfère les fichiers avant `index.html`, vérifie son empreinte distante et conserve les anciens fichiers JS/CSS pour les onglets déjà ouverts. Il n’efface pas les anciens assets : prévoir un nettoyage séparé des versions anciennes si nécessaire. Deux envois ne peuvent pas s’exécuter simultanément.

Le dépôt doit contenir `package-lock.json`, `public/audio/` (MP3 et manifeste), `public/strokes/` (JSON et licence), les sources et les tests. Le `.gitignore` exclut les dépendances, builds, rapports, environnements locaux et fichiers de secrets, sans exclure les ressources indispensables au site.
