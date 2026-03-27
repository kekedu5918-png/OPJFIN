
'use strict';
/* ═══════════════════════════════════════════════════════
   OPJ ELITE v51.0 — Script unique, architecture propre
   Ordre : VERSION → SUPABASE → GRADES → CHAPTERS → QB → FB
         → STATE → FSRS → NAV → RENDER → FEATURES → BOOT
   ═══════════════════════════════════════════════════════ */

/* ─── VERSION ─── */
const APP_VERSION='v51.0', STORAGE_KEY='opje_v51', STATE_VERSION=51;

/* ═══════════════════════════════════════════════════════════════════════════
   SUPABASE CONFIGURATION — Auth + Sync + Stripe Ready
   ═══════════════════════════════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://vwkymggfxgkfbbklkhhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3a3ltZ2dmeGdrZmJia2xraGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDgwMzUsImV4cCI6MjA4OTk4NDAzNX0.Tej5sI0KPvn3UN_G79l001GzDlJ6Xk9BJlI9zWAS7EY';

// Client Supabase
let supabaseClient = null;
let currentUser = null;
let syncTimeout = null;

// Initialiser Supabase
function initSupabase() {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[OPJ] Supabase initialisé');
    return true;
  }
  console.warn('[OPJ] Supabase SDK non chargé');
  return false;
}

// ─── AUTH FUNCTIONS ───
const AUTH = {
  // Inscription par email/password
  async signup(email, password, name) {
    if (!supabaseClient) return { error: { message: 'Supabase non initialisé' } };
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) return { error };
      // Mettre à jour le profil avec le nom
      if (data.user) {
        await supabaseClient.from('profiles').update({ name, email }).eq('id', data.user.id);
      }
      return { data };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  // Connexion par email/password
  async login(email, password) {
    if (!supabaseClient) return { error: { message: 'Supabase non initialisé' } };
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return { error };
      currentUser = data.user;
      return { data };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  // Magic link (connexion sans mot de passe)
  async magicLink(email) {
    if (!supabaseClient) return { error: { message: 'Supabase non initialisé' } };
    try {
      const { data, error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      return { data, error };
    } catch (e) {
      return { error: { message: e.message } };
    }
  },

  // Déconnexion
  async logout() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    currentUser = null;
    S = defaultState();
    save();
    showAuthScreen();
    showToast('Déconnecté', 'ok');
  },

  // Récupérer la session actuelle
  async getSession() {
    if (!supabaseClient) return null;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) currentUser = session.user;
    return session;
  },

  // Écouter les changements d'auth
  onAuthChange(callback) {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
      currentUser = session?.user || null;
      callback(event, session);
    });
  }
};

// ─── SYNC FUNCTIONS ───
const SYNC = {
  // Sauvegarder la progression dans Supabase
  async saveProgress() {
    if (!supabaseClient || !currentUser) return false;
    try {
      const { error } = await supabaseClient.from('progress').upsert({
        user_id: currentUser.id,
        xp: S.user.xp,
        streak: S.user.streak,
        streak_record: S.user.streakRecord || 0,
        last_activity: S.user.lastActivity,
        sessions_done: S.user.sessionsDone || 0,
        qcm_cards: S.qcm.cards,
        lessons: S.lessons,
        fiches: S.fiches,
        badges: S.badges,
        activity: S.activity,
        shield: S.shield,
        annales_done: S.annalesDone,
        blitz_best: S.blitzBest || 0,
        cr_done: S.crDone || 0,
        tc_done: S.tcDone || 0,
        perfect_sessions: S.perfectSessions || 0,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      if (error) console.warn('[SYNC] Erreur save:', error);
      return !error;
    } catch (e) {
      console.warn('[SYNC] Exception:', e);
      return false;
    }
  },

  // Charger la progression depuis Supabase
  async loadProgress() {
    if (!supabaseClient || !currentUser) return false;
    try {
      // Charger le profil
      const { data: profile } = await supabaseClient.from('profiles')
        .select('*').eq('id', currentUser.id).single();
      
      // Charger la progression
      const { data: progress } = await supabaseClient.from('progress')
        .select('*').eq('user_id', currentUser.id).single();
      
      // Charger l'abonnement
      const { data: sub } = await supabaseClient.from('subscriptions')
        .select('*').eq('user_id', currentUser.id).single();

      if (profile) {
        S.user.name = profile.name || 'Officier';
        S.user.examDate = profile.exam_date || '2026-06';
      }
      if (progress) {
        S.user.xp = progress.xp || 0;
        S.user.streak = progress.streak || 0;
        S.user.streakRecord = progress.streak_record || 0;
        S.user.lastActivity = progress.last_activity;
        S.user.sessionsDone = progress.sessions_done || 0;
        S.qcm.cards = progress.qcm_cards || {};
        S.lessons = progress.lessons || {};
        S.fiches = progress.fiches || {};
        S.badges = progress.badges || {};
        S.activity = progress.activity || {};
        S.shield = progress.shield || { count: 1, lastEarned: null };
        S.annalesDone = progress.annales_done || {};
        S.blitzBest = progress.blitz_best || 0;
        S.crDone = progress.cr_done || 0;
        S.tcDone = progress.tc_done || 0;
        S.perfectSessions = progress.perfect_sessions || 0;
      }
      if (sub) {
        S.isPro = sub.is_pro || false;
        S.user.isPRO = sub.is_pro || false;
        S.proExpiry = sub.expires_at;
        S.stripeCustId = sub.stripe_customer_id;
      }
      return true;
    } catch (e) {
      console.warn('[SYNC] Load error:', e);
      return false;
    }
  },

  // Mettre à jour le profil
  async updateProfile(name, examDate) {
    if (!supabaseClient || !currentUser) return false;
    try {
      const { error } = await supabaseClient.from('profiles').update({
        name, exam_date: examDate, updated_at: new Date().toISOString()
      }).eq('id', currentUser.id);
      return !error;
    } catch (e) { return false; }
  },

  // Sync debounced (évite trop d'appels)
  debouncedSave() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      SYNC.saveProgress();
    }, 2000); // Sync après 2s d'inactivité
  }
};

// ─── STRIPE PREPARATION ───
const STRIPE = {
  // URLs des API Stripe (à configurer avec tes Cloud Functions)
  checkoutUrl: 'https://YOUR_STRIPE_FUNCTION/create-checkout',
  portalUrl: 'https://YOUR_STRIPE_FUNCTION/customer-portal',

  // Créer une session de paiement
  async createCheckout(plan) {
    if (!currentUser) {
      showToast('Connectez-vous d\'abord', 'err');
      return;
    }
    try {
      // TODO: Remplacer par ton endpoint Stripe
      showToast('🔧 Paiement Stripe en cours d\'intégration...', 'warn');
      /* 
      const res = await fetch(STRIPE.checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          plan: plan, // '2m' ou '6m'
          successUrl: window.location.origin + '?payment=success',
          cancelUrl: window.location.origin + '?payment=cancel'
        })
      });
      const { url } = await res.json();
      window.location.href = url;
      */
    } catch (e) {
      showToast('Erreur paiement: ' + e.message, 'err');
    }
  },

  // Vérifier le statut PRO
  async checkProStatus() {
    if (!supabaseClient || !currentUser) return false;
    const { data } = await supabaseClient.from('subscriptions')
      .select('is_pro, expires_at').eq('user_id', currentUser.id).single();
    if (data?.is_pro && new Date(data.expires_at) > new Date()) {
      S.isPro = true;
      S.user.isPRO = true;
      return true;
    }
    return false;
  }
};

/* ─── GRADES ─── */
const GRADES=[
  {name:'Gardien de la Paix',min:0,icon:'👮'},
  {name:'Gardien Principal',min:200,icon:'👮‍♂️'},
  {name:'Brigadier',min:500,icon:'⭐'},
  {name:'Brigadier-Chef',min:1000,icon:'⭐⭐'},
  {name:'Major',min:1800,icon:'🌟'},
  {name:'Commandant',min:3000,icon:'🏅'},
  {name:'Commandant Divisionnaire',min:5000,icon:'🎖️'},
  {name:'Officier de Police Judiciaire',min:8000,icon:'🏆'},
];

const CHAPTERS=[
{id:'ch1',num:'01',title:'L\'OPJ & le Procès Pénal',sub:'Missions · Compétences · Contrôle',color:'#4d8fff',bg:'rgba(77,143,255,.12)',icon:'⚖️',
lessons:[
  {id:'L101',em:'⚖️',name:'Le Procès Pénal',ref:'Art. 1 CPP',xp:10,
    intro:'Le procès pénal est la réponse de la société à une infraction. Il se décompose en plusieurs phases séquentielles, et l\'OPJ est le premier acteur judiciaire.',
    secs:[
      {t:'Les 4 phases du procès pénal',items:['<b>1. Enquête</b> — Phase policière (OPJ/APJ). Constatation, preuves, arrestation.','<b>2. Poursuites</b> — Décision du Parquet. Classement, alternatives, renvoi.','<b>3. Instruction</b> — Phase facultative (JI). Mise en examen, mandats, clôture.','<b>4. Jugement</b> — Tribunal compétent selon la nature de l\'infraction.']},
      {t:'La tripartition des infractions',items:['<b class="art">Crime</b> → Réclusion criminelle / perpétuité → <b>Cour d\'assises</b>','<b class="art">Délit</b> → Emprisonnement + amende → <b>Tribunal correctionnel</b>','<b class="art">Contravention</b> → Amende ≤ 1 500 € → <b>Tribunal de police</b>']},
    ],
    traps:['Confondre les juridictions : Assises = CRIMES uniquement. Correctionnel = DÉLITS. Tribunal de police = CONTRAVENTIONS.'],
    keys:['Art. 111-1 CP : tripartition crimes/délits/contraventions','Classification détermine la compétence, les peines, la prescription']},
  {id:'L102',em:'🚔',name:'Missions de la Police Judiciaire',ref:'Art. 14 CPP',xp:10,
    intro:'L\'article 14 CPP définit avec précision les 3 missions fondamentales de la Police Judiciaire. Ces missions sont la base de toute l\'activité de l\'OPJ.',
    secs:[
      {t:'Les 3 missions (art. 14 CPP)',items:['<b>1. Constater</b> les infractions à la loi pénale','<b>2. Rassembler</b> les preuves et en rechercher les auteurs','<b>3. Remettre</b> les auteurs à la Justice pour être jugés']},
      {t:'Les officiers et agents de PJ',items:['<b>OPJ (art. 16 CPP)</b> : pouvoirs étendus — peut placer en GAV, diriger les auditions, perquisitionner','<b>APJ (art. 20 CPP)</b> : pouvoirs limités — constate, recueille, rend compte à l\'OPJ','<b>APJA (art. 21 CPP)</b> : pouvoirs très restreints — assistance seulement']},
      {t:'Habilitation OPJ',items:['Accordée par le <b>Procureur Général</b> près la Cour d\'appel','Niveau 1 : ressort départemental','Niveau 2 : ressort zonal (zone de défense)','Niveau 3 : compétence nationale','En <b>Commission rogatoire</b> : compétence nationale automatique (art. 18 al.4 CPP)']},
    ],
    traps:['L\'APJ ne peut PAS placer en GAV seul — il doit rendre compte à l\'OPJ','OPJ ≠ policier. Tous les policiers ne sont pas OPJ.'],
    keys:['Art. 14 CPP : 3 missions (constater/rassembler/remettre)','Art. 16 CPP : liste des OPJ','Art. 20 CPP : APJ','Art. 21 CPP : APJA']},
  {id:'L103',em:'🏛️',name:'Organisation judiciaire',ref:'Art. 12-13 CPP',xp:10,
    intro:'L\'OPJ agit sous la direction du Procureur et le contrôle de la Chambre de l\'instruction. Cette double supervision est un pilier de l\'État de droit.',
    secs:[
      {t:'Le contrôle de la PJ',items:['<b>PR (art. 12 CPP)</b> : dirige l\'enquête, donne instructions, reçoit les PV','<b>Chambre de l\'instruction</b> : contrôle disciplinaire, peut suspendre ou retirer l\'habilitation OPJ (art. 13)','<b>JLD</b> : juge des libertés et de la détention — garant constitutionnel (art. 66 Constitution)','<b>JI</b> : juge d\'instruction — ordonne les actes d\'instruction (CR, MEX, mandats)']},
      {t:'Les sanctions OPJ possibles',items:['Avertissement du Procureur Général','Suspension de l\'habilitation OPJ (max 2 ans)','Retrait définitif de l\'habilitation','Ces sanctions sont distinctes des sanctions administratives disciplinaires']},
    ],
    traps:['Le JLD décide des GAV > 48h, de la DP, des perquisitions nocturnes. Il ne juge pas au fond.','Le JI instruit — il ne juge pas au fond non plus.'],
    keys:['Art. 66 Constitution : autorité judiciaire gardienne de la liberté','JLD = garant des libertés. JI = maître de l\'instruction']},
]},

{id:'ch2',num:'02',title:'Les Cadres d\'Enquête',sub:'Flagrance · Préliminaire · CR · Art. 74',color:'#ef4444',bg:'rgba(239,68,68,.1)',icon:'🚨',
lessons:[
  {id:'L201',em:'🚨',name:'L\'Enquête de Flagrance',ref:'Art. 53 CPP',xp:15,
    intro:'Le régime de flagrance est le plus puissant pour l\'OPJ. Il permet des actes coercitifs immédiats sans avoir à obtenir d\'autorisation préalable.',
    secs:[
      {t:'La flagrance : définition (art. 53 CPP)',items:['<b>Critère 1 :</b> Le crime/délit se commet actuellement','<b>Critère 2 :</b> Vient de se commettre (immédiateté)','<b>Critère 3 :</b> Commis il y a peu + indices apparent sur la personne','<b>Critère 4 :</b> Poursuite publique par clameur (haro)']},
      {t:'Durée de l\'enquête de flagrance',items:['<b>8 jours</b> initiaux (art. 53 al.1)','Prolongation de <b>+8 jours</b> par autorisation du JLD pour les crimes ou délits punis ≥5 ans','Délai expiré → basculement en enquête préliminaire']},
      {t:'Pouvoirs en flagrance',items:['Perquisition <b>sans assentiment</b> (art. 56 CPP) — à toute heure','GAV sans autorisation préalable (art. 63 CPP)','Arrestation et contrainte physique immédiate','Saisie de tous objets utiles à la manifestation de la vérité']},
    ],
    traps:['8 jours = durée ENQUÊTE (pas la GAV !). GAV = 24h+24h = 48h max.','La flagrance autorise les perquisitions de nuit (pas de limite horaire)'],
    keys:['Art. 53 al.1 : 4 hypothèses de flagrance','Enquête : 8j (+8j JLD). GAV : 48h (+48h CO) = indépendant']},
  {id:'L202',em:'🔍',name:'L\'Enquête Préliminaire',ref:'Art. 75 CPP',xp:15,
    intro:'L\'enquête préliminaire est le régime de droit commun, applicable en l\'absence de flagrance. Elle est plus contrainte car la présomption d\'innocence joue à plein.',
    secs:[
      {t:'Caractéristiques clés',items:['Régime de <b>droit commun</b> — applicable par défaut','Durée : <b>2 ans max</b> (art. 75-1 CPP) — prorogeable 1 an par le PR','Pas de contrainte automatique : autorisation judiciaire requise pour les actes coercitifs']},
      {t:'Perquisitions en préliminaire',items:['Nécessite le <b>consentement écrit et exprès</b> de la personne (art. 76 CPP)','Horaires : <b>6h à 21h</b> uniquement (art. 59 CPP)','Refus de la personne → autorisation JLD nécessaire','Exception CO : autorisation JLD ouvre la possibilité 24h/24']},
      {t:'Pouvoirs spécifiques',items:['<b>Réquisitions</b> aux administrations, opérateurs téléphoniques, banques (art. 77-1-1 CPP)','<b>Convocations</b> des témoins — comparution possible (art. 78 CPP)','<b>GAV possible</b> mais sous les mêmes conditions qu\'en flagrance (art. 77 CPP)']},
    ],
    traps:['Perquisition préliminaire = TOUJOURS consentement écrit ou autorisation JLD. Jamais de force sans mandat.','Le délai de 2 ans est souvent méconnu — vérifier les investigations anciennes.'],
    keys:['Art. 75 CPP : préliminaire = régime de droit commun','Art. 76 CPP : perquisition = consentement exprès écrit','Art. 75-1 : durée max 2 ans + 1 an prorogation']},
  {id:'L203',em:'📋',name:'La Commission Rogatoire',ref:'Art. 151 CPP',xp:15,
    intro:'La commission rogatoire (CR) est l\'acte par lequel un juge d\'instruction délègue ses pouvoirs d\'investigation à un OPJ. Elle confère des pouvoirs étendus.',
    secs:[
      {t:'Caractéristiques de la CR',items:['Seul le <b>Juge d\'Instruction</b> peut délivrer une CR (exclusivité absolue)','La CR doit être <b>écrite, datée, signée, motivée</b> et revêtue du sceau du JI','Elle est <b>intuitu personae</b> : délivrée à un OPJ nommément désigné','L\'OPJ commis ne peut pas <b>subdéléguer</b> à un APJ']},
      {t:'Pouvoirs en CR',items:['<b>Identiques à la flagrance</b> (art. 152 CPP) : GAV, perquisitions, auditions','Compétence <b>nationale automatique</b> (art. 18 al.4 CPP)','Perquisitions <b>24h/24</b> si nécessaire','PV retournés au JI qui dirige l\'information judiciaire']},
      {t:'Limites de la CR',items:['L\'OPJ ne peut pas prendre d\'<b>actes importants non délégués</b> (ordonnances, MEX)','Urgence : peut agir + informer le JI immédiatement après','Le JI peut donner des <b>instructions complémentaires</b> par écrit']},
    ],
    traps:['La CR ne peut pas être délivrée par le PR (seulement le JI)','Compétence nationale = automatique en CR (pas besoin d\'autorisation spéciale)'],
    keys:['Art. 151 CPP : CR délivrée exclusivement par le JI','Art. 152 CPP : pouvoirs identiques flagrance','Art. 18 al.4 : compétence nationale']},
  {id:'L204',em:'☠️',name:'Mort Suspecte (Art. 74)',ref:'Art. 74 CPP',xp:10,
    intro:'L\'article 74 CPP encadre les investigations lors de la découverte d\'un cadavre dont la cause du décès est inconnue ou suspecte.',
    secs:[
      {t:'Le régime de l\'art. 74 CPP',items:['S\'applique lors de la <b>découverte d\'un corps</b> dont la cause de la mort est inconnue','Donne des pouvoirs d\'investigation spécifiques sans qualification préalable','<b>Médecin légiste réquisitionné</b> obligatoirement','Les OPJ peuvent agir <b>avant qualification pénale</b>']},
      {t:'Procédure',items:['Sécuriser et préserver la scène immédiatement','Informer le <b>Parquet</b> sans délai','Requérir un <b>médecin légiste</b> pour examen du corps','Dresser un PV descriptif complet','Décision du PR : ouvrir une information judiciaire ou orienter vers autre cadre']},
    ],
    traps:['Ne pas qualifier trop tôt : attendre les conclusions du médecin légiste','Art. 74 ≠ flagrance. C\'est un cadre autonome.'],
    keys:['Art. 74 CPP : mort de cause inconnue','Pas de qualification pénale immédiate obligatoire','Médecin légiste = réquisition systématique']},
]},

{id:'ch3',num:'03',title:'La Garde à Vue',sub:'Tous régimes · Droits · Prolongations',color:'#D4AF37',bg:'rgba(212,175,55,.12)',icon:'🔒',
lessons:[
  {id:'L301',em:'🔒',name:'GAV Droit Commun',ref:'Art. 62-2, 63 CPP',xp:20,
    intro:'La garde à vue est l\'une des mesures les plus attentatoires aux libertés. Sa parfaite maîtrise est indispensable à l\'examen OPJ.',
    secs:[
      {t:'Conditions de placement (art. 62-2 CPP) — 6 objectifs cumulatifs',items:['<b>1.</b> Permettre l\'exécution des investigations','<b>2.</b> Garantir la présentation devant le Parquet','<b>3.</b> Empêcher la concertation avec des complices','<b>4.</b> Garantir la mise en cause des auteurs','<b>5.</b> Protéger la personne ou autrui','<b>6.</b> Faire cesser l\'infraction']},
      {t:'Durée & prolongations',items:['<b>24h initiales</b> — point de départ = heure de l\'appréhension (transport inclus)','<b>+24h</b> → autorisation <b>écrite et motivée du PR</b>','<b>Total droit commun : 48h maximum</b>']},
      {t:'Droits notifiés IMMÉDIATEMENT (art. 63-1 CPP)',items:['Droit de <b>garder le silence</b>','Droit à un <b>avocat</b> sans délai (loi 22/04/2024 : carence 2h SUPPRIMÉE)','Droit à l\'<b>examen médical</b>','Droit d\'aviser un <b>proche</b> et son employeur','Droit à un <b>interprète</b>','<b>Accusé de réception</b> signé par le GAV']},
    ],
    traps:['Heure de GAV = heure d\'APPRÉHENSION (pas arrivée au commissariat)','Délai de carence 2h SUPPRIMÉ depuis loi 22/04/2024 → avocat SANS délai','Avis PR = IMMÉDIAT (pas dans les 3h !)'],
    keys:['Art. 62-2 : 6 objectifs cumulatifs','Art. 63-1 : notification IMMÉDIATE des droits','Loi 22/04/2024 : fin du délai de carence avocat']},
  {id:'L302',em:'⚡',name:'GAV Régimes Dérogatoires',ref:'Art. 706-88 CPP',xp:20,
    intro:'Les infractions graves disposent de régimes de GAV prolongée, avec des garanties renforcées impliquant le JLD.',
    secs:[
      {t:'Tableau des durées selon le régime',table:{th:['Régime','Durée max','Autorité prolongation'],rows:[['Droit commun','48h (24h + 24h)','PR (écrite et motivée)'],['Criminalité organisée','96h (4×24h)','PR puis JLD (>48h)'],['Terrorisme','144h (6×24h)','PR puis JLD (>48h)'],['Mineur 13-16 ans','24h non renouvelable','PR (sauf CO ou ≥5 ans)']]}},
      {t:'Infractions CO (art. 706-73 CPP) — liste limitative',items:['Association de malfaiteurs (450-1 CP)','Trafic de stupéfiants (222-34 s. CP)','Proxénétisme aggravé','Traite des êtres humains','Extorsion en bande organisée','Vol en bande organisée avec arme']},
      {t:'Droits en régime dérogatoire',items:['Avocat peut être <b>différé jusqu\'à 48h</b> (CO) ou <b>72h</b> (terrorisme) sur autorisation JLD','Présentation au JLD obligatoire pour prolongations au-delà de 48h','<b>Enregistrement audiovisuel</b> possible (art. 706-88-3)']},
    ],
    traps:['CO : 96h max / Terrorisme : 144h max. Ne pas confondre !','JLD obligatoire dès la 3e tranche (48h→72h) en CO'],
    keys:['Art. 706-88 : CO = 96h / Terrorisme = 144h','JLD obligatoire au-delà de 48h pour toute prolongation dérogatoire','Liste CO = LIMITATIVE (art. 706-73)']},
  {id:'L303',em:'👶',name:'GAV des Mineurs',ref:'Art. L413-6 CJPM',xp:15,
    intro:'Le CJPM (2021) a profondément rénové la procédure pénale pour mineurs. La GAV y est strictement encadrée avec des protections renforcées.',
    secs:[
      {t:'Age et responsabilite penale',items:['<b>Moins de 10 ans</b> : irresponsabilite penale totale','<b>10 a 13 ans</b> : presomption irrefragable d\'irresponsabilite - retenue judiciaire max 12h','<b>13 a 18 ans</b> : responsabilite penale attenuee (CJPM 2021)']},
      {t:'GAV des 13-16 ans',items:['<b>Conditions</b> : infraction punie d\'au moins 5 ans d\'emprisonnement','<b>Durée</b> : 24h non renouvelable (sauf CO : +24h sur autorisation JLD)','<b>Représentants légaux</b> : informés immédiatement','<b>Avocat</b> : dès le début, entretien non différable','<b>Médecin</b> : examen immédiat et obligatoire']},
      {t:'GAV des 16-18 ans',items:['Conditions : comme un majeur (infraction punie d\'emprisonnement)','Durée : 24h + 24h comme droit commun','Représentants légaux toujours informés']},
    ],
    traps:['Ordonnance 1945 = OBSOLÈTE depuis le 30/09/2021 → CJPM seul applicable','Moins de 13 ans : PAS de GAV — retenue judiciaire 12h MAXIMUM'],
    keys:['CJPM en vigueur depuis 30/09/2021 (remplace ordonnance 1945)','< 13 ans : retenue 12h. 13-16 ans : GAV 24h si ≥5 ans. 16-18 ans : droit commun']},
]},

{id:'ch4',num:'04',title:'Perquisitions & Auditions',sub:'Procédures · Lieux protégés · Audition libre',color:'#8b5cf6',bg:'rgba(139,92,246,.12)',icon:'🔍',
lessons:[
  {id:'L401',em:'🏠',name:'Les Perquisitions',ref:'Art. 56-59-76-94 CPP',xp:20,
    intro:'Les perquisitions sont des actes d\'investigation majeurs qui touchent au droit fondamental à l\'inviolabilité du domicile. Leur régime varie selon le cadre d\'enquête.',
    secs:[
      {t:'Règles selon le cadre d\'enquête',table:{th:['Cadre','Autorisation','Horaires','Présence occupant'],rows:[['Flagrance (art. 56)','Aucune (de droit)','6h-21h (ou nuit si crime)','Obligatoire ou 2 témoins'],['Préliminaire (art. 76)','Consentement écrit ou JLD','6h à 21h uniquement','Obligatoire ou 2 témoins'],['Rogatoire (art. 94)','Instruction du JI','24h/24 possible','Obligatoire ou 2 témoins']]}},
      {t:'Absence de l\'occupant — art. 57 CPP',items:['Désigner <b>2 témoins</b> étrangers à l\'affaire (non policiers, non mis en cause)','Dresser un PV contradictoire','Les témoins signent le PV']},
      {t:'Lieux protégés — formalités renforcées',items:['<b>Cabinet d\'avocat (art. 56-1)</b> : présence du <b>bâtonnier ou son délégué</b> obligatoire','<b>Cabinet médecin (art. 56-3)</b> : présence représentant du <b>Conseil de l\'ordre</b>','<b>Rédaction de presse (art. 56-2)</b> : présence d\'un magistrat et représentant de l\'ordre','<b>Domicile parlementaire</b> : information préalable du président de l\'assemblée']},
    ],
    traps:['Oublier le bâtonnier lors d\'une perquisition chez un avocat = nullité absolue','Perquisition nocturne préliminaire sans JLD = nullité'],
    keys:['Art. 59 CPP : 6h-21h (règle générale)','Art. 57 CPP : absence = 2 témoins obligatoires','Art. 56-1 CPP : avocat = bâtonnier OBLIGATOIRE']},
  {id:'L402',em:'🎙️',name:'Audition libre & Auditions',ref:'Art. 61-1 CPP',xp:15,
    intro:'L\'audition libre (AL) permet d\'entendre une personne soupçonnée sans la placer en GAV. Introduite par la loi du 27 mai 2014, elle a ses propres règles.',
    secs:[
      {t:'Audition libre vs GAV',table:{th:['Critère','Audition libre','GAV'],rows:[['Liberté de quitter','OUI — à tout moment','NON — privation de liberté'],['Avocat','OUI si peine emprisonnement','OUI dès le début'],['Notification droits','OUI (61-1 CPP)','OUI (63-1 CPP)'],['Durée max','Aucune limite fixée','24h-96h selon régime']]}},
      {t:'Droits en audition libre (art. 61-1 CPP)',items:['Droit de <b>quitter les lieux à tout moment</b> (différence fondamentale vs GAV)','Droit d\'<b>être assisté d\'un avocat</b> si infraction punie d\'emprisonnement','Droit de <b>garder le silence</b>','Droit à un <b>interprète</b>','Ces droits doivent être notifiés <b>dès le début de l\'audition</b>']},
      {t:'Audition de témoins',items:['Le témoin ne peut pas refuser de déposer sous peine d\'amende (art. 62 CPP)','Le témoin prête serment de dire la vérité (art. 103 CPP)','<b>JAMAIS de serment en GAV</b> (la personne mise en cause ne prête pas serment)']},
    ],
    traps:['AL : la personne PEUT partir. GAV : elle NE PEUT PAS. C\'est le critère fondamental.','En audition libre, l\'avocat n\'est requis que si l\'infraction est punie d\'emprisonnement.'],
    keys:['Art. 61-1 CPP : droits AL = silence + avocat (si prison) + quitter','Art. 62 CPP : témoin obligé de déposer','JAMAIS de serment pour une personne suspectée']},
]},

{id:'ch5',num:'05',title:'Droit Pénal Général',sub:'Infractions · Tentative · Complicité · Responsabilité',color:'#10b981',bg:'rgba(16,185,129,.1)',icon:'📜',
lessons:[
  {id:'L501',em:'📜',name:'Éléments constitutifs d\'une infraction',ref:'Art. 111-1 CP',xp:15,
    intro:'Toute infraction pénale se décompose en 3 éléments cumulatifs. L\'absence d\'un seul empêche la constitution de l\'infraction. C\'est la méthode universelle d\'analyse.',
    secs:[
      {t:'Les 3 éléments constitutifs',items:['<b>Élément légal (L)</b> : le texte qui incrimine le comportement. Sans texte, pas d\'infraction (principe de légalité — art. 111-2 CP). Toujours citer l\'article exact.','<b>Élément matériel (A)</b> : l\'acte concret réalisé. Acte positif, omission, résultat, lien de causalité. Décrire précisément les faits.','<b>Élément moral (M)</b> : l\'intention (dol général) ou la faute (imprudence, négligence). Le tribunal doit pouvoir en retrouver la preuve dans le PV.']},
      {t:'Types d\'éléments moraux',items:['<b>Dol général</b> : vouloir l\'acte sans vouloir nécessairement le résultat → violences simples','<b>Dol spécial</b> : intention orientée vers un résultat précis → meurtre (animus necandi)','<b>Faute d\'imprudence</b> : maladresse, négligence, inobservation des règles → homicide involontaire','<b>Mise en danger délibérée</b> : violation manifestement délibérée d\'une obligation de sécurité (art. 223-1 CP)']},
    ],
    traps:['Ne pas confondre dol général (vouloir l\'acte) et dol spécial (vouloir le résultat).','L\'absence d\'intention ne supprime pas l\'infraction si la loi prévoit une faute d\'imprudence.'],
    keys:['Méthode L.A.M.E. : Légal / matériel / Moral / aggravantEs','Toujours citer l\'article exact (élément légal)']},
  {id:'L502',em:'🎯',name:'Tentative & Complicité',ref:'Art. 121-5, 121-7 CP',xp:15,
    intro:'La tentative et la complicité sont des modes de participation à l\'infraction. Leur régime est souvent testé à l\'examen car il comporte des distinctions clés.',
    secs:[
      {t:'La tentative (art. 121-5 CP)',items:['<b>Définition</b> : commencement d\'exécution + absence de désistement volontaire','<b>Crime</b> : tentative TOUJOURS punissable (même peine que consommé)','<b>Délit</b> : tentative punissable UNIQUEMENT si le texte le prévoit','<b>Contravention</b> : tentative JAMAIS punissable','<b>Désistement volontaire AVANT consommation</b> = IMPUNITÉ (actes déjà commis restent punis)']},
      {t:'La complicité (art. 121-7 CP)',items:['<b>Par aide ou assistance (al.1)</b> : fournir moyens, faciliter — AVANT ou PENDANT','<b>Par instigation (al.2)</b> : provoquer par dons/promesses/menaces/instructions','Le complice est puni <b>de la même peine que l\'auteur principal</b>','La complicité exige un <b>fait principal punissable</b> (infraction de l\'auteur)']},
      {t:'Coauteur vs Complice',items:['<b>Coauteur</b> : participe directement à l\'exécution de l\'infraction','<b>Complice</b> : aide sans participer directement à l\'acte principal','Simple présence passive ≠ complicité (il faut un acte positif de complicité)']},
    ],
    traps:['Délit sans texte prévoyant la tentative = NON punissable (même si tentative évidente)','Simple présence ≠ complicité. Il faut une participation ACTIVE.'],
    keys:['Art. 121-5 CP : crime=toujours / délit=si texte / contravention=jamais','Art. 121-7 CP : peine complice = peine auteur']},
  {id:'L503',em:'🛡️',name:'Causes d\'Irresponsabilité Pénale',ref:'Art. 122-1 à 122-7 CP',xp:15,
    intro:'Certaines circonstances suppriment la responsabilité pénale. Leur connaissance est indispensable pour analyser correctement une situation lors du CR parquet.',
    secs:[
      {t:'Les causes d\'irresponsabilité (art. 122-1 à 122-8)',table:{th:['Article','Cause','Effet'],rows:[['122-1 al.1','Trouble mental — ABOLITION discernement','Irresponsabilité totale'],['122-1 al.2','Trouble mental — ALTÉRATION','Peine réduite 1/3 (obligatoire depuis 2022)'],['122-2','Contrainte irrésistible','Irresponsabilité'],['122-4','Ordre de la loi / commandement légitime','Irresponsabilité'],['122-5','Légitime défense','Irresponsabilité (fait justificatif)'],['122-7','État de nécessité','Irresponsabilité']]}},
      {t:'Légitime défense (art. 122-5 CP)',items:['<b>Agression illicite</b> : réelle, actuelle ou imminente','<b>Nécessité</b> : la riposte est indispensable','<b>Proportionnalité</b> : la défense ne doit pas être disproportionnée à l\'attaque','<b>Présomption</b> (art. 122-6) : intrusion nocturne dans le domicile par bris/effraction/violence']},
      {t:'État de nécessité vs Légitime défense',items:['<b>Légitime défense</b> : agression d\'un tiers → riposte','<b>État de nécessité</b> : danger actuel (pas d\'agression humaine nécessaire) → acte nécessaire et proportionné']},
    ],
    traps:['Abolition (al.1) = exonération totale. Altération (al.2) = atténuation OBLIGATOIRE (pas discrétion du juge depuis 2022)'],
    keys:['122-5 : LD = agression + nécessité + proportionnalité','122-7 : nécessité = danger actuel + acte nécessaire + proportionné']},
]},

{id:'ch6',num:'06',title:'Infractions contre les Personnes',sub:'Homicide · Violences · Viol · Séquestration',color:'#ef4444',bg:'rgba(239,68,68,.1)',icon:'🩸',
lessons:[
  {id:'L601',em:'⚖️',name:'Atteintes à la vie',ref:'Art. 221-1 à 221-6 CP',xp:20,
    intro:'Les atteintes à la vie forment le cœur du droit pénal spécial. Distinguer meurtre, assassinat, homicide involontaire et violences mortelles est essentiel pour une qualification juste.',
    secs:[
      {t:'Tableau comparatif',table:{th:['Infraction','Article','Peine','Élément moral'],rows:[['Meurtre','221-1 CP','30 ans RC','Intention de tuer (animus necandi)'],['Assassinat','221-3 CP','Perpétuité','Meurtre + PRÉMÉDITATION'],['Empoisonnement','221-5 CP','30 ans RC','Connaissance + intention + substance mortifère'],['Homicide involontaire','221-6 CP','3 ans / 45k€','FAUTE d\'imprudence (sans intention)'],['Violences mortelles','222-7 CP','15 ans RC','Intention de BLESSER (pas de tuer)'],['Non-assistance','223-6 al.2 CP','5 ans / 75k€','Abstention volontaire']]}},
      {t:'Préméditation (art. 132-72 CP)',items:['<b>Définition</b> : dessein formé AVANT l\'action','<b>Distinction</b> : guet-apens = attente (pas nécessairement prémédité)','<b>Effet</b> : meurtre → assassinat (perpétuité)']},
    ],
    traps:['222-7 (violences mortelles) ≠ 221-1 (meurtre). Critère : a-t-on VOULU tuer ?','Homicide involontaire : PAS d\'intention de blesser même — faute seulement'],
    keys:['Meurtre (221-1) : animus necandi','Assassinat (221-3) : meurtre + préméditation','Homicide involontaire (221-6) : faute — PAS d\'intention']},
  {id:'L602',em:'👊',name:'Violences & Atteintes sexuelles',ref:'Art. 222-7 à 222-33 CP',xp:15,
    intro:'L\'échelle pénale des violences dépend du résultat (ITT) et des aggravantes. Les atteintes sexuelles se distinguent selon la présence ou non d\'une pénétration.',
    secs:[
      {t:'Échelle des violences selon ITT',table:{th:['Résultat','Article','Nature','Peine base'],rows:[['Sans ITT (gifle)','R624-1 CP','Contravention','3 750 €'],['ITT ≤ 8 jours','R625-1 CP','Contravention','1 500 €'],['ITT > 8 jours','222-11 CP','Délit','3 ans / 45k€'],['Mutilation/infirmité','222-9 CP','Crime','10 ans RC'],['Mort sans intention','222-7 CP','Crime','15 ans RC']]}},
      {t:'Atteintes sexuelles — critère clé',items:['<b>VIOL (222-23 CP)</b> : pénétration sexuelle OU acte bucco-génital — <b>15 ans RC</b>','<b>Agression sexuelle (222-27 CP)</b> : acte sexuel SANS pénétration — <b>7 ans + 100k€</b>','<b>Critère unique</b> : la PÉNÉTRATION fait basculer de délit à crime','Aggravant mineur < 15 ans : viol → 20 ans RC / Agression → 10 ans']},
    ],
    traps:['ITT = durée d\'incapacité totale de travail. Fixée par le médecin légiste.','Viol = crime (15 ans RC). Agression sexuelle = délit (7 ans). Un seul critère : la pénétration.'],
    keys:['ITT > 8j = 222-11 délit. ITT ≤ 8j = contravention','Viol vs agression : critère = PÉNÉTRATION']},
]},

{id:'ch7',num:'07',title:'Infractions contre les Biens',sub:'Vol · Escroquerie · Recel · Stups',color:'#3b82f6',bg:'rgba(59,130,246,.1)',icon:'💼',
lessons:[
  {id:'L701',em:'💼',name:'Vol, Escroquerie & ADB',ref:'Art. 311-1, 313-1, 314-1 CP',xp:15,
    intro:'Ces 3 infractions d\'appropriation se distinguent par le mode d\'appropriation. La maîtrise de leurs critères est indispensable pour qualifier correctement les faits.',
    secs:[
      {t:'Tableau comparatif clé',table:{th:['Infraction','Article','Mode','Peine'],rows:[['Vol','311-1 CP','SOUSTRAIT (sans remise)','3 ans / 45k€'],['Extorsion','312-1 CP','DONNE sous CONTRAINTE','7 ans + 100k€'],['Escroquerie','313-1 CP','DONNE suite à TROMPERIE','5 ans / 375k€'],['Abus de confiance','314-1 CP','CONFIÉ + DÉTOURNÉ','3 ans / 375k€'],['Chantage','312-10 CP','DONNE sous menace révélation','5 ans / 75k€']]}},
      {t:'Vol aggravé',items:['<b>En réunion (311-4)</b> : 5 ans','<b>Avec violence (311-5)</b> : 5 ans','<b>Avec arme (311-8)</b> : 10 ans','<b>En bande organisée (311-9)</b> : 15 ans RC → CRIME !']},
      {t:'Recel (art. 321-1 CP)',items:['Dissimuler, détenir, transmettre ou bénéficier du produit d\'un crime ou délit','Infraction <b>CONTINUE</b> et <b>AUTONOME</b>','Exige la <b>connaissance</b> de l\'origine frauduleuse','Peine : 5 ans + 375k€ / habituel : 10 ans + 750k€']},
    ],
    traps:['Vol en bande organisée = CRIME (15 ans RC), pas délit ! Piège classique.','ADB : la remise doit être PRÉALABLE et LICITE (puis détournement)'],
    keys:['Vol = soustrait. Escroquerie = tromperie → remise. ADB = confié puis détourné','Vol en BO = CRIME (311-9)']},
  {id:'L702',em:'💊',name:'Stupéfiants & Infractions Routières',ref:'Art. L3421-1 CSP, L234-1 C.route',xp:10,
    intro:'Les infractions liées aux stupéfiants et à la route sont fréquemment rencontrées en enquête. Leur hiérarchie pénale doit être maîtrisée.',
    secs:[
      {t:'Stupéfiants',table:{th:['Infraction','Article','Peine'],rows:[['Usage illicite','L3421-1 CSP','1 an + 3 750 €'],['Détention/transport','222-37 CP','10 ans + 7,5M€'],['Trafic organisé','222-34 CP','30 ans RC + 7,5M€']]}},
      {t:'Alcool au volant',items:['<b>Taux 0,50-0,80 g/l</b> : contravention (135 € + 6 pts)','<b>Taux ≥ 0,80 g/l</b> : DÉLIT — 2 ans + 4 500 € (art. L234-1 C.route)','<b>Stups</b> : pas de seuil — TOUTE présence = DÉLIT (L235-1 C.route)','<b>Cumul alcool + stups</b> : 3 ans + 9 000 €']},
    ],
    traps:['Stups = AUCUN seuil (≠ alcool). La moindre trace = délit.','Usage stups = 1 an. Détention/transport = 10 ans. Grande différence.'],
    keys:['Alcool délictuel : ≥ 0,80 g/l. Stups : 0 tolérance.','Trafic CO : jusqu\'à 30 ans RC']},
]},

{id:'ch8',num:'08',title:'Procédures Spéciales & CO',sub:'Criminalité organisée · Mineurs · Fichiers',color:'#f59e0b',bg:'rgba(245,158,11,.1)',icon:'🕵️',
lessons:[
  {id:'L801',em:'🕵️',name:'Techniques Spéciales d\'Enquête',ref:'Art. 100, 230-32, 706-81 CPP',xp:20,
    intro:'Les TSE sont des outils d\'investigation intrusifs réservés aux infractions graves. Chaque technique obéit à un régime propre d\'autorisation.',
    secs:[
      {t:'Tableau des TSE',table:{th:['Technique','Article','Qui autorise','Durée max'],rows:[['Écoutes téléphoniques','100 CPP','JI (instruction)','4 mois renouvelable'],['Écoutes préliminaire','706-95 CPP','JLD (sur réq. PR)','1 mois renouvelable'],['Géolocalisation','230-32 CPP','PR (15j) puis JLD (1 mois)','Durée instruction'],['Infiltration','706-81 CPP','PR ou JI','4 mois renouvelable'],['Sonorisation','706-96 CPP','JI uniquement (CO)','Ordonnance'],['IMSI-catcher','706-95-20 CPP','JLD','Courte durée']]}},
      {t:'L\'infiltration (art. 706-81 CPP)',items:['Réservée à la <b>criminalité organisée</b> (infractions art. 706-73)','L\'agent infiltré peut participer aux actes préparatoires SANS être puni','Identité protégée (art. 706-84 CPP)','Autorisation PR ou JI pour 4 mois renouvelables']},
    ],
    traps:['Géolocalisation > 15j = JLD obligatoire (pas juste le PR)','Sonorisation = JI UNIQUEMENT + CO. Jamais en préliminaire.'],
    keys:['Écoutes : JI en instruction / JLD en préliminaire','Géoloc : PR 15j → JLD 1 mois','Infiltration : PR ou JI, 4 mois CO']},
  {id:'L802',em:'🗃️',name:'Fichiers de Police',ref:'Art. 230-6, 706-54 CPP',xp:10,
    intro:'La connaissance des principaux fichiers de police est indispensable pour l\'OPJ. Ils ont chacun une base légale et des conditions d\'accès spécifiques.',
    secs:[
      {t:'Les principaux fichiers',table:{th:['Fichier','Contenu','Base légale'],rows:[['TAJ','Antécédents judiciaires PN + GN','Décret 2012-652','Art. 230-6 CPP'],['FNAEG','Profils ADN','Art. 706-54 CPP'],['FAED','Empreintes digitales','Décret 87-249'],['FPR','Personnes recherchées','DCPJ'],['SIS II','Signalements européens','Règl. UE 1987/2006']]}},
      {t:'Le TAJ (Traitement des Antécédents Judiciaires)',items:['Fusion des anciens <b>STIC</b> (PN) et <b>JUDEX</b> (GN)','Contient les mis en cause, victimes, personnes disparues','Accès limité aux <b>OPJ et APJ habilités</b>','Droit d\'accès/rectification via le Parquet ou la CNIL']},
    ],
    traps:['TAJ ≠ FNAEG. TAJ = antécédents judiciaires. FNAEG = ADN.','Refus de prélèvement ADN = délit (art. 706-56 CPP)'],
    keys:['TAJ = STIC + JUDEX (fusion 2012)','FNAEG : ADN pour infractions graves (liste étendue 2016)']},
]},

{id:'ch9',num:'09',title:'Libertés & CEDH',sub:'Droits fondamentaux · Présomption d\'innocence',color:'#14b8a6',bg:'rgba(20,184,166,.1)',icon:'🏛️',
lessons:[
  {id:'L901',em:'🏛️',name:'Droits fondamentaux & CEDH',ref:'Constitution, DDHC, CEDH',xp:15,
    intro:'Les droits fondamentaux encadrent l\'action de l\'OPJ. Toute violation peut entraîner des nullités de procédure et des condamnations de l\'État devant la CEDH.',
    secs:[
      {t:'Textes fondamentaux clés',table:{th:['Texte','Article clé','Droit protégé'],rows:[['Constitution 1958','Art. 66','Autorité judiciaire gardienne liberté'],['DDHC 1789','Art. 8','Légalité des délits et peines'],['DDHC 1789','Art. 9','Présomption d\'innocence'],['CEDH','Art. 3','Interdiction torture (ABSOLU)'],['CEDH','Art. 5','Droit à la liberté et sûreté'],['CEDH','Art. 6','Droit au procès équitable'],['CEDH','Art. 8','Respect de la vie privée']]}},
      {t:'Présomption d\'innocence',items:['<b>Principe</b> : tout suspect est présumé innocent jusqu\'à condamnation définitive','<b>Charge</b> : l\'accusation doit prouver la culpabilité','<b>Doute</b> : in dubio pro reo — profite à l\'accusé','<b>Durée</b> : survit à la MEX, au renvoi en jugement — seulement une condamnation définitive']},
      {t:'Art. 66 Constitution — fondement OPJ',items:['« Nul ne peut être arbitrairement détenu »','L\'autorité judiciaire (JLD) est gardienne de la liberté individuelle','Fondement constitutionnel des GAV, DP, contrôles judiciaires']},
    ],
    traps:['Art. 3 CEDH (torture) = droit ABSOLU. Aucune dérogation, même en guerre ou terrorisme.','Présomption d\'innocence ≠ protection contre l\'arrestation ou la GAV.'],
    keys:['Art. 66 Constitution = JLD garant des libertés','CEDH art. 3 = absolu / art. 5 = liberté / art. 6 = procès équitable']},
]},

{id:'ch10',num:'10',title:'Prescription, Récidive & Alternatives',sub:'Délais · Réitération · Composition pénale',color:'#6366f1',bg:'rgba(99,102,241,.1)',icon:'⏳',
lessons:[
  {id:'L1001',em:'⏳',name:'Prescription de l\'Action Publique',ref:'Art. 7-9 CPP (loi 27/02/2017)',xp:10,
    intro:'La loi du 27 février 2017 a doublé les délais de prescription. Connaître les anciens et nouveaux délais est essentiel pour identifier les pièges à l\'examen.',
    secs:[
      {t:'Délais depuis la loi du 27 fév. 2017',table:{th:['Infraction','Avant 2017','Depuis 2017'],rows:[['Contravention','1 an','1 an (inchangé)'],['Délit','3 ans','6 ans'],['Crime','10 ans','20 ans'],['Crime sur mineur','20 ans','30 ans (majorité)'],['Crime terroriste','20 ans','30 ans']]}},
      {t:'Interruption vs Suspension',items:['<b>Interruption</b> : REMET À ZÉRO le délai (acte d\'instruction, réquisitoire)','<b>Suspension</b> : arrête momentanément (obstacle légitime), reprise au même point','Exemple : acte d\'enquête en cours d\'prescription = interruption → nouveau délai repart']},
    ],
    traps:['Piège classique : citer les anciens délais (3/10 ans) au lieu des nouveaux (6/20 ans)','Crimes contre l\'humanité = IMPRESCRIPTIBLES (art. 213-5 CP)'],
    keys:['Loi 27/02/2017 : délais doublés','Contravention 1 an / Délit 6 ans / Crime 20 ans','Imprescriptibles : crimes contre l\'humanité']},
  {id:'L1002',em:'🔄',name:'Récidive & Alternatives aux Poursuites',ref:'Art. 132-8 à 132-16 CP, Art. 41-1 CPP',xp:15,
    intro:'La récidive légale aggrave automatiquement les peines. Les alternatives aux poursuites permettent au PR de traiter les affaires de moindre gravité sans renvoi en jugement.',
    secs:[
      {t:'Récidive légale',table:{th:['Type','Délai','Effet'],rows:[['Crime/crime','Perpétuelle','Peine doublée (max perpétuité)'],['Délit/délit assimilé','5 ans','Peine doublée (art. 132-10)'],['Contravention 5e classe','1 an','Peine alourdie (art. 132-11)']]}},
      {t:'Alternatives aux poursuites (art. 41-1 CPP)',items:['<b>Rappel à la loi (41-1 1°)</b> : simple rappel des obligations légales','<b>Médiation pénale (41-1 5°)</b> : accord auteur-victime sur la réparation','<b>Stage (41-1 2°)</b> : stage de citoyenneté, de sensibilisation','<b>Composition pénale (41-2)</b> : PR propose mesures (amende, TIG) → homologation juge','<b>CRPC (495-7)</b> : reconnaissance de culpabilité → peine proposée par PR → juge homologue']},
      {t:'Réitération (art. 132-16-7 CP)',items:['La réitération ≠ récidive légale','<b>Pas de condition</b> de condamnation définitive préalable','<b>Pas de doublement automatique</b> des peines','Simple circonstance que le juge peut prendre en compte librement']},
    ],
    traps:['Récidive = condamnation DÉFINITIVE préalable. Réitération = pas de condition.','CRPC : impossible pour les crimes et pour les mineurs.'],
    keys:['Récidive crime/crime : perpétuelle + peine doublée','Alternatives : rappel à la loi / médiation / composition / CRPC','Réitération ≠ récidive : pas de condamnation définitive requise']},
]},

/* ═══ CH11 — CONTRÔLES D'IDENTITÉ ═══ */
{id:'ch11',num:'11',title:'Contrôles & Vérifications d\'identité',sub:'Art. 78-1 à 78-6 CPP · Étrangers · Fouilles',color:'#0ea5e9',bg:'rgba(14,165,233,.1)',icon:'🪪',
lessons:[
  {id:'L1101',em:'🪪',name:'Contrôle d\'identité — Art. 78-2 CPP',ref:'Art. 78-2 CPP',xp:15,
    intro:'Le contrôle d\'identité est l\'un des actes les plus courants de la Police Judiciaire. Sa maîtrise est indispensable : la liste des cas légaux est LIMITATIVE et tout contrôle hors cadre engage la responsabilité de l\'OPJ.',
    secs:[
      {t:'Les 8 cas légaux du contrôle judiciaire (art. 78-2 al.1 à 4)',items:[
        '<b>1. Raisons plausibles de soupçonner</b> une infraction commise ou tentée',
        '<b>2. Préparation d\'un crime ou délit</b> — éléments objectifs',
        '<b>3. Fugitif</b> — pour exécuter un mandat ou décision judiciaire',
        '<b>4. Indications d\'être témoin</b> utile à une enquête',
        '<b>5. Zone frontalière 20 km</b> — contrôle administratif, pas de motifs exigés',
        '<b>6. Réquisitions du PR</b> écrites, motivées, durée 24h max (art. 78-2 al.4)',
        '<b>7. Infraction à la police des étrangers</b> — vérification du droit au séjour',
        '<b>8. Contrôle d\'apparence</b> — INTERDIT (Cass. 2017) — profilage ethnique illicite']},
      {t:'Vérification d\'identité (art. 78-3 CPP) — si refus ou impossibilité',items:[
        'Durée maximale : <b>4 heures</b> (rétention aux fins de vérification)',
        'Avis au PR <b>immédiat</b> dès le début de la rétention',
        'Durée décomptée de toute GAV ultérieure',
        'OPJ doit dresser un PV distinct de la rétention',
        '<b>ATTENTION</b> : vérification ≠ GAV — pas de droits GAV automatiques']},
      {t:'Fouille de véhicule (art. 78-2-2 et 78-2-3 CPP)',items:[
        '<b>78-2-2</b> : sur réquisitions du PR écrites — périmètre et durée définis',
        '<b>78-2-3</b> : flagrance ou raisons plausibles — OPJ peut ouvrir et inspecter',
        'Fouille complète du véhicule = autorisation judiciaire en préliminaire',
        'Contrôle de police ≠ perquisition de véhicule : régimes distincts']},
    ],
    traps:['Contrôle sur la seule "apparence" ethnique = faute lourde de l\'État (Cour de cass. 9 nov. 2016)','Art. 78-3 : 4h max de rétention AVANT toute GAV — les délais ne se cumulent pas'],
    keys:['8 cas limitatifs d\'art. 78-2','Vérification d\'identité = 4h max, avis PR immédiat','Profilage ethnique = illicite et constitutif de faute de l\'État']},
  {id:'L1102',em:'🌍',name:'Étrangers — Titre de séjour & Mesures d\'éloignement',ref:'CESEDA · Art. 78-2 CPP',xp:15,
    intro:'Le droit des étrangers est un domaine complexe, souvent à l\'intersection du droit administratif et pénal. L\'OPJ doit connaître les différentes mesures d\'éloignement et leurs effets.',
    secs:[
      {t:'Les titres de séjour',items:[
        '<b>Carte de résident</b> : 10 ans renouvelable — droit au séjour long',
        '<b>Carte de séjour temporaire</b> : 1 an, mention "vie privée et familiale"',
        '<b>Visa long séjour valant titre de séjour (VLS-TS)</b>',
        'Contrôle du titre : OPJ ou APJ en cas de raisons plausibles (art. 78-2 al.5)']},
      {t:'Mesures d\'éloignement — tableau comparatif',table:{th:['Mesure','Auteur','Base légale','Effet'],rows:[
        ['OQTF','Préfet','L511-1 CESEDA','Quitter le territoire dans 30 jours'],
        ['Reconduite à la frontière','Préfet','L511-1','Éloignement forcé immédiat'],
        ['Expulsion','Préfet/JA','L521-1 CESEDA','Atteinte à l\'ordre public grave'],
        ['Extradition','Gouvernement','Art. 696 CPP','Remise à État étranger sur demande']]}},
      {t:'Rétention administrative (CRA)',items:[
        'Le préfet peut placer l\'étranger en Centre de Rétention Administrative',
        'Durée initiale : <b>48h</b> sur décision préfectorale',
        'Prolongation par le <b>JLD</b> jusqu\'à 28 jours supplémentaires',
        'Durée maximale totale : <b>90 jours</b>']},
    ],
    traps:['OQTF ≠ expulsion : l\'OQTF laisse un délai de départ volontaire (30 jours). L\'expulsion est immédiate.','Extradition = accord gouvernemental + judiciaire — jamais une décision de l\'OPJ seul'],
    keys:['OQTF → 30 jours départ volontaire','CRA : 48h préfet + JLD pour prolongation','Expulsion = atteinte grave à l\'ordre public']},
]},

/* ═══ CH12 — MESURES COERCITIVES ═══ */
{id:'ch12',num:'12',title:'Mesures Coercitives & Mandats',sub:'CJ · ARSE · DP · 4 Mandats',color:'#8b5cf6',bg:'rgba(139,92,246,.1)',icon:'⛓️',
lessons:[
  {id:'L1201',em:'📋',name:'Les 4 Mandats de Justice',ref:'Art. 122-131 CPP',xp:20,
    intro:'Les mandats de justice sont les instruments coercitifs du Juge d\'Instruction. Maîtriser le tableau comparatif est INDISPENSABLE à l\'examen — une confusion entre eux est éliminatoire.',
    secs:[
      {t:'Tableau comparatif des 4 mandats',table:{th:['Mandat','Article','Auteur','Effet','Particularité'],rows:[
        ['Mandat de comparution','Art. 122 al.1 CPP','JI','Demande de se présenter volontairement','Pas de contrainte physique'],
        ['Mandat d\'amener','Art. 122 al.2 CPP','JI','Conduire de force devant le JI','Force publique si nécessaire — pas d\'incarcération'],
        ['Mandat de dépôt','Art. 122 al.3 CPP','JI','Incarcération immédiate','Remis au directeur de l\'établissement pénitentiaire'],
        ['Mandat d\'arrêt','Art. 131 CPP','JI','Arrestation + incarcération provisoire','Pour fugitifs ou résidant à l\'étranger']]}},
      {t:'Mandat de recherche — Art. 122-4 CPP',items:[
        'Émis par le PR (pas le JI) en enquête préliminaire',
        'Pour toute infraction = crime ou délit puni d\'au moins <b>3 ans</b>',
        'Permet l\'interpellation et la présentation devant le PR',
        'Dure <b>1 an</b> renouvelable']},
      {t:'Règles communes',items:[
        'Tous les mandats doivent être <b>écrits, datés, signés, motivés</b>',
        'Le mandat d\'arrêt peut être exécuté <b>24h/24 sur tout le territoire</b>',
        'L\'OPJ qui exécute un mandat doit l\'exhiber et notifier les droits',
        'En cas de flagrance : exécution sans mandat possible (art. 53 CPP)']},
    ],
    traps:['Mandat de dépôt ≠ mandat d\'arrêt : le dépôt = incarcération immédiate sur place, l\'arrêt = pour les fugitifs absents','Mandat de recherche = PR (pas JI) — confusion fréquente à l\'examen'],
    keys:['Comparution = volontaire. Amener = force. Dépôt = prison immédiate. Arrêt = fugitif.','Mandat de recherche = PR + 3 ans min + 1 an durée','Tous mandats : écrits, datés, signés, motivés']},
  {id:'L1202',em:'⚖️',name:'Contrôle Judiciaire — 17 Obligations',ref:'Art. 138 CPP',xp:20,
    intro:'Le contrôle judiciaire est une alternative à la détention provisoire. Ses obligations sont LIMITATIVES au sens de l\'art. 138 — le juge ne peut en imposer aucune autre.',
    secs:[
      {t:'Conditions du contrôle judiciaire',items:[
        'La personne doit être <b>mise en examen</b>',
        'Infraction punie d\'emprisonnement (pas de seuil minimum)',
        'Décision du <b>JLD</b> saisi par ordonnance du JI',
        'Durée : sans limite légale fixe, réévaluée régulièrement']},
      {t:'Les 17 obligations limitatives (art. 138 CPP)',items:[
        '<b>1.</b> Ne pas quitter un territoire défini',
        '<b>2.</b> Informer le JI de tout déplacement',
        '<b>3.</b> Se présenter périodiquement (police, gendarmerie)',
        '<b>4.</b> Ne pas exercer une activité professionnelle déterminée',
        '<b>5.</b> Ne pas se rendre dans certains lieux',
        '<b>6.</b> Ne pas rencontrer certaines personnes',
        '<b>7.</b> Remettre les documents de voyage',
        '<b>8.</b> Ne pas conduire de véhicule',
        '<b>9.</b> Subir des soins ou traitement médical',
        '<b>10.</b> Constituer des sûretés (caution)',
        '<b>11.</b> Prise en charge socio-judiciaire',
        '<b>12.</b> Soins d\'addictologie',
        '<b>13.</b> Ne pas détenir d\'arme',
        '<b>14.</b> Ne pas avoir contact avec la victime',
        '<b>15.</b> Pointage électronique (ARSE légère)',
        '<b>16.</b> Injonction de soins psychiatriques',
        '<b>17.</b> Obligation de remise à un établissement d\'accueil']},
    ],
    traps:['LISTE LIMITATIVE : le juge ne peut PAS inventer d\'autres obligations — piège classique','CJ sans seuil de peine : même pour un délit mineur avec emprisonnement possible'],
    keys:['Art. 138 CPP : 17 obligations LIMITATIVES','Pas de seuil minimal de peine pour le CJ','JLD décide (pas le JI seul)']},
  {id:'L1203',em:'🔗',name:'ARSE & Détention Provisoire',ref:'Art. 142-5, 143-1 CPP',xp:20,
    intro:'La détention provisoire est la mesure la plus grave avant jugement. Elle ne peut être prononcée que par le JLD et uniquement après épuisement des alternatives moins coercitives.',
    secs:[
      {t:'ARSE (Assignation à Résidence avec Surveillance Électronique)',items:[
        '<b>Art. 142-5 CPP</b> — alternative à la détention provisoire',
        'Peine minimale de <b>2 ans d\'emprisonnement</b> requis',
        'Bracelet électronique GPS — surveillance continue',
        'JLD seul compétent (avec réquisitions du PR)',
        'Durée : même régime que la détention provisoire']},
      {t:'Détention provisoire — Conditions (art. 143-1 CPP)',items:[
        'MEX pour crime ou délit puni d\'<b>au moins 3 ans</b>',
        '<b>L\'une</b> des 6 finalités de l\'art. 144 doit être satisfaite :',
        '1° Conserver les preuves ou indices',
        '2° Empêcher pression sur témoins ou victimes',
        '3° Empêcher concertation avec complices',
        '4° Protéger la personne mise en examen',
        '5° Mettre fin à l\'infraction ou prévenir son renouvellement',
        '6° Garantir la présentation en jugement']},
      {t:'Durées maximales de détention provisoire',table:{th:['Matière','Durée initiale','Max total'],rows:[
        ['Correctionnel (délit ≤10 ans)','4 mois','2 ans'],
        ['Correctionnel (délit 10 ans / bande org.)','4 mois','3 ans 8 mois'],
        ['Crime (non CO)','1 an','4 ans'],
        ['Crime CO / terrorisme','1 an','8 ans (voire plus)']]}},
    ],
    traps:['JLD SEUL décide de la DP — le JI ne peut jamais décider seul même en émettant une ordonnance','ARSE = 2 ans minimum. CJ = pas de seuil. Confusion fréquente.'],
    keys:['DP = JLD + MEX + 3 ans min + 1 finalité art. 144','ARSE = 2 ans + bracelet électronique','Correctionnel : 4 mois initiale, 2 ans max (cas général)']},
]},

/* ═══ CH13 — MODULE PATRIMONIAL ═══ */
{id:'ch13',num:'13',title:'Enquête Patrimoniale & Saisies',sub:'Saisies · Confiscations · Blanchiment',color:'#f59e0b',bg:'rgba(245,158,11,.1)',icon:'💰',
lessons:[
  {id:'L1301',em:'💰',name:'Enquête Patrimoniale & Saisies',ref:'Art. 131-21 CP · Art. 706-141 CPP',xp:20,
    intro:'L\'enquête patrimoniale est un outil essentiel dans la lutte contre la criminalité organisée et le blanchiment. Elle permet de saisir les avoirs criminels avant même une condamnation.',
    secs:[
      {t:'Périmètre de l\'enquête patrimoniale',items:[
        'Rechercher les <b>avoirs, revenus, biens et comptes</b> de la personne',
        'Réquisitions aux banques, administrations, CAF, URSSAF, fisc',
        'Accès aux fichiers FICOBA (comptes bancaires), FNT (titres)',
        'OPJ habilité : compétence nationale pour les réquisitions patrimoniales',
        'En CO : OCRGDF (Office Central de Répression de la Grande Délinquance Financière)']},
      {t:'Saisies conservatoires vs probatoires',items:[
        '<b>Saisie probatoire</b> : préserver une preuve (objet lié à l\'infraction)',
        '<b>Saisie conservatoire</b> : immobiliser un bien (empêcher la dissipation)',
        '<b>Saisie pénale</b> spéciale (art. 706-141 CPP) : autorisée par le JLD ou le JI',
        'Les biens saisis peuvent être restitués si non-lieu ou relaxe']},
      {t:'Confiscation — Art. 131-21 CP (9 alinéas)',table:{th:['Alinéa','Objet de la confiscation'],rows:[
        ['Al. 1','Bien ayant servi à commettre l\'infraction (instrument)'],
        ['Al. 2','Bien qui était destiné à commettre l\'infraction'],
        ['Al. 3','Produit direct ou indirect de l\'infraction'],
        ['Al. 4','Valeur de la chose confisquée si restitution impossible'],
        ['Al. 5','Biens meubles ou immeubles du condamné sans rapport avec l\'infraction (BO)'],
        ['Al. 6','Tous biens du condamné en cas de crime/trafic'],
        ['Al. 7','Non-justification de ressources (présomption de provenance illicite)'],
        ['Al. 8','Confiscation obligatoire (ex. armes, stupéfiants)'],
        ['Al. 9','Confiscation de l\'ensemble du patrimoine']]}},
      {t:'Non-justification de ressources & Blanchiment',items:[
        'Art. 131-21 al. 7 : si condamné ne peut justifier ses ressources → confiscation',
        '<b>Blanchiment (art. 324-1 CP)</b> : 5 ans + 375 000 €',
        'Blanchiment aggravé (bande organisée) : 10 ans + 750 000 €',
        'Présomption de culpabilité pour les proches (GAFI, Directive 2015/849)']},
    ],
    traps:['Art. 131-21 al. 9 = confiscation de l\'ENSEMBLE du patrimoine — mesure exceptionnelle réservée aux infractions graves','Non-justification de ressources ≠ enrichissement illicite (art. 321-6-1 CP) — deux infractions distinctes'],
    keys:['Art. 131-21 = 9 alinéas de confiscation à maîtriser','Saisie conservatoire = JLD/JI requis','Blanchiment : 5 ans/375k€, aggravé BO : 10 ans/750k€']},
]},
];

const QB=[
  {id:'g01',cat:'GAV',q:"Durée initiale d'une GAV de droit commun ?",opts:["12h","24h","48h","72h"],c:1,art:"Art. 63 al.1 CPP",diff:1,expl:"La GAV initiale est de <strong>24 heures</strong>. Elle peut être prolongée de 24h par autorisation écrite et motivée du PR."},
  {id:'g02',cat:'GAV',q:"En criminalité organisée, la GAV peut atteindre :",opts:["48h","72h","96h","144h"],c:2,art:"Art. 706-88 CPP",diff:2,expl:"En CO, la GAV peut atteindre <strong>96h</strong> (4×24h). Au-delà de 48h, c'est le JLD qui autorise."},
  {id:'g03',cat:'GAV',q:"La notification des droits en GAV doit intervenir :",opts:["Dans l'heure","Immédiatement","Dans les 3h","Avant la 1ère audition"],c:1,art:"Art. 63-1 CPP",diff:1,expl:"La notification doit être <strong>immédiate</strong> dès le placement. Tout retard constitue une formalité substantielle violée."},
  {id:'g04',cat:'GAV',q:"Depuis la loi du 22/04/2024, le délai de carence de l'avocat est :",opts:["Réduit à 1h","Supprimé — avocat sans délai","Maintenu à 2h","Porté à 30 min"],c:1,art:"Art. 63-3-1 CPP (loi 22/04/2024)",diff:2,expl:"La loi du 22 avril 2024 a <strong>supprimé le délai de carence de 2h</strong>. L'avocat intervient désormais sans délai dès le début de la GAV."},
  {id:'g05',cat:'GAV',q:"L'avis d'un proche lors d'un placement en GAV doit être donné :",opts:["Immédiatement","Dans les 3h","Dans les 6h","Avant la 1ère prolongation"],c:0,art:"Art. 63-2 CPP",diff:2,expl:"L'avis à un proche doit être donné <strong>immédiatement</strong>. Il peut être différé par le PR pour des raisons impérieuses d'enquête."},
  {id:'g06',cat:'GAV',q:"La GAV en terrorisme peut atteindre :",opts:["96h","120h","144h","168h"],c:2,art:"Art. 706-88-1 CPP",diff:2,expl:"En matière de terrorisme, la GAV peut atteindre <strong>144 heures</strong> (6×24h), avec autorisation successive du PR puis du JLD."},
  {id:'g07',cat:'GAV',q:"Le point de départ de la GAV est :",opts:["L'arrivée au commissariat","La notification des droits","L'heure d'appréhension de la personne","La première audition"],c:2,art:"Art. 63 I al.3 CPP",diff:2,expl:"Le délai de GAV part de <strong>l'heure d'appréhension</strong>. Le transport vers les locaux est donc inclus dans la durée."},
  {id:'g08',cat:'GAV',q:"Un mineur de 10 ans peut-il être placé en garde à vue ?",opts:["Oui, 12h maximum","Oui, 24h maximum","Non, jamais","Oui sur autorisation JLD"],c:2,art:"Art. L413-6 CJPM",diff:2,expl:"La GAV est <strong>interdite pour les moins de 13 ans</strong>. Une retenue judiciaire de 12h maximum (non renouvelable) peut être prononcée par l'OPJ."},
  {id:'f01',cat:'FLAGRANCE',q:"La durée initiale de l'enquête de flagrance est de :",opts:["24h","48h","8 jours","15 jours"],c:2,art:"Art. 53 al.1 CPP",diff:1,expl:"L'enquête de flagrance dure <strong>8 jours</strong>. Elle peut être prolongée de 8 jours supplémentaires par le JLD pour les crimes/délits ≥5 ans."},
  {id:'f02',cat:'FLAGRANCE',q:"En flagrance, les perquisitions peuvent avoir lieu :",opts:["Uniquement entre 6h et 21h","De jour comme de nuit","Seulement avec accord JLD","Uniquement après 8h"],c:1,art:"Art. 59 al.3 CPP",diff:2,expl:"En flagrance, les perquisitions peuvent être effectuées <strong>de jour comme de nuit</strong>, sans les restrictions horaires de la préliminaire."},
  {id:'f03',cat:'FLAGRANCE',q:"Est qualifié de flagrant le crime ou délit :",opts:["Commis depuis moins de 24h","Qui se commet actuellement ou vient de se commettre","Constaté par deux témoins","Dont l'auteur est connu"],c:1,art:"Art. 53 al.1 CPP",diff:1,expl:"Est flagrant le crime/délit <strong>qui se commet actuellement ou vient de se commettre</strong>. Les hypothèses de poursuite publique et d'indices apparents sont aussi visées."},
  {id:'p01',cat:'PERQUIZ',q:"En enquête préliminaire, la perquisition au domicile nécessite :",opts:["L'accord oral de l'intéressé","Le consentement écrit et exprès","L'autorisation du préfet","L'ordonnance du JI"],c:1,art:"Art. 76 CPP",diff:2,expl:"En préliminaire, la perquisition requiert le <strong>consentement écrit et exprès</strong> de l'intéressé. En cas de refus, il faut une autorisation du JLD."},
  {id:'p02',cat:'PERQUIZ',q:"Les perquisitions de droit commun sont autorisées entre :",opts:["7h et 20h","6h et 21h","8h et 22h","6h et 20h"],c:1,art:"Art. 59 CPP",diff:1,expl:"Les perquisitions ne peuvent avoir lieu qu'entre <strong>6h et 21h</strong>, sauf en flagrance ou avec autorisation spéciale."},
  {id:'p03',cat:'PERQUIZ',q:"En cas d'absence de l'occupant lors d'une perquisition, combien de témoins sont requis ?",opts:["1","2","3","Un huissier"],c:1,art:"Art. 57 al.3 CPP",diff:2,expl:"En cas d'absence ou de refus, <strong>2 témoins</strong> étrangers à la police et à l'affaire doivent assister aux opérations."},
  {id:'p04',cat:'PERQUIZ',q:"La perquisition dans un cabinet d'avocat nécessite obligatoirement :",opts:["L'accord de l'avocat","La présence du bâtonnier ou son délégué","L'autorisation du garde des Sceaux","L'accord du client"],c:1,art:"Art. 56-1 CPP",diff:2,expl:"La présence du <strong>bâtonnier ou de son délégué</strong> est obligatoire lors de toute perquisition dans un cabinet d'avocat."},
  {id:'a01',cat:'AUDLIB',q:"En audition libre, la personne soupçonnée peut :",opts:["Être retenue contre sa volonté","Quitter les lieux à tout moment","Être placée en GAV pendant l'audition","Refuser d'être entendue et partir sans notification"],c:1,art:"Art. 61-1 CPP",diff:1,expl:"La personne en audition libre peut <strong>quitter les lieux à tout moment</strong>. L'OPJ doit l'informer de ce droit dès le début."},
  {id:'a02',cat:'AUDLIB',q:"L'audition libre est prévue à :",opts:["Art. 61 CPP","Art. 61-1 CPP","Art. 62 CPP","Art. 63 CPP"],c:1,art:"Art. 61-1 CPP",diff:1,expl:"L'audition libre est définie à l'<strong>art. 61-1 CPP</strong>, issu de la loi du 27 mai 2014 (transposant la directive UE 2012/13)."},
  {id:'m01',cat:'MANDATS',q:"Le mandat d'amener permet de :",opts:["Incarcérer la personne","La conduire devant le JI ou le PR","La placer en GAV","La surveiller à distance"],c:1,art:"Art. 122 CPP",diff:2,expl:"Le mandat d'amener ordonne de <strong>conduire la personne devant le magistrat</strong> qui l'a décerné. Il ne permet pas l'incarcération."},
  {id:'m02',cat:'MANDATS',q:"Le mandat d'arrêt vise une personne :",opts:["Coopérative et présente","En fuite ou résidant à l'étranger","Mineure uniquement","Mise en examen pour délit"],c:1,art:"Art. 131 CPP",diff:2,expl:"Le mandat d'arrêt vise les personnes <strong>en fuite ou résidant à l'étranger</strong>. Il ordonne leur arrestation et incarcération provisoire."},
  {id:'o01',cat:'OPJ',q:"L'habilitation OPJ est accordée par :",opts:["Le préfet","Le garde des Sceaux","Le procureur général près la CA","Le PR"],c:2,art:"Art. 16 al.2 CPP",diff:2,expl:"L'habilitation OPJ est accordée par le <strong>procureur général</strong> près la cour d'appel du ressort dans lequel le fonctionnaire est affecté."},
  {id:'o02',cat:'OPJ',q:"La compétence d'un OPJ en commission rogatoire est :",opts:["Limitée à son ressort","Nationale automatiquement","Limitée à sa région","Limitée au ressort de la CA"],c:1,art:"Art. 18 al.4 CPP",diff:2,expl:"En CR, l'OPJ bénéficie d'une <strong>compétence nationale automatique</strong>, sans avoir besoin d'autorisation spéciale."},
  {id:'pr01',cat:'PRESCRIP',q:"Depuis la loi du 27 fév. 2017, la prescription d'un crime est de :",opts:["10 ans","15 ans","20 ans","30 ans"],c:2,art:"Art. 7 CPP",diff:1,expl:"Depuis la loi du 27 février 2017, la prescription des crimes est de <strong>20 ans</strong> (contre 10 ans auparavant)."},
  {id:'pr02',cat:'PRESCRIP',q:"Depuis la loi du 27 fév. 2017, la prescription d'un délit est de :",opts:["3 ans","5 ans","6 ans","10 ans"],c:2,art:"Art. 8 CPP",diff:1,expl:"La prescription des délits est désormais de <strong>6 ans</strong> (contre 3 ans avant 2017)."},
  {id:'pr03',cat:'PRESCRIP',q:"Les crimes contre l'humanité sont :",opts:["Prescrits par 30 ans","Prescrits par 50 ans","Prescrits par 100 ans","Imprescriptibles"],c:3,art:"Art. 213-5 CP",diff:1,expl:"Les crimes contre l'humanité sont <strong>imprescriptibles</strong> en droit français et international."},
  {id:'r01',cat:'RECIDIVE',q:"La récidive légale est une circonstance :",opts:["Atténuante","Aggravante réelle","Aggravante légale","Exonératoire"],c:2,art:"Art. 132-8 CP",diff:1,expl:"La récidive est une <strong>circonstance aggravante légale</strong> qui entraîne automatiquement un doublement des peines maximales."},
  {id:'r02',cat:'RECIDIVE',q:"La réitération d'infraction (art. 132-16-7 CP) exige :",opts:["Une condamnation définitive antérieure","Aucune condition de condamnation préalable","Un délai de moins de 5 ans","Deux infractions identiques"],c:1,art:"Art. 132-16-7 CP",diff:2,expl:"La réitération ne nécessite <strong>aucune condamnation définitive préalable</strong>. Elle diffère de la récidive légale sur ce point essentiel."},
  {id:'ld01',cat:'LEGDEF',q:"La légitime défense est définie à :",opts:["Art. 122-1 CP","Art. 122-4 CP","Art. 122-5 CP","Art. 122-7 CP"],c:2,art:"Art. 122-5 CP",diff:1,expl:"La légitime défense des personnes et des biens est prévue à l'<strong>art. 122-5 CP</strong>. Elle constitue un fait justificatif."},
  {id:'ld02',cat:'LEGDEF',q:"Les 3 conditions cumulatives de la légitime défense sont :",opts:["Nécessité + proportionnalité","Nécessité + simultanéité + proportionnalité","Proportionnalité + urgence","Automatique si agression illicite"],c:1,art:"Art. 122-5 CP",diff:2,expl:"La légitime défense exige 3 conditions cumulatives : <strong>nécessité + simultanéité + proportionnalité</strong>."},
  {id:'n01',cat:'NULLITES',q:"La nullité relative (art. 802 CPP) nécessite :",opts:["Uniquement une irrégularité formelle","La preuve d'un grief subi par la partie","Une violation d'ordre public","La mauvaise foi de l'OPJ"],c:1,art:"Art. 802 CPP",diff:2,expl:"La nullité relative exige la démonstration d'un <strong>grief concret</strong> pour la partie. Principe : pas de nullité sans grief."},
  {id:'i01',cat:'INSTRUCTION',q:"Le juge d'instruction est saisi par :",opts:["Plainte directe seule","Réquisitoire introductif du parquet","Signalement de l'OPJ","Arrêté préfectoral"],c:1,art:"Art. 80 CPP",diff:1,expl:"Le juge d'instruction est saisi par un <strong>réquisitoire introductif</strong> du parquet, ou par une plainte avec constitution de partie civile."},
  {id:'i02',cat:'INSTRUCTION',q:"La mise en examen intervient s'il existe :",opts:["Un simple soupçon","Des indices graves ou concordants","Une preuve directe","Un aveu"],c:1,art:"Art. 80-1 CPP",diff:2,expl:"La MEX requiert des <strong>indices graves ou concordants</strong> rendant vraisemblable la participation à l'infraction."},
  {id:'t01',cat:'TAJ',q:"Le TAJ est la fusion de :",opts:["FNAEG + FAED","STIC (PN) + JUDEX (GN)","FNAEG + SIS","FAED + FPR"],c:1,art:"Décret 2012-652",diff:2,expl:"Le TAJ (Traitement des Antécédents Judiciaires) est la fusion des anciens <strong>STIC (Police Nationale) et JUDEX (Gendarmerie Nationale)</strong>."},
  {id:'t02',cat:'TAJ',q:"Le FNAEG contient :",opts:["Les empreintes digitales","Les profils ADN","Les antécédents judiciaires","Les signalements internationaux"],c:1,art:"Art. 706-54 CPP",diff:2,expl:"Le FNAEG (Fichier National Automatisé des Empreintes Génétiques) contient les <strong>profils ADN</strong> des condamnés et mis en cause."},
  {id:'al01',cat:'ALTERNATIVES',q:"La composition pénale (art. 41-2 CPP) s'applique aux délits punis d'au maximum :",opts:["3 ans","5 ans","7 ans","Tout délit"],c:1,art:"Art. 41-2 CPP",diff:2,expl:"La composition pénale s'applique aux délits punis d'au maximum <strong>5 ans d'emprisonnement</strong>."},
  {id:'al02',cat:'ALTERNATIVES',q:"L'exécution de la composition pénale entraîne :",opts:["La mise en mouvement de l'AP","L'extinction de l'action publique","Un classement provisoire","Une mise en examen"],c:1,art:"Art. 41-2 CPP",diff:2,expl:"L'exécution de la composition pénale entraîne <strong>l'extinction de l'action publique</strong>. En cas de refus, les poursuites reprennent."},
  {id:'in01',cat:'INFRACTIONS',q:"Le vol simple (art. 311-1 CP) est puni de :",opts:["1 an / 15k€","3 ans / 45k€","5 ans / 75k€","Contravention"],c:1,art:"Art. 311-1 CP",diff:1,expl:"Le vol simple est puni de <strong>3 ans d'emprisonnement et 45 000 € d'amende</strong>."},
  {id:'in02',cat:'INFRACTIONS',q:"L'escroquerie (art. 313-1 CP) suppose :",opts:["Une soustraction","Une tromperie par manœuvres → remise","Un détournement","Une violence"],c:1,art:"Art. 313-1 CP",diff:2,expl:"L'escroquerie exige <strong>une tromperie (faux nom, manœuvres frauduleuses) suivie d'une remise</strong> par la victime."},
  {id:'in03',cat:'INFRACTIONS',q:"Le vol en bande organisée (art. 311-9 CP) est :",opts:["Un délit puni de 10 ans","Un crime puni de 15 ans RC","Un délit puni de 7 ans","Un crime puni de 20 ans RC"],c:1,art:"Art. 311-9 CP",diff:2,expl:"Le vol en bande organisée est un <strong>crime puni de 15 ans de réclusion criminelle</strong>. Piège classique : beaucoup pensent que c'est un délit !"},
  {id:'in04',cat:'INFRACTIONS',q:"Le meurtre (art. 221-1 CP) se distingue des violences mortelles (art. 222-7 CP) par :",opts:["Le mode opératoire","L'intention de tuer (animus necandi)","La qualité de la victime","Le lieu de commission"],c:1,art:"Art. 221-1 vs 222-7 CP",diff:2,expl:"Le meurtre exige l'<strong>intention de tuer</strong> (animus necandi). Les violences mortelles n'impliquent que l'intention de blesser."},
  {id:'in05',cat:'INFRACTIONS',q:"La conduite avec un taux d'alcool ≥ 0,80 g/l est :",opts:["Une contravention","Un délit puni de 2 ans + 4500€","Un crime","Non punissable"],c:1,art:"Art. L234-1 C.route",diff:1,expl:"La conduite avec un taux ≥ 0,80 g/l est un <strong>délit puni de 2 ans + 4 500 €</strong>. Le taux contravention est 0,50-0,80 g/l."},
  {id:'in06',cat:'INFRACTIONS',q:"Les stupéfiants : le seuil délictuel est :",opts:["0,5 mg/l","1 g/l","Il n'y a pas de seuil — toute présence est délictuelle","0,80 g/l"],c:2,art:"Art. L235-1 C.route",diff:2,expl:"Pour les stupéfiants, <strong>il n'y a aucun seuil</strong>. Toute présence dans l'organisme constitue le délit de conduite sous l'influence de stupéfiants."},
  {id:'in07',cat:'INFRACTIONS',q:"L'abus de confiance (art. 314-1 CP) suppose :",opts:["Une soustraction directe","Une remise préalable licite puis un détournement","Une tromperie initiale","Des violences"],c:1,art:"Art. 314-1 CP",diff:2,expl:"L'ADB exige une <strong>remise préalable et licite</strong> du bien (mandat, dépôt, prêt), suivie d'un détournement."},
  {id:'in08',cat:'INFRACTIONS',q:"Le recel (art. 321-1 CP) est une infraction :",opts:["Instantanée","Continue et autonome","Formelle","D'habitude"],c:1,art:"Art. 321-1 CP",diff:2,expl:"Le recel est une infraction <strong>continue et autonome</strong>. Elle persiste tant que l'objet est détenu."},
  {id:'in09',cat:'INFRACTIONS',q:"L'usage illicite de stupéfiants (art. L3421-1 CSP) est puni de :",opts:["6 mois + 7500€","1 an + 3750€","2 ans + 4500€","Contravention"],c:1,art:"Art. L3421-1 CSP",diff:1,expl:"L'usage de stupéfiants est puni de <strong>1 an + 3 750 €</strong>. L'amende forfaitaire délictuelle (AFD) de 200 € est possible."},
  {id:'in10',cat:'INFRACTIONS',q:"La tentative est TOUJOURS punissable pour :",opts:["Les contraventions","Les délits si le texte le prévoit","Les crimes","Les délits uniquement"],c:2,art:"Art. 121-4 CP",diff:1,expl:"La tentative est <strong>toujours punissable pour les crimes</strong>. Pour les délits, un texte exprès est requis. Jamais pour les contraventions."},
  {id:'in11',cat:'INFRACTIONS',q:"L'outrage à personne dépositaire de l'autorité publique (art. 433-5 CP) est :",opts:["Physique","Verbal et directement adressé (non public)","Public uniquement","Identique à la rébellion"],c:1,art:"Art. 433-5 CP",diff:2,expl:"L'outrage est une expression <strong>outrageante NON PUBLIQUE directement adressée</strong> à la personne. Si public = injure (loi 1881)."},
  {id:'in12',cat:'INFRACTIONS',q:"La rébellion (art. 433-6 CP) suppose :",opts:["Des insultes envers un agent","Une résistance violente et active à l'égard d'une PDAP","Un simple refus d'obtempérer","Une résistance passive"],c:1,art:"Art. 433-6 CP",diff:2,expl:"La rébellion exige une <strong>résistance VIOLENTE et ACTIVE</strong>. La résistance passive (se laisser tomber) n'est PAS une rébellion."},
  {id:'lp01',cat:'LIBERTES',q:"L'article 66 de la Constitution fait de l'autorité judiciaire :",opts:["Gardienne de l'ordre public","Gardienne de la liberté individuelle","Gardienne de la sécurité nationale","Gardienne de la propriété"],c:1,art:"Art. 66 Constitution",diff:1,expl:"L'art. 66 dispose que <strong>'l'autorité judiciaire est gardienne de la liberté individuelle'</strong>. C'est le fondement constitutionnel de la GAV et de la DP."},
  {id:'lp02',cat:'LIBERTES',q:"L'article 3 CEDH (interdiction de la torture) est :",opts:["Relatif — peut être limité par loi","Qualifié — peut être limité en urgence","Absolu — aucune dérogation possible","Limité aux États membres du Conseil de l'Europe"],c:2,art:"Art. 3 CEDH",diff:2,expl:"L'art. 3 CEDH est un <strong>droit ABSOLU</strong>. Aucune circonstance, même le terrorisme ou l'état de guerre, ne peut justifier une dérogation."},
  {id:'lp03',cat:'LIBERTES',q:"La présomption d'innocence est renversée uniquement par :",opts:["La mise en examen","La garde à vue","Une condamnation définitive","Le renvoi en jugement"],c:2,art:"Art. 9 DDHC",diff:1,expl:"La présomption d'innocence est renversée <strong>uniquement par une condamnation définitive</strong>. La MEX, la GAV et le renvoi ne la suppriment pas."},
  {id:'co01',cat:'CDO',q:"Les écoutes téléphoniques en instruction sont autorisées par :",opts:["Le procureur de la République","Le juge d'instruction","Le JLD","L'OPJ avec accord PR"],c:1,art:"Art. 100 CPP",diff:2,expl:"En instruction, les écoutes téléphoniques sont ordonnées par le <strong>juge d'instruction</strong>. En préliminaire, c'est le JLD (sur réq. PR, art. 706-95)."},
  {id:'co02',cat:'CDO',q:"La géolocalisation en temps réel au-delà de 15 jours nécessite :",opts:["Simple autorisation du PR","Autorisation du JLD","Ordonnance du JI","Accord du préfet"],c:1,art:"Art. 230-32 CPP",diff:2,expl:"La géolocalisation peut être autorisée par le PR pour 15 jours. Au-delà, <strong>le JLD est obligatoire</strong> (1 mois renouvelable)."},
  {id:'co03',cat:'CDO',q:"L'association de malfaiteurs criminelle (art. 450-1 CP) est punie de :",opts:["5 ans + 75k€","7 ans + 100k€","10 ans + 150k€","15 ans RC"],c:2,art:"Art. 450-1 CP",diff:2,expl:"L'AM criminelle est punie de <strong>10 ans d'emprisonnement et 150 000 €</strong> d'amende."},
  {id:'min01',cat:'MINEURS',q:"Depuis le CJPM 2021, la présomption irréfragable d'irresponsabilité s'applique aux moins de :",opts:["10 ans","12 ans","13 ans","16 ans"],c:2,art:"Art. L11-1 CJPM",diff:2,expl:"Le CJPM (entré en vigueur le 30/09/2021) fixe à <strong>13 ans</strong> l'âge de la présomption irréfragable d'irresponsabilité pénale."},
  {id:'min02',cat:'MINEURS',q:"Pour un mineur de 13 à 16 ans, la GAV est possible pour :",opts:["Tout délit","Toute infraction punie d'emprisonnement","Infractions punies d'au moins 5 ans","Infractions punies d'au moins 3 ans"],c:2,art:"Art. L413-6 CJPM",diff:2,expl:"Pour les 13-16 ans, la GAV est possible uniquement si l'infraction est punie d'<strong>au moins 5 ans d'emprisonnement</strong>."},
  {id:'cr01',cat:'COMMISSION',q:"Une commission rogatoire peut être délivrée par :",opts:["Le procureur de la République","Le juge d'instruction exclusivement","L'OPJ sur autorisation PR","Le JLD"],c:1,art:"Art. 151 CPP",diff:1,expl:"La CR est délivrée <strong>exclusivement par le juge d'instruction</strong>. Le PR ne peut pas en délivrer."},
  {id:'cr02',cat:'COMMISSION',q:"En commission rogatoire, l'OPJ ne peut PAS :",opts:["Procéder à des perquisitions","Placer en garde à vue","Délivrer des mandats","Auditionner des témoins"],c:2,art:"Art. 152 CPP",diff:2,expl:"En CR, l'OPJ ne peut pas <strong>délivrer des mandats</strong> — cela reste la prérogative exclusive du juge d'instruction."},
  {id:'ap01',cat:'ACTION_PUB',q:"Le classement sans suite par le procureur :",opts:["Éteint définitivement l'action publique","N'éteint PAS l'AP — réversible","Équivaut à un non-lieu","Transfère l'AP à la partie civile"],c:1,art:"Art. 40-1 CPP",diff:2,expl:"Le classement sans suite <strong>ne constitue pas une décision définitive</strong>. Le PR peut revenir sur sa décision en cas d'éléments nouveaux."},
  {id:'ap02',cat:'ACTION_PUB',q:"Les missions de la Police Judiciaire selon l'art. 14 CPP sont :",opts:["Surveiller, interpeller, juger","Constater, rassembler les preuves, rechercher les auteurs","Prévenir, dissuader, sanctionner","Enquêter, poursuivre, condamner"],c:1,art:"Art. 14 CPP",diff:1,expl:"L'art. 14 CPP définit 3 missions PJ : <strong>constater les infractions, rassembler les preuves, rechercher les auteurs</strong>."},
  /* ═══ NOUVEAUX QCM v25 ═══ */
  /* CONTRÔLES */
  {id:'ci01',cat:'CONTROLES',q:"Le contrôle d'identité peut durer au maximum :",opts:["1 heure","2 heures","4 heures","Sans limite précise"],c:2,art:"Art. 78-3 CPP",diff:2,expl:"La rétention aux fins de vérification d'identité est limitée à <strong>4 heures maximum</strong>. Passé ce délai, la personne doit être libérée ou placée en GAV."},
  {id:'ci02',cat:'CONTROLES',q:"Lors d'une vérification d'identité (art. 78-3), l'avis au PR doit être donné :",opts:["Dans l'heure","Dans les 3 heures","Immédiatement","Avant la 1ère vérification"],c:2,art:"Art. 78-3 CPP",diff:2,expl:"L'avis au Procureur de la République doit être donné <strong>immédiatement</strong> dès le début de la rétention aux fins de vérification."},
  {id:'ci03',cat:'CONTROLES',q:"Le contrôle d'identité basé sur l'apparence ethnique est :",opts:["Autorisé en zone frontalière","Autorisé avec réquisitions PR","Interdit — faute lourde de l'État","Autorisé sur décision OPJ"],c:2,art:"Art. 78-2 CPP — Cass. 2016",diff:2,expl:"La Cour de cassation (9 nov. 2016) a consacré l'<strong>interdiction absolue du profilage ethnique</strong>. Un contrôle fondé sur l'apparence constitue une faute lourde de l'État."},
  {id:'ci04',cat:'CONTROLES',q:"La fouille de véhicule sur réquisitions du PR est régie par :",opts:["Art. 56 CPP","Art. 78-2-2 CPP","Art. 76 CPP","Art. 53 CPP"],c:1,art:"Art. 78-2-2 CPP",diff:2,expl:"La fouille de véhicule sur réquisitions du PR est prévue à l'<strong>art. 78-2-2 CPP</strong>. Elle nécessite des réquisitions écrites définissant un périmètre et une durée."},
  {id:'ci05',cat:'CONTROLES',q:"Un étranger en situation irrégulière peut être retenu en CRA pendant :",opts:["24h maximum","48h puis JLD","7 jours maximum","90 jours maximum"],c:3,art:"CESEDA — Art. L742-1",diff:3,expl:"La durée maximale de rétention administrative est de <strong>90 jours</strong> : 48h préfet + 28j JLD + renouvellements successifs jusqu'au plafond."},
  /* MANDATS */
  {id:'mand01',cat:'MANDATS',q:"Le mandat d'amener permet de :",opts:["Placer la personne en GAV immédiatement","Incarcérer la personne provisoirement","La conduire de force devant le juge qui l'a décerné","Surveiller la personne à distance"],c:2,art:"Art. 122 al.2 CPP",diff:2,expl:"Le mandat d'amener ordonne de <strong>conduire physiquement la personne devant le magistrat</strong>. Il n'emporte pas d'incarcération — c'est le mandat de dépôt."},
  {id:'mand02',cat:'MANDATS',q:"Le mandat de recherche est émis par :",opts:["Le Juge d'Instruction","Le Juge des Libertés et de la Détention","Le Procureur de la République","L'OPJ habilité"],c:2,art:"Art. 122-4 CPP",diff:2,expl:"Le mandat de recherche est émis par le <strong>Procureur de la République</strong> (et non par le JI). Il concerne les infractions punies d'au moins 3 ans."},
  {id:'mand03',cat:'MANDATS',q:"Le mandat d'arrêt vise une personne :",opts:["Présente et coopérative","En fuite ou résidant à l'étranger","Mineure uniquement","Placée en contrôle judiciaire"],c:1,art:"Art. 131 CPP",diff:1,expl:"Le mandat d'arrêt est spécifiquement conçu pour les personnes <strong>en fuite ou résidant à l'étranger</strong>. Il ordonne leur arrestation et incarcération provisoire."},
  {id:'mand04',cat:'MANDATS',q:"Quelle est la durée de validité d'un mandat de recherche ?",opts:["6 mois","1 an renouvelable","Sans limite","3 ans"],c:1,art:"Art. 122-4 CPP",diff:3,expl:"Le mandat de recherche a une durée de <strong>1 an renouvelable</strong>. À l'expiration, il doit être renouvelé par le PR pour rester exécutoire."},
  {id:'mand05',cat:'MANDATS',q:"Lors de l'exécution d'un mandat, l'OPJ doit :",opts:["Garder le mandat secret","Exhiber le mandat et notifier les droits","Attendre l'accord du JI","Notifier uniquement si demandé"],c:1,art:"Art. 122 CPP",diff:1,expl:"L'OPJ exécutant un mandat doit <strong>exhiber le mandat et notifier ses droits</strong> à la personne visée, notamment le droit à un avocat."},
  /* MESURES COERCITIVES */
  {id:'mc01',cat:'MESURES_COERC',q:"L'ARSE nécessite une peine minimale encourrue de :",opts:["6 mois","1 an","2 ans","3 ans"],c:2,art:"Art. 142-5 CPP",diff:2,expl:"L'assignation à résidence avec surveillance électronique requiert que la personne encourt une peine d'au moins <strong>2 ans d'emprisonnement</strong>."},
  {id:'mc02',cat:'MESURES_COERC',q:"La détention provisoire en matière correctionnelle (délit ≤10 ans) dure au maximum :",opts:["4 mois non renouvelables","1 an","2 ans","4 mois renouvelables jusqu'à 2 ans"],c:3,art:"Art. 145-1 CPP",diff:3,expl:"En matière correctionnelle (délit ≤10 ans), la DP peut durer <strong>4 mois renouvelables dans la limite de 2 ans maximum</strong> total."},
  {id:'mc03',cat:'MESURES_COERC',q:"Les obligations du contrôle judiciaire (art. 138 CPP) sont :",opts:["Indicatives — le juge peut en créer de nouvelles","Limitatives — liste fermée de 17 obligations","Facultatives — à la discrétion du prévenu","Identiques à l'ARSE"],c:1,art:"Art. 138 CPP",diff:2,expl:"Les obligations du contrôle judiciaire constituent une <strong>liste LIMITATIVE</strong> de 17 obligations. Le juge ne peut en inventer aucune autre."},
  {id:'mc04',cat:'MESURES_COERC',q:"La détention provisoire est décidée par :",opts:["Le Juge d'Instruction seul","Le Procureur de la République","Le Juge des Libertés et de la Détention","Le Président du Tribunal"],c:2,art:"Art. 143-1 CPP",diff:1,expl:"La détention provisoire est ordonnée par le <strong>JLD</strong>, saisi par ordonnance du JI. Le JI seul ne peut jamais décider de la DP."},
  {id:'mc05',cat:'MESURES_COERC',q:"La DP peut être ordonnée dès lors que l'infraction est punie d'au moins :",opts:["1 an","2 ans","3 ans","5 ans"],c:2,art:"Art. 143-1 CPP",diff:2,expl:"La détention provisoire nécessite que la personne soit mise en examen pour un délit puni d'au moins <strong>3 ans d'emprisonnement</strong> ou tout crime."},
  /* FICHIERS */
  {id:'fij01',cat:'FICHIERS',q:"L'inscription au FIJAISV est obligatoire pour :",opts:["Tout crime","Les infractions sexuelles sur mineurs et les agressions sexuelles","Tous les délits violents","Les crimes en bande organisée"],c:1,art:"Art. 706-53-1 CPP",diff:2,expl:"L'inscription au FIJAISV est obligatoire pour les <strong>infractions sexuelles sur mineurs et les agressions sexuelles</strong> graves. La durée est de 30 ans pour les crimes, 20 ans pour les délits."},
  {id:'fij02',cat:'FICHIERS',q:"Les obligations déclaratives au FIJAISV sont :",opts:["Mensuelles uniquement","Mensuelles + semestrielles + annuelles selon l'infraction","Annuelles uniquement","Trimestrielles"],c:1,art:"Art. 706-53-5 CPP",diff:3,expl:"Les obligations au FIJAISV varient selon la gravité : <strong>mensuelles (déplacements), semestrielles (adresse) ou annuelles</strong> selon la nature de l'infraction."},
  {id:'fij03',cat:'FICHIERS',q:"Le FNAEG contient :",opts:["Les empreintes digitales","Les antécédents judiciaires","Les profils ADN des mis en cause et condamnés","Les titres de séjour des étrangers"],c:2,art:"Art. 706-54 CPP",diff:1,expl:"Le FNAEG (Fichier National Automatisé des Empreintes Génétiques) contient exclusivement les <strong>profils ADN</strong> des personnes condamnées et mises en cause."},
  {id:'fij04',cat:'FICHIERS',q:"Le SALVAC est géré par :",opts:["La DGSI","L'OCRVP","Europol","La DCPJ"],c:1,art:"Décret SALVAC",diff:3,expl:"SALVAC (Système d'Analyse des Liens de la Violence Associée aux Crimes) est géré par l'<strong>OCRVP</strong> (Office Central pour la Répression des Violences aux Personnes)."},
  {id:'fij05',cat:'FICHIERS',q:"Le TAJ est la fusion de :",opts:["FNAEG + FAED","STIC (PN) + JUDEX (GN)","FIJAISV + FAED","FPR + TAJ"],c:1,art:"Décret 2012-652",diff:2,expl:"Le TAJ (Traitement des Antécédents Judiciaires) est né de la fusion du <strong>STIC (Police Nationale) et du JUDEX (Gendarmerie Nationale)</strong>."},
  /* ALERTE ENLÈVEMENT & ART. 74 */
  {id:'ae01',cat:'ENQUETES_SPEC',q:"Le plan Alerte Enlèvement nécessite combien de critères cumulatifs ?",opts:["3","4","5","6"],c:2,art:"Décret 2006 — Alerte enlèvement",diff:2,expl:"Le déclenchement de l'Alerte Enlèvement requiert la réunion de <strong>5 critères cumulatifs</strong> : victime mineure, enlèvement avéré, intégrité menacée, description suspect/véhicule, et compétence judiciaire."},
  {id:'ae02',cat:'ENQUETES_SPEC',q:"La mort suspecte (art. 74 CPP) nécessite :",opts:["Une qualification pénale immédiate","La réquisition d'un médecin légiste obligatoirement","L'ouverture d'une information judiciaire d'office","Un accord préalable du JI"],c:1,art:"Art. 74 CPP",diff:2,expl:"Lors d'une mort de cause inconnue, <strong>la réquisition d'un médecin légiste est obligatoire</strong>. L'OPJ n'a pas besoin d'une qualification pénale préalable pour agir."},
  {id:'ae03',cat:'ENQUETES_SPEC',q:"Les disparitions inquiétantes (art. 74-1 CPP) impliquent :",opts:["Une GAV immédiate","L'ouverture d'une information judiciaire automatique","3 critères : disparition, inquiétude, faits criminels probables","Seulement l'alerte aux médias"],c:2,art:"Art. 74-1 CPP",diff:3,expl:"L'art. 74-1 CPP exige <strong>3 critères</strong> : la disparition effective, un caractère inquiétant, et des éléments rendant probables une atteinte criminelle."},
  /* ACTION PUBLIQUE */
  {id:'apub01',cat:'ACTION_PUB',q:"La composition pénale est possible pour les délits punis d'au maximum :",opts:["3 ans","5 ans","7 ans","Tous délits confondus"],c:1,art:"Art. 41-2 CPP",diff:2,expl:"La composition pénale (PR propose des mesures) est limitée aux délits punis d'au maximum <strong>5 ans d'emprisonnement</strong>."},
  {id:'apub02',cat:'ACTION_PUB',q:"L'exécution d'une composition pénale entraîne :",opts:["Une condamnation inscrite au casier B1","L'extinction de l'action publique","Un classement provisoire","Une mise en examen"],c:1,art:"Art. 41-2 CPP",diff:2,expl:"L'exécution réussie de la composition pénale entraîne <strong>l'extinction de l'action publique</strong>. La mesure n'est pas inscrite au casier judiciaire B1."},
  {id:'apub03',cat:'ACTION_PUB',q:"Parmi les causes d'extinction de l'action publique, on trouve :",opts:["Le retrait de plainte de la victime","La décision de classement sans suite","Le décès du prévenu","La constitution de partie civile"],c:2,art:"Art. 6 CPP",diff:2,expl:"Le <strong>décès du prévenu</strong> éteint l'action publique (art. 6 CPP). L'amnistie, la prescription, la chose jugée et l'abrogation de la loi l'éteignent aussi."},
  {id:'apub04',cat:'ACTION_PUB',q:"L'action publique et l'action civile diffèrent en ce que :",opts:["L'action publique cherche la réparation, l'action civile la punition","L'action publique cherche la sanction sociale, l'action civile la réparation du dommage","Elles ont les mêmes finalités","L'action publique ne peut être exercée que par la victime"],c:1,art:"Art. 1-2 CPP",diff:1,expl:"<strong>L'action publique vise à sanctionner l'infraction</strong> (finalité sociale). <strong>L'action civile vise à réparer le dommage</strong> subi par la victime."},
  /* LIBERTÉS PUBLIQUES */
  {id:'lib01',cat:'LIBERTES',q:"La vidéo-protection en voie publique nécessite :",opts:["Une autorisation du PR","Une autorisation préfectorale","Un avis du maire uniquement","Aucune autorisation particulière"],c:1,art:"Art. L251-2 CSI",diff:2,expl:"L'installation de caméras de vidéo-protection en voie publique nécessite une <strong>autorisation préfectorale</strong> (préalable, motivée, durée limitée)."},
  {id:'lib02',cat:'LIBERTES',q:"La durée maximale de conservation des images de vidéo-protection est de :",opts:["7 jours","15 jours","30 jours","90 jours"],c:2,art:"Art. L252-3 CSI",diff:2,expl:"Les images de vidéo-protection doivent être conservées au maximum <strong>30 jours</strong>. Au-delà, elles doivent être effacées sauf si elles sont utiles à une enquête."},
  {id:'lib03',cat:'LIBERTES',q:"En France, les armes sont classées en :",opts:["2 catégories (A et B)","3 catégories (A, B, C)","4 catégories (A, B, C, D)","5 catégories"],c:2,art:"Art. R311-2 CSI",diff:2,expl:"Depuis la réforme de 2013, les armes sont classées en <strong>4 catégories : A (prohibées), B (soumises à autorisation), C (soumises à déclaration), D (libre acquisition).</strong>"},
  {id:'lib04',cat:'LIBERTES',q:"L'usage des armes par la police (art. L435-1 CSI) nécessite :",opts:["Une autorisation du PR","2 conditions cumulatives","3 conditions cumulatives","Aucune condition particulière"],c:2,art:"Art. L435-1 CSI",diff:2,expl:"L'art. L435-1 CSI encadre l'usage des armes selon <strong>3 conditions cumulatives</strong> : absolue nécessité, proportionnalité, et une des 5 situations légales."},
  {id:'lib05',cat:'LIBERTES',q:"Une manifestation publique doit être déclarée :",opts:["24h à l'avance","3 jours à l'avance","15 jours à l'avance","Immédiatement avant"],c:1,art:"Art. L211-1 CSI",diff:2,expl:"Toute manifestation sur la voie publique doit faire l'objet d'une déclaration préalable <strong>3 jours à l'avance</strong> (entre 3 et 15 jours) auprès de la préfecture ou mairie."},
  /* PATRIMONIAL */
  {id:'pat01',cat:'PATRIMONIAL',q:"Le blanchiment simple (art. 324-1 CP) est puni de :",opts:["3 ans / 75k€","5 ans / 375k€","7 ans / 500k€","10 ans / 750k€"],c:1,art:"Art. 324-1 CP",diff:2,expl:"Le blanchiment est puni de <strong>5 ans d'emprisonnement et 375 000 €</strong> d'amende. Aggravé en bande organisée : 10 ans + 750 000 €."},
  {id:'pat02',cat:'PATRIMONIAL',q:"La confiscation de l'ensemble du patrimoine (art. 131-21 al. 9 CP) est :",opts:["Automatique pour tout crime","Une mesure exceptionnelle réservée aux infractions les plus graves","Applicable à tous les délits","Décidée par l'OPJ"],c:1,art:"Art. 131-21 al. 9 CP",diff:3,expl:"La confiscation totale du patrimoine est une <strong>mesure exceptionnelle</strong> réservée aux infractions les plus graves (terrorisme, trafic, criminalité organisée grave)."},
  {id:'pat03',cat:'PATRIMONIAL',q:"FICOBA est un fichier permettant de connaître :",opts:["Les condamnations pénales","Les comptes bancaires d'une personne","Le patrimoine immobilier","Les véhicules immatriculés"],c:1,art:"Décret FICOBA",diff:2,expl:"FICOBA (Fichier des Comptes Bancaires) répertorie l'ensemble des <strong>comptes bancaires</strong> ouverts en France. L'OPJ peut y accéder sur réquisition."},
  /* ENQUÊTES SPÉCIALES */
  {id:'es01',cat:'ENQUETES_SPEC',q:"En matière d'accident de la route, le dépistage de l'alcoolémie est :",opts:["Toujours facultatif","Obligatoire pour tout accident avec dommage corporel","Obligatoire uniquement sur décision du PR","Réservé aux accidents mortels"],c:1,art:"Art. L234-3 Code route",diff:2,expl:"Le dépistage de l'alcoolémie est <strong>obligatoire pour tout accident corporel</strong>. Il est facultatif en cas d'accident matériel uniquement."},
  {id:'es02',cat:'ENQUETES_SPEC',q:"La personne grièvement blessée (art. 74 al. 6 CPP) donne à l'OPJ :",opts:["Les pouvoirs de la flagrance uniquement","Des pouvoirs d'investigation propres avant qualification","Aucun pouvoir particulier","Les pouvoirs de la commission rogatoire"],c:1,art:"Art. 74 al. 6 CPP",diff:3,expl:"L'art. 74 al. 6 CPP confère à l'OPJ des <strong>pouvoirs d'investigation propres</strong> en cas de personne grièvement blessée, avant toute qualification pénale."},
  {id:'es03',cat:'ENQUETES_SPEC',q:"Lors d'une enquête accident avec dépistage de stupéfiants, les réquisitions médecin ITT sont :",opts:["Facultatives dans tous les cas","Obligatoires si blessé grave","Facultatives — à discrétion de l'OPJ","Uniquement sur autorisation PR"],c:1,art:"Art. 60-1 CPP — Art. R234-1 C.route",diff:2,expl:"Les réquisitions d'un médecin pour constater les lésions et l'ITT sont <strong>obligatoires en cas de blessé grave</strong>. Elles permettent de qualifier l'infraction avec précision."},
  /* DROIT PÉNAL GÉNÉRAL AVANCÉ */
  {id:'dpg01',cat:'INFRACTIONS',q:"Le concours réel d'infractions (art. 132-2 CP) existe quand :",opts:["Les infractions sont connexes","Plusieurs infractions distinctes sans condamnation définitive entre elles","Deux personnes commettent la même infraction","Une infraction est tentée sans aboutir"],c:1,art:"Art. 132-2 CP",diff:3,expl:"Le concours réel existe quand une même personne commet <strong>plusieurs infractions distinctes sans qu'une condamnation définitive ait été rendue</strong> entre elles."},
  {id:'dpg02',cat:'NULLITES',q:"La nullité textuelle (art. 171 CPP) :",opts:["Nécessite la preuve d'un grief concret","Est automatique dès la violation d'un texte l'édictant","Peut être régularisée après coup","N'entraîne pas la nullité de la procédure"],c:1,art:"Art. 171 CPP",diff:2,expl:"La nullité textuelle est <strong>automatique</strong> dès lors qu'un texte de loi l'édicte expressément — sans avoir à démontrer un grief particulier."},
  {id:'dpg03',cat:'INFRACTIONS',q:"En matière de concours réel, la règle principale est :",opts:["Le cumul illimité des peines","Non-cumul des peines d'emprisonnement (confusion)","L'absorption de la peine la plus faible","Le doublement automatique"],c:1,art:"Art. 132-3 et s. CP",diff:3,expl:"En matière de concours réel, c'est le principe de <strong>non-cumul (confusion) des peines d'emprisonnement</strong> qui s'applique : seule la peine la plus sévère est prononcée."},
  /* INSTRUCTION AVANCÉE */
  {id:'instr01',cat:'INSTRUCTION',q:"La Chambre de l'Instruction est saisie par :",opts:["Le Procureur uniquement","Appel de toute ordonnance du JI dans les 10 jours","Le JLD directement","La police judiciaire"],c:1,art:"Art. 185 CPP",diff:2,expl:"La Chambre de l'Instruction est saisie par <strong>appel dans les 10 jours</strong> de toute ordonnance du Juge d'Instruction, par le mis en examen, le PR, la partie civile."},
  {id:'instr02',cat:'INSTRUCTION',q:"La Cour d'Assises spéciale (sans jury populaire) est compétente pour :",opts:["Tous les crimes","Les crimes commis par des mineurs","Les crimes terroristes et en matière de trafic de stupéfiants aggravé","Les crimes en bande organisée simple"],c:2,art:"Art. 698-6 CPP",diff:3,expl:"La Cour d'Assises spéciale (composée uniquement de magistrats professionnels, sans jury) est compétente pour les <strong>affaires de terrorisme et certains crimes liés aux stupéfiants</strong>."},
  {id:'instr03',cat:'INSTRUCTION',q:"La Cour criminelle départementale (depuis 2023) juge :",opts:["Les crimes punis de perpétuité","Les crimes punis de 15 à 20 ans RC sans récidive","Tous les crimes sans jury","Les crimes organisés"],c:1,art:"Art. 380-16 CPP",diff:3,expl:"La Cour criminelle départementale, généralisée en 2023, juge les crimes <strong>punis de 15 à 20 ans de réclusion sans état de récidive</strong>. Elle est composée de magistrats sans jury."},
  /* GAV SUPPLÉMENTAIRES */
  {id:'g09',cat:'GAV',q:"L'heure de GAV d'un mineur de moins de 16 ans doit être notifiée à :",opts:["L'avocat uniquement","Le PR et les représentants légaux immédiatement","Le médecin scolaire","Le juge des enfants"],c:1,art:"Art. L413-8 CJPM",diff:2,expl:"Pour un mineur de moins de 16 ans, <strong>le PR et les représentants légaux</strong> doivent être informés immédiatement du placement en GAV."},
  {id:'g10',cat:'GAV',q:"En GAV de droit commun, la prolongation (+24h) doit être autorisée :",opts:["Verbalement par le PR","Par écrit et de manière motivée par le PR","Par le JLD uniquement","Automatiquement si l'enquête le nécessite"],c:1,art:"Art. 63 al.2 CPP",diff:1,expl:"La prolongation de 24h doit être accordée <strong>par écrit et de manière motivée</strong> par le Procureur de la République. Une autorisation verbale est insuffisante."},
  /* FICHES SUPPLÉMENTAIRES */
  {id:'fij06',cat:'FICHIERS',q:"Quelle est la durée maximale d'inscription au FIJAISV pour un crime ?",opts:["10 ans","20 ans","30 ans","À vie"],c:2,art:"Art. 706-53-4 CPP",diff:2,expl:"Pour les crimes, l'inscription au FIJAISV dure <strong>30 ans</strong>. Pour les délits, la durée est de 20 ans. Les durées peuvent être réduites par le juge."},
  /* PRESCRIPTION */
  {id:'pr04',cat:'PRESCRIP',q:"La prescription commence à courir pour une infraction continue :",opts:["Au jour du premier acte","Le jour du dernier acte constitutif","Dès la dénonciation","Au jour de la découverte"],c:1,art:"Art. 8 CPP",diff:3,expl:"Pour les infractions continues, la prescription commence à courir à partir du <strong>dernier acte constitutif</strong> de l'infraction (dernier jour de commission)."},
  /* VOIES DE RECOURS */
  {id:'vr01',cat:'INSTRUCTION',q:"Le délai d'appel d'une ordonnance du JI est de :",opts:["5 jours","10 jours","15 jours","30 jours"],c:1,art:"Art. 186 CPP",diff:2,expl:"L'appel d'une ordonnance du Juge d'Instruction doit être formé dans un délai de <strong>10 jours</strong> à compter de la notification de l'ordonnance."},
];

const FB=[
  {id:"F01",fam:"vie",nm:"MEURTRE",ref:"Art. 221-1 CP",qual:"Crime",pn:"30 ans RC",em:"⚖️",L:"Donner volontairement la mort à autrui (art. 221-1).",A:"Acte positif sur personne vivante, distincte de l'auteur, lien causal avec le décès. Tentative : oui.",M:"Intentionnel — animus necandi (intention homicide).",E:[{a:"Mineur <15 ans",p:"Perpétuité",r:"221-4 1°"},{a:"PDAP",p:"Perpétuité",r:"221-4 4°"},{a:"Préméditation = ASSASSINAT",p:"Perpétuité",r:"221-3"},{a:"Bande organisée",p:"Perpétuité",r:"221-4 8°"}],cf:"Assassinat (221-3) = meurtre + PRÉMÉDITATION. Violences mortelles (222-7) = intention de blesser seulement.",pg:"Confondre meurtre et violences mortelles (222-7 : 15 ans RC, pas d'intention de tuer)."},
  {id:"F02",fam:"vie",nm:"HOMICIDE INVOLONTAIRE",ref:"Art. 221-6 CP",qual:"Délit",pn:"3 ans / 45 000€",em:"🚗",L:"Causer la mort par maladresse, imprudence, négligence ou MOSP.",A:"Faute, lien causal, mort. Tentative : non.",M:"NON intentionnel — faute.",E:[{a:"Violation MOSP",p:"5 ans / 75k€",r:"221-6 al.2"},{a:"Alcool + conduite",p:"7 ans / 100k€",r:"221-6-1"}],cf:"Meurtre (221-1) = intention de tuer. HI = faute sans intention.",pg:"PAS d'intention de tuer — c'est l'élément distinctif clé."},
  {id:"F03",fam:"integrite",nm:"VIOLENCES VOLONTAIRES",ref:"Art. 222-7 à 222-16 CP",qual:"Variable",pn:"Variable selon ITT",em:"👊",L:"R624-1 (sans ITT), R625-1 (ITT≤8j), 222-11 (ITT>8j), 222-9 (mutilation), 222-7 (mort).",A:"Acte positif de violence, résultat. Tentative : non.",M:"Intentionnel — conscience d'affecter l'intégrité.",E:[{a:"PDAP/mineur/arme",p:"Aggravation",r:"222-12"},{a:"Mort sans intention",p:"15 ans RC",r:"222-7"}],cf:"Meurtre = intention de tuer. Violences = intention de blesser.",pg:"L'échelle pénale dépend de l'ITT fixée par le médecin légiste."},
  {id:"F04",fam:"integrite",nm:"VIOL",ref:"Art. 222-23 CP",qual:"Crime",pn:"15 ans RC",em:"🔴",L:"Pénétration sexuelle ou acte bucco-génital par violence, contrainte, menace ou surprise.",A:"Pénétration ou acte bucco-génital, sans consentement. Tentative : oui.",M:"Intentionnel — conscience d'imposer un acte non consenti.",E:[{a:"Mineur <15 ans",p:"20 ans RC",r:"222-24 2°"},{a:"Mort victime",p:"30 ans RC",r:"222-25"}],cf:"Viol = PÉNÉTRATION (crime). Agression sexuelle = sans pénétration (délit).",pg:"Actes bucco-génitaux = viol (crime 15 ans) depuis la jurisprudence."},
  {id:"F05",fam:"biens",nm:"VOL",ref:"Art. 311-1 CP",qual:"Délit",pn:"3 ans / 45 000€",em:"👜",L:"Soustraction frauduleuse de la chose d'autrui.",A:"Soustraction, chose meuble, appartenant à autrui. Tentative : oui.",M:"Intentionnel — volonté de se comporter en propriétaire.",E:[{a:"Violence",p:"5-10 ans",r:"311-5/6"},{a:"Arme",p:"10 ans",r:"311-8"},{a:"Bande organisée",p:"15 ans RC",r:"311-9"}],cf:"Escroquerie = tromperie → remise. Vol = soustraction.",pg:"Vol en bande organisée = CRIME (15 ans RC), pas délit !"},
  {id:"F06",fam:"biens",nm:"ESCROQUERIE",ref:"Art. 313-1 CP",qual:"Délit",pn:"5 ans / 375 000€",em:"🎭",L:"Obtenir une remise par faux nom, fausse qualité ou manœuvres frauduleuses.",A:"Tromperie, remise, préjudice. Tentative : oui.",M:"Intentionnel.",E:[{a:"Bande organisée",p:"10 ans + 1M€",r:"313-2"}],cf:"Vol : PREND. Escroquerie : DONNE suite à tromperie.",pg:"Simples mensonges ≠ escroquerie (il faut des manœuvres frauduleuses)."},
  {id:"F07",fam:"biens",nm:"ABUS DE CONFIANCE",ref:"Art. 314-1 CP",qual:"Délit",pn:"3 ans / 375 000€",em:"🤝",L:"Détourner un bien remis à charge de le rendre.",A:"Remise préalable licite, détournement, préjudice. Tentative : non.",M:"Intentionnel.",E:[{a:"Mandataire de justice",p:"7 ans + 750k€",r:"314-2"}],cf:"ADB : bien CONFIÉ puis DÉTOURNÉ. Vol : soustrait sans remise.",pg:"ADB exige remise PRÉALABLE et LICITE — critère fondamental."},
  {id:"F08",fam:"biens",nm:"RECEL",ref:"Art. 321-1 CP",qual:"Délit",pn:"5 ans / 375 000€",em:"📦",L:"Dissimuler, détenir, transmettre ou bénéficier du produit d'un crime/délit.",A:"Acte matériel, objet frauduleux d'un tiers. Tentative : non.",M:"Intentionnel — connaissance de l'origine frauduleuse.",E:[{a:"Habituel/professionnel",p:"10 ans + 750k€",r:"321-2"}],cf:"Recel ≠ complicité. Recel = infraction autonome continue.",pg:"Le recel est une infraction CONTINUE (persiste tant que détenu)."},
  {id:"F09",fam:"autorite",nm:"OUTRAGE",ref:"Art. 433-5 CP",qual:"Délit",pn:"1 an / 15 000€",em:"💬",L:"Paroles/gestes/menaces non publics à PDAP.",A:"Expression outrageante, NON publique, DIRECTEMENT à la personne.",M:"Intentionnel — connaissance qualité + conscience du caractère outrageant.",E:[{a:"En réunion",p:"2 ans + 30k€",r:"433-5 al.3"}],cf:"Outrage = VERBAL, DIRECT. Rébellion = PHYSIQUE.",pg:"Si PUBLIC = injure (loi 1881, pas le CP). Piège classique."},
  {id:"F10",fam:"autorite",nm:"RÉBELLION",ref:"Art. 433-6 CP",qual:"Délit",pn:"1 an / 15 000€",em:"✊",L:"Résistance violente à PDAP lors d'un acte légitime.",A:"Résistance VIOLENTE et ACTIVE lors d'un acte légitime. Tentative : non.",M:"Intentionnel.",E:[{a:"Arme",p:"2 ans + 30k€",r:"433-8"}],cf:"Rébellion = PHYSIQUE. Résistance PASSIVE ≠ rébellion.",pg:"Se laisser tomber au sol = résistance passive ≠ rébellion."},
  {id:"F11",fam:"stups",nm:"USAGE STUPÉFIANTS",ref:"Art. L3421-1 CSP",qual:"Délit",pn:"1 an / 3 750€",em:"🌿",L:"Usage illicite de substance classée.",A:"Usage illicite, substance classée. Tentative : non.",M:"Intentionnel.",E:[{a:"—",p:"—",r:"—"}],cf:"Usage (L3421-1) = 1 an. Détention/trafic (222-37) = 10 ans.",pg:"AFD possible : 200 €."},
  {id:"F12",fam:"route",nm:"CONDUITE ALCOOLIQUE",ref:"Art. L234-1 C.route",qual:"Délit",pn:"2 ans / 4 500€",em:"🍺",L:"Taux ≥ 0,80 g/l sang ou ≥ 0,40 mg/l air expiré.",A:"Conducteur, taux délictuel prouvé.",M:"Intentionnel — volonté de conduire après consommation.",E:[{a:"Cumul stups",p:"3 ans + 9k€",r:"L235-1 al.2"}],cf:"0,50-0,80 g/l = contravention. ≥ 0,80 g/l = DÉLIT.",pg:"Stups : PAS DE SEUIL — toute présence = délit."},
  {id:"F13",fam:"biens",nm:"EXTORSION",ref:"Art. 312-1 CP",qual:"Crime",pn:"7 ans / 100 000€",em:"💰",L:"Obtenir par violence/menace/contrainte une remise.",A:"Contrainte, remise par la victime. Tentative : oui.",M:"Intentionnel.",E:[{a:"Arme",p:"10 ans",r:"312-2"},{a:"Bande organisée",p:"20 ans RC",r:"312-6"}],cf:"Vol : SOUSTRAIT. Extorsion : REMET sous contrainte physique.",pg:"Chantage = menace de RÉVÉLATION. Extorsion = contrainte physique."},
  {id:"F14",fam:"stups",nm:"TRAFIC STUPÉFIANTS",ref:"Art. 222-34 à 222-40 CP",qual:"Crime/Délit",pn:"10 à 30 ans RC",em:"💊",L:"Participation à un réseau de distribution de substances classées.",A:"Participation active, substances classées, rôle variable.",M:"Intentionnel — connaissance nature illicite.",E:[{a:"Bande organisée",p:"30 ans RC + 7,5M€",r:"222-34"}],cf:"Usage (1 an) vs transport/détention (10 ans) vs trafic CO (30 ans RC).",pg:"Trafic en BO = 30 ans RC — peine criminelle maximale."},
  {id:"F15",fam:"autorite",nm:"CORRUPTION PASSIVE",ref:"Art. 432-11 CP",qual:"Crime",pn:"10 ans / 1 000 000€",em:"💼",L:"Agent public qui sollicite/agrée des avantages indus liés à sa fonction.",A:"Offre/demande, avantage indu, rapport avec la fonction.",M:"Intentionnel.",E:[{a:"Trafic d'influence",p:"10 ans",r:"432-11 al.2"}],cf:"Corruption passive (agent) vs active (particulier, art. 433-1).",pg:"Corruption passive (agent) ≠ active (particulier qui propose)."},
];


/* ─── STATE ─── */
function defaultState(){
  return{
    v:STATE_VERSION,page:'onboarding',
    user:{name:'OPJ',xp:0,streak:0,lastActivity:null,sessionsDone:0,isPRO:false,examDate:'2026-06',streakRecord:0},
    qcm:{cards:{},queue:[],idx:0,answered:null,stats:{ok:0,ko:0,xp:0},done:false,ci:false},
    rev:{tab:'qcm'},lessons:{},fiches:{},
    settings:{haptics:true},
    badges:{},defi:{lastDate:'',done:false},
    shield:{count:1,lastEarned:null},
    activity:{},blitzBest:0,crDone:0,tq:0,dq:0,tcDone:0,dcDone:0,cv:0,
    perfectSessions:0,classifDone:0,
    lightMode:false,annalesDone:{},pfs:{},fs:{},
    printed:{},printDone:0,isPro:false
  };
}
let S=defaultState();

function loadState(){
  let loaded=false; /* FIX v53 */
  try{
    const r=localStorage.getItem(STORAGE_KEY);if(!r)return;
    const s=JSON.parse(r);
    if(!s.v||s.v<STATE_VERSION){
      // Migration douce : préserver XP et progression
      const prev=s;S=defaultState();
      if(prev.user)S.user={...S.user,...prev.user};
      if(prev.lessons)S.lessons=prev.lessons;
      if(prev.qcm?.cards)S.qcm.cards=prev.qcm.cards;
      if(prev.fiches)S.fiches=prev.fiches;
      if(prev.fs)S.fs=prev.fs;
      if(prev.pfs)S.pfs=prev.pfs;
      if(prev.printed)S.printed=prev.printed;
      if(prev.printDone)S.printDone=prev.printDone;
      if(prev.annalesDone)S.annalesDone=prev.annalesDone;
      S.isPro=prev.isPro||prev.user?.isPRO||false;
      S.page='home';save();loaded=true;return;
    }
    S={...defaultState(),...s,page:'home'};
    // Assurer chaque clé v28
    if(!S.badges)S.badges={};if(!S.shield)S.shield={count:1,lastEarned:null};
    if(!S.activity)S.activity={};if(!S.defi)S.defi={lastDate:'',done:false};
    if(!S.pfs)S.pfs={};if(!S.fs)S.fs={};if(!S.annalesDone)S.annalesDone={};
    if(!S.printed)S.printed={};if(!S.printDone)S.printDone=0;
    if(S.isPro===undefined)S.isPro=S.user?.isPRO||false;
    loaded=true;
  }catch(e){console.warn('[OPJ v28] loadState:',e);}
  // Migration v29 → v30
  if(!loaded){const old=localStorage.getItem('opje_v30')||localStorage.getItem('opj_v30')||localStorage.getItem('opje_v29')||localStorage.getItem('opj_v29');
    if(old){try{const d=JSON.parse(old);S={...defaultState(),...d};save();}catch(e){}}
  }

}
function save(){
  /* Sync isPro ↔ user.isPRO */
  if(S.isPro&&!S.user.isPRO)S.user.isPRO=true;
  if(S.user.isPRO&&!S.isPro)S.isPro=true;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(S));}
  catch(e){showToast('⚠️ Stockage plein','err');}
  /* Sync cloud si connecté */
  if(currentUser && supabaseClient) {
    SYNC.debouncedSave();
  }
}

/* ─── FSRS — utilise fsrs.js (chargé avant app.js dans index.html) ───
   CORRECTION v53 : suppression de la double déclaration qui écrasait
   window.FSRS sans la méthode getDue(). On réutilise l'objet complet. */
if(typeof FSRS==='undefined'&&window.FSRS){var FSRS=window.FSRS;}
/* Fallback minimal si fsrs.js absent (ne devrait pas arriver) */
if(typeof FSRS==='undefined'){
  var FSRS={
    newCard:()=>({interval:0,ef:2.5,due:Date.now(),reps:0,ok:0,ko:0}),
    review(card,correct){
      const c={...(card||FSRS.newCard())};c.reps++;
      if(correct){c.ok++;if(c.reps===1)c.interval=1;else if(c.reps===2)c.interval=6;else c.interval=Math.max(1,Math.round(c.interval*c.ef));c.ef=Math.min(2.5,Math.max(1.3,c.ef+0.1));}
      else{c.ko++;c.interval=1;c.ef=Math.max(1.3,c.ef-0.2);}
      c.due=Date.now()+c.interval*86400000;return c;
    },
    isDue:card=>!card||card.due<=Date.now(),
    getDue(cat){return(window.QB||[]).filter(q=>!cat||q.cat===cat).filter(q=>FSRS.isDue(window.S?.qcm?.cards?.[q.id]));}
  };
}

/* ─── GRADES HELPERS ─── */
function getGrade(){let g=GRADES[0];for(const gr of GRADES)if(S.user.xp>=gr.min)g=gr;return g;}
function getNextGrade(){for(const gr of GRADES)if(S.user.xp<gr.min)return gr;return null;}
function getXPPct(){const g=getGrade(),n=getNextGrade();if(!n)return 100;return Math.min(100,Math.round((S.user.xp-g.min)/(n.min-g.min)*100));}

/* ─── THEME ─── */
const THEME28={
  apply(){
    const m=S.lightMode;
    document.documentElement.setAttribute('data-theme',m?'light':'dark');
    const lbl=document.getElementById('theme-label');
    if(lbl)lbl.textContent=m?'Mode sombre':'Mode clair';
  },
  toggle(){S.lightMode=!S.lightMode;save();THEME28.apply();}
};

/* ─── XP & STREAK ─── */
function addXP(amount){
  const before=getGrade();
  S.user.xp+=amount;
  const after=getGrade();
  if(after.min>before.min){
    setTimeout(()=>{
      showToast('🎉 '+after.icon+' '+after.name,'ok');
      confetti(true);
      const av=document.getElementById('pr-av');
      if(av)av.classList.add('level-up-anim');
      setTimeout(()=>av?.classList.remove('level-up-anim'),700);
    },300);
  }
  updateStreak();
  // Track activity
  const today=new Date().toDateString();
  if(!S.activity)S.activity={};
  S.activity[today]=true;
  const keys=Object.keys(S.activity);
  if(keys.length>60){delete S.activity[keys.sort()[0]];}
  save();
  BADGES.checkAll();
}
function updateStreak(){
  const today=new Date().toDateString();
  const yest=new Date(Date.now()-86400000).toDateString();
  if(S.user.lastActivity===today)return;
  S.user.streak=S.user.lastActivity===yest?(S.user.streak||0)+1:1;
  S.user.lastActivity=today;
  if(S.user.streak>(S.user.streakRecord||0))S.user.streakRecord=S.user.streak;
}

/* ─── NAVIGATION ─── */
function navigateTo(page){
  S.page=page;
  document.querySelectorAll('.page').forEach(p=>p.style.display='none');
  const el=document.getElementById('p-'+page);
  if(el)el.style.display='block';
  document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.toggle('active',b.id==='nav-'+page);});
  const titles={home:'OPJ Elite',lecons:'Mes Leçons',revision:'Révision',examen:'Mode Examen',profil:'Mon Profil',pro:'OPJ Elite PRO'};
  const hdr=document.getElementById('app-hdr');
  // Update hdr-xp
  const hxp=document.getElementById('hdr-xp');
  if(hxp)hxp.textContent=S.user.xp+' XP';
  // Render page content
  if(page==='home')renderHome();
  else if(page==='lecons')renderLecons();
  else if(page==='revision')renderRevision();
  else if(page==='profil')renderProfil();
  window.scrollTo({top:0,behavior:'instant'});
}
function goLesson(){navigateTo('lecons');}
function goRevision(){navigateTo('revision');}

/* ─── RENDER HOME ─── */
function renderHome(){
  const g=getGrade(),n=getNextGrade(),pct=getXPPct();
  const el=id=>document.getElementById(id);
  const hour=new Date().getHours();
  const greet=hour<12?'Bonjour':hour<18?'Bon après-midi':'Bonsoir';
  if(el('h-greeting'))el('h-greeting').textContent=greet;
  if(el('h-name'))el('h-name').innerHTML=eh(S.user.name.split(' ')[0])+' <span>'+eh(S.user.name.split(' ').slice(1).join(' ')||'')+'</span>';
  if(el('h-xp'))el('h-xp').textContent=S.user.xp;
  if(el('h-streak'))el('h-streak').innerHTML=S.user.streak+'<span class="streak-flame">🔥</span>';
  // Grade badge hero
  if(el('h-grade-badge'))el('h-grade-badge').textContent=g.icon;
  // Grade pill header
  if(el('hdr-grade-pill'))el('hdr-grade-pill').textContent=g.name;
  // Score précision
  const vals=Object.values(S.qcm.cards);
  const totalOk=vals.reduce((a,c)=>a+(c.ok||0),0);
  const totalAll=vals.reduce((a,c)=>a+(c.ok||0)+(c.ko||0),0);
  const acc=totalAll>0?Math.round(totalOk/totalAll*100):null;
  if(el('h-score'))el('h-score').textContent=acc!==null?acc+'%':'—';
  // Dues
  const due=QB.filter(q=>FSRS.isDue(S.qcm.cards[q.id])).length;
  if(el('h-due'))el('h-due').textContent=due;
  if(el('h-xpbar'))el('h-xpbar').style.width=pct+'%';
  if(el('hdr-xp'))el('hdr-xp').textContent=S.user.xp+' XP';
  // Lessons done
  const lessonsDone=Object.keys(S.lessons).length;
  if(el('h-lessons-done'))el('h-lessons-done').textContent=lessonsDone;
  if(el('h-qcm-done'))el('h-qcm-done').textContent=Object.keys(S.qcm.cards).length;
  // Countdown
  const ecEl=document.getElementById('h-exam-countdown');
  if(S.user.examDate){
    const examDate=new Date(S.user.examDate+'-01');
    const daysLeft=Math.max(0,Math.ceil((examDate-Date.now())/86400000));
    if(el('h-exam-days'))el('h-exam-days').textContent=daysLeft>0?daysLeft:'Aujourd\'hui !';
    if(ecEl)ecEl.style.display='flex';
  }else{
    if(ecEl)ecEl.style.display='none';
  }
  // Chapter progress
  renderChapterProgress();
  // PRO teaser
  if(el('h-pro-teaser'))el('h-pro-teaser').style.display=(S.isPro||S.user.isPRO)?'none':'block';
  // Défi & weak zones
  DEFI.renderWidget();
  renderWeakWidget();

  // v30 — Animations & motivation
  renderMotivBanner();
  try{renderQDJ();}catch(e){}
  setTimeout(()=>{
    try{animCountUp('h-xp', S.user.xp||0, 700);}catch(e){}
    try{animCountUp('h-due', QB.filter(q=>FSRS.isDue(S.qcm.cards[q.id])).length, 500);}catch(e){}
  }, 80);
}

function renderChapterProgress(){if(typeof CHAPTERS==='undefined'||!CHAPTERS)return;
  const el=document.getElementById('h-chapter-progress');if(!el)return;
  el.innerHTML=CHAPTERS.slice(0,6).map(ch=>{
    const done=ch.lessons.filter(l=>S.lessons[l.id]).length;
    const pct=Math.round(done/ch.lessons.length*100);
    return`<div class="ch-prog-row">
      <span class="ch-prog-icon">${ch.icon}</span>
      <div class="ch-prog-inf">
        <div class="ch-prog-name">${ch.title}</div>
        <div class="ch-prog-bar"><div class="ch-prog-fill" style="width:${pct}%;background:${ch.color}"></div></div>
      </div>
      <span class="ch-prog-pct">${done}/${ch.lessons.length}</span>
    </div>`;
  }).join('')+`<div style="margin-top:10px;text-align:center"><button class="btn btn-ghost btn-sm" onclick="navigateTo('lecons')" style="font-size:11px">Voir toutes les leçons →</button></div>`;
}

function renderWeakWidget(){
  const el=document.getElementById('h-weak-widget');if(!el)return;
  const THEMES_DEF=[
    {cat:'GAV',name:'Garde à Vue',em:'🔒'},
    {cat:'FLAGRANCE',name:'Flagrance',em:'🚨'},
    {cat:'PERQUIZ',name:'Perquisitions',em:'🔍'},
    {cat:'MANDATS',name:'Mandats',em:'📋'},
    {cat:'INFRACTIONS',name:'Infractions',em:'⚡'},
    {cat:'PRESCRIP',name:'Prescription',em:'⏳'},
    {cat:'LIBERTES',name:'Libertés',em:'🏛️'},
    {cat:'INSTRUCTION',name:'Instruction',em:'🏛️'},
  ];
  const zones=THEMES_DEF.map(t=>{
    const pool=QB.filter(q=>q.cat===t.cat);
    if(!pool.length)return null;
    const done=pool.filter(q=>S.qcm.cards[q.id]?.reps>0);
    if(!done.length)return null;
    const ok=done.filter(q=>(S.qcm.cards[q.id]?.ok||0)>0).length;
    const pct=Math.round(ok/done.length*100);
    return{...t,pct,done:done.length};
  }).filter(Boolean).filter(z=>z.pct<70).sort((a,b)=>a.pct-b.pct).slice(0,3);
  if(!zones.length){el.innerHTML='';return;}
  el.innerHTML=`<div class="weak-widget">
    <div class="weak-widget-title">⚠️ Zones à renforcer</div>
    ${zones.map(z=>`<div class="weak-row">
      <span style="font-size:14px">${z.em}</span>
      <div style="flex:1;min-width:0">
        <div class="flex-b"><span class="weak-name">${z.name}</span><span class="weak-pct">${z.pct}%</span></div>
        <div class="weak-bar"><div class="weak-fill" style="width:${z.pct}%"></div></div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="startSession('${z.cat}')" style="font-size:10px;padding:5px 8px">Travailler</button>
    </div>`).join('')}
  </div>`;
}

/* ─── RENDER LEÇONS ─── */
function renderLecons(){
  const totalLessons=CHAPTERS.reduce((a,c)=>a+c.lessons.length,0);
  const done=Object.keys(S.lessons).length;
  const pct=Math.round(done/totalLessons*100);
  const el=id=>document.getElementById(id);
  if(el('lec-global-prog'))el('lec-global-prog').textContent=done+' leçon'+(done>1?'s':'')+' vue'+(done>1?'s':'')+' sur '+totalLessons;
  if(el('lec-pct'))el('lec-pct').textContent=pct+'%';
  if(el('lec-xpbar'))el('lec-xpbar').style.width=pct+'%';
  const list=el('chapters-list');if(!list)return;
  list.innerHTML=CHAPTERS.map(ch=>{
    const doneCh=ch.lessons.filter(l=>S.lessons[l.id]).length;
    const pctCh=Math.round(doneCh/ch.lessons.length*100);
    return`<div class="chapter-card" id="ch-${ch.id}" onclick="toggleChapter('${ch.id}')">
      <div class="chapter-hd">
        <div class="chapter-ico" style="background:${ch.bg}">${ch.icon}</div>
        <div class="chapter-inf">
          <div class="chapter-num">Chapitre ${ch.num}</div>
          <div class="chapter-title">${ch.title}</div>
          <div class="chapter-sub">${ch.sub}</div>
        </div>
        <div class="chapter-meta">
          <span class="chapter-prog-txt">${doneCh}/${ch.lessons.length}</span>
          <div style="width:26px;height:26px;position:relative">
            <svg width="26" height="26" viewBox="0 0 26 26" style="transform:rotate(-90deg)">
              <circle cx="13" cy="13" r="9" fill="none" stroke="var(--bg-3)" stroke-width="3"/>
              <circle cx="13" cy="13" r="9" fill="none" stroke="${ch.color}" stroke-width="3" stroke-linecap="round"
                stroke-dasharray="${2*Math.PI*9}" stroke-dashoffset="${2*Math.PI*9*(1-pctCh/100)}"/>
            </svg>
          </div>
          <span class="chapter-arrow">›</span>
        </div>
      </div>
      <div class="chapter-lessons" id="lessons-${ch.id}">
        ${ch.lessons.map(l=>`<div class="lesson-item" onclick="openLesson('${l.id}');event.stopPropagation()">
          <span class="lesson-em">${l.em}</span>
          <div class="lesson-inf">
            <div class="lesson-name">${l.name}</div>
            <div class="lesson-meta">${l.ref} · +${l.xp} XP</div>
          </div>
          <div class="lesson-status ${S.lessons[l.id]?'done':'new'}">${S.lessons[l.id]?'✓':'○'}</div>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleChapter(id){
  document.getElementById('ch-'+id)?.classList.toggle('expanded');
}

function openLesson(id){
  const lesson=CHAPTERS.flatMap(c=>c.lessons).find(l=>l.id===id);if(!lesson)return;
  const chapter=CHAPTERS.find(c=>c.lessons.some(l=>l.id===id));
  const isDone=!!S.lessons[id];
  let html=`<div class="lesson-chapter-badge" style="background:${chapter.bg};color:${chapter.color}">${chapter.icon} ${chapter.title}</div>`;
  html+=`<div class="lesson-modal-title">${lesson.em} ${lesson.name}</div>`;
  html+=`<div class="lesson-modal-ref">${lesson.ref}</div>`;
  if(lesson.intro)html+=`<div class="lesson-intro">${lesson.intro}</div>`;
  (lesson.secs||[]).forEach(s=>{
    html+=`<div class="lesson-sec-title">${s.t}</div>`;
    if(s.table){
      html+=`<div style="overflow-x:auto;margin-bottom:7px"><table class="art-table"><thead><tr>${s.table.th.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }else{
      (s.items||[]).forEach(it=>html+=`<div class="lesson-block">${it}</div>`);
    }
  });
  if(lesson.traps?.length)lesson.traps.forEach(t=>html+=`<div class="lesson-trap"><div class="lesson-trap-lbl">⚠️ Piège d'examen</div><div class="lesson-trap-txt">${t}</div></div>`);
  if(lesson.keys?.length)html+=`<div class="lesson-keys"><div class="lesson-keys-lbl">⚡ À retenir</div>${lesson.keys.map(k=>`<div class="lesson-key-item">${k}</div>`).join('')}</div>`;
  html+=`<div style="margin-top:18px">
    <button class="btn btn-p" onclick="markLessonDone('${id}')" style="${isDone?'background:var(--ok-bg);border:1px solid var(--ok);color:var(--ok)':''}">
      ${isDone?'✅ Leçon maîtrisée — Relire':'✓ Marquer comme vue · +'+lesson.xp+' XP'}
    </button>
    <button class="btn btn-ghost btn-full mt8" onclick="closeLesson()">Fermer</button>
  </div>`;
  document.getElementById('lesson-modal-body').innerHTML=html;
  document.getElementById('lesson-ov').classList.add('on');
  document.body.style.overflow='hidden';
}
function closeLesson(){
  document.getElementById('lesson-ov').classList.remove('on');
  document.body.style.overflow='';
}
function markLessonDone(id){
  if(!S.lessons[id]){
    const lesson=CHAPTERS.flatMap(c=>c.lessons).find(l=>l.id===id);
    S.lessons[id]=Date.now();
    if(lesson)addXP(lesson.xp);
    save();showToast('✅ Leçon vue ! +'+(lesson?.xp||10)+' XP','ok');haptic(50);
  }
  closeLesson();renderLecons();renderChapterProgress();
}

/* ─── RENDER RÉVISION ─── */
function renderRevision(){
  renderRevThemes();renderBubbles();renderProcList();updateDueCount();
}
function setRevTab(tab){
  S.rev=S.rev||{};S.rev.tab=tab;
  const allTabs=['qcm','fiches','proc','libertes','blitz','classer','imprimer','annales'];
  allTabs.forEach(t=>{
    document.getElementById('rtab-'+t)?.classList.toggle('active',t===tab);
    const c=document.getElementById('rtab-'+t+'-content');
    if(c)c.style.display=t===tab?'block':'none';
  });
  if(tab==='fiches')  {try{renderBubbles();}catch(e){}}
  if(tab==='proc')    {try{renderProcList();}catch(e){}}
  if(tab==='libertes'&&typeof LP!=='undefined')LP.render();
  if(tab==='annales') renderAnnalesList();
  if(tab==='imprimer')renderPrintList();
  if(tab==='blitz'){
    const best=S.blitzBest||0;
    const el=document.getElementById('blitz-best-display');
    if(el&&best>0)el.textContent='Meilleur score : '+best+'/10';
  }
}
function updateDueCount(){
  const due=QB.filter(q=>FSRS.isDue(S.qcm.cards[q.id])).length;
  const el=document.getElementById('rev-due-count');
  if(el)el.textContent=due>0?due+' question'+(due>1?'s':'')+' à réviser maintenant':'Tout est à jour ✅';
  /* Sync stats hero si visibles */
  const setV=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  setV('qs-due',due||'0');
  setV('qs-total',QB.length||'—');
  const seenQ=QB.filter(q=>(S.qcm.cards[q.id]?.reps||0)>0).length;
  const okQ=QB.filter(q=>(S.qcm.cards[q.id]?.ok||0)>0).length;
  setV('qs-acc',seenQ>0?Math.round(okQ/seenQ*100)+'%':'—');
}
function renderRevThemes(){
  const THEMES=[
    {cat:'GAV',name:'Garde à Vue',em:'🔒',color:'#3b82f6'},
    {cat:'FLAGRANCE',name:'Flagrance',em:'🚨',color:'#ef4444'},
    {cat:'PERQUIZ',name:'Perquisitions',em:'🔍',color:'#8b5cf6'},
    {cat:'AUDLIB',name:'Audition Libre',em:'🎙️',color:'#10b981'},
    {cat:'MANDATS',name:'Mandats',em:'📋',color:'#f59e0b'},
    {cat:'MINEURS',name:'Mineurs',em:'👶',color:'#ec4899'},
    {cat:'OPJ',name:'Statut OPJ',em:'⚖️',color:'#d4af37'},
    {cat:'PRESCRIP',name:'Prescription',em:'⏳',color:'#6366f1'},
    {cat:'RECIDIVE',name:'Récidive',em:'🔄',color:'#f97316'},
    {cat:'LEGDEF',name:'Légitime Défense',em:'🛡️',color:'#14b8a6'},
    {cat:'NULLITES',name:'Nullités',em:'🚫',color:'#64748b'},
    {cat:'INSTRUCTION',name:'Instruction',em:'🏛️',color:'#0ea5e9'},
    {cat:'INFRACTIONS',name:'Infractions',em:'⚡',color:'#e11d48'},
    {cat:'LIBERTES',name:'Libertés',em:'🏛️',color:'#14b8a6'},
    {cat:'CDO',name:'Criminalité Org.',em:'🕵️',color:'#a855f7'},
    {cat:'COMMISSION',name:'Commission Rogatoire',em:'📄',color:'#22d3ee'},
    {cat:'ALTERNATIVES',name:'Alternatives AP',em:'🤝',color:'#22c55e'},
    {cat:'TAJ',name:'Fichiers Police',em:'🗃️',color:'#a855f7'},
    {cat:'ACTION_PUB',name:'Action Publique',em:'⚖️',color:'#64748b'},
    {cat:'CONTROLES',name:'Contrôles ID',em:'🪪',color:'#0ea5e9'},
    {cat:'MESURES_COERC',name:'Mesures Coercitives',em:'⛓️',color:'#8b5cf6'},
    {cat:'FICHIERS',name:'Fichiers',em:'💾',color:'#6366f1'},
    {cat:'ENQUETES_SPEC',name:'Enquêtes Spéciales',em:'🔬',color:'#ec4899'},
    {cat:'PATRIMONIAL',name:'Patrimonial',em:'💰',color:'#f59e0b'},
  ];
  const el=document.getElementById('theme-list');if(!el)return;

  /* Mise à jour stats QCM hero */
  const totalQ=QB.length;
  const dueQ=QB.filter(q=>FSRS.isDue(S.qcm.cards[q.id])).length;
  const seenQ=QB.filter(q=>(S.qcm.cards[q.id]?.reps||0)>0).length;
  const okQ=QB.filter(q=>(S.qcm.cards[q.id]?.ok||0)>0).length;
  const accPct=seenQ>0?Math.round(okQ/seenQ*100):0;
  const setV=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  setV('qs-due',dueQ||'0');
  setV('qs-total',totalQ||'—');
  setV('qs-acc',seenQ>0?accPct+'%':'—');
  setV('rev-due-count',dueQ>0?`${dueQ} question${dueQ>1?'s':''} à réviser maintenant`:'Tout est à jour ✅');

  const themes=THEMES.filter(t=>QB.some(q=>q.cat===t.cat));
  const thCount=document.getElementById('qcm-themes-count');
  if(thCount)thCount.textContent=themes.length+' thèmes';

  el.innerHTML=themes.map((t,i)=>{
    const pool=QB.filter(q=>q.cat===t.cat);
    const done=pool.filter(q=>(S.qcm.cards[q.id]?.reps||0)>0).length;
    const ok=pool.filter(q=>(S.qcm.cards[q.id]?.ok||0)>0).length;
    const due=pool.filter(q=>FSRS.isDue(S.qcm.cards[q.id])).length;
    const pctDone=Math.round(done/pool.length*100);
    const pctOk=done>0?Math.round(ok/done*100):0;
    const completed=done===pool.length&&pool.length>0;
    return`<div class="theme-card2" onclick="startSession('${t.cat}')" style="animation:fadeUp .15s ${i*0.025}s both;--tc:${t.color}">
      <div class="theme-card2-left">
        <div class="theme-card2-ico" style="background:${t.color}18;border:1.5px solid ${t.color}30">${t.em}</div>
      </div>
      <div class="theme-card2-body">
        <div class="theme-card2-title">${t.name}</div>
        <div class="theme-card2-meta">
          <span class="theme-card2-count">${pool.length} questions</span>
          ${due>0?`<span class="theme-due-badge">⚡ ${due} à revoir</span>`:''}
          ${completed?`<span class="theme-done-badge">✓ Complété</span>`:''}
        </div>
        <div class="theme-card2-bar">
          <div class="theme-card2-fill" style="width:${pctDone}%;background:${t.color}"></div>
          ${pctOk>0?`<div class="theme-card2-ok-fill" style="width:${Math.min(pctOk,100)*pctDone/100}%;background:${t.color}"></div>`:''}
        </div>
      </div>
      <div class="theme-card2-right">
        ${completed
          ?`<div class="theme-card2-done">✓</div>`
          :`<div class="theme-card2-pct" style="color:${t.color}">${pctDone}<span>%</span></div>`
        }
        <div class="theme-card2-arr">›</div>
      </div>
    </div>`;
  }).join('');
}


function renderBubbles(){
  const grid=document.getElementById('bubble-grid');if(!grid)return;
  grid.style.cssText='display:block;padding:0';
  const search=(document.getElementById('fiches-search')?.value||'').toLowerCase();

  const FAMILIES={
    vie:      {label:'Vie',           em:'💀',color:'#ef4444',grad:'linear-gradient(135deg,#ef4444,#dc2626)'},
    integrite:{label:'Intégrité',     em:'🩸',color:'#f97316',grad:'linear-gradient(135deg,#f97316,#ea580c)'},
    biens:    {label:'Biens',         em:'💰',color:'#f59e0b',grad:'linear-gradient(135deg,#f59e0b,#d97706)'},
    autorite: {label:'Autorité',      em:'🛡️',color:'#3b82f6',grad:'linear-gradient(135deg,#3b82f6,#2563eb)'},
    stups:    {label:'Stupéfiants',   em:'💊',color:'#a855f7',grad:'linear-gradient(135deg,#a855f7,#9333ea)'},
    route:    {label:'Route',         em:'🚗',color:'#10b981',grad:'linear-gradient(135deg,#10b981,#059669)'},
  };

  const mastered=FB.filter(f=>S.fs[f.id]==='m').length;
  const learning=FB.filter(f=>S.fs[f.id]==='s').length;
  const pct=FB.length>0?Math.round(mastered/FB.length*100):0;
  const elSum=document.getElementById('fiches-summary');
  if(elSum)elSum.textContent=`${mastered}/${FB.length} maîtrisées · ${learning} en cours`;
  const pb=document.getElementById('fiches-prog-bar');
  if(pb)pb.style.width=pct+'%';

  const filtered=search
    ?FB.filter(f=>f.nm.toLowerCase().includes(search)||(f.ref||'').toLowerCase().includes(search))
    :FB;

  if(!filtered.length){
    grid.innerHTML=`<div class="empty-state"><span class="empty-state-em">🔍</span>Aucune fiche pour "${search}"</div>`;
    return;
  }

  /* Noms courts pour tiles */
  const shortNm=nm=>{
    const map={
      'MEURTRE':'Meurtre','HOMICIDE INVOLONTAIRE':'Homicide inv.','VIOLENCES VOLONTAIRES':'Violences vol.',
      'VIOL':'Viol','VOL':'Vol','ESCROQUERIE':'Escroquerie','ABUS DE CONFIANCE':'Abus confiance',
      'RECEL':'Recel','OUTRAGE':'Outrage','RÉBELLION':'Rébellion','USAGE STUPÉFIANTS':'Usage stups',
      'CONDUITE ALCOOLIQUE':'Conduite alcool','EXTORSION':'Extorsion','TRAFIC STUPÉFIANTS':'Trafic stups',
      'CORRUPTION PASSIVE':'Corruption',
    };
    return map[nm]||(nm.length>12?nm.slice(0,11)+'…':nm);
  };

  /* Tile individuelle */
  const tile=(f,i,fam)=>{
    const st=S.fs[f.id]||'';
    const color=fam?.color||'#3b82f6';
    const grad=fam?.grad||`linear-gradient(135deg,${color},${color})`;
    const isMastered=st==='m', isLearning=st==='s';
    return`<div class="ft${isMastered?' ft-m':isLearning?' ft-s':''}"
      onclick="openFiche('${f.id}')"
      style="animation:popIn .2s ${i*0.04}s both;--ftc:${color};--ftg:${grad}"
      role="button" tabindex="0">
      <div class="ft-top">
        ${isMastered?`<div class="ft-crown">★</div>`
          :isLearning?`<div class="ft-dot"></div>`
          :`<div class="ft-lock"></div>`}
      </div>
      <div class="ft-em">${f.em}</div>
      <div class="ft-nm">${shortNm(f.nm)}</div>
      <div class="ft-qual" style="background:${color}22;color:${color}">${f.qual}</div>
    </div>`;
  };

  /* Mode recherche → grille plate */
  if(search){
    grid.innerHTML=`<div class="ft-grid">${filtered.map((f,i)=>tile(f,i,FAMILIES[f.fam])).join('')}</div>`;
    return;
  }

  /* Groupes par famille */
  let html='';
  Object.entries(FAMILIES).forEach(([key,fam])=>{
    const items=filtered.filter(f=>f.fam===key);
    if(!items.length)return;
    const famMastered=items.filter(f=>S.fs[f.id]==='m').length;
    const famPct=Math.round(famMastered/items.length*100);
    const allDone=famMastered===items.length;
    html+=`
    <div class="ft-group" style="--fg:${fam.color};--fgg:${fam.grad}">
      <div class="ft-group-hd">
        <div class="ft-group-ico">${fam.em}</div>
        <div class="ft-group-info">
          <div class="ft-group-title">${fam.label}</div>
          <div class="ft-group-prog">
            <div class="ft-group-bar"><div class="ft-group-fill" style="width:${famPct}%;background:${fam.color}"></div></div>
            <span class="ft-group-cnt" style="color:${allDone?'var(--gold)':fam.color}">${allDone?'★ Complète':famMastered+'/'+items.length}</span>
          </div>
        </div>
      </div>
      <div class="ft-grid">${items.map((f,i)=>tile(f,i,fam)).join('')}</div>
    </div>`;
  });
  grid.innerHTML=html;
}



function openFiche(id){
  const f=FB.find(x=>x.id===id);if(!f)return;
  /* FIX v49 — déplacer fiche-ov hors de p-revision (display:none) vers #app */
  (function ensureGlobal(){
    const ov=document.getElementById('fiche-ov');
    const app=document.getElementById('app');
    if(!ov||!app)return;
    if(ov.parentNode&&ov.parentNode!==app&&ov.parentNode!==document.body){
      app.appendChild(ov);
    }
  })();
  const st=S.fs[id]||'';
  const QUAL_COLORS={
    'Crime':       {h:'#ef4444',bg:'rgba(239,68,68,.1)',grd:'linear-gradient(135deg,rgba(239,68,68,.15),rgba(239,68,68,.04))'},
    'Délit':       {h:'#3b82f6',bg:'rgba(37,99,235,.1)', grd:'linear-gradient(135deg,rgba(37,99,235,.12),rgba(37,99,235,.04))'},
    'Variable':    {h:'#f59e0b',bg:'rgba(245,158,11,.1)',grd:'linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.04))'},
    'Crime/Délit': {h:'#a855f7',bg:'rgba(168,85,247,.1)',grd:'linear-gradient(135deg,rgba(168,85,247,.12),rgba(168,85,247,.04))'},
  };
  const qc=QUAL_COLORS[f.qual]||QUAL_COLORS['Délit'];
  const statuses=[
    {s:'',   lbl:'Non vue',    icon:'○', bg:'var(--bg-3)',     c:'var(--t3)'},
    {s:'s',  lbl:'Vue ✓',      icon:'◐', bg:'rgba(37,99,235,.12)', c:'#3b82f6'},
    {s:'m',  lbl:'Maîtrisée ★',icon:'★', bg:'rgba(212,175,55,.12)','c':'var(--gold)'},
  ];

  let h=`
  <!-- HEADER -->
  <div class="fo-header" style="background:${qc.grd};border-bottom:1px solid ${qc.h}22">
    <div class="fo-header-top">
      <div class="fo-em">${f.em}</div>
      <div class="fo-header-right">
        <span class="fo-qual-badge" style="background:${qc.bg};color:${qc.h}">${f.qual}</span>
        <span class="fo-fam-badge">${f.fam||'—'}</span>
      </div>
    </div>
    <div class="fo-title">${f.nm}</div>
    <div class="fo-ref">${f.ref}</div>
    <div class="fo-pn">
      <span class="fo-pn-icon">⚖️</span>
      <span class="fo-pn-txt">${f.pn}</span>
    </div>
  </div>

  <!-- STATUS SÉLECTEUR -->
  <div class="fo-status-row">
    ${statuses.map(b=>`
      <button class="fo-status-btn${st===b.s?' active':''}"
        onclick="setFiche('${id}','${b.s}')"
        style="${st===b.s?`background:${b.bg};color:${b.c};border-color:${b.c}`:''}">
        <span class="fo-status-icon">${b.icon}</span>
        <span class="fo-status-lbl">${b.lbl}</span>
      </button>`).join('')}
  </div>

  <!-- ÉLÉMENTS CONSTITUTIFS -->
  <div class="fo-section">
    <div class="fo-section-hd">📐 Éléments constitutifs</div>
    ${f.L?`<div class="fo-block fo-block-legal">
      <div class="fo-block-label">📜 LÉGAL</div>
      <div class="fo-block-text">${f.L}</div>
    </div>`:''}
    ${f.A?`<div class="fo-block fo-block-materiel">
      <div class="fo-block-label">🔨 MATÉRIEL</div>
      <div class="fo-block-text">${f.A}</div>
    </div>`:''}
    ${f.M?`<div class="fo-block fo-block-moral">
      <div class="fo-block-label">🧠 MORAL</div>
      <div class="fo-block-text">${f.M}</div>
    </div>`:''}
  </div>`;

  /* AGGRAVANTES */
  const aggs=(f.E||[]).filter(e=>e.a&&e.a!=='—');
  if(aggs.length){
    h+=`<div class="fo-section">
      <div class="fo-section-hd">⬆️ Circonstances aggravantes</div>
      <div class="fo-agg-table">
        ${aggs.map(e=>`
          <div class="fo-agg-row">
            <div class="fo-agg-left">
              <div class="fo-agg-nm">${e.a}</div>
              ${e.r?`<div class="fo-agg-ref">Art. ${e.r}</div>`:''}
            </div>
            <div class="fo-agg-pn" style="background:rgba(239,68,68,.12);color:#ef4444">${e.p}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  /* NE PAS CONFONDRE */
  if(f.cf){
    const cfTxt=typeof f.cf==='string'?f.cf:((f.cf.av||'')+' '+(f.cf.cr||'')).trim();
    h+=`<div class="fo-section">
      <div class="fo-section-hd">🔀 Ne pas confondre</div>
      <div class="fo-cf-card">
        <div class="fo-cf-text">${cfTxt}</div>
      </div>
    </div>`;
  }

  /* PIÈGE D'EXAMEN */
  if(f.pg){
    h+=`<div class="fo-piege">
      <div class="fo-piege-hd">⚠️ Piège d'examen</div>
      <div class="fo-piege-txt">${f.pg}</div>
    </div>`;
  }

  h+=`<button class="btn btn-ghost btn-full" style="margin-top:16px" onclick="closeFiche()">Fermer</button>`;

  document.getElementById('fiche-body').innerHTML=h;
  document.getElementById('fiche-ov').style.display='flex';
  document.body.style.overflow='hidden';
}

function closeFiche(){
  const ov=document.getElementById('fiche-ov');
  if(ov){ov.style.display='none';ov.style.alignItems='flex-end';}
  document.body.style.overflow='';
}
function setFiche(id,s){
  const p=S.fs[id];
  if(s==='m'&&p!=='m'){addXP(15);showToast('+15 XP — Fiche maîtrisée !','ok');}
  S.fs[id]=s;save();openFiche(id);renderBubbles();
}

/* ─── QCM ENGINE ─── */
let _examTimer=null;
function startSmartSession(){
  const due=QB.filter(q=>FSRS.isDue(S.qcm.cards[q.id]));
  const pool=due.length>=10?due:[...QB].sort(()=>Math.random()-.5).slice(0,20);
  buildSession(pool.slice(0,10));
}
function startSession(cat){
  const pool=QB.filter(q=>q.cat===cat);
  if(!pool.length){showToast('Aucune question pour ce thème','err');return;}
  buildSession(pool.sort(()=>Math.random()-.5).slice(0,Math.min(10,pool.length)));
}
function startFlashSession(){
  const due=QB.filter(q=>FSRS.isDue(S.qcm.cards[q.id]));
  const pool=due.length>=5?due:QB;
  buildSession(pool.sort(()=>Math.random()-.5).slice(0,5));
}
function startExamSession(n,minutes){
  const pool=[...QB].sort(()=>Math.random()-.5).slice(0,Math.min(n,QB.length));
  buildSession(pool,minutes);
}
function _beginSession(queue,minutes){
  S.qcm.queue=queue.map(q=>shuffleQ({...q}));S.qcm.idx=0;S.qcm.answered=null;S.qcm.stats={ok:0,ko:0,xp:0};
  document.getElementById('qcm-session').style.display='block';
  document.getElementById('qcm-results').style.display='none';
  document.getElementById('rev-menu').style.display='none';
  if(minutes>0)startExamBanner(minutes);
  renderCurrentQ();
  navigateTo('revision');
}

/* ─── v50 — Mélange des réponses QCM ─── */
function shuffleQ(q){
  /* Associer chaque option à son index original */
  const pairs=q.opts.map((opt,i)=>({opt,correct:i===q.c}));
  /* Fisher-Yates shuffle */
  for(let i=pairs.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pairs[i],pairs[j]]=[pairs[j],pairs[i]];
  }
  return{...q, opts:pairs.map(p=>p.opt), c:pairs.findIndex(p=>p.correct)};
}

/* Shuffle déterministe (même graine = même résultat) pour QDJ */
function seededShuffle(arr, seed){
  const a=[...arr]; let s=seed;
  const rand=()=>{s=(s*9301+49297)%233280;return s/233280;};
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function buildSession(pool,minutes=0){_beginSession(pool,minutes);}
function renderCurrentQ(){
  const q=S.qcm.queue[S.qcm.idx];if(!q)return;
  const tot=S.qcm.queue.length;
  document.getElementById('qcm-prog-txt').textContent=(S.qcm.idx+1)+'/'+tot;
  const dots=Array.from({length:tot},(_,i)=>`<div class="q-dot ${i<S.qcm.idx?'done':i===S.qcm.idx?'cur':''}"></div>`).join('');
  const letters=['A','B','C','D'];
  const answered=S.qcm.answered;
  let html=`<div class="q-progress">${dots}</div>`;
  html+=`<div class="q-cat">${q.cat||'QCM'}</div>`;
  html+=`<div class="q-txt">${q.q}</div>`;
  html+=`<div class="q-art">${q.art||''}</div>`;
  html+=`<div class="q-opts">`;
  q.opts.forEach((opt,i)=>{
    let cls='q-opt';
    if(answered!==null){
      cls+=' disabled';
      if(i===q.c)cls+=' correct';
      else if(i===answered&&answered!==q.c)cls+=' wrong';
    }
    html+=`<button class="${cls}" onclick="answerQ(${i})"><span class="q-letter">${letters[i]}</span>${eh(opt)}</button>`;
  });
  html+=`</div>`;
  if(answered!==null&&q.expl){
    const ok=answered===q.c;
    html+=`<div class="q-expl"><div class="q-verdict ${ok?'ok':'ko'}">${ok?'✓ Correct !':'✗ Incorrect'}</div>${q.expl}</div>`;
  }
  document.getElementById('qcm-body').innerHTML=html;
  const nw=document.getElementById('qcm-next-wrap');
  if(nw)nw.style.display=answered!==null?'block':'none';
}
function answerQ(i){
  const q=S.qcm.queue[S.qcm.idx];if(!q||S.qcm.answered!==null)return;
  S.qcm.answered=i;
  const correct=i===q.c;
  if(!S.qcm.cards[q.id])S.qcm.cards[q.id]=FSRS.newCard();
  S.qcm.cards[q.id]=FSRS.review(S.qcm.cards[q.id],correct);
  if(correct){const xp=10+(q.diff||1)*5;S.qcm.stats.ok++;S.qcm.stats.xp+=xp;addXP(xp);haptic(40);}
  else{S.qcm.stats.ko++;haptic([40,80,40]);}
  save();renderCurrentQ();
}
function nextQuestion(){
  S.qcm.idx++;S.qcm.answered=null;
  if(S.qcm.idx>=S.qcm.queue.length)finishSession();
  else renderCurrentQ();
}
function finishSession(){
  stopExamBanner();S.user.sessionsDone++;save();
  const tot=S.qcm.queue.length;
  const pct=tot>0?Math.round(S.qcm.stats.ok/tot*100):0;
  const emoji=pct>=80?'🏆':pct>=60?'👍':'💪';
  document.getElementById('qcm-session').style.display='none';
  document.getElementById('qcm-results').style.display='block';
  document.getElementById('qr-emoji').textContent=emoji;
  document.getElementById('qr-pct').textContent=pct+'%';
  document.getElementById('qr-pct').style.color=pct>=80?'var(--ok)':pct>=60?'var(--warn)':'var(--err)';
  document.getElementById('qr-detail').textContent=S.qcm.stats.ok+'/'+tot+' bonnes réponses · +'+S.qcm.stats.xp+' XP';
  document.getElementById('qr-ok').textContent=S.qcm.stats.ok;
  document.getElementById('qr-ko').textContent=S.qcm.stats.ko;
  // Review des erreurs
  const review=document.getElementById('qr-review');
  if(review){
    const wrongs=S.qcm.queue.filter((_,i)=>S.qcm.queue[i]&&S.qcm.cards[S.qcm.queue[i].id]?.ko>0).slice(0,5);
    if(wrongs.length)review.innerHTML=`<div class="sect-label">Erreurs à retravailler</div>`+wrongs.map(q=>`<div class="lesson-block"><div class="text-sm fw-600 mb4">${q.q}</div><div class="text-xs text-accent font-mono">${q.art}</div></div>`).join('');
  }
  if(pct>=80)confetti(false);
  // Perfect session badge
  if(tot>=10&&S.qcm.stats.ko===0){if(!S.perfectSessions)S.perfectSessions=0;S.perfectSessions++;save();}
  BADGES.checkAll();
}
function exitQCM(){stopExamBanner();backToRevision();}
function backToRevision(){
  document.getElementById('qcm-session').style.display='none';
  document.getElementById('qcm-results').style.display='none';
  document.getElementById('rev-menu').style.display='block';
  updateDueCount();renderRevThemes();setRevTab(S.rev?.tab||'qcm');
}
function startExamBanner(minutes){
  let secs=minutes*60;const el=document.getElementById('qcm-timer');
  _examTimer=setInterval(()=>{
    if(!el)return;
    const m=String(Math.floor(secs/60)).padStart(2,'0'),s=String(secs%60).padStart(2,'0');
    el.textContent=m+':'+s;
    if(secs<=0){clearInterval(_examTimer);finishSession();return;}
    secs--;
  },1000);
}
function stopExamBanner(){clearInterval(_examTimer);_examTimer=null;const el=document.getElementById('qcm-timer');if(el)el.textContent='';}

/* ─── CR TIMER ─── */
let _crPhase=1,_crTimer=null;
function startCRTimer(){_crPhase=1;document.getElementById('cr-timer-ov').style.display='flex';runCRPhase();}
function runCRPhase(){
  clearInterval(_crTimer);
  const lbl=document.getElementById('cr-phase-lbl'),disp=document.getElementById('cr-timer-disp'),sub=document.getElementById('cr-phase-sub'),skip=document.getElementById('cr-skip-btn');
  const secs=_crPhase===1?40*60:20*60;
  if(lbl)lbl.textContent=_crPhase===1?'📝 Préparation':'🎤 CR oral — À vous !';
  if(skip)skip.style.display=_crPhase===1?'block':'none';
  let s=secs;
  const tick=()=>{
    const m=String(Math.floor(s/60)).padStart(2,'0'),sec=String(s%60).padStart(2,'0');
    if(disp)disp.textContent=m+':'+sec;
    if(s<=0){clearInterval(_crTimer);if(_crPhase===1)skipCRPhase();else stopCRTimer();}s--;
  };
  tick();_crTimer=setInterval(tick,1000);
}
function skipCRPhase(){_crPhase=2;runCRPhase();}
function stopCRTimer(){
  clearInterval(_crTimer);
  document.getElementById('cr-timer-ov').style.display='none';
  if(!S.crDone)S.crDone=0;S.crDone++;save();
  BADGES.checkAll();
}

/* ─── PROFIL ─── */
function renderProfil(){
  const g=getGrade(),n=getNextGrade(),pct=getXPPct();
  const el=id=>document.getElementById(id);
  if(el('pr-av'))el('pr-av').textContent=g.icon;
  if(el('pr-name'))el('pr-name').textContent=eh(S.user.name);
  if(el('pr-grade'))el('pr-grade').textContent=g.name;
  if(el('pr-xp-lbl'))el('pr-xp-lbl').textContent=S.user.xp+(n?' / '+n.min:'')+' XP';
  if(el('pr-xp-pct'))el('pr-xp-pct').textContent=pct+'%';
  if(el('pr-xpbar'))el('pr-xpbar').style.width=pct+'%';
  // Animer le ring XP
  const ring=el('pr-xp-ring');
  if(ring){const total=276.5;ring.style.transition='none';ring.style.strokeDashoffset=total;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ring.style.transition='stroke-dashoffset .8s cubic-bezier(.34,1.56,.64,1)';ring.style.strokeDashoffset=total*(1-pct/100);}));}
  if(el('pr-streak'))el('pr-streak').innerHTML=S.user.streak+'🔥';
  if(el('pr-qcm'))el('pr-qcm').textContent=Object.keys(S.qcm.cards).length;
  const vals=Object.values(S.qcm.cards);
  const totalOk=vals.reduce((a,c)=>a+(c.ok||0),0);
  const totalAll=vals.reduce((a,c)=>a+(c.ok||0)+(c.ko||0),0);
  if(el('pr-acc'))el('pr-acc').textContent=totalAll>0?Math.round(totalOk/totalAll*100)+'%':'—';
  renderActivityBars();renderRadar28();BADGES.renderGrid();THEME28.apply();
}
function renderActivityBars(){
  const el=document.getElementById('pr-activity-bars');if(!el)return;
  const today=Date.now();
  const bars=Array.from({length:30},(_,i)=>{
    const d=new Date(today-i*86400000).toDateString();
    return{active:!!S.activity?.[d],isStreak:false};
  }).reverse();
  el.innerHTML=bars.map(b=>`<div class="activity-bar${b.active?' active':''}" style="height:${b.active?'100':'25'}%"></div>`).join('');
}
function renderRadar28(){
  const labels=['GAV','Flagrance','Mandats','Infractions','Libertés','Procédure'];
  const cats=[['GAV'],['FLAGRANCE'],['MANDATS','MESURES_COERC'],['INFRACTIONS'],['LIBERTES'],['PERQUIZ','COMMISSION']];
  const vals=cats.map(cl=>{
    const pool=QB.filter(q=>cl.includes(q.cat));if(!pool.length)return 0;
    const ok=pool.filter(q=>(S.qcm.cards[q.id]?.ok||0)>0).length;
    return Math.round(ok/pool.length*100);
  });
  renderRadar('pr-radar',labels,vals);
}
function renderRadar(id,labels,values){
  const el=document.getElementById(id);if(!el)return;
  const sz=240,cx=120,cy=120,r=80,n=labels.length;
  const pts=labels.map((_,i)=>{const a=Math.PI*2/n*i-Math.PI/2;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),lx:cx+(r+22)*Math.cos(a),ly:cy+(r+22)*Math.sin(a)};});
  const grids=[25,50,75,100].map(lvl=>{
    const gpts=pts.map((_,i)=>{const a=Math.PI*2/n*i-Math.PI/2,rv=r*lvl/100;return`${cx+rv*Math.cos(a)},${cy+rv*Math.sin(a)}`;}).join(' ');
    return`<polygon points="${gpts}" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`;
  }).join('');
  const axes=pts.map(p=>`<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,.08)" stroke-width="1"/>`).join('');
  const data=values.map((v,i)=>{const a=Math.PI*2/n*i-Math.PI/2,rv=r*v/100;return`${cx+rv*Math.cos(a)},${cy+rv*Math.sin(a)}`;}).join(' ');
  const lbls=labels.map((l,i)=>`<text x="${pts[i].lx}" y="${pts[i].ly}" text-anchor="middle" dominant-baseline="middle" fill="rgba(240,246,255,.45)" font-size="9" font-family="JetBrains Mono,monospace">${l}</text>`).join('');
  el.innerHTML=`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" style="max-width:100%"><g>${grids}${axes}<polygon points="${data}" fill="rgba(37,99,235,.15)" stroke="rgba(59,130,246,.7)" stroke-width="1.5"/>${lbls}</g></svg>`;
}
function showGrades(){
  const html=`<div style="padding:18px">
    <div class="font-title fw-800 text-xl mb16">🏅 Grades Police Nationale</div>
    ${GRADES.map(gr=>`<div style="display:flex;align-items:center;gap:12px;padding:9px;background:${S.user.xp>=gr.min?'var(--accent-glow)':'transparent'};border-radius:var(--r-m);margin-bottom:4px">
      <span style="font-size:20px">${gr.icon}</span>
      <div style="flex:1"><div class="text-sm fw-700" style="color:${S.user.xp>=gr.min?'var(--t1)':'var(--t3)'}">${gr.name}</div><div class="text-xs text-muted font-mono">${gr.min} XP requis</div></div>
      ${S.user.xp>=gr.min?'<span class="text-ok">✓</span>':''}
    </div>`).join('')}
    <button class="btn btn-ghost btn-full mt12" onclick="closeLesson()">Fermer</button>
  </div>`;
  document.getElementById('lesson-modal-body').innerHTML=html;
  document.getElementById('lesson-ov').classList.add('on');
  document.body.style.overflow='hidden';
}
function resetData(){
  if(!confirm('Réinitialiser toute la progression ? Cette action est irréversible.'))return;
  const name=S.user.name;S=defaultState();S.user.name=name;S.page='home';save();
  navigateTo('home');showToast('Progression réinitialisée','ok');
}

/* ─── CARTOUCHES ─── */


const CR_DOSSIERS=[
{id:1,titre:"Personne grièvement blessée",emoji:"🩸",cadre:"Flagrance",qual:"Tentative homicide / Violences aggravées",tags:["Flagrance","Art. 222-1 CP","Urgence"],
faits:"À 23h15, votre patrouille est appelée pour une personne inconsciente rue des Acacias. Vous découvrez M. MARTIN Thierry, 34 ans, crâne fracturé. SAMU en route. Témoin DUPONT René signale un suspect masculin, veste rouge, fuite il y a 10 minutes.",
qualification:"Tentative d'homicide volontaire art. 221-1 CP ou violences aggravées nuit/guet-apens art. 222-8 CP. Cadre : flagrance art. 53 CPP.",
pieges:["Qualifier au plus grave sans attendre le pronostic vital","Préciser et justifier le cadre flagrance","Demander autorisation GAV dès interpellation","Sécuriser la scène : témoins, traces, vidéosurveillance"],
corrige:"Monsieur le Procureur, OPJ [NOM], brigade [SERVICE], il est [HEURE].\n\nJe vous rends compte de la découverte d'une personne grièvement blessée rue des Acacias, ce jour à 23h15.\n\nQUALIFICATION : Tentative d'homicide volontaire — art. 221-1 al.1 CP.\nCADRE : Enquête de flagrance — art. 53 CPP.\nFAITS : Victime inconsciente, crâne fracturé. Témoin DUPONT René signale suspect veste rouge, fuite il y a 10 min.\nACTES RÉALISÉS : Sécurisation scène. Demande SAMU. Recueil déposition DUPONT.\nDEMANDES : Autorisation GAV suspect dès interpellation. Réquisitions vidéosurveillance. Avis médecin légiste.\n\nJe reste disponible."},
{id:2,titre:"Cambriolage en cours",emoji:"🏠",cadre:"Flagrance",qual:"Vol aggravé — Art. 311-4 CP",tags:["Flagrance","Art. 311-4 CP","GAV"],
faits:"À 02h30, deux individus dans une bijouterie fermée, vitrine brisée. Interpellation de SAID Karim, 22 ans : 12 montres + pied de biche. Un complice fuit par les toits. Propriétaire M. CHEN confirme.",
qualification:"Vol aggravé effraction + nuit + réunion — art. 311-4 2° et 4° CP. Flagrance art. 53 CPP.",
pieges:["Cumuler les circonstances aggravantes","Demander perquisition domicile","Signalement complice","Sceller séparément chaque objet"],
corrige:"Monsieur le Procureur, OPJ [NOM], brigade [SERVICE].\n\nVol aggravé effraction + nuit + réunion — art. 311-4 2° et 4° CP.\nFlagrance art. 53 CPP.\n\nSAID Karim interpellé avec 12 montres et pied de biche. Complice en fuite.\n\nDEMANDES : GAV SAID. Perquisition domicile. Signalement complice. Réquisitions caméra."},
{id:3,titre:"Violences conjugales habituelles",emoji:"👊",cadre:"Préliminaire",qual:"Violences habituelles — Art. 222-14 CP",tags:["Préliminaire","Art. 222-14 CP"],
faits:"Mme PETIT Sophie, 31 ans, se présente. Violences répétées sur 6 mois par son conjoint. Certificat médical : ITT 5 jours. Main courante en mars. Deux enfants mineurs au domicile.",
qualification:"Violences habituelles sur conjoint, ITT < 8 jours, présence enfants — art. 222-14 2° et 3° CP.",
pieges:["HABITUALITÉ art. 222-14 ≠ violences simples","Vérifier si enfants témoins → aggravante","Pas de perquisition sans accord ou JLD en préliminaire","Réaliser l'EVVI"],
corrige:"Madame la Procureure, OPJ [NOM].\n\nViolences habituelles sur conjoint, ITT 5 jours, présence enfants — art. 222-14 2° et 3° CP.\nPréliminaire — faits sur 6 mois.\n\nDEMANDES : GAV M. LEROY. JLD pour perquisition si refus. Saisine JAF."},
{id:4,titre:"Trafic de stupéfiants — bande organisée",emoji:"💊",cadre:"Flagrance + CO",qual:"Trafic stups bande organisée — Art. 222-34 CP",tags:["Criminalité organisée","Art. 222-37 CP","GAV 96h"],
faits:"Après 3 semaines de surveillance, interpellation de GARCIA Pablo, 28 ans. Sur lui : 250g cocaïne, 3 500 € espèces. Sur TRAN Van, 24 ans : 2g usage perso.",
qualification:"GARCIA : trafic cocaïne bande organisée — art. 222-34. TRAN : usage — L3421-1 CSP.",
pieges:["Distinguer GARCIA (trafiquant) et TRAN (usage)","Régime dérogatoire CO","Saisir les avoirs criminels"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nGARCIA : trafic cocaïne BO — art. 222-34. TRAN : usage — L3421-1.\nRégime CO art. 706-73.\n\nDEMANDES : GAV GARCIA CO 96h JLD. GAV TRAN droit commun. Saisie 3 500 €."},
{id:5,titre:"Accident — délit de fuite + alcool",emoji:"🚗",cadre:"Flagrance",qual:"Blessures involontaires aggravées — Art. 222-19-1 CP",tags:["Flagrance","Art. 222-19-1 CP","Alcool"],
faits:"À 20h30, M. ROUSSEAU Bernard renverse un cycliste en brûlant un feu et prend la fuite. Interpellé 2h30 plus tard. Alcoolémie : 1,8 g/l. Victime : fracture bassin + commotion — ITT 6 semaines.",
qualification:"Blessures involontaires aggravées alcool + délit de fuite — art. 222-19-1 CP.",
pieges:["ITT ≥ 3 mois → aggravante spécifique","Cumuler infractions code de la route","Immobiliser le véhicule"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nBlessures involontaires ITT > 3 mois + délit de fuite + alcool 1,8 g/l.\nFlagrance art. 53 CPP.\n\nDEMANDES : GAV ROUSSEAU. Rétention permis. Mise en fourrière."},
{id:6,titre:"Découverte d'un corps",emoji:"💀",cadre:"Art. 74 CPP",qual:"Mort suspecte — Art. 74 CPP",tags:["Art. 74 CPP","Cause inconnue","Médecin légiste"],
faits:"À 06h15, découverte d'un homme décédé dans un parc. Aucune trace visible de violence. Identité inconnue.",
qualification:"Art. 74 CPP — enquête sur les causes de la mort.",
pieges:["Ne pas qualifier avant autopsie","Ne pas ouvrir une information judiciaire soi-même","Périmètre de sécurité IMMÉDIAT"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nDécouverte de corps de cause inconnue. Art. 74 CPP.\n\nDEMANDES : Réquisition médecin légiste. Identification victime. Votre décision sur saisine JI si cause suspecte."},
{id:7,titre:"Vol avec violence en réunion",emoji:"👊",cadre:"Flagrance",qual:"Vol avec violence en réunion — Art. 311-5 CPn",tags:["Flagrance","Art. 311-5 CPn","GAV"],
faits:"À 14h30, trois individus arrachent téléphone et portefeuille en frappant la victime. Un suspect interpellé 200 m plus loin avec le téléphone. La victime saigne du nez.",
qualification:"Vol avec violence en réunion — art. 311-5 + 311-6 CPn.",
pieges:["Vérifier que la FLAGRANCE est bien caractérisée","ITT à demander","Co-auteurs en fuite : fiche de recherche"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nVol avec violence en réunion — art. 311-5 + 311-6 CPn.\n\nDEMANDES : GAV suspect. ITT victime. Diffusion co-auteurs."},
{id:8,titre:"Violence conjugale — retrait de plainte",emoji:"👁",cadre:"Préliminaire",qual:"Violences conjugales — Art. 222-11 + 132-80 CPn",tags:["Art. 132-80","Violences conjugales"],
faits:"À 22h45, intervention pour cris. La femme présente un hématome à l'œil. Elle refuse de porter plainte. Le mari nie.",
qualification:"Violences volontaires + aggravante conjoint art. 132-80.",
pieges:["Le retrait de plainte ne met PAS fin aux poursuites","L'OPJ peut procéder même sans plainte","EVVI obligatoire"],
corrige:"Madame la Procureure, OPJ [NOM].\n\nViolences conjugales — art. 222-11 + 132-80 CPn.\n\nVictime refuse plainte — procédure d'initiative. EVVI réalisée.\n\nDEMANDES : GAV du mari ? Éloignement ? ITT."},
{id:9,titre:"Trafic de stupéfiants — contrôle routier",emoji:"🔍",cadre:"Préliminaire / Flagrance",qual:"Détention de stupéfiants — Art. 222-37 CPn",tags:["Art. 222-37 CPn","Saisie"],
faits:"Lors d'un contrôle, conducteur nerveux. Coffre : 1 kg résine cannabis + 3 500 € en liquide. Il nie.",
qualification:"Détention et transport de stupéfiants — art. 222-37.",
pieges:["1 kg + argent liquide = faisceau d'indices de trafic","Saisir les 3 500 €","Si réseau suspecté : saisine OCTRIS"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nDétention et transport stups — art. 222-37 CPn. 1 kg cannabis + 3 500 €.\n\nDEMANDES : GAV. Saisie avoirs. Saisine OCTRIS si réseau."},
{id:10,titre:"Mineur — violences au collège",emoji:"🎒",cadre:"CJPM 2021",qual:"Violences ITT > 8 jours — Art. 222-11 CPn",tags:["CJPM 2021","Mineur","Art. 222-11"],
faits:"Un élève de 15 ans a frappé un camarade. La victime est transportée SAMU (fracture du nez probable). Parents injoignables.",
qualification:"Violences volontaires ITT > 8 jours — art. 222-11. CJPM 2021.",
pieges:["NE PAS appliquer les règles des majeurs","Avocat DÈS le début","Si parents injoignables : administrateur ad hoc"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nViolences ITT > 8 jours MINEUR 15 ans — art. 222-11 + CJPM 2021.\n\nDEMANDES : GAV ou retenue ? Saisine JE ? ITT."},
{id:11,titre:"Outrage + rébellion + violences sur PDAP",emoji:"🚨",cadre:"Flagrance",qual:"Art. 433-5 + 433-6 + 222-13 CPn",tags:["Art. 433-5 CPn","PDAP"],
faits:"Lors d'un contrôle d'identité, un homme insulte les agents puis frappe un collègue à l'épaule (ITT 0 jour) et tombe volontairement au sol.",
qualification:"Outrage art. 433-5 + Rébellion art. 433-6 + Violences sur PDAP art. 222-13.",
pieges:["Résistance PASSIVE ≠ rébellion. Ici il frappe → rébellion + violences","CUMUL outrage + rébellion : oui","Demander certificat médical pour le collègue"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nOutrage + Rébellion + Violences sur PDAP — art. 433-5, 433-6, 222-13.\n\nDEMANDES : GAV. Certificat médical collègue blessé."}
];

const PLAN12=[
{s:1,t:"GAV — Droit commun",d:"Art. 63-73 CPP"},
{s:2,t:"GAV — Régimes dérogatoires",d:"CO (706-88) / Terrorisme"},
{s:3,t:"Enquête de flagrance",d:"Art. 53-67 CPP"},
{s:4,t:"Enquête préliminaire",d:"Art. 75-78-5 CPP"},
{s:5,t:"Perquisitions & Mandats",d:"Art. 56-67 CPP + mandats"},
{s:6,t:"Commission rogatoire",d:"Art. 151-155 CPP"},
{s:7,t:"Droit pénal général",d:"Tentative, complicité, aggravantes"},
{s:8,t:"Infractions contre les personnes",d:"Homicide, viol, violences"},
{s:9,t:"Infractions contre les biens",d:"Vol, escroquerie, recel, stups"},
{s:10,t:"Procédures spéciales",d:"CO, mineurs, terrorisme"},
{s:11,t:"CR Téléphonique",d:"Structure, dossiers pratiques"},
{s:12,t:"QCM intensifs",d:"Tests chrono de connaissances"}];

const ANNALES=[
{id:"A01",titre:"La garde à vue",matiere:"Procédure pénale",coeff:3,duree:"4h",
question:"Après avoir défini la garde à vue, exposez ses conditions de fond et de forme, puis analysez les garanties de la personne gardée à vue.",
motscles:["Art. 63 CPP","Raisons plausibles","Droits fondamentaux","Avocat","Prolongation"],
plan:[{n:"I",t:"Le cadre légal de la garde à vue"},{n:"A",t:"Conditions de fond"},{n:"B",t:"Conditions de forme"},{n:"II",t:"Les garanties"},{n:"A",t:"Droits notifiés dès le placement"},{n:"B",t:"Le contrôle judiciaire"}],
intro:"La garde à vue constitue l'une des mesures les plus attentatoires aux libertés individuelles. Définie à l'article 63 CPP, elle se définit comme la mesure de contrainte par laquelle l'OPJ retient à sa disposition, pour les nécessités de l'enquête, une personne à l'encontre de laquelle il existe des raisons plausibles de soupçonner qu'elle a commis ou tenté de commettre un crime ou un délit puni d'emprisonnement.",
corrige:"I. LE CADRE LÉGAL\n\nA. Conditions de fond\nDeux conditions cumulatives : raisons plausibles + nécessités de l'enquête.\n\nB. Conditions de forme\nDécision de l'OPJ. PR informé immédiatement.\n\nII. LES GARANTIES\n\nA. Droits notifiés dès le placement\nArt. 63-1 : avocat dès le début, médecin, proche, silence.\n\nB. Contrôle judiciaire\nPR peut ordonner la fin à tout moment. Prolongation : autorisation écrite PR.",
erreurs:["Oublier la condition de peine d'emprisonnement","Confondre information PR et autorisation","Omettre le droit au silence","Confondre GAV droit commun (48h) et CO (96h)"]},
{id:"A02",titre:"La commission rogatoire",matiere:"Procédure pénale",coeff:3,duree:"4h",
question:"Exposez le mécanisme de la commission rogatoire : définition, conditions, pouvoirs de l'OPJ, limites.",
motscles:["Art. 151 CPP","Juge d'instruction","Délégation","Compétence nationale"],
plan:[{n:"I",t:"Instrument de délégation judiciaire"},{n:"A",t:"Conditions et auteur exclusif"},{n:"B",t:"Pouvoirs de l'OPJ commis"},{n:"II",t:"Limites et contrôle"},{n:"A",t:"Limites intrinsèques"},{n:"B",t:"Contrôle chambre de l'instruction"}],
intro:"La commission rogatoire est l'acte par lequel le juge d'instruction délègue à un OPJ l'exercice de certains actes d'instruction. Fondée sur l'article 151 CPP, elle constitue le lien organique entre le JI et la police judiciaire.",
corrige:"I. DÉLÉGATION JUDICIAIRE\n\nA. Auteur\nSeul le JI peut délivrer une CR. Écrite, motivée, signée.\n\nB. Pouvoirs\nMêmes pouvoirs qu'en flagrance (art. 152). Compétence nationale.\n\nII. LIMITES\n\nA. Limites\nPas de subdélégation à un APJ. Urgence → action + CR immédiat au JI.\n\nB. Contrôle\nNullités (art. 173). Chambre de l'instruction.",
erreurs:["Attribuer la CR au PR","Oublier la compétence nationale","Confondre durée GAV en CR et durée de la CR","Omettre l'interdiction de subdélégation"]},
{id:"A03",titre:"La tentative punissable",matiere:"Droit pénal",coeff:2,duree:"3h",
question:"Définissez la notion de tentative, exposez ses conditions et distinguez les infractions pour lesquelles elle est punissable.",
motscles:["Art. 121-5 CP","Commencement d'exécution","Désistement volontaire"],
plan:[{n:"I",t:"Éléments constitutifs"},{n:"A",t:"Commencement d'exécution"},{n:"B",t:"Absence de désistement volontaire"},{n:"II",t:"Champ d'application"},{n:"A",t:"Crimes et délits"},{n:"B",t:"Exclusion des contraventions"}],
intro:"La tentative est définie à l'article 121-5 CP comme constituée dès lors qu'elle a été manifestée par un commencement d'exécution et n'a été suspendue que par des circonstances indépendantes de la volonté de son auteur.",
corrige:"I. ÉLÉMENTS\n\nA. Commencement d'exécution\nActe qui tend directement à l'infraction (acte non équivoque).\n\nB. Absence de désistement\nDésistement volontaire = non punissable. Échec extérieur = punissable.\n\nII. CHAMP\n\nA. Crimes et délits\nCrime = toujours. Délit = si texte. Délits d'imprudence = jamais tentés.\n\nB. Contraventions\nJamais punissable.",
erreurs:["Affirmer que toute tentative de délit est punissable","Oublier que les délits d'imprudence ne peuvent pas être tentés","Confondre désistement volontaire et forcé"]},
{id:"A04",titre:"Les circonstances aggravantes",matiere:"Droit pénal",coeff:2,duree:"3h",
question:"Définissez les circonstances aggravantes et distinguez leurs différentes catégories en droit pénal français.",
motscles:["Aggravantes réelles","Aggravantes personnelles","Préméditation","Vulnérabilité"],
plan:[{n:"I",t:"Notion et effets"},{n:"A",t:"Définition : légales et obligatoires"},{n:"B",t:"Effets : aggravation légale des peines"},{n:"II",t:"Classification"},{n:"A",t:"Tenant à l'infraction"},{n:"B",t:"Tenant aux personnes"}],
intro:"Les circonstances aggravantes sont des éléments qui, s'ajoutant aux éléments constitutifs d'une infraction, ont pour effet d'en aggraver légalement la répression. Contrairement aux circonstances atténuantes, elles sont légales et obligatoires.",
corrige:"I. NOTION ET EFFETS\n\nA. Légales et obligatoires\nExpressément prévues par le Code pénal. Liste limitative.\n\nB. Effets\nL'aggravante porte la peine maximale à un niveau supérieur.\n\nII. CLASSIFICATION\n\nA. Tenant à l'infraction\nPréméditation (132-72). Guet-apens. Réunion. Nuit. Arme.\n\nB. Tenant aux personnes\nVulnérabilité. Qualité PDAP. Mineur <15 ans.",
erreurs:["Confondre aggravantes (obligatoires) et circonstances atténuantes","Oublier de cumuler plusieurs aggravantes","Confondre préméditation et guet-apens"]}
];

const LIBERTES_DATA=[
  {id:'lp1',em:'🔒',nm:'Liberté individuelle',ref:'Art. 66 Constitution · Art. 136 CPP',
   def:'Nul ne peut être détenu arbitrairement. L\'autorité judiciaire est gardienne de la liberté individuelle.',
   points:['Tout placement en détention doit être ordonné ou contrôlé par l\'autorité judiciaire','Le JLD est le juge des libertés et de la détention','GAV, retenue douanière, IRTF relèvent de ce cadre'],
   piege:'Ne pas confondre liberté individuelle (art. 66) et liberté de circulation (art. 2 protocole 4 CEDH)'},
  {id:'lp2',em:'🏠',nm:'Inviolabilité du domicile',ref:'Art. 76 CPP · Art. 8 CEDH',
   def:'Le domicile est inviolable. Les perquisitions ne peuvent avoir lieu que dans les cas prévus par la loi.',
   points:['Flagrance : 6h–21h sans accord (24h/24 si crime/délit ≥3 ans avec violence)','Préliminaire : accord exprès de l\'intéressé ou autorisation JLD','Domicile étendu : véhicule personnel, bureau, chambre d\'hôtel'],
   piege:'En enquête préliminaire, sans accord de la personne, la perquisition nécessite une autorisation JLD — pas seulement du procureur'},
  {id:'lp3',em:'📢',nm:'Liberté d\'expression',ref:'Art. 11 DDHC · Art. 10 CEDH · Loi 29/07/1881',
   def:'La libre communication des pensées et opinions est un des droits les plus précieux de l\'homme.',
   points:['Infractions de presse : diffamation, injure, provocation à la discrimination','Prescription spéciale : 3 mois (loi 1881)','Exception de vérité (exceptio veritatis) pour la diffamation'],
   piege:'Prescription de 3 mois pour les délits de presse — pas la prescription ordinaire. Piège classique d\'examen'},
  {id:'lp4',em:'🤐',nm:'Droit au silence',ref:'Art. 6 CEDH · Art. 63-1 CPP',
   def:'Toute personne a le droit de ne pas s\'auto-incriminer et de garder le silence lors des auditions.',
   points:['Notification obligatoire dès le placement en GAV (art. 63-1)','S\'applique aussi en audition libre (art. 61-1)','Le silence ne peut jamais constituer une preuve de culpabilité'],
   piege:'Le droit au silence en audition libre (61-1) n\'est pas conditionné au placement en GAV — il doit être notifié dès le début'},
  {id:'lp5',em:'👨‍⚖️',nm:'Droits de la défense',ref:'Art. 6 CEDH · Art. 63-3-1 CPP',
   def:'Toute personne a droit à l\'assistance d\'un avocat dès le début de sa garde à vue.',
   points:['Entretien confidentiel de 30 min dès le placement en GAV','Assistance lors des auditions et perquisitions','Report possible par décision motivée du procureur (art. 63-4-2)'],
   piege:'Le report ne peut excéder 24h (crime organisé) ou 48h (terrorisme) — jamais plus'},
  {id:'lp6',em:'⚖️',nm:'Présomption d\'innocence',ref:'Art. 9 DDHC · Art. 9-1 CC · Art. 6 CEDH',
   def:'Toute personne est présumée innocente jusqu\'à ce que sa culpabilité ait été légalement établie.',
   points:['Charge de la preuve incombe au ministère public','Le doute profite à la personne poursuivie (in dubio pro reo)','Protection civile : réparation du préjudice moral'],
   piege:'La présomption d\'innocence conditionne la condamnation, pas les mesures conservatoires (interpellation, GAV)'},
  {id:'lp7',em:'🔎',nm:'Protection contre les fouilles',ref:'Art. 78-2 · 78-2-2 CPP',
   def:'Les palpations de sécurité et fouilles à corps obéissent à des régimes juridiques distincts.',
   points:['Palpation de sécurité : OPJ ou APJ habilité, nécessité sécuritaire','Fouille à corps intégrale : uniquement OPJ ou sous contrôle OPJ','Fouille de véhicule : régimes différents selon flagrance/préliminaire'],
   piege:'Palpation de sécurité ≠ fouille à corps — deux actes distincts avec habilitations différentes'},
  {id:'lp8',em:'📱',nm:'Protection de la vie privée',ref:'Art. 8 CEDH · Art. 226-1 CP',
   def:'Toute personne a droit au respect de sa vie privée, de son domicile et de sa correspondance.',
   points:['Interceptions téléphoniques : régime des écoutes (art. 100 CPP)','IMSI-catcher : dispositif de proximité (art. 706-95-4 CPP)','Géolocalisation : autorisation procureur ou JLD selon durée'],
   piege:'Géolocalisation en temps réel au-delà de 15 jours → autorisation JLD obligatoire, pas seulement procureur'},
  {id:'lp9',em:'🧒',nm:'Protection des mineurs',ref:'Art. 706-50 CPP · CJPM',
   def:'Les mineurs bénéficient d\'un régime procédural dérogatoire centré sur l\'éducatif.',
   points:['Irresponsabilité pénale : moins de 13 ans (présomption irréfragable)','GAV 13-16 ans : 24h renouvelable 24h (crime/délit ≥3 ans)','Information obligatoire des représentants légaux dès le début'],
   piege:'Moins de 13 ans : pas de GAV possible — retenue de 12h maximum (art. 706-53-1)'},
  {id:'lp10',em:'🌍',nm:'Non-discrimination',ref:'Art. 14 CEDH · Art. 1 Constitution · Art. 225-1 CP',
   def:'Toute discrimination fondée sur l\'origine, le sexe, la religion, l\'orientation sexuelle... est prohibée.',
   points:['Discrimination directe vs indirecte (résultat équivalent)','Profilage ethnique : interdiction absolue pour les contrôles d\'identité','Inégalité de traitement : doit être proportionnée et légitime pour être justifiée'],
   piege:'Contrôle d\'identité basé exclusivement sur l\'apparence = faute lourde de l\'État (Cass. 2017)'},
];

const PB=[
{id:"P01",nm:"GAV — Droit commun",ref:"Art. 63 CPP",piege:"24h initiale ≠ 48h max",def:"Mesure retenant une personne à disposition des enquêteurs.",cond:"Raisons plausibles + infraction punie d'emprisonnement.",duree:"24h + 24h sur autorisation PR = 48h max.",tab:[{l:"Information PR",v:"Immédiate dès le placement"},{l:"Droits notifiés",v:"Avocat, médecin, proche, interprète, silence"},{l:"Entretien avocat",v:"Dès le début (loi 22/04/2024)"},{l:"Prolongation",v:"Autorisation écrite PR, motivée"},{l:"Mineur",v:"Dès 13 ans — représentants légaux notifiés"}]},
{id:"P02",nm:"GAV — Criminalité organisée",ref:"Art. 706-88 CPP",piege:"96h max — JLD obligatoire à partir de 48h",def:"Régime dérogatoire pour infractions art. 706-73 CPP.",cond:"Infractions listées art. 706-73.",duree:"96h max (24h PR + 24h PR + 24h JLD + 24h JLD).",tab:[{l:"Durée max",v:"96 heures"},{l:"48h → 96h",v:"Autorisation JLD obligatoire"},{l:"Avocat",v:"Différé jusqu'à 48h sur autorisation JLD"},{l:"Infractions",v:"Art. 706-73 CPP — liste limitative"}]},
{id:"P03",nm:"GAV — Terrorisme",ref:"Art. 706-88 al.4 CPP",piege:"144h = 6 jours — JLD dès 48h",def:"Régime exceptionnel pour infractions terroristes.",cond:"Infraction art. 421-1 s. CP.",duree:"144h max. JLD requis dès 48h.",tab:[{l:"Durée max",v:"144 heures (6 jours)"},{l:"Avocat",v:"Différé jusqu'à 72h si risque"},{l:"Parquet",v:"PNAT (Paris)"}]},
{id:"P04",nm:"Enquête de flagrance",ref:"Art. 53 CPP",piege:"8 jours (enquête) ≠ 48h (GAV)",def:"Enquête sur crime/délit flagrant.",cond:"Crime/délit flagrant, clameur publique, indices apparents.",duree:"8 jours + 8 jours sur autorisation PR.",tab:[{l:"Durée initiale",v:"8 jours"},{l:"Pouvoirs",v:"Contrainte immédiate, perquisition libre"},{l:"Perquisition",v:"Art. 56 — 6h/21h sauf commencée avant"}]},
{id:"P05",nm:"Enquête préliminaire",ref:"Art. 75 CPP",piege:"Pas de contrainte de principe ≠ flagrance",def:"Enquête en l'absence de flagrance.",cond:"Tout crime ou délit.",duree:"2 ans max (art. 75-1). Prorogeable une fois par PR.",tab:[{l:"Durée max",v:"2 ans + 1 an (prorogation PR)"},{l:"Contrainte",v:"Non de principe — JLD si refus"},{l:"Perquisition",v:"Consentement ou JLD (art. 76)"}]},
{id:"P06",nm:"Commission rogatoire",ref:"Art. 151 CPP",piege:"CR ≠ réquisition PR — seul le JI délivre",def:"Délégation du JI à un OPJ pour accomplir des actes d'instruction.",cond:"Information judiciaire ouverte.",duree:"Limitée par la CR elle-même.",tab:[{l:"Auteur",v:"Juge d'instruction exclusivement"},{l:"Compétence OPJ",v:"Nationale (art. 18 al.4 CPP)"},{l:"Pouvoirs",v:"Identiques à flagrance"},{l:"Délégation",v:"Impossible à un APJ"}]},
{id:"P07",nm:"Perquisition",ref:"Art. 56 CPP",piege:"6h-21h art. 59 — 2 témoins si occupant absent",def:"Recherche d'éléments de preuve dans un lieu déterminé.",cond:"Flagrance: libre. Préliminaire: consentement ou JLD.",duree:"Raisonnable.",tab:[{l:"Horaires",v:"6h-21h (art. 59 CPP)"},{l:"Absence occupant",v:"2 témoins étrangers à l'affaire"},{l:"Avocat",v:"Locaux avocat = bâtonnier présent"},{l:"Données numériques",v:"Art. 57-1 : consultation + copie"}]},
{id:"P08",nm:"Contrôle d'identité",ref:"Art. 78-1 à 78-6 CPP",piege:"4h max ≠ GAV — régimes distincts",def:"Vérification d'identité dans les cas prévus par la loi.",cond:"Raisons plausibles (judiciaire) ou réquisitions PR (administratif).",duree:"Rétention pour vérification : 4 heures max.",tab:[{l:"Durée max",v:"4 heures (art. 78-3)"},{l:"Frontalier",v:"Art. 78-2 al.4 — 20 km frontière"}]},
{id:"P09",nm:"Mandats de justice",ref:"Art. 122-131 CPP",piege:"4 mandats distincts — tableau à maîtriser",def:"Ordres écrits du JI enjoignant comparution, arrestation ou incarcération.",cond:"Information judiciaire ouverte.",duree:"Variable selon le mandat.",tab:[{l:"Comparution",v:"Demander de se présenter"},{l:"Amener (art. 122)",v:"Contraindre physiquement à comparaître"},{l:"Arrêt (art. 131)",v:"Arrestation + incarcération provisoire"}]},
{id:"P10",nm:"Procédure mineurs (CJPM)",ref:"CJPM — Loi 26/09/2021",piege:"Seuil 10 ans ≠ 13 ans coercition",def:"Procédure pénale spéciale pour mineurs.",cond:"Infraction commise par une personne mineure.",duree:"Bifurcation : audience culpabilité → audience sanction.",tab:[{l:"Seuil pénal",v:"10 ans (irresponsabilité < 10 ans)"},{l:"Coercition",v:"Possible dès 13 ans"},{l:"Avocat GAV",v:"Dès le début, sans délai"}]},
{id:"P11",nm:"Nullités de procédure",ref:"Art. 171-174 CPP",piege:"Textuelle = automatique. Substantielle = grief requis",def:"Sanction procédurale d'un acte accompli en violation des formes légales.",cond:"Textuelle : texte l'édictant. Substantielle : violation + grief.",duree:"Avant tout débat sur le fond.",tab:[{l:"Nullité textuelle",v:"Violation d'un texte = nullité automatique"},{l:"Nullité substantielle",v:"Violation + grief démontré requis"},{l:"Délai",v:"Avant débat sur le fond"}]},
{id:"P12",nm:"Contrôle judiciaire & DP",ref:"Art. 137-143 CPP",piege:"CJ = alternative DP — JLD seul compétent",def:"Mesures limitant la liberté d'une personne mise en examen.",cond:"MEX pour crime ou délit puni ≥ 3 ans.",duree:"CJ : sans limite légale. DP : 4 mois renouvelables.",tab:[{l:"CJ",v:"Art. 138 — liste d'obligations"},{l:"DP",v:"Art. 143-1 — dernier recours"},{l:"Compétence",v:"JLD seul (pas le JI)"}]},
{id:"P13",nm:"Mise en examen (MEX)",ref:"Art. 80-1 CPP",piege:"MEX ≠ condamnation. Indices graves ET concordants",def:"Acte par lequel le JI notifie l'existence d'indices graves.",cond:"Indices graves ET concordants.",duree:"Pas de délai fixe.",tab:[{l:"Seuil",v:"Indices graves ET concordants"},{l:"≠ GAV",v:"GAV : raisons plausibles (seuil inférieur)"},{l:"Présomption",v:"Innocence maintenue"}]},
{id:"P14",nm:"Contrôle Judiciaire",ref:"Art. 138 CPP",piege:"Obligations art. 138 = LIMITATIVES",def:"Mesure de sûreté imposant des obligations à une MEX.",cond:"Toute infraction passible d'emprisonnement.",duree:"Sans limite légale.",tab:[{l:"Qui décide",v:"JI ou JLD"},{l:"Obligations",v:"Liste LIMITATIVE art. 138"},{l:"⚠ Piège",v:"Obligations = LIMITATIVES uniquement"}]},
{id:"P15",nm:"Détention Provisoire",ref:"Art. 143-1 CPP",piege:"JI ne peut PAS décider seul la DP — c'est le JLD",def:"Incarcération d'une MEX avant jugement, mesure de dernier recours.",cond:"① Peine ≥ 3 ans ② L'une des 6 finalités art. 144.",duree:"Délits : 4 mois renouvelable. Crimes : plafonds.",tab:[{l:"Décision",v:"JLD saisi par ordonnance JI + réquisitions PR"},{l:"⚠ Piège",v:"JI seul = impossible. Toujours le JLD"}]},
{id:"P16",nm:"CJPM 2021 — Mineurs",ref:"CJPM entrée en vigueur 30/09/2021",piege:"L'ordonnance 1945 est OBSOLÈTE",def:"Le CJPM remplace l'ordonnance de 1945.",cond:"Mineur de moins de 18 ans auteur d'une infraction.",duree:"Audience culpabilité → audience sanction.",tab:[{l:"< 13 ans",v:"Présomption irréfragable irresponsabilité"},{l:"13-18 ans",v:"Responsabilité atténuée"},{l:"⚠ Piège",v:"Ordonnance 1945 = OBSOLÈTE"}]},
{id:"P17",nm:"Juridictions de jugement",ref:"CPP — Organisation judiciaire",piege:"Cour d'Assises = CRIMES uniquement",def:"Tripartition selon la nature de l'infraction.",cond:"Compétence déterminée par la qualification.",duree:"Selon la procédure.",tab:[{l:"Tribunal de Police",v:"Contraventions"},{l:"Tribunal Correctionnel",v:"Délits"},{l:"Cour d'Assises",v:"Crimes UNIQUEMENT"},{l:"⚠ Piège",v:"Délit renvoyé en Assises = nullité"}]},
{id:"P18",nm:"Action publique",ref:"Art. 6 CPP",piege:"Retrait plainte ≠ extinction action publique",def:"Action de la société contre l'auteur d'une infraction.",cond:"Infraction pénale.",duree:"Selon la prescription.",tab:[{l:"Extinction",v:"Mort, prescription, amnistie, chose jugée"},{l:"⚠ Piège",v:"Pardon victime ≠ extinction action publique"}]}
,{id:"P19",nm:"Techniques spéciales d'enquête",ref:"Art. 100, 230-32, 706-80 s. CPP",piege:"Chaque technique a son propre régime d'autorisation",def:"Ensemble de mesures d'investigation intrusives réservées aux infractions graves.",tab:[{l:"Écoutes (art. 100)",v:"JI ordonne. Durée: 4 mois renouvelable. Préliminaire: JLD (706-95)."},{l:"Géoloc (art. 230-32)",v:"PR 15j → JLD 1 mois renouvelable."},{l:"Infiltration (706-81)",v:"PR ou JI. 4 mois renouvelable. CO uniquement."},{l:"Sonorisation (706-96)",v:"JI uniquement. CO. Ordonnance motivée."},{l:"IMSI-catcher (706-95-20)",v:"JI ou JLD. Captation données de connexion."},{l:"Pseudonyme (706-87-1)",v:"OPJ habilité. Internet uniquement."}]},
{id:"P20",nm:"Preuve pénale",ref:"Art. 427-428 CPP",piege:"Liberté ≠ absence de règles. Loyauté exigée.",def:"Principes régissant l'administration de la preuve en matière pénale.",tab:[{l:"Principe",v:"Liberté de la preuve (art. 427)"},{l:"Intime conviction",v:"Le juge apprécie librement (art. 427)"},{l:"Loyauté",v:"Pas de provocation policière à l'infraction"},{l:"Charge",v:"Incombe à l'accusation. Doute profite à l'accusé."},{l:"Aveu",v:"Pas de valeur supérieure aux autres preuves"}]},
{id:"P21",nm:"Alternatives aux poursuites",ref:"Art. 40-1, 41-1, 41-2, 495-7 CPP",piege:"Le PR n'est pas OBLIGÉ de poursuivre = opportunité",def:"Mesures alternatives au renvoi devant le tribunal, décidées par le PR.",tab:[{l:"Opportunité (40-1)",v:"Le PR apprécie la suite : poursuivre, classer, ou alternative."},{l:"Mesures (41-1)",v:"Rappel à la loi, médiation, stage, réparation."},{l:"Composition (41-2)",v:"PR propose → juge valide. Délits ≤ 5 ans."},{l:"CRPC (495-7)",v:"Reconnaissance + peine proposée → homologation juge."},{l:"AFD",v:"Amende forfaitaire délictuelle (usage stups 200€, vol…)."}]},
{id:"P22",nm:"Libertés publiques & Constitution",ref:"Constitution, DDHC, CEDH",piege:"Art. 66 Constitution = fondement des garanties GAV/DP",def:"Cadre constitutionnel et conventionnel encadrant la procédure pénale.",tab:[{l:"Art. 66 Constitution",v:"Autorité judiciaire gardienne de la liberté individuelle"},{l:"Art. 8 DDHC",v:"Légalité des délits et des peines"},{l:"Art. 9 DDHC",v:"Présomption d'innocence"},{l:"Art. 5 CEDH",v:"Droit à la liberté et à la sûreté"},{l:"Art. 6 CEDH",v:"Droit au procès équitable"},{l:"Art. 8 CEDH",v:"Respect de la vie privée"}]},
{id:"P23",nm:"Prescription de l'action publique",ref:"Art. 7-9 CPP (loi 27/02/2017)",piege:"Délais doublés en 2017 — ancien système = piège classique",def:"Délai au-delà duquel l'action publique ne peut plus être exercée.",tab:[{l:"Contraventions",v:"1 an (art. 9)"},{l:"Délits",v:"6 ans — avant 2017 : 3 ans (art. 8)"},{l:"Crimes",v:"20 ans — avant 2017 : 10 ans (art. 7)"},{l:"Mineurs victimes",v:"Crimes sur mineurs : 30 ans à compter de la majorité."},{l:"Terrorisme",v:"Crimes terroristes : 30 ans."}]},
{id:"P24",nm:"Causes d'irresponsabilité pénale",ref:"Art. 122-1 à 122-8 CPén",piege:"5 causes. Distinguer légitime défense / nécessité / contrainte",def:"Faits justificatifs ou causes de non-imputabilité supprimant la responsabilité pénale.",tab:[{l:"Trouble mental total (122-1 al.1)",v:"ABOLITION discernement → Irresponsabilité totale."},{l:"Trouble mental partiel (122-1 al.2)",v:"ALTÉRATION → Peine réduite d'1/3."},{l:"Contrainte (122-2)",v:"Force IRRÉSISTIBLE → Irresponsabilité."},{l:"Erreur de droit (122-3)",v:"Erreur INVINCIBLE → Irresponsabilité (rare)."},{l:"Ordre de la loi (122-4)",v:"Acte prescrit par la loi → Irresponsabilité."},{l:"Légitime défense (122-5)",v:"Riposte PROPORTIONNÉE à agression ACTUELLE."},{l:"État de nécessité (122-7)",v:"DANGER actuel + acte NÉCESSAIRE et PROPORTIONNÉ."}]},
{id:"P25",nm:"Récidive et réitération",ref:"Art. 132-8 à 132-16-7 CPén",piege:"Récidive = condamnation DÉFINITIVE. Réitération = pas de condition",def:"Aggravation de peine en cas de nouvelle infraction après condamnation.",tab:[{l:"Crime/crime (132-8)",v:"Perpétuelle. Perpétuité possible."},{l:"Délit/délit (132-10)",v:"Spéciale, 5 ans. Peine doublée."},{l:"Contravention (132-11)",v:"5ème classe, 1 an."},{l:"Réitération (132-16-7)",v:"Pas de condition de la récidive. Pas de doublement."}]},
{id:"P26",nm:"CHAMBRE DE L'INSTRUCTION",ref:"Art. 185-187, 224-230 CPP",piege:"CJI ≠ Chambre instruction. Chambres = correctionnelle & criminelle.",def:"Juridiction d'appel spécialisée en matière pénale pour contrôler ordonnances JI.",tab:[{l:"Composition",v:"3+ magistrats (président + 2 conseillers minimum)"},{l:"Compétence",v:"Appel ordonnances JI, décisions DP/mesures coercition"},{l:"Délai appel",v:"10 jours à compter ordonnance JI"},{l:"Pouvoir",v:"Infirmer, confirmer, substituer ordonnance"},{l:"Article clé",v:"Art. 185 CPP = appel ordonnance non-lieu"}]},
{id:"P27",nm:"ORDONNANCE DE RENVOI/NON-LIEU",ref:"Art. 175-184 CPP",piege:"Non-lieu ≠ classe sans suite (PR). Ordonnance JI = définitif.",def:"Décision JI terminal du dossier: soit renvoi pour jugement, soit non-lieu.",tab:[{l:"Non-lieu (175)",v:"Infraction insuffisamment établie = classement définitif"},{l:"Renvoi (181)",v:"Preuve suffisante = renvoi tribunal jugement"},{l:"Délai",v:"JI doit trancher dans délai raisonnable (~3-6 mois)"},{l:"Appel CJI",v:"10 jours contre non-lieu ou renvoi à tribunal"},{l:"Publicité",v:"Ordonnance = publique (principe publicité procès)"}]},
{id:"P28",nm:"EXPERTISE JUDICIAIRE",ref:"Art. 156-169 CPP",piege:"Expert ≠ témoin. Expert = avis technique; Témoin = récit faits.",def:"Mesure d'instruction = désignation personne tiers pour éclairer magistrat.",tab:[{l:"Décision",v:"Ordonnance JI ou tribunal (mesure instruction)"},{l:"Domaines",v:"Médicale, ballistique, ADN, incendie, informatique"},{l:"Durée",v:"Délai fixé par JI (2-3 mois généralement renouvelable)"},{l:"Rapport",v:"Écrit communiqué parties (droit contradiction)"},{l:"Coût",v:"Payé par État (article 156 CPP)"}]},
{id:"P29",nm:"TRIBUNAL CORRECTIONNEL",ref:"Art. 381-520-1 CPP",piege:"Correctionnel ≠ criminel. Compétence statutaire = délits (sauf crimes délégués).",def:"Juridiction pénale = jugement délits. Correctif = corriger délits.",tab:[{l:"Composition",v:"1 magistrat seul (TP) ou 3 magistrats (TGI)"},{l:"Compétence",v:"Délits (peine max 10 ans d'emprisonnement)"},{l:"Audience",v:"Publique, débat contradictoire, droit défense respecté"},{l:"Jugement",v:"Délibéré + decision + énoncé peines"},{l:"Appel",v:"Cour appel (art. 496 s. CPP)"}]},
{id:"P30",nm:"COUR D'ASSISES",ref:"Art. 231-380 CPP",piege:"Assises = crimes. Jury = 9 citoyens + 3 magistrats (majorité = 8 votes).",def:"Juridiction pénale spécialisée = jugement crimes (tentatives, complices).",tab:[{l:"Composition",v:"Cour + jury populaire (12 personnes)"},{l:"Compétence",v:"Crimes (peine ≥10 ans ou réclusion criminelle)"},{l:"Audience",v:"Solennelle, débat structuré, dernière parole accusé"},{l:"Verdict jury",v:"Majorité 8/12 votes (innocent=unanimité quasi)"},{l:"Condamnation",v:"Peines criminelles (5 ans minimum en général)"}]},
{id:"P31",nm:"VOIES DE RECOURS (APPEL + POURVOI)",ref:"Art. 496 s. + 567 s. CPP",piege:"Appel ≠ pourvoi. Appel = mérite; Pourvoi = droit (cassation).",def:"Moyens contester jugement/arrêt: appel (reformatio) + pourvoi cassation.",tab:[{l:"Appel (496)",v:"Devant cour appel. Délai 10 jours (correction/crime)"},{l:"Pourvoi (567)",v:"Devant Cass. crim. Délai 10 jours (droit uniquement)"},{l:"Exécution provisoire",v:"Jugement exécutoire même appel pendante"},{l:"Effect appel",v:"Annulation + renvoi appel = nouveau jugement"},{l:"Effect cassation",v:"Annulation + renvoi même juridiction/juridiction supérieure"}]},
{id:"P32",nm:"EXÉCUTION PEINES — JAP & AMÉNAGEMENTS",ref:"Art. 712-1 s. CPP",piege:"JAP = Juge Application Peines. Libération conditionnelle ≠ semi-liberté.",def:"Phase post-condamnation = exécution peine + aménagements.",tab:[{l:"JAP (712-1)",v:"Magistrat = exécution peines + aménagements"},{l:"Semi-liberté",v:"Travail jour/détention nuit (max 1/2 peine)"},{l:"PSE (placement semi-étab.)",v:"Foyer professionnel + permission sortie"},{l:"Libération cond.",v:"Libération avant terme + période probation"},{l:"Détention domicile",v:"BR électronique; conditions strictes (santé, etc.)"}]},
{id:"P33",nm:"MANDAT D'ARRÊT EUROPÉEN",ref:"Art. 695-11 à 695-46 CPP",piege:"MAE ≠ extradition. MAE = reconnaissance mutuelle; Extradition = traité.",def:"Procédure simplifiée remplaçant extradition entre États UE (AFSJ).",tab:[{l:"Émission",v:"État membre → autre État UE (crime/délit ≥5 ans)"},{l:"Exécution",v:"Transmission JAP français; audience dans 10 jours"},{l:"Garanties",v:"Respect droits fondamentaux; appel possible"},{l:"Délai",v:"Remise généralement <10 jours (variable)"},{l:"Refus",v:"Double incrimination PAS requise (sauf exceptions)"}]},
{id:"P34",nm:"ENTRAIDE JUDICIAIRE INTERNATIONALE",ref:"Conventions + art. CPP (var.)",piege:"Entraide ≠ extradition. Entraide = coopération judiciaire (enquête/preuves).",def:"Échanges preuves/témoignages/informations entre États (Interpol, Eurojust).",tab:[{l:"Interpol",v:"Notices rouges = données criminelles internationales"},{l:"Eurojust",v:"Magistrats UE coordinateurs enquêtes complexes"},{l:"Europol",v:"Agence police européenne (renseignement)"},{l:"Commissions rogatoires",v:"Demandes exécution actes d'enquête abroad"},{l:"Traités bilatéraux",v:"Accord France-pays pour coopération"}]},
{id:"P35",nm:"CONTRÔLE DE LA POLICE JUDICIAIRE",ref:"Art. 224-230 CPP",piege:"Notation OPJ = administratif; Chambre instruction = judiciaire (nullité).",def:"Mécanismes légaux contrôle respecte droits & procédure: notation + CJI.",tab:[{l:"Notation OPJ",v:"Évaluation conduites OPJ (hors judiciaire)"},{l:"CJI appels",v:"Chambres instruction appel (ordonnances JI)"},{l:"Sanctions",v:"Avertissement, sanction, révocation si graves"},{l:"Nullité",v:"Débordements OPJ = possible nullité actes"},{l:"Droits défense",v:"Notification, avocat, droit contradictoire"}]},
{id:"P36",nm:"ACTION CIVILE",ref:"Art. 2-5 CPP",piege:"Action civile = devant juridiction pénale (non tribunal civil).",def:"Procédure victime = réparation dommages devant juge pénal (cumul).",tab:[{l:"Constitution partie civile",v:"Demande écrite avant audience; consignation possible"},{l:"Droit",v:"Victime directe (lésion personnelle) ou ayants-droit"},{l:"Recevabilité",v:"Intérêt direct à agir + délai (prescription)"},{l:"Jugement",v:"Juge pénal statue dommages + intérêts"},{l:"Appel",v:"Devant cour appel (ensemble)"}]},
{id:"P37",nm:"FICHIERS DE POLICE (TAJ, FNAEG, FAED, FPR)",ref:"Lois diverses (CNIL, RGPD)",piege:"TAJ ≠ fichiers criminels. TAJ = traitement automatisé données.",def:"Systèmes informatiques centralisant données judiciaires/antécédents.",tab:[{l:"TAJ",v:"Traitement automatisé données judiciaires France"},{l:"FNAEG",v:"Fichier national automatisé des empreintes génétiques (profils ADN)"},{l:"FAED",v:"Fichier Automatisé des Empreintes Digitales (relevés papillaires)"},{l:"FPR",v:"Fichier police recherchés (avis de recherche)"},{l:"Droits",v:"CNIL contrôle; droit accès/rectification/suppression"}]},
{id:"P38",nm:"LOI NARCOTRAFIC 2025 — PRINCIPALES MODIFICATIONS",ref:"Loi n° 2025-532 du 13 juin 2025",piege:"2025 = réforme majeure. Crypto-actifs = nouveau domaine.",def:"Réforme lutte contre trafic stupéfiants: techniques + saisies + peines.",tab:[{l:"Crypto-actifs",v:"Saisie/gel préventif monnaies numériques criminelles"},{l:"Écoutes durée",v:"Prolongation possible durée technique spéciales"},{l:"Repenti",v:"Collaborateur justice = nouveau statut juridique (circonstance atténuante)"},{l:"JUNALCO renforcé",v:"Tribunal national anti-narcotrafic compétence étendue"},{l:"Saisie avoirs",v:"Présomption illicéité avoirs trafiquant"}]}];



const LECONS=[
{id:'l1',em:'⚖️',nm:'Le Procès Pénal & l\'OPJ',mt:'Art.14-18 CPP',secs:[{t:'Procès Pénal',items:['Réaction sociale face à une infraction.','Phases : Enquête → Poursuites → Instruction → Jugement.','L\'OPJ intervient principalement en phase d\'enquête.']},{t:'Rôle de l\'OPJ',items:['Constater les infractions, rassembler les preuves.','Rendre compte au Procureur de la République.','Diriger les APJ (art. 20) sous son contrôle.']},{t:'Les 5 cadres d\'enquête',items:['Flagrant délit (art. 53-73 CPP).','Enquête préliminaire (art. 75-78 CPP).','Commission rogatoire (art. 151-155 CPP).','Mort suspecte (art. 74 CPP).','Personne grièvement blessée.']}],keys:['OPJ = art.16 CPP. APJ = art.20. APJA = art.21.','Contrôle PJ : PR + Chambre instruction + JI','Compétence nationale : art. 18 al.3 — 3 avis']},
{id:'l2',em:'🔒',nm:'GAV — Droit Commun',mt:'Art.62-2, 63 à 63-8 CPP',secs:[{t:'Conditions — Art. 62-2 CPP',items:['Raisons plausibles de soupçonner l\'infraction.','Infraction punie d\'emprisonnement.','1 des 6 objectifs.']},{t:'Durée',items:['24h initiales. Heure début = heure de privation de liberté.','Prolongation : +24h sur autorisation écrite du PR.']},{t:'Droits du GAV',items:['Notification immédiate en langue comprise.','Avocat SANS délai (loi 22/04/2024).','Droit au silence, interprète.']},{t:'Avis magistrat',items:['Dès le début, dans les plus brefs délais.']}],keys:['Heure GAV = privation liberté, pas arrivée locaux','Avis PR = obligation de résultat','Avocat : entretien non reportable (sauf terrorisme/CDO)','< 16 ans : examen médical OBLIGATOIRE ET IMMÉDIAT']},
{id:'l3',em:'🔍',nm:'Les Cadres d\'Enquête',mt:'Flagrance · Préliminaire · CR · Art.74',secs:[{t:'Flagrance — Art. 53 CPP',items:['Crime ou délit flagrant.','Durée : 8 j. Prorogeable +8 j.','Pouvoirs étendus : GAV, perquisitions sans assentiment.']},{t:'Enquête préliminaire — Art. 75 CPP',items:['Régime de droit commun.','Perquisition avec assentiment exprès.','JLD autorise si refus.']},{t:'Commission rogatoire — Art. 151 CPP',items:['Délégation du JI — intuitu personae.','Pouvoirs identiques à flagrance.','Compétence nationale.']}],keys:['Flagrance ≠ préliminaire : assentiment requis','CR intuitu personae — pas délégable','Art.74 ≠ flagrance — cause inconnue seulement']},
{id:'l4',em:'📋',nm:'Classification des Infractions',mt:'Art.111-1 CPén',secs:[{t:'Tripartition',items:['CRIME : RC/perpétuité.','DÉLIT : emprisonnement.','CONTRAVENTION : amende.']},{t:'Tentative — Art. 121-5 CPén',items:['Commencement d\'exécution + désistement involontaire.','Crime : toujours. Délit : si texte. Contravention : jamais.']}],keys:['Assises = crimes UNIQUEMENT','Tentative crime = toujours. Délit = si texte','Loi douce = rétroactive. Loi dure = non-rétroactive']},
{id:'l5',em:'👥',nm:'Complicité & Responsabilité',mt:'Art.121-6, 121-7, 122-1 CPén',secs:[{t:'Complicité — Art. 121-7 CPén',items:['Aide/assistance (al.1) ou instigation (al.2).','Même peine que l\'auteur principal.']},{t:'Irresponsabilité pénale',items:['Art. 122-1 al.1 : trouble total → EXONÉRATION.','Art. 122-1 al.2 : trouble partiel → ATTÉNUATION.','< 13 ans : irresponsabilité présomption irréfragable.']}],keys:['Complicité = même peine que l\'auteur principal','Trouble total (al.1) = exonération. Partiel (al.2) = atténuation','Coauteur ≠ complice']},
{id:'l6',em:'🏠',nm:'Les Perquisitions',mt:'Art.56, 76, 94 CPP',secs:[{t:'Règles par cadre',items:['Flagrance (art. 56) : sans assentiment.','Préliminaire (art. 76) : assentiment ou JLD.','Heures légales : 6h-21h.']},{t:'Lieux particuliers',items:['Cabinet avocat : bâtonnier OBLIGATOIRE.','Médecin/huissier : magistrat + représentant de l\'ordre.','Presse : magistrat seul.']}],keys:['Préliminaire sans assentiment : JLD depuis 2021','Avocat = bâtonnier OBLIGATOIRE','Nuit possible en CO avec autorisation magistrat']},
{id:'l7',em:'📜',nm:'Commission Rogatoire',mt:'Art.151-155 CPP',secs:[{t:'Définition',items:['Délégation du JI — intuitu personae.','CR : écrite, datée, signée, sceau magistrat.']},{t:'Pouvoirs OPJ',items:['Identiques à flagrance (art. 152 CPP).','Compétence nationale (art. 18 al.4).']},{t:'Actes INTERDITS',items:['Délivrance de mandats.','Subdélégation à un APJ.','Interrogatoires du mis en examen.']}],keys:['CR intuitu personae = pas délégable','Compétence nationale : automatique','Original CR : à exhiber à CHAQUE acte']},
{id:'l8',em:'🎒',nm:'Mineurs — CJPM 2021',mt:'En vigueur 30/09/2021',secs:[{t:'Irresponsabilité pénale',items:['< 13 ans : présomption IRRÉFRAGABLE.','13-16 ans : atténuation, excuse minorité OBLIGATOIRE.','16-18 ans : atténuation facultative.']},{t:'GAV des 13-18 ans',items:['Avocat : OBLIGATOIRE ET IMMÉDIAT.','< 16 ans : examen médical IMMÉDIAT.','Représentants légaux : informés immédiatement.']},{t:'Procédure CJPM 2021',items:['Remplace ordonnance 1945 (OBSOLÈTE).','2 temps : audience culpabilité → audience sanction.']}],keys:['< 13 ans : irresponsabilité irréfragable','Ordonnance 1945 = OBSOLÈTE. CJPM 2021 uniquement','Avocat mineur = entretien non reportable']}
,{"id": "L31", "em": "📋", "nm": "Nullités de forme et de fond", "mt": "Art. 802 et s. CPP", "intro": "Les nullités protègent les droits de la défense. À l'examen, savoir les identifier et les invoquer dans le bon délai.", "sections": [{"t": "Classification", "items": ["Nullité de forme = vice du déroulement procédural", "Nullité de fond = atteinte aux droits de la défense", "Nullité de forme = peut être relevée d'office ou sur exception"]}, {"t": "Conditions", "items": ["Préjudice pour les droits de la défense", "Délai : immédiatement ou en appel (art. 802)", "Prescription : 10 ans après jugement final"]}], "keys": ["Les nullités protègent la procédure équitable.", "Le délai d'exception est strict.", "À l'examen, toujours citer l'article de la nullité."]},{"id": "L32", "em": "🔍", "nm": "Instruction judiciaire", "mt": "Art. 80-96 CPP", "intro": "L'instruction est le cœur de la procédure d'enquête approffondie. Le juge dirige tout, l'OPJ exécute sous sa commission rogatoire.", "sections": [{"t": "Ouverture", "items": ["Par le parquet (plainte, citation, flagrant délit)", "Par plainte directe à la chambre instruction (Art. 83 CPP)", "Demande en instruction immédiate"]}, {"t": "Actes du juge", "items": ["Convocation des témoins, auditions", "Commissions rogatoires aux OPJ", "Mandats (arrêt, dépôt, etc.)"]}], "keys": ["L'instruction = enquête approffondie et contrôlée.", "Le magistrat juge aussi l'opportunité des poursuites.", "À la clôture : ordonnance de renvoi, non-lieu ou ordonnance de classement."]},
{"id": "L33", "em": "🔍", "nm": "Perquisitions — Maîtriser les règles", "mt": "Art. 56-67 CPP", "intro": "La perquisition est l'un des actes les plus sensibles de l'enquête : une erreur de cadre ou d'horaire peut annuler toute la procédure. À l'examen, le jury attend que tu distingues immédiatement flagrance, préliminaire et commission rogatoire.", "sections": [{"t": "Quand perquisitionner ?", "items": ["<b>Flagrance (art. 56 CPP)</b> : à toute heure, dans tout lieu où peuvent se trouver des objets liés à l'infraction.", "<b>Préliminaire (art. 76 CPP)</b> : accord exprès et écrit de la personne, entre 6h et 21h. Sans accord → autorisation du JLD.", "<b>Commission rogatoire (art. 94-96 CPP)</b> : selon les instructions du juge d'instruction."]}, {"t": "Lieux protégés", "items": ["<b>Cabinet d'avocat (art. 56-1)</b> : présence obligatoire du bâtonnier ou son représentant.", "<b>Cabinets médicaux (art. 56-3)</b> : présence obligatoire du président du conseil de l'ordre.", "<b>Rédaction de presse (art. 56-2)</b> : idem, protection de la source journalistique.", "<b>Locaux parlementaires (art. 56-4)</b> : président de l'assemblée informé."]}, {"t": "Déroulement obligatoire", "items": ["1. Notification de la qualité d'OPJ et du cadre d'enquête.", "2. Présence de la personne concernée (ou représentant). Si absente → 2 témoins requis.", "3. PV dressé sur place, signé par les personnes présentes.", "4. Objets saisis : décrits, inventoriés, mis sous scellés immédiatement."]}, {"t": "Pièges d'examen", "items": ["⚠️ En préliminaire de nuit sans accord ni JLD → nullité absolue.", "⚠️ Cabinet avocat sans bâtonnier → nullité, peu importe le cadre.", "⚠️ Saisie d'objets non liés à l'infraction visée → saisie irrégulière.", "⚠️ PV dressé a posteriori (pas sur place) → nullité possible."]}], "keys": ["Flagrance = à toute heure, sans accord.", "Préliminaire = accord écrit ou JLD + horaire 6h-21h.", "Lieux protégés = présence d'un représentant corporatif obligatoire."]},
{"id": "L34", "em": "⚖️", "nm": "Éléments constitutifs — Méthode", "mt": "Droit pénal général", "intro": "À l'examen OPJ, chaque qualification pénale s'analyse en 3 temps : légal, matériel, moral. Cette méthode est attendue dans toutes les copies. Elle structure aussi le CR parquet.", "sections": [{"t": "Les 3 éléments", "items": ["<b>Élément légal :</b> la loi qui incrimine le comportement. Toujours citer l'article. Ex : art. 311-1 CPén pour le vol.", "<b>Élément matériel :</b> l'acte concret réalisé (la soustraction, la violence, la menace…). Décrire précisément ce qui s'est passé.", "<b>Élément moral :</b> l'intention (dolus generalis) ou la faute spéciale (imprudence, mise en danger). Le tribunal doit le retrouver dans le PV."]}, {"t": "Éléments particuliers", "items": ["<b>Aggravantes :</b> à analyser séparément. Chaque aggravante = article + quantum spécifique.", "<b>Tentative (art. 121-5 CPén) :</b> commencement d'exécution + désistement involontaire. Mêmes peines que l'infraction consommée.", "<b>Complicité (art. 121-7 CPén) :</b> aide, assistance ou provocation. Peine identique à l'auteur principal."]}, {"t": "Application en copie", "items": ["Étape 1 : qualifier l'infraction principale.", "Étape 2 : vérifier les 3 éléments avec les faits du cas.", "Étape 3 : identifier les aggravantes pertinentes.", "Étape 4 : vérifier tentative ou complicité si nécessaire.", "Étape 5 : citer l'article exact dans la conclusion."]}], "keys": ["Toujours : légal → matériel → moral.", "L'aggravante change le quantum, pas l'infraction de base.", "La tentative = mêmes peines que le crime/délit consommé."]},
{"id": "L35", "em": "📞", "nm": "Compte rendu au parquet", "mt": "Pratique OPJ", "intro": "Le compte rendu téléphonique au parquet est une épreuve notée à l'examen. Il doit être structuré, précis, bref et se terminer par une demande claire. Le magistrat ne doit jamais avoir à relancer.", "sections": [{"t": "Structure en 5 temps", "items": ["<b>1. Présentation :</b> votre identité, unité, date et heure.", "<b>2. Faits :</b> qui, quoi, où, quand (4W). En 3-4 phrases maximum.", "<b>3. Cadre d'enquête :</b> flagrance, préliminaire ou commission rogatoire.", "<b>4. Qualification :</b> infraction principale + aggravantes + article.", "<b>5. Demande :</b> que souhaitez-vous ? GAV, présentation, saisie, classement…"]}, {"t": "Erreurs à éviter", "items": ["Ne pas qualifier AVANT d'annoncer les faits.", "Ne pas demander des instructions sans avoir posé le cadre.", "Éviter les détails inutiles : le parquet décide vite.", "Toujours conclure par une demande précise et juridiquement fondée."]}, {"t": "Exemple de structure", "items": ["« Colonel X, lieutenant Y, brigade Z. Ce jour à 14h, intervention rue de la Paix pour... [faits]. Nous nous trouvons en enquête de flagrance. Les faits sont qualifiables de vol aggravé (art. 311-4 CPén). Je souhaite placer M. Dupont en garde à vue. »"]}], "keys": ["Structure : présentation > faits > cadre > qualification > demande.", "Une demande claire = notation positive.", "En cas de doute sur la qualification, l'exposer franchement au magistrat."]}];

const LEC={
  render(){
    const el=document.getElementById('lecons-list'); if(!el)return;
    let done={};try{const r=localStorage.getItem('opj_lec');if(r)done=JSON.parse(r);}catch(e){}
    const dc=Object.keys(done).length;
    el.innerHTML=`<div class="sec-hd"><h4>Toutes les leçons</h4><span class="cnt">${dc}/${LECONS.length} vues</span></div>`
    +`<div class="lec-list-v18">`
    +LECONS.map(l=>`<div class="lec-item${done[l.id]?' done':''} au" onclick="LEC.open('${l.id}')">
      <div class="lec-item-em">${l.em||'📚'}</div>
      <div class="lec-item-inf">
        <div class="lec-item-nm">${l.nm}</div>
        <div class="lec-item-mt">${l.mt||''}</div>
        ${done[l.id]?'<div class="lec-item-ok">✓ Leçon vue</div>':''}
      </div>
      <div class="lec-item-arr">›</div>
    </div>`).join('')+'</div>';
  },
  open(id){
    // FIX #2b v21 — mutex : fermer LP si ouvert
    if(typeof LP!=='undefined'&&document.getElementById('lec-ov')?.classList.contains('on')) LP.close();
    const l=LECONS.find(x=>x.id===id); if(!l)return;
    let done={};try{const r=localStorage.getItem('opj_lec');if(r)done=JSON.parse(r);}catch(e){}
    let h=`<span class="bs-pill"></span>
    <div class="bs-hd" style="padding:0;position:relative">
      <button class="bs-close" onclick="LEC.close()" style="position:absolute;top:13px;right:13px">✕</button>
      <div class="lm-hero">
        <span class="lm-em">${l.em||'📚'}</span>
        <div class="lm-nm">${l.nm}</div>
        <div class="lm-mt">${l.mt||''}</div>
        ${(l.chips||[]).length?`<div class="lm-chips">${l.chips.map(c=>`<span class="lm-chip">${c}</span>`).join('')}</div>`:''}
      </div>
    </div>
    <div class="bs-bd">`;
    if(l.intro)h+=`<div class="lm-intro">${l.intro}</div>`;
    const secs=l.secs||l.sections||[];
    secs.forEach(s=>{
      h+=`<div class="lm-sec-t">📌 ${s.t}</div>`;
      (s.items||[]).forEach(it=>h+=`<div class="lm-item">${it}</div>`);
    });
    if(l.keys&&l.keys.length){
      h+=`<div class="lm-keys"><div class="lm-keys-t">⚡ Points clés à retenir</div><div class="lm-keys-c">${l.keys.map(k=>`• ${k}`).join('<br>')}</div></div>`;
    }
    h+=`<div style="padding:14px">
      <button onclick="LEC.markDone('${id}')" style="width:100%;padding:12px;border-radius:13px;border:none;background:linear-gradient(135deg,#D4AF37,#e8c84a 50%,#b8941f);color:#000;font-family:Inter,sans-serif;font-size:13px;font-weight:800;cursor:pointer">
        ${done[id]?'✓ Relire encore':'Marquer comme vue +10 XP'}
      </button>
    </div></div>`;
    const ov=document.getElementById('lec-ov'),bd=document.getElementById('lec-bd');
    if(ov&&bd){bd.innerHTML=h;ov.classList.add('on');document.body.style.overflow='hidden';}
  },
  markDone(id){
    let done={};try{const r=localStorage.getItem('opj_lec');if(r)done=JSON.parse(r);}catch(e){}
    if(!done[id]){done[id]=1;localStorage.setItem('opj_lec',JSON.stringify(done));addXP(10);showToast('+10 XP — Leçon vue !','ok');}
    LEC.close();setTimeout(()=>LEC.render(),100);
  },
  close(){
    const ov=document.getElementById('lec-ov'); if(ov)ov.classList.remove('on');
    document.body.style.overflow='';
  }
};
/* ═══════════════════════════════════════════════════
   LIBERTÉS PUBLIQUES — OPJ ELITE v22.0
   ═══════════════════════════════════════════════════ */



/* ═══ LP — LIBERTÉS PUBLIQUES ═══ */

function lpFilter(btn,src){
  document.querySelectorAll('.lp-src-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.lp-card2').forEach(card=>{
    card.style.display=(src==='all'||card.dataset.src===src)?'block':'none';
  });
}
const LP={

  render(){
    const el=document.getElementById('lp-list');if(!el)return;
    let done={};try{const r=localStorage.getItem('opj_lp');if(r)done=JSON.parse(r);}catch(e){}
    const dc=Object.keys(done).length;
    const pct=LIBERTES_DATA.length?Math.round(dc/LIBERTES_DATA.length*100):0;

    const SOURCE_META={
      'DDHC':{bg:'rgba(245,158,11,.15)',c:'#f59e0b',label:'DDHC 1789',icon:'📜'},
      'CEDH':{bg:'rgba(59,130,246,.15)',c:'#3b82f6',label:'CEDH',icon:'🇪🇺'},
      'CONST':{bg:'rgba(16,185,129,.15)',c:'#10b981',label:'Constitution',icon:'🏛️'},
      'CPP':{bg:'rgba(139,92,246,.15)',c:'#8b5cf6',label:'CPP',icon:'⚖️'},
      'CP':{bg:'rgba(239,68,68,.15)',c:'#ef4444',label:'Code Pénal',icon:'⚡'},
      'CJPM':{bg:'rgba(34,211,238,.15)',c:'#22d3ee',label:'CJPM',icon:'👶'},
    };
    const srcMeta=(ref)=>{
      if(ref.includes('DDHC'))return SOURCE_META['DDHC'];
      if(ref.includes('CEDH'))return SOURCE_META['CEDH'];
      if(ref.includes('Const')||ref.includes('66'))return SOURCE_META['CONST'];
      if(ref.includes('CPP'))return SOURCE_META['CPP'];
      if(ref.includes('CPen')||ref.includes(' CP'))return SOURCE_META['CP'];
      if(ref.includes('CJPM'))return SOURCE_META['CJPM'];
      return SOURCE_META['CPP'];
    };

    /* Grouper par source */
    const groups2={};
    LIBERTES_DATA.forEach(l=>{
      const sm=srcMeta(l.ref);
      const key=sm.label;
      if(!groups2[key])groups2[key]={meta:sm,items:[]};
      groups2[key].items.push(l);
    });

    el.innerHTML=`
    <div class="lp-hero">
      <div class="lp-hero-top">
        <div>
          <div class="lp-hero-title">🏛️ Libertés &amp; Droits fondamentaux</div>
          <div class="lp-hero-sub">${LIBERTES_DATA.length} principes · Examen OPJ</div>
        </div>
        <div class="lp-hero-score">
          <div class="lp-hero-pct">${pct}%</div>
          <div class="lp-hero-pct-l">${dc}/${LIBERTES_DATA.length}</div>
        </div>
      </div>
      <div class="lp-hero-bar"><div class="lp-hero-fill" style="width:${pct}%;background:linear-gradient(90deg,#3b82f6,#d4af37)"></div></div>
    </div>

    <div class="lp-source-tabs" id="lp-source-tabs">
      <button class="lp-src-tab active" onclick="lpFilter(this,'all')">Tout</button>
      ${Object.entries(groups2).map(([k,g])=>`
        <button class="lp-src-tab" onclick="lpFilter(this,'${k}')" style="--sc:${g.meta.c}">
          ${g.meta.icon} ${k}
        </button>`).join('')}
    </div>

    <div class="lp-cards-wrap" id="lp-cards-wrap">
    ${LIBERTES_DATA.map((l,i)=>{
      const isDone=!!done[l.id];
      const sm=srcMeta(l.ref);
      const defPrev=(l.def||'').slice(0,100)+(l.def&&l.def.length>100?'…':'');
      const pts=(l.points||[]).slice(0,2);
      return`<div class="lp-card2${isDone?' done':''}" data-src="${sm.label}" onclick="LP.open('${l.id}')"
              style="animation:fadeUp .18s ${i*0.025}s both;--lc:${sm.c}">
        <div class="lp-card2-head">
          <div class="lp-card2-em">${l.em}</div>
          <div class="lp-card2-badges">
            <span class="lp-src-badge" style="background:${sm.bg};color:${sm.c}">${sm.icon} ${sm.label}</span>
            ${isDone?'<span class="lp-done-badge">✓ Maîtrisée</span>':''}
          </div>
        </div>
        <div class="lp-card2-nm">${l.nm}</div>
        <div class="lp-card2-ref">${l.ref}</div>
        <div class="lp-card2-def">${defPrev}</div>
        ${pts.length?`<ul class="lp-card2-pts">${pts.map(p=>`<li>${p}</li>`).join('')}</ul>`:''}
        ${l.piege?`<div class="lp-card2-piege">⚠️ ${l.piege.slice(0,80)}${l.piege.length>80?'…':''}</div>`:''}
        <div class="lp-card2-footer">
          <span class="lp-card2-cta">${isDone?'Relire':'Apprendre →'}</span>
        </div>
      </div>`;
    }).join('')}
    </div>`;
  },
  open(id){
    // FIX #2 v21 — mutex : fermer LEC si ouvert
    if(typeof LEC!=='undefined'&&document.getElementById('lec-ov')?.classList.contains('on')) LEC.close();
    const l=LIBERTES_DATA.find(x=>x.id===id); if(!l)return;
    let done={};try{const r=localStorage.getItem('opj_lp');if(r)done=JSON.parse(r);}catch(e){}
    let h=`<span class="bs-pill"></span>
    <div class="bs-hd" style="padding:0;position:relative">
      <button class="bs-close" onclick="LP.close()" style="position:absolute;top:13px;right:13px">✕</button>
      <div class="lm-hero">
        <span class="lm-em">${l.em}</span>
        <div class="lm-nm">${l.nm}</div>
        <div class="lm-mt">${l.ref}</div>
      </div>
    </div>
    <div class="bs-bd">
      <div class="lm-intro">${l.def}</div>
      <div class="lm-sec-t">📌 Points essentiels</div>
      ${(l.points||[]).map(p=>`<div class="lm-item">${p}</div>`).join('')}
      ${l.piege?`<div class="fm-piege"><div class="fm-piege-t">⚠️ Piège d'examen</div><div class="fm-piege-c">${l.piege}</div></div>`:''}
      <div style="padding:14px">
        <button onclick="LP.markDone('${id}')" style="width:100%;padding:12px;border-radius:13px;border:none;background:linear-gradient(135deg,#D4AF37,#e8c84a 50%,#b8941f);color:#000;font-family:Inter,sans-serif;font-size:13px;font-weight:800;cursor:pointer">
          ${done[id]?'✓ Relire encore':'Marquer comme maîtrisée +10 XP'}
        </button>
      </div>
    </div>`;
    const ov=document.getElementById('lec-ov'),bd=document.getElementById('lec-bd');
    if(ov&&bd){bd.innerHTML=h;ov.classList.add('on');document.body.style.overflow='hidden';}
  },
  markDone(id){
    let done={};try{const r=localStorage.getItem('opj_lp');if(r)done=JSON.parse(r);}catch(e){}
    if(!done[id]){done[id]=1;localStorage.setItem('opj_lp',JSON.stringify(done));addXP(10);showToast('+10 XP — Liberté maîtrisée !','ok');}
    LP.close();setTimeout(()=>LP.render(),100);
  },
  close(){
    const ov=document.getElementById('lec-ov');if(ov)ov.classList.remove('on');
    document.body.style.overflow='';
  }
};


/* PWA handled by static manifest.json and /sw.js */

/* ═══ PFM — FICHE PROCÉDURE MODAL ═══ */
const PFM={open(id){const f=PB.find(x=>x.id===id);if(!f)return;const rows=Array.isArray(f.tab)?f.tab:[];let h=`<span class="bs-pill"></span><div class="bs-hd"><div class="bs-hd-row"><div style="flex:1"><div style="font-size:11px;color:var(--t3);font-family:'JetBrains Mono',monospace;margin-bottom:3px">${f.ref}</div><div style="font-size:17px;font-weight:900;color:var(--t1)">${f.nm}</div></div><button class="bs-close" onclick="PFM.close()">✕</button></div></div><div class="bs-bd"><div style="font-size:13px;color:var(--t2);line-height:1.65;margin-bottom:14px;padding:11px 13px;background:var(--bg-2);border-radius:10px">${f.def||''}</div>`;rows.forEach(r=>{h+=`<div class="pr-row"><div class="pr-l">${r.l}</div><div class="pr-v">${r.v}</div></div>`;});if(f.piege)h+=`<div class="fm-piege" style="margin-top:14px"><div class="fm-piege-l">⚠ Piège</div><div style="font-size:12px;color:var(--t2);line-height:1.6">${f.piege}</div></div>`;h+=`</div><div class="bs-ft"><button class="btn-prim" onclick="PFM.close()">Fermer</button></div>`;document.getElementById('pf-body').innerHTML=h;document.getElementById('pf-ov').style.display='flex';document.body.style.overflow='hidden';},close(){document.getElementById('pf-ov').style.display='none';document.body.style.overflow='';try{renderProcList();}catch(e){}}};

function renderQDJ(){
  const el=document.getElementById('h-qdj');if(!el)return;
  const today=new Date().toDateString();
  const dayIdx=Math.floor(Date.now()/86400000);
  const qIdx=dayIdx%QB.length;
  const qOrig=QB[qIdx];if(!qOrig)return;

  /* Shuffle déterministe basé sur le jour → même ordre toute la journée */
  const shuffledOpts=seededShuffle(qOrig.opts.map((opt,i)=>({opt,correct:i===qOrig.c})),dayIdx*137+qIdx);
  const q={...qOrig, opts:shuffledOpts.map(p=>p.opt), c:shuffledOpts.findIndex(p=>p.correct)};

  let stored=null;
  try{const raw=localStorage.getItem('opj_qdj');if(raw){const d=JSON.parse(raw);if(d.date===today)stored=d;}}catch(e){}

  /* Map catégorie → fiche */
  const QDJ_FICHE={
    'GAV':'F01','HOMICIDE':'F01','STUPS':'F11','USAGE':'F11','TRAFIC':'F14',
    'VOL':'F05','ESCRO':'F06','ABUS':'F07','RECEL':'F08','EXTORS':'F13',
    'VIOL':'F04','VIOLENCE':'F03','OUTRAGE':'F09','RÉBELLION':'F10',
    'CORRUPTION':'F15','ROUTE':'F12','ALCOOL':'F12','MEURTRE':'F01'
  };
  const qdjFicheId=(()=>{
    const cat=(qOrig.cat||'').toUpperCase();
    for(const [k,v] of Object.entries(QDJ_FICHE)){if(cat.includes(k))return v;}
    return null;
  })();

  if(stored){
    const ok=stored.correct;
    const ficheBtn=qdjFicheId
      ?'<button onclick="openFiche(\''+qdjFicheId+'\')" style="margin-top:10px;width:100%;padding:9px 12px;background:rgba(77,143,255,.1);border:1px solid rgba(77,143,255,.3);border-radius:12px;color:var(--accent-l);font-size:12px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">📖 Voir la fiche infraction</button>'
      :'';
    el.innerHTML=
      '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);margin-bottom:8px">Question du jour</div>'
      +'<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:10px">'+qOrig.q+'</div>'
      +'<div style="background:'+(ok?'rgba(16,185,129,.1)':'rgba(239,68,68,.08)')+';border:1px solid '+(ok?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)')+';border-radius:var(--r-m);padding:10px;font-size:13px">'
      +'<div style="font-weight:800;color:'+(ok?'var(--ok)':'var(--err)')+';margin-bottom:4px">'+(ok?'✅ Bonne réponse !':'❌ Mauvaise réponse')+'</div>'
      +'<div style="color:var(--t2)">Réponse correcte : <strong>'+qOrig.opts[qOrig.c]+'</strong></div>'
      +'</div>'
      +ficheBtn;
    return;
  }

  const letters=['A','B','C','D'];
  let opts='';
  q.opts.forEach((v,i)=>{
    opts+='<button onclick="answerQDJ('+i+')" style="width:100%;text-align:left;padding:10px 12px;background:var(--bg-2);border:1.5px solid var(--brd);border-radius:var(--r-m);color:var(--t2);font-size:13px;cursor:pointer;font-family:Inter,sans-serif;display:flex;gap:8px;align-items:center;margin-bottom:6px">'
          +'<span style="font-weight:800;color:var(--accent-l);width:16px;flex-shrink:0">'+letters[i]+'</span>'+eh(v)+'</button>';
  });
  el.innerHTML=
    '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--gold);margin-bottom:8px">Question du jour · <span style="color:var(--t3);font-weight:400">'+(qOrig.ref||'')+'</span></div>'
    +'<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:12px">'+qOrig.q+'</div>'
    +'<div>'+opts+'</div>';
}
function answerQDJ(answer){
  const dayIdx=Math.floor(Date.now()/86400000);
  const qOrig=QB[dayIdx%QB.length];if(!qOrig)return;
  /* Reconstituer le shuffle du jour */
  const shuffledOpts=seededShuffle(qOrig.opts.map((opt,i)=>({opt,correct:i===qOrig.c})),dayIdx*137+(dayIdx%QB.length));
  const shuffledC=shuffledOpts.findIndex(p=>p.correct);
  /* Accepter int (new) ou lettre A/B/C/D (legacy) */
  const i=typeof answer==='number'?answer:(answer.charCodeAt(0)-65);
  const ok=i===shuffledC;
  const today=new Date().toDateString();
  try{localStorage.setItem('opj_qdj',JSON.stringify({date:today,correct:ok,answer:i}));}catch(e){}
  if(ok){addXP(20);S.tq++;S.dq++;S.tcDone++;S.dcDone++;save();showToast('+20 XP — Question du jour !','ok');}
  else{S.tq++;S.dq++;save();}
  renderQDJ();
}

const EVAL_CRITS=["J'ai correctement qualifié pénalement les faits","J'ai identifié le bon cadre d'enquête","J'ai mentionné les éléments constitutifs","J'ai structuré le CR chronologiquement","J'ai utilisé le vocabulaire procédural exact","J'ai formulé une demande claire au procureur","J'ai mentionné les droits applicables","J'ai été concis et précis"];
const EVAL={answers:{},show(){this.answers={};document.getElementById('eval-result').style.display='none';document.getElementById('eval-list').innerHTML=EVAL_CRITS.map((t,i)=>`<div class="eval-crit"><div class="eval-crit-txt">${i+1}. ${t}</div><div class="eval-btns"><button class="eval-btn" id="ev-${i}-oui" onclick="EVAL.set(${i},true)">Oui</button><button class="eval-btn" id="ev-${i}-non" onclick="EVAL.set(${i},false)">Non</button></div></div>`).join('');document.getElementById('eval-ov').classList.add('a');document.body.style.overflow='hidden';},set(i,v){this.answers[i]=v;document.getElementById('ev-'+i+'-oui').className='eval-btn'+(v?' oui':'');document.getElementById('ev-'+i+'-non').className='eval-btn'+(!v?' non':'');},calc(){const total=EVAL_CRITS.length,ok=Object.values(this.answers).filter(v=>v).length;if(Object.keys(this.answers).length<total){showToast('Répondez à tous les critères','err');return;}const r=document.getElementById('eval-result');let msg,col;if(ok>=7){msg='✅ Excellent — Niveau examen atteint';col='var(--ok)';}else if(ok>=5){msg='🟧 Bien — Continuez à vous entraîner';col='var(--warn)';}else{msg='🔴 À retravailler';col='var(--err)';}r.style.display='block';r.innerHTML=`<div style="font-size:22px;font-weight:900;color:${col};margin-bottom:4px">${ok}/8</div><div style="font-size:14px;font-weight:700;color:${col}">${msg}</div>`;addXP(ok*5);showToast(`CR évalué : ${ok}/8 (+${ok*5} XP)`,'ok');},close(){document.getElementById('eval-ov').classList.remove('a');document.body.style.overflow='';}};

/* DOMContentLoaded vestige supprimé v30 */

/* ═══ C — CARTOUCHES ═══ */
const C={cur:null,
  start(t){C.cur=t;const tpl=CT[t];document.getElementById('cm').style.display='none';document.getElementById('ct').style.display='none';document.getElementById('ca').style.display='block';document.getElementById('ca-bg').textContent=t.toUpperCase();document.getElementById('ca-ti').textContent=tpl.ti;document.getElementById('ca-st').textContent=tpl.st;document.getElementById('ca-r').style.display='none';window.scrollTo({top:0,behavior:'instant'});document.getElementById('ca-f').innerHTML=tpl.fs.map(f=>`<div class="mb12"><div class="ct-l">${f.l}${f.r?' <span style="color:var(--err)">*</span>':''}</div>${f.t==='ta'?`<textarea class="ct-i" id="${f.id}" rows="3" placeholder="${f.h||''}"></textarea>`:f.t==='dt'?`<input type="datetime-local" class="ct-i" id="${f.id}">`:`<input type="text" class="ct-i" id="${f.id}" placeholder="${f.h||''}">`}</div>`).join('')},
  validate(){const tpl=CT[C.cur];let ok=true,f=0,t=0;tpl.fs.forEach(x=>{const el=document.getElementById(x.id);if(x.r){t++;if(!el.value.trim()){el.classList.add('err');el.classList.remove('val');ok=false}else{el.classList.remove('err');el.classList.add('val');f++}}});const r=document.getElementById('ca-r');r.style.display='block';r.scrollIntoView({behavior:'smooth'});if(ok){S.cv++;addXP(25);save();r.innerHTML=`<div class="cd" style="border-color:var(--ok)"><div class="ex-h ex-ok">✓ Cartouche validée — ${f}/${t} champs</div><div class="ex-t">+25 XP</div></div>`}else r.innerHTML=`<div class="cd" style="border-color:var(--err)"><div class="ex-h ex-ko">✗ Incomplète — ${f}/${t} champs</div></div>`},
  timeline(){document.getElementById('cm').style.display='none';document.getElementById('ca').style.display='none';document.getElementById('ct').style.display='block';window.scrollTo({top:0,behavior:'instant'});const n=new Date();n.setMinutes(n.getMinutes()-n.getTimezoneOffset());document.getElementById('tl-start').value=n.toISOString().slice(0,16)},
  genTL(){const s=document.getElementById('tl-start').value,r=document.getElementById('tl-reg').value;if(!s){showToast('Saisissez une heure','ko');return}const st=new Date(s),evs=[],fmt=d=>d.toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}),add=(d,h)=>new Date(d.getTime()+h*36e5);evs.push({t:fmt(st),e:"Début GAV — Appréhension",a:0});evs.push({t:fmt(st),e:"Notification IMMÉDIATE des droits (art. 63-1)",a:1});evs.push({t:fmt(st),e:"Avis IMMÉDIAT au PR (art. 63 al.2)",a:1});evs.push({t:fmt(st),e:"Avocat SANS délai (loi 22/04/2024)",a:1});evs.push({t:fmt(add(st,24)),e:"Fin 24h — Prolongation possible (PR écrite et motivée)",a:1});if(r!=='dc'){evs.push({t:fmt(add(st,48)),e:"Fin 48h — JLD obligatoire (art. 706-88)",a:1});evs.push({t:fmt(add(st,72)),e:"Fin 72h — 4ème période si autorisée JLD",a:1});evs.push({t:fmt(add(st,96)),e:"FIN MAXIMALE 96h (criminalité organisée)",a:1})}else evs.push({t:fmt(add(st,48)),e:"FIN MAXIMALE 48h (droit commun)",a:1});if(r==='terr'){evs.push({t:fmt(add(st,120)),e:"120h — 5ème période (art. 706-88-1)",a:1});evs.push({t:fmt(add(st,144)),e:"FIN MAXIMALE ABSOLUE 144h (terrorisme)",a:1})}document.getElementById('tl-out').innerHTML=`<div class="st">${r==='dc'?'Droit commun':r==='co'?'Criminalité organisée':'Terrorisme'}</div><div class="tl">${evs.map(e=>`<div class="tl-i${e.a?' al':''}"><div class="tl-dot"></div><div class="tl-time">${e.t}</div><div class="tl-ev">${e.e}</div></div>`).join('')}</div>`},
  back(){document.getElementById('cm').style.display='block';document.getElementById('ca').style.display='none';document.getElementById('ct').style.display='none';window.scrollTo({top:0,behavior:'instant'})}
};

const P={showPro(){document.getElementById('pro-modal-ov').classList.add('a');document.body.style.overflow='hidden';},hidePro(){document.getElementById('pro-modal-ov').classList.remove('a');document.body.style.overflow='';},buy(){P.hidePro();document.getElementById('pay-modal-ov').classList.add('a');document.body.style.overflow='hidden';},hidePay(){document.getElementById('pay-modal-ov').classList.remove('a');document.body.style.overflow='';},selectPlan(plan){document.querySelectorAll('.pay-plan').forEach(el=>el.classList.remove('sel'));document.getElementById('pay-plan-'+plan).classList.add('sel');P._selectedPlan=plan;},confirmPay(){const email=document.getElementById('pay-email').value.trim();if(!email||!email.includes('@')){showToast('Entrez un email valide','err');return;}showToast('Validation PRO côté serveur requise','warn');P.hidePay();},restoreAccess(){showToast('Restauration locale PRO désactivée','warn');}};
;

/* ═══ ANNALES RENDERER ═══ */
function renderAnnalesList(){
  const el=document.getElementById('annales-list');if(!el)return;
  if(typeof ANNALES==='undefined'||!ANNALES.length){
    el.innerHTML='<div class="empty-state"><span class="empty-state-em">📝</span>Aucune annale disponible</div>';return;
  }
  const annDone=S.annalesDone||{};
  const doneCount=Object.keys(annDone).length;
  const matColors={
    'Procédure pénale':{c:'#3b82f6',bg:'rgba(59,130,246,.12)',em:'⚖️'},
    'Droit pénal':{c:'#a855f7',bg:'rgba(168,85,247,.12)',em:'📖'},
    'Rédaction':{c:'#10b981',bg:'rgba(16,185,129,.12)',em:'✍️'},
  };
  const COEFF_COLORS=['','#10b981','#f59e0b','#ef4444'];

  el.innerHTML=`
  <div class="ann-stats-row">
    <div class="ann-stat"><div class="ann-stat-v">${ANNALES.length}</div><div class="ann-stat-l">Sujets</div></div>
    <div class="ann-stat"><div class="ann-stat-v">${doneCount}</div><div class="ann-stat-l">Traités</div></div>
    <div class="ann-stat"><div class="ann-stat-v">${ANNALES.length>0?Math.round(doneCount/ANNALES.length*100):0}%</div><div class="ann-stat-l">Couverture</div></div>
  </div>
  ${ANNALES.map((a,i)=>{
    const done=!!annDone[a.id];
    const mat=matColors[a.matiere]||{c:'#3b82f6',bg:'rgba(59,130,246,.12)',em:'📝'};
    const coeff=Math.min(a.coeff||1,3);
    return`<div class="ann-card${done?' done':''}" onclick="openAnnale('${a.id}')" style="animation:fadeUp .15s ${i*0.04}s both;--ac:${mat.c}">
      <div class="ann-card-left" style="background:${mat.bg}">
        <div class="ann-card-em">${mat.em}</div>
      </div>
      <div class="ann-card-body">
        <div class="ann-card-top">
          <span class="ann-mat-badge" style="background:${mat.bg};color:${mat.c}">${a.matiere||'—'}</span>
          ${done?`<span class="ann-done-badge">✓ Traité</span>`:''}
          ${a.coeff?`<span class="ann-coeff" style="color:${COEFF_COLORS[coeff]||'var(--t3)'}">Coeff ${a.coeff}</span>`:''}
        </div>
        <div class="ann-card-title">${a.titre}</div>
        <div class="ann-card-meta">
          ${a.duree?`<span>⏱ ${a.duree}</span>`:''}
          ${(a.motscles||[]).slice(0,2).map(m=>`<span class="ann-kw">${m}</span>`).join('')}
        </div>
      </div>
      <div class="ann-card-arr">›</div>
    </div>`;
  }).join('')}`;
}


function openAnnale(id){
  const a=ANNALES.find(x=>x.id===id);
  if(!a)return;
  const ov=document.getElementById('ann-ov');
  const body=document.getElementById('ann-body');
  if(!ov||!body)return;

  // Marquer comme fait
  if(!S.annalesDone)S.annalesDone={};
  S.annalesDone[a.id]=true;
  save();

  let html=`<div style="margin-bottom:16px">
    <div style="font-size:11px;font-weight:700;color:var(--accent-l);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">${a.matiere||'Annale'}</div>
    <h3 style="font-size:19px;font-weight:900;color:var(--t1);margin-bottom:4px">${a.titre}</h3>
    ${a.duree?`<div style="font-size:12px;color:var(--t3);font-family:var(--fm,monospace)">${a.duree}</div>`:''}
  </div>`;

  if(a.contexte){
    html+=`<div style="background:rgba(77,143,255,.07);border-left:3px solid var(--accent-l);border-radius:0 10px 10px 0;padding:11px 13px;margin-bottom:14px;font-size:13px;color:var(--t2);line-height:1.7">${a.contexte}</div>`;
  }

  if(Array.isArray(a.questions)){
    html+=`<div style="font-size:10px;font-weight:900;color:var(--gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;margin-top:4px">QUESTIONS</div>`;
    html+=a.questions.map((q,i)=>{
      let qhtml=`<div style="background:var(--bg-2);border:1px solid rgba(77,143,255,.1);border-radius:12px;padding:13px 14px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:800;color:var(--accent-l);margin-bottom:6px">Question ${i+1}${q.pts?' ('+q.pts+')':''}</div>
        <div style="font-size:13px;color:var(--t1);line-height:1.65;margin-bottom:8px">${q.q}</div>`;
      if(q.corrige){
        qhtml+=`<details style="margin-top:8px"><summary style="font-size:11px;font-weight:700;color:var(--ok);cursor:pointer">Voir le corrigé</summary>
          <div style="font-size:12.5px;color:var(--t2);line-height:1.7;margin-top:8px;padding-top:8px;border-top:1px solid rgba(77,143,255,.1)">${q.corrige}</div>
        </details>`;
      }
      qhtml+=`</div>`;
      return qhtml;
    }).join('');
  }

  if(a.corrige_global){
    html+=`<div style="font-size:10px;font-weight:900;color:var(--ok);text-transform:uppercase;letter-spacing:.1em;margin:14px 0 8px">CORRIGÉ COMPLET</div>
      <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:13px 14px;font-size:13px;color:var(--t2);line-height:1.7">${a.corrige_global}</div>`;
  }

  body.innerHTML=html;
  ov.style.display='flex';
  ov.scrollTop=0;
}

function closeAnnale(){
  const ov=document.getElementById('ann-ov');
  if(ov)ov.style.display='none';
  renderAnnalesList();
}

/* ═══ v25 — see third script block for patches ═══ */


/* ─── PRINT SHEETS ─── */
const PRINT_SHEETS=[
  {id:'ps1',title:'Classification tripartite & Tentative',emoji:'📊',sub:'Art. 111-1 CP · Art. 121-5 CP'},
  {id:'ps2',title:'GAV — Tous régimes comparés',emoji:'🔒',sub:'Art. 63, 706-88, 706-88-1 CPP'},
  {id:'ps3',title:'Cadres d\'enquête & Perquisitions',emoji:'🔍',sub:'Art. 53, 75, 151, 56, 76 CPP'},
  {id:'ps4',title:'Infractions principales — Méthode LAME',emoji:'⚖️',sub:'Homicide · Vol · Viol · Stups · Escroquerie'},
  {id:'ps5',title:'Mandats, CJ, ARSE, Détention provisoire',emoji:'⛓️',sub:'Art. 122-143 CPP'},
  {id:'pv1',title:'Canevas PV — Plainte & Témoignage',emoji:'📝',sub:'Art. 53 et s. CPP · Art. 10-2 CPP'},
  {id:'pv2',title:'Canevas PV — Interpellation + GAV',emoji:'🚔',sub:'Art. 63-1 à 63-4-3 CPP · Loi 22/04/2024'},
  {id:'pv3',title:'Canevas PV — Perquisition & Fouilles',emoji:'🔍',sub:'Art. 56/76 CPP · SDIACSS'},
  {id:'art1',title:'Ligne du Temps — ALPHA (20 actes FD)',emoji:'⏱️',sub:'Vol · Flagrant Délit complet'},
  {id:'lame',title:'Méthode LAME — Fiche Mémo Infraction',emoji:'⚖️',sub:'Légal · Actuel · Moral · Énrôlement'},
  {id:'bloc1',title:'Libertés Publiques & Acteurs PJ',emoji:'🏛️',sub:'DDHC 1789 · Art. 40 CPP · Acteurs PJ'},
  {id:'bloc2',title:'Fichiers Police & Réquisitions',emoji:'🗃️',sub:'TAJ · FNAEG · FAED · Art. 60/77-1 CPP'},
];
const PRINT_CONTENT={
ps1:`<h1>📊 Classification tripartite & Tentative</h1>
<h2>Tripartition des infractions (Art. 111-1 CP)</h2>
<table><tr><th>Nature</th><th>Peine</th><th>Juridiction</th><th>Prescription AP</th></tr>
<tr><td>CRIME</td><td>Réclusion criminelle / Perpétuité</td><td>Cour d'Assises</td><td>20 ans</td></tr>
<tr><td>DÉLIT</td><td>Emprisonnement + amende</td><td>Tribunal Correctionnel</td><td>6 ans</td></tr>
<tr><td>CONTRAVENTION</td><td>Amende ≤ 1 500 €</td><td>Tribunal de Police</td><td>1 an</td></tr></table>
<h2>Tentative (Art. 121-5 CP)</h2>
<p>Conditions : <strong>commencement d'exécution</strong> + <strong>désistement involontaire</strong></p>
<p>Crime → toujours punissable. Délit → si texte exprès. Contravention → JAMAIS.</p>
<div class="piege-box">⚠️ Piège : La tentative de contravention N'EST PAS punissable. La tentative d'un délit doit être expressément prévue par le texte.</div>
<h2>Récidive légale (Art. 132-8 CP)</h2>
<table><tr><th>Type</th><th>Délai</th><th>Effet</th></tr>
<tr><td>Crime / Crime</td><td>Perpétuel</td><td>Doublement de la peine max</td></tr>
<tr><td>Délit / Délit assimilé</td><td>5 ans</td><td>Doublement de la peine max</td></tr>
<tr><td>Contravention 5e classe</td><td>1 an</td><td>Alourdissement</td></tr></table>`,

ps2:`<h1>🔒 GAV — Tous régimes</h1>
<table><tr><th>Régime</th><th>Initiale</th><th>Max total</th><th>Prolongation</th></tr>
<tr><td>Droit commun (art. 63)</td><td>24h</td><td>48h</td><td>PR — écrit + motivé</td></tr>
<tr><td>Criminalité organisée (706-88)</td><td>24h</td><td>96h</td><td>PR puis JLD (>48h)</td></tr>
<tr><td>Terrorisme (706-88-1)</td><td>24h</td><td>144h</td><td>PR puis JLD (>48h)</td></tr>
<tr><td>Mineur 13-16 ans</td><td>24h</td><td>48h max</td><td>PR (ou JLD si CO)</td></tr></table>
<h2>Droits notifiés IMMÉDIATEMENT (Art. 63-1 CPP)</h2>
<p>Droit au silence · Avocat SANS délai (loi 22/04/2024) · Examen médical · Aviser un proche · Interprète</p>
<div class="piege-box">⚠️ Pièges : (1) Heure de GAV = heure d'APPRÉHENSION, pas d'arrivée au commissariat. (2) Délai de carence avocat SUPPRIMÉ depuis le 22/04/2024. (3) Avis PR = IMMÉDIAT. (4) Mineur <16 ans : examen médical OBLIGATOIRE ET IMMÉDIAT.</div>`,

ps3:`<h1>🔍 Cadres d'enquête & Perquisitions</h1>
<h2>Les 5 cadres d'enquête</h2>
<table><tr><th>Cadre</th><th>Article</th><th>Durée</th><th>Pouvoirs</th></tr>
<tr><td>Flagrance</td><td>Art. 53 CPP</td><td>8j + 8j (JLD)</td><td>Contrainte immédiate</td></tr>
<tr><td>Préliminaire</td><td>Art. 75 CPP</td><td>2 ans + 1 an</td><td>Consentement ou JLD</td></tr>
<tr><td>Commission rogatoire</td><td>Art. 151 CPP</td><td>Limitée par CR</td><td>Identiques à flagrance</td></tr>
<tr><td>Art. 74 (mort suspecte)</td><td>Art. 74 CPP</td><td>—</td><td>Avant qualification pénale</td></tr>
<tr><td>Art. 74-1 (disparition)</td><td>Art. 74-1 CPP</td><td>—</td><td>3 critères cumulatifs</td></tr></table>
<h2>Règles de perquisition</h2>
<table><tr><th>Cadre</th><th>Accord requis</th><th>Horaires</th><th>Particularités</th></tr>
<tr><td>Flagrance</td><td>NON</td><td>24h/24</td><td>Art. 56 CPP</td></tr>
<tr><td>Préliminaire</td><td>OUI (écrit) ou JLD</td><td>6h–21h</td><td>Art. 76 CPP</td></tr>
<tr><td>CR</td><td>NON</td><td>24h/24</td><td>Art. 94-96 CPP</td></tr></table>
<p><strong>Lieux protégés :</strong> Avocat → bâtonnier OBLIGATOIRE | Médecin → président ordre | Presse → magistrat</p>`,

ps4:`<h1>⚖️ Infractions principales — Méthode LAME</h1>
<table><tr><th>Infraction</th><th>Article</th><th>Qual.</th><th>Peine de base</th><th>Élément moral</th></tr>
<tr><td>MEURTRE</td><td>221-1 CP</td><td>Crime</td><td>30 ans RC</td><td>Intention de tuer (animus necandi)</td></tr>
<tr><td>ASSASSINAT</td><td>221-3 CP</td><td>Crime</td><td>Perpétuité</td><td>Préméditation + intention de tuer</td></tr>
<tr><td>VIOL</td><td>222-23 CP</td><td>Crime</td><td>15 ans RC</td><td>Intentionnel, sans consentement</td></tr>
<tr><td>VOL SIMPLE</td><td>311-1 CP</td><td>Délit</td><td>3 ans / 45k€</td><td>Intention de se comporter en propriétaire</td></tr>
<tr><td>VOL BANDE ORG.</td><td>311-9 CP</td><td>Crime</td><td>15 ans RC</td><td>Intentionnel + organisation</td></tr>
<tr><td>ESCROQUERIE</td><td>313-1 CP</td><td>Délit</td><td>5 ans / 375k€</td><td>Tromperie → remise</td></tr>
<tr><td>ABUS DE CONFIANCE</td><td>314-1 CP</td><td>Délit</td><td>3 ans / 375k€</td><td>Remise préalable licite + détournement</td></tr>
<tr><td>RECEL</td><td>321-1 CP</td><td>Délit</td><td>5 ans / 375k€</td><td>Connaissance origine frauduleuse</td></tr>
<tr><td>USAGE STUPS</td><td>L3421-1 CSP</td><td>Délit</td><td>1 an / 3 750€</td><td>Intentionnel</td></tr>
<tr><td>BLANCHIMENT</td><td>324-1 CP</td><td>Délit</td><td>5 ans / 375k€</td><td>Connaissance origine criminelle</td></tr></table>`,

ps5:`<h1>⛓️ Mandats, CJ, ARSE, Détention Provisoire</h1>
<h2>Les 4 mandats + mandat de recherche</h2>
<table><tr><th>Mandat</th><th>Article</th><th>Auteur</th><th>Effet</th></tr>
<tr><td>Comparution</td><td>122 al.1 CPP</td><td>JI</td><td>Se présenter volontairement</td></tr>
<tr><td>Amener</td><td>122 al.2 CPP</td><td>JI</td><td>Conduire de force — pas d'incarcération</td></tr>
<tr><td>Dépôt</td><td>122 al.3 CPP</td><td>JI</td><td>Incarcération immédiate</td></tr>
<tr><td>Arrêt</td><td>131 CPP</td><td>JI</td><td>Fugitifs/étranger — arrestation + prison</td></tr>
<tr><td>Recherche</td><td>122-4 CPP</td><td>PR</td><td>Interpellation — délits ≥3 ans — 1 an renouv.</td></tr></table>
<h2>Tableau comparatif CJ / ARSE / DP</h2>
<table><tr><th>Mesure</th><th>Article</th><th>Seuil peine</th><th>Décideur</th><th>Durée</th></tr>
<tr><td>Contrôle Judiciaire</td><td>138 CPP</td><td>Tout emprisonnement</td><td>JLD</td><td>Sans limite légale</td></tr>
<tr><td>ARSE</td><td>142-5 CPP</td><td>≥ 2 ans</td><td>JLD</td><td>Même régime DP</td></tr>
<tr><td>Détention Provisoire</td><td>143-1 CPP</td><td>≥ 3 ans</td><td>JLD</td><td>4 mois → 2 ans max (correctionnel)</td></tr></table>
<div class="piege-box">⚠️ Piège fondamental : Le JI seul NE PEUT JAMAIS décider la DP. C'est TOUJOURS le JLD, saisi par ordonnance du JI avec réquisitions du PR.</div>`,
pv1:`<h1>📝 Canevas PV — Plainte &amp; Témoignage</h1>
<h2>SAISINE — PLAINTE (Art. 53 et s. CPP · Art. 10-2 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">Structure du cartouche plainte</div>
<table>
<tr><th>Rubrique</th><th>Contenu obligatoire</th></tr>
<tr><td><strong>En-tête</strong></td><td>Étant au service — date, heure, lieu de rédaction</td></tr>
<tr><td><strong>Saisine</strong></td><td>Constatons que se présente NOM Prénom victime du fait de [infraction]</td></tr>
<tr><td><strong>Cadre juridique</strong></td><td>Agissant en flagrant délit — Vu les articles 53 et s. CPP</td></tr>
<tr><td><strong>Droits Art. 10-2</strong></td><td>Information des droits de la victime — Formulaire remis</td></tr>
<tr><td><strong>Identité victime</strong></td><td>NOM, prénom, DOB, lieu naissance, adresse, nationalité, profession</td></tr>
<tr><td><strong>Déclaration des faits</strong></td><td>Description précise, préjudice, capacité à reconnaître l'auteur</td></tr>
<tr><td><strong>Avis Parquet</strong></td><td>Avisons immédiatement M. le Procureur de la République (Art. 40 CPP)</td></tr>
<tr><td><strong>Clôture</strong></td><td>Plainte contre X ou personne dénommée — Récépissé remis de droit</td></tr>
<tr><td><strong>Signature</strong></td><td>Après lecture, NOM Prénom signe avec nous le présent PV</td></tr>
</table></div>
<h2>SAISINE — TÉMOIGNAGE (Art. 53 et s. CPP)</h2>
<table>
<tr><th>Élément</th><th>Formule type</th></tr>
<tr><td>Saisine</td><td>Sommes requis par [identité] qui déclare avoir été témoin de [fait]</td></tr>
<tr><td>Cadre</td><td>Agissant en flagrant délit — Vu les articles 53 et s. CPP</td></tr>
<tr><td>Identité</td><td>L'invitons à nous décliner son identité : NOM Prénom, DOB, adresse</td></tr>
<tr><td>Q/R</td><td>QUESTION : … / RÉPONSE : … (autant que nécessaire)</td></tr>
<tr><td>Signature</td><td>Après lecture, signe avec nous le présent PV</td></tr>
</table>
<h2>SAISINE — TRANSPORT / CONSTATATIONS</h2>
<table>
<tr><th>Étape</th><th>Formule type</th></tr>
<tr><td>Départ</td><td>Étant au service — Sommes requis par [mode saisine] du fait de [infraction]</td></tr>
<tr><td>SDPTS</td><td>Sollicitons le SDPTS aux fins de relevé de traces ou indices</td></tr>
<tr><td>Transport</td><td>Assisté des GP … nous transportons à [adresse] — Où étant à [heure]</td></tr>
<tr><td>Constatations</td><td><strong>En présence constante et effective du SDPTS</strong> — constatons extérieur, progression, éléments</td></tr>
<tr><td>Résultat PTS</td><td>Le SDPTS indique n'avoir relevé aucune trace / ou description des traces</td></tr>
<tr><td>Clôture</td><td>Dont PV que nos assistants signent avec nous</td></tr>
</table>
<div class="ok"><strong>✓ Avis Parquet obligatoire :</strong> Art. 40 CPP — dès la constatation d'un crime ou délit. Le récépissé est de droit à la demande de la victime (Art. 10-2 CPP).</div>
<div class="piege"><strong>⚠️ Pièges :</strong> Toujours mentionner la <u>présence constante et effective</u> du SDPTS. L'heure de GAV = heure d'appréhension, jamais l'heure d'arrivée au service.</div>`,
pv2:`<h1>🚔 Canevas PV — Interpellation &amp; Garde à Vue</h1>
<h2>INTERPELLATION (Art. 53 et s. CPP · Art. 803 CPP)</h2>
<table>
<tr><th>Étape</th><th>Formule obligatoire</th><th>Article</th></tr>
<tr><td>Constat</td><td>Constatons [fait + signalement] — Agissant en flagrant délit</td><td>Art. 53 CPP</td></tr>
<tr><td>Interpellation</td><td>Interpellons l'individu à [heure] au [lieu]</td><td>Art. 53 CPP</td></tr>
<tr><td>Menottage</td><td>Conformément à l'Art. 803 CPP — Menottons car [justification : fuite/danger/résistance]</td><td>Art. 803 CPP</td></tr>
<tr><td>Palpation</td><td>Palpé par mesure de sécurité par le GP : positif [objet] / négatif</td><td>Mesure sécurité</td></tr>
<tr><td>Identité</td><td>L'invitons à nous décliner son identité : il nous déclare se nommer…</td><td>—</td></tr>
<tr><td>Notification verbale GAV</td><td>L'informons qu'il est placé en GAV à compter de [heure] d'interpellation pour [qualification]</td><td>Art. 63-1 CPP</td></tr>
<tr><td>Droits verbaux</td><td>L'informons immédiatement de ses droits Art. 63-1 à 63-4-3 — PV séparé à suivre</td><td>Art. 63-1 à 63-4-3</td></tr>
</table>
<h2>NOTIFICATION PLACEMENT EN GAV — MAJEUR (Art. 63-1 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">Éléments obligatoires du cartouche GAV</div>
<ul>
<li><strong>À compter du</strong> [date] à [heure] de l'interpellation</li>
<li><strong>Pour les faits</strong> de [qualification] commis le [date] à [ville]</li>
<li><strong>Motif du [1° à 6°] de l'Art. 62-2 CPP</strong> — la GAV est l'unique moyen de…</li>
<li><strong>Durée maximale :</strong> 24H + 24H possible sur accord du Parquet</li>
<li>Notification droits : silence, interprète, avis proche/avocat/autorités consulaires, médecin, pièces, observations</li>
<li>Remise du <strong>formulaire de déclaration des droits</strong></li>
</ul></div>
<h2>LES 6 OBJECTIFS DE LA GAV (Art. 62-2 CPP)</h2>
<table>
<tr><th>N°</th><th>Objectif — La GAV doit être l'UNIQUE moyen de…</th></tr>
<tr><td>1°</td><td>Permettre les investigations impliquant la présence/participation de la personne</td></tr>
<tr><td>2°</td><td>Garantir la présentation devant le Procureur de la République</td></tr>
<tr><td>3°</td><td>Empêcher la modification des preuves ou indices matériels</td></tr>
<tr><td>4°</td><td>Empêcher les pressions sur témoins, victimes, proches</td></tr>
<tr><td>5°</td><td>Empêcher la concertation avec coauteurs ou complices</td></tr>
<tr><td>6°</td><td>Garantir la mise en œuvre des mesures pour faire cesser le crime/délit</td></tr>
</table>
<h2>DROITS EN GAV (Art. 63-1 à 63-4-3 CPP)</h2>
<table>
<tr><th>Droit</th><th>Article</th><th>Délai / Note</th></tr>
<tr><td>Droit au silence</td><td>Art. 63-1</td><td>Immédiat — pas d'obligation de répondre</td></tr>
<tr><td>Interprète gratuit</td><td>Art. 63-1</td><td>Immédiat si ne comprend pas le français</td></tr>
<tr><td>Avis proche/employeur</td><td>Art. 63-2</td><td>Dès la 1ère heure — sans délai</td></tr>
<tr><td>Avocat + entretien 30 min</td><td>Art. 63-3-1</td><td><strong>Sans délai de carence — Loi 22/04/2024</strong></td></tr>
<tr><td>Médecin</td><td>Art. 63-3</td><td>À tout moment</td></tr>
<tr><td>Consulter pièces</td><td>Art. 63-4-1</td><td>À tout moment</td></tr>
<tr><td>Présenter observations</td><td>Art. 63-4-2</td><td>Au magistrat</td></tr>
</table>
<h2>DURÉES DE GAV</h2>
<table>
<tr><th>Profil</th><th>Initiale</th><th>Prolongation</th><th>CDO (Art. 706-88)</th></tr>
<tr><td>Majeur droit commun</td><td>24H</td><td>+24H (accord Parquet)</td><td>+48H +48H</td></tr>
<tr><td>Mineur 13-16 ans</td><td>24H</td><td>+24H séparé majeurs</td><td>Régime CJPM</td></tr>
<tr><td>Mineur 16-18 ans</td><td>24H</td><td>+24H séparé majeurs</td><td>Régime CJPM</td></tr>
<tr><td>Retenue 10-13 ans</td><td>12H</td><td>—</td><td>Infraction ≥ 5 ans emp.</td></tr>
</table>
<div class="warn"><strong>⚡ Loi 22 avril 2024 :</strong> Délai de carence avocat <strong>supprimé</strong>. L'avocat intervient dès le début de la GAV.</div>
<div class="piege"><strong>⚠️ Pièges :</strong> (1) Seul l'OPJ peut placer en GAV. (2) La GAV doit être l'<u>unique</u> moyen. (3) Heure GAV = heure interpellation, pas d'arrivée au service.</div>`,
pv3:`<h1>🔍 Canevas PV — Perquisition &amp; Fouilles</h1>
<h2>PERQUISITION — FLAGRANT DÉLIT (Art. 56 CPP)</h2>
<table>
<tr><th>Étape</th><th>Formule type</th></tr>
<tr><td>Transport</td><td>Muni des clés extraites de sa fouille — En compagnie du nommé, nous transportons à [adresse]</td></tr>
<tr><td>Constat extérieur</td><td>Constatons qu'il s'agit de [description extérieure des lieux]</td></tr>
<tr><td>Entrée</td><td>À [heure], à l'aide des clés, pénétrons dans les lieux</td></tr>
<tr><td>Perquisition</td><td><strong>En la présence constante et effective</strong> du nommé — procédons à minutieuse perquisition — Description des pièces</td></tr>
<tr><td>Découverte</td><td>Dans [localisation], sous/sur [meuble], découvrons [élément] — Description précise</td></tr>
<tr><td>Interrogation</td><td>Interpellé sur l'origine, le nommé nous déclare :</td></tr>
<tr><td>Saisie</td><td>Saisissons et plaçons sous <strong>scellé n° UN</strong> : [description complète]</td></tr>
<tr><td>Fin</td><td>Perquisition terminée à [heure] sans incident — aucun autre élément</td></tr>
<tr><td>Clôture</td><td>Refermons les lieux — Clés replaçons dans les effets du nommé</td></tr>
<tr><td>Signature</td><td>Après lecture, le nommé signe avec nous et nos assistants ainsi que la fiche de scellé</td></tr>
</table>
<div class="warn"><strong>⚠️ Heures légales :</strong> 6H – 21H en tout lieu. Sauf crime ou FD chez la personne interpellée = 24H/24.</div>
<h2>PERQUISITION — ENQUÊTE PRÉLIMINAIRE (Art. 76 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">Différence clé avec FD</div>
<ul>
<li>Nécessite l'<strong>assentiment exprès et manuscrit</strong> de la personne</li>
<li>En cas de refus ET peine ≥ 3 ans : requête Parquet → autorisation JLD (écrite et motivée)</li>
<li>Mêmes heures légales : 6H – 21H</li>
</ul></div>
<h2>FOUILLE INTÉGRALE (Art. 53 et s. CPP)</h2>
<table>
<tr><th>Étape</th><th>Formule</th></tr>
<tr><td>Nécessité</td><td>Susceptible de détenir [élément] non détectable par palpation</td></tr>
<tr><td>Exécution</td><td>Procédons à fouille intégrale sur la personne de NOM Prénom</td></tr>
<tr><td>Découverte</td><td>Dans [endroit], découvrons [élément] — description précise</td></tr>
<tr><td>Saisie</td><td>Saisissons et plaçons sous scellé n° [numéro]</td></tr>
<tr><td>Fin</td><td>Fouille terminée, ne nous permet de découvrir aucun autre élément</td></tr>
</table>
<h2>FOUILLE VÉHICULE (Art. 53 et s. CPP)</h2>
<table>
<tr><th>Étape</th><th>Formule</th></tr>
<tr><td>Constat</td><td>Constatons présence du véhicule [marque, modèle, immat.], stationné</td></tr>
<tr><td>Ouverture</td><td>À l'aide des clés : portières, capot, coffre</td></tr>
<tr><td>Fouille</td><td><strong>En présence constante et effective</strong> du nommé — minutieuse fouille</td></tr>
<tr><td>Saisie</td><td>Saisissons et plaçons sous scellé n° [numéro]</td></tr>
<tr><td>Clôture</td><td>Refermons le véhicule — clés replacées dans effets du nommé</td></tr>
</table>
<h2>MÉTHODE SDIACSS — Saisie Incidente</h2>
<table>
<tr><th>Lettre</th><th>Action</th></tr>
<tr><td><strong>S</strong> — Situation</td><td>Contexte de la découverte incidente</td></tr>
<tr><td><strong>D</strong> — Description</td><td>Description précise de l'objet saisi</td></tr>
<tr><td><strong>I</strong> — Interpellation</td><td>Question à l'intéressé sur l'origine</td></tr>
<tr><td><strong>A</strong> — Avis Parquet</td><td>Avis immédiat obligatoire</td></tr>
<tr><td><strong>C</strong> — Cadre juridique</td><td>FD ou procédure incidente</td></tr>
<tr><td><strong>S</strong> — Saisie</td><td>Saisie formalisée dans le PV</td></tr>
<tr><td><strong>S</strong> — Scellé</td><td>Constitution du scellé numéroté</td></tr>
</table>
<div class="piege"><strong>⚠️ Saisie incidente :</strong> Objet rattaché infraction en FD = avis Parquet immédiat + ouverture nouvelle procédure + extension GAV aux nouveaux faits.</div>`,
art1:`<h1>⏱️ Ligne du Temps — Enquête ALPHA (Flagrant Délit)</h1>
<p><em>Scénario type : Vol dans local d'habitation — 10h30 — Flagrant Délit complet</em></p>
<h2>Chronologie des 20 actes</h2>
<div class="timeline-item"><div class="tl-num">01</div><div class="tl-time">10h30</div><div class="tl-title"><strong>SAISINE — PLAINTE C/X</strong><br><small>Victime — Art. 10-2 CPP — Droits — Avis Parquet + hiérarchie</small></div></div>
<div class="timeline-item"><div class="tl-num">02</div><div class="tl-time">11h00</div><div class="tl-title"><strong>PRÉSENTATION PHOTOS TAJ à victime</strong><br><small>Fichier TAJ — Présentation formalisée</small></div></div>
<div class="timeline-item"><div class="tl-num">03</div><div class="tl-time">11h10</div><div class="tl-title"><strong>IDENTIFICATION suspect</strong><br><small>Suite présentation TAJ</small></div></div>
<div class="timeline-item"><div class="tl-num">04</div><div class="tl-time">11h20</div><div class="tl-title"><strong>RECHERCHES FICHIERS</strong><br><small>TAJ, FPR, FNAEG, FAED, SNPC, FOVES…</small></div></div>
<div class="timeline-item"><div class="tl-num">05</div><div class="tl-time">11h40</div><div class="tl-title"><strong>VÉRIFICATION DE DOMICILE (VD)</strong><br><small>Vérification préalable adresse suspect</small></div></div>
<div class="timeline-item"><div class="tl-num">06</div><div class="tl-time">12h00</div><div class="tl-title"><strong>TRANSPORT / CONSTATATIONS</strong><br><small>SDPTS + Vidéoprotection + Album photo</small></div></div>
<div class="timeline-item"><div class="tl-num">07</div><div class="tl-time">12h20</div><div class="tl-title"><strong>ENQUÊTE DE VOISINAGE (EV)</strong><br><small>Gardiens X et Y — Résultat</small></div></div>
<div class="timeline-item"><div class="tl-num" style="background:var(--err)">08</div><div class="tl-time">13h15</div><div class="tl-title"><strong>TRANSPORT / INTERPELLATION ← DÉBUT GAV</strong><br><small>Menottage Art. 803 — Palpation — Notification verbale GAV</small></div></div>
<div class="timeline-item"><div class="tl-num">09</div><div class="tl-time">13h20</div><div class="tl-title"><strong>NOTIFICATION PLACEMENT EN GAV (PV séparé)</strong><br><small>6 objectifs Art. 62-2 — Droits Art. 63-1 à 63-4-3 — Formulaire remis</small></div></div>
<div class="timeline-item"><div class="tl-num">10</div><div class="tl-time">13h30</div><div class="tl-title"><strong>AVIS PARQUET</strong><br><small>Obligatoire dès placement en GAV</small></div></div>
<div class="timeline-item"><div class="tl-num">11</div><div class="tl-time">13h35</div><div class="tl-title"><strong>FOUILLE INTÉGRALE</strong><br><small>Nécessité justifiée — Résultat + scellé ou négatif</small></div></div>
<div class="timeline-item"><div class="tl-num">12</div><div class="tl-time">14h00</div><div class="tl-title"><strong>PERQUISITION domicile suspect</strong><br><small>Présence constante du MEC — Saisie + scellé n° DEUX</small></div></div>
<div class="timeline-item"><div class="tl-num">13</div><div class="tl-time">15h30</div><div class="tl-title"><strong>ENTRETIEN AVOCAT</strong><br><small>30 min — Sans délai de carence (Loi 22/04/2024)</small></div></div>
<div class="timeline-item"><div class="tl-num">14</div><div class="tl-time">16h00</div><div class="tl-title"><strong>CONSTITUTION DE GROUPE</strong><br><small>Pour présentation aux témoins/victimes</small></div></div>
<div class="timeline-item"><div class="tl-num">15</div><div class="tl-time">16h30</div><div class="tl-title"><strong>PRÉSENTATION DE GROUPE</strong><br><small>En présence de l'avocat</small></div></div>
<div class="timeline-item"><div class="tl-num">16</div><div class="tl-time">17h00</div><div class="tl-title"><strong>PLAINTE C/ MEC dénommé</strong><br><small>Plainte victime contre suspect identifié</small></div></div>
<div class="timeline-item"><div class="tl-num">17</div><div class="tl-time">17h30</div><div class="tl-title"><strong>AUDITION MEC (gardé à vue)</strong><br><small>En présence avocat — Droits rappelés</small></div></div>
<div class="timeline-item"><div class="tl-num">18</div><div class="tl-time">18h30</div><div class="tl-title"><strong>COMPTE-RENDU PARQUET</strong><br><small>Instructions substitut — COPJ / Défèrement / Classement</small></div></div>
<div class="timeline-item"><div class="tl-num">19</div><div class="tl-time">18h45</div><div class="tl-title"><strong>SIGNALISATION GÉNÉTIQUE</strong><br><small>Art. 706-55 CPP — Prélèvement buccal — FNAEG</small></div></div>
<div class="timeline-item"><div class="tl-num" style="background:var(--ok)">20</div><div class="tl-time">19h00</div><div class="tl-title"><strong>NOTIFICATION FIN GAV ET SUITES</strong><br><small>Droits rappelés — COPJ ou défèrement — Signature</small></div></div>
<div class="ok"><strong>✓ Règle d'or :</strong> Chaque acte = un PV distinct avec cartouche. Les heures doivent être chronologiques et cohérentes. GAV = acte 08 (interpellation), jamais l'arrivée au service.</div>
<div class="piege"><strong>⚠️ Pièges ALPHA :</strong> (1) Heure GAV débute à l'interpellation. (2) Avocat sans délai depuis loi 22/04/2024. (3) Plainte dénommé uniquement après identification formelle. (4) Signalisation génétique = Art. 706-55 CPP.</div>`,
lame:`<h1>⚖️ Méthode LAME — Fiche Mémo Infraction</h1>
<p>La méthode <strong>LAME</strong> structure l'analyse de toute infraction en 4 éléments constitutifs obligatoires.</p>
<h2>L — Élément Légal</h2>
<table>
<tr><th>Composante</th><th>Contenu</th></tr>
<tr><td>Article de définition</td><td>Article XX CP/CPP qui prévoit et définit l'infraction</td></tr>
<tr><td>Article de répression</td><td>Article XX qui fixe la peine (emprisonnement + amende)</td></tr>
<tr><td>Circonstances aggravantes</td><td>Articles des aggravations (effraction, récidive, bande organisée…)</td></tr>
<tr><td>Classification (Art. 111-1 CP)</td><td>Crime / Délit / Contravention</td></tr>
</table>
<h2>A — Élément Actuel / Matériel</h2>
<table>
<tr><th>Aspect</th><th>Contenu</th></tr>
<tr><td>Faits constatés</td><td>Tous éléments objectifs prouvant la matérialité de l'infraction</td></tr>
<tr><td>Nature des actes</td><td>Unique ou pluralité — Instantané ou continu dans le temps</td></tr>
<tr><td>Commission ou omission</td><td>Action active ou inaction contraire à l'ordre social</td></tr>
<tr><td>Preuves matérielles</td><td>Scellés, témoignages, constatations, rapports PTS</td></tr>
</table>
<h2>M — Élément Moral (Culpabilité)</h2>
<table>
<tr><th>Type de faute</th><th>Définition</th><th>Exemples</th></tr>
<tr><td><strong>Dol général</strong></td><td>Conscience + volonté d'accomplir l'acte</td><td>Vol, meurtre, coups</td></tr>
<tr><td><strong>Intentionnelle</strong></td><td>Volonté dirigée vers le résultat précis</td><td>Homicide volontaire</td></tr>
<tr><td><strong>Non-intentionnelle</strong></td><td>Imprudence, négligence, maladresse</td><td>Homicide par imprudence</td></tr>
<tr><td><strong>Mise en danger délibérée</strong></td><td>Violation manifestement délibérée obligation sécurité</td><td>Art. 223-1 CP</td></tr>
<tr><td><strong>Contraventionnelle</strong></td><td>Simple matérialité, sans intention requise</td><td>Infractions routières</td></tr>
</table>
<p style="font-size:11px;font-style:italic">Formule type démontrant la conscience : « L'intéressé, en état de conscience pleine et entière, a volontairement… »</p>
<h2>E — Énrôlement / Responsabilité Pénale</h2>
<table>
<tr><th>Situation</th><th>Formule</th></tr>
<tr><td>Responsabilité pleine</td><td>NOM Prénom engage sa responsabilité pénale pleine et entière</td></tr>
<tr><td>Irresponsabilité</td><td>Ne peut donner lieu à poursuites — motif : trouble mental, contrainte, minorité</td></tr>
<tr><td>Tentative (Art. 121-5)</td><td>Commencement exécution + absence désistement volontaire</td></tr>
<tr><td>Complicité (Art. 121-7)</td><td>Fait principal punissable + participation + intention de participer</td></tr>
<tr><td>Immunité familiale</td><td>Au préjudice ascendant/descendant/conjoint (hors documents indispensables)</td></tr>
</table>
<h2>Tripartition des Infractions (Art. 111-1 CP)</h2>
<table>
<tr><th>Nature</th><th>Peine max</th><th>Juridiction</th><th>Prescription AP</th><th>Prescription peine</th></tr>
<tr><td><strong>CRIME</strong></td><td>Réclusion / Perpétuité</td><td>Cour d'Assises</td><td>20 ans</td><td>20 ans</td></tr>
<tr><td><strong>DÉLIT</strong></td><td>Emprisonnement + amende</td><td>Tribunal Correctionnel</td><td>6 ans</td><td>6 ans</td></tr>
<tr><td><strong>CONTRAVENTION</strong></td><td>Amende (R, C1 à C5)</td><td>Tribunal de Police</td><td>1 an</td><td>3 ans</td></tr>
</table>
<div class="piege"><strong>⚠️ La classification détermine :</strong> Régime de GAV · Durée de prescription · Juridiction compétente · Quantum de peine. Une erreur de qualification peut faire tomber toute la procédure.</div>`,
bloc1:`<h1>🏛️ Libertés Publiques &amp; Acteurs de la PJ</h1>
<h2>Libertés Fondamentales</h2>
<table>
<tr><th>Liberté</th><th>Définition</th><th>Base juridique</th></tr>
<tr><td><strong>La Sûreté</strong></td><td>Droit de n'être ni arrêté ni détenu arbitrairement</td><td>DDHC 1789</td></tr>
<tr><td><strong>Aller et venir</strong></td><td>Droit de se déplacer librement, pas d'arrestation hors cadre légal</td><td>Préambule Const. 1958</td></tr>
</table>
<h2>Mesures de Privation de Liberté</h2>
<table>
<tr><th>Mesure</th><th>Article</th><th>Durée max</th><th>Notes</th></tr>
<tr><td>Garde à vue</td><td>Art. 62-2 CPP</td><td>24H + 24H (CDO +48H+48H)</td><td>Seul l'OPJ peut placer</td></tr>
<tr><td>Contrôle d'identité</td><td>Art. 78-2 CPP</td><td>Temps nécessaire</td><td>OPJ, APJ, APJA</td></tr>
<tr><td>Vérification d'identité</td><td>Art. 78-3 CPP</td><td>4H maximum</td><td>Sur décision OPJ</td></tr>
<tr><td>Relevé d'identité</td><td>Art. 78-6 CPP</td><td>—</td><td>Contravention seulement</td></tr>
</table>
<h2>Vérification d'Identité — Procédure (Art. 78-3 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">Procédure stricte</div>
<ul>
<li>Recherche <strong>coercitive</strong> sur décision de l'OPJ</li>
<li><strong>4H maximum</strong> — strictement nécessaire à découvrir l'identité véritable</li>
<li>Causes : contrôle d'identité, relevé d'identité, recueil d'identité → la personne refuse ou ne peut justifier</li>
<li>Avis à toute personne de son choix + avis au Procureur de la République</li>
<li>Fin : destruction empreintes FAED dans les 6 mois</li>
</ul></div>
<h2>Les Acteurs de la Police Judiciaire (Art. 15 à 21 CPP)</h2>
<table>
<tr><th>Acteur</th><th>Rôle principal</th></tr>
<tr><td>Procureur de la République</td><td>Dirige et contrôle l'enquête de police judiciaire — Décide des poursuites</td></tr>
<tr><td>OPJ</td><td>Direction effective des enquêtes — GAV — Perquisitions — Chef d'enquête</td></tr>
<tr><td>APJ</td><td>Sous direction OPJ — Constatations, auditions déléguées</td></tr>
<tr><td>APJA</td><td>Actes très limités — recueil identité, constatations simples</td></tr>
<tr><td>Juge d'Instruction</td><td>Instruction judiciaire — Mandats — Commission rogatoire</td></tr>
<tr><td>Maires et adjoints</td><td>OPJ de droit dans certaines matières</td></tr>
</table>
<h2>Contrôle de la PJ</h2>
<table>
<tr><th>Instance</th><th>Type de contrôle</th></tr>
<tr><td>PG près la Cour d'Appel</td><td>Contrôle hiérarchique des OPJ du ressort</td></tr>
<tr><td>Inspection Générale de la Justice</td><td>Contrôle disciplinaire</td></tr>
<tr><td>Chambre de l'instruction</td><td>Contrôle juridictionnel des actes d'enquête (nullités)</td></tr>
</table>
<h2>Suites Possibles à l'Enquête</h2>
<table>
<tr><th>Décision du PR</th><th>Mode</th></tr>
<tr><td>Engagement des poursuites</td><td>COPJ, CPPV, CRPC, CI (Comparution Immédiate)</td></tr>
<tr><td>Alternative aux poursuites</td><td>Rappel à la loi, médiation, stage, réparation, composition pénale</td></tr>
<tr><td>Classement sans suite</td><td>Infraction non constituée ou inopportunité — recours possible PG</td></tr>
</table>
<div class="ok"><strong>Avis Parquet — 4 moments obligatoires (Art. 40 CPP) :</strong> (1) Constatation infraction · (2) Privation de liberté · (3) Demande prolongation GAV · (4) Fin de GAV</div>`,
bloc2:`<h1>🗃️ Fichiers Police &amp; Réquisitions</h1>
<h2>Fichiers liés aux Personnes</h2>
<table>
<tr><th>Sigle</th><th>Nom complet</th><th>Contenu clé</th></tr>
<tr><td><strong>TAJ</strong></td><td>Traitement des Antécédents Judiciaires</td><td>Mises en cause, victimes, témoins — Art. 230-6 CPP</td></tr>
<tr><td><strong>FPR</strong></td><td>Fichier des Personnes Recherchées</td><td>Personnes sous mandat, fugitifs, disparitions</td></tr>
<tr><td><strong>FNAEG</strong></td><td>Fichier National Empreintes Génétiques</td><td>Profils ADN — Art. 706-55 CPP — <strong>Réquisition permanente</strong></td></tr>
<tr><td><strong>FAED</strong></td><td>Fichier Automatisé Empreintes Digitales</td><td>Empreintes digitales/palmaires — <strong>Réquisition permanente</strong></td></tr>
<tr><td><strong>FIJAISV</strong></td><td>Fichier Judiciaire Auteurs Infr. Sexuelles/Violentes</td><td>Condamnés ISV — Obligations de pointage</td></tr>
<tr><td><strong>FIJAIT</strong></td><td>Fichier Judiciaire Auteurs Infr. Terroristes</td><td>Condamnés pour terrorisme</td></tr>
</table>
<h2>Fichiers liés aux Véhicules</h2>
<table>
<tr><th>Sigle</th><th>Nom</th><th>Usage</th></tr>
<tr><td><strong>FOVES</strong></td><td>Fichier Objets Véhicules Signalés</td><td>Véhicules volés, objets signalés</td></tr>
<tr><td><strong>SNPC</strong></td><td>Système National Permis de Conduire</td><td>Validité permis, solde de points</td></tr>
<tr><td><strong>SIV</strong></td><td>Système d'Immatriculation des Véhicules</td><td>Identification propriétaire</td></tr>
<tr><td><strong>FVA</strong></td><td>Fichier Véhicules Assurés</td><td>Vérification assurance</td></tr>
<tr><td><strong>EUCARIS</strong></td><td>Système européen d'immatriculation</td><td>Véhicules étrangers</td></tr>
<tr><td><strong>ADOC</strong></td><td>Accès Dossier Contraventions</td><td>Historique infractions routières</td></tr>
</table>
<h2>Les Réquisitions — Cadre Juridique</h2>
<table>
<tr><th>Cadre</th><th>Article</th><th>Autorité requérante</th><th>Spécificité</th></tr>
<tr><td>Flagrant délit</td><td>Art. 60 CPP</td><td>OPJ directement</td><td>Pas d'autorisation préalable</td></tr>
<tr><td>Enquête préliminaire</td><td>Art. 77-1 CPP</td><td>Sur autorisation PR</td><td>Autorisation préalable obligatoire</td></tr>
<tr><td>FNAEG + FAED</td><td>Art. 706-55 CPP</td><td>OPJ directement</td><td><strong>Réquisitions permanentes — EP incluse</strong></td></tr>
</table>
<h2>Types de Réquisitions</h2>
<table>
<tr><th>Type</th><th>Objet</th></tr>
<tr><td>Générales</td><td>Force publique, moyens de l'État</td></tr>
<tr><td>À personnes qualifiées</td><td>Experts, médecins, UMJ, techniciens</td></tr>
<tr><td>Informatiques</td><td>Opérateurs télécom, FAI — données de connexion et identification</td></tr>
<tr><td>À manœuvrier</td><td>Ouverture de coffres, serrures, véhicules</td></tr>
<tr><td>Prélèvement sanguin</td><td>Alcoolémie, dépistage de stupéfiants</td></tr>
<tr><td>Bancaires (FICOBA)</td><td>Comptes bancaires et mouvements financiers</td></tr>
<tr><td>X-Ray téléphone</td><td>Analyse données téléphone — hors enquête — par personne qualifiée</td></tr>
<tr><td>Interceptions (Art. 100 CPP)</td><td>Uniquement en information judiciaire (JI)</td></tr>
</table>
<div class="ok"><strong>✓ Objectif :</strong> La manifestation de la vérité. Toute réquisition = PV de réquisition + réponse écrite du requis.</div>
<div class="piege"><strong>⚠️ FNAEG / FAED :</strong> Réquisitions permanentes = l'OPJ peut accéder sans autorisation du Parquet, même en enquête préliminaire.</div>`
};

function renderPrintList(){
  const el=document.getElementById('print-list');if(!el)return;
  if(typeof PRINT_SHEETS==='undefined'||!PRINT_SHEETS.length){
    el.innerHTML='<div class="empty-state"><span class="empty-state-em">📄</span>Aucune fiche disponible</div>';return;
  }
  const printed=S.printed||{};
  el.innerHTML=`<div class="print-grid">${PRINT_SHEETS.map((s,i)=>{
    const done=!!(printed[s.id]||printed[s.id+'_viewed']);
    return`<div class="print-card2${done?' done':''}" onclick="PRINT28.open('${s.id}')" style="animation:fadeUp .15s ${i*0.04}s both">
      <div class="print-card2-top">
        <div class="print-card2-em">${s.emoji}</div>
        ${done?`<div class="print-card2-check">✓</div>`:`<div class="print-card2-dl">↓</div>`}
      </div>
      <div class="print-card2-title">${s.title}</div>
      <div class="print-card2-sub">${s.sub}</div>
      <div class="print-card2-footer">
        <span class="print-card2-cta">${done?'Réimprimer':'Ouvrir la fiche'}</span>
      </div>
    </div>`;
  }).join('')}</div>`;
}


const PRINT28={
  open(id){
    const sheet=PRINT_SHEETS.find(s=>s.id===id);
    const content=PRINT_CONTENT[id];
    if(!sheet||!content)return;
    const body=document.getElementById('lesson-modal-body');
    const ov=document.getElementById('lesson-ov');
    if(!body||!ov)return;
    body.innerHTML=`
      <div class="sheet-handle" onclick="closeLesson()" style="cursor:pointer"></div>
      <div style="padding:16px 18px 24px">
        <div class="font-title fw-800 text-xl mb4">${sheet.emoji} ${sheet.title}</div>
        <div class="text-xs text-muted font-mono mb16">${sheet.sub}</div>
        <div class="print-sheet-content" style="font-size:12.5px;color:var(--t2);line-height:1.75">${content}</div>
        <div style="margin-top:20px;display:flex;gap:8px">
          <button class="btn btn-p" style="flex:1" onclick="PRINT28.printSheet('${id}')">🖨️ Imprimer</button>
          <button class="btn btn-ghost" onclick="closeLesson()">Fermer</button>
        </div>
      </div>`;
    // Style the content
    const style=document.createElement('style');
    style.textContent=`.print-sheet-content table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11px}.print-sheet-content th{background:var(--accent);color:#fff;padding:5px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.04em}.print-sheet-content td{padding:5px 8px;border-bottom:1px solid var(--brd);color:var(--t2)}.print-sheet-content h1{font-family:'Syne',sans-serif;font-size:15px;font-weight:900;color:var(--t1);margin-bottom:10px;border-bottom:2px solid var(--accent-l);padding-bottom:5px}.print-sheet-content h2{font-size:11px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.07em;margin:12px 0 6px}.print-sheet-content p{font-size:12px;color:var(--t2);line-height:1.65;margin-bottom:7px}.print-sheet-content .piege-box{background:var(--err-bg);border:1px solid rgba(239,68,68,.2);border-radius:var(--r-m);padding:10px 12px;margin:8px 0;font-size:11px;color:var(--err)}`;
    body.appendChild(style);
    ov.classList.add('on');
    document.body.style.overflow='hidden';
    /* Enregistrer l'ouverture comme vue */
    if(!S.printed)S.printed={};
    if(!S.printed[id+'_viewed']){S.printed[id+'_viewed']=Date.now();save();renderPrintList();}
  },
  printSheet(id){
    const content=PRINT_CONTENT[id];
    const sheet=PRINT_SHEETS.find(s=>s.id===id);
    if(!content||!sheet)return;
    /* Marquer comme imprimé */
    if(!S.printed[id]){
      S.printed[id]=Date.now();
      S.printDone=(S.printDone||0)+1;
      save();
      renderPrintList();
      checkBadges();
    }
    const w=window.open('','_blank','width=800,height=950');
    if(!w)return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OPJ Elite — ${sheet.title}</title><style>
body{font-family:Georgia,serif;font-size:10pt;color:#000;background:#fff;padding:18mm;margin:0}
h1{font-size:14pt;border-bottom:2pt solid #2563eb;padding-bottom:4pt;margin-bottom:8pt;color:#1a1a2e}
h2{font-size:11pt;color:#2563eb;margin:9pt 0 4pt}
table{width:100%;border-collapse:collapse;margin-bottom:7pt;font-size:9pt}
th{background:#2563eb;color:#fff;padding:4pt 5pt;text-align:left;font-size:8pt;font-family:monospace}
td{padding:3pt 5pt;border-bottom:0.5pt solid #ccc;vertical-align:top}
p,li{font-size:9pt;line-height:1.55;margin-bottom:4pt}
.piege-box{background:#fff5f5;border:1pt solid #cc0000;padding:5pt;border-radius:2pt;margin:5pt 0;font-size:8.5pt;color:#cc0000}
strong{font-weight:bold}
footer{position:fixed;bottom:8mm;left:18mm;right:18mm;text-align:center;font-size:7pt;color:#999;border-top:0.5pt solid #ddd;padding-top:3pt}

/* NAV SVG icons v29 */
.nav-icon{width:22px;height:22px;display:flex;align-items:center;justify-content:center}
.nav-icon svg{transition:stroke var(--tr)}
.nav-btn.active .nav-icon svg{stroke:var(--accent-l)!important}
.nav-btn:not(.active) .nav-icon svg{stroke:var(--t3)!important}



/* ═══════════════════════════════════════════════
   OPJ ELITE v30 — PREMIUM DESIGN SYSTEM
   Inspired by: Linear, Raycast, Vercel, Superhuman
   ═══════════════════════════════════════════════ */

/* MESH GRADIENT BG animé */
body::before{
  content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;
  background:
    radial-gradient(ellipse 80% 50% at 20% -10%,rgba(37,99,235,.13),transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%,rgba(139,92,246,.08),transparent),
    radial-gradient(ellipse 50% 60% at 50% 50%,rgba(37,99,235,.04),transparent);
  animation:meshMove 12s ease-in-out infinite alternate;
}
@keyframes meshMove{
  0%{background-position:0% 0%,100% 100%,50% 50%}
  100%{background-position:10% 5%,90% 95%,55% 48%}
}

/* HERO — Premium gradient card */
.hero{
  background:linear-gradient(135deg,rgba(37,99,235,.18) 0%,rgba(37,99,235,.06) 40%,rgba(139,92,246,.08) 100%);
  border:1px solid rgba(59,130,246,.25);
  border-radius:24px;padding:22px;margin-bottom:14px;
  position:relative;overflow:hidden;
  box-shadow:0 0 40px rgba(37,99,235,.12),0 4px 24px rgba(0,0,0,.4);
}
.hero::before{
  content:'⚖️';position:absolute;right:-8px;top:-18px;
  font-size:120px;opacity:.06;pointer-events:none;line-height:1;
  filter:blur(1px);
}
.hero::after{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(99,179,246,.4),transparent);
}
.hero-greeting{
  font-size:11px;color:var(--t3);margin-bottom:2px;
  font-weight:600;text-transform:uppercase;letter-spacing:.1em;
  font-family:'JetBrains Mono',monospace;
}
.hero-name{
  font-family:'Syne',sans-serif;
  font-size:26px;font-weight:900;color:var(--t1);
  margin-bottom:18px;letter-spacing:-.03em;line-height:1.1;
}
.hero-name span{
  display:inline-block;
  background:linear-gradient(135deg,var(--accent-l),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;color:transparent;
}

/* KPI GRID — chiffres qui impressionnent */
.hero-kpis{
  display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px;
}
.hero-kpi{
  background:rgba(0,0,0,.28);
  border:1px solid rgba(255,255,255,.07);
  border-radius:12px;padding:10px 6px;text-align:center;
  position:relative;overflow:hidden;
  transition:transform var(--tr),border-color var(--tr);
}
.hero-kpi:hover{transform:translateY(-2px);border-color:rgba(59,130,246,.3)}
.hero-kpi::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(255,255,255,.03),transparent);
  pointer-events:none;
}
.hero-kv{
  font-family:'JetBrains Mono',monospace;font-size:20px;
  font-weight:700;color:var(--t1);line-height:1;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
.hero-kpi:hover .hero-kv{transform:scale(1.08)}
.hero-kl{
  font-size:8px;color:var(--t3);margin-top:4px;
  text-transform:uppercase;letter-spacing:.07em;
  font-family:'JetBrains Mono',monospace;
}
.hero-kpi.kpi-xp .hero-kv{color:var(--accent-l)}
.hero-kpi.kpi-streak .hero-kv{color:var(--gold)}
.hero-kpi.kpi-score .hero-kv{color:var(--ok)}
.hero-kpi.kpi-due .hero-kv{color:var(--warn)}

/* BOUTONS HERO */
.hero-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hero-btn-p{
  padding:13px;border-radius:14px;border:none;cursor:pointer;
  background:linear-gradient(135deg,var(--accent),var(--accent-l));
  color:#fff;font-weight:700;font-size:13px;
  font-family:'Inter',sans-serif;
  display:flex;align-items:center;justify-content:center;gap:6px;
  transition:all var(--tr);
  box-shadow:0 4px 16px rgba(37,99,235,.35);
  position:relative;overflow:hidden;
}
.hero-btn-p::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);
  pointer-events:none;
}
.hero-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,99,235,.45)}
.hero-btn-p:active{transform:scale(.97)}
.hero-btn-s{
  padding:13px;border-radius:14px;cursor:pointer;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.05);
  color:var(--t1);font-weight:600;font-size:13px;
  font-family:'Inter',sans-serif;
  display:flex;align-items:center;justify-content:center;gap:6px;
  transition:all var(--tr);backdrop-filter:blur(8px);
}
.hero-btn-s:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);transform:translateY(-1px)}
.hero-btn-s:active{transform:scale(.98)}

/* XP BAR — néon */
.xp-bar{height:3px;background:var(--bg-3);border-radius:100px;overflow:hidden;margin-bottom:18px}
.xp-fill{
  height:100%;
  background:linear-gradient(90deg,var(--accent),var(--accent-l),var(--violet));
  border-radius:100px;
  transition:width .8s cubic-bezier(.4,0,.2,1);
  box-shadow:0 0 8px rgba(59,130,246,.6);
}

/* DÉFI CARD — gold premium */
.defi-card{
  background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04));
  border:1px solid rgba(212,175,55,.3);
  border-radius:20px;padding:16px;margin-bottom:12px;
  position:relative;overflow:hidden;
  box-shadow:0 0 24px rgba(212,175,55,.08);
  cursor:pointer;transition:all var(--tr);
}
.defi-card:hover{
  border-color:rgba(212,175,55,.5);
  box-shadow:0 0 32px rgba(212,175,55,.15);
  transform:translateY(-2px);
}
.defi-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.04),transparent);
  pointer-events:none;
}
.defi-card::after{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(212,175,55,.4),transparent);
}
.defi-badge{
  display:inline-flex;align-items:center;gap:5px;
  background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.25);
  color:var(--gold);font-size:9px;font-weight:700;
  font-family:'JetBrains Mono',monospace;padding:3px 9px;border-radius:100px;
  text-transform:uppercase;letter-spacing:.08em;margin-bottom:9px;
}
.defi-title{
  font-family:'Syne',sans-serif;
  font-size:16px;font-weight:800;color:var(--t1);margin-bottom:4px;
  letter-spacing:-.01em;
}
.defi-sub{font-size:12px;color:var(--t2);margin-bottom:10px;line-height:1.5}
.defi-countdown{
  font-family:'JetBrains Mono',monospace;font-size:10px;
  color:var(--gold);font-weight:600;
  display:flex;align-items:center;gap:5px;
}

/* WEAK WIDGET — alert rouge premium */
.weak-widget{
  background:linear-gradient(135deg,rgba(239,68,68,.08),rgba(239,68,68,.03));
  border:1px solid rgba(239,68,68,.2);
  border-radius:20px;padding:15px;margin-bottom:12px;
  box-shadow:0 0 20px rgba(239,68,68,.06);
}
.weak-widget-title{
  font-size:10px;font-weight:700;color:var(--err);
  text-transform:uppercase;letter-spacing:.1em;
  margin-bottom:12px;display:flex;align-items:center;gap:6px;
}
.weak-row{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.weak-name{font-size:12px;font-weight:600;color:var(--t1);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.weak-pct{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--err);font-weight:700;flex-shrink:0}
.weak-bar{height:3px;background:rgba(239,68,68,.15);border-radius:100px;overflow:hidden;margin-top:3px}
.weak-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,var(--err),rgba(239,68,68,.6))}

/* STAT CARDS — glassmorphism */
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.stat-card{
  background:var(--bg-1);border:1px solid var(--brd);
  border-radius:16px;padding:16px;text-align:center;
  position:relative;overflow:hidden;
  transition:all var(--tr);
}
.stat-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.025),transparent);
  pointer-events:none;
}
.stat-card:hover{border-color:var(--brd-l);transform:translateY(-2px)}
.stat-val{
  font-family:'JetBrains Mono',monospace;font-size:28px;
  font-weight:700;color:var(--accent-l);line-height:1;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}
.stat-card:hover .stat-val{transform:scale(1.08)}
.stat-lbl{font-size:10px;color:var(--t2);margin-top:5px;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.05em}

/* CHAPTER CARDS — premium */
.chapter-card{
  background:var(--bg-1);border:1px solid var(--brd);
  border-radius:18px;overflow:hidden;margin-bottom:8px;
  cursor:pointer;transition:all var(--tr);
}
.chapter-card:hover{border-color:var(--brd-l);background:var(--bg-2);transform:translateY(-1px);box-shadow:var(--sh-sm)}
.chapter-card.expanded{border-color:var(--brd-acc);box-shadow:0 0 20px var(--accent-glow)}
.chapter-hd{display:flex;align-items:center;gap:12px;padding:15px 16px}
.chapter-ico{
  width:46px;height:46px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;flex-shrink:0;
  box-shadow:0 2px 8px rgba(0,0,0,.3);
}
.chapter-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--t1);line-height:1.2}
.chapter-sub{font-size:10px;color:var(--t2);margin-top:2px}
.chapter-prog-txt{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);font-weight:700}

/* LESSON ITEMS */
.lesson-item{
  display:flex;align-items:center;gap:12px;padding:11px 14px;
  border-radius:12px;cursor:pointer;
  transition:background var(--tr);margin-bottom:3px;
}
.lesson-item:hover{background:rgba(255,255,255,.05)}
.lesson-item.done{background:rgba(16,185,129,.04)}
.lesson-em{font-size:18px;flex:0 0 28px;text-align:center}
.lesson-name{font-size:13px;font-weight:600;color:var(--t1)}
.lesson-meta{font-size:10px;color:var(--t3);margin-top:2px;font-family:'JetBrains Mono',monospace}
.lesson-status{
  width:20px;height:20px;border-radius:50%;
  border:1.5px solid var(--bg-4);
  display:flex;align-items:center;justify-content:center;
  font-size:10px;flex-shrink:0;transition:all var(--tr);
}
.lesson-status.done{background:var(--ok);border-color:var(--ok);color:#fff;box-shadow:0 0 8px rgba(16,185,129,.4)}

/* QCM — game feel */
.q-txt{
  font-family:'Syne',sans-serif;
  font-size:19px;font-weight:800;color:var(--t1);
  line-height:1.4;margin-bottom:6px;letter-spacing:-.02em;
}
.q-opt{
  background:var(--bg-2);border:1.5px solid var(--brd);
  border-radius:14px;padding:13px 16px;font-size:13px;
  font-weight:500;color:var(--t1);cursor:pointer;
  text-align:left;width:100%;font-family:'Inter',sans-serif;
  transition:all .15s cubic-bezier(.4,0,.2,1);
  display:flex;align-items:center;gap:12px;
  position:relative;overflow:hidden;
}
.q-opt::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.03),transparent);
  pointer-events:none;
}
.q-opt:hover{
  border-color:var(--accent-l);background:var(--accent-glow);
  transform:translateX(4px);
  box-shadow:0 0 16px rgba(37,99,235,.2);
}
.q-opt:active{transform:scale(.99)}
.q-opt.correct{
  background:var(--ok-bg);border-color:var(--ok);color:var(--ok);
  box-shadow:0 0 16px rgba(16,185,129,.2);
  animation:correctPop .4s cubic-bezier(.34,1.56,.64,1);
}
.q-opt.wrong{
  background:var(--err-bg);border-color:var(--err);color:var(--err);
  animation:shake .35s ease;
}
.q-opt.disabled{pointer-events:none}
.q-letter{
  width:26px;height:26px;background:var(--accent-glow);border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;color:var(--accent-l);flex-shrink:0;
  font-family:'JetBrains Mono',monospace;transition:all .15s;
}
.q-opt:hover .q-letter{background:var(--accent);color:#fff}
.q-opt.correct .q-letter{background:var(--ok);color:#fff}
.q-opt.wrong .q-letter{background:var(--err);color:#fff}
@keyframes correctPop{
  0%{transform:scale(1)}40%{transform:scale(1.03)}100%{transform:scale(1)}
}

/* RÉSULTATS QCM */
.send-wrap{text-align:center;padding:28px 0}
.send-score{
  font-family:'JetBrains Mono',monospace;font-size:64px;font-weight:700;margin:14px 0;
  background:linear-gradient(135deg,var(--accent-l),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  animation:popIn .5s cubic-bezier(.34,1.56,.64,1);
}
.send-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:900;color:var(--t1);margin-bottom:5px}
.send-lbl{font-size:13px;color:var(--t2);margin-bottom:18px}

/* THEME ROWS — révision */
.theme-row{
  display:flex;align-items:center;gap:12px;padding:13px 14px;
  background:var(--bg-1);border:1px solid var(--brd);border-radius:14px;
  margin-bottom:7px;cursor:pointer;transition:all var(--tr);
  position:relative;overflow:hidden;
}
.theme-row::before{
  content:'';position:absolute;left:0;top:0;bottom:0;width:3px;
  background:var(--theme-color, var(--accent));border-radius:0 2px 2px 0;
  opacity:.7;
}
.theme-row:hover{background:var(--bg-2);border-color:var(--brd-l);transform:translateX(3px)}
.theme-name{font-size:13px;font-weight:600;color:var(--t1)}
.theme-meta{font-size:10px;color:var(--t3);margin-top:1px;font-family:'JetBrains Mono',monospace}
.theme-pbar{height:3px;background:var(--bg-3);border-radius:100px;margin-top:5px;overflow:hidden}
.theme-pfill{height:100%;border-radius:100px;transition:width .6s ease}
.theme-pct{font-size:11px;font-weight:700;color:var(--t3);flex-shrink:0;font-family:'JetBrains Mono',monospace}

/* FICHES LAME — bubbles */
.bubble{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  cursor:pointer;transition:transform .18s cubic-bezier(.34,1.56,.64,1);
}
.bubble:active{transform:scale(.88)}
.bubble:hover{transform:translateY(-3px) scale(1.04)}
.bubble-ring{
  width:68px;height:68px;border-radius:50%;
  background:var(--bg-2);border:2px solid var(--bg-4);
  display:flex;align-items:center;justify-content:center;
  position:relative;transition:all .25s;
}
.bubble:hover .bubble-ring{
  border-color:var(--accent-l);
  box-shadow:0 0 16px var(--accent-glow);
}
.bubble.mastered .bubble-ring{
  border-color:var(--gold);background:rgba(212,175,55,.08);
  box-shadow:0 0 14px var(--gold-glow);
}
.bubble.learning .bubble-ring{
  border-color:var(--accent-l);
  box-shadow:0 0 12px var(--accent-glow);
}
.bubble-em{font-size:24px;z-index:1;position:relative}
.bubble-name{
  font-size:8px;font-weight:700;text-align:center;color:var(--t2);
  text-transform:uppercase;letter-spacing:.05em;max-width:78px;
  line-height:1.2;font-family:'JetBrains Mono',monospace;
}
.bubble.mastered .bubble-name{color:var(--gold)}

/* CARDS génériques */
.card{
  background:var(--bg-1);border:1px solid var(--brd);
  border-radius:16px;padding:16px;margin-bottom:12px;
  position:relative;overflow:hidden;
}
.card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(255,255,255,.02),transparent);
  pointer-events:none;
}

/* BADGES */
.badge-circle{
  width:54px;height:54px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-size:22px;
  border:2px solid var(--brd);background:var(--bg-2);
  transition:all .3s cubic-bezier(.34,1.56,.64,1);
}
.badge-item.unlocked .badge-circle{
  border-color:var(--gold);background:rgba(212,175,55,.12);
  box-shadow:0 0 18px var(--gold-glow);
  animation:popIn .4s cubic-bezier(.34,1.56,.64,1);
}

/* TOAST premium */
.toast{
  background:rgba(13,17,23,.95);
  border:1px solid rgba(255,255,255,.1);
  border-radius:14px;padding:11px 18px;
  font-size:13px;font-weight:600;color:var(--t1);
  box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.03);
  white-space:nowrap;
  animation:toastIn .3s cubic-bezier(.34,1.56,.64,1),toastOut .3s ease 2.7s both;
  backdrop-filter:blur(20px);
  display:flex;align-items:center;gap:8px;
}
.toast::before{font-size:15px}
.toast.ok{border-color:rgba(16,185,129,.35);color:var(--ok)}
.toast.ok::before{content:'✓'}
.toast.err{border-color:rgba(239,68,68,.35);color:var(--err)}
.toast.err::before{content:'✕'}
@keyframes toastIn{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes toastOut{to{opacity:0;transform:translateY(8px)}}

/* SECTION LABELS */
.sect-label{
  font-size:10px;font-weight:700;color:var(--t3);
  text-transform:uppercase;letter-spacing:.12em;
  margin-bottom:12px;margin-top:4px;
  display:flex;align-items:center;gap:8px;
}
.sect-label::before{
  content:'';flex:0 0 3px;height:14px;
  background:linear-gradient(180deg,var(--accent-l),var(--accent));
  border-radius:4px;box-shadow:0 0 6px rgba(59,130,246,.4);
}
.sect-label::after{content:'';flex:1;height:1px;background:var(--brd)}

/* INPUTS premium */
.inp{
  width:100%;max-width:100%;
  box-sizing:border-box;
  background:var(--bg-2);border:1px solid var(--bg-4);
  border-radius:12px;padding:12px 14px;font-size:16px;
  color:var(--t1);font-family:'Inter',sans-serif;outline:none;
  transition:border-color var(--tr),box-shadow var(--tr);
}
.inp:focus{
  border-color:var(--accent-l);
  box-shadow:0 0 0 3px var(--accent-glow),0 0 12px rgba(37,99,235,.1);
}

/* BLITZ — hyper engageant */
.blitz-q{
  font-family:'Syne',sans-serif;
  font-size:20px;font-weight:800;color:var(--t1);
  line-height:1.4;margin-bottom:30px;max-width:440px;
  text-align:center;letter-spacing:-.02em;
}
.blitz-btn{
  padding:18px;border-radius:18px;border:2px solid transparent;
  font-size:15px;font-weight:700;font-family:'Inter',sans-serif;
  cursor:pointer;transition:all .15s cubic-bezier(.34,1.56,.64,1);
}
.blitz-btn-ko{background:var(--err-bg);border-color:rgba(239,68,68,.25);color:var(--err)}
.blitz-btn-ok{background:var(--ok-bg);border-color:rgba(16,185,129,.25);color:var(--ok)}
.blitz-btn-ko:active,.blitz-btn-ko.sel{background:var(--err);border-color:var(--err);color:#fff;transform:scale(.96)}
.blitz-btn-ok:active,.blitz-btn-ok.sel{background:var(--ok);border-color:var(--ok);color:#fff;transform:scale(.96)}
.blitz-btn:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.3)}

/* PROC FICHE bottom sheet */
.pf-ov{
  position:fixed;inset:0;display:none;align-items:flex-end;
  z-index:200;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);
}
.pf-sheet{
  background:var(--bg-1);border-radius:24px 24px 0 0;
  border-top:1px solid var(--brd-l);
  width:100%;max-width:600px;margin:0 auto;
  max-height:88dvh;overflow-y:auto;
  animation:sheetUp .3s cubic-bezier(.25,.46,.45,.94);
  box-shadow:0 -8px 48px rgba(0,0,0,.6);
}

/* CARTOUCHES */
.cart-field{display:flex;align-items:baseline;gap:8px;padding:9px 0;border-bottom:1px solid var(--brd)}
.cart-lbl{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;flex-shrink:0;min-width:115px;font-family:'JetBrains Mono',monospace}
.cart-val{font-size:13px;color:var(--t1);flex:1}
.cart-val.critical{color:var(--accent-l);font-weight:700}
.cart-piege{background:var(--err-bg);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:11px 13px;margin-top:8px}
.cart-piege-lbl{font-size:9px;font-weight:700;color:var(--err);text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px}

/* PRINT CARDS */
.print-card{
  background:var(--bg-1);border:1px solid var(--brd);border-radius:16px;
  padding:14px;display:flex;align-items:center;gap:12px;
  cursor:pointer;transition:all var(--tr);margin-bottom:8px;
  position:relative;overflow:hidden;
}
.print-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.02),transparent);pointer-events:none;
}
.print-card:hover{background:var(--bg-2);border-color:var(--brd-l);transform:translateX(4px)}
.print-card-em{font-size:28px;flex-shrink:0}
.print-card-title{font-size:13px;font-weight:700;color:var(--t1)}
.print-card-sub{font-size:10px;color:var(--t3);margin-top:2px;font-family:'JetBrains Mono',monospace}

/* PROFIL */
.profil-av{font-size:56px;text-align:center;margin-bottom:4px;padding-top:8px;
  animation:float 3s ease-in-out infinite alternate;
}
@keyframes float{from{transform:translateY(0)}to{transform:translateY(-5px)}}
.profil-name{
  font-family:'Syne',sans-serif;font-size:24px;font-weight:900;
  color:var(--t1);text-align:center;letter-spacing:-.03em;margin-bottom:2px;
}
.profil-grade{
  font-size:11px;color:var(--t3);text-align:center;margin-bottom:16px;
  text-transform:uppercase;letter-spacing:.08em;font-family:'JetBrains Mono',monospace;
}
.profil-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.profil-stat{
  background:var(--bg-1);border:1px solid var(--brd);
  border-radius:14px;padding:13px;text-align:center;
  transition:all var(--tr);
}
.profil-stat:hover{border-color:var(--brd-l);transform:translateY(-2px)}
.ps-val{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;color:var(--accent-l)}
.ps-lbl{font-size:9px;color:var(--t3);margin-top:3px;text-transform:uppercase;letter-spacing:.07em}

/* SCROLL CUSTOM */
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bg-4);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:var(--t3)}

/* STREAK DANGER */
.streak-danger-ov{
  position:fixed;inset:0;background:rgba(239,68,68,.12);z-index:300;
  display:none;align-items:center;justify-content:center;
  backdrop-filter:blur(8px);
}

/* REV TABS */
.rev-tab{
  flex-shrink:0;padding:7px 14px;border-radius:100px;
  font-size:11px;font-weight:600;cursor:pointer;
  background:var(--bg-2);color:var(--t2);border:1px solid var(--brd);
  font-family:'Inter',sans-serif;transition:all var(--tr);
}
.rev-tab.active{
  background:var(--accent);color:#fff;border-color:var(--accent-l);
  box-shadow:0 0 14px rgba(37,99,235,.35);
}
.rev-tab:hover:not(.active){background:var(--bg-3)}

/* EXAMEN PAGE */
.exam-hero{
  background:linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.03));
  border:1px solid rgba(239,68,68,.2);border-radius:20px;
  padding:18px;margin-bottom:14px;
  box-shadow:0 0 24px rgba(239,68,68,.06);
}
.exam-hero h3{
  font-family:'Syne',sans-serif;font-size:17px;
  font-weight:900;color:var(--err);margin-bottom:5px;
}
.exam-hero p{font-size:12px;color:var(--t2);line-height:1.6}
.mode-card{
  background:var(--bg-1);border:1px solid var(--brd);border-radius:18px;
  padding:16px;margin-bottom:9px;cursor:pointer;transition:all var(--tr);
  display:flex;gap:14px;align-items:flex-start;position:relative;overflow:hidden;
}
.mode-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.02),transparent);pointer-events:none;
}
.mode-card:hover{
  background:var(--bg-2);border-color:var(--brd-l);
  transform:translateY(-2px);box-shadow:var(--sh);
}
.mode-ico{
  width:46px;height:46px;border-radius:14px;
  display:flex;align-items:center;justify-content:center;font-size:20px;
  flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.25);
}
.mode-inf h4{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:3px}
.mode-inf p{font-size:11px;color:var(--t2);line-height:1.55}

/* ONBOARDING */
.onb-logo{font-size:52px;text-align:center;margin-bottom:10px;animation:float 3s ease-in-out infinite alternate}

/* BOTTOM NAV — ultra pro */
.bnav{
  position:fixed;bottom:0;left:0;right:0;
  height:calc(var(--nav-h) + var(--safe-b));
  padding-bottom:var(--safe-b);
  background:rgba(6,9,16,.95);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  border-top:1px solid rgba(255,255,255,.05);
  display:flex;align-items:flex-start;padding-top:2px;
  z-index:100;
}
.nav-btn{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:9px 4px 7px;background:none;border:none;cursor:pointer;min-height:var(--tap-h);
  color:var(--t3);font-family:'JetBrains Mono',monospace;
  font-size:9px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;
  transition:color var(--tr),transform var(--tr);
  position:relative;
}
.nav-btn::before{
  content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:0;height:2px;background:var(--accent-l);border-radius:0 0 2px 2px;
  transition:width var(--tr);
}
.nav-btn.active{color:var(--accent-l);transform:translateY(-1px)}
.nav-btn.active::before{width:22px}
.nav-icon{
  width:22px;height:22px;
  display:flex;align-items:center;justify-content:center;
  transition:transform var(--tr);
}
.nav-btn.active .nav-icon{transform:translateY(-1px)}
.nav-btn.active .nav-icon svg{stroke:var(--accent-l)!important}
.nav-btn:not(.active) .nav-icon svg{stroke:var(--t3)!important}

/* APP HEADER */
.app-hdr{
  position:fixed;top:0;left:0;right:0;
  height:calc(var(--hdr-h) + var(--safe-t));padding-top:var(--safe-t);
  background:rgba(6,9,16,.92);backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.05);
  display:flex;align-items:center;
  padding-left:16px;padding-right:16px;gap:10px;z-index:100;
}
.hdr-logo{
  font-family:'Syne',sans-serif;
  font-size:16px;font-weight:900;color:var(--t1);
  letter-spacing:-.03em;flex:1;
}
.hdr-logo span{color:var(--accent-l)}
.hdr-badge{
  font-family:'JetBrains Mono',monospace;font-size:9px;
  background:linear-gradient(135deg,var(--accent),var(--violet));
  color:#fff;padding:2px 7px;border-radius:6px;
  font-weight:600;letter-spacing:.04em;
}
.hdr-xp{
  font-family:'JetBrains Mono',monospace;font-size:12px;
  color:var(--gold);font-weight:600;flex-shrink:0;
}

/* SEARCH */
.search-wrap{position:relative;margin-bottom:14px}
.search-inp{
  width:100%;background:var(--bg-2);border:1px solid var(--bg-4);
  border-radius:14px;padding:10px 40px;font-size:13px;color:var(--t1);
  font-family:'Inter',sans-serif;outline:none;
  transition:border-color var(--tr),box-shadow var(--tr);
}
.search-inp:focus{
  border-color:var(--accent-l);
  box-shadow:0 0 0 3px var(--accent-glow),0 0 12px rgba(37,99,235,.08);
}
.search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none}
.search-clear{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--t3);font-size:15px;cursor:pointer;display:none}

/* PAGE TRANSITIONS */
.page{max-width:560px;margin:0 auto;padding:14px var(--page-px) 40px;animation:pgIn .22s ease both}
@keyframes pgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* PROGRESS RING */
.ring-wrap{position:relative;flex-shrink:0}
.ring-wrap svg{transform:rotate(-90deg)}
.ring-bg{fill:none;stroke:var(--bg-3);stroke-width:3}
.ring-prog{fill:none;stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset .7s ease}

/* FAB */
.fab{
  position:fixed;right:16px;bottom:calc(var(--nav-h) + var(--safe-b) + 12px);
  width:52px;height:52px;border-radius:50%;
  background:linear-gradient(135deg,var(--accent),var(--accent-l));
  border:none;cursor:pointer;z-index:90;
  display:flex;align-items:center;justify-content:center;font-size:20px;
  box-shadow:0 4px 20px rgba(37,99,235,.45),0 0 0 1px rgba(255,255,255,.1);
  transition:all .2s cubic-bezier(.34,1.56,.64,1);
}
.fab:hover{transform:scale(1.1) translateY(-2px);box-shadow:0 8px 28px rgba(37,99,235,.55)}
.fab:active{transform:scale(.92)}

/* FOCUS a11y */
:focus-visible{outline:2px solid var(--accent-l);outline-offset:2px}

/* PREFERS REDUCED MOTION */
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}



/* ═══════════════════════════════════════════
   EXTRAS DESIGN v30 — polissage final
   ═══════════════════════════════════════════ */

/* FSRS WIDGET */
.fsrs-widget{
  display:flex;align-items:center;gap:12px;
  background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(37,99,235,.03));
  border:1px solid rgba(59,130,246,.2);border-radius:16px;
  padding:14px 16px;margin-bottom:12px;cursor:pointer;
  transition:all var(--tr);
}
.fsrs-widget:hover{
  border-color:rgba(59,130,246,.35);
  box-shadow:0 0 20px rgba(37,99,235,.12);
  transform:translateY(-1px);
}
.fsrs-count{
  font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;
  color:var(--accent-l);line-height:1;min-width:44px;
}
.fsrs-count.urgent{color:var(--err)}
.fsrs-count.fresh{color:var(--ok)}
.fsrs-inf-title{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:2px}
.fsrs-inf-sub{font-size:11px;color:var(--t2)}
.fsrs-arrow{margin-left:auto;color:var(--t3);font-size:16px}

/* EXAM COUNTDOWN */
.exam-countdown{
  display:flex;flex-direction:column;align-items:center;
  background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.03));
  border:1px solid rgba(212,175,55,.2);border-radius:18px;
  padding:18px;margin-bottom:12px;text-align:center;
  box-shadow:0 0 20px rgba(212,175,55,.06);
}
.exam-countdown-days{
  font-family:'JetBrains Mono',monospace;font-size:42px;font-weight:700;
  color:var(--gold);line-height:1;
  text-shadow:0 0 20px rgba(212,175,55,.3);
}
.exam-countdown-lbl{font-size:10px;color:var(--t3);margin-top:6px;text-transform:uppercase;letter-spacing:.1em}

/* CHAPTER PROGRESS BARS */
.ch-prog-row{
  display:flex;align-items:center;gap:10px;
  padding:9px 0;border-bottom:1px solid var(--brd);
}
.ch-prog-row:last-child{border-bottom:none}
.ch-prog-icon{font-size:16px;width:22px;text-align:center;flex-shrink:0}
.ch-prog-inf{flex:1;min-width:0}
.ch-prog-name{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:4px}
.ch-prog-bar{height:4px;background:var(--bg-3);border-radius:100px;overflow:hidden}
.ch-prog-fill{height:100%;border-radius:100px;transition:width .6s ease;box-shadow:0 0 6px rgba(59,130,246,.3)}
.ch-prog-pct{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--t3);flex-shrink:0;width:30px;text-align:right}

/* BANNERS & ALERTS */
.info-banner{
  display:flex;align-items:flex-start;gap:10px;
  padding:12px 14px;background:var(--bg-1);
  border:1px solid var(--brd);border-radius:14px;margin-bottom:12px;
}
.info-banner.accent{
  background:rgba(37,99,235,.05);border-color:rgba(59,130,246,.2);
}
.info-banner.gold{
  background:rgba(212,175,55,.05);border-color:rgba(212,175,55,.2);
}

/* TAGS */
.tag{
  font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;
  padding:2px 7px;border-radius:5px;letter-spacing:.04em;
  display:inline-flex;align-items:center;gap:3px;
}
.tag-accent{background:var(--accent-glow);color:var(--accent-l);border:1px solid var(--brd-acc)}
.tag-gold{background:var(--gold-glow);color:var(--gold);border:1px solid rgba(212,175,55,.2)}
.tag-ok{background:var(--ok-bg);color:var(--ok)}
.tag-err{background:var(--err-bg);color:var(--err)}
.tag-warn{background:var(--warn-bg);color:var(--warn)}

/* ACTIVITY BARS */
.activity-bars{display:flex;align-items:flex-end;gap:2px;height:52px}
.activity-bar{
  flex:1;background:var(--bg-3);border-radius:3px 3px 0 0;
  transition:height .4s ease;cursor:default;min-height:4px;
}
.activity-bar.active{
  background:linear-gradient(180deg,var(--accent-l),var(--accent));
  box-shadow:0 0 6px rgba(59,130,246,.3);
}
.activity-bar.streak{
  background:linear-gradient(180deg,var(--gold-l),var(--gold));
  box-shadow:0 0 6px rgba(212,175,55,.3);
}

/* LESSON MODAL */
.lesson-ov{
  position:fixed;inset:0;display:none;
  align-items:flex-end;z-index:200;
  background:rgba(0,0,0,.72);backdrop-filter:blur(12px);
}
.lesson-ov.on{display:flex;animation:pgIn .2s ease}
.lesson-sheet{
  width:100%;max-width:600px;margin:0 auto;
  max-height:93dvh;overflow-y:auto;
  background:var(--bg-1);border-radius:24px 24px 0 0;
  border-top:1px solid rgba(255,255,255,.08);
  animation:sheetUp .3s cubic-bezier(.25,.46,.45,.94);
  box-shadow:0 -12px 60px rgba(0,0,0,.7);
}
.sheet-handle{
  width:40px;height:5px;background:rgba(255,255,255,.15);
  border-radius:3px;margin:14px auto 0;cursor:pointer;
  transition:background var(--tr);
}
.sheet-handle:hover{background:rgba(255,255,255,.3)}

/* BLITZ OVERLAY */
.blitz-ov{
  position:fixed;inset:0;background:var(--bg-0);
  z-index:250;display:none;flex-direction:column;
}
.blitz-ov.show{display:flex;animation:pgIn .2s ease}
.blitz-timer-bar{height:5px;background:var(--bg-3);flex:1;border-radius:100px;overflow:hidden}
.blitz-timer-fill{
  height:100%;
  background:linear-gradient(90deg,var(--ok),var(--warn),var(--err));
  border-radius:100px;transition:width .5s linear;
}
.blitz-body{
  flex:1;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:24px;text-align:center;
}

/* DEFI card done state */
.defi-card.defi-done{
  background:linear-gradient(135deg,rgba(16,185,129,.08),rgba(16,185,129,.03));
  border-color:rgba(16,185,129,.25);
}
.defi-done .defi-badge{background:var(--ok-bg);border-color:rgba(16,185,129,.2);color:var(--ok)}
.defi-done .defi-title{color:var(--ok)}

/* BOUTONS */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  padding:12px 18px;border-radius:12px;border:none;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:600;
  cursor:pointer;transition:all var(--tr);white-space:nowrap;
}
.btn-p{
  background:linear-gradient(135deg,var(--accent),var(--accent-l));
  color:#fff;width:100%;padding:14px;font-size:15px;border-radius:14px;
  box-shadow:0 4px 16px rgba(37,99,235,.3);
}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,99,235,.4)}
.btn-p:active{transform:scale(.97)}
.btn-gold{
  background:linear-gradient(135deg,var(--gold),var(--gold-l));
  color:#1a1200;width:100%;padding:14px;font-size:15px;border-radius:14px;font-weight:700;
  box-shadow:0 4px 16px rgba(212,175,55,.25);
}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,175,55,.35)}
.btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--brd-l)}
.btn-ghost:hover{background:var(--bg-3)}
.btn-full{width:100%}
.btn-sm{padding:8px 13px;font-size:12px;border-radius:8px}
.btn-danger{background:var(--err-bg);color:var(--err);border:1px solid rgba(239,68,68,.25)}

/* PRO CARD */
.pro-price-card{
  background:linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.04));
  border:1px solid rgba(212,175,55,.3);border-radius:20px;
  padding:22px;text-align:center;margin-bottom:16px;
  box-shadow:0 0 32px rgba(212,175,55,.1);
}
.pro-price{
  font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:700;color:var(--gold);
  text-shadow:0 0 20px rgba(212,175,55,.3);
}


/* iOS — Prevent input zoom */
input,select,textarea,.inp{font-size:16px!important;box-sizing:border-box!important;max-width:100%!important}
@media (min-width:400px){input,select,textarea,.inp{font-size:16px!important;box-sizing:border-box!important;max-width:100%!important}}


/* ══ PROC GROUPS v33 ══ */
.proc-group{margin-bottom:18px}
.proc-group-hd{
  display:flex;align-items:center;gap:9px;padding:10px 14px;
  border-radius:var(--r-m);margin-bottom:8px;cursor:pointer;
  border:1px solid rgba(255,255,255,.06);
  user-select:none;
}
.proc-group-hd-left{display:flex;align-items:center;gap:9px;flex:1;min-width:0}
.proc-group-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
.proc-group-title{font-size:13px;font-weight:800;color:var(--t1);letter-spacing:.01em;font-family:'Syne',sans-serif}
.proc-group-sub{font-size:10px;color:var(--t3);font-family:'JetBrains Mono',monospace;margin-top:1px}
.proc-group-badge{font-size:9px;font-weight:700;padding:3px 7px;border-radius:20px;margin-left:auto;flex-shrink:0;font-family:'JetBrains Mono',monospace}
.proc-group-arrow{font-size:14px;color:var(--t3);margin-left:6px;transition:transform .2s;flex-shrink:0}
.proc-group-hd.collapsed .proc-group-arrow{transform:rotate(-90deg)}
.proc-group-items{display:flex;flex-direction:column;gap:5px}
.proc-group-items.hidden{display:none}

.proc-card{
  display:flex;align-items:center;gap:11px;padding:11px 13px;
  background:var(--bg-1);border:1px solid var(--brd);
  border-radius:var(--r-m);cursor:pointer;
  transition:border-color .18s,background .18s;
  position:relative;overflow:hidden;
}
.proc-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px;background:var(--proc-color,var(--brd))}
.proc-card:active{background:var(--bg-2)}
.proc-card.done{border-color:rgba(212,175,55,.25);background:rgba(212,175,55,.04)}
.proc-card.done::after{content:'✓';position:absolute;right:11px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--gold)}
.proc-card-num{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;font-family:'JetBrains Mono',monospace;flex-shrink:0}
.proc-card-body{flex:1;min-width:0}
.proc-card-nm{font-size:13px;font-weight:700;color:var(--t1);line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.proc-card-ref{font-size:10px;color:var(--t3);font-family:'JetBrains Mono',monospace;margin-top:2px}
.proc-card-dur{font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;margin-left:auto;flex-shrink:0;white-space:nowrap}
.proc-card.done .proc-card-dur{opacity:0}

.proc-summary-bar{
  display:flex;align-items:center;gap:10px;padding:12px 14px;
  background:var(--bg-1);border:1px solid var(--brd);
  border-radius:var(--r-m);margin-bottom:14px;
}
.proc-summary-bar-track{flex:1;height:6px;background:var(--bg-4);border-radius:3px;overflow:hidden}
.proc-summary-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--accent-l));transition:width .4s}
.proc-summary-txt{font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--t2);white-space:nowrap}

/* ══ LP CARDS v33 ══ */
.lp-header{padding:16px 0 12px;margin-bottom:4px}
.lp-header-title{font-size:18px;font-weight:900;color:var(--t1);font-family:'Syne',sans-serif}
.lp-header-sub{font-size:11px;color:var(--t3);margin-top:3px;font-family:'JetBrains Mono',monospace}
.lp-progress-row{display:flex;align-items:center;gap:10px;margin-top:10px}
.lp-progress-track{flex:1;height:6px;background:var(--bg-4);border-radius:3px;overflow:hidden}
.lp-progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#d4af37,#f0c040);transition:width .4s}
.lp-progress-txt{font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--gold)}

.lp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding-bottom:20px}
@media(max-width:360px){.lp-grid{grid-template-columns:1fr}}

.lp-card{
  border-radius:16px;background:var(--bg-1);
  border:1.5px solid var(--brd);cursor:pointer;
  overflow:hidden;transition:border-color .18s,transform .1s;
  display:flex;flex-direction:column;
}
.lp-card:active{transform:scale(.97)}
.lp-card.done{border-color:rgba(212,175,55,.35)}
.lp-card-hero{padding:14px 14px 10px;display:flex;flex-direction:column;gap:6px;position:relative;flex:1}
.lp-card-em{font-size:28px;line-height:1;filter:drop-shadow(0 3px 8px rgba(0,0,0,.3))}
.lp-card-source{font-size:8px;font-weight:800;padding:2px 6px;border-radius:20px;width:fit-content;letter-spacing:.06em;font-family:'JetBrains Mono',monospace;text-transform:uppercase}
.lp-card-nm{font-size:13px;font-weight:800;color:var(--t1);line-height:1.3;font-family:'Syne',sans-serif}
.lp-card-ref{font-size:9px;color:var(--t3);font-family:'JetBrains Mono',monospace;line-height:1.4}
.lp-card-def{font-size:10.5px;color:var(--t2);line-height:1.5;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lp-card-footer{padding:8px 14px;border-top:1px solid var(--brd);display:flex;align-items:center;justify-content:space-between}
.lp-card-done-badge{font-size:9px;font-weight:700;color:var(--gold);font-family:'JetBrains Mono',monospace}
.lp-card-arr{font-size:14px;color:var(--t3)}
.lp-card.done .lp-card-footer{background:rgba(212,175,55,.05)}
</style></head><body>
${content}
<footer>OPJ Elite v50.0 — Fiche pédagogique — À usage privé uniquement</footer>
</body></html>`);
    w.document.close();w.focus();
    setTimeout(()=>{w.print();},500);
  }
};

/* ─── RENDER ANNALES ─── */


/* ─── RENDER PROC LIST (from PB) ─── */
function renderProcList(){
  const el=document.getElementById('proc-list-rev');if(!el)return;
  if(typeof PB==='undefined'||!PB.length){el.innerHTML='<div class="empty-state"><span class="empty-state-em">📋</span>Aucune procédure disponible</div>';return;}
  const pfs=S.pfs||{};
  const doneCount=PB.filter(p=>pfs[p.id]==='m').length;
  const pct=Math.round(doneCount/PB.length*100);

  const GROUPS=[
    {id:'gav',  label:'Garde à Vue',              em:'🔒',color:'#3b82f6',ids:['P01','P02','P03'],sub:'Art. 62-2 · 63 · 706-88 CPP',diff:1},
    {id:'enq',  label:'Cadres d\'enquête',          em:'🔍',color:'#f59e0b',ids:['P04','P05','P06'],sub:'Art. 53 · 75 · 151 CPP',diff:2},
    {id:'perid',label:'Perquisitions & Identité',   em:'🏠',color:'#8b5cf6',ids:['P07','P08'],sub:'Art. 56 · 76 · 78-1 CPP',diff:2},
    {id:'mand', label:'Mandats & Sûreté',           em:'⛓️',color:'#ec4899',ids:['P09','P12','P13','P14','P15'],sub:'Art. 122 · 137 · 143-1 CPP',diff:3},
    {id:'min',  label:'Mineurs & CJPM',             em:'👶',color:'#22d3ee',ids:['P10','P16'],sub:'CJPM — Loi 26/09/2021',diff:2},
    {id:'ap',   label:'Action publique & Suites',   em:'⚖️',color:'#10b981',ids:['P18','P21','P23','P24','P25'],sub:'Art. 6 · 40-1 · 41-1 CPP',diff:3},
    {id:'prv',  label:'Preuve, Nullités & TSE',     em:'🔬',color:'#ef4444',ids:['P11','P19','P20','P28'],sub:'Art. 100 · 171 · 427 CPP',diff:3},
    {id:'inst', label:'Instruction judiciaire',     em:'🏛️',color:'#0ea5e9',ids:['P26','P27'],sub:'Art. 80 · 175 · 185 CPP',diff:3},
    {id:'jug',  label:'Jugement & Recours',         em:'🎓',color:'#6366f1',ids:['P17','P29','P30','P31','P32','P36'],sub:'Art. 381 · 231 · 496 CPP',diff:4},
    {id:'ctrl', label:'Contrôle & Fichiers',        em:'🗃️',color:'#a855f7',ids:['P22','P35','P37','P38'],sub:'Art. 224 · 230-6 CPP · RGPD',diff:2},
    {id:'intl', label:'Coopération internationale', em:'🌍',color:'#14b8a6',ids:['P33','P34'],sub:'Art. 695-11 CPP · Conventions',diff:4},
  ];

  const diffLabel=['','Fondamental','Intermédiaire','Avancé','Expert'];
  const diffColor=['','#10b981','#f59e0b','#ef4444','#8b5cf6'];

  let html=`
  <div class="proc-hero">
    <div class="proc-hero-left">
      <div class="proc-hero-title">📋 Procédure Pénale</div>
      <div class="proc-hero-sub">${PB.length} fiches · CPP & CJPM</div>
    </div>
    <div class="proc-hero-ring">
      <svg width="64" height="64" viewBox="0 0 64 64" style="transform:rotate(-90deg)">
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-3)" stroke-width="5"/>
        <circle cx="32" cy="32" r="26" fill="none" stroke="url(#procGrad)" stroke-width="5"
          stroke-linecap="round" stroke-dasharray="163.4"
          stroke-dashoffset="${(163.4*(1-pct/100)).toFixed(1)}"/>
        <defs><linearGradient id="procGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#d4af37"/>
        </linearGradient></defs>
      </svg>
      <div class="proc-hero-pct">${pct}%</div>
    </div>
  </div>
  <div class="proc-stats-row">
    <div class="proc-stat"><div class="proc-stat-v">${doneCount}</div><div class="proc-stat-l">Maîtrisées</div></div>
    <div class="proc-stat"><div class="proc-stat-v">${PB.length-doneCount}</div><div class="proc-stat-l">Restantes</div></div>
    <div class="proc-stat"><div class="proc-stat-v">${GROUPS.length}</div><div class="proc-stat-l">Chapitres</div></div>
  </div>`;

  GROUPS.forEach((g,gi)=>{
    const items=PB.filter(p=>g.ids.includes(p.id));
    if(!items.length)return;
    const gDone=items.filter(p=>pfs[p.id]==='m').length;
    const gPct=Math.round(gDone/items.length*100);
    const completed=gDone===items.length;
    const dc=diffColor[g.diff]||'#6366f1';
    html+=`
    <div class="proc-group2" style="animation:fadeUp .2s ${gi*0.04}s both">
      <div class="proc-group2-hd" style="--gc:${g.color}" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('show')">
        <div class="proc-group2-ico" style="background:${g.color}20;border:2px solid ${g.color}40">${g.em}</div>
        <div class="proc-group2-inf">
          <div class="proc-group2-title">${g.label}</div>
          <div class="proc-group2-meta">
            <span class="proc-diff-tag" style="background:${dc}18;color:${dc}">${diffLabel[g.diff]}</span>
            <span class="proc-group2-sub">${g.sub}</span>
          </div>
          <div class="proc-group2-bar">
            <div class="proc-group2-bar-fill" style="width:${gPct}%;background:${g.color}"></div>
          </div>
        </div>
        <div class="proc-group2-right">
          ${completed
            ? `<div class="proc-group2-done">✓</div>`
            : `<div class="proc-group2-count" style="color:${g.color}">${gDone}<span>/${items.length}</span></div>`
          }
          <div class="proc-group2-arrow">›</div>
        </div>
      </div>
      <div class="proc-group2-items">
        ${items.map((p,pi)=>{
          const done=pfs[p.id]==='m';
          return`<div class="proc-card2${done?' done':''}" onclick="PFM.open('${p.id}')" style="animation:fadeUp .15s ${pi*0.03}s both">
            <div class="proc-card2-left">
              <div class="proc-card2-num" style="background:${g.color}${done?'':'18'};color:${done?'#fff':g.color};${done?`border-color:${g.color}`:''}">
                ${done?'✓':p.id.replace('P','')}
              </div>
            </div>
            <div class="proc-card2-body">
              <div class="proc-card2-nm">${p.nm}</div>
              <div class="proc-card2-ref">${p.ref}${p.duree?` · ⏱ ${p.duree.split('.')[0]}`:''}${p.piege?' · ⚠️':''}</div>
            </div>
            <div class="proc-card2-arr" style="color:${done?'var(--gold)':'var(--t3)'}">›</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  el.innerHTML=html;
}


/* ─── DÉFI QUOTIDIEN ─── */
const DEFI={
  getTodayKey(){return new Date().toDateString();},
  getSeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();},
  pick(){
    const seed=DEFI.getSeed();
    const ficheIdx=seed%FB.length;
    const qPool=QB.filter(q=>q.diff>=2);
    const theme=(qPool[seed%qPool.length]||QB[0]).cat;
    return{fiche:FB[ficheIdx],theme};
  },
  isDone(){return S.defi?.lastDate===DEFI.getTodayKey()&&S.defi?.done;},
  markDone(){S.defi={lastDate:DEFI.getTodayKey(),done:true};save();DEFI.renderWidget();},
  getCountdown(){
    const now=new Date();const midnight=new Date(now);midnight.setHours(24,0,0,0);
    const diff=midnight-now;const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000);
    return`${String(h).padStart(2,'0')}h${String(m).padStart(2,'0')}`;
  },
  renderWidget(){
    const el=document.getElementById('h-defi-widget');if(!el)return;
    const{fiche,theme}=DEFI.pick();
    const done=DEFI.isDone();
    const bonus=new Date().getHours()<22;
    el.innerHTML=`<div class="defi-card${done?' defi-done':''}">
      <div class="defi-badge">${done?'✅ ACCOMPLI':'🎯 DÉFI DU JOUR'}${bonus&&!done?' · <span style="color:var(--gold)">⚡ XP×2 avant 22h</span>':''}</div>
      <div class="defi-title">Infraction du jour : ${fiche.nm}</div>
      <div class="defi-sub">${done?`Prochain défi dans`:`Mémorise la fiche, puis relève le défi flash (5 QCM)`}</div>
      ${done?`<div class="defi-countdown">⏱ ${DEFI.getCountdown()}</div>`:`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <button class="btn btn-ghost btn-sm" onclick="openFiche('${fiche.id}');DEFI.markDone()">📖 Voir fiche</button>
        <button class="btn btn-p btn-sm" onclick="DEFI.startFlash('${theme}')">⚡ Défi flash</button>
      </div>`}
    </div>`;
  },
  startFlash(cat){
    DEFI.markDone();
    const bonus=new Date().getHours()<22;
    if(bonus)showToast('⚡ Bonus XP×2 activé !','ok');
    const q=QB.filter(x=>x.cat===cat).sort(()=>Math.random()-.5).slice(0,5);
    buildSession(q.length?q:QB.sort(()=>Math.random()-.5).slice(0,5));
    navigateTo('revision');
  }
};

/* ─── BADGES ─── */
const BADGE_DEFS=[
  {id:'b01',emoji:'🌟',name:'Premier Pas',desc:'Première leçon terminée',cond:()=>Object.keys(S.lessons).length>=1},
  {id:'b02',emoji:'🔒',name:'Maître de la GAV',desc:'Toutes les questions GAV réussies',cond:()=>QB.filter(q=>q.cat==='GAV').every(q=>(S.qcm.cards[q.id]?.ok||0)>0)},
  {id:'b03',emoji:'🚨',name:'Expert Flagrance',desc:'10 sessions réalisées',cond:()=>(S.user.sessionsDone||0)>=10},
  {id:'b04',emoji:'📚',name:'Encyclopédie',desc:'30 leçons vues',cond:()=>Object.keys(S.lessons).length>=30},
  {id:'b05',emoji:'🔥',name:'Indestructible',desc:'Streak de 7 jours',cond:()=>S.user.streak>=7},
  {id:'b06',emoji:'🏃',name:'Marathonien',desc:'Streak de 30 jours',cond:()=>S.user.streak>=30},
  {id:'b07',emoji:'🎯',name:'Perfectionniste',desc:'Session QCM sans erreur (10+ questions)',cond:()=>(S.perfectSessions||0)>=1},
  {id:'b08',emoji:'⚖️',name:'Procédurier',desc:'Maîtriser les procédures de base',cond:()=>CHAPTERS.filter(c=>['ch1','ch2','ch3','ch4'].includes(c.id)).flatMap(c=>c.lessons).every(l=>S.lessons[l.id])},
  {id:'b09',emoji:'📞',name:'CR Master',desc:'CR Timer complété 10 fois',cond:()=>(S.crDone||0)>=10},
  {id:'b10',emoji:'🕵️',name:'Chasseur de Pièges',desc:'20 questions difficiles réussies',cond:()=>QB.filter(q=>q.diff===3&&(S.qcm.cards[q.id]?.ok||0)>0).length>=20},
  {id:'b11',emoji:'👑',name:'Roi des Mandats',desc:'Toutes les questions Mandats maîtrisées',cond:()=>QB.filter(q=>q.cat==='MANDATS').every(q=>(S.qcm.cards[q.id]?.ok||0)>0)},
  {id:'b12',emoji:'🏆',name:'Légende OPJ',desc:'10 000 XP atteints',cond:()=>S.user.xp>=10000},
  {id:'b13',emoji:'🧠',name:'Grand Juriste',desc:'5 000 XP atteints',cond:()=>S.user.xp>=5000},
  {id:'b14',emoji:'💡',name:'100 Questions',desc:'100 QCM réalisés',cond:()=>Object.keys(S.qcm.cards).length>=100},
  {id:'b15',emoji:'⚡',name:'Blitz Master',desc:'Score parfait au Blitz',cond:()=>(S.blitzBest||0)>=10},
  {id:'b16',emoji:'🗂️',name:'Classificateur',desc:'3 sessions Classification terminées',cond:()=>(S.classifDone||0)>=3},
  {id:'b17',emoji:'🖨️',name:'Archiviste',desc:'3 fiches imprimées',cond:()=>(S.printDone||0)>=3},
  {id:'b18',emoji:'🎓',name:'OPJ Élite',desc:'Toutes les leçons vues',cond:()=>{const t=CHAPTERS.reduce((a,c)=>a+c.lessons.length,0);return Object.keys(S.lessons).length>=t;}},
  {id:'b19',emoji:'🌙',name:'Noctambule',desc:'Session réalisée après 22h',cond:()=>false},// déclenchée manuellement
  {id:'b20',emoji:'⭐',name:'500 XP',desc:'500 XP gagnés',cond:()=>S.user.xp>=500},
];

const BADGES={
  checkAll(){
    let newUnlocks=[];
    for(const b of BADGE_DEFS){
      if(!S.badges[b.id]){
        try{if(b.cond()){S.badges[b.id]=Date.now();newUnlocks.push(b);}}catch(e){}
      }
    }
    if(newUnlocks.length){save();newUnlocks.forEach((b,i)=>setTimeout(()=>BADGES.showModal(b),i*1400));}
  },
  showModal(b){
    const ov=document.getElementById('badge-unlock-ov');if(!ov)return;
    document.getElementById('bul-emoji').textContent=b.emoji;
    document.getElementById('bul-name').textContent=b.name;
    document.getElementById('bul-desc').textContent=b.desc;
    ov.classList.add('show');
    confetti(false);
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      [[523,.1],[659,.2],[784,.3]].forEach(([freq,t])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.frequency.value=freq;g.gain.setValueAtTime(.2,ctx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+t+.3);
        o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+.4);
      });
    }catch(e){}
  },
  closeModal(){document.getElementById('badge-unlock-ov')?.classList.remove('show');},
  renderGrid(){
    const grid=document.getElementById('pr-badges-grid');if(!grid)return;
    grid.innerHTML=BADGE_DEFS.map(b=>{
      const unlocked=!!S.badges[b.id];
      return`<div class="badge-item ${unlocked?'unlocked':'locked'}" title="${b.desc}">
        <div class="badge-circle">${b.emoji}</div>
        <div class="badge-name">${b.name}</div>
      </div>`;
    }).join('');
  }
};

/* ─── STREAK SHIELD ─── */
const SHIELD={
  checkOnOpen(){
    if(!S.user.name)return;
    const last=S.user.lastActivity;if(!last)return;
    const diffH=(Date.now()-new Date(last))/ 3600000;
    if(diffH>=20&&diffH<48){
      const lastEarned=S.shield?.lastEarned?new Date(S.shield.lastEarned):null;
      if(!lastEarned||(Date.now()-lastEarned)/86400000>=7){
        S.shield={count:(S.shield?.count||0)+1,lastEarned:Date.now()};save();
      }
      setTimeout(()=>SHIELD.showDanger(),1500);
    }
  },
  showDanger(){
    const ov=document.getElementById('streak-danger-ov');if(!ov)return;
    ov.style.display='flex';
    const shields=S.shield?.count||0;
    const info=document.getElementById('streak-shield-info');
    const btn=document.getElementById('use-shield-btn');
    if(info)info.innerHTML=shields>0?`<div class="shield-badge">🛡️ ${shields} bouclier${shields>1?'s':''} disponible${shields>1?'s':''}</div>`:`<div class="text-xs text-muted">Aucun bouclier — rejoue 7 jours de suite pour en gagner un</div>`;
    if(btn)btn.style.display=shields>0?'block':'none';
  },
  dismiss(){const ov=document.getElementById('streak-danger-ov');if(ov)ov.style.display='none';},
  useShield(){
    if((S.shield?.count||0)>0){
      S.shield.count--;S.user.lastActivity=new Date().toDateString();
      save();SHIELD.dismiss();showToast('🛡️ Bouclier utilisé — Streak sauvegardé !','ok');
    }
  }
};

/* ─── BLITZ VRAI/FAUX ─── */
const BLITZ_ASSERTIONS=[
  {q:"La GAV initiale est de 48h en droit commun",ans:false,expl:"24h initiales seulement. 48h = total après prolongation (art. 63 CPP)."},
  {q:"La tentative de contravention est punissable",ans:false,expl:"La tentative n'est JAMAIS punissable pour les contraventions (art. 121-4 CP)."},
  {q:"La présence du bâtonnier est obligatoire lors d'une perquisition dans un cabinet d'avocat",ans:true,expl:"Art. 56-1 CPP : présence du bâtonnier ou son délégué obligatoire."},
  {q:"La prescription d'un délit est de 6 ans depuis la loi du 27 février 2017",ans:true,expl:"La loi du 27/02/2017 a porté la prescription des délits de 3 à 6 ans."},
  {q:"En flagrance, les perquisitions sont limitées à l'horaire 6h-21h",ans:false,expl:"En flagrance, les perquisitions peuvent avoir lieu 24h/24 (art. 59 al.3 CPP)."},
  {q:"L'OPJ peut délivrer des mandats en commission rogatoire",ans:false,expl:"Seul le JI peut délivrer des mandats. L'OPJ en CR ne le peut pas."},
  {q:"La mise en examen renverse la présomption d'innocence",ans:false,expl:"La MEX ne renverse pas la présomption d'innocence. Seule une condamnation définitive le fait."},
  {q:"La GAV en matière de terrorisme peut atteindre 144 heures",ans:true,expl:"Art. 706-88-1 CPP : 144h max en terrorisme, avec JLD dès la 3e tranche."},
  {q:"Le mandat d'amener permet l'incarcération immédiate",ans:false,expl:"Le mandat d'amener conduit la personne devant le juge — pas d'incarcération. C'est le mandat de dépôt."},
  {q:"Le vol en bande organisée est un crime puni de 15 ans RC",ans:true,expl:"Art. 311-9 CP : le vol en bande organisée est un CRIME (15 ans RC). Piège classique."},
  {q:"En enquête préliminaire, la perquisition peut se faire de nuit sans accord",ans:false,expl:"En préliminaire, accord écrit OBLIGATOIRE ou autorisation JLD. Horaires 6h-21h."},
  {q:"La commission rogatoire est délivrée par le Procureur de la République",ans:false,expl:"La CR est délivrée exclusivement par le Juge d'Instruction (art. 151 CPP)."},
  {q:"La récidive légale nécessite une condamnation définitive antérieure",ans:true,expl:"Art. 132-8 CP : la récidive légale exige une condamnation pénale définitive préalable."},
  {q:"Les crimes contre l'humanité se prescrivent par 30 ans",ans:false,expl:"Les crimes contre l'humanité sont IMPRESCRIPTIBLES (art. 213-5 CP)."},
  {q:"La réitération d'infraction entraîne automatiquement le doublement des peines",ans:false,expl:"La réitération ≠ récidive légale. Pas de doublement automatique — juge apprécie librement."},
  {q:"Le droit au silence doit être notifié en audition libre",ans:true,expl:"Art. 61-1 CPP : notification obligatoire du droit au silence dès le début de l'audition libre."},
  {q:"L'avocat peut être différé jusqu'à 24h en criminalité organisée",ans:false,expl:"En CO, l'avocat peut être différé jusqu'à 48h sur autorisation du JLD (pas 24h)."},
  {q:"L'heure de départ de la GAV est l'heure d'arrivée au commissariat",ans:false,expl:"L'heure de GAV = heure d'APPRÉHENSION (art. 63 I al.3 CPP). Le transport est inclus."},
  {q:"Le contrôle judiciaire peut imposer des obligations non listées à l'art. 138 CPP",ans:false,expl:"La liste de l'art. 138 CPP est LIMITATIVE — 17 obligations, le juge ne peut en créer d'autres."},
  {q:"En enquête de flagrance, la durée initiale est de 8 jours",ans:true,expl:"Art. 53 al.1 CPP : 8 jours, prorogeable de 8 jours supplémentaires par le JLD."},
  {q:"Le meurtre se distingue des violences mortelles par l'intention de tuer",ans:true,expl:"Meurtre = animus necandi (intention de tuer). Violences mortelles (222-7) = intention de blesser seulement."},
  {q:"Le blanchiment simple est puni de 3 ans d'emprisonnement",ans:false,expl:"Blanchiment = 5 ans + 375 000 € (art. 324-1 CP). Aggravé BO : 10 ans."},
  {q:"Un mineur de 12 ans peut être placé en garde à vue",ans:false,expl:"La GAV est interdite pour les moins de 13 ans. Retenue judiciaire 12h max possible."},
  {q:"La détention provisoire est décidée par le Juge d'Instruction seul",ans:false,expl:"La DP est toujours décidée par le JLD. Le JI ne peut jamais décider seul."},
  {q:"La composition pénale s'applique aux délits punis jusqu'à 5 ans",ans:true,expl:"Art. 41-2 CPP : composition pénale applicable aux délits punis d'au maximum 5 ans."},
  {q:"Le recel est une infraction instantanée",ans:false,expl:"Le recel est une infraction CONTINUE — elle persiste tant que l'objet frauduleux est détenu."},
  {q:"Le dépistage alcoolémie est obligatoire en cas d'accident corporel",ans:true,expl:"Art. L234-3 Code route : dépistage obligatoire pour tout accident avec dommage corporel."},
  {q:"Le TAJ est le fichier national des empreintes génétiques",ans:false,expl:"Le FNAEG = profils ADN. Le TAJ = fusion STIC (PN) + JUDEX (GN) = antécédents judiciaires."},
  {q:"L'ARSE nécessite que l'infraction soit punie d'au moins 2 ans",ans:true,expl:"Art. 142-5 CPP : ARSE requiert peine minimale de 2 ans d'emprisonnement."},
  {q:"La nullité textuelle nécessite la démonstration d'un grief",ans:false,expl:"Nullité textuelle = automatique dès la violation du texte. Seule la nullité substantielle exige un grief."},
];

const BLITZ={
  _s:{idx:0,score:0,answers:[],timer:null,secs:60,queue:[]},
  start(){
    document.getElementById('blitz-results-ov').style.display='none';
    const q=[...BLITZ_ASSERTIONS].sort(()=>Math.random()-.5).slice(0,10);
    BLITZ._s={idx:0,score:0,answers:[],timer:null,secs:60,queue:q};
    document.getElementById('blitz-ov').classList.add('show');
    BLITZ._render();BLITZ._startTimer();
  },
  _render(){
    const{idx,queue}=BLITZ._s;if(idx>=queue.length){BLITZ._finish();return;}
    const item=queue[idx];
    document.getElementById('blitz-question').textContent=item.q;
    document.getElementById('blitz-counter').textContent=(idx+1)+'/'+queue.length;
    ['blitz-faux','blitz-vrai'].forEach(id=>{
      const btn=document.getElementById(id);if(!btn)return;
      btn.disabled=false;btn.className='blitz-btn '+(id==='blitz-faux'?'blitz-btn-ko':'blitz-btn-ok');
    });
  },
  _startTimer(){
    clearInterval(BLITZ._s.timer);BLITZ._s.secs=60;
    BLITZ._s.timer=setInterval(()=>{
      BLITZ._s.secs--;
      const pct=BLITZ._s.secs/60*100;
      const d=document.getElementById('blitz-timer-fill'),t=document.getElementById('blitz-timer-display');
      if(d)d.style.width=pct+'%';if(t)t.textContent=BLITZ._s.secs;
      if(BLITZ._s.secs<=0){clearInterval(BLITZ._s.timer);BLITZ._finish();}
    },1000);
  },
  answer(userAns){
    const{idx,queue}=BLITZ._s;if(idx>=queue.length)return;
    const item=queue[idx];const correct=userAns===item.ans;
    if(correct){BLITZ._s.score++;haptic(40);}else haptic([40,60,40]);
    BLITZ._s.answers.push({q:item.q,correct,ans:item.ans,expl:item.expl});
    const selId=userAns?'blitz-vrai':'blitz-faux';
    document.getElementById(selId)?.classList.add('sel');
    ['blitz-faux','blitz-vrai'].forEach(id=>document.getElementById(id).disabled=true);
    setTimeout(()=>{BLITZ._s.idx++;BLITZ._render();},380);
  },
  _finish(){
    clearInterval(BLITZ._s.timer);
    const{score,answers}=BLITZ._s;
    const xp=score*8+(score===10?50:0);addXP(xp);
    if(score>(S.blitzBest||0)){S.blitzBest=score;save();}
    document.getElementById('blitz-ov').classList.remove('show');
    document.getElementById('blitz-results-ov').style.display='flex';
    document.getElementById('blitz-res-emoji').textContent=score>=8?'🏆':score>=5?'👍':'💪';
    document.getElementById('blitz-res-score').textContent=score+'/10';
    document.getElementById('blitz-res-xp').textContent='+'+xp+' XP';
    document.getElementById('blitz-review').innerHTML=answers.map(a=>`
      <div style="background:var(--bg-1);border-left:3px solid ${a.correct?'var(--ok)':'var(--err)'};border-radius:0 var(--r-s) var(--r-s) 0;padding:8px 10px;margin-bottom:6px">
        <div class="text-xs fw-700" style="color:${a.correct?'var(--ok)':'var(--err)'}">${a.correct?'✓ CORRECT':'✗ INCORRECT'} — Réponse : ${a.ans?'VRAI':'FAUX'}</div>
        <div class="text-xs text-secondary mt8">${a.expl}</div>
      </div>`).join('');
    if(score===10)confetti(true);BADGES.checkAll();
  },
  stop(){clearInterval(BLITZ._s.timer);document.getElementById('blitz-ov').classList.remove('show');document.getElementById('blitz-results-ov').style.display='none';},
  backToMenu(){document.getElementById('blitz-results-ov').style.display='none';backToRevision();setRevTab('blitz');}
};

/* ─── CLASSIFY ─── */
const CLASSIF_DATA=[
  {nm:'MEURTRE',qual:'Crime'},{nm:'VOL SIMPLE',qual:'Dlit'},{nm:'VIOL',qual:'Crime'},
  {nm:'ESCROQUERIE',qual:'Dlit'},{nm:'USAGE STUPS',qual:'Dlit'},{nm:'RÉBELLION',qual:'Dlit'},
  {nm:'VOL BANDE ORG.',qual:'Crime'},{nm:'EXCÈS DE VITESSE',qual:'Contravention'},
  {nm:'ASSASSINAT',qual:'Crime'},{nm:'RECEL',qual:'Dlit'},{nm:'OUTRAGE',qual:'Dlit'},
  {nm:'ABUS DE CONFIANCE',qual:'Dlit'},{nm:'VIOLENCES ITT>8j',qual:'Dlit'},{nm:'TRAFIC STUPS',qual:'Crime'},
  {nm:'SÉQUESTRATION',qual:'Crime'},{nm:'STATIONNEMENT GÊNANT',qual:'Contravention'},
];
let _dragId=null;
const CLASSIF={
  _s:{items:[],placed:{},validated:false},
  start(){
    const pool=[...CLASSIF_DATA].sort(()=>Math.random()-.5).slice(0,8);
    CLASSIF._s={items:pool,placed:{},validated:false};
    const ov=document.getElementById('classify-ov');if(ov)ov.classList.add('show');
    document.getElementById('classif-result').style.display='none';
    document.getElementById('classif-validate-btn').style.display='none';
    CLASSIF._renderItems();
    ['Crime','Dlit','Contravention'].forEach(c=>{
      const col=document.getElementById('col-'+c);
      if(col)while(col.children.length>1)col.removeChild(col.lastChild);
    });
  },
  _renderItems(){
    const el=document.getElementById('classif-items');if(!el)return;
    el.innerHTML=CLASSIF._s.items.map(it=>{
      const sid=it.nm.replace(/[^a-z0-9]/gi,'_');
      return`<div class="classify-item" draggable="true" id="ci-${sid}"
        ondragstart="CLASSIF.dragStart(event,'${it.nm}')"
        onclick="CLASSIF._tapSelect('${it.nm}')">${it.nm}</div>`;
    }).join('');
  },
  _tapSelect(nm){
    // Mobile: tap item then tap column
    document.querySelectorAll('.classify-item').forEach(x=>x.style.outline='');
    const sid=nm.replace(/[^a-z0-9]/gi,'_');
    const el=document.getElementById('ci-'+sid);
    if(el){el.style.outline='2px solid var(--gold)';CLASSIF._selected=nm;}
  },
  dragStart(e,nm){_dragId=nm;e.dataTransfer.effectAllowed='move';},
  dragOver(e,col){e.preventDefault();document.getElementById('col-'+col)?.classList.add('drag-over');},
  dragLeave(e){e.currentTarget.classList.remove('drag-over');},
  drop(e,col){
    e.preventDefault();e.currentTarget.classList.remove('drag-over');
    const nm=_dragId||CLASSIF._selected;if(!nm)return;
    CLASSIF._place(nm,col);_dragId=null;CLASSIF._selected=null;
    document.querySelectorAll('.classify-item').forEach(x=>x.style.outline='');
  },
  _place(nm,col){
    const src=document.getElementById('ci-'+nm.replace(/[^a-z0-9]/gi,'_'));
    if(src)src.remove();
    CLASSIF._s.placed[nm]=col;
    const colEl=document.getElementById('col-'+col);
    if(colEl){
      const div=document.createElement('div');div.className='classify-item';div.textContent=nm;
      div.onclick=()=>CLASSIF._return(nm,col);colEl.appendChild(div);
    }
    const allPlaced=CLASSIF._s.items.every(it=>CLASSIF._s.placed[it.nm]);
    const btn=document.getElementById('classif-validate-btn');
    if(btn)btn.style.display=allPlaced?'block':'none';
  },
  _return(nm,col){
    const colEl=document.getElementById('col-'+col);
    if(colEl)[...colEl.children].filter(c=>c.textContent===nm).forEach(e=>e.remove());
    delete CLASSIF._s.placed[nm];
    const container=document.getElementById('classif-items');
    if(container){
      const div=document.createElement('div');div.className='classify-item';div.textContent=nm;
      div.draggable=true;div.ondragstart=e=>CLASSIF.dragStart(e,nm);
      div.onclick=()=>CLASSIF._tapSelect(nm);container.appendChild(div);
    }
    document.getElementById('classif-validate-btn').style.display='none';
  },
  validate(){
    let ok=0;const total=CLASSIF._s.items.length;
    CLASSIF._s.items.forEach(it=>{
      const placed=CLASSIF._s.placed[it.nm];
      const colEl=document.getElementById('col-'+placed);
      if(colEl){
        const itemEl=[...colEl.children].find(c=>c.textContent===it.nm);
        if(itemEl)itemEl.classList.add(placed===it.qual?'correct':'wrong');
      }
      if(placed===it.qual)ok++;
    });
    const xp=ok*5;addXP(xp);
    if(!S.classifDone)S.classifDone=0;S.classifDone++;save();
    document.getElementById('classif-result').style.display='block';
    document.getElementById('classif-res-emoji').textContent=ok===total?'🏆':ok>=total/2?'👍':'💪';
    document.getElementById('classif-res-score').innerHTML=`<span style="color:${ok===total?'var(--ok)':ok>=total/2?'var(--warn)':'var(--err)'}">${ok}/${total} correctes</span> · +${xp} XP`;
    document.getElementById('classif-validate-btn').style.display='none';
    BADGES.checkAll();
  },
  stop(){document.getElementById('classify-ov')?.classList.remove('show');}
};

/* ─── RECHERCHE GLOBALE ─── */
let _gsTimer=null;
const GS={
  onInput(val){
    clearTimeout(_gsTimer);
    const clear=document.getElementById('search-clear-btn');
    if(clear)clear.style.display=val?'block':'none';
    if(!val.trim()){GS.hide();return;}
    _gsTimer=setTimeout(()=>GS.search(val.trim()),300);
  },
  search(q){
    const ql=q.toLowerCase();const results=[];
    CHAPTERS.flatMap(c=>c.lessons).filter(l=>l.name.toLowerCase().includes(ql)||l.ref.toLowerCase().includes(ql)).slice(0,4)
      .forEach(l=>results.push({type:'lecon',icon:'📚',main:l.name,sub:l.ref,action:`openLesson('${l.id}')`}));
    QB.filter(x=>x.q.toLowerCase().includes(ql)).slice(0,3)
      .forEach(q=>results.push({type:'qcm',icon:'🎯',main:q.q.slice(0,55)+(q.q.length>55?'…':''),sub:q.art,action:`startSession('${q.cat}')`}));
    FB.filter(f=>f.nm.toLowerCase().includes(ql)||f.ref.toLowerCase().includes(ql)).slice(0,3)
      .forEach(f=>results.push({type:'fiche',icon:'⚖️',main:f.nm,sub:f.ref,action:`openFiche('${f.id}')`}));
    if(typeof PB!=='undefined')PB.filter(p=>p.nm.toLowerCase().includes(ql)).slice(0,2)
      .forEach(p=>results.push({type:'proc',icon:'📋',main:p.nm,sub:p.ref,action:`PFM.open('${p.id}')`}));
    GS._render(results,q);
  },
  _render(results,q){
    const el=document.getElementById('search-results');if(!el)return;
    if(!results.length){el.innerHTML=`<div class="text-sm text-muted" style="padding:12px;text-align:center">Aucun résultat pour "${eh(q)}"</div>`;el.style.display='block';return;}
    const groups={lecon:'📚 Leçons',qcm:'🎯 QCM',fiche:'⚖️ Fiches LAME',proc:'📋 Procédures'};
    let html='';let lastType='';
    results.forEach(r=>{
      if(r.type!==lastType){html+=`<div class="sr-group-lbl">${groups[r.type]||r.type}</div>`;lastType=r.type;}
      html+=`<div class="sr-item" onclick="${r.action};GS.hide()"><span class="sr-item-icon">${r.icon}</span><div><div class="sr-item-main">${eh(r.main)}</div><div class="sr-item-sub">${eh(r.sub)}</div></div></div>`;
    });
    el.innerHTML=html;el.style.display='block';
  },
  show(){if(document.getElementById('global-search')?.value.trim())GS.search(document.getElementById('global-search').value.trim());},
  hide(){const el=document.getElementById('search-results');if(el)el.style.display='none';},
  clear(){const inp=document.getElementById('global-search');if(inp)inp.value='';const c=document.getElementById('search-clear-btn');if(c)c.style.display='none';GS.hide();}
};
document.addEventListener('keydown',e=>{
  if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){
    e.preventDefault();
    const inp=document.getElementById('global-search');if(inp){navigateTo('home');inp.focus();}
  }
});

/* ─── EXAMEN BLANC ─── */
const EB_SCENARIOS=[
  {
    id:'eb1',titre:'Cambriolage avec violences',
    dossier:`Le 14 novembre, à 22h30, vous êtes appelés pour un cambriolage en cours au 12 rue des Lilas. En arrivant, vous constatez qu'un individu, DUPONT Pierre, 32 ans, a pénétré par effraction dans un appartement. La victime, Mme MARTIN, 65 ans, était présente et a été bousculée violemment en tentant de s'interposer. Elle présente une fracture du poignet (ITT 21 jours). DUPONT est interpellé en possession de bijoux et d'espèces.`,
    questions:[
      {q:"Qualifiez juridiquement les faits pour DUPONT (qualification principale + aggravantes)",pts:"4 pts",corrige:"Vol avec violence ayant entraîné une incapacité totale de travail supérieure à 8 jours — Art. 311-4 2° et 311-6 CP. Aggravantes : nuit + effraction + victime vulnérable (âgée de 65 ans)."},
      {q:"Dans quel cadre d'enquête vous placez-vous et pourquoi ?",pts:"3 pts",corrige:"Enquête de flagrance — Art. 53 CPP. Critères : crime/délit vient de se commettre, l'auteur est appréhendé sur les lieux avec les objets volés."},
      {q:"Pouvez-vous placer DUPONT en GAV ? Justifiez. Quelle est la durée maximale ?",pts:"3 pts",corrige:"OUI — Art. 63 CPP. Conditions remplies : infraction punie d'emprisonnement + raisons plausibles de soupçonner + l'un des 6 objectifs de l'art. 62-2. Durée max : 48h (droit commun — 24h + 24h sur autorisation écrite et motivée du PR)."},
    ]
  },
  {
    id:'eb2',titre:'Trafic de stupéfiants',
    dossier:`Suite à 3 semaines de surveillance, votre service interpelle GARCIA Pablo, 28 ans, en possession de 500g de cocaïne conditionnée et de 8 500€ en espèces. Dans sa cave, vous découvrez du matériel de conditionnement. Son téléphone révèle des contacts réguliers avec des acheteurs. Un complice, TRAN Van, 22 ans, est interpellé avec 2g d'usage personnel.`,
    questions:[
      {q:"Qualifiez les faits pour GARCIA et pour TRAN",pts:"4 pts",corrige:"GARCIA : trafic de stupéfiants en bande organisée — Art. 222-34 CP (crime, 20 ans RC). TRAN : usage illicite de stupéfiants — Art. L3421-1 CSP (délit, 1 an + 3 750€). AFD 200€ possible pour TRAN."},
      {q:"Quelle durée de GAV peut être appliquée à GARCIA ? Qui autorise la prolongation ?",pts:"3 pts",corrige:"Criminalité organisée — Art. 706-88 CPP. Durée max : 96h. Première prolongation : PR. Au-delà de 48h : JLD obligatoire."},
      {q:"Quels actes d'investigation spéciaux peuvent être mis en œuvre ?",pts:"3 pts",corrige:"Interceptions téléphoniques (art. 100 CPP — JI en instruction, ou JLD en préliminaire via art. 706-95). Géolocalisation (PR 15j, JLD au-delà). Saisie des avoirs (art. 706-141 CPP)."},
    ]
  },
];
const EB={
  _state:{idx:0,timer:null,secs:0,answered:[]},
  start(){
    const s=EB_SCENARIOS[Math.floor(Math.random()*EB_SCENARIOS.length)];
    EB._state={scenario:s,answered:[],timer:null,secs:3600,phase:'questions'};
    document.getElementById('eb-title').textContent='Examen Blanc — '+s.titre;
    document.getElementById('eb-ov').classList.add('show');
    EB._render();EB._startTimer();
  },
  _startTimer(){
    EB._state.timer=setInterval(()=>{
      EB._state.secs--;
      const m=String(Math.floor(EB._state.secs/60)).padStart(2,'0');
      const s=String(EB._state.secs%60).padStart(2,'0');
      const el=document.getElementById('eb-timer');
      if(!el)return;
      el.textContent=m+':'+s;
      const pct=EB._state.secs/3600;
      if(pct<.10)el.className='eb-timer danger';
      else if(pct<.25)el.className='eb-timer warn';
      else el.className='eb-timer';
      if(EB._state.secs<=0){clearInterval(EB._state.timer);EB._finish();}
    },1000);
  },
  _render(){
    const s=EB._state.scenario;
    let html=`<div class="lesson-intro mb16">${s.dossier}</div>`;
    html+=`<div class="sect-label">Questions</div>`;
    html+=s.questions.map((q,i)=>`
      <div class="card mb12">
        <div class="text-xs text-accent font-mono fw-700 mb4">Question ${i+1} ${q.pts?'· '+q.pts:''}</div>
        <div class="text-sm mb12" style="line-height:1.7">${q.q}</div>
        <textarea class="inp" id="eb-ans-${i}" placeholder="Votre réponse…" rows="4" style="resize:vertical;font-size:13px;line-height:1.6"></textarea>
      </div>`).join('');
    html+=`<button class="btn btn-p mt16" onclick="EB._finish()">✓ Remettre ma copie</button>`;
    document.getElementById('eb-body').innerHTML=html;
  },
  _finish(){
    clearInterval(EB._state.timer);
    const s=EB._state.scenario;
    let html=`<div class="font-title fw-900 text-2xl mb8" style="text-align:center">Copie remise !</div>`;
    html+=`<div class="text-sm text-secondary mb20" style="text-align:center">Voici les éléments de corrigé attendus</div>`;
    html+=`<div class="sect-label">Corrigé</div>`;
    html+=s.questions.map((q,i)=>{
      const ans=document.getElementById('eb-ans-'+i)?.value||'(pas de réponse)';
      return`<div class="card mb12">
        <div class="text-xs text-accent font-mono fw-700 mb4">Question ${i+1} ${q.pts?'· '+q.pts:''}</div>
        <div class="text-sm mb8">${q.q}</div>
        ${ans!=='(pas de réponse)'?`<div class="lesson-block" style="margin-bottom:8px"><span class="text-xs text-muted fw-700 mb4" style="display:block">Votre réponse</span>${eh(ans)}</div>`:''}
        <div class="lesson-keys"><div class="lesson-keys-lbl">✓ Éléments attendus</div><div class="lesson-key-item">${q.corrige}</div></div>
      </div>`;
    }).join('');
    html+=`<button class="btn btn-ghost btn-full mt16" onclick="EB.stop()">← Fermer</button>`;
    document.getElementById('eb-body').innerHTML=html;
    document.getElementById('eb-timer').textContent='Terminé';
    addXP(50);showToast('+50 XP — Examen blanc réalisé !','ok');
  },
  stop(){document.getElementById('eb-ov')?.classList.remove('show');}
};

/* ─── QUALIFIE LES FAITS ─── */
const QUALIF_SCENARIOS=[
  {id:'q1',titre:'La bagarre',texte:`Jean frappe Pierre avec ses poings. Pierre présente une plaie au visage nécessitant 5 jours d'ITT selon le certificat médical. Jean agit seul, en plein jour, sans préméditation.`,questions:[
    {q:"Quelle est la qualification pénale des faits ?",c:"Violences volontaires ayant entraîné une incapacité totale de travail inférieure ou égale à 8 jours — Art. R625-1 CP (contravention 5e classe)."},
    {q:"Citez l'article applicable",c:"Art. R625-1 du Code pénal (ITT ≤ 8 jours sans aggravante = contravention)."},
    {q:"Quelle est la peine maximale ?",c:"1 500 € d'amende (contravention 5e classe). Avec aggravante = délit (art. 222-11 CP, 3 ans + 45 000€)."},
  ]},
  {id:'q2',titre:'Le sac arraché',texte:`Marie arrache le sac d'une femme âgée dans la rue en la bousculant violemment. La victime chute et se fracture le fémur (ITT 90 jours). Marie est interpellée 10 minutes plus tard à 500m.`,questions:[
    {q:"Qualifiez les faits",c:"Vol avec violence ayant entraîné une mutilation ou une infirmité permanente — Art. 311-4 2° et 311-6 al.2 CP (crime si ITT > 8 jours avec violence grave — peut aussi qualifier violences volontaires)."},
    {q:"Dans quel cadre d'enquête vous placez-vous ?",c:"Enquête de flagrance — Art. 53 CPP. Critères : faits viennent de se commettre, auteur interpellé peu après, clameur publique possible."},
    {q:"Pouvez-vous procéder à une perquisition au domicile de Marie sans son accord ?",c:"OUI en flagrance — Art. 56 CPP — sans accord ni horaire imposé. Si basculement en préliminaire : accord écrit ou autorisation JLD nécessaire."},
  ]},
  {id:'q3',titre:'La tromperie',texte:`Paul se fait passer pour un représentant d'assurance et convainc Mme DURAND, 78 ans, de signer un contrat bidon en lui remettant 3 000€. Mme DURAND découvre la tromperie le lendemain.`,questions:[
    {q:"Qualification juridique",c:"Escroquerie au préjudice d'une personne vulnérable — Art. 313-1 CP + aggravante art. 313-2 (vulnérabilité âge). Peine de base : 5 ans + 375k€, aggravée : 7 ans + 750k€."},
    {q:"Quels sont les éléments constitutifs ?",c:"Élément légal : art. 313-1 CP. Élément matériel : tromperie par fausse qualité (faux représentant) ayant déterminé la remise. Élément moral : intentionnel, conscience de tromper."},
    {q:"Est-ce un crime, un délit ou une contravention ?",c:"DÉLIT (art. 313-1 CP) — jugé par le Tribunal Correctionnel. Sauf si aggravantes qualifiantes qui ne le transforment pas en crime."},
  ]},
  {id:'q4',titre:'La voiture incendiée',texte:`Marc met délibérément le feu à la voiture de son voisin, garée dans la rue, causant des dommages totaux (véhicule détruit, valeur 15 000€). Aucun blessé. Marc est identifié par 3 témoins.`,questions:[
    {q:"Qualification des faits",c:"Destruction, dégradation et détérioration d'un bien appartenant à autrui commise par un moyen dangereux pour les personnes — Art. 322-6 CP (crime, 10 ans + 150 000€)."},
    {q:"Pourquoi s'agit-il d'un crime ?",c:"Le moyen employé (incendie) est dangereux pour les personnes — art. 322-6 CP élève la qualification à crime même si aucun blessé. Piège : sans moyen dangereux, simple délit (art. 322-1 CP, 2 ans)."},
    {q:"Devant quelle juridiction Marc sera-t-il jugé ?",c:"Devant la Cour d'Assises (crime). Si correctionnalisation admise par toutes les parties : Tribunal Correctionnel."},
  ]},
  {id:'q5',titre:'Le faux document',texte:`Ahmed présente un permis de conduire falsifié lors d'un contrôle routier. L'analyse révèle que le document est un faux. Ahmed reconnaît avoir acheté ce document 300€.`,questions:[
    {q:"Qualification des faits",c:"Usage de faux document administratif — Art. 441-2 CP (usage de faux = 3 ans + 45k€). La fabrication ou l'achat de faux (possession) = détention de faux (art. 441-3 CP)."},
    {q:"S'agit-il d'un crime ou d'un délit ?",c:"DÉLIT (art. 441-2 CP pour l'usage). Le faux en écriture publique ou authentique serait un crime (art. 441-1 al.2 CP). Le permis de conduire = document administratif public → délit."},
    {q:"Quelles pièces devez-vous saisir ?",c:"Le faux document (scellé immédiatement). Le téléphone si transactions visibles. Les 300€ liés à l'achat. PV de saisie dressé."},
  ]},
];
const QUALIF={
  _s:{idx:0,queue:[],score:0,phase:'question',qIdx:0},
  start(){
    const q=[...QUALIF_SCENARIOS].sort(()=>Math.random()-.5).slice(0,3);
    QUALIF._s={idx:0,queue:q,score:0,phase:'question',qIdx:0};
    document.getElementById('qualif-ov').classList.add('show');
    QUALIF._render();
  },
  _render(){
    const{idx,queue,qIdx}=QUALIF._s;
    if(idx>=queue.length){QUALIF._finish();return;}
    const sc=queue[idx];
    const q=sc.questions[qIdx];
    document.getElementById('qualif-counter').textContent=(idx+1)+'/'+queue.length+' — Q'+(qIdx+1)+'/'+sc.questions.length;
    let html=`<div class="card card-accent mb12">
      <div class="text-xs text-accent font-mono fw-700 mb4">📋 SCÉNARIO ${idx+1}</div>
      <div class="fw-700 mb8">${sc.titre}</div>
      <div class="qualif-scenario">${sc.texte}</div>
    </div>`;
    html+=`<div class="text-sm fw-700 mb8">Question ${qIdx+1} :</div>`;
    html+=`<div class="card mb12"><div style="line-height:1.7;font-size:13px">${q.q}</div></div>`;
    if(QUALIF._s.phase==='question'){
      html+=`<textarea class="inp mb12" id="qualif-ans" placeholder="Votre réponse juridique…" rows="4" style="resize:vertical;font-size:13px"></textarea>`;
      html+=`<button class="btn btn-p" onclick="QUALIF._showCorrection()">Voir le corrigé →</button>`;
    }else{
      const ans=QUALIF._s.lastAns||'';
      if(ans)html+=`<div class="lesson-block mb12"><div class="text-xs text-muted fw-700 mb4">Votre réponse</div>${eh(ans)}</div>`;
      html+=`<div class="lesson-keys mb16"><div class="lesson-keys-lbl">✓ Éléments de réponse</div><div class="lesson-key-item">${q.c}</div></div>`;
      html+=`<button class="btn btn-p" onclick="QUALIF._next()">Question suivante →</button>`;
    }
    document.getElementById('qualif-body').innerHTML=html;
  },
  _showCorrection(){
    QUALIF._s.lastAns=document.getElementById('qualif-ans')?.value||'';
    QUALIF._s.phase='correction';QUALIF._render();
  },
  _next(){
    const sc=QUALIF._s.queue[QUALIF._s.idx];
    QUALIF._s.qIdx++;QUALIF._s.phase='question';
    if(QUALIF._s.qIdx>=sc.questions.length){QUALIF._s.idx++;QUALIF._s.qIdx=0;}
    QUALIF._render();
  },
  _finish(){
    addXP(40);showToast('+40 XP — Qualification des faits !','ok');
    document.getElementById('qualif-body').innerHTML=`<div style="text-align:center;padding:32px">
      <div style="font-size:52px;margin-bottom:12px">⚖️</div>
      <div class="font-title fw-900 text-2xl mb8">Session terminée !</div>
      <div class="text-sm text-secondary mb24">Excellente pratique de qualification des faits.</div>
      <button class="btn btn-p mb8" onclick="QUALIF.start()">🔄 Nouveau scénario</button>
      <button class="btn btn-ghost btn-full" onclick="QUALIF.stop()">← Fermer</button>
    </div>`;
  },
  stop(){document.getElementById('qualif-ov')?.classList.remove('show');}
};

/* ─── UTILS ─── */
function eh(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function haptic(p){if(!S.settings?.haptics)return;try{if(navigator.vibrate)navigator.vibrate(Array.isArray(p)?p:[p]);}catch(e){}}
function showToast(msg,type=''){
  const ctr=document.getElementById('toast-ctr');if(!ctr)return;
  const el=document.createElement('div');
  el.className='toast '+(type||'');
  el.textContent=msg;
  el.setAttribute('role', type === 'err' ? 'alert' : 'status');
  el.setAttribute('aria-live', type === 'err' ? 'assertive' : 'polite');
  ctr.appendChild(el);setTimeout(()=>el.remove(),3000);
}
function confetti(burst){
  const cv=document.getElementById('confetti-cv');if(!cv)return;
  const ctx=cv.getContext('2d');cv.width=window.innerWidth;cv.height=window.innerHeight;
  const colors=['#2563eb','#3b82f6','#d4af37','#10b981','#ef4444','#fff'];
  const parts=Array.from({length:burst?80:45},()=>({
    x:Math.random()*cv.width,y:burst?Math.random()*cv.height*.4:-10,
    r:3+Math.random()*4,c:colors[Math.floor(Math.random()*colors.length)],
    vx:(Math.random()-.5)*4,vy:2+Math.random()*3.5,
    a:Math.random()*360,va:(Math.random()-.5)*7,l:1
  }));
  let fr;
  const draw=()=>{
    ctx.clearRect(0,0,cv.width,cv.height);let alive=false;
    for(const p of parts){
      p.x+=p.vx;p.y+=p.vy;p.a+=p.va;p.l-=.01;if(p.l<=0)continue;alive=true;
      ctx.save();ctx.globalAlpha=p.l;ctx.fillStyle=p.c;
      ctx.translate(p.x,p.y);ctx.rotate(p.a*Math.PI/180);ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);ctx.restore();
    }
    if(alive)fr=requestAnimationFrame(draw);else ctx.clearRect(0,0,cv.width,cv.height);
  };
  fr=requestAnimationFrame(draw);setTimeout(()=>{cancelAnimationFrame(fr);ctx.clearRect(0,0,cv.width,cv.height);},4000);
}
function initOffline(){const b=document.getElementById('offline-bar');if(!b)return;const u=()=>b.style.display=!navigator.onLine?'block':'none';u();window.addEventListener('online',u);window.addEventListener('offline',u);}
function initFAB(){const fab=document.getElementById('fab');if(!fab)return;fab.onclick=()=>window.scrollTo({top:0,behavior:(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)?'auto':'smooth'});window.addEventListener('scroll',()=>fab.classList.toggle('vis',window.scrollY>250),{passive:true});}
// manifest is static (manifest.json)
/* ═══════════════════════════════════════════════════════════════════════════
   AUTH UI FUNCTIONS — Gestion de l'interface d'authentification
   ═══════════════════════════════════════════════════════════════════════════ */

function showAuthTab(tab) {
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginForm = document.getElementById('auth-login');
  const signupForm = document.getElementById('auth-signup');
  
  if (tab === 'login') {
    loginTab.style.background = 'var(--accent)';
    loginTab.style.color = '#fff';
    signupTab.style.background = 'transparent';
    signupTab.style.color = 'var(--t2)';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    signupTab.style.background = 'var(--accent)';
    signupTab.style.color = '#fff';
    loginTab.style.background = 'transparent';
    loginTab.style.color = 'var(--t2)';
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  
  if (!email || !email.includes('@')) {
    showToast('Email invalide', 'err');
    return;
  }
  if (!password || password.length < 6) {
    showToast('Mot de passe trop court', 'err');
    return;
  }
  
  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Connexion...';
  
  const { data, error } = await AUTH.login(email, password);
  
  if (error) {
    showToast('Erreur: ' + error.message, 'err');
    btn.disabled = false;
    btn.textContent = 'Se connecter →';
    return;
  }
  
  // Charger la progression depuis Supabase
  await SYNC.loadProgress();
  S.page = 'home';
  save();
  
  finishAuth(S.user.name || 'Officier');
}

async function handleSignup() {
  const name = document.getElementById('signup-name')?.value?.trim() || 'Officier';
  const email = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;
  const examDate = document.getElementById('signup-date')?.value || '2026-06';
  
  if (!email || !email.includes('@')) {
    showToast('Email invalide', 'err');
    return;
  }
  if (!password || password.length < 6) {
    showToast('Mot de passe min. 6 caractères', 'err');
    return;
  }
  
  const btn = document.getElementById('btn-signup');
  btn.disabled = true;
  btn.textContent = 'Création...';
  
  const { data, error } = await AUTH.signup(email, password, name);
  
  if (error) {
    showToast('Erreur: ' + error.message, 'err');
    btn.disabled = false;
    btn.textContent = 'Créer mon compte →';
    return;
  }
  
  // Mettre à jour le state local
  S.user.name = name;
  S.user.examDate = examDate;
  S.page = 'home';
  
  // Sauvegarder le profil
  if (currentUser) {
    await SYNC.updateProfile(name, examDate);
  }
  
  save();
  showToast('✅ Compte créé ! Vérifiez votre email.', 'ok');
  
  // Si auto-confirm activé, on continue directement
  if (data.session) {
    finishAuth(name);
  } else {
    btn.disabled = false;
    btn.textContent = 'Créer mon compte →';
    showAuthTab('login');
  }
}

async function handleMagicLink() {
  const email = document.getElementById('login-email')?.value?.trim();
  
  if (!email || !email.includes('@')) {
    showToast('Entrez votre email d\'abord', 'err');
    return;
  }
  
  const { error } = await AUTH.magicLink(email);
  
  if (error) {
    showToast('Erreur: ' + error.message, 'err');
    return;
  }
  
  showToast('📧 Lien envoyé ! Vérifiez votre boîte mail.', 'ok');
}

function startOfflineMode() {
  const name = 'Officier';
  S.user.name = name;
  S.user.examDate = '2026-06';
  S.page = 'home';
  S._offlineMode = true;
  save();
  finishAuth(name);
}

function finishAuth(name) {
  const onb = document.getElementById('onboarding');
  const app = document.getElementById('app');
  if (onb) onb.style.display = 'none';
  if (app) app.style.display = 'block';
  
  // Afficher/masquer bouton déconnexion
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.style.display = currentUser ? 'flex' : 'none';
  }
  
  // Mettre à jour le statut sync
  const syncStatus = document.getElementById('sync-status');
  if (syncStatus) {
    syncStatus.textContent = currentUser ? 'Cloud ☁️' : 'Local';
  }
  
  try { updateStreak(); } catch(e) {}
  try { navigateTo('home'); } catch(e) {}
  try { showToast('Bienvenue ' + name + ' ! 🎯', 'ok'); } catch(e) {}
  try { BADGES.checkAll(); } catch(e) {}
  try { renderMotivBanner(); } catch(e) {}
}

function showAuthScreen() {
  document.getElementById('onboarding').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function showAccountModal() {
  const email = currentUser?.email || 'Mode hors-ligne';
  const syncStatus = currentUser ? '☁️ Synchronisé' : '📴 Local uniquement';
  
  const html = `<div style="padding:18px">
    <div class="font-title fw-800 text-xl mb16">👤 Mon compte</div>
    <div style="background:var(--bg-2);border-radius:var(--r-m);padding:14px;margin-bottom:16px">
      <div class="flex-b mb8">
        <span style="color:var(--t3);font-size:12px">Email</span>
        <span style="color:var(--t1);font-size:13px;font-weight:600">${eh(email)}</span>
      </div>
      <div class="flex-b mb8">
        <span style="color:var(--t3);font-size:12px">Statut</span>
        <span style="color:var(--ok);font-size:13px;font-weight:600">${syncStatus}</span>
      </div>
      <div class="flex-b">
        <span style="color:var(--t3);font-size:12px">Abonnement</span>
        <span style="color:${S.isPro?'var(--gold)':'var(--t2)'};font-size:13px;font-weight:600">${S.isPro?'PRO 👑':'Gratuit'}</span>
      </div>
    </div>
    ${currentUser ? `
    <button class="btn btn-ghost btn-full mb8" onclick="forceSyncNow()">🔄 Forcer la synchronisation</button>
    <button class="btn btn-full mb8" style="background:var(--err-bg);color:var(--err)" onclick="AUTH.logout();closeLesson()">🚪 Se déconnecter</button>
    ` : `
    <button class="btn btn-p btn-full mb8" onclick="closeLesson();showAuthScreen();showAuthTab('login')">🔐 Se connecter</button>
    `}
    <button class="btn btn-ghost btn-full" onclick="closeLesson()">Fermer</button>
  </div>`;
  
  document.getElementById('lesson-modal-body').innerHTML = html;
  document.getElementById('lesson-ov').classList.add('on');
  document.body.style.overflow = 'hidden';
}

async function forceSyncNow() {
  if (!currentUser) {
    showToast('Non connecté', 'err');
    return;
  }
  showToast('Synchronisation...', 'ok');
  const ok = await SYNC.saveProgress();
  if (ok) {
    showToast('✅ Synchronisé !', 'ok');
  } else {
    showToast('❌ Erreur de sync', 'err');
  }
}

// Legacy support - rediriger vers le nouveau système
function finishOnboarding(){
  startOfflineMode();
}

function renderFSRSDueWidget(){}// legacy compat

/* ─── BOOT ─── */
(async function boot(){
  loadState();initOffline();initFAB();
  THEME28.apply();
  
  // Initialiser Supabase
  const supabaseReady = initSupabase();
  
  if (supabaseReady) {
    // Vérifier s'il y a une session existante
    const session = await AUTH.getSession();
    
    if (session?.user) {
      currentUser = session.user;
      console.log('[OPJ] Session trouvée:', currentUser.email);
      
      // Charger la progression depuis Supabase
      await SYNC.loadProgress();
      S.page = 'home';
      
      // Afficher l'app directement
      document.getElementById('onboarding').style.display='none';
      document.getElementById('app').style.display='block';
      
      // Mettre à jour l'UI
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) btnLogout.style.display = 'flex';
      const syncStatus = document.getElementById('sync-status');
      if (syncStatus) syncStatus.textContent = 'Cloud ☁️';
      
      updateStreak();
      navigateTo('home');
      window.addEventListener('load',()=>{SHIELD.checkOnOpen();BADGES.checkAll();},{ once:true });
    } else if (S.page !== 'onboarding' && S.user.name) {
      // Pas de session Supabase mais données locales existantes
      document.getElementById('onboarding').style.display='none';
      document.getElementById('app').style.display='block';
      updateStreak();navigateTo('home');
      window.addEventListener('load',()=>{SHIELD.checkOnOpen();BADGES.checkAll();},{ once:true });
    }
    
    // Écouter les changements d'auth (magic link, etc.)
    AUTH.onAuthChange(async (event, session) => {
      console.log('[OPJ] Auth event:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        currentUser = session.user;
        await SYNC.loadProgress();
        S.page = 'home';
        save();
        finishAuth(S.user.name || 'Officier');
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        showAuthScreen();
      }
    });
  } else {
    // Supabase non disponible, mode local uniquement
    if(S.page!=='onboarding'&&S.user.name){
      document.getElementById('onboarding').style.display='none';
      document.getElementById('app').style.display='block';
      updateStreak();navigateTo('home');
      window.addEventListener('load',()=>{SHIELD.checkOnOpen();BADGES.checkAll();},{ once:true });
    }
  }
  
  // Raccourci clavier / pour recherche
  document.addEventListener('keydown',e=>{
    if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){
      e.preventDefault();document.getElementById('global-search')?.focus();
    }
  });
})();


// ═══════════════════════════════════════════════════════
// PREMIUM UX — micro-interactions & messages motivants
// ═══════════════════════════════════════════════════════

// Messages de motivation dynamiques
const MOTIV_MSGS = [
  {min:0,   max:100,  icon:'🎯', msg:"Chaque question compte. Tu construis ton futur grade."},
  {min:100, max:300,  icon:'🔥', msg:"L'élan est lancé ! Tes efforts commencent à payer."},
  {min:300, max:600,  icon:'⚡', msg:"Tu progresses vite. Le jury remarquera ta précision."},
  {min:600, max:1000, icon:'🏆', msg:"Niveau solide. Tu maîtrises les bases procédurales."},
  {min:1000,max:2000, icon:'⚖️', msg:"Niveau OPJ confirmé. Continue ta domination."},
  {min:2000,max:99999,icon:'👑', msg:"Élite. Tu es dans le top des candidats OPJ de France."},
];

function getMotivMsg(xp){
  return MOTIV_MSGS.find(m=>xp>=m.min&&xp<m.max)||MOTIV_MSGS[0];
}

// Injecter le message motivant dans la home
function renderMotivBanner(){
  const el=document.getElementById('h-motiv-banner');
  if(!el)return;
  const m=getMotivMsg(S.user.xp||0);
  el.innerHTML=`<span style="font-size:15px">${m.icon}</span><span style="font-size:12px;color:var(--t2);line-height:1.5">${m.msg}</span>`;
}

// Animation des KPI numbers (count-up)
function animCountUp(elId, target, duration=600){
  const el=document.getElementById(elId);
  if(!el||target===0)return;
  const start=parseInt(el.textContent)||0;
  const diff=target-start;
  if(diff===0)return;
  const startTime=performance.now();
  const step=now=>{
    const elapsed=now-startTime;
    const progress=Math.min(elapsed/duration,1);
    const ease=1-Math.pow(1-progress,3);
    el.textContent=Math.round(start+diff*ease);
    if(progress<1)requestAnimationFrame(step);
    else el.textContent=target;
  };
  requestAnimationFrame(step);
}

// Haptic feedback (vibration)
function haptic(d=10){try{navigator.vibrate&&navigator.vibrate(d);}catch(e){}}

// Confetti amélioré
function confetti(intense=true){
  const cv=document.getElementById('confetti-cv');if(!cv)return;
  const ctx=cv.getContext('2d');
  cv.width=window.innerWidth;cv.height=window.innerHeight;
  cv.style.display='block';
  const particles=Array.from({length:intense?80:40},()=>({
    x:Math.random()*cv.width, y:-10,
    vx:(Math.random()-.5)*6, vy:Math.random()*4+2,
    r:Math.random()*5+2, a:Math.random()*360,
    va:(Math.random()-.5)*8,
    color:['#2563eb','#3b82f6','#d4af37','#10b981','#8b5cf6','#f59e0b'][Math.floor(Math.random()*6)]
  }));
  let frame=0;
  const draw=()=>{
    ctx.clearRect(0,0,cv.width,cv.height);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.a+=p.va;p.vy+=.08;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a*Math.PI/180);
      ctx.fillStyle=p.color;ctx.globalAlpha=Math.max(0,1-frame/120);
      ctx.fillRect(-p.r,-p.r/2,p.r*2,p.r);
      ctx.restore();
    });
    if(++frame<120)requestAnimationFrame(draw);
    else{ctx.clearRect(0,0,cv.width,cv.height);cv.style.display='none';}
  };
  requestAnimationFrame(draw);
}

// [v30 override supprimé — logique intégrée dans renderHome()]




/* ============================================================
   OPJ ELITE — PATCH v2.0
   Missions · Combo · Plan d'étude · Onboarding · FSRS · CSS fixes
   ============================================================ */
(function () {
  'use strict';

  /* CSS INJECTION */
  const CSS = `
    .bubble-grid {
      display:grid !important;
      grid-template-columns:repeat(auto-fill,minmax(76px,1fr)) !important;
      gap:12px !important; padding:4px 0 !important;
    }
    .hero-kl    { font-size:10px !important; }
    .bubble-name{ font-size:10px !important; }
    .bubble-tag { font-size:9px  !important; }

    @keyframes flamePulse {
      0%,100%{ transform:scale(1) rotate(-3deg); filter:drop-shadow(0 0 4px #f59e0b); }
      50%    { transform:scale(1.15) rotate(3deg); filter:drop-shadow(0 0 14px #ef4444); }
    }
    .streak-flame{ display:inline-block; animation:flamePulse 1.8s ease-in-out infinite; }

    @keyframes comboPop {
      from{ transform:translateX(-50%) scale(.7); opacity:0; }
      to  { transform:translateX(-50%) scale(1);  opacity:1; }
    }
    .combo-hud{
      position:fixed; top:calc(var(--hdr-h) + var(--safe-t) + 10px);
      left:50%; transform:translateX(-50%); z-index:500; pointer-events:none;
      display:flex; align-items:center; gap:6px;
      background:rgba(212,175,55,.18); border:1px solid rgba(212,175,55,.4);
      border-radius:100px; padding:5px 16px;
      font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--gold);
      animation:comboPop .3s var(--tr-spring); backdrop-filter:blur(12px);
    }

    .missions-card{
      background:var(--bg-1); border:1px solid var(--brd);
      border-radius:var(--r-xl); padding:14px; margin-bottom:12px;
    }
    .missions-hd{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .missions-title{ font-size:10px; font-weight:800; color:var(--t3);
      text-transform:uppercase; letter-spacing:.1em; display:flex; align-items:center; gap:6px; }
    .missions-score{ font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--gold); font-weight:700; }
    .mission-row{
      display:flex; align-items:center; gap:10px; padding:9px 10px;
      background:var(--bg-2); border-radius:var(--r-m); margin-bottom:6px; transition:all var(--tr);
    }
    .mission-row.done{ background:var(--ok-bg); border:1px solid rgba(16,185,129,.18); opacity:.7; }
    .mission-ico{ font-size:16px; flex-shrink:0; }
    .mission-inf{ flex:1; min-width:0; }
    .mission-name{ font-size:12px; font-weight:600; color:var(--t1); }
    .mission-row.done .mission-name{ color:var(--ok); text-decoration:line-through; }
    .mission-sub{ font-size:9px; color:var(--t3); margin-top:2px; font-family:'JetBrains Mono',monospace; }
    .mission-bar{ height:3px; background:var(--bg-3); border-radius:100px; overflow:hidden; margin-top:4px; }
    .mission-bar-fill{ height:100%; border-radius:100px; background:var(--accent-l); transition:width .5s ease; }
    .mission-row.done .mission-bar-fill{ background:var(--ok); }
    .mission-xp{ font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--gold); font-weight:700; flex-shrink:0; }

    .sp-card{
      background:var(--bg-1); border:1px solid rgba(37,99,235,.28);
      border-radius:var(--r-xl); padding:14px; margin-bottom:12px;
      position:relative; overflow:hidden;
    }
    .sp-card::before{
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,rgba(37,99,235,.05),transparent); pointer-events:none;
    }
    .sp-header{ font-size:10px; font-weight:800; color:var(--t3);
      text-transform:uppercase; letter-spacing:.1em;
      margin-bottom:10px; display:flex; align-items:center; gap:6px; }
    .phase-banner{
      display:flex; align-items:center; gap:12px;
      background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(212,175,55,.07));
      border:1px solid rgba(212,175,55,.2); border-radius:var(--r-m);
      padding:10px 13px; margin-bottom:10px;
    }
    .phase-icon{ font-size:22px; flex-shrink:0; }
    .phase-inf{ flex:1; }
    .phase-lbl{ font-size:9px; font-weight:800; color:var(--gold);
      font-family:'JetBrains Mono',monospace; text-transform:uppercase; letter-spacing:.09em; }
    .phase-txt{ font-size:12px; color:var(--t1); font-weight:600; margin-top:1px; }
    .phase-days{ text-align:center; flex-shrink:0; }
    .phase-days-n{ font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; color:var(--gold); line-height:1; }
    .phase-days-l{ font-size:7px; color:var(--t3); text-transform:uppercase; letter-spacing:.06em; }
    .sp-row{
      display:flex; align-items:center; gap:10px; padding:10px 11px;
      background:rgba(37,99,235,.05); border:1px solid rgba(37,99,235,.12);
      border-radius:var(--r-m); margin-bottom:6px; cursor:pointer; transition:all var(--tr);
    }
    .sp-row:hover,.sp-row:active{ background:rgba(37,99,235,.1); transform:scale(.997); }
    .sp-row-ico{ font-size:19px; flex-shrink:0; }
    .sp-row-inf{ flex:1; min-width:0; }
    .sp-row-name{ font-size:12px; font-weight:600; color:var(--t1); }
    .sp-row-sub{ font-size:9px; color:var(--t3); margin-top:2px; font-family:'JetBrains Mono',monospace; }
    .sp-row-pct{ font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; flex-shrink:0; }

    @keyframes onbPop {
      from{ transform:scale(.6); opacity:0; }
      to  { transform:scale(1);  opacity:1; }
    }
    .onb2-ov{
      position:fixed; inset:0; background:var(--bg-0); z-index:900;
      display:flex; align-items:center; justify-content:center;
      padding:28px; animation:pgIn .35s ease;
    }
    .onb2-wrap{ width:100%; max-width:380px; text-align:center; }
    .onb2-icon{ font-size:72px; margin-bottom:16px; animation:onbPop .4s var(--tr-spring); display:block; }
    .onb2-title{
      font-family:'Syne',sans-serif;
      font-size:24px; font-weight:900; color:var(--t1);
      letter-spacing:-.02em; margin-bottom:10px; line-height:1.2;
    }
    .onb2-desc{ font-size:14px; color:var(--t2); line-height:1.7; margin-bottom:24px; }
    .onb2-dots{ display:flex; gap:6px; justify-content:center; margin-bottom:24px; }
    .onb2-dot{ width:6px; height:6px; border-radius:100px; background:var(--bg-4); transition:all .3s ease; }
    .onb2-dot.cur{ width:22px; background:var(--accent-l); }

    .ses-end-kpis{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin:14px 0; }
    .ses-kpi{
      background:var(--bg-2); border:1px solid var(--brd);
      border-radius:var(--r-l); padding:12px 8px; text-align:center;
    }
    .ses-kpi-v{ font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; line-height:1; }
    .ses-kpi-l{ font-size:9px; color:var(--t3); margin-top:4px; text-transform:uppercase;
                letter-spacing:.06em; font-family:'JetBrains Mono',monospace; }
    .perfect-badge{
      display:inline-flex; align-items:center; gap:6px;
      background:var(--gold-glow); border:1px solid rgba(212,175,55,.3);
      border-radius:100px; padding:5px 16px;
      font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:var(--gold);
      margin-bottom:10px; animation:onbPop .4s var(--tr-spring);
    }

    .err-insight{
      background:var(--bg-1); border:1px solid rgba(239,68,68,.2);
      border-radius:var(--r-l); padding:12px 14px; margin-bottom:8px;
    }
    .err-insight-hd{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .err-insight-name{ font-size:12px; font-weight:700; color:var(--t1); flex:1; }
    .err-insight-rate{ font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--err); font-weight:700; }
    .err-bar{ height:3px; background:var(--bg-3); border-radius:100px; overflow:hidden; margin-bottom:8px; }
    .err-bar-fill{ height:100%; border-radius:100px; background:var(--err); transition:width .6s ease; }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'opj-patch-css';
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  /* MISSIONS */
  const ALL_MISSIONS = [
    {id:'m_qcm10',  ico:'⚡', name:'Répondre à 10 questions',       type:'qcm',     target:10, xp:30},
    {id:'m_qcm20',  ico:'🔥', name:'Répondre à 20 questions',       type:'qcm',     target:20, xp:60},
    {id:'m_perfect',ico:'🎯', name:'Session parfaite (sans erreur)',type:'perfect', target:1,  xp:50},
    {id:'m_lesson2',ico:'📖', name:'Lire 2 leçons',                 type:'lesson',  target:2,  xp:20},
    {id:'m_lesson1',ico:'📚', name:'Lire 1 leçon',                  type:'lesson',  target:1,  xp:10},
    {id:'m_due5',   ico:'🔁', name:'Réviser 5 cartes dues',         type:'due',     target:5,  xp:25},
    {id:'m_blitz',  ico:'⚡', name:'Faire 1 Blitz Vrai/Faux',       type:'blitz',   target:1,  xp:20},
    {id:'m_streak', ico:'💪', name:'Maintenir le streak',            type:'streak',  target:1,  xp:15},
  ];

  function ensureMissions(){
    if(!window.S)return;
    const today=new Date().toDateString();
    if(!S.missions2||S.missions2.date!==today){
      const seed=today.split('').reduce((a,c)=>a*31+c.charCodeAt(0)|0,0);
      const shuffled=[...ALL_MISSIONS].sort((a,b)=>{
        const h=(s,n)=>{let v=s;for(let i=0;i<n.length;i++)v=(v*31+n.charCodeAt(i))>>>0;return v;};
        return h(seed,a.id)-h(seed,b.id);
      });
      S.missions2={date:today,active:shuffled.slice(0,3),prog:{}};
      if(typeof save==='function')save();
    }
  }

  function missionProgress(m){
    ensureMissions();
    const v=S.missions2?.prog?.[m.id]||0;
    return{v,done:v>=m.target};
  }

  function incrementMission(type,amount=1){
    if(!window.S)return;
    ensureMissions();
    S.missions2.active.forEach(m=>{
      if(m.type!==type)return;
      const prev=S.missions2.prog[m.id]||0;
      if(prev>=m.target)return;
      S.missions2.prog[m.id]=Math.min(prev+amount,m.target);
      if(S.missions2.prog[m.id]>=m.target){
        if(typeof addXP==='function')addXP(m.xp);
        if(typeof showToast==='function')showToast(`🎯 Mission : ${m.name} · +${m.xp} XP`,'ok');
        if(typeof confetti==='function')confetti(false);
      }
    });
    if(typeof save==='function')save();
    renderMissionsCard();
  }
  window.MISSIONS={increment:incrementMission};

  function renderMissionsCard(){
    const el=document.getElementById('patch-missions');
    if(!el||!window.S)return;
    ensureMissions();
    const missions=S.missions2.active;
    const done=missions.filter(m=>missionProgress(m).done).length;
    el.innerHTML=`
      <div class="missions-hd">
        <div class="missions-title">⚡ Missions du jour</div>
        <div class="missions-score">${done}/${missions.length} accomplie${done!==1?'s':''}</div>
      </div>
      ${missions.map(m=>{
        const{v,done:isDone}=missionProgress(m);
        const pct=Math.round(v/m.target*100);
        return`<div class="mission-row ${isDone?'done':''}">
          <div class="mission-ico">${m.ico}</div>
          <div class="mission-inf">
            <div class="mission-name">${isDone?'✓ ':''}${m.name}</div>
            <div class="mission-sub">${v}/${m.target}</div>
            <div class="mission-bar"><div class="mission-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="mission-xp">+${m.xp}XP</div>
        </div>`;
      }).join('')}`;
  }

  /* COMBO */
  let combo=0, comboTimer=null;
  function showComboHUD(){
    let el=document.getElementById('patch-combo');
    if(combo<2){if(el)el.remove();return;}
    if(!el){el=document.createElement('div');el.id='patch-combo';el.className='combo-hud';document.body.appendChild(el);}
    const fl=['','','🔥','🔥🔥','⚡🔥⚡','💥🔥💥'];
    el.innerHTML=`${fl[Math.min(combo,5)]} COMBO ×${Math.min(combo,4)}`;
    clearTimeout(comboTimer);
    comboTimer=setTimeout(()=>{const e=document.getElementById('patch-combo');if(e)e.remove();},3000);
  }

  /* PATCH answerQ */
  const _answerQ=window.answerQ;
  window.answerQ=function(i){
    const q=window.S?.qcm?.queue?.[window.S?.qcm?.idx];
    if(!q||window.S?.qcm?.answered!==null){if(_answerQ)_answerQ(i);return;}
    const correct=(i===q.c);
    if(correct){
      combo++;
      const mult=Math.min(combo,4);
      if(combo>=3&&typeof showToast==='function'){
        const fl=['','','','🔥','🔥🔥','⚡🔥⚡','💥🔥💥'];
        showToast(`${fl[Math.min(combo,6)]} COMBO ×${mult} !`,'ok');
      }
      showComboHUD();
      incrementMission('qcm',1);
    }else{combo=0;showComboHUD();}
    if(_answerQ)_answerQ(i);
  };

  /* PATCH finishSession */
  const _finishSession=window.finishSession;
  window.finishSession=function(){
    combo=0;showComboHUD();
    if(_finishSession)_finishSession();
    setTimeout(()=>{
      const el=document.getElementById('qcm-results');
      if(!el||el.style.display==='none')return;
      const s=window.S?.qcm?.stats||{ok:0,ko:0,xp:0};
      const tot=(s.ok||0)+(s.ko||0);
      if(!tot)return;
      const perfect=s.ko===0;
      if(perfect)incrementMission('perfect',1);
      const wrap=el.querySelector('.send-wrap');
      if(wrap&&!wrap.querySelector('.ses-end-kpis')){
        const kpis=`${perfect?'<div class="perfect-badge">🏆 Session parfaite !</div>':''}
          <div class="ses-end-kpis">
            <div class="ses-kpi"><div class="ses-kpi-v" style="color:var(--ok)">${s.ok}</div><div class="ses-kpi-l">Correctes</div></div>
            <div class="ses-kpi"><div class="ses-kpi-v" style="color:var(--err)">${s.ko}</div><div class="ses-kpi-l">Erreurs</div></div>
            <div class="ses-kpi"><div class="ses-kpi-v" style="color:var(--gold)">+${s.xp||0}</div><div class="ses-kpi-l">XP</div></div>
          </div>`;
        const ref=wrap.querySelector('.send-title');
        if(ref)ref.insertAdjacentHTML('afterend',kpis);
      }
    },80);
  };

  /* PATCH markLessonDone */
  const _markLessonDone=window.markLessonDone;
  window.markLessonDone=function(id){
    const wasNew=!window.S?.lessons?.[id];
    if(_markLessonDone)_markLessonDone(id);
    if(wasNew)incrementMission('lesson',1);
  };

  /* PLAN D'ÉTUDE */
  const THEME_DEF=[
    {cat:'GAV',         name:'Garde à Vue',        em:'🔒'},
    {cat:'FLAGRANCE',   name:'Flagrance',           em:'🚨'},
    {cat:'PERQUIZ',     name:'Perquisitions',       em:'🔍'},
    {cat:'MANDATS',     name:'Mandats',             em:'📋'},
    {cat:'INFRACTIONS', name:'Infractions',         em:'⚖️'},
    {cat:'LIBERTES',    name:'Libertés publiques',  em:'🛡️'},
    {cat:'COMMISSION',  name:'Commission Rogatoire',em:'📜'},
    {cat:'MESURESCOERC',name:'Mesures Coercitives', em:'⛓️'},
  ];

  function renderStudyPlan(){
    const el=document.getElementById('patch-studyplan');
    if(!el||!window.S||!window.QB)return;
    const examDate=S.user?.examDate?new Date(S.user.examDate+'-01'):null;
    const daysLeft=examDate?Math.max(0,Math.ceil((examDate-Date.now())/86400000)):null;
    const themes=THEME_DEF.map(t=>{
      const pool=QB.filter(q=>q.cat===t.cat);if(!pool.length)return null;
      const done=pool.filter(q=>(S.qcm?.cards?.[q.id]?.reps||0)>0);
      const ok=done.filter(q=>(S.qcm?.cards?.[q.id]?.ok||0)>0);
      const mastery=done.length?Math.round(ok.length/done.length*100):0;
      const due=pool.filter(q=>{const c=S.qcm?.cards?.[q.id];return!c||c.due<=Date.now();}).length;
      return{...t,mastery,total:pool.length,done:done.length,due};
    }).filter(Boolean).sort((a,b)=>a.mastery-b.mastery);
    let phaseIcon='🎯',phaseLbl='BASES',phaseTxt='Construis tes fondamentaux';
    if(daysLeft!==null){
      if(daysLeft<=7){phaseIcon='🔥';phaseLbl='SPRINT';phaseTxt='Sprint final — tout réviser !';}
      else if(daysLeft<=21){phaseIcon='⚡';phaseLbl='INTENSIF';phaseTxt='Phase intensive — accélère !';}
      else if(daysLeft<=60){phaseIcon='📚';phaseLbl='RÉVISION';phaseTxt='Consolide tes acquis';}
    }
    el.innerHTML=`
      <div class="sp-header">📊 Plan d'étude personnalisé</div>
      ${daysLeft!==null?`<div class="phase-banner">
        <div class="phase-icon">${phaseIcon}</div>
        <div class="phase-inf"><div class="phase-lbl">${phaseLbl}</div><div class="phase-txt">${phaseTxt}</div></div>
        <div class="phase-days"><div class="phase-days-n">${daysLeft}</div><div class="phase-days-l">jours</div></div>
      </div>`:''}
      <div class="sect-label" style="margin-top:4px;margin-bottom:8px">À travailler en priorité</div>
      ${themes.slice(0,3).map(t=>{
        const col=t.mastery>70?'var(--ok)':t.mastery>40?'var(--warn)':'var(--err)';
        return`<div class="sp-row" onclick="navigateTo('revision');setTimeout(()=>startSession&&startSession('${t.cat}'),200)">
          <div class="sp-row-ico">${t.em}</div>
          <div class="sp-row-inf">
            <div class="sp-row-name">${t.name}</div>
            <div class="sp-row-sub">${t.mastery}% maîtrise · ${t.due} due${t.due>1?'s':''} · ${t.total} Q</div>
          </div>
          <div class="sp-row-pct" style="color:${col}">${t.mastery}%</div>
        </div>`;
      }).join('')}`;
  }

  /* ANALYSE ERREURS */
  function renderErrorAnalysis(){
    const el=document.getElementById('patch-errors');
    if(!el||!window.S||!window.QB)return;
    const stats={};
    QB.forEach(q=>{
      const c=S.qcm?.cards?.[q.id];if(!c||c.ko===0)return;
      if(!stats[q.cat])stats[q.cat]={total:0,ko:0};
      stats[q.cat].total++;stats[q.cat].ko+=c.ko;
    });
    const sorted=Object.entries(stats)
      .map(([cat,d])=>({cat,rate:Math.round(d.ko/d.total*10)/10,t:THEME_DEF.find(t=>t.cat===cat)}))
      .filter(e=>e.t).sort((a,b)=>b.rate-a.rate).slice(0,3);
    if(!sorted.length){
      el.innerHTML=`<div class="text-sm text-secondary" style="text-align:center;padding:12px 0">🎉 Pas encore de données. Fais des QCM !</div>`;return;
    }
    el.innerHTML=`<div class="sect-label" style="margin-bottom:8px">⚠️ Points faibles identifiés</div>
      ${sorted.map(e=>`<div class="err-insight">
        <div class="err-insight-hd">
          <span style="font-size:16px">${e.t.em}</span>
          <div class="err-insight-name">${e.t.name}</div>
          <div class="err-insight-rate">${e.rate} err/Q</div>
        </div>
        <div class="err-bar"><div class="err-bar-fill" style="width:${Math.min(100,Math.round(e.rate*15))}%"></div></div>
        <button class="btn btn-danger btn-sm btn-full" onclick="navigateTo('revision');setTimeout(()=>startSession&&startSession('${e.cat}'),200)">Travailler ce thème →</button>
      </div>`).join('')}`;
  }

  /* ONBOARDING */
  const ONB_STEPS=[
    {icon:'👮',title:'Bienvenue dans OPJ Elite',desc:'La préparation la plus complète et gamifiée pour réussir l\'examen d\'Officier de Police Judiciaire.'},
    {icon:'📅',title:'Définis ta date d\'examen',desc:'L\'app adapte ton plan d\'étude selon le temps restant.',
     input:`<div class="inp-g mb4"><label class="inp-lbl">Mois de l'examen</label><input type="month" class="inp" id="onb2-date" min="${new Date().toISOString().slice(0,7)}" style="font-size:15px"></div>`},
    {icon:'🎯',title:'13 chapitres complets',desc:'GAV, Flagrance, Perquisitions, Commission Rogatoire, Infractions, Libertés publiques… tout le programme officiel OPJ.'},
    {icon:'🏆',title:'Monte en grade !',desc:'De Gardien de la Paix à Officier de Police Judiciaire — gagne des XP, monte en grade et débloque des badges.'},
  ];
  let onb2Idx=0;

  function tryShowOnboarding(){
    if(!window.S)return;
    if(S.onb2Done)return;
    if((S.user?.xp||0)>0||Object.keys(S.lessons||{}).length>0)return;
    setTimeout(()=>{
      if(document.getElementById('onb2-ov'))return;
      const ov=document.createElement('div');
      ov.id='onb2-ov';ov.className='onb2-ov';
      document.body.appendChild(ov);renderOnb2();
    },900);
  }

  function renderOnb2(){
    const ov=document.getElementById('onb2-ov');if(!ov)return;
    const step=ONB_STEPS[onb2Idx];
    const isLast=onb2Idx===ONB_STEPS.length-1;
    ov.innerHTML=`<div class="onb2-wrap">
      <span class="onb2-icon">${step.icon}</span>
      <div class="onb2-title">${step.title}</div>
      <div class="onb2-desc">${step.desc}</div>
      ${step.input||''}
      <div class="onb2-dots">${ONB_STEPS.map((_,i)=>`<div class="onb2-dot ${i===onb2Idx?'cur':''}"></div>`).join('')}</div>
      <button class="btn btn-p btn-full mb8" onclick="window._onb2Next()">${isLast?'🚀 Commencer !':'Suivant →'}</button>
      ${onb2Idx>0?`<button class="btn btn-ghost btn-full mb8" onclick="window._onb2Prev()">← Retour</button>`:''}
      <button class="btn btn-ghost btn-full" style="color:var(--t3);font-size:12px" onclick="window._onb2Skip()">Passer l'introduction</button>
    </div>`;
  }
  window._onb2Next=function(){
    if(onb2Idx===1){const d=document.getElementById('onb2-date');if(d?.value&&window.S){S.user.examDate=d.value;if(typeof save==='function')save();}}
    onb2Idx++;
    if(onb2Idx>=ONB_STEPS.length){window._onb2Skip();return;}
    renderOnb2();
  };
  window._onb2Prev=function(){onb2Idx=Math.max(0,onb2Idx-1);renderOnb2();};
  window._onb2Skip=function(){
    if(window.S){S.onb2Done=true;if(typeof save==='function')save();}
    const ov=document.getElementById('onb2-ov');
    if(ov){ov.style.animation='pgIn .3s ease reverse';setTimeout(()=>ov.remove(),280);}
    setTimeout(()=>{if(typeof showToast==='function')showToast('💡 Commence par "Le Procès Pénal" en Leçons !','ok');},600);
  };

  // Global ESC support for overlays/modals
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    try{ if(document.getElementById('lesson-ov')?.classList.contains('on')) closeLesson(); }catch(_){}
    try{ if(document.getElementById('fiche-ov')?.style.display==='flex') closeFiche(); }catch(_){}
    try{ if(document.getElementById('ann-ov')?.style.display==='flex') closeAnnale(); }catch(_){}
    try{ if(document.getElementById('pf-ov')?.style.display==='flex') PFM.close(); }catch(_){}
    try{ if(document.getElementById('eval-ov')?.classList.contains('a')) EVAL.close(); }catch(_){}
    try{ if(document.getElementById('pro-modal-ov')?.classList.contains('a')) P.hidePro(); }catch(_){}
    try{ if(document.getElementById('pay-modal-ov')?.classList.contains('a')) P.hidePay(); }catch(_){}
  });

  /* Legacy FSRS/HTML patch removed */

  /* PATCH navigateTo */
  const _navigateTo=window.navigateTo;
  window.navigateTo=function(page){
    if(_navigateTo)_navigateTo(page);
    setTimeout(()=>{
      if(page==='home'){renderMissionsCard();renderStudyPlan();}
      if(page==='profil'){renderErrorAnalysis();}
    },60);
  };

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){renderMissionsCard();renderStudyPlan();}
  });

  if(window.S){ensureMissions();renderMissionsCard();renderStudyPlan();renderErrorAnalysis();tryShowOnboarding();}
})();
