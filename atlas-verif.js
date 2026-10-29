// Vérification des coordonnées (oct. 2026) et interventions réalisées depuis 2012
// Méthode : géocodage inverse du point ProDoc (OSM Nominatim) + recherche de l'ouvrage réel
// dans OpenStreetMap (Overpass : water=basin/reservoir/lake, natural=wetland) + presse/rapports.
// statut : ok = point dans la bonne commune et à < 1 km de l'objet ; approx = bonne zone mais
// ouvrage non identifié ou écart 1–3 km ; faux = mauvaise commune / mauvaise région.
(function(){
const V = {
1:{statut:"approx", rev:"Commune de Pikine Ouest (Pikine-Dagoudane)", corr:[14.7449,-17.3977], corrRef:"Réservoir / bassin cartographié à TAH 1, commune de Pikine Ouest (OSM way 474542039)", ecartObjet:1150,
   note:"Le point ProDoc est dans la commune de Pikine Ouest mais sur aucun ouvrage. Le bassin cartographié de Pikine Ouest (quartier TAH 1) est à 1,15 km au sud. C'est le seul bassin de rétention de la commune dans OSM, et l'atlas l'utilise comme position principale. Le ProDoc donnait aussi à ce site les mêmes coordonnées que le site 11.",
   depuis:[
    {d:"2012-2020",t:"PROGEP 1 (Banque mondiale, ADM) : bassins de rétention et réseaux de drainage à Pikine et Guédiawaye, réalisés en trois phases.",u:"https://www.adm.sn/en/progep1",s:"ADM"},
    {d:"2024",t:"Mise en service de la station de pompage de Pikine. Elle fonctionne mais reste fragile hors coordination communale (ProDoc p.70).",s:"ProDoc p.70"},
    {d:"2021-2026",t:"PIS-2 (FVC + AFD) : programme de résilience sur les 5 communes de Pikine.",s:"ProDoc p.69"}]},
2:{statut:"faux", rev:"Quartier Demba Seck, commune de Yeumbeul Sud", corr:[14.7490,-17.3702], corrRef:"Bassin / réservoir cartographié à Thiaroye (OSM relation 10488239, commune Tivaouane Diacksao)", ecartObjet:2450,
   note:"Le point tombe à Yeumbeul Sud et non à Thiaroye. Il se trouve à environ 300 m d'une « zone de rétention d'eau » OSM (14.7688, −17.3519), qui relève peut-être du site 6. Le centroïde de Thiaroye est 2,6 km plus au sud.",
   depuis:[
    {d:"2005",t:"Abandon de la nappe de Thiaroye pour l'eau potable à cause des nitrates (jusqu'à 400–450 mg/L).",u:"https://www.sciencedirect.com/science/article/abs/pii/S0378377409001255",s:"Sall et al. 2009"},
    {d:"juin 2024",t:"Campagne ONAS de faucardage et de reprofilage, lancée à Thiaroye-Gare (« Setal Sunu Réew ») et étendue à l'ensemble des bassins de la banlieue.",u:"https://fr.allafrica.com/stories/202406030401.html",s:"ONAS / Le Soleil"}]},
3:{statut:"approx", rev:"Commune de Guinaw Rail Nord", corr:[14.7700,-17.3844], corrRef:"Bassins de rétention 1 et 2 du secteur Bagdad (OSM ways 165397570 et 165397565), limite DTK / Médina Gounass, à environ 600 m de la mosquée Bagdad (DTK)", ecartObjet:1660,
   note:"Le point ProDoc tombait dans la commune voisine (Guinaw Rail Nord). Le principal ouvrage de DTK est le bassin de Bagdad (52 000 m³, curé par l'ONAS en 2024). Le quartier Bagdad et sa mosquée sont dans la commune de Djiddah Thiaroye Kao, et les deux bassins de rétention cartographiés juste à l'ouest (« Bassin 1 » et « Bassin 2 ») correspondent à ce secteur. L'atlas retient le centre de ces deux bassins. Un relevé GPS sur place doit confirmer que ce sont bien les bassins de Bagdad.",
   depuis:[
    {d:"juin 2024",t:"ONAS : faucardage et reprofilage du bassin de Bagdad (52 000 m³), avec plusieurs tonnes de déchets extraites. L'eau est évacuée vers Malika puis la mer.",u:"https://fr.allafrica.com/stories/202406030401.html",s:"Le Soleil / AllAfrica"},
    {d:"2020",t:"Plan ORSEC : 12 475 ménages touchés dans la région, DTK parmi les communes les plus sinistrées.",s:"ProDoc p.33"}]},
4:{statut:"faux", rev:"Voie de Dégagement Nord, commune de Golf Sud (Sam Notaire)", corr:[14.7791,-17.3660], corrRef:"Bassin de rétention « Wakhinane » (OSM way 178571236)", ecartObjet:4320,
   note:"Le point tombe sur la VDN, à Golf Sud. OSM contient un bassin de rétention nommé « Wakhinane » à 4,3 km à l'est (14.7791, −17.3660), dans la commune de Wakhinane Nimzatt. C'est très probablement le bon site.",
   depuis:[
    {d:"2012-2020",t:"PROGEP 1 : aménagement de bassins à Wakhinane, Médina Gounass, Bagdad et Niéty Mbar.",u:"https://documents1.worldbank.org/curated/en/684731468308063489/pdf/E29130v20FR0SEN0stormwater0management.pdf",s:"CGES PROGEP, Banque mondiale"},
    {d:"2021-2026",t:"PROGEP 2 : Wakhinane Nimzatt figure parmi les communes ciblées par les travaux.",u:"https://adm.sn/sites/default/files/documents-articles/CGES%20actualis%C3%A9%20AF%20PROGEP%20II%20.pdf",s:"CGES PROGEP II"},
    {d:"—",t:"Projet de gestion intégrée du risque d'inondation à Wakhinane Nimzatt et Ndiarème Limamoulaye (coopération décentralisée).",u:"https://bdd.pseau.org/outils/actions/action_resultat.php?ac[]=4100&tout=1",s:"pS-Eau"}]},
5:{statut:"faux", rev:"Darou Salam / Ndiayenne, commune de Malika", corr:[14.7795,-17.3160], corrRef:"Bassin de l'Unité 3, Keur Massar (PROGEP 2)", ecartObjet:2120,
   note:"Le point tombe à Malika et non à Keur Massar Nord. Le principal bassin de Keur Massar Nord (Unité 3, PROGEP 2) est à environ 2,1 km au sud-est.",
   depuis:[
    {d:"2021-2025",t:"PROGEP 2 : 18 bassins de rétention et 46 000 m de drainage dans 8 communes (Keur Massar, Rufisque, Pikine, Guédiawaye).",u:"https://enqueteplus.com/content/bassins-de-r%C3%A9tention-keur-massar",s:"EnQuête+ / APS"},
    {d:"mars 2025",t:"Extension du bassin de l'Unité 3 : +18 000 m³ avant l'hivernage 2025 (visite de la mission Banque mondiale du 17 au 21 mars 2025).",u:"https://www.adm.sn",s:"ADM"},
    {d:"août 2025",t:"Comité de pilotage PROGEP 2 : le préfet demande que les eaux stockées soient valorisées pour le maraîchage au lieu d'être rejetées en mer.",u:"https://mha.gouv.sn/13712-2/",s:"Ministère de l'Hydraulique"}]},
6:{statut:"approx", rev:"Commune de Yeumbeul Nord", corr:[14.7688,-17.3519], corrRef:"« Zone de rétention d'eau » OSM (Yeumbeul Sud)", ecartObjet:753,
   note:"Le point est dans la bonne zone (Yeumbeul), à 750 m d'une zone de rétention OSM. Le dispositif de pompage de Keur Massar Sud n'est pas géoréférencé : relevé terrain nécessaire.",
   depuis:[
    {d:"hivernage 2025",t:"ONAS : 7 pompes installées à Keur Massar Sud. Les eaux sont refoulées vers le marigot de Mbao.",u:"https://onas.sn/actualites/inondations-a-dakar-le-ministre-de-l-hydraulique-et-de-l-assainissement-evalue-les-interventions-de-terrain",s:"ONAS"},
    {d:"2021-2025",t:"PROGEP 2 : bassins et drainage dans le département de Keur Massar.",u:"https://enqueteplus.com/content/bassins-de-r%C3%A9tention-keur-massar",s:"EnQuête+"}]},
7:{statut:"ok", rev:"Ndiayenne, commune de Malika", corr:[14.8015,-17.3376], corrRef:"Commune de Malika, centroïde OSM", ecartObjet:1690,
   note:"Le point est bien dans la commune de Malika (frange littorale). L'emprise de 35 ha n'est pas délimitée. À noter : la décharge de Mbeubeuss et l'étang de Mbeubeuss se trouvent à environ 3 km à l'est.",
   depuis:[
    {d:"mars 2025",t:"PROMOGED : déguerpissement et lancement des travaux de résorption et de réhabilitation de la décharge de Mbeubeuss (Malika), active depuis les années 1960 et source de métaux lourds.",u:"https://www.promoged.sn/fr/chantiers/la-resorption-progressive-de-la-decharge-de-mbeubeuss-dans-la-commune-de-malika",s:"PROMOGED"},
    {d:"nov. 2025",t:"Visite des organes de gouvernance du PROMOGED sur le chantier de Mbeubeuss.",u:"https://promoged.sn/fr/newsroom/rehabilitation-de-la-decharge-de-mbeubeuss-les-organes-de-gouvernance-du-promoged-en",s:"PROMOGED"}]},
8:{statut:"ok", rev:"Mbao, commune de Mbao (Thiaroye)", corr:[14.7604,-17.3321], corrRef:"Forêt classée de Mbao, centroïde OSM", ecartObjet:2330,
   note:"Le point est bien dans la commune de Mbao, mais en bordure sud. La forêt classée a son centroïde à 2,3 km au nord. Superficie ProDoc : 60 ha, à comparer aux 722 ha restants de la forêt (sur 808 ha classés en 1940).",
   depuis:[
    {d:"2008-2019",t:"Autoroute à péage (35 ha, 5,5 km × 60 m) et TER (environ 20 ha) : 86 ha amputés au total. Plan d'aménagement 2008 financé par l'APIX : seulement 700 M FCFA mobilisés sur 4 Mds prévus.",u:"https://aps.sn/la-foret-classee-de-mbao-un-poumon-vert-au-bord-de-lasphyxie/",s:"APS"},
    {d:"2023-2025",t:"Clôture de tout le périmètre, 8 comités villageois de surveillance, pépinière de 4,6 ha (environ 1 050 000 plants en 2023).",u:"https://aps.sn/la-foret-classee-de-mbao-un-poumon-vert-au-bord-de-lasphyxie/",s:"APS"},
    {d:"août 2025",t:"Le Président Diomaye Faye y lance la journée nationale d'investissement humain.",u:"https://aps.sn/la-foret-classee-de-mbao-un-poumon-vert-au-bord-de-lasphyxie/",s:"APS"},
    {d:"—",t:"PNUD : forage solaire de 35 m et 7 bassins d'arrosage pour les groupements maraîchers.",u:"https://www.undp.org/fr/senegal/actualites/la-foret-classee-de-mbao-espace-de-conservation-de-la-biodiversite-forestiere-et-source-de-revenus-pour-les-populations",s:"PNUD"}]},
9:{statut:"ok", rev:"Commune de Rufisque Est", corr:[14.7177,-17.2551], corrRef:"Commune de Rufisque Est, centroïde OSM", ecartObjet:1620,
   note:"Le point est bien dans la commune de Rufisque Est. Le bassin de 25 ha n'est pas identifiable dans OSM : relevé terrain nécessaire.",
   depuis:[
    {d:"juil. 2023",t:"Ministère de l'Eau et de l'Assainissement : 7 grands bassins de rétention en construction dans le département de Rufisque (3 à Kounoune, 2 à Niague, 2 à Madiagne).",u:"https://www.dakaractu.com/Rufisque-Prevention-des-inondations-7-grands-bassins-de-retention-pour-minimiser-les-risques-d-inondation-prevus-dans-le_a236306.html",s:"Dakaractu"},
    {d:"2021-2025",t:"PROGEP 2 : Rufisque Est et Sangalkam inclus dans les communes d'intervention.",u:"https://adm.sn/sites/default/files/documents-articles/CGES%20actualis%C3%A9%20AF%20PROGEP%20II%20.pdf",s:"CGES PROGEP II"}]},
10:{statut:"approx", rev:"Niacourab, commune de Tivaouane Peulh-Niaga", corr:[14.8049,-17.2945], corrRef:"Bassin / réservoir cartographié à Cité APIX, Tivaouane Peulh (OSM way 493714090)", ecartObjet:4240,
   note:"Le point ProDoc tombe à Niacourab, commune de Tivaouane Peulh-Niaga, sans ouvrage. Un bassin est cartographié à Tivaouane Peulh (Cité APIX, zone de recasement exposée aux inondations), dans la même commune : l'atlas l'utilise comme position principale. Autre candidat dans la même commune : le réservoir de Cité Tawfekh, Niaga (14.7983, −17.2368), à proximité du dalot de Tawfekh repris par l'État en 2023. Bambylor village est à environ 8 km à l'est.",
   depuis:[
    {d:"juil. 2023",t:"L'État annonce la construction d'un bassin à Bambilor « la semaine prochaine » pour soulager les populations.",u:"https://www.dakaractu.com/Rufisque-Prevention-des-inondations-7-grands-bassins-de-retention-pour-minimiser-les-risques-d-inondation-prevus-dans-le_a236306.html",s:"Dakaractu"},
    {d:"2023",t:"2 grands bassins prévus à Niague pour soulager le Lac Rose, saturé depuis 2022.",u:"https://www.dakaractu.com/Rufisque-Prevention-des-inondations-7-grands-bassins-de-retention-pour-minimiser-les-risques-d-inondation-prevus-dans-le_a236306.html",s:"Dakaractu"}]},
11:{statut:"approx", rev:"Commune de Pikine Ouest (même point que le site 1)", corr:[14.7593,-17.4089], corrRef:"Réserve naturelle urbaine Grande Niaye de Pikine (OSM)", ecartObjet:1530,
   note:"Le ProDoc reprend exactement les coordonnées du site 1. Le centroïde de la réserve (OSM) est à 1,5 km à l'ouest-nord-ouest. Pour une réserve de 650 ha, il faut le contour officiel du décret 2019-748, pas un point.",
   depuis:[
    {d:"29 mars 2019",t:"Décret n° 2019-748 : création de la réserve naturelle urbaine (650 ha, 8 communes).",u:"https://www.dakaractu.com/Grande-Niayes-de-Pikine-classee-reserve-naturelle-urbaine-toute-activite-de-mise-en-valeur-necessairement-soumise-au_a166847.html",s:"Dakaractu"},
    {d:"2024-2025",t:"Ville de Pikine / CoM SSA : transformation du typha de la réserve en bio-charbon et en briques. PROTEC II (AECID, 900 000 €).",u:"https://aps.sn/la-ville-de-pikine-se-lance-dans-la-transformation-du-typha-en-bio-charbon-et-briques-de-construction/",s:"APS"},
    {d:"2024",t:"CoM SSA : le typha couvre environ 100 ha (15 % de la réserve).",u:"https://comssa.org/fr/news/protecting-the-green-lung-of-pikine-turning-an-invasive-species-into-an-ecological-opportunity",s:"CoM SSA"}]},
12:{statut:"ok", rev:"Commune de Tivaouane Peulh-Niaga (Bambylor)", corr:[14.8387,-17.2311], corrRef:"Lac rose (OSM way 1162524929)", ecartObjet:580,
   note:"Validé : le point est à 580 m du plan d'eau cartographié. Commune réelle : Tivaouane Peulh-Niaga, et non Sangalkam comme l'indique la fiche p.56.",
   depuis:[
    {d:"sept. 2022",t:"Inondations : apports d'eaux pluviales, effondrement de la salinité, perte de la couleur rose et arrêt de la récolte du sel.",u:"https://www.lemonde.fr/afrique/article/2025/05/18/au-senegal-le-lac-rose-reprend-des-couleurs-son-activite-economique-aussi_6606609_3212.html",s:"Le Monde"},
    {d:"2023-2024",t:"Pompage de l'eau excédentaire, financé par les saliniers, des ONG et des entreprises locales (environ 23 M FCFA), avec appui de l'ADM.",s:"RFI / ADM"},
    {d:"mars 2025",t:"Le lac retrouve sa couleur rose ; reprise du sel et du tourisme. Les chercheurs de l'UCAD confirment le retour de l'équilibre.",u:"https://www.france24.com/fr/info-en-continu/20250325-au-s%C3%A9n%C3%A9gal-le-lac-rose-retrouve-sa-couleur-mythique-et-ses-touristes-ravis",s:"France 24 / AFP"}]},
13:{statut:"faux", rev:"Kaniak, commune de Bambylor (région de Dakar)", corr:[14.9107,-17.0664], corrRef:"Lake Tanma (OSM relation 5399076)", ecartObjet:11200,
   note:"Erreur majeure : le point ProDoc tombe à Kaniak (Bambylor, région de Dakar), à environ 11 km du lac. Le lac Tanma est situé à l'est de Kayar, commune de Mboro, région de Thiès : 14.893–14.911 °N, 17.056–17.066 °O (Wikipédia, OSM).",
   depuis:[
    {d:"depuis 1970",t:"Lac asséché depuis les sécheresses des années 1970 ; sols du fond de cuvette « extrêmement salins ».",u:"https://fr.wikipedia.org/wiki/Lac_Tanma",s:"Wikipédia / Fall 2022"},
    {d:"oct. 2022",t:"CNCR : camp de 130 jeunes du Sénégal et d'Afrique pour la restauration du lac, avec formations à la gestion communautaire.",u:"https://www.cncr.org/des-jeunes-des-senegal-et-de-lafrique-reunis-pour-restaurer-le-lac-tamna-menace-de-disparition/",s:"CNCR"},
    {d:"sept. 2024",t:"Le lac est toujours à sec ; les citoyens s'organisent pour gérer l'eau des Niayes.",u:"https://www.rfi.fr/fr/afrique/20241012-s%C3%A9n%C3%A9gal-dans-les-niayes-l-eau-se-fait-rare-et-sa-gestion-devient-l-affaire-des-citoyens",s:"RFI"},
    {d:"—",t:"Projet de sécurisation foncière des communes de Diender, Cayar et voisines : retour au maraîchage sur les terres du lac.",s:"Reportage vidéo"}]},
14:{statut:"faux", rev:"Ngomène, Méouane (Tivaouane, Thiès)", corr:[16.0830,-16.3200], corrRef:"Système des Trois Marigots : dépressions interdunaires cartographiées (OSM ways 358364135, 1015429349, 181687950), communes de Gandon, Diama et Fass Ngom", ecartObjet:null,
   note:"Le point ProDoc (Ngomène, Thiès) ne correspond à aucune zone humide connue. Le seul site « Trois Marigots » du Sénégal est dans le delta fossile du fleuve Sénégal, juste en amont des lagunes de Saint-Louis. Il s'étend à cheval sur les départements de Saint-Louis et Dagana et couvre les communes de Gandon, Diama/Maka Diama et Fass Ngom. Il se compose de trois dépressions interdunaires parallèles orientées sud-ouest–nord-est (le Khant, le Ndjim et le Ndiasséou, de 480 à 800 ha chacune) et d'un quatrième marigot, le Guélack, asséché dans les années 1950. Elles sont alimentées par le fleuve via le Ngalam, avec l'ouvrage de Ndiawdoune et la réserve de Bango. Exutoire : le Ndiaël (site Ramsar). La superficie de 230 ha indiquée par le ProDoc est très inférieure à celle du système réel.",
   depuis:[
    {d:"1986",t:"Barrage de Diama et ouvrage de Ndiawdoune sur le Ngalam : chute drastique du niveau d'eau des marigots.",u:"https://www.olac.sn/reseau-hydrographique/les-trois-marigots",s:"OLAC"},
    {d:"2018",t:"OLAC / DEFCCS : « Plan de gestion des Trois Marigots 2019-2023 — à la reconquête d'un paradis perdu » (88 p.).",u:"https://cda-omvs.org/14859/",s:"CDA-OMVS"},
    {d:"2018",t:"Remise en eau du Ndiaël (exutoire, site Ramsar) après plus de 30 ans d'assèchement.",u:"https://cda-omvs.org/14859/",s:"OLAC"},
    {d:"2021-2024",t:"OLAC, projet de restauration des fonctions écologiques et économiques (36 mois, 10 000 habitants) : dragage et endiguement du Khant (6 km) et du Ndjim (14 km), 2 ouvrages de franchissement, réhabilitation de 7,5 km de digues autour de la réserve de Bango, lavoirs et abreuvoirs, comités de gestion.",u:"https://www.olac.sn/nos-propjets/projet-de-restauration-des-fonctions-ecologiques-et-economiques-des-trois-marigots",s:"OLAC"},
    {d:"—",t:"UICN / PPI : classement en Aire du Patrimoine régional (18 villages).",u:"https://www.programmeppi.org/projects/aire-du-patrimoine-regional-des-trois-marigots/",s:"UICN-PPI"},
    {d:"—",t:"ARD Saint-Louis : bois villageois, pépinière communautaire, typha bio-charbon, fermes aquacoles, adduction d'eau.",u:"https://ardsl.sn/trois-marigots/",s:"ARD Saint-Louis"},
    {d:"—",t:"IREF de Saint-Louis : décomptes annuels des oiseaux d'eau dans les 3 marigots.",s:"Eaux et Forêts"}]},
15:{statut:"faux", rev:"Ricotte, Ndiébène Gandiole (département et région de Saint-Louis)", corr:[15.1373,-16.8872], corrRef:"Zone humide de la Niaye de Mboro (OSM relation 4814552, Keur Djibi Souké, Mboro)", ecartObjet:83000,
   note:"Le point ProDoc tombe à Ndiébène Gandiole, dans la région de Saint-Louis, et non dans celle de Louga. Il est à environ 83 km de Mboro. Une zone humide OSM existe à Mboro (15.137, −16.887). Le site doit être scindé en deux points (Mboro / Louga côtier) ou recentré.",
   depuis:[
    {d:"2017",t:"DGPRE : cartographie de la vulnérabilité de la nappe des Niayes à l'intrusion saline.",u:"https://bdd.pseau.org/outils/ouvrages/dgpre_cartographie_de_la_vulnerabilite_des_niayes_a_l_intrusion_saline_2017.pdf",s:"DGPRE"},
    {d:"2022",t:"Fall M. : salinisation des eaux souterraines et des sols du littoral nord.",u:"https://eujournal.org/index.php/esj/article/view/16099/15957",s:"ESJ"},
    {d:"2024-2025",t:"Contestation à Diender des 11 forages destinés à alimenter Dakar : les maraîchers craignent une baisse de la nappe.",u:"https://lequotidien.sn/diender-refuse-de-se-faire-couler-construction-de-onze-forages-pour-alimenter-dakar/",s:"Le Quotidien"}]}
};
// ---- Les composantes du système des Trois Marigots (géométries OSM, oct. 2026) ----
// L'attribution des noms Khant / Ndjim / Ndiasséou aux dépressions suit l'ordre nord-ouest → sud-est.
// Elle est PROVISOIRE et doit être confirmée par le plan de gestion OLAC 2019-2023.
window.ATLAS_MARIGOTS=[
 {id:'14a',nom:"Marigot du Khant (1er marigot)",k:'marigot',c:[16.083,-16.333],ha:"480–800",osm:"way 358364135 (zone humide saisonnière)",
  line:[[16.047,-16.369],[16.054,-16.361],[16.059,-16.357],[16.062,-16.352],[16.074,-16.345],[16.081,-16.339],[16.086,-16.333],[16.091,-16.33],[16.096,-16.327],[16.102,-16.32],[16.109,-16.311],[16.119,-16.30]],
  rev:"Mbarigo, commune de Gandon (Rao)", info:"Dragage, reprofilage et endiguement sur 6 km (OLAC) ; ouvrage de franchissement."},
 {id:'14b',nom:"Marigot du Ndjim (2e marigot)",k:'marigot',c:[16.061,-16.318],ha:"480–800",osm:"way 1015429349 (zone humide)",
  line:[[15.997,-16.371],[16.021,-16.354],[16.033,-16.345],[16.057,-16.328],[16.075,-16.313],[16.091,-16.299],[16.125,-16.266]],
  rev:"Commune de Diama (Dagana)", info:"Dragage, reprofilage et endiguement sur 14 km (OLAC) ; ouvrage de franchissement."},
 {id:'14c',nom:"Marigot du Ndiasséou (3e marigot)",k:'marigot',c:[16.089,-16.264],ha:"480–800",osm:"way 181687950 (cours d'eau saisonnier)",
  line:[[16.003,-16.368],[16.014,-16.358],[16.021,-16.350],[16.033,-16.342],[16.043,-16.335],[16.063,-16.319],[16.056,-16.309],[16.057,-16.298],[16.089,-16.264],[16.100,-16.249],[16.113,-16.245],[16.116,-16.232],[16.131,-16.226]],
  rev:"Commune de Ngnith / Diama (Dagana)", info:"Envahissement par la végétation aquatique ; entrées d'eau irrégulières."},
 {id:'14d',nom:"Ouvrage de Ndiawdoune (prise sur le Ngalam)",k:'ouvrage',c:[16.0682,-16.3899],osm:"village Ndiawdoun (OSM)",
  rev:"Ndiawdoun, commune de Gandon", info:"Ouvrage de 1986 qui régule l'alimentation des marigots depuis le fleuve via le Ngalam. Le projet OLAC prévoit de restaurer l'hydraulicité à son amont."},
 {id:'14e',nom:"Réserve de Bango",k:'reserve',c:[16.0329,-16.4387],osm:"plan d'eau « bango » (OSM)",
  rev:"Boudiouck, commune de Gandon", info:"Réserve d'eau douce de Saint-Louis ; 7,5 km de digues réhabilitées (OLAC)."},
 {id:'14f',nom:"Marigot du Guélack (asséché)",k:'fossile',c:null,
  rev:"—", info:"Quatrième marigot, asséché dans les années 1950. Sa vallée fossile reste visible sous forme de cuvettes successives. Pas de géométrie disponible : à localiser sur imagerie."}
];
window.ATLAS_SITES.forEach(s=>{const v=V[s.id]; if(!v)return; s.verif=v;
  if(v.corr){s.osm=v.corr; s.osmRef=v.corrRef;} else {s.osm=null; s.osmRef=v.corrRef;}});

// ---- Coordonnées principales de l'atlas (position retenue) ----
// use:'corr' = position corrigée ; use:'prodoc' = point ProDoc conservé (motif indiqué)
// conf : haute = objet cartographié identifié ; moyenne = centroïde de localité ; faible = à confirmer
const RET = {
 1:{use:'corr',conf:'haute',why:"Bassin cartographié à TAH 1, dans la commune de Pikine Ouest. C'est le seul ouvrage de rétention de la commune dans OSM."},
 2:{use:'corr',conf:'haute',why:"Bassin cartographié dans le quartier de Thiaroye (commune Tivaouane Diacksao). Il remplace le centroïde de la localité ; le point ProDoc tombait à Yeumbeul Sud."},
 3:{use:'corr',conf:'moyenne',why:"Centre des bassins de rétention 1 et 2 du secteur Bagdad (DTK). Il remplace le centroïde de la commune. À confirmer par un relevé GPS du bassin de Bagdad (52 000 m³)."},
 4:{use:'corr',conf:'haute',why:"Bassin de rétention « Wakhinane » identifié dans OSM."},
 5:{use:'corr',conf:'haute',why:"Bassin de l'Unité 3 (PROGEP 2), Keur Massar Nord."},
 6:{use:'corr',conf:'moyenne',why:"Zone de rétention d'eau cartographiée (Yeumbeul)."},
 7:{use:'prodoc',conf:'haute',why:"Point ProDoc validé (Ndiayenne, Malika, frange littorale) : il est plus précis que le centroïde de la commune."},
 8:{use:'corr',conf:'haute',why:"Forêt classée de Mbao, l'objet même du site."},
 9:{use:'prodoc',conf:'moyenne',why:"Point ProDoc validé dans Rufisque Est. Le seul point alternatif est le centroïde de la commune, moins précis."},
 10:{use:'corr',conf:'moyenne',why:"Bassin cartographié à Tivaouane Peulh (Cité APIX), dans la commune du site. Variante possible : réservoir de Cité Tawfekh (Niaga). La localité exacte du « bassin neuf » prévu (Y4) reste à confirmer."},
 11:{use:'corr',conf:'haute',why:"Réserve naturelle urbaine de la Grande Niaye de Pikine (OSM)."},
 12:{use:'corr',conf:'haute',why:"Plan d'eau du Lac Rose (OSM)."},
 13:{use:'corr',conf:'haute',why:"Lac Tanma (OSM, Wikipédia), à l'est de Kayar, région de Thiès."},
 14:{use:'corr',conf:'moyenne',why:"Centre du système des Trois Marigots (Khant, Ndjim, Ndiasséou, alimentés par le Ngalam), seul site de ce nom au Sénégal. Il se trouve dans le delta, environ 110 km au nord-est du point ProDoc et hors de la bande des Niayes. L'équipe PPG doit confirmer que c'est bien ce site."},
 15:{use:'corr',conf:'haute',why:"Zone humide de la Niaye de Mboro (OSM r4814552), à 600 m du centre de Mboro. Le pôle Louga côtier (environ 90 km au nord, secteur Potou) reste à géoréférencer comme second point."}
};
window.ATLAS_SITES.forEach(s=>{
  const r=RET[s.id]; s.ret=r;
  s.pos = (r.use==='corr'&&s.osm) ? s.osm.slice() : s.prodoc.slice();
  s.moved = r.use==='corr' && !!s.osm;
});
})();
(function(){
})();
