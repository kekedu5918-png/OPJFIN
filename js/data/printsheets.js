const PRINTSHEETS=[
  {id:'ps1',title:'Classification tripartite & Tentative',emoji:'ðŸ“Š',sub:'Art. 111-1 CP Â· Art. 121-5 CP'},
  {id:'ps2',title:'GAV â€” Tous rÃ©gimes comparÃ©s',emoji:'ðŸ”’',sub:'Art. 63, 706-88, 706-88-1 CPP'},
  {id:'ps3',title:'Cadres d\'enquÃªte & Perquisitions',emoji:'ðŸ”',sub:'Art. 53, 75, 151, 56, 76 CPP'},
  {id:'ps4',title:'Infractions principales â€” MÃ©thode LAME',emoji:'âš–ï¸',sub:'Homicide Â· Vol Â· Viol Â· Stups Â· Escroquerie'},
  {id:'ps5',title:'Mandats, CJ, ARSE, DÃ©tention provisoire',emoji:'â›“ï¸',sub:'Art. 122-143 CPP'},
  {id:'pv1',title:'Canevas PV â€” Plainte & TÃ©moignage',emoji:'ðŸ“',sub:'Art. 53 et s. CPP Â· Art. 10-2 CPP'},
  {id:'pv2',title:'Canevas PV â€” Interpellation + GAV',emoji:'ðŸš”',sub:'Art. 63-1 Ã  63-4-3 CPP Â· Loi 22/04/2024'},
  {id:'pv3',title:'Canevas PV â€” Perquisition & Fouilles',emoji:'ðŸ”',sub:'Art. 56/76 CPP Â· SDIACSS'},
  {id:'art1',title:'Ligne du Temps â€” ALPHA (20 actes FD)',emoji:'â±ï¸',sub:'Vol Â· Flagrant DÃ©lit complet'},
  {id:'lame',title:'MÃ©thode LAME â€” Fiche MÃ©mo Infraction',emoji:'âš–ï¸',sub:'LÃ©gal Â· Actuel Â· Moral Â· Ã‰nrÃ´lement'},
  {id:'bloc1',title:'LibertÃ©s Publiques & Acteurs PJ',emoji:'ðŸ›ï¸',sub:'DDHC 1789 Â· Art. 40 CPP Â· Acteurs PJ'},
  {id:'bloc2',title:'Fichiers Police & RÃ©quisitions',emoji:'ðŸ—ƒï¸',sub:'TAJ Â· FNAEG Â· FAED Â· Art. 60/77-1 CPP'},
];
const PRINTCONTENT={
ps1:`<h1>ðŸ“Š Classification tripartite & Tentative</h1>
<h2>Tripartition des infractions (Art. 111-1 CP)</h2>
<table><tr><th>Nature</th><th>Peine</th><th>Juridiction</th><th>Prescription AP</th></tr>
<tr><td>CRIME</td><td>RÃ©clusion criminelle / PerpÃ©tuitÃ©</td><td>Cour d'Assises</td><td>20 ans</td></tr>
<tr><td>DÃ‰LIT</td><td>Emprisonnement + amende</td><td>Tribunal Correctionnel</td><td>6 ans</td></tr>
<tr><td>CONTRAVENTION</td><td>Amende â‰¤ 1 500 â‚¬</td><td>Tribunal de Police</td><td>1 an</td></tr></table>
<h2>Tentative (Art. 121-5 CP)</h2>
<p>Conditions : <strong>commencement d'exÃ©cution</strong> + <strong>dÃ©sistement involontaire</strong></p>
<p>Crime â†’ toujours punissable. DÃ©lit â†’ si texte exprÃ¨s. Contravention â†’ JAMAIS.</p>
<div class="piege-box">âš ï¸ PiÃ¨ge : La tentative de contravention N'EST PAS punissable. La tentative d'un dÃ©lit doit Ãªtre expressÃ©ment prÃ©vue par le texte.</div>
<h2>RÃ©cidive lÃ©gale (Art. 132-8 CP)</h2>
<table><tr><th>Type</th><th>DÃ©lai</th><th>Effet</th></tr>
<tr><td>Crime / Crime</td><td>PerpÃ©tuel</td><td>Doublement de la peine max</td></tr>
<tr><td>DÃ©lit / DÃ©lit assimilÃ©</td><td>5 ans</td><td>Doublement de la peine max</td></tr>
<tr><td>Contravention 5e classe</td><td>1 an</td><td>Alourdissement</td></tr></table>`,

ps2:`<h1>ðŸ”’ GAV â€” Tous rÃ©gimes</h1>
<table><tr><th>RÃ©gime</th><th>Initiale</th><th>Max total</th><th>Prolongation</th></tr>
<tr><td>Droit commun (art. 63)</td><td>24h</td><td>48h</td><td>PR â€” Ã©crit + motivÃ©</td></tr>
<tr><td>CriminalitÃ© organisÃ©e (706-88)</td><td>24h</td><td>96h</td><td>PR puis JLD (>48h)</td></tr>
<tr><td>Terrorisme (706-88-1)</td><td>24h</td><td>144h</td><td>PR puis JLD (>48h)</td></tr>
<tr><td>Mineur 13-16 ans</td><td>24h</td><td>48h max</td><td>PR (ou JLD si CO)</td></tr></table>
<h2>Droits notifiÃ©s IMMÃ‰DIATEMENT (Art. 63-1 CPP)</h2>
<p>Droit au silence Â· Avocat SANS dÃ©lai (loi 22/04/2024) Â· Examen mÃ©dical Â· Aviser un proche Â· InterprÃ¨te</p>
<div class="piege-box">âš ï¸ PiÃ¨ges : (1) Heure de GAV = heure d'APPRÃ‰HENSION, pas d'arrivÃ©e au commissariat. (2) DÃ©lai de carence avocat SUPPRIMÃ‰ depuis le 22/04/2024. (3) Avis PR = IMMÃ‰DIAT. (4) Mineur <16 ans : examen mÃ©dical OBLIGATOIRE ET IMMÃ‰DIAT.</div>`,

ps3:`<h1>ðŸ” Cadres d'enquÃªte & Perquisitions</h1>
<h2>Les 5 cadres d'enquÃªte</h2>
<table><tr><th>Cadre</th><th>Article</th><th>DurÃ©e</th><th>Pouvoirs</th></tr>
<tr><td>Flagrance</td><td>Art. 53 CPP</td><td>8j + 8j (JLD)</td><td>Contrainte immÃ©diate</td></tr>
<tr><td>PrÃ©liminaire</td><td>Art. 75 CPP</td><td>2 ans + 1 an</td><td>Consentement ou JLD</td></tr>
<tr><td>Commission rogatoire</td><td>Art. 151 CPP</td><td>LimitÃ©e par CR</td><td>Identiques Ã  flagrance</td></tr>
<tr><td>Art. 74 (mort suspecte)</td><td>Art. 74 CPP</td><td>â€”</td><td>Avant qualification pÃ©nale</td></tr>
<tr><td>Art. 74-1 (disparition)</td><td>Art. 74-1 CPP</td><td>â€”</td><td>3 critÃ¨res cumulatifs</td></tr></table>
<h2>RÃ¨gles de perquisition</h2>
<table><tr><th>Cadre</th><th>Accord requis</th><th>Horaires</th><th>ParticularitÃ©s</th></tr>
<tr><td>Flagrance</td><td>NON</td><td>24h/24</td><td>Art. 56 CPP</td></tr>
<tr><td>PrÃ©liminaire</td><td>OUI (Ã©crit) ou JLD</td><td>6hâ€“21h</td><td>Art. 76 CPP</td></tr>
<tr><td>CR</td><td>NON</td><td>24h/24</td><td>Art. 94-96 CPP</td></tr></table>
<p><strong>Lieux protÃ©gÃ©s :</strong> Avocat â†’ bÃ¢tonnier OBLIGATOIRE | MÃ©decin â†’ prÃ©sident ordre | Presse â†’ magistrat</p>`,

ps4:`<h1>âš–ï¸ Infractions principales â€” MÃ©thode LAME</h1>
<table><tr><th>Infraction</th><th>Article</th><th>Qual.</th><th>Peine de base</th><th>Ã‰lÃ©ment moral</th></tr>
<tr><td>MEURTRE</td><td>221-1 CP</td><td>Crime</td><td>30 ans RC</td><td>Intention de tuer (animus necandi)</td></tr>
<tr><td>ASSASSINAT</td><td>221-3 CP</td><td>Crime</td><td>PerpÃ©tuitÃ©</td><td>PrÃ©mÃ©ditation + intention de tuer</td></tr>
<tr><td>VIOL</td><td>222-23 CP</td><td>Crime</td><td>15 ans RC</td><td>Intentionnel, sans consentement</td></tr>
<tr><td>VOL SIMPLE</td><td>311-1 CP</td><td>DÃ©lit</td><td>3 ans / 45kâ‚¬</td><td>Intention de se comporter en propriÃ©taire</td></tr>
<tr><td>VOL BANDE ORG.</td><td>311-9 CP</td><td>Crime</td><td>15 ans RC</td><td>Intentionnel + organisation</td></tr>
<tr><td>ESCROQUERIE</td><td>313-1 CP</td><td>DÃ©lit</td><td>5 ans / 375kâ‚¬</td><td>Tromperie â†’ remise</td></tr>
<tr><td>ABUS DE CONFIANCE</td><td>314-1 CP</td><td>DÃ©lit</td><td>3 ans / 375kâ‚¬</td><td>Remise prÃ©alable licite + dÃ©tournement</td></tr>
<tr><td>RECEL</td><td>321-1 CP</td><td>DÃ©lit</td><td>5 ans / 375kâ‚¬</td><td>Connaissance origine frauduleuse</td></tr>
<tr><td>USAGE STUPS</td><td>L3421-1 CSP</td><td>DÃ©lit</td><td>1 an / 3 750â‚¬</td><td>Intentionnel</td></tr>
<tr><td>BLANCHIMENT</td><td>324-1 CP</td><td>DÃ©lit</td><td>5 ans / 375kâ‚¬</td><td>Connaissance origine criminelle</td></tr></table>`,

ps5:`<h1>â›“ï¸ Mandats, CJ, ARSE, DÃ©tention Provisoire</h1>
<h2>Les 4 mandats + mandat de recherche</h2>
<table><tr><th>Mandat</th><th>Article</th><th>Auteur</th><th>Effet</th></tr>
<tr><td>Comparution</td><td>122 al.1 CPP</td><td>JI</td><td>Se prÃ©senter volontairement</td></tr>
<tr><td>Amener</td><td>122 al.2 CPP</td><td>JI</td><td>Conduire de force â€” pas d'incarcÃ©ration</td></tr>
<tr><td>DÃ©pÃ´t</td><td>122 al.3 CPP</td><td>JI</td><td>IncarcÃ©ration immÃ©diate</td></tr>
<tr><td>ArrÃªt</td><td>131 CPP</td><td>JI</td><td>Fugitifs/Ã©tranger â€” arrestation + prison</td></tr>
<tr><td>Recherche</td><td>122-4 CPP</td><td>PR</td><td>Interpellation â€” dÃ©lits â‰¥3 ans â€” 1 an renouv.</td></tr></table>
<h2>Tableau comparatif CJ / ARSE / DP</h2>
<table><tr><th>Mesure</th><th>Article</th><th>Seuil peine</th><th>DÃ©cideur</th><th>DurÃ©e</th></tr>
<tr><td>ContrÃ´le Judiciaire</td><td>138 CPP</td><td>Tout emprisonnement</td><td>JLD</td><td>Sans limite lÃ©gale</td></tr>
<tr><td>ARSE</td><td>142-5 CPP</td><td>â‰¥ 2 ans</td><td>JLD</td><td>MÃªme rÃ©gime DP</td></tr>
<tr><td>DÃ©tention Provisoire</td><td>143-1 CPP</td><td>â‰¥ 3 ans</td><td>JLD</td><td>4 mois â†’ 2 ans max (correctionnel)</td></tr></table>
<div class="piege-box">âš ï¸ PiÃ¨ge fondamental : Le JI seul NE PEUT JAMAIS dÃ©cider la DP. C'est TOUJOURS le JLD, saisi par ordonnance du JI avec rÃ©quisitions du PR.</div>`,
pv1:`<h1>ðŸ“ Canevas PV â€” Plainte &amp; TÃ©moignage</h1>
<h2>SAISINE â€” PLAINTE (Art. 53 et s. CPP Â· Art. 10-2 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">Structure du cartouche plainte</div>
<table>
<tr><th>Rubrique</th><th>Contenu obligatoire</th></tr>
<tr><td><strong>En-tÃªte</strong></td><td>Ã‰tant au service â€” date, heure, lieu de rÃ©daction</td></tr>
<tr><td><strong>Saisine</strong></td><td>Constatons que se prÃ©sente NOM PrÃ©nom victime du fait de [infraction]</td></tr>
<tr><td><strong>Cadre juridique</strong></td><td>Agissant en flagrant dÃ©lit â€” Vu les articles 53 et s. CPP</td></tr>
<tr><td><strong>Droits Art. 10-2</strong></td><td>Information des droits de la victime â€” Formulaire remis</td></tr>
<tr><td><strong>IdentitÃ© victime</strong></td><td>NOM, prÃ©nom, DOB, lieu naissance, adresse, nationalitÃ©, profession</td></tr>
<tr><td><strong>DÃ©claration des faits</strong></td><td>Description prÃ©cise, prÃ©judice, capacitÃ© Ã  reconnaÃ®tre l'auteur</td></tr>
<tr><td><strong>Avis Parquet</strong></td><td>Avisons immÃ©diatement M. le Procureur de la RÃ©publique (Art. 40 CPP)</td></tr>
<tr><td><strong>ClÃ´ture</strong></td><td>Plainte contre X ou personne dÃ©nommÃ©e â€” RÃ©cÃ©pissÃ© remis de droit</td></tr>
<tr><td><strong>Signature</strong></td><td>AprÃ¨s lecture, NOM PrÃ©nom signe avec nous le prÃ©sent PV</td></tr>
</table></div>
<h2>SAISINE â€” TÃ‰MOIGNAGE (Art. 53 et s. CPP)</h2>
<table>
<tr><th>Ã‰lÃ©ment</th><th>Formule type</th></tr>
<tr><td>Saisine</td><td>Sommes requis par [identitÃ©] qui dÃ©clare avoir Ã©tÃ© tÃ©moin de [fait]</td></tr>
<tr><td>Cadre</td><td>Agissant en flagrant dÃ©lit â€” Vu les articles 53 et s. CPP</td></tr>
<tr><td>IdentitÃ©</td><td>L'invitons Ã  nous dÃ©cliner son identitÃ© : NOM PrÃ©nom, DOB, adresse</td></tr>
<tr><td>Q/R</td><td>QUESTION : â€¦ / RÃ‰PONSE : â€¦ (autant que nÃ©cessaire)</td></tr>
<tr><td>Signature</td><td>AprÃ¨s lecture, signe avec nous le prÃ©sent PV</td></tr>
</table>
<h2>SAISINE â€” TRANSPORT / CONSTATATIONS</h2>
<table>
<tr><th>Ã‰tape</th><th>Formule type</th></tr>
<tr><td>DÃ©part</td><td>Ã‰tant au service â€” Sommes requis par [mode saisine] du fait de [infraction]</td></tr>
<tr><td>SDPTS</td><td>Sollicitons le SDPTS aux fins de relevÃ© de traces ou indices</td></tr>
<tr><td>Transport</td><td>AssistÃ© des GP â€¦ nous transportons Ã  [adresse] â€” OÃ¹ Ã©tant Ã  [heure]</td></tr>
<tr><td>Constatations</td><td><strong>En prÃ©sence constante et effective du SDPTS</strong> â€” constatons extÃ©rieur, progression, Ã©lÃ©ments</td></tr>
<tr><td>RÃ©sultat PTS</td><td>Le SDPTS indique n'avoir relevÃ© aucune trace / ou description des traces</td></tr>
<tr><td>ClÃ´ture</td><td>Dont PV que nos assistants signent avec nous</td></tr>
</table>
<div class="ok"><strong>âœ“ Avis Parquet obligatoire :</strong> Art. 40 CPP â€” dÃ¨s la constatation d'un crime ou dÃ©lit. Le rÃ©cÃ©pissÃ© est de droit Ã  la demande de la victime (Art. 10-2 CPP).</div>
<div class="piege"><strong>âš ï¸ PiÃ¨ges :</strong> Toujours mentionner la <u>prÃ©sence constante et effective</u> du SDPTS. L'heure de GAV = heure d'apprÃ©hension, jamais l'heure d'arrivÃ©e au service.</div>`,
pv2:`<h1>ðŸš” Canevas PV â€” Interpellation &amp; Garde Ã  Vue</h1>
<h2>INTERPELLATION (Art. 53 et s. CPP Â· Art. 803 CPP)</h2>
<table>
<tr><th>Ã‰tape</th><th>Formule obligatoire</th><th>Article</th></tr>
<tr><td>Constat</td><td>Constatons [fait + signalement] â€” Agissant en flagrant dÃ©lit</td><td>Art. 53 CPP</td></tr>
<tr><td>Interpellation</td><td>Interpellons l'individu Ã  [heure] au [lieu]</td><td>Art. 53 CPP</td></tr>
<tr><td>Menottage</td><td>ConformÃ©ment Ã  l'Art. 803 CPP â€” Menottons car [justification : fuite/danger/rÃ©sistance]</td><td>Art. 803 CPP</td></tr>
<tr><td>Palpation</td><td>PalpÃ© par mesure de sÃ©curitÃ© par le GP : positif [objet] / nÃ©gatif</td><td>Mesure sÃ©curitÃ©</td></tr>
<tr><td>IdentitÃ©</td><td>L'invitons Ã  nous dÃ©cliner son identitÃ© : il nous dÃ©clare se nommerâ€¦</td><td>â€”</td></tr>
<tr><td>Notification verbale GAV</td><td>L'informons qu'il est placÃ© en GAV Ã  compter de [heure] d'interpellation pour [qualification]</td><td>Art. 63-1 CPP</td></tr>
<tr><td>Droits verbaux</td><td>L'informons immÃ©diatement de ses droits Art. 63-1 Ã  63-4-3 â€” PV sÃ©parÃ© Ã  suivre</td><td>Art. 63-1 Ã  63-4-3</td></tr>
</table>
<h2>NOTIFICATION PLACEMENT EN GAV â€” MAJEUR (Art. 63-1 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">Ã‰lÃ©ments obligatoires du cartouche GAV</div>
<ul>
<li><strong>Ã€ compter du</strong> [date] Ã  [heure] de l'interpellation</li>
<li><strong>Pour les faits</strong> de [qualification] commis le [date] Ã  [ville]</li>
<li><strong>Motif du [1Â° Ã  6Â°] de l'Art. 62-2 CPP</strong> â€” la GAV est l'unique moyen deâ€¦</li>
<li><strong>DurÃ©e maximale :</strong> 24H + 24H possible sur accord du Parquet</li>
<li>Notification droits : silence, interprÃ¨te, avis proche/avocat/autoritÃ©s consulaires, mÃ©decin, piÃ¨ces, observations</li>
<li>Remise du <strong>formulaire de dÃ©claration des droits</strong></li>
</ul></div>
<h2>LES 6 OBJECTIFS DE LA GAV (Art. 62-2 CPP)</h2>
<table>
<tr><th>NÂ°</th><th>Objectif â€” La GAV doit Ãªtre l'UNIQUE moyen deâ€¦</th></tr>
<tr><td>1Â°</td><td>Permettre les investigations impliquant la prÃ©sence/participation de la personne</td></tr>
<tr><td>2Â°</td><td>Garantir la prÃ©sentation devant le Procureur de la RÃ©publique</td></tr>
<tr><td>3Â°</td><td>EmpÃªcher la modification des preuves ou indices matÃ©riels</td></tr>
<tr><td>4Â°</td><td>EmpÃªcher les pressions sur tÃ©moins, victimes, proches</td></tr>
<tr><td>5Â°</td><td>EmpÃªcher la concertation avec coauteurs ou complices</td></tr>
<tr><td>6Â°</td><td>Garantir la mise en Å“uvre des mesures pour faire cesser le crime/dÃ©lit</td></tr>
</table>
<h2>DROITS EN GAV (Art. 63-1 Ã  63-4-3 CPP)</h2>
<table>
<tr><th>Droit</th><th>Article</th><th>DÃ©lai / Note</th></tr>
<tr><td>Droit au silence</td><td>Art. 63-1</td><td>ImmÃ©diat â€” pas d'obligation de rÃ©pondre</td></tr>
<tr><td>InterprÃ¨te gratuit</td><td>Art. 63-1</td><td>ImmÃ©diat si ne comprend pas le franÃ§ais</td></tr>
<tr><td>Avis proche/employeur</td><td>Art. 63-2</td><td>DÃ¨s la 1Ã¨re heure â€” sans dÃ©lai</td></tr>
<tr><td>Avocat + entretien 30 min</td><td>Art. 63-3-1</td><td><strong>Sans dÃ©lai de carence â€” Loi 22/04/2024</strong></td></tr>
<tr><td>MÃ©decin</td><td>Art. 63-3</td><td>Ã€ tout moment</td></tr>
<tr><td>Consulter piÃ¨ces</td><td>Art. 63-4-1</td><td>Ã€ tout moment</td></tr>
<tr><td>PrÃ©senter observations</td><td>Art. 63-4-2</td><td>Au magistrat</td></tr>
</table>
<h2>DURÃ‰ES DE GAV</h2>
<table>
<tr><th>Profil</th><th>Initiale</th><th>Prolongation</th><th>CDO (Art. 706-88)</th></tr>
<tr><td>Majeur droit commun</td><td>24H</td><td>+24H (accord Parquet)</td><td>+48H +48H</td></tr>
<tr><td>Mineur 13-16 ans</td><td>24H</td><td>+24H sÃ©parÃ© majeurs</td><td>RÃ©gime CJPM</td></tr>
<tr><td>Mineur 16-18 ans</td><td>24H</td><td>+24H sÃ©parÃ© majeurs</td><td>RÃ©gime CJPM</td></tr>
<tr><td>Retenue 10-13 ans</td><td>12H</td><td>â€”</td><td>Infraction â‰¥ 5 ans emp.</td></tr>
</table>
<div class="warn"><strong>âš¡ Loi 22 avril 2024 :</strong> DÃ©lai de carence avocat <strong>supprimÃ©</strong>. L'avocat intervient dÃ¨s le dÃ©but de la GAV.</div>
<div class="piege"><strong>âš ï¸ PiÃ¨ges :</strong> (1) Seul l'OPJ peut placer en GAV. (2) La GAV doit Ãªtre l'<u>unique</u> moyen. (3) Heure GAV = heure interpellation, pas d'arrivÃ©e au service.</div>`,
pv3:`<h1>ðŸ” Canevas PV â€” Perquisition &amp; Fouilles</h1>
<h2>PERQUISITION â€” FLAGRANT DÃ‰LIT (Art. 56 CPP)</h2>
<table>
<tr><th>Ã‰tape</th><th>Formule type</th></tr>
<tr><td>Transport</td><td>Muni des clÃ©s extraites de sa fouille â€” En compagnie du nommÃ©, nous transportons Ã  [adresse]</td></tr>
<tr><td>Constat extÃ©rieur</td><td>Constatons qu'il s'agit de [description extÃ©rieure des lieux]</td></tr>
<tr><td>EntrÃ©e</td><td>Ã€ [heure], Ã  l'aide des clÃ©s, pÃ©nÃ©trons dans les lieux</td></tr>
<tr><td>Perquisition</td><td><strong>En la prÃ©sence constante et effective</strong> du nommÃ© â€” procÃ©dons Ã  minutieuse perquisition â€” Description des piÃ¨ces</td></tr>
<tr><td>DÃ©couverte</td><td>Dans [localisation], sous/sur [meuble], dÃ©couvrons [Ã©lÃ©ment] â€” Description prÃ©cise</td></tr>
<tr><td>Interrogation</td><td>InterpellÃ© sur l'origine, le nommÃ© nous dÃ©clare :</td></tr>
<tr><td>Saisie</td><td>Saisissons et plaÃ§ons sous <strong>scellÃ© nÂ° UN</strong> : [description complÃ¨te]</td></tr>
<tr><td>Fin</td><td>Perquisition terminÃ©e Ã  [heure] sans incident â€” aucun autre Ã©lÃ©ment</td></tr>
<tr><td>ClÃ´ture</td><td>Refermons les lieux â€” ClÃ©s replaÃ§ons dans les effets du nommÃ©</td></tr>
<tr><td>Signature</td><td>AprÃ¨s lecture, le nommÃ© signe avec nous et nos assistants ainsi que la fiche de scellÃ©</td></tr>
</table>
<div class="warn"><strong>âš ï¸ Heures lÃ©gales :</strong> 6H â€“ 21H en tout lieu. Sauf crime ou FD chez la personne interpellÃ©e = 24H/24.</div>
<h2>PERQUISITION â€” ENQUÃŠTE PRÃ‰LIMINAIRE (Art. 76 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">DiffÃ©rence clÃ© avec FD</div>
<ul>
<li>NÃ©cessite l'<strong>assentiment exprÃ¨s et manuscrit</strong> de la personne</li>
<li>En cas de refus ET peine â‰¥ 3 ans : requÃªte Parquet â†’ autorisation JLD (Ã©crite et motivÃ©e)</li>
<li>MÃªmes heures lÃ©gales : 6H â€“ 21H</li>
</ul></div>
<h2>FOUILLE INTÃ‰GRALE (Art. 53 et s. CPP)</h2>
<table>
<tr><th>Ã‰tape</th><th>Formule</th></tr>
<tr><td>NÃ©cessitÃ©</td><td>Susceptible de dÃ©tenir [Ã©lÃ©ment] non dÃ©tectable par palpation</td></tr>
<tr><td>ExÃ©cution</td><td>ProcÃ©dons Ã  fouille intÃ©grale sur la personne de NOM PrÃ©nom</td></tr>
<tr><td>DÃ©couverte</td><td>Dans [endroit], dÃ©couvrons [Ã©lÃ©ment] â€” description prÃ©cise</td></tr>
<tr><td>Saisie</td><td>Saisissons et plaÃ§ons sous scellÃ© nÂ° [numÃ©ro]</td></tr>
<tr><td>Fin</td><td>Fouille terminÃ©e, ne nous permet de dÃ©couvrir aucun autre Ã©lÃ©ment</td></tr>
</table>
<h2>FOUILLE VÃ‰HICULE (Art. 53 et s. CPP)</h2>
<table>
<tr><th>Ã‰tape</th><th>Formule</th></tr>
<tr><td>Constat</td><td>Constatons prÃ©sence du vÃ©hicule [marque, modÃ¨le, immat.], stationnÃ©</td></tr>
<tr><td>Ouverture</td><td>Ã€ l'aide des clÃ©s : portiÃ¨res, capot, coffre</td></tr>
<tr><td>Fouille</td><td><strong>En prÃ©sence constante et effective</strong> du nommÃ© â€” minutieuse fouille</td></tr>
<tr><td>Saisie</td><td>Saisissons et plaÃ§ons sous scellÃ© nÂ° [numÃ©ro]</td></tr>
<tr><td>ClÃ´ture</td><td>Refermons le vÃ©hicule â€” clÃ©s replacÃ©es dans effets du nommÃ©</td></tr>
</table>
<h2>MÃ‰THODE SDIACSS â€” Saisie Incidente</h2>
<table>
<tr><th>Lettre</th><th>Action</th></tr>
<tr><td><strong>S</strong> â€” Situation</td><td>Contexte de la dÃ©couverte incidente</td></tr>
<tr><td><strong>D</strong> â€” Description</td><td>Description prÃ©cise de l'objet saisi</td></tr>
<tr><td><strong>I</strong> â€” Interpellation</td><td>Question Ã  l'intÃ©ressÃ© sur l'origine</td></tr>
<tr><td><strong>A</strong> â€” Avis Parquet</td><td>Avis immÃ©diat obligatoire</td></tr>
<tr><td><strong>C</strong> â€” Cadre juridique</td><td>FD ou procÃ©dure incidente</td></tr>
<tr><td><strong>S</strong> â€” Saisie</td><td>Saisie formalisÃ©e dans le PV</td></tr>
<tr><td><strong>S</strong> â€” ScellÃ©</td><td>Constitution du scellÃ© numÃ©rotÃ©</td></tr>
</table>
<div class="piege"><strong>âš ï¸ Saisie incidente :</strong> Objet rattachÃ© infraction en FD = avis Parquet immÃ©diat + ouverture nouvelle procÃ©dure + extension GAV aux nouveaux faits.</div>`,
art1:`<h1>â±ï¸ Ligne du Temps â€” EnquÃªte ALPHA (Flagrant DÃ©lit)</h1>
<p><em>ScÃ©nario type : Vol dans local d'habitation â€” 10h30 â€” Flagrant DÃ©lit complet</em></p>
<h2>Chronologie des 20 actes</h2>
<div class="timeline-item"><div class="tl-num">01</div><div class="tl-time">10h30</div><div class="tl-title"><strong>SAISINE â€” PLAINTE C/X</strong><br><small>Victime â€” Art. 10-2 CPP â€” Droits â€” Avis Parquet + hiÃ©rarchie</small></div></div>
<div class="timeline-item"><div class="tl-num">02</div><div class="tl-time">11h00</div><div class="tl-title"><strong>PRÃ‰SENTATION PHOTOS TAJ Ã  victime</strong><br><small>Fichier TAJ â€” PrÃ©sentation formalisÃ©e</small></div></div>
<div class="timeline-item"><div class="tl-num">03</div><div class="tl-time">11h10</div><div class="tl-title"><strong>IDENTIFICATION suspect</strong><br><small>Suite prÃ©sentation TAJ</small></div></div>
<div class="timeline-item"><div class="tl-num">04</div><div class="tl-time">11h20</div><div class="tl-title"><strong>RECHERCHES FICHIERS</strong><br><small>TAJ, FPR, FNAEG, FAED, SNPC, FOVESâ€¦</small></div></div>
<div class="timeline-item"><div class="tl-num">05</div><div class="tl-time">11h40</div><div class="tl-title"><strong>VÃ‰RIFICATION DE DOMICILE (VD)</strong><br><small>VÃ©rification prÃ©alable adresse suspect</small></div></div>
<div class="timeline-item"><div class="tl-num">06</div><div class="tl-time">12h00</div><div class="tl-title"><strong>TRANSPORT / CONSTATATIONS</strong><br><small>SDPTS + VidÃ©oprotection + Album photo</small></div></div>
<div class="timeline-item"><div class="tl-num">07</div><div class="tl-time">12h20</div><div class="tl-title"><strong>ENQUÃŠTE DE VOISINAGE (EV)</strong><br><small>Gardiens X et Y â€” RÃ©sultat</small></div></div>
<div class="timeline-item"><div class="tl-num" style="background:var(--err)">08</div><div class="tl-time">13h15</div><div class="tl-title"><strong>TRANSPORT / INTERPELLATION â† DÃ‰BUT GAV</strong><br><small>Menottage Art. 803 â€” Palpation â€” Notification verbale GAV</small></div></div>
<div class="timeline-item"><div class="tl-num">09</div><div class="tl-time">13h20</div><div class="tl-title"><strong>NOTIFICATION PLACEMENT EN GAV (PV sÃ©parÃ©)</strong><br><small>6 objectifs Art. 62-2 â€” Droits Art. 63-1 Ã  63-4-3 â€” Formulaire remis</small></div></div>
<div class="timeline-item"><div class="tl-num">10</div><div class="tl-time">13h30</div><div class="tl-title"><strong>AVIS PARQUET</strong><br><small>Obligatoire dÃ¨s placement en GAV</small></div></div>
<div class="timeline-item"><div class="tl-num">11</div><div class="tl-time">13h35</div><div class="tl-title"><strong>FOUILLE INTÃ‰GRALE</strong><br><small>NÃ©cessitÃ© justifiÃ©e â€” RÃ©sultat + scellÃ© ou nÃ©gatif</small></div></div>
<div class="timeline-item"><div class="tl-num">12</div><div class="tl-time">14h00</div><div class="tl-title"><strong>PERQUISITION domicile suspect</strong><br><small>PrÃ©sence constante du MEC â€” Saisie + scellÃ© nÂ° DEUX</small></div></div>
<div class="timeline-item"><div class="tl-num">13</div><div class="tl-time">15h30</div><div class="tl-title"><strong>ENTRETIEN AVOCAT</strong><br><small>30 min â€” Sans dÃ©lai de carence (Loi 22/04/2024)</small></div></div>
<div class="timeline-item"><div class="tl-num">14</div><div class="tl-time">16h00</div><div class="tl-title"><strong>CONSTITUTION DE GROUPE</strong><br><small>Pour prÃ©sentation aux tÃ©moins/victimes</small></div></div>
<div class="timeline-item"><div class="tl-num">15</div><div class="tl-time">16h30</div><div class="tl-title"><strong>PRÃ‰SENTATION DE GROUPE</strong><br><small>En prÃ©sence de l'avocat</small></div></div>
<div class="timeline-item"><div class="tl-num">16</div><div class="tl-time">17h00</div><div class="tl-title"><strong>PLAINTE C/ MEC dÃ©nommÃ©</strong><br><small>Plainte victime contre suspect identifiÃ©</small></div></div>
<div class="timeline-item"><div class="tl-num">17</div><div class="tl-time">17h30</div><div class="tl-title"><strong>AUDITION MEC (gardÃ© Ã  vue)</strong><br><small>En prÃ©sence avocat â€” Droits rappelÃ©s</small></div></div>
<div class="timeline-item"><div class="tl-num">18</div><div class="tl-time">18h30</div><div class="tl-title"><strong>COMPTE-RENDU PARQUET</strong><br><small>Instructions substitut â€” COPJ / DÃ©fÃ¨rement / Classement</small></div></div>
<div class="timeline-item"><div class="tl-num">19</div><div class="tl-time">18h45</div><div class="tl-title"><strong>SIGNALISATION GÃ‰NÃ‰TIQUE</strong><br><small>Art. 706-55 CPP â€” PrÃ©lÃ¨vement buccal â€” FNAEG</small></div></div>
<div class="timeline-item"><div class="tl-num" style="background:var(--ok)">20</div><div class="tl-time">19h00</div><div class="tl-title"><strong>NOTIFICATION FIN GAV ET SUITES</strong><br><small>Droits rappelÃ©s â€” COPJ ou dÃ©fÃ¨rement â€” Signature</small></div></div>
<div class="ok"><strong>âœ“ RÃ¨gle d'or :</strong> Chaque acte = un PV distinct avec cartouche. Les heures doivent Ãªtre chronologiques et cohÃ©rentes. GAV = acte 08 (interpellation), jamais l'arrivÃ©e au service.</div>
<div class="piege"><strong>âš ï¸ PiÃ¨ges ALPHA :</strong> (1) Heure GAV dÃ©bute Ã  l'interpellation. (2) Avocat sans dÃ©lai depuis loi 22/04/2024. (3) Plainte dÃ©nommÃ© uniquement aprÃ¨s identification formelle. (4) Signalisation gÃ©nÃ©tique = Art. 706-55 CPP.</div>`,
lame:`<h1>âš–ï¸ MÃ©thode LAME â€” Fiche MÃ©mo Infraction</h1>
<p>La mÃ©thode <strong>LAME</strong> structure l'analyse de toute infraction en 4 Ã©lÃ©ments constitutifs obligatoires.</p>
<h2>L â€” Ã‰lÃ©ment LÃ©gal</h2>
<table>
<tr><th>Composante</th><th>Contenu</th></tr>
<tr><td>Article de dÃ©finition</td><td>Article XX CP/CPP qui prÃ©voit et dÃ©finit l'infraction</td></tr>
<tr><td>Article de rÃ©pression</td><td>Article XX qui fixe la peine (emprisonnement + amende)</td></tr>
<tr><td>Circonstances aggravantes</td><td>Articles des aggravations (effraction, rÃ©cidive, bande organisÃ©eâ€¦)</td></tr>
<tr><td>Classification (Art. 111-1 CP)</td><td>Crime / DÃ©lit / Contravention</td></tr>
</table>
<h2>A â€” Ã‰lÃ©ment Actuel / MatÃ©riel</h2>
<table>
<tr><th>Aspect</th><th>Contenu</th></tr>
<tr><td>Faits constatÃ©s</td><td>Tous Ã©lÃ©ments objectifs prouvant la matÃ©rialitÃ© de l'infraction</td></tr>
<tr><td>Nature des actes</td><td>Unique ou pluralitÃ© â€” InstantanÃ© ou continu dans le temps</td></tr>
<tr><td>Commission ou omission</td><td>Action active ou inaction contraire Ã  l'ordre social</td></tr>
<tr><td>Preuves matÃ©rielles</td><td>ScellÃ©s, tÃ©moignages, constatations, rapports PTS</td></tr>
</table>
<h2>M â€” Ã‰lÃ©ment Moral (CulpabilitÃ©)</h2>
<table>
<tr><th>Type de faute</th><th>DÃ©finition</th><th>Exemples</th></tr>
<tr><td><strong>Dol gÃ©nÃ©ral</strong></td><td>Conscience + volontÃ© d'accomplir l'acte</td><td>Vol, meurtre, coups</td></tr>
<tr><td><strong>Intentionnelle</strong></td><td>VolontÃ© dirigÃ©e vers le rÃ©sultat prÃ©cis</td><td>Homicide volontaire</td></tr>
<tr><td><strong>Non-intentionnelle</strong></td><td>Imprudence, nÃ©gligence, maladresse</td><td>Homicide par imprudence</td></tr>
<tr><td><strong>Mise en danger dÃ©libÃ©rÃ©e</strong></td><td>Violation manifestement dÃ©libÃ©rÃ©e obligation sÃ©curitÃ©</td><td>Art. 223-1 CP</td></tr>
<tr><td><strong>Contraventionnelle</strong></td><td>Simple matÃ©rialitÃ©, sans intention requise</td><td>Infractions routiÃ¨res</td></tr>
</table>
<p style="font-size:11px;font-style:italic">Formule type dÃ©montrant la conscience : Â« L'intÃ©ressÃ©, en Ã©tat de conscience pleine et entiÃ¨re, a volontairementâ€¦ Â»</p>
<h2>E â€” Ã‰nrÃ´lement / ResponsabilitÃ© PÃ©nale</h2>
<table>
<tr><th>Situation</th><th>Formule</th></tr>
<tr><td>ResponsabilitÃ© pleine</td><td>NOM PrÃ©nom engage sa responsabilitÃ© pÃ©nale pleine et entiÃ¨re</td></tr>
<tr><td>IrresponsabilitÃ©</td><td>Ne peut donner lieu Ã  poursuites â€” motif : trouble mental, contrainte, minoritÃ©</td></tr>
<tr><td>Tentative (Art. 121-5)</td><td>Commencement exÃ©cution + absence dÃ©sistement volontaire</td></tr>
<tr><td>ComplicitÃ© (Art. 121-7)</td><td>Fait principal punissable + participation + intention de participer</td></tr>
<tr><td>ImmunitÃ© familiale</td><td>Au prÃ©judice ascendant/descendant/conjoint (hors documents indispensables)</td></tr>
</table>
<h2>Tripartition des Infractions (Art. 111-1 CP)</h2>
<table>
<tr><th>Nature</th><th>Peine max</th><th>Juridiction</th><th>Prescription AP</th><th>Prescription peine</th></tr>
<tr><td><strong>CRIME</strong></td><td>RÃ©clusion / PerpÃ©tuitÃ©</td><td>Cour d'Assises</td><td>20 ans</td><td>20 ans</td></tr>
<tr><td><strong>DÃ‰LIT</strong></td><td>Emprisonnement + amende</td><td>Tribunal Correctionnel</td><td>6 ans</td><td>6 ans</td></tr>
<tr><td><strong>CONTRAVENTION</strong></td><td>Amende (R, C1 Ã  C5)</td><td>Tribunal de Police</td><td>1 an</td><td>3 ans</td></tr>
</table>
<div class="piege"><strong>âš ï¸ La classification dÃ©termine :</strong> RÃ©gime de GAV Â· DurÃ©e de prescription Â· Juridiction compÃ©tente Â· Quantum de peine. Une erreur de qualification peut faire tomber toute la procÃ©dure.</div>`,
bloc1:`<h1>ðŸ›ï¸ LibertÃ©s Publiques &amp; Acteurs de la PJ</h1>
<h2>LibertÃ©s Fondamentales</h2>
<table>
<tr><th>LibertÃ©</th><th>DÃ©finition</th><th>Base juridique</th></tr>
<tr><td><strong>La SÃ»retÃ©</strong></td><td>Droit de n'Ãªtre ni arrÃªtÃ© ni dÃ©tenu arbitrairement</td><td>DDHC 1789</td></tr>
<tr><td><strong>Aller et venir</strong></td><td>Droit de se dÃ©placer librement, pas d'arrestation hors cadre lÃ©gal</td><td>PrÃ©ambule Const. 1958</td></tr>
</table>
<h2>Mesures de Privation de LibertÃ©</h2>
<table>
<tr><th>Mesure</th><th>Article</th><th>DurÃ©e max</th><th>Notes</th></tr>
<tr><td>Garde Ã  vue</td><td>Art. 62-2 CPP</td><td>24H + 24H (CDO +48H+48H)</td><td>Seul l'OPJ peut placer</td></tr>
<tr><td>ContrÃ´le d'identitÃ©</td><td>Art. 78-2 CPP</td><td>Temps nÃ©cessaire</td><td>OPJ, APJ, APJA</td></tr>
<tr><td>VÃ©rification d'identitÃ©</td><td>Art. 78-3 CPP</td><td>4H maximum</td><td>Sur dÃ©cision OPJ</td></tr>
<tr><td>RelevÃ© d'identitÃ©</td><td>Art. 78-6 CPP</td><td>â€”</td><td>Contravention seulement</td></tr>
</table>
<h2>VÃ©rification d'IdentitÃ© â€” ProcÃ©dure (Art. 78-3 CPP)</h2>
<div class="cartouche"><div class="cartouche-title">ProcÃ©dure stricte</div>
<ul>
<li>Recherche <strong>coercitive</strong> sur dÃ©cision de l'OPJ</li>
<li><strong>4H maximum</strong> â€” strictement nÃ©cessaire Ã  dÃ©couvrir l'identitÃ© vÃ©ritable</li>
<li>Causes : contrÃ´le d'identitÃ©, relevÃ© d'identitÃ©, recueil d'identitÃ© â†’ la personne refuse ou ne peut justifier</li>
<li>Avis Ã  toute personne de son choix + avis au Procureur de la RÃ©publique</li>
<li>Fin : destruction empreintes FAED dans les 6 mois</li>
</ul></div>
<h2>Les Acteurs de la Police Judiciaire (Art. 15 Ã  21 CPP)</h2>
<table>
<tr><th>Acteur</th><th>RÃ´le principal</th></tr>
<tr><td>Procureur de la RÃ©publique</td><td>Dirige et contrÃ´le l'enquÃªte de police judiciaire â€” DÃ©cide des poursuites</td></tr>
<tr><td>OPJ</td><td>Direction effective des enquÃªtes â€” GAV â€” Perquisitions â€” Chef d'enquÃªte</td></tr>
<tr><td>APJ</td><td>Sous direction OPJ â€” Constatations, auditions dÃ©lÃ©guÃ©es</td></tr>
<tr><td>APJA</td><td>Actes trÃ¨s limitÃ©s â€” recueil identitÃ©, constatations simples</td></tr>
<tr><td>Juge d'Instruction</td><td>Instruction judiciaire â€” Mandats â€” Commission rogatoire</td></tr>
<tr><td>Maires et adjoints</td><td>OPJ de droit dans certaines matiÃ¨res</td></tr>
</table>
<h2>ContrÃ´le de la PJ</h2>
<table>
<tr><th>Instance</th><th>Type de contrÃ´le</th></tr>
<tr><td>PG prÃ¨s la Cour d'Appel</td><td>ContrÃ´le hiÃ©rarchique des OPJ du ressort</td></tr>
<tr><td>Inspection GÃ©nÃ©rale de la Justice</td><td>ContrÃ´le disciplinaire</td></tr>
<tr><td>Chambre de l'instruction</td><td>ContrÃ´le juridictionnel des actes d'enquÃªte (nullitÃ©s)</td></tr>
</table>
<h2>Suites Possibles Ã  l'EnquÃªte</h2>
<table>
<tr><th>DÃ©cision du PR</th><th>Mode</th></tr>
<tr><td>Engagement des poursuites</td><td>COPJ, CPPV, CRPC, CI (Comparution ImmÃ©diate)</td></tr>
<tr><td>Alternative aux poursuites</td><td>Rappel Ã  la loi, mÃ©diation, stage, rÃ©paration, composition pÃ©nale</td></tr>
<tr><td>Classement sans suite</td><td>Infraction non constituÃ©e ou inopportunitÃ© â€” recours possible PG</td></tr>
</table>
<div class="ok"><strong>Avis Parquet â€” 4 moments obligatoires (Art. 40 CPP) :</strong> (1) Constatation infraction Â· (2) Privation de libertÃ© Â· (3) Demande prolongation GAV Â· (4) Fin de GAV</div>`,
bloc2:`<h1>ðŸ—ƒï¸ Fichiers Police &amp; RÃ©quisitions</h1>
<h2>Fichiers liÃ©s aux Personnes</h2>
<table>
<tr><th>Sigle</th><th>Nom complet</th><th>Contenu clÃ©</th></tr>
<tr><td><strong>TAJ</strong></td><td>Traitement des AntÃ©cÃ©dents Judiciaires</td><td>Mises en cause, victimes, tÃ©moins â€” Art. 230-6 CPP</td></tr>
<tr><td><strong>FPR</strong></td><td>Fichier des Personnes RecherchÃ©es</td><td>Personnes sous mandat, fugitifs, disparitions</td></tr>
<tr><td><strong>FNAEG</strong></td><td>Fichier National Empreintes GÃ©nÃ©tiques</td><td>Profils ADN â€” Art. 706-55 CPP â€” <strong>RÃ©quisition permanente</strong></td></tr>
<tr><td><strong>FAED</strong></td><td>Fichier AutomatisÃ© Empreintes Digitales</td><td>Empreintes digitales/palmaires â€” <strong>RÃ©quisition permanente</strong></td></tr>
<tr><td><strong>FIJAISV</strong></td><td>Fichier Judiciaire Auteurs Infr. Sexuelles/Violentes</td><td>CondamnÃ©s ISV â€” Obligations de pointage</td></tr>
<tr><td><strong>FIJAIT</strong></td><td>Fichier Judiciaire Auteurs Infr. Terroristes</td><td>CondamnÃ©s pour terrorisme</td></tr>
</table>
<h2>Fichiers liÃ©s aux VÃ©hicules</h2>
<table>
<tr><th>Sigle</th><th>Nom</th><th>Usage</th></tr>
<tr><td><strong>FOVES</strong></td><td>Fichier Objets VÃ©hicules SignalÃ©s</td><td>VÃ©hicules volÃ©s, objets signalÃ©s</td></tr>
<tr><td><strong>SNPC</strong></td><td>SystÃ¨me National Permis de Conduire</td><td>ValiditÃ© permis, solde de points</td></tr>
<tr><td><strong>SIV</strong></td><td>SystÃ¨me d'Immatriculation des VÃ©hicules</td><td>Identification propriÃ©taire</td></tr>
<tr><td><strong>FVA</strong></td><td>Fichier VÃ©hicules AssurÃ©s</td><td>VÃ©rification assurance</td></tr>
<tr><td><strong>EUCARIS</strong></td><td>SystÃ¨me europÃ©en d'immatriculation</td><td>VÃ©hicules Ã©trangers</td></tr>
<tr><td><strong>ADOC</strong></td><td>AccÃ¨s Dossier Contraventions</td><td>Historique infractions routiÃ¨res</td></tr>
</table>
<h2>Les RÃ©quisitions â€” Cadre Juridique</h2>
<table>
<tr><th>Cadre</th><th>Article</th><th>AutoritÃ© requÃ©rante</th><th>SpÃ©cificitÃ©</th></tr>
<tr><td>Flagrant dÃ©lit</td><td>Art. 60 CPP</td><td>OPJ directement</td><td>Pas d'autorisation prÃ©alable</td></tr>
<tr><td>EnquÃªte prÃ©liminaire</td><td>Art. 77-1 CPP</td><td>Sur autorisation PR</td><td>Autorisation prÃ©alable obligatoire</td></tr>
<tr><td>FNAEG + FAED</td><td>Art. 706-55 CPP</td><td>OPJ directement</td><td><strong>RÃ©quisitions permanentes â€” EP incluse</strong></td></tr>
</table>
<h2>Types de RÃ©quisitions</h2>
<table>
<tr><th>Type</th><th>Objet</th></tr>
<tr><td>GÃ©nÃ©rales</td><td>Force publique, moyens de l'Ã‰tat</td></tr>
<tr><td>Ã€ personnes qualifiÃ©es</td><td>Experts, mÃ©decins, UMJ, techniciens</td></tr>
<tr><td>Informatiques</td><td>OpÃ©rateurs tÃ©lÃ©com, FAI â€” donnÃ©es de connexion et identification</td></tr>
<tr><td>Ã€ manÅ“uvrier</td><td>Ouverture de coffres, serrures, vÃ©hicules</td></tr>
<tr><td>PrÃ©lÃ¨vement sanguin</td><td>AlcoolÃ©mie, dÃ©pistage de stupÃ©fiants</td></tr>
<tr><td>Bancaires (FICOBA)</td><td>Comptes bancaires et mouvements financiers</td></tr>
<tr><td>X-Ray tÃ©lÃ©phone</td><td>Analyse donnÃ©es tÃ©lÃ©phone â€” hors enquÃªte â€” par personne qualifiÃ©e</td></tr>
<tr><td>Interceptions (Art. 100 CPP)</td><td>Uniquement en information judiciaire (JI)</td></tr>
</table>
<div class="ok"><strong>âœ“ Objectif :</strong> La manifestation de la vÃ©ritÃ©. Toute rÃ©quisition = PV de rÃ©quisition + rÃ©ponse Ã©crite du requis.</div>
<div class="piege"><strong>âš ï¸ FNAEG / FAED :</strong> RÃ©quisitions permanentes = l'OPJ peut accÃ©der sans autorisation du Parquet, mÃªme en enquÃªte prÃ©liminaire.</div>`
};

function renderPrintList(){
  const el=document.getElementById('print-list');if(!el)return;
  if(typeof PRINT_SHEETS==='undefined'||!PRINT_SHEETS.length){
    el.innerHTML='<div class="empty-state"><span class="empty-state-em">ðŸ“„</span>Aucune fiche disponible</div>';return;
  }
  const printed=S.printed||{};
  el.innerHTML=`<div class="print-grid">${PRINT_SHEETS.map((s,i)=>{
    const done=!!(printed[s.id]||printed[s.id+'_viewed']);
    return`<div class="print-card2${done?' done':''}" onclick="PRINT28.open('${s.id}')" style="animation:fadeUp .15s ${i*0.04}s both">
      <div class="print-card2-top">
        <div class="print-card2-em">${s.emoji}</div>
        ${done?`<div class="print-card2-check">âœ“</div>`:`<div class="print-card2-dl">â†“</div>`}
      </div>
      <div class="print-card2-title">${s.title}</div>
      <div class="print-card2-sub">${s.sub}</div>
      <div class="print-card2-footer">
        <span class="print-card2-cta">${done?'RÃ©imprimer':'Ouvrir la fiche'}</span>
      </div>
    </div>`;
  }).join('')}</div>`;
}


