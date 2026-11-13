# Ma séance du jour

Appli web perso, pensée pour iPhone, qui génère ma séance de musculation du jour (Push ou Pull) à partir du temps disponible, des groupes à rajouter et du matériel libre.

- Installable sur l'écran d'accueil (PWA), fonctionne hors ligne.
- Aucun serveur, aucun compte : tout est enregistré dans le téléphone.
- Le programme (séances, règles, remplacements) vit dans un fichier de données séparé du code.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'appli (écrans, styles, logique). |
| `manifest.json` | Nom, icônes et couleurs pour l'installation sur l'écran d'accueil. |
| `sw.js` | Service worker : copie de l'appli dans le téléphone pour le hors ligne. Changer `VERSION` à chaque livraison. |
| `icons/` | Icônes de l'appli. |

## Avancement

- [x] Étape 0 : coquille installable, hors ligne, tests de copie et des liens Claude.
- [ ] Étape 1 : écran "Aujourd'hui" et séance complète.
- [ ] Étape 2 : écran "Séance" (séries, charges, démarrer / terminer, alternance).
- [ ] Étape 3 : adaptation au temps.
- [ ] Étape 4 : groupes rajoutés.
- [ ] Étape 5 : remplacements.
- [ ] Étape 6 : réglages, export et import.
- [ ] Étape 7 : bouton "Demander à Claude".
- [ ] Étape 8 : vérification complète.
