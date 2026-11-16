/* ============================================================
   APP : les écrans et ce qui est enregistré dans le téléphone.
   ============================================================ */

(function () {
  var P = window.PROGRAMME;
  var M = window.MOTEUR;
  var CLE = "maseance.v1";
  var VERSION_APP = "0.2.0";

  /* ---------- Ce qui est enregistré dans le téléphone ---------- */

  var etat = charger();

  function etatVide() {
    return {
      choix: { type: null, tempsDispo: 60, groupes: [] },
      seance: null,              // la séance du jour, une fois générée
      dernierTypeTermine: null,  // "push" ou "pull", pour l'alternance
      charges: {},               // mes charges modifiées, par exercice
      bonusBras: {}              // série bonus à gauche pour les bras, par exercice
    };
  }

  function charger() {
    try {
      var brut = localStorage.getItem(CLE);
      if (!brut) return etatVide();
      var e = JSON.parse(brut);
      var base = etatVide();
      Object.keys(base).forEach(function (k) { if (e[k] === undefined) e[k] = base[k]; });
      return e;
    } catch (err) {
      return etatVide();
    }
  }

  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (err) { /* stockage indisponible */ }
  }

  /* ---------- Outils ---------- */

  function $(id) { return document.getElementById(id); }

  function el(tag, classe, texte) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texte !== undefined) n.textContent = texte;
    return n;
  }

  function dateLisible(d) {
    var t = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function typeParDefaut() {
    if (etat.dernierTypeTermine === "push") return "pull";
    if (etat.dernierTypeTermine === "pull") return "push";
    return "push";
  }

  /* ---------- Navigation ---------- */

  function montrer(nomEcran) {
    document.querySelectorAll(".ecran").forEach(function (e) {
      e.classList.toggle("actif", e.id === "ecran-" + nomEcran);
    });
    document.querySelectorAll(".nav button").forEach(function (b) {
      b.classList.toggle("actif", b.dataset.ecran === nomEcran);
    });
    window.scrollTo(0, 0);
    if (nomEcran === "seance") rendreSeance();
    if (nomEcran === "aujourdhui") rendreAujourdhui();
  }

  document.querySelectorAll(".nav button").forEach(function (b) {
    b.addEventListener("click", function () { montrer(b.dataset.ecran); });
  });

  /* ---------- Écran Aujourd'hui ---------- */

  var GROUPES = [
    { id: "triceps", nom: "Triceps" },
    { id: "epaules", nom: "Épaules" },
    { id: "abdos", nom: "Abdos et obliques" },
    { id: "biceps", nom: "Biceps" }
  ];
  var TEMPS = [45, 60, 75, 90];

  function rendreAujourdhui() {
    $("date-jour").textContent = dateLisible(new Date());
    if (!etat.choix.type) etat.choix.type = typeParDefaut();

    var defaut = typeParDefaut();
    $("aide-type").textContent = etat.dernierTypeTermine
      ? "Dernière séance terminée : " + etat.dernierTypeTermine.toUpperCase() + ". Proposée : " + defaut.toUpperCase() + "."
      : "Aucune séance terminée pour l'instant. Proposée : " + defaut.toUpperCase() + ".";

    document.querySelectorAll("#choix-type .choix").forEach(function (b) {
      b.classList.toggle("actif", b.dataset.type === etat.choix.type);
    });

    var libre = TEMPS.indexOf(etat.choix.tempsDispo) < 0;
    document.querySelectorAll("#choix-temps .choix").forEach(function (b) {
      var v = b.dataset.temps;
      b.classList.toggle("actif", v === "autre" ? libre : Number(v) === etat.choix.tempsDispo);
    });
    $("temps-libre").classList.toggle("cache", !libre);
    if (libre) $("temps-libre").value = etat.choix.tempsDispo || "";

    document.querySelectorAll("#choix-groupes .choix").forEach(function (b) {
      b.classList.toggle("actif", etat.choix.groupes.indexOf(b.dataset.groupe) >= 0);
    });

    $("btn-reprendre").classList.toggle("cache", !etat.seance);
    if (etat.seance) {
      $("btn-reprendre").textContent = "Reprendre la séance " + etat.seance.type.toUpperCase() + " en cours";
    }
  }

  document.querySelectorAll("#choix-type .choix").forEach(function (b) {
    b.addEventListener("click", function () {
      etat.choix.type = b.dataset.type; sauver(); rendreAujourdhui();
    });
  });

  document.querySelectorAll("#choix-temps .choix").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.temps === "autre") {
        etat.choix.tempsDispo = Number($("temps-libre").value) || 0;
        $("temps-libre").classList.remove("cache");
        $("temps-libre").focus();
      } else {
        etat.choix.tempsDispo = Number(b.dataset.temps);
      }
      sauver(); rendreAujourdhui();
    });
  });

  $("temps-libre").addEventListener("input", function () {
    etat.choix.tempsDispo = Number(this.value) || 0;
    sauver();
  });

  document.querySelectorAll("#choix-groupes .choix").forEach(function (b) {
    b.addEventListener("click", function () {
      var g = b.dataset.groupe;
      var i = etat.choix.groupes.indexOf(g);
      if (i >= 0) etat.choix.groupes.splice(i, 1); else etat.choix.groupes.push(g);
      sauver(); rendreAujourdhui();
    });
  });

  $("btn-generer").addEventListener("click", function () {
    etat.seance = M.construireSeance(P, etat.choix.type, {
      tempsDispo: etat.choix.tempsDispo,
      groupes: etat.choix.groupes,
      charges: etat.charges,
      bonusBras: etat.bonusBras
    });
    sauver();
    montrer("seance");
  });

  $("btn-reprendre").addEventListener("click", function () { montrer("seance"); });

  /* ---------- Écran Séance ---------- */

  function rendreSeance() {
    var zone = $("contenu-seance");
    zone.innerHTML = "";
    var s = etat.seance;
    if (!s) {
      zone.appendChild(el("p", "muted", "Pas de séance générée. Va dans Aujourd'hui."));
      return;
    }

    var entete = el("div", "entete-seance");
    entete.appendChild(el("span", "type", s.type.toUpperCase()));
    entete.appendChild(el("span", "muted", dateLisible(new Date(s.date))));
    zone.appendChild(entete);

    var resume = el("div", "resume");
    resume.appendChild(el("span", "", "Estimée : " + M.formatDuree(s.dureeEstimee)));
    if (s.tempsDispo) resume.appendChild(el("span", "", "Dispo : " + s.tempsDispo + " min"));
    resume.appendChild(el("span", "", "Séries biceps : " + M.seriesBiceps(s.exercices)));
    zone.appendChild(resume);

    if (s.tempsDispo && s.dureeEstimee > s.tempsDispo * 60) {
      zone.appendChild(el("p", "muted petit", "La séance dépasse le temps disponible. L'adaptation au temps arrive à l'étape 3."));
    }
    if (s.groupes.length) {
      zone.appendChild(el("p", "muted petit", "Groupes à rajouter choisis : " + s.groupes.join(", ") + ". Les ajouts arrivent à l'étape 4."));
    }

    var problemes = M.verifier(s.exercices);
    problemes.forEach(function (pb) { zone.appendChild(el("p", "alerte", "Règle enfreinte : " + pb)); });

    s.exercices.forEach(function (ex, i) {
      var carte = el("div", "carte exo");
      var titre = el("div", "titre");
      titre.appendChild(el("span", "numero", String(i + 1)));
      titre.appendChild(el("span", "nom", ex.nom));
      carte.appendChild(titre);

      if (ex.cible) carte.appendChild(el("span", "badge", "Cible de progression"));
      if (ex.type === "unilateral") carte.appendChild(el("span", "badge gauche", "Gauche d'abord"));

      carte.appendChild(el("div", "series", M.formatSeries(ex)));
      carte.appendChild(el("div", "charge", M.formatCharge(ex.charge)));

      if (ex.type === "unilateral") carte.appendChild(el("div", "consigne", P.textes.protocoleAsymetrie));
      if (ex.consigne) carte.appendChild(el("div", "consigne", ex.consigne));
      if (ex.cible) carte.appendChild(el("div", "consigne", P.textes.cible));
      if (ex.cuisses) carte.appendChild(el("div", "alerte", P.textes.securiteCuisses));

      zone.appendChild(carte);
    });

    var fin = el("p", "muted petit", "Étape 1 : affichage seul. Les cases à cocher, la modification des charges, Démarrer et Terminer arrivent à l'étape 2.");
    zone.appendChild(fin);
  }

  /* ---------- Écran Réglages (étape 1 : état et tests) ---------- */

  function voyant(id, ok, texte) {
    var pt = $("pt-" + id);
    pt.className = "point " + (ok === null ? "" : ok ? "ok" : "ko");
    $("txt-" + id).textContent = texte;
  }

  var installee = window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  voyant("install", installee ? true : null, installee
    ? "Installée sur l'écran d'accueil"
    : "Pas encore installée : bouton Partager, puis Sur l'écran d'accueil");

  function majReseau() {
    voyant("reseau", navigator.onLine, navigator.onLine ? "Réseau : connecté" : "Réseau : hors ligne");
  }
  majReseau();
  window.addEventListener("online", majReseau);
  window.addEventListener("offline", majReseau);

  if ("serviceWorker" in navigator) {
    /* Quand une nouvelle version de l'appli est installée, on recharge
       la page une fois pour l'afficher tout de suite. */
    var avaitUneVersion = !!navigator.serviceWorker.controller;
    var dejaRecharge = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!avaitUneVersion) { voyant("cache", true, "Hors ligne : prêt"); return; }
      if (dejaRecharge) return;
      dejaRecharge = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("sw.js").then(function (reg) {
      if (navigator.serviceWorker.controller) {
        voyant("cache", true, "Hors ligne : prêt");
      } else {
        voyant("cache", null, "Hors ligne : enregistrement en cours, recharge une fois");
      }
      reg.addEventListener("updatefound", function () {
        var nouveau = reg.installing;
        nouveau.addEventListener("statechange", function () {
          if (nouveau.state === "activated") voyant("cache", true, "Hors ligne : prêt, mise à jour installée");
        });
      });
    }).catch(function () {
      voyant("cache", false, "Hors ligne : impossible d'enregistrer l'appli");
    });
  } else {
    voyant("cache", false, "Hors ligne : non pris en charge");
  }

  $("btn-copie").addEventListener("click", function () {
    var texte = "Test de copie depuis Ma séance, " + new Date().toLocaleString("fr-FR");
    var msg = $("msg-copie");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () {
        msg.textContent = "Copié. Colle dans Notes pour vérifier.";
      }).catch(function () {
        msg.textContent = "La copie a échoué. Dis-le moi.";
      });
    } else {
      msg.textContent = "Copie non prise en charge. Dis-le moi.";
    }
  });

  $("btn-effacer").addEventListener("click", function () {
    if (!confirm("Effacer la séance du jour et les choix ? Les charges sont conservées.")) return;
    etat.seance = null;
    etat.choix = etatVide().choix;
    sauver();
    rendreAujourdhui();
    montrer("aujourdhui");
  });

  $("version").textContent = VERSION_APP;

  /* ---------- Démarrage ---------- */
  montrer(etat.seance ? "seance" : "aujourdhui");
})();
