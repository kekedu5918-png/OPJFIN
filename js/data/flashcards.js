const FB=[
  {id:"F01",fam:"vie",nm:"MEURTRE",ref:"Art. 221-1 CP",qual:"Crime",pn:"30 ans RC",em:"âš–ï¸",L:"Donner volontairement la mort à autrui (art. 221-1).",A:"Acte positif sur personne vivante, distincte de l'auteur, lien causal avec le décès. Tentative : oui.",M:"Intentionnel — animus necandi (intention homicide).",E:[{a:"Mineur <15 ans",p:"Perpétuité",r:"221-4 1°"},{a:"PDAP",p:"Perpétuité",r:"221-4 4°"},{a:"Préméditation = ASSASSINAT",p:"Perpétuité",r:"221-3"},{a:"Bande organisée",p:"Perpétuité",r:"221-4 8°"}],cf:"Assassinat (221-3) = meurtre + PRÃ‰MÃ‰DITATION. Violences mortelles (222-7) = intention de blesser seulement.",pg:"Confondre meurtre et violences mortelles (222-7 : 15 ans RC, pas d'intention de tuer)."},
  {id:"F02",fam:"vie",nm:"HOMICIDE INVOLONTAIRE",ref:"Art. 221-6 CP",qual:"Délit",pn:"3 ans / 45 000â‚¬",em:"ðŸš—",L:"Causer la mort par maladresse, imprudence, négligence ou MOSP.",A:"Faute, lien causal, mort. Tentative : non.",M:"NON intentionnel — faute.",E:[{a:"Violation MOSP",p:"5 ans / 75kâ‚¬",r:"221-6 al.2"},{a:"Alcool + conduite",p:"7 ans / 100kâ‚¬",r:"221-6-1"}],cf:"Meurtre (221-1) = intention de tuer. HI = faute sans intention.",pg:"PAS d'intention de tuer — c'est l'élément distinctif clé."},
  {id:"F03",fam:"integrite",nm:"VIOLENCES VOLONTAIRES",ref:"Art. 222-7 à 222-16 CP",qual:"Variable",pn:"Variable selon ITT",em:"ðŸ‘Š",L:"R624-1 (sans ITT), R625-1 (ITT≤8j), 222-11 (ITT>8j), 222-9 (mutilation), 222-7 (mort).",A:"Acte positif de violence, résultat. Tentative : non.",M:"Intentionnel — conscience d'affecter l'intégrité.",E:[{a:"PDAP/mineur/arme",p:"Aggravation",r:"222-12"},{a:"Mort sans intention",p:"15 ans RC",r:"222-7"}],cf:"Meurtre = intention de tuer. Violences = intention de blesser.",pg:"L'échelle pénale dépend de l'ITT fixée par le médecin légiste."},
  {id:"F04",fam:"integrite",nm:"VIOL",ref:"Art. 222-23 CP",qual:"Crime",pn:"15 ans RC",em:"ðŸ”´",L:"Pénétration sexuelle ou acte bucco-génital par violence, contrainte, menace ou surprise.",A:"Pénétration ou acte bucco-génital, sans consentement. Tentative : oui.",M:"Intentionnel — conscience d'imposer un acte non consenti.",E:[{a:"Mineur <15 ans",p:"20 ans RC",r:"222-24 2°"},{a:"Mort victime",p:"30 ans RC",r:"222-25"}],cf:"Viol = PÃ‰NÃ‰TRATION (crime). Agression sexuelle = sans pénétration (délit).",pg:"Actes bucco-génitaux = viol (crime 15 ans) depuis la jurisprudence."},
  {id:"F05",fam:"biens",nm:"VOL",ref:"Art. 311-1 CP",qual:"Délit",pn:"3 ans / 45 000â‚¬",em:"ðŸ‘œ",L:"Soustraction frauduleuse de la chose d'autrui.",A:"Soustraction, chose meuble, appartenant à autrui. Tentative : oui.",M:"Intentionnel — volonté de se comporter en propriétaire.",E:[{a:"Violence",p:"5-10 ans",r:"311-5/6"},{a:"Arme",p:"10 ans",r:"311-8"},{a:"Bande organisée",p:"15 ans RC",r:"311-9"}],cf:"Escroquerie = tromperie → remise. Vol = soustraction.",pg:"Vol en bande organisée = CRIME (15 ans RC), pas délit !"},
  {id:"F06",fam:"biens",nm:"ESCROQUERIE",ref:"Art. 313-1 CP",qual:"Délit",pn:"5 ans / 375 000â‚¬",em:"ðŸŽ­",L:"Obtenir une remise par faux nom, fausse qualité ou manÅ“uvres frauduleuses.",A:"Tromperie, remise, préjudice. Tentative : oui.",M:"Intentionnel.",E:[{a:"Bande organisée",p:"10 ans + 1Mâ‚¬",r:"313-2"}],cf:"Vol : PREND. Escroquerie : DONNE suite à tromperie.",pg:"Simples mensonges ≠ escroquerie (il faut des manÅ“uvres frauduleuses)."},
  {id:"F07",fam:"biens",nm:"ABUS DE CONFIANCE",ref:"Art. 314-1 CP",qual:"Délit",pn:"3 ans / 375 000â‚¬",em:"ðŸ¤",L:"Détourner un bien remis à charge de le rendre.",A:"Remise préalable licite, détournement, préjudice. Tentative : non.",M:"Intentionnel.",E:[{a:"Mandataire de justice",p:"7 ans + 750kâ‚¬",r:"314-2"}],cf:"ADB : bien CONFIÃ‰ puis DÃ‰TOURNÃ‰. Vol : soustrait sans remise.",pg:"ADB exige remise PRÃ‰ALABLE et LICITE — critère fondamental."},
  {id:"F08",fam:"biens",nm:"RECEL",ref:"Art. 321-1 CP",qual:"Délit",pn:"5 ans / 375 000â‚¬",em:"ðŸ“¦",L:"Dissimuler, détenir, transmettre ou bénéficier du produit d'un crime/délit.",A:"Acte matériel, objet frauduleux d'un tiers. Tentative : non.",M:"Intentionnel — connaissance de l'origine frauduleuse.",E:[{a:"Habituel/professionnel",p:"10 ans + 750kâ‚¬",r:"321-2"}],cf:"Recel ≠ complicité. Recel = infraction autonome continue.",pg:"Le recel est une infraction CONTINUE (persiste tant que détenu)."},
  {id:"F09",fam:"autorite",nm:"OUTRAGE",ref:"Art. 433-5 CP",qual:"Délit",pn:"1 an / 15 000â‚¬",em:"ðŸ’¬",L:"Paroles/gestes/menaces non publics à PDAP.",A:"Expression outrageante, NON publique, DIRECTEMENT à la personne.",M:"Intentionnel — connaissance qualité + conscience du caractère outrageant.",E:[{a:"En réunion",p:"2 ans + 30kâ‚¬",r:"433-5 al.3"}],cf:"Outrage = VERBAL, DIRECT. Rébellion = PHYSIQUE.",pg:"Si PUBLIC = injure (loi 1881, pas le CP). Piège classique."},
  {id:"F10",fam:"autorite",nm:"RÃ‰BELLION",ref:"Art. 433-6 CP",qual:"Délit",pn:"1 an / 15 000â‚¬",em:"âœŠ",L:"Résistance violente à PDAP lors d'un acte légitime.",A:"Résistance VIOLENTE et ACTIVE lors d'un acte légitime. Tentative : non.",M:"Intentionnel.",E:[{a:"Arme",p:"2 ans + 30kâ‚¬",r:"433-8"}],cf:"Rébellion = PHYSIQUE. Résistance PASSIVE ≠ rébellion.",pg:"Se laisser tomber au sol = résistance passive ≠ rébellion."},
  {id:"F11",fam:"stups",nm:"USAGE STUPÃ‰FIANTS",ref:"Art. L3421-1 CSP",qual:"Délit",pn:"1 an / 3 750â‚¬",em:"ðŸŒ¿",L:"Usage illicite de substance classée.",A:"Usage illicite, substance classée. Tentative : non.",M:"Intentionnel.",E:[{a:"—",p:"—",r:"—"}],cf:"Usage (L3421-1) = 1 an. Détention/trafic (222-37) = 10 ans.",pg:"AFD possible : 200 â‚¬."},
  {id:"F12",fam:"route",nm:"CONDUITE ALCOOLIQUE",ref:"Art. L234-1 C.route",qual:"Délit",pn:"2 ans / 4 500â‚¬",em:"ðŸº",L:"Taux ≥ 0,80 g/l sang ou ≥ 0,40 mg/l air expiré.",A:"Conducteur, taux délictuel prouvé.",M:"Intentionnel — volonté de conduire après consommation.",E:[{a:"Cumul stups",p:"3 ans + 9kâ‚¬",r:"L235-1 al.2"}],cf:"0,50-0,80 g/l = contravention. ≥ 0,80 g/l = DÃ‰LIT.",pg:"Stups : PAS DE SEUIL — toute présence = délit."},
  {id:"F13",fam:"biens",nm:"EXTORSION",ref:"Art. 312-1 CP",qual:"Crime",pn:"7 ans / 100 000â‚¬",em:"ðŸ’°",L:"Obtenir par violence/menace/contrainte une remise.",A:"Contrainte, remise par la victime. Tentative : oui.",M:"Intentionnel.",E:[{a:"Arme",p:"10 ans",r:"312-2"},{a:"Bande organisée",p:"20 ans RC",r:"312-6"}],cf:"Vol : SOUSTRAIT. Extorsion : REMET sous contrainte physique.",pg:"Chantage = menace de RÃ‰VÃ‰LATION. Extorsion = contrainte physique."},
  {id:"F14",fam:"stups",nm:"TRAFIC STUPÃ‰FIANTS",ref:"Art. 222-34 à 222-40 CP",qual:"Crime/Délit",pn:"10 à 30 ans RC",em:"ðŸ’Š",L:"Participation à un réseau de distribution de substances classées.",A:"Participation active, substances classées, rôle variable.",M:"Intentionnel — connaissance nature illicite.",E:[{a:"Bande organisée",p:"30 ans RC + 7,5Mâ‚¬",r:"222-34"}],cf:"Usage (1 an) vs transport/détention (10 ans) vs trafic CO (30 ans RC).",pg:"Trafic en BO = 30 ans RC — peine criminelle maximale."},
  {id:"F15",fam:"autorite",nm:"CORRUPTION PASSIVE",ref:"Art. 432-11 CP",qual:"Crime",pn:"10 ans / 1 000 000â‚¬",em:"ðŸ’¼",L:"Agent public qui sollicite/agrée des avantages indus liés à sa fonction.",A:"Offre/demande, avantage indu, rapport avec la fonction.",M:"Intentionnel.",E:[{a:"Trafic d'influence",p:"10 ans",r:"432-11 al.2"}],cf:"Corruption passive (agent) vs active (particulier, art. 433-1).",pg:"Corruption passive (agent) ≠ active (particulier qui propose)."},
];


