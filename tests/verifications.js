/* Vérifications automatiques de la section 13 du brief.
   Lancer :  node tests/verifications.js
   Chaque étape ajoute ses vérifications ici. */

require("../programme.js");
require("../moteur.js");
var P = globalThis.PROGRAMME;
var M = globalThis.MOTEUR;

var erreurs = 0;
function verifie(condition, message) {
  if (condition) { console.log("  ok   " + message); }
  else { erreurs++; console.log("  KO   " + message); }
}

/* Charges autorisées : uniquement celles du brief (section 5). */
var CHARGES_BRIEF = {
  dev_halteres: "28 kg par haltère",
  chest_press: "80 kg",
  dev_militaire_halteres: "22 kg par haltère",
  elevations_laterales: "12 kg par haltère",
  leg_press_1j: "À calibrer, départ conseillé 50 kg",
  leg_extension_1j: "À calibrer, départ conseillé 20 kg",
  curl_poulie_haute_uni: "5 à 10 kg",
  extension_overhead_haltere: "10 kg",
  tirage_vertical: "55 kg",
  rowing_haltere_uni: "30 kg",
  face_pull: "20 kg",
  leg_curl_assis_1j: "À calibrer, départ conseillé 15 kg",
  curl_ez_pupitre: "32,5 kg",
  curl_supination_uni: "14 kg"
};

["push", "pull"].forEach(function (type) {
  console.log("\nSéance " + type.toUpperCase() + " complète");
  var s = M.construireSeance(P, type, { tempsDispo: 90, date: new Date("2026-11-13T10:00:00") });

  verifie(s.exercices.length === 8, "8 exercices");
  verifie(M.verifier(s.exercices).length === 0, "cuisses avant le premier curl, jamais deux biceps d'affilée");
  verifie(s.exercices.filter(function (e) { return e.cuisses; }).length === 2, "deux exercices de cuisses");
  verifie(s.exercices.filter(function (e) { return e.cible; }).length === 1, "une seule cible de progression");

  s.exercices.forEach(function (e) {
    verifie(M.formatCharge(e.charge) === CHARGES_BRIEF[e.id], "charge de " + e.nom + " : " + M.formatCharge(e.charge));
  });

  s.exercices.filter(function (e) { return e.cuisses; }).forEach(function (e) {
    verifie(e.type === "unilateral" && e.bonusGauche, e.nom + " : unilatéral avec série bonus à gauche");
  });

  var minutes = s.dureeEstimee / 60;
  verifie(minutes >= 85 && minutes <= 90, "durée estimée entre 1 h 25 et 1 h 30 : " + M.formatDuree(s.dureeEstimee));
  console.log("  séries biceps : " + M.seriesBiceps(s.exercices));
});

console.log("\nFormatage");
verifie(M.formatDuree(5205) === "1 h 27", "1 h 27");
verifie(M.formatDuree(3480) === "58 min", "58 min");
verifie(M.formatReps([8, 10]) === "8 à 10", "8 à 10");
verifie(M.formatReps([12, 12]) === "12", "12");
verifie(M.formatNombre(32.5) === "32,5", "virgule décimale");

/* Une charge saisie par moi remplace celle du programme. */
console.log("\nCharges enregistrées");
var s2 = M.construireSeance(P, "push", { charges: { leg_press_1j: { kg: 60 } } });
verifie(M.formatCharge(s2.exercices[4].charge) === "60 kg", "leg press avec ma charge : 60 kg");
verifie(M.formatCharge(s2.exercices[0].charge) === "28 kg par haltère", "les autres charges inchangées");

/* Aucun tiret cadratin dans les textes. */
console.log("\nTextes");
var fs = require("fs");
["index.html", "app.js", "programme.js", "moteur.js"].forEach(function (f) {
  var contenu = fs.readFileSync(__dirname + "/../" + f, "utf8");
  verifie(contenu.indexOf("—") < 0, "pas de tiret cadratin dans " + f);
});

console.log("\n" + (erreurs ? erreurs + " erreur(s)" : "Tout est bon"));
process.exit(erreurs ? 1 : 0);
