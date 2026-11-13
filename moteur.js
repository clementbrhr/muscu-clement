/* ============================================================
   MOTEUR : la logique de génération des séances.
   Pas d'accès à l'écran ici : uniquement des calculs,
   pour pouvoir les vérifier automatiquement (dossier tests/).
   ============================================================ */

(function (root) {

  /* ---------- Formatage ---------- */

  function formatNombre(n) {
    return String(n).replace(".", ",");
  }

  function formatCharge(charge) {
    if (!charge) return "";
    if (charge.calibrer) {
      return "À calibrer, départ conseillé " + formatNombre(charge.depart) + " kg";
    }
    if (charge.min !== undefined && charge.max !== undefined) {
      return formatNombre(charge.min) + " à " + formatNombre(charge.max) + " kg";
    }
    var texte = formatNombre(charge.kg) + " kg";
    if (charge.par) texte += " par " + charge.par;
    return texte;
  }

  function formatReps(reps) {
    if (reps[0] === reps[1]) return String(reps[0]);
    return reps[0] + " à " + reps[1];
  }

  function formatSeries(ex) {
    var texte = ex.series + " × " + formatReps(ex.reps);
    if (ex.type === "unilateral") {
      texte += " par " + ex.membre;
      if (ex.bonusGauche) texte += " + 1 série bonus à gauche";
    }
    return texte;
  }

  function formatDuree(secondes) {
    var minutes = Math.round(secondes / 60);
    if (minutes < 60) return minutes + " min";
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + " h " + (m < 10 ? "0" + m : m);
  }

  /* ---------- Construction d'une séance ---------- */

  /* Transforme une ligne de programme ({ ex, series, reps, ... })
     en exercice complet affichable.
     charges : mes charges enregistrées, par identifiant d'exercice.
     bonusBras : mes choix de série bonus pour les bras, par identifiant. */
  function instancier(programme, ligne, charges, bonusBras) {
    var def = programme.exercices[ligne.ex];
    if (!def) throw new Error("Exercice inconnu : " + ligne.ex);
    var bonus = !!ligne.bonusGauche;
    if (def.type === "unilateral" && def.membre === "bras" && bonusBras && bonusBras[ligne.ex] !== undefined) {
      bonus = !!bonusBras[ligne.ex];
    }
    return {
      id: ligne.ex,
      nom: def.nom,
      type: def.type,
      membre: def.membre || null,
      muscle: def.muscle,
      series: ligne.series,
      reps: ligne.reps.slice(),
      bonusGauche: def.type === "unilateral" ? bonus : false,
      charge: (charges && charges[ligne.ex]) ? charges[ligne.ex] : def.charge,
      chargeDefaut: def.charge,
      consigne: def.consigne || "",
      cible: !!ligne.cible,
      cuisses: !!def.cuisses,
      biceps: !!def.biceps,
      stationPoulie: !!def.stationPoulie
    };
  }

  /* options : { tempsDispo (minutes), groupes ([...]), charges ({}), bonusBras ({}), date (Date) } */
  function construireSeance(programme, type, options) {
    options = options || {};
    var lignes = programme.seances[type];
    if (!lignes) throw new Error("Type de séance inconnu : " + type);
    var exercices = lignes.map(function (ligne) {
      return instancier(programme, ligne, options.charges, options.bonusBras);
    });
    var temps = options.temps || programme.temps;
    return {
      type: type,
      date: (options.date || new Date()).toISOString(),
      tempsDispo: options.tempsDispo || null,
      groupes: (options.groupes || []).slice(),
      exercices: exercices,
      dureeEstimee: dureeEstimee(exercices, temps),
      remplacements: [],
      coupes: []
    };
  }

  /* ---------- Durée estimée (section 7.1) ----------
     Pour chaque série : travail + repos.
     Unilatéral : gauche puis droite enchaînés (2 × travail), puis repos.
     Série bonus : un seul côté, puis repos.
     Entre deux exercices : le changement. */
  function dureeExercice(ex, temps) {
    var travailSerie = ex.type === "unilateral" ? 2 * temps.serie : temps.serie;
    var total = ex.series * (travailSerie + temps.repos);
    if (ex.bonusGauche) total += temps.serie + temps.repos;
    return total;
  }

  function dureeEstimee(exercices, temps) {
    var total = 0;
    exercices.forEach(function (ex) { total += dureeExercice(ex, temps); });
    if (exercices.length > 1) total += (exercices.length - 1) * temps.changement;
    return total;
  }

  /* ---------- Règles (section 6) ---------- */

  function seriesBiceps(exercices) {
    return exercices.filter(function (ex) { return ex.biceps; })
      .reduce(function (n, ex) { return n + ex.series + (ex.bonusGauche ? 1 : 0); }, 0);
  }

  /* Renvoie la liste des règles enfreintes (vide si tout va bien). */
  function verifier(exercices) {
    var problemes = [];
    var premierCurl = -1;
    exercices.forEach(function (ex, i) {
      if (ex.biceps && premierCurl < 0) premierCurl = i;
    });
    exercices.forEach(function (ex, i) {
      if (ex.cuisses && premierCurl >= 0 && i > premierCurl) {
        problemes.push("Cuisses après un curl : " + ex.nom);
      }
      if (i > 0 && ex.biceps && exercices[i - 1].biceps) {
        problemes.push("Deux biceps d'affilée : " + exercices[i - 1].nom + " puis " + ex.nom);
      }
    });
    return problemes;
  }

  root.MOTEUR = {
    construireSeance: construireSeance,
    dureeEstimee: dureeEstimee,
    dureeExercice: dureeExercice,
    verifier: verifier,
    seriesBiceps: seriesBiceps,
    formatCharge: formatCharge,
    formatSeries: formatSeries,
    formatReps: formatReps,
    formatDuree: formatDuree,
    formatNombre: formatNombre
  };
})(typeof window !== "undefined" ? window : globalThis);