/* â”€â”€â”€ STATE â”€â”€â”€ */
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
      S.page='home';save();return;
    }
    S={...defaultState(),...s,page:'home'};
    // Assurer chaque clé v28
    if(!S.badges)S.badges={};if(!S.shield)S.shield={count:1,lastEarned:null};
    if(!S.activity)S.activity={};if(!S.defi)S.defi={lastDate:'',done:false};
    if(!S.pfs)S.pfs={};if(!S.fs)S.fs={};if(!S.annalesDone)S.annalesDone={};
    if(!S.printed)S.printed={};if(!S.printDone)S.printDone=0;
    if(S.isPro===undefined)S.isPro=S.user?.isPRO||false;
  }catch(e){console.warn('[OPJ v28] loadState:',e);}
  // Migration v29 → v30
  if(!loaded){const old=localStorage.getItem('opje_v30')||localStorage.getItem('opj_v30')||localStorage.getItem('opje_v29')||localStorage.getItem('opj_v29');
    if(old){try{const d=JSON.parse(old);S={...defaultState,...d};save();}catch(e){}}
  }

}
function save(){
  /* Sync isPro â†” user.isPRO */
  if(S.isPro&&!S.user.isPRO)S.user.isPRO=true;
  if(S.user.isPRO&&!S.isPro)S.isPro=true;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(S));}
  catch(e){showToast('âš ï¸ Stockage plein','err');}
  /* Sync cloud si connecté */
  if(currentUser && supabaseClient) {
    SYNC.debouncedSave();
  }
}

