# Contribuer à SpaceClean 🧹

Merci de vouloir contribuer ! Voici les directives à suivre.

## 📋 Code de conduite

- Soyez respectueux et bienveillant
- Accueillez les nouveaux contributeurs
- Critiquez le code, pas la personne

## 🐛 Signaler un bug

Ouvrez une [issue](https://github.com/lilialr/spaceclean/issues) avec :

1. **Titre clair** qui résume le problème
2. **Étapes pour reproduire** (minimales et précises)
3. **Comportement attendu** vs **comportement observé**
4. **Environnement** : OS, version de Node.js, version d'Electron
5. **Captures d'écran** si pertinent

## 💡 Proposer une fonctionnalité

Ouvrez une [issue](https://github.com/lilialr/spaceclean/issues) avec :

1. **Description** du besoin / cas d'usage
2. **Comportement souhaité**
3. **Alternatives** envisagées
4. **Maquettes / esquisses** (optionnel mais apprécié)

## 🔧 Modifier le code

### 1. Fork et branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

Utilisez des préfixes de branche :
- `feature/` — nouvelle fonctionnalité
- `fix/` — correction de bug
- `refactor/` — refactoring
- `docs/` — documentation

### 2. Style de code

- **Pas de commentaires** dans le code — le code doit être auto-documenté
- Nommage clair en anglais (variables, fonctions)
- 2 espaces d'indentation
- Utilisez `const` et `let`, pas `var`
- Fonctions courtes et ciblées (une responsabilité)
- Suivez les conventions existantes du projet

### 3. Commits

```bash
git commit -m "type: message impératif concis"
```

Types : `feat`, `fix`, `refactor`, `docs`, `style`, `chore`

Exemples :
- `feat: add dark mode toggle`
- `fix: correct treemap aspect ratio calculation`
- `docs: update installation instructions`

### 4. Tests

- Assurez-vous que l'application se lance sans erreur : `npm start`
- Testez manuellement les fonctionnalités modifiées
- Vérifiez qu'il n'y a pas d'erreurs dans la console DevTools

### 5. Pull Request

1. **Push**z votre branche
2. Ouvrez une **Pull Request** vers `main`
3. Remplissez le template de PR
4. Assurez-vous que la PR est _reviewable_ (pas trop de changements)
5. Un mainteneur validera et mergera

## ❓ Questions

Ouvrez une [discussion](https://github.com/lilialr/spaceclean/discussions) pour toute question.

---

Merci encore ! 🎉
