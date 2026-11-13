/* ============================================================
   PROGRAMME : mes séances, mes règles et mes charges.
   Ce fichier contient les DONNÉES, pas le code.
   Pour faire évoluer le programme, c'est ici qu'on modifie.

   Charges :
     { kg: 28, par: "haltère" }     -> "28 kg par haltère"
     { kg: 80 }                     -> "80 kg"
     { min: 5, max: 10 }            -> "5 à 10 kg" (fourchette, tant que je n'ai pas saisi une charge)
     { calibrer: true, depart: 50 } -> charge inconnue, départ conseillé, l'appli me la demande

   Reps : [8, 10] -> "8 à 10", [10, 10] -> "10".
   ============================================================ */

(function (root) {
  root.PROGRAMME = {

    version: 1,

    /* ---- Paramètres de temps (section 7.1, À VALIDER) ----
       Durées en secondes. Modifiables dans les réglages. */
    temps: {
      serie: 45,          // durée d'une série (un côté pour un exercice unilatéral)
      repos: 120,         // repos après une série (après gauche + droite si unilatéral)
      changement: 90,     // changement d'exercice
      tolerance: 120      // dépassement toléré avant de couper (proposition A2)
    },

    /* ---- Catalogue des exercices (section 5, VALIDÉ) ----
       type : "bilateral" (2 côtés en même temps) ou "unilateral" (un côté à la fois).
       membre : "jambe" ou "bras", pour afficher "par jambe" / "par bras".
       biceps / cuisses : servent aux règles 3 et 4 de la section 6.
       stationPoulie : exercice bloqué si la station de tirage vertical est prise. */
    exercices: {
      dev_halteres: {
        nom: "Développé haltères", type: "bilateral", muscle: "Pectoraux",
        charge: { kg: 28, par: "haltère" },
        consigne: "Pousser vite, descendre contrôlé."
      },
      chest_press: {
        nom: "Chest press (machine)", type: "bilateral", muscle: "Pectoraux",
        charge: { kg: 80 },
        consigne: "Pousser vite, descendre contrôlé."
      },
      dev_militaire_halteres: {
        nom: "Développé militaire haltères", type: "bilateral", muscle: "Épaules",
        charge: { kg: 22, par: "haltère" }
      },
      elevations_laterales: {
        nom: "Élévations latérales", type: "bilateral", muscle: "Épaules, côté",
        charge: { kg: 12, par: "haltère" },
        consigne: "Descente contrôlée en 2 s, obligatoire."
      },
      leg_press_1j: {
        nom: "Leg press une jambe", type: "unilateral", membre: "jambe", muscle: "Cuisse",
        cuisses: true,
        charge: { calibrer: true, depart: 50 },
        consigne: "Pousser vite, descendre contrôlé."
      },
      leg_extension_1j: {
        nom: "Leg extension une jambe", type: "unilateral", membre: "jambe", muscle: "Avant de la cuisse",
        cuisses: true,
        charge: { calibrer: true, depart: 20 }
      },
      curl_poulie_haute_uni: {
        nom: "Curl poulie haute unilatéral", type: "unilateral", membre: "bras", muscle: "Biceps",
        biceps: true, stationPoulie: true,
        charge: { min: 5, max: 10 }
      },
      extension_overhead_haltere: {
        nom: "Extension overhead haltère", type: "unilateral", membre: "bras", muscle: "Triceps",
        charge: { kg: 10 }
      },
      tirage_vertical: {
        nom: "Tirage vertical (machine)", type: "bilateral", muscle: "Dos (grand dorsal)",
        stationPoulie: true,
        charge: { kg: 55 },
        consigne: "La machine monte par paliers de 5 kg : passer à 60 quand 4 × 10 propres."
      },
      rowing_haltere_uni: {
        nom: "Rowing haltère unilatéral", type: "unilateral", membre: "bras", muscle: "Dos",
        charge: { kg: 30 },
        consigne: "Tirer vite, descendre contrôlé."
      },
      face_pull: {
        nom: "Face pull (poulie haute)", type: "bilateral", muscle: "Arrière d'épaule",
        stationPoulie: true,
        charge: { kg: 20 }
      },
      leg_curl_assis_1j: {
        nom: "Leg curl assis une jambe", type: "unilateral", membre: "jambe", muscle: "Arrière de la cuisse",
        cuisses: true,
        charge: { calibrer: true, depart: 15 }
      },
      curl_ez_pupitre: {
        nom: "Curl barre EZ au pupitre", type: "bilateral", muscle: "Biceps",
        biceps: true,
        charge: { kg: 32.5 }
      },
      curl_supination_uni: {
        nom: "Curl supination unilatéral (haltère)", type: "unilateral", membre: "bras", muscle: "Biceps",
        biceps: true,
        charge: { kg: 14 },
        consigne: "Si le bras gauche bloque : 7 reps, pause 5 s, finir la série. Ne pas redescendre à 12 kg."
      }
    },

    /* ---- Les deux séances complètes (section 5, VALIDÉ) ----
       cible : la seule cible de progression de la séance (règle 7).
       bonusGauche : série bonus à gauche (règle 6). VALIDÉ pour les cuisses.
       Pour les bras, À VALIDER exercice par exercice (interrupteur dans les réglages). */
    seances: {
      push: [
        { ex: "dev_halteres", series: 4, reps: [8, 10], cible: true },
        { ex: "chest_press", series: 3, reps: [10, 10] },
        { ex: "dev_militaire_halteres", series: 3, reps: [8, 10] },
        { ex: "elevations_laterales", series: 3, reps: [12, 12] },
        { ex: "leg_press_1j", series: 2, reps: [10, 12], bonusGauche: true },
        { ex: "leg_extension_1j", series: 2, reps: [12, 12], bonusGauche: true },
        { ex: "curl_poulie_haute_uni", series: 3, reps: [10, 12] },
        { ex: "extension_overhead_haltere", series: 3, reps: [10, 12] }
      ],
      pull: [
        { ex: "tirage_vertical", series: 4, reps: [8, 10], cible: true },
        { ex: "rowing_haltere_uni", series: 3, reps: [10, 10] },
        { ex: "face_pull", series: 3, reps: [12, 12] },
        { ex: "leg_press_1j", series: 2, reps: [10, 12], bonusGauche: true },
        { ex: "leg_curl_assis_1j", series: 2, reps: [10, 12], bonusGauche: true },
        { ex: "curl_ez_pupitre", series: 3, reps: [10, 12] },
        { ex: "elevations_laterales", series: 3, reps: [12, 12] },
        { ex: "curl_supination_uni", series: 3, reps: [10, 10] }
      ]
    },

    /* ---- Textes affichés (section 6) ---- */
    textes: {
      securiteCuisses: "Douleur sur l'extérieur de la jambe gauche ou à la cheville : j'arrête l'exercice.",
      protocoleAsymetrie: "Gauche d'abord. La droite fait le même nombre de reps que la gauche.",
      cible: "Cible de progression de la séance. On monte la charge quand toutes les séries atteignent le haut de la fourchette."
    }

    /* Les ordres de coupe (section 7), les ajouts (section 8) et les
       remplacements (section 9) seront ajoutés ici aux étapes 3, 4 et 5,
       une fois validés. */
  };
})(typeof window !== "undefined" ? window : globalThis);