/* â”€â”€â”€ FSRS-LITE â”€â”€â”€ */
const FSRS={
  newCard:()=>({interval:0,ef:2.5,due:Date.now(),reps:0,ok:0,ko:0}),
  review(card,correct){
    const c={...card};c.reps++;
    if(correct){
      c.ok++;
      if(c.reps===1)c.interval=1;
      else if(c.reps===2)c.interval=6;
      else c.interval=Math.max(1,Math.round(c.interval*c.ef));
      c.ef=Math.min(2.5,Math.max(1.3,c.ef+0.1));
    }else{
      c.ko++;c.interval=1;c.ef=Math.max(1.3,c.ef-0.2);
    }
    c.due=Date.now()+c.interval*86400000;return c;
  },
  isDue:card=>!card||card.due<=Date.now()
};

/* â”€â”€â”€ GRADES HELPERS â”€â”€â”€ */
function getGrade(){let g=GRADES[0];for(const gr of GRADES)if(S.user.xp>=gr.min)g=gr;return g;}
function getNextGrade(){for(const gr of GRADES)if(S.user.xp<gr.min)return gr;return null;}
function getXPPct(){const g=getGrade(),n=getNextGrade();if(!n)return 100;return Math.min(100,Math.round((S.user.xp-g.min)/(n.min-g.min)*100));}

/* â”€â”€â”€ THEME â”€â”€â”€ */
const THEME28={
  apply(){
    const m=S.lightMode;
    document.documentElement.setAttribute('data-theme',m?'light':'dark');
    const lbl=document.getElementById('theme-label');
    if(lbl)lbl.textContent=m?'Mode sombre':'Mode clair';
  },
  toggle(){S.lightMode=!S.lightMode;save();THEME28.apply();}
};

