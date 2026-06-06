# SpaceClean 🧹💾

> Visualiseur d'espace disque interactif en Electron — Transformez votre espace disque en une **carte de blocs colorés** où chaque bloc grossit selon la place qu'il prend.

![Electron](https://img.shields.io/badge/Electron-42.3-47848F?logo=electron&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows-0078D4?logo=windows)

---

## ✨ Aperçu

SpaceClean analyse vos dossiers et **matérialise l'espace disque** sous forme de **treemap** : les dossiers et fichiers qui prennent le plus de place apparaissent en gros blocs, ceux qui en prennent moins en petits blocs. Chaque bloc est coloré et porte le nom du dossier/fichier.

| Fonctionnalité | Description |
|---|---|
| 🔍 **Scan** | Analyse récursive de n'importe quel dossier |
| 🗺️ **Treemap** | Visualisation interactive en blocs proportionnels |
| 🎨 **Couleurs** | Chaque dossier a une couleur unique basée sur son nom |
| 🔎 **Zoom** | Cliquez sur un dossier pour zoomer dedans |
| 📋 **Détails** | Panneau latéral avec nom, taille, chemin |
| 🖱️ **Infobulle** | Survolez un bloc pour voir son nom et sa taille |
| ⚡ **Dossiers rapides** | `Program Files`, `Users`, etc. en un clic |

---

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/spaceclean.git
cd spaceclean

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

> ⚠️ **Prérequis** : [Node.js](https://nodejs.org/) (v16+) et npm installés.

---

## 🖼️ Utilisation

1. **Lancez** l'application avec `npm start`
2. **Cliquez** sur « Analyser un dossier » ou choisissez un dossier rapide dans la barre latérale
3. **Observez** la carte : les gros blocs = gros consommateurs d'espace
4. **Cliquez** sur un bloc dossier pour descendre dans son arborescence
5. **Double-clic** ou **Échap** pour remonter

### Raccourcis

| Action | Raccourci |
|---|---|
| Revenir en arrière | `Échap` ou `Backspace` |
| Zoom avant | Clic gauche sur un dossier |
| Zoom arrière | Double-clic |
| Voir les détails | Clic gauche sur un fichier |

---

## 🧱 Structure du projet

```plaintext
spaceclean/
├── main.js                 # Processus Electron principal
│                           #   - Création de la fenêtre
│                           #   - Scan disque (IPC)
│                           #   - Calcul récursif des tailles
├── preload.js              # Pont sécurisé (contextBridge)
├── renderer/
│   ├── index.html          # Structure HTML
│   ├── style.css           # Thème sombre
│   └── app.js              # Treemap Canvas + intéractions
├── package.json
└── README.md
```

---

## 🧠 Comment ça marche

### Scan disque (`main.js`)

Le scan est effectué dans le **processus main** via `fs.readdirSync` et `fs.statSync`. La fonction `getDirSize()` parcourt récursivement l'arborescence jusqu'à 3 niveaux de profondeur et calcule la taille cumulée de chaque dossier.

```js
// Exemple de structure renvoyée au renderer
{
  name: "Program Files",
  path: "C:\\Program Files",
  size: 12582912000, // 11.7 Go
  isDir: true,
  children: [
    { name: "Google", size: 4294967296, ... },
    { name: "Microsoft", size: 8589934592, ... }
  ]
}
```

### Treemap (`app.js`)

L'algorithme **Squarified Treemap** (Bruls, Huizing, van Wijk) dispose les blocs pour minimiser les proportions allongées :

```
┌──────┬──────────┬──────┐
│      │          │      │
│   A  │     B    │  C   │
│      │          │      │
├──────┴────┬─────┴──────┤
│           │            │
│     D     │     E      │
│           │            │
└───────────┴────────────┘
```

Les couleurs sont générées par **hash du nom** → teinte HSL, avec la luminosité qui varie selon la taille relative.

---

## 🛠️ Développement

```bash
# Mode développement (ouvre DevTools automatiquement)
npm run dev

# Architecture
# - main.js : processus main (Node.js + Electron)
# - renderer/ : processus renderer (Chromium)
# - preload.js : API bridge sécurisé
```

---

## 📦 Dépendances

- [Electron](https://www.electronjs.org/) — Framework d'application desktop
- Aucune autre dépendance runtime — tout est en vanilla JS/Node.js

---

## 📄 License

MIT © 2026

---

## 🙌 Contributions

Les issues et PRs sont les bienvenues ! Pour les changements majeurs, ouvrez d'abord une issue pour discuter de ce que vous souhaitez changer.
