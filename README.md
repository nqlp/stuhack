# StuHack — PDF export repair

Fork communautaire de [isanchop/stuhack](https://github.com/isanchop/stuhack), dont le développement a été interrompu. Cette version **0.5.9** corrige plusieurs problèmes d’export PDF et d’initialisation dans les navigateurs Chromium.

## Ce qui a changé

- Copie des feuilles de styles avec `rel="preload stylesheet"`, indispensables aux polices et à la mise en page des documents.
- Conservation du contexte CSS `.p2hv` et des transformations du texte pdf2htmlEX.
- Un format d’impression adapté à chaque page, pour éviter les pages blanches supplémentaires.
- Un bouton **Print loaded pages** indépendant du bouton Download du site.
- Détection des pages ajoutées après le chargement initial et vérifications des éléments manquants.
- Compteur des pages exportées, signalement des pages vides et des images non chargées.
- Conservation de l’image existante si la tentative de chargement d’une image alternative échoue.

## Installation dans Brave ou Chrome

1. Télécharge ce dépôt avec **Code → Download ZIP**, puis décompresse-le.
2. Ouvre `brave://extensions` ou `chrome://extensions`.
3. Désactive l’ancienne version de StuHack si elle est installée.
4. Active le **Mode développeur**.
5. Clique sur **Charger l’extension non empaquetée / Load unpacked** et sélectionne le dossier contenant `manifest.json`.
6. Recharge l’onglet du document.

Aucun `npm install` n’est nécessaire pour utiliser l’extension. Les dépendances npm servent uniquement aux tests.

Pour une mise à jour, remplace les fichiers dans le dossier déjà chargé, clique sur **Recharger** dans la page des extensions, puis recharge l’onglet du document.

## Exporter un document

1. Fais défiler lentement le document jusqu’à la dernière page pour charger le contenu.
2. Clique sur **Print loaded pages**, en bas à droite.
3. Vérifie le compteur et le contenu de l’aperçu. Un compteur complet ne garantit pas que toutes les images ou tous les textes sont disponibles.
4. Attends le chargement des images et des polices.
5. Utilise **Ctrl+P → Enregistrer au format PDF**. Désactive les en-têtes et pieds de page et conserve le format de page CSS lorsqu’il est proposé.

Si le navigateur bloque la fenêtre, autorise les fenêtres contextuelles pour ce site et réessaie.

## Validation et limites

La version 0.5.9 a été testée dans Brave sur la sauvegarde HTML d’un document de **17 pages**. Le PDF obtenu contenait 17 pages, toutes vérifiées visuellement. Les régressions automatisées couvrent notamment le chargement tardif du lecteur, les éléments absents, les pages cachées, les espaces entre les nœuds HTML, les fenêtres bloquées et les échecs de chargement d’images.

Ce résultat ne garantit pas la compatibilité avec tous les documents ou toutes les futures versions du site. L’extension exporte les pages présentes dans le lecteur ; elle ne récupère pas le contenu que le serveur ne fournit pas. Elle dépend actuellement de la structure `#page-container .page-content`.

Les documents, captures de navigation, URL signées et données de session utilisés pendant le diagnostic ne sont pas inclus dans ce dépôt. Les tests publiés utilisent uniquement des exemples fictifs.

## Développement et tests

Prérequis : Node.js 24 ou plus récent.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

Pour tester avec un navigateur Chromium déjà installé, définis `BROWSER_EXECUTABLE` avec son chemin. Exemple PowerShell pour Brave :

```powershell
$env:BROWSER_EXECUTABLE = 'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe'
npm run test:browser
```

Le test navigateur écrit ses captures de test dans le dossier temporaire du système. Aucun téléchargement de document réel n’est effectué par les tests.

## Signaler un problème

Indique la version de l’extension, le navigateur, le nombre de pages attendu et le nombre exporté. Si possible, joins une capture du défaut en masquant les données personnelles. Ne publie pas de cookies, de liens signés ou de sauvegardes HTML contenant des informations de session.

## Crédits et licence

Projet original : [isanchop/stuhack](https://github.com/isanchop/stuhack). Correctifs de ce fork : [nqlp](https://github.com/nqlp).

Le dépôt amont ne contient pas de fichier de licence explicite à la révision utilisée (`f0622dc796ccfdc2e1435a3b111d57a8eb0faf70`). Ce fork n’ajoute aucune licence au code hérité ; sa publication ne constitue pas une nouvelle autorisation générale de réutilisation.