/* â”€â”€â”€ XP & STREAK â”€â”€â”€ */
function addXP(amount){
  const before=getGrade();
  S.user.xp+=amount;
  const after=getGrade();
  if(after.min>before.min){
    setTimeout(()=>{
      showToast('ðŸŽ‰ '+after.icon+' '+after.name,'ok');
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

/* â”€â”€â”€ NAVIGATION â”€â”€â”€ */
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

/* â”€â”€â”€ RENDER HOME â”€â”€â”€ */
function renderHome(){
  const g=getGrade(),n=getNextGrade(),pct=getXPPct();
  const el=id=>document.getElementById(id);
  const hour=new Date().getHours();
  const greet=hour<12?'Bonjour':hour<18?'Bon après-midi':'Bonsoir';
  if(el('h-greeting'))el('h-greeting').textContent=greet+' ðŸ‘®';
  if(el('h-name'))el('h-name').textContent=eh(S.user.name);
  if(el('h-xp'))el('h-xp').textContent=S.user.xp;
  if(el('h-streak'))el('h-streak').innerHTML=S.user.streak+'<span class="streak-flame">ðŸ”¥</span>';
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
    {cat:'GAV',name:'Garde à Vue',em:'ðŸ”’'},
    {cat:'FLAGRANCE',name:'Flagrance',em:'ðŸš¨'},
    {cat:'PERQUIZ',name:'Perquisitions',em:'ðŸ”'},
    {cat:'MANDATS',name:'Mandats',em:'ðŸ“‹'},
    {cat:'INFRACTIONS',name:'Infractions',em:'âš¡'},
    {cat:'PRESCRIP',name:'Prescription',em:'â³'},
    {cat:'LIBERTES',name:'Libertés',em:'ðŸ›ï¸'},
    {cat:'INSTRUCTION',name:'Instruction',em:'ðŸ›ï¸'},
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
    <div class="weak-widget-title">âš ï¸ Zones à renforcer</div>
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

/* â”€â”€â”€ RENDER LEÃ‡ONS â”€â”€â”€ */
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
          <span class="chapter-arrow">â€º</span>
        </div>
      </div>
      <div class="chapter-lessons" id="lessons-${ch.id}">
        ${ch.lessons.map(l=>`<div class="lesson-item" onclick="openLesson('${l.id}');event.stopPropagation()">
          <span class="lesson-em">${l.em}</span>
          <div class="lesson-inf">
            <div class="lesson-name">${l.name}</div>
            <div class="lesson-meta">${l.ref} · +${l.xp} XP</div>
          </div>
          <div class="lesson-status ${S.lessons[l.id]?'done':'new'}">${S.lessons[l.id]?'âœ“':'â—‹'}</div>
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
  if(lesson.traps?.length)lesson.traps.forEach(t=>html+=`<div class="lesson-trap"><div class="lesson-trap-lbl">âš ï¸ Piège d'examen</div><div class="lesson-trap-txt">${t}</div></div>`);
  if(lesson.keys?.length)html+=`<div class="lesson-keys"><div class="lesson-keys-lbl">âš¡ Ã€ retenir</div>${lesson.keys.map(k=>`<div class="lesson-key-item">${k}</div>`).join('')}</div>`;
  html+=`<div style="margin-top:18px">
    <button class="btn btn-p" onclick="markLessonDone('${id}')" style="${isDone?'background:var(--ok-bg);border:1px solid var(--ok);color:var(--ok)':''}">
      ${isDone?'âœ… Leçon maîtrisée — Relire':'âœ“ Marquer comme vue · +'+lesson.xp+' XP'}
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
    save();showToast('âœ… Leçon vue ! +'+(lesson?.xp||10)+' XP','ok');haptic(50);
  }
  closeLesson();renderLecons();renderChapterProgress();
}

/* â”€â”€â”€ RENDER RÃ‰VISION â”€â”€â”€ */
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
  if(el)el.textContent=due>0?due+' question'+(due>1?'s':'')+' à réviser maintenant':'Tout est à jour âœ…';
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
    {cat:'GAV',name:'Garde à Vue',em:'ðŸ”’',color:'#3b82f6'},
    {cat:'FLAGRANCE',name:'Flagrance',em:'ðŸš¨',color:'#ef4444'},
    {cat:'PERQUIZ',name:'Perquisitions',em:'ðŸ”',color:'#8b5cf6'},
    {cat:'AUDLIB',name:'Audition Libre',em:'ðŸŽ™ï¸',color:'#10b981'},
    {cat:'MANDATS',name:'Mandats',em:'ðŸ“‹',color:'#f59e0b'},
    {cat:'MINEURS',name:'Mineurs',em:'ðŸ‘¶',color:'#ec4899'},
    {cat:'OPJ',name:'Statut OPJ',em:'âš–ï¸',color:'#d4af37'},
    {cat:'PRESCRIP',name:'Prescription',em:'â³',color:'#6366f1'},
    {cat:'RECIDIVE',name:'Récidive',em:'ðŸ”„',color:'#f97316'},
    {cat:'LEGDEF',name:'Légitime Défense',em:'ðŸ›¡ï¸',color:'#14b8a6'},
    {cat:'NULLITES',name:'Nullités',em:'ðŸš«',color:'#64748b'},
    {cat:'INSTRUCTION',name:'Instruction',em:'ðŸ›ï¸',color:'#0ea5e9'},
    {cat:'INFRACTIONS',name:'Infractions',em:'âš¡',color:'#e11d48'},
    {cat:'LIBERTES',name:'Libertés',em:'ðŸ›ï¸',color:'#14b8a6'},
    {cat:'CDO',name:'Criminalité Org.',em:'ðŸ•µï¸',color:'#a855f7'},
    {cat:'COMMISSION',name:'Commission Rogatoire',em:'ðŸ“„',color:'#22d3ee'},
    {cat:'ALTERNATIVES',name:'Alternatives AP',em:'ðŸ¤',color:'#22c55e'},
    {cat:'TAJ',name:'Fichiers Police',em:'ðŸ—ƒï¸',color:'#a855f7'},
    {cat:'ACTION_PUB',name:'Action Publique',em:'âš–ï¸',color:'#64748b'},
    {cat:'CONTROLES',name:'Contrôles ID',em:'ðŸªª',color:'#0ea5e9'},
    {cat:'MESURES_COERC',name:'Mesures Coercitives',em:'â›“ï¸',color:'#8b5cf6'},
    {cat:'FICHIERS',name:'Fichiers',em:'ðŸ’¾',color:'#6366f1'},
    {cat:'ENQUETES_SPEC',name:'Enquêtes Spéciales',em:'ðŸ”¬',color:'#ec4899'},
    {cat:'PATRIMONIAL',name:'Patrimonial',em:'ðŸ’°',color:'#f59e0b'},
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
  setV('rev-due-count',dueQ>0?`${dueQ} question${dueQ>1?'s':''} à réviser maintenant`:'Tout est à jour âœ…');

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
          ${due>0?`<span class="theme-due-badge">âš¡ ${due} à revoir</span>`:''}
          ${completed?`<span class="theme-done-badge">âœ“ Complété</span>`:''}
        </div>
        <div class="theme-card2-bar">
          <div class="theme-card2-fill" style="width:${pctDone}%;background:${t.color}"></div>
          ${pctOk>0?`<div class="theme-card2-ok-fill" style="width:${Math.min(pctOk,100)*pctDone/100}%;background:${t.color}"></div>`:''}
        </div>
      </div>
      <div class="theme-card2-right">
        ${completed
          ?`<div class="theme-card2-done">âœ“</div>`
          :`<div class="theme-card2-pct" style="color:${t.color}">${pctDone}<span>%</span></div>`
        }
        <div class="theme-card2-arr">â€º</div>
      </div>
    </div>`;
  }).join('');
}


function renderBubbles(){
  const grid=document.getElementById('bubble-grid');if(!grid)return;
  grid.style.cssText='display:block;padding:0';
  const search=(document.getElementById('fiches-search')?.value||'').toLowerCase();

  const FAMILIES={
    vie:      {label:'Vie',           em:'ðŸ’€',color:'#ef4444',grad:'linear-gradient(135deg,#ef4444,#dc2626)'},
    integrite:{label:'Intégrité',     em:'ðŸ©¸',color:'#f97316',grad:'linear-gradient(135deg,#f97316,#ea580c)'},
    biens:    {label:'Biens',         em:'ðŸ’°',color:'#f59e0b',grad:'linear-gradient(135deg,#f59e0b,#d97706)'},
    autorite: {label:'Autorité',      em:'ðŸ›¡ï¸',color:'#3b82f6',grad:'linear-gradient(135deg,#3b82f6,#2563eb)'},
    stups:    {label:'Stupéfiants',   em:'ðŸ’Š',color:'#a855f7',grad:'linear-gradient(135deg,#a855f7,#9333ea)'},
    route:    {label:'Route',         em:'ðŸš—',color:'#10b981',grad:'linear-gradient(135deg,#10b981,#059669)'},
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
    grid.innerHTML=`<div class="empty-state"><span class="empty-state-em">ðŸ”</span>Aucune fiche pour "${search}"</div>`;
    return;
  }

  /* Noms courts pour tiles */
  const shortNm=nm=>{
    const map={
      'MEURTRE':'Meurtre','HOMICIDE INVOLONTAIRE':'Homicide inv.','VIOLENCES VOLONTAIRES':'Violences vol.',
      'VIOL':'Viol','VOL':'Vol','ESCROQUERIE':'Escroquerie','ABUS DE CONFIANCE':'Abus confiance',
      'RECEL':'Recel','OUTRAGE':'Outrage','RÃ‰BELLION':'Rébellion','USAGE STUPÃ‰FIANTS':'Usage stups',
      'CONDUITE ALCOOLIQUE':'Conduite alcool','EXTORSION':'Extorsion','TRAFIC STUPÃ‰FIANTS':'Trafic stups',
      'CORRUPTION PASSIVE':'Corruption',
    };
    return map[nm]||(nm.length>12?nm.slice(0,11)+'â€¦':nm);
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
        ${isMastered?`<div class="ft-crown">â˜…</div>`
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
            <span class="ft-group-cnt" style="color:${allDone?'var(--gold)':fam.color}">${allDone?'â˜… Complète':famMastered+'/'+items.length}</span>
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
    {s:'',   lbl:'Non vue',    icon:'â—‹', bg:'var(--bg-3)',     c:'var(--t3)'},
    {s:'s',  lbl:'Vue âœ“',      icon:'â—', bg:'rgba(37,99,235,.12)', c:'#3b82f6'},
    {s:'m',  lbl:'Maîtrisée â˜…',icon:'â˜…', bg:'rgba(212,175,55,.12)','c':'var(--gold)'},
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
      <span class="fo-pn-icon">âš–ï¸</span>
      <span class="fo-pn-txt">${f.pn}</span>
    </div>
  </div>

  <!-- STATUS SÃ‰LECTEUR -->
  <div class="fo-status-row">
    ${statuses.map(b=>`
      <button class="fo-status-btn${st===b.s?' active':''}"
        onclick="setFiche('${id}','${b.s}')"
        style="${st===b.s?`background:${b.bg};color:${b.c};border-color:${b.c}`:''}">
        <span class="fo-status-icon">${b.icon}</span>
        <span class="fo-status-lbl">${b.lbl}</span>
      </button>`).join('')}
  </div>

  <!-- Ã‰LÃ‰MENTS CONSTITUTIFS -->
  <div class="fo-section">
    <div class="fo-section-hd">ðŸ“ Ã‰léments constitutifs</div>
    ${f.L?`<div class="fo-block fo-block-legal">
      <div class="fo-block-label">ðŸ“œ LÃ‰GAL</div>
      <div class="fo-block-text">${f.L}</div>
    </div>`:''}
    ${f.A?`<div class="fo-block fo-block-materiel">
      <div class="fo-block-label">ðŸ”¨ MATÃ‰RIEL</div>
      <div class="fo-block-text">${f.A}</div>
    </div>`:''}
    ${f.M?`<div class="fo-block fo-block-moral">
      <div class="fo-block-label">ðŸ§  MORAL</div>
      <div class="fo-block-text">${f.M}</div>
    </div>`:''}
  </div>`;

  /* AGGRAVANTES */
  const aggs=(f.E||[]).filter(e=>e.a&&e.a!=='—');
  if(aggs.length){
    h+=`<div class="fo-section">
      <div class="fo-section-hd">â¬†ï¸ Circonstances aggravantes</div>
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
      <div class="fo-section-hd">ðŸ”€ Ne pas confondre</div>
      <div class="fo-cf-card">
        <div class="fo-cf-text">${cfTxt}</div>
      </div>
    </div>`;
  }

  /* PIÃˆGE D'EXAMEN */
  if(f.pg){
    h+=`<div class="fo-piege">
      <div class="fo-piege-hd">âš ï¸ Piège d'examen</div>
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

/* â”€â”€â”€ QCM ENGINE â”€â”€â”€ */
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

/* â”€â”€â”€ v50 — Mélange des réponses QCM â”€â”€â”€ */
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
    html+=`<div class="q-expl"><div class="q-verdict ${ok?'ok':'ko'}">${ok?'âœ“ Correct !':'âœ— Incorrect'}</div>${q.expl}</div>`;
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
  const emoji=pct>=80?'ðŸ†':pct>=60?'ðŸ‘':'ðŸ’ª';
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

/* â”€â”€â”€ CR TIMER â”€â”€â”€ */
let _crPhase=1,_crTimer=null;
function startCRTimer(){_crPhase=1;document.getElementById('cr-timer-ov').style.display='flex';runCRPhase();}
function runCRPhase(){
  clearInterval(_crTimer);
  const lbl=document.getElementById('cr-phase-lbl'),disp=document.getElementById('cr-timer-disp'),sub=document.getElementById('cr-phase-sub'),skip=document.getElementById('cr-skip-btn');
  const secs=_crPhase===1?40*60:20*60;
  if(lbl)lbl.textContent=_crPhase===1?'ðŸ“ Préparation':'ðŸŽ¤ CR oral — Ã€ vous !';
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

/* â”€â”€â”€ PROFIL â”€â”€â”€ */
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
  if(el('pr-streak'))el('pr-streak').innerHTML=S.user.streak+'ðŸ”¥';
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
  const lbls=labels.map((l,i)=>`<text x="${pts[i].lx}" y="${pts[i].ly}" text-anchor="middle" dominant-baseline="middle" fill="rgba(240,246,255,.45)" font-size="9" font-family="DM Mono,monospace">${l}</text>`).join('');
  el.innerHTML=`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" style="max-width:100%"><g>${grids}${axes}<polygon points="${data}" fill="rgba(37,99,235,.15)" stroke="rgba(59,130,246,.7)" stroke-width="1.5"/>${lbls}</g></svg>`;
}
function showGrades(){
  const html=`<div style="padding:18px">
    <div class="font-title fw-800 text-xl mb16">ðŸ… Grades Police Nationale</div>
    ${GRADES.map(gr=>`<div style="display:flex;align-items:center;gap:12px;padding:9px;background:${S.user.xp>=gr.min?'var(--accent-glow)':'transparent'};border-radius:var(--r-m);margin-bottom:4px">
      <span style="font-size:20px">${gr.icon}</span>
      <div style="flex:1"><div class="text-sm fw-700" style="color:${S.user.xp>=gr.min?'var(--t1)':'var(--t3)'}">${gr.name}</div><div class="text-xs text-muted font-mono">${gr.min} XP requis</div></div>
      ${S.user.xp>=gr.min?'<span class="text-ok">âœ“</span>':''}
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

/* â”€â”€â”€ CARTOUCHES â”€â”€â”€ */


const CR_DOSSIERS=[
{id:1,titre:"Personne grièvement blessée",emoji:"ðŸ©¸",cadre:"Flagrance",qual:"Tentative homicide / Violences aggravées",tags:["Flagrance","Art. 222-1 CP","Urgence"],
faits:"Ã€ 23h15, votre patrouille est appelée pour une personne inconsciente rue des Acacias. Vous découvrez M. MARTIN Thierry, 34 ans, crâne fracturé. SAMU en route. Témoin DUPONT René signale un suspect masculin, veste rouge, fuite il y a 10 minutes.",
qualification:"Tentative d'homicide volontaire art. 221-1 CP ou violences aggravées nuit/guet-apens art. 222-8 CP. Cadre : flagrance art. 53 CPP.",
pieges:["Qualifier au plus grave sans attendre le pronostic vital","Préciser et justifier le cadre flagrance","Demander autorisation GAV dès interpellation","Sécuriser la scène : témoins, traces, vidéosurveillance"],
corrige:"Monsieur le Procureur, OPJ [NOM], brigade [SERVICE], il est [HEURE].\n\nJe vous rends compte de la découverte d'une personne grièvement blessée rue des Acacias, ce jour à 23h15.\n\nQUALIFICATION : Tentative d'homicide volontaire — art. 221-1 al.1 CP.\nCADRE : Enquête de flagrance — art. 53 CPP.\nFAITS : Victime inconsciente, crâne fracturé. Témoin DUPONT René signale suspect veste rouge, fuite il y a 10 min.\nACTES RÃ‰ALISÃ‰S : Sécurisation scène. Demande SAMU. Recueil déposition DUPONT.\nDEMANDES : Autorisation GAV suspect dès interpellation. Réquisitions vidéosurveillance. Avis médecin légiste.\n\nJe reste disponible."},
{id:2,titre:"Cambriolage en cours",emoji:"ðŸ ",cadre:"Flagrance",qual:"Vol aggravé — Art. 311-4 CP",tags:["Flagrance","Art. 311-4 CP","GAV"],
faits:"Ã€ 02h30, deux individus dans une bijouterie fermée, vitrine brisée. Interpellation de SAID Karim, 22 ans : 12 montres + pied de biche. Un complice fuit par les toits. Propriétaire M. CHEN confirme.",
qualification:"Vol aggravé effraction + nuit + réunion — art. 311-4 2° et 4° CP. Flagrance art. 53 CPP.",
pieges:["Cumuler les circonstances aggravantes","Demander perquisition domicile","Signalement complice","Sceller séparément chaque objet"],
corrige:"Monsieur le Procureur, OPJ [NOM], brigade [SERVICE].\n\nVol aggravé effraction + nuit + réunion — art. 311-4 2° et 4° CP.\nFlagrance art. 53 CPP.\n\nSAID Karim interpellé avec 12 montres et pied de biche. Complice en fuite.\n\nDEMANDES : GAV SAID. Perquisition domicile. Signalement complice. Réquisitions caméra."},
{id:3,titre:"Violences conjugales habituelles",emoji:"ðŸ‘Š",cadre:"Préliminaire",qual:"Violences habituelles — Art. 222-14 CP",tags:["Préliminaire","Art. 222-14 CP"],
faits:"Mme PETIT Sophie, 31 ans, se présente. Violences répétées sur 6 mois par son conjoint. Certificat médical : ITT 5 jours. Main courante en mars. Deux enfants mineurs au domicile.",
qualification:"Violences habituelles sur conjoint, ITT < 8 jours, présence enfants — art. 222-14 2° et 3° CP.",
pieges:["HABITUALITÃ‰ art. 222-14 ≠ violences simples","Vérifier si enfants témoins → aggravante","Pas de perquisition sans accord ou JLD en préliminaire","Réaliser l'EVVI"],
corrige:"Madame la Procureure, OPJ [NOM].\n\nViolences habituelles sur conjoint, ITT 5 jours, présence enfants — art. 222-14 2° et 3° CP.\nPréliminaire — faits sur 6 mois.\n\nDEMANDES : GAV M. LEROY. JLD pour perquisition si refus. Saisine JAF."},
{id:4,titre:"Trafic de stupéfiants — bande organisée",emoji:"ðŸ’Š",cadre:"Flagrance + CO",qual:"Trafic stups bande organisée — Art. 222-34 CP",tags:["Criminalité organisée","Art. 222-37 CP","GAV 96h"],
faits:"Après 3 semaines de surveillance, interpellation de GARCIA Pablo, 28 ans. Sur lui : 250g cocaïne, 3 500 â‚¬ espèces. Sur TRAN Van, 24 ans : 2g usage perso.",
qualification:"GARCIA : trafic cocaïne bande organisée — art. 222-34. TRAN : usage — L3421-1 CSP.",
pieges:["Distinguer GARCIA (trafiquant) et TRAN (usage)","Régime dérogatoire CO","Saisir les avoirs criminels"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nGARCIA : trafic cocaïne BO — art. 222-34. TRAN : usage — L3421-1.\nRégime CO art. 706-73.\n\nDEMANDES : GAV GARCIA CO 96h JLD. GAV TRAN droit commun. Saisie 3 500 â‚¬."},
{id:5,titre:"Accident — délit de fuite + alcool",emoji:"ðŸš—",cadre:"Flagrance",qual:"Blessures involontaires aggravées — Art. 222-19-1 CP",tags:["Flagrance","Art. 222-19-1 CP","Alcool"],
faits:"Ã€ 20h30, M. ROUSSEAU Bernard renverse un cycliste en brûlant un feu et prend la fuite. Interpellé 2h30 plus tard. Alcoolémie : 1,8 g/l. Victime : fracture bassin + commotion — ITT 6 semaines.",
qualification:"Blessures involontaires aggravées alcool + délit de fuite — art. 222-19-1 CP.",
pieges:["ITT ≥ 3 mois → aggravante spécifique","Cumuler infractions code de la route","Immobiliser le véhicule"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nBlessures involontaires ITT > 3 mois + délit de fuite + alcool 1,8 g/l.\nFlagrance art. 53 CPP.\n\nDEMANDES : GAV ROUSSEAU. Rétention permis. Mise en fourrière."},
{id:6,titre:"Découverte d'un corps",emoji:"ðŸ’€",cadre:"Art. 74 CPP",qual:"Mort suspecte — Art. 74 CPP",tags:["Art. 74 CPP","Cause inconnue","Médecin légiste"],
faits:"Ã€ 06h15, découverte d'un homme décédé dans un parc. Aucune trace visible de violence. Identité inconnue.",
qualification:"Art. 74 CPP — enquête sur les causes de la mort.",
pieges:["Ne pas qualifier avant autopsie","Ne pas ouvrir une information judiciaire soi-même","Périmètre de sécurité IMMÃ‰DIAT"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nDécouverte de corps de cause inconnue. Art. 74 CPP.\n\nDEMANDES : Réquisition médecin légiste. Identification victime. Votre décision sur saisine JI si cause suspecte."},
{id:7,titre:"Vol avec violence en réunion",emoji:"ðŸ‘Š",cadre:"Flagrance",qual:"Vol avec violence en réunion — Art. 311-5 CPn",tags:["Flagrance","Art. 311-5 CPn","GAV"],
faits:"Ã€ 14h30, trois individus arrachent téléphone et portefeuille en frappant la victime. Un suspect interpellé 200 m plus loin avec le téléphone. La victime saigne du nez.",
qualification:"Vol avec violence en réunion — art. 311-5 + 311-6 CPn.",
pieges:["Vérifier que la FLAGRANCE est bien caractérisée","ITT à demander","Co-auteurs en fuite : fiche de recherche"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nVol avec violence en réunion — art. 311-5 + 311-6 CPn.\n\nDEMANDES : GAV suspect. ITT victime. Diffusion co-auteurs."},
{id:8,titre:"Violence conjugale — retrait de plainte",emoji:"ðŸ‘",cadre:"Préliminaire",qual:"Violences conjugales — Art. 222-11 + 132-80 CPn",tags:["Art. 132-80","Violences conjugales"],
faits:"Ã€ 22h45, intervention pour cris. La femme présente un hématome à l'Å“il. Elle refuse de porter plainte. Le mari nie.",
qualification:"Violences volontaires + aggravante conjoint art. 132-80.",
pieges:["Le retrait de plainte ne met PAS fin aux poursuites","L'OPJ peut procéder même sans plainte","EVVI obligatoire"],
corrige:"Madame la Procureure, OPJ [NOM].\n\nViolences conjugales — art. 222-11 + 132-80 CPn.\n\nVictime refuse plainte — procédure d'initiative. EVVI réalisée.\n\nDEMANDES : GAV du mari ? Ã‰loignement ? ITT."},
{id:9,titre:"Trafic de stupéfiants — contrôle routier",emoji:"ðŸ”",cadre:"Préliminaire / Flagrance",qual:"Détention de stupéfiants — Art. 222-37 CPn",tags:["Art. 222-37 CPn","Saisie"],
faits:"Lors d'un contrôle, conducteur nerveux. Coffre : 1 kg résine cannabis + 3 500 â‚¬ en liquide. Il nie.",
qualification:"Détention et transport de stupéfiants — art. 222-37.",
pieges:["1 kg + argent liquide = faisceau d'indices de trafic","Saisir les 3 500 â‚¬","Si réseau suspecté : saisine OCTRIS"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nDétention et transport stups — art. 222-37 CPn. 1 kg cannabis + 3 500 â‚¬.\n\nDEMANDES : GAV. Saisie avoirs. Saisine OCTRIS si réseau."},
{id:10,titre:"Mineur — violences au collège",emoji:"ðŸŽ’",cadre:"CJPM 2021",qual:"Violences ITT > 8 jours — Art. 222-11 CPn",tags:["CJPM 2021","Mineur","Art. 222-11"],
faits:"Un élève de 15 ans a frappé un camarade. La victime est transportée SAMU (fracture du nez probable). Parents injoignables.",
qualification:"Violences volontaires ITT > 8 jours — art. 222-11. CJPM 2021.",
pieges:["NE PAS appliquer les règles des majeurs","Avocat DÃˆS le début","Si parents injoignables : administrateur ad hoc"],
corrige:"Monsieur le Procureur, OPJ [NOM].\n\nViolences ITT > 8 jours MINEUR 15 ans — art. 222-11 + CJPM 2021.\n\nDEMANDES : GAV ou retenue ? Saisine JE ? ITT."},
{id:11,titre:"Outrage + rébellion + violences sur PDAP",emoji:"ðŸš¨",cadre:"Flagrance",qual:"Art. 433-5 + 433-6 + 222-13 CPn",tags:["Art. 433-5 CPn","PDAP"],
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

