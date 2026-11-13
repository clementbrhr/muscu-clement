# Ma séance du jour

Appli web perso, pensée pour iPhone, qui génère ma séance de musculation du jour (Push ou Pull) à partir du temps disponible, des groupes à rajouter et du matériel libre.

- Installable sur l'écran d'accueil (PWA), fonctionne hors ligne.
- Aucun serveur, aucun compte : tout est enregistré dans le téléphone.
- Le programme (séances, règles, remplacements) vit dans un fichier de données séparé du code.

## Fichiers

| Fichier | Rôle |
|---|---|
| `programme.js` | **Les données** : séances, charges, règles, textes. C'est ici qu'on fait évoluer le programme. |
| `moteur.js` | La logique : construction d'une séance, durée estimée, vérification des règles. Pas d'écran. |
| `app.js` | Les écrans (Aujourd'hui, Séance, Réglages) et ce qui est enregistré dans le téléphone. |
| `index.html`, `style.css` | La page et son style. |
| `manifest.json` | Nom, icônes et couleurs pour l'installation sur l'écran d'accueil. |
| `sw.js` | Service worker : copie de l'appli dans le téléphone pour le hors ligne. Changer `VERSION` à chaque livraison. |
| `icons/` | Icônes de l'appli. |
| `tests/verifications.js` | Vérifications automatiques de la section 13 du brief : `node tests/verifications.js`. |

## Avancement

- [x] Étape 0 : coquille installable, hors ligne, tests de copie et des liens Claude.
- [x] Étape 1 : écran "Aujourd'hui" et séance complète (affichage seul, durée estimée).
- [ ] Étape 2 : écran "Séance" (séries, charges, démarrer / terminer, alternance).
- [ ] Étape 3 : adaptation au temps.
- [ ] Étape 4 : groupes rajoutés.
- [ ] Étape 5 : remplacements.
- [ ] Étape 6 : réglages, export et import.
- [ ] Étape 7 : bouton "Demander à Claude".
- [ ] Étape 8 : vérification complète.
