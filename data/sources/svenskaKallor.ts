/**
 * Svenska Evidenskällor
 *
 * Svenska rehabiliteringskällor och protokoll:
 * - Axelina (axelrehabilitering)
 * - Regionala vårdprogram (Kalmar, Dalarna, Jönköping)
 * - FYSS (Fysisk aktivitet vid sjukdom)
 * - SBU & Socialstyrelsen
 * - Fysioterapeuterna
 */

import { ScientificSource, BodyArea, ExerciseType, EvidenceLevel } from '../../types';

export const SVENSKA_KALLOR: ScientificSource[] = [
  // ============================================
  // AXELINA - AXELREHABILITERING
  // ============================================

  {
    id: 'swe_001',
    authors: ['Nowak J', 'Svensson B'],
    year: 2015,
    title: 'Obruten vårdkedja med Axelina - Rehabilitering av axelskador',
    journal: 'Axelina Sverige',
    url: 'https://axelina.com/concept',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet'],
    keywords: ['axelina', 'axelrehabilitering', 'rotatorkuff', 'postop', 'hemövningar', 'svenska']
  },
  {
    id: 'swe_002',
    authors: ['Region Dalarna Fysioterapi'],
    year: 2023,
    title: 'Rehabilitering efter axelprotesoperation - Axelina-protokoll',
    journal: 'Region Dalarna Vårdprogram',
    url: 'https://www.regiondalarna.se/contentassets/b5d0627b13b9432d95d24ca7980c340e/axelprotes.pdf',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['axelprotes', 'postop', 'axelina', 'rehabilitering', 'region dalarna']
  },
  {
    id: 'swe_003',
    authors: ['Region Kalmar Fysioterapi'],
    year: 2023,
    title: 'Riktlinje - Stor cuffsutur (rotatorkuffsutur)',
    journal: 'Region Kalmar Vårdgivare',
    url: 'https://vardgivare.regionkalmar.se/globalassets/vard-och-behandling/rehabilitering-och-habilitering/rehabilitering/riktlinjer/fysioterapi/stor-cuffsutur.pdf',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet'],
    keywords: ['rotatorkuff', 'cuffsutur', 'postop', 'axel', 'region kalmar']
  },
  {
    id: 'swe_004',
    authors: ['Region Jönköping Ortopedi'],
    year: 2023,
    title: 'Axelprotes omvänd efter artros/fraktur - Rehabiliteringsrutin',
    journal: 'Region Jönköping Folkhälsa och Sjukvård',
    url: 'https://folkhalsaochsjukvard.rjl.se/dokument/evo/5c573817-9311-404d-9a53-7f328527cd82',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['omvänd axelprotes', 'postop', 'artros', 'fraktur', 'region jönköping']
  },
  {
    id: 'swe_005',
    authors: ['Region Jönköping Fysioterapi'],
    year: 2023,
    title: 'Humerusfraktur proximal opererad - Fysioterapirutin',
    journal: 'Region Jönköping Folkhälsa och Sjukvård',
    url: 'https://folkhalsaochsjukvard.rjl.se/dokument/evo/b4ce6c1a-2a19-4112-abc6-2ea92fb729b9',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['humerusfraktur', 'proximal', 'postop', 'axel', 'region jönköping']
  },

  // ============================================
  // KNÄ - REGIONALA RIKTLINJER
  // ============================================

  {
    id: 'swe_010',
    authors: ['Region Kalmar Fysioterapi'],
    year: 2023,
    title: 'Riktlinjer för rehabilitering vid meniskskada - Konservativ behandling',
    journal: 'Region Kalmar Vårdgivare',
    url: 'https://vardgivare.regionkalmar.se/globalassets/vard-och-behandling/rehabilitering-och-habilitering/rehabilitering/riktlinjer/fysioterapi/kna/riktlinjer-meniskskada---konservativ-behandling.pdf',
    evidenceLevel: 'expert',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['meniskskada', 'konservativ', 'knä', 'rehabilitering', 'region kalmar']
  },
  {
    id: 'swe_011',
    authors: ['Region Kalmar Fysioterapi'],
    year: 2023,
    title: 'Knäkontroll - Reaktionsövningar för knärehabilitering',
    journal: 'Region Kalmar Vårdgivare',
    url: 'https://vardgivare.regionkalmar.se/globalassets/vard-och-behandling/rehabilitering-och-habilitering/rehabilitering/riktlinjer/fysioterapi/kna/reaktionstraning--informationsblad.pdf',
    evidenceLevel: 'expert',
    bodyAreas: ['knä'],
    exerciseTypes: ['stabilitet', 'plyometri'],
    keywords: ['knäkontroll', 'reaktionsträning', 'knä', 'stabilitetsträning']
  },
  {
    id: 'swe_012',
    authors: ['Läkarhuset Rehabilitering'],
    year: 2022,
    title: 'Rehabiliteringsprogram vid främre knäsmärta (patellofemoralt smärtsyndrom)',
    journal: 'Läkarhuset Specialistvård',
    url: 'http://www.lakarhuset.com/docs/rehab_framre_knasmarta.pdf',
    evidenceLevel: 'expert',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['patellofemoral', 'främre knäsmärta', 'PFPS', 'knärehabilitering']
  },
  {
    id: 'swe_013',
    authors: ['Sportrehab Sverige'],
    year: 2024,
    title: 'Axelskador - Komplett rehabiliteringsprogram',
    journal: 'Sportrehab Kliniken',
    url: 'https://sportrehab.se/rehabilitering/axelskador/',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['sportrehab', 'axelskador', 'idrottsskador', 'rehabilitering']
  },

  // ============================================
  // FYSS - FYSISK AKTIVITET VID SJUKDOM
  // ============================================

  {
    id: 'swe_020',
    authors: ['FYSS - Yrkesföreningar för Fysisk Aktivitet'],
    year: 2016,
    title: 'Fysisk aktivitet vid artros',
    journal: 'FYSS - Fysisk aktivitet i Sjukdomsprevention och Sjukdomsbehandling',
    url: 'https://www.fyss.se/wp-content/uploads/2017/09/Artros.pdf',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft', 'hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stretching'],
    keywords: ['artros', 'FYSS', 'fysisk aktivitet', 'evidensbaserad', 'svenska riktlinjer']
  },
  {
    id: 'swe_021',
    authors: ['FYSS - Yrkesföreningar för Fysisk Aktivitet'],
    year: 2016,
    title: 'Fysisk aktivitet vid långvarig smärta',
    journal: 'FYSS - Fysisk aktivitet i Sjukdomsprevention och Sjukdomsbehandling',
    url: 'https://www.fyss.se',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'ländrygg', 'nacke'],
    exerciseTypes: ['stärkning', 'stretching', 'rörlighet'],
    keywords: ['långvarig smärta', 'kronisk smärta', 'FYSS', 'fysisk aktivitet']
  },
  {
    id: 'swe_022',
    authors: ['FYSS - Yrkesföreningar för Fysisk Aktivitet'],
    year: 2016,
    title: 'Fysisk aktivitet vid depression och ångest',
    journal: 'FYSS - Fysisk aktivitet i Sjukdomsprevention och Sjukdomsbehandling',
    url: 'https://www.fyss.se',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stretching', 'stärkning'],
    keywords: ['depression', 'ångest', 'mental hälsa', 'FYSS', 'fysisk aktivitet']
  },

  // ============================================
  // HÖFT & ARTROS
  // ============================================

  {
    id: 'swe_030',
    authors: ['Region Kalmar Fysioterapi'],
    year: 2023,
    title: 'Artrosrutin - Artros i höft, knä eller hand vid besök hos fysioterapeut',
    journal: 'Region Kalmar Vårdgivare',
    url: 'https://vardgivare.regionkalmar.se/globalassets/vard-och-behandling/rehabilitering-och-habilitering/rehabilitering/riktlinjer/fysioterapi/artrosrutin.pdf',
    evidenceLevel: 'expert',
    bodyAreas: ['höft', 'knä', 'handled'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artros', 'höftartros', 'knäartros', 'fysioterapi', 'region kalmar']
  },
  {
    id: 'swe_031',
    authors: ['Fysioterapi.se Redaktion'],
    year: 2024,
    title: 'Fysioterapins roll vid artrosbehandling i höft och knä',
    journal: 'Fysioterapi.se',
    url: 'https://fysioterapi.se/fysioterapins-roll-vid-artrosbehandling-i-hoft-och-kna/',
    evidenceLevel: 'expert',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stretching'],
    keywords: ['artros', 'fysioterapi', 'höft', 'knä', 'grundbehandling']
  },
  {
    id: 'swe_032',
    authors: ['Skadekompassen'],
    year: 2024,
    title: 'Trokanterit & Axelina - Rehabiliteringsguide',
    journal: 'Skadekompassen Vårdgivare',
    url: 'https://skadekompassen.se/vardgivare/skada-sjukdomstillstand/trokanterit/behandlingsmetod/rehabilitering-rehabtraning-2/specialisering/axelina/',
    evidenceLevel: 'expert',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['trokanterit', 'höftbursit', 'rehabilitering', 'skadekompassen']
  },

  // ============================================
  // RYGG - LÄNDRYGG & NACKE
  // ============================================

  {
    id: 'swe_040',
    authors: ['Linköpings universitet Fysioterapi'],
    year: 2017,
    title: 'Träningsprogram vid ryggbesvär - Lång version',
    journal: 'Linköpings universitet',
    url: 'https://liu.se/dfsmedia/dd35e243dfb7406993c1815aaf88a675/44972-source/options/download/6-2traningsprogramlangaversonenuppdaterad171226',
    evidenceLevel: 'expert',
    bodyAreas: ['ländrygg', 'bål'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['ryggbesvär', 'ländryggssmärta', 'träningsprogram', 'liu']
  },
  {
    id: 'swe_041',
    authors: ['1177 Vårdguiden'],
    year: 2024,
    title: 'Fysioterapi vid besvär i nacke, axlar och rygg',
    journal: '1177 Vårdguiden',
    url: 'https://www.1177.se/undersokning-behandling/smartbehandlingar-och-rehabilitering/fysioterapi-vid-besvar-i-nacke-axlar-och-rygg/',
    evidenceLevel: 'expert',
    bodyAreas: ['nacke', 'axel', 'ländrygg', 'övre_rygg'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stretching'],
    keywords: ['fysioterapi', 'nacksmärta', 'ryggsmärta', '1177', 'patientinformation']
  },

  // ============================================
  // NATIONELLA RIKTLINJER & MYNDIGHETER
  // ============================================

  {
    id: 'swe_050',
    authors: ['SBU - Statens beredning för medicinsk och social utvärdering'],
    year: 2024,
    title: 'Underlag till nationella riktlinjer för rörelseorganens sjukdomar',
    journal: 'SBU Kunskapsunderlag',
    url: 'https://www.sbu.se/sv/publikationer/sbu-bereder/underlag-till-nationella-riktlinjer-for-rorelseorganens-sjukdomar/',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'knä', 'höft', 'ländrygg'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['SBU', 'nationella riktlinjer', 'rörelseorganens sjukdomar', 'artros', 'osteoporos']
  },
  {
    id: 'swe_051',
    authors: ['Socialstyrelsen'],
    year: 2023,
    title: 'Förslag till nationell strategi för rehabilitering och habilitering',
    journal: 'Socialstyrelsen Kunskapsstöd',
    url: 'https://www.socialstyrelsen.se/kunskapsstod-och-regler/omraden/god-och-nara-vard/forslag-till-nationell-strategi-och-handlingsplan-for-rehabilitering-och-habilitering/',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stretching'],
    keywords: ['socialstyrelsen', 'nationell strategi', 'rehabilitering', 'habilitering']
  },
  {
    id: 'swe_052',
    authors: ['Socialstyrelsen'],
    year: 2023,
    title: 'Försäkringsmedicinskt beslutsstöd - Sjukskrivning och rehabilitering',
    journal: 'Socialstyrelsen Försäkringsmedicin',
    url: 'https://forsakringsmedicin.socialstyrelsen.se/halso-och-sjukvardens-arbete/sjukskrivning-och-rehabilitering/',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['sjukskrivning', 'rehabilitering', 'försäkringsmedicin', 'socialstyrelsen']
  },
  {
    id: 'swe_053',
    authors: ['Fysioterapeuterna'],
    year: 2022,
    title: 'Nationella riktlinjer för fysioterapi',
    journal: 'Fysioterapeuterna Sverige',
    url: 'https://www.fysioterapeuterna.se',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet', 'stretching'],
    keywords: ['fysioterapeuterna', 'nationella riktlinjer', 'fysioterapi', 'profession']
  },

  // ============================================
  // SJUKHUS TRÄNINGSPROGRAM
  // ============================================

  {
    id: 'swe_060',
    authors: ['Sahlgrenska Universitetssjukhuset'],
    year: 2024,
    title: 'Träningsprogram - Arbetsterapi och Fysioterapi',
    journal: 'Sahlgrenska Universitetssjukhuset',
    url: 'https://www.sahlgrenska.se/omraden/omrade-3/arbetsterapi-och-fysioterapi/traningsprogram/',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp', 'axel', 'knä', 'höft', 'ländrygg'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet'],
    keywords: ['sahlgrenska', 'träningsprogram', 'fysioterapi', 'arbetsterapi']
  },

  // ============================================
  // SPECIFIKA DIAGNOSER
  // ============================================

  {
    id: 'swe_070',
    authors: ['DocPlayer Medical'],
    year: 2020,
    title: 'ASD - Artroskopisk subacromiell dekompression rehabilitering',
    journal: 'Klinisk dokumentation',
    url: 'https://docplayer.se/841176-Asd-artroskopisk-subacromiell-dekompression.html',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['ASD', 'subacromiell dekompression', 'artroskopi', 'impingement']
  },
  {
    id: 'swe_071',
    authors: ['Naprapat & Idrottsskadeklinik Göteborg'],
    year: 2024,
    title: 'Knärehab - Övningar för knäskador',
    journal: 'Naprapat Idrott',
    url: 'https://napraidrott.se/ovningar/knarehab/',
    evidenceLevel: 'expert',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['knärehab', 'naprapat', 'idrottsskador', 'knäövningar']
  },
  {
    id: 'swe_072',
    authors: ['Access Rehab'],
    year: 2024,
    title: 'Knäövningar - Komplett guide för knäsmärta',
    journal: 'Access Rehab',
    url: 'https://www.accessrehab.se/symptom/ben-och-fotter/knasmarta/knaovningar/',
    evidenceLevel: 'expert',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['knäövningar', 'knäsmärta', 'rehabilitering']
  },
  {
    id: 'swe_073',
    authors: ['Bandageshoppen Experter'],
    year: 2024,
    title: 'Rehabilitering efter axelskada - Komplett guide',
    journal: 'Bandageshoppen',
    url: 'https://bandageshoppen.se/blog/rehabilitering-efter-axelskada/',
    evidenceLevel: 'expert',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['axelskada', 'rehabilitering', 'patientinformation']
  },

  // ============================================
  // NYA KÄLLOR FRÅN EXCEL (2024)
  // Preventionsprogram & Patientutbildning
  // ============================================

  // AXELKONTROLL - Handbollsprogram
  {
    id: 'swe_080',
    authors: ['Svenska Handbollsförbundet', 'Oslo Sports Trauma Research Center'],
    year: 2016,
    title: 'Axelkontroll - Skadeförebyggande axelprogram för handboll',
    journal: 'Svenska Handbollsförbundet',
    url: 'https://www.handballresearchgroup.com/axelkontroll',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['axelkontroll', 'handboll', 'prevention', 'skadeförebyggande', 'ungdom', 'junior']
  },

  // GLA:D / BOA-REGISTRET
  {
    id: 'swe_081',
    authors: ['BOA-registret', 'GLA:D International'],
    year: 2024,
    title: 'GLA:D Sverige - God Livskvalitet med Artros',
    journal: 'BOA-registret',
    url: 'https://boa.registercentrum.se',
    evidenceLevel: 'A',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['GLA:D', 'artros', 'höftartros', 'knäartros', 'patientutbildning', 'BOA', 'artrosskola']
  },
  {
    id: 'swe_082',
    authors: ['Artrosportalen Lunds Universitet'],
    year: 2024,
    title: 'Artrosportalen - Information och behandling vid artros',
    journal: 'Lunds Universitet',
    url: 'https://www.artrosportalen.lu.se/behandlingar-vid-artros/artrosskola',
    evidenceLevel: 'A',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artrosportalen', 'artrosskola', 'forskning', 'lunds universitet']
  },

  // JOINT ACADEMY
  {
    id: 'swe_083',
    authors: ['Joint Academy AB'],
    year: 2024,
    title: 'Joint Academy - Digital artrosbehandling',
    journal: 'Joint Academy',
    url: 'https://www.jointacademy.com/se/sv',
    evidenceLevel: 'A',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['joint academy', 'digital', 'artros', 'app', 'hemträning']
  },
  {
    id: 'swe_084',
    authors: ['Joint Academy AB'],
    year: 2024,
    title: 'Joint Academy Rygg - Digital behandling av ländryggssmärta',
    journal: 'Joint Academy',
    url: 'https://www.jointacademy.com/se/sv/behandlingar/rygg',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['joint academy', 'ryggsmärta', 'digital', 'ländryggssmärta']
  },

  // KNÄKONTROLL
  {
    id: 'swe_085',
    authors: ['Svenska Fotbollförbundet'],
    year: 2024,
    title: 'Knäkontroll - Neuromuskulärt preventionsprogram',
    journal: 'Svenska Fotbollförbundet',
    url: 'https://www.svenskfotboll.se/svff/spelklar/knakontroll',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft'],
    exerciseTypes: ['stärkning', 'stabilitet', 'plyometri'],
    keywords: ['knäkontroll', 'ACL', 'prevention', 'fotboll', 'neuromuskulär']
  },
  {
    id: 'swe_086',
    authors: ['Svenska Fotbollförbundet'],
    year: 2024,
    title: 'Knäkontroll Plus - Utökat preventionsprogram',
    journal: 'Svenska Fotbollförbundet',
    url: 'https://www.svenskfotboll.se/49c375/globalassets/svff/utbildningsmaterial/pdf/knakontroll.pdf',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft', 'fotled'],
    exerciseTypes: ['stärkning', 'stabilitet', 'plyometri'],
    keywords: ['knäkontroll plus', 'ACL', 'prevention', 'uppvärmning']
  },

  // OSTEOPOROSSKOLA
  {
    id: 'swe_087',
    authors: ['Osteoporosförbundet Sverige'],
    year: 2024,
    title: 'Osteoporosskolor i Sverige - Nationell översikt',
    journal: 'Osteoporosförbundet',
    url: 'https://www.osteoporos.org/osteoporosskolor-i-sverige',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp', 'ländrygg', 'höft'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['osteoporos', 'benskörhet', 'patientutbildning', 'fallprevention']
  },
  {
    id: 'swe_088',
    authors: ['Region Stockholm Rehab'],
    year: 2024,
    title: 'Osteoporosskola - Region Stockholm',
    journal: 'Region Stockholm',
    url: 'https://www.rehab.regionstockholm.se/vi-erbjuder/osteoporosskola',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['osteoporosskola', 'stockholm', 'patientutbildning']
  },

  // RYGGSKOLA
  {
    id: 'swe_089',
    authors: ['Skadekompassen'],
    year: 2024,
    title: 'Ryggskola - Behandling vid ont i ryggen',
    journal: 'Skadekompassen',
    url: 'https://skadekompassen.se/behandlingsmetoder/ryggskola-behandling-ont-i-ryggen',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg', 'övre_rygg'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['ryggskola', 'ländryggssmärta', 'patientutbildning', 'ergonomi']
  },

  // REGIONALA ARTROSSKOLOR
  {
    id: 'swe_090',
    authors: ['Region Skåne 1177'],
    year: 2024,
    title: 'Artrosskola i Skåne',
    journal: '1177 Vårdguiden',
    url: 'https://www.1177.se/Skane/undersokning-behandling/smartbehandlingar-och-rehabilitering/artrosskola-i-skane/',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artrosskola', 'skåne', '1177', 'regional']
  },
  {
    id: 'swe_091',
    authors: ['Region Halland 1177'],
    year: 2024,
    title: 'Artrosskola fysiskt eller digitalt - Halland',
    journal: '1177 Vårdguiden',
    url: 'https://www.1177.se/Halland/undersokning-behandling/smartbehandlingar-och-rehabilitering/artrosskola-fysiskt-eller-digit',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä', 'handled'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artrosskola', 'halland', 'digital', 'hybrid']
  },
  {
    id: 'swe_092',
    authors: ['Region Kalmar 1177'],
    year: 2024,
    title: 'Artrosskola fysiskt eller digitalt - Kalmar',
    journal: '1177 Vårdguiden',
    url: 'https://www.1177.se/Kalmar-lan/undersokning-behandling/smartbehandlingar-och-rehabilitering/artrosskola-fysiskt-eller-di',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artrosskola', 'kalmar', '1177']
  },
  {
    id: 'swe_093',
    authors: ['Region Dalarna 1177'],
    year: 2024,
    title: 'Artrosskola fysiskt eller digitalt - Dalarna',
    journal: '1177 Vårdguiden',
    url: 'https://www.1177.se/Dalarna/undersokning-behandling/smartbehandlingar-och-rehabilitering/artrosskola-fysiskt-eller-digit',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artrosskola', 'dalarna', '1177']
  },

  // HÖFTSKOLA
  {
    id: 'swe_094',
    authors: ['Region Sörmland'],
    year: 2022,
    title: 'Införandet av Höftskola i Sörmland - Patientutbildning vid höftartros',
    journal: 'Region Sörmland Forskning',
    url: 'https://samverkan.regionsormland.se/siteassets/utbildning-och-forskning/nr-1-2207-inforandet-av-hoftola-i-sormland.-gunn',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['höftskola', 'sörmland', 'höftartros', 'patientutbildning']
  },

  // KNÄSKOLA
  {
    id: 'swe_095',
    authors: ['Region Värmland'],
    year: 2024,
    title: 'Knäskola - Fysioterapi vid knäartros',
    journal: 'Region Värmland Vårdgivarwebben',
    url: 'https://www.regionvarmland.se/vardgivarwebben/vard-och-behandling/hjalpmedel-habilitering-och-rehabilitering/fysioterapi',
    evidenceLevel: 'B',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['knäskola', 'värmland', 'knäartros', 'fysioterapi']
  },

  // DIGITAL ARTROSSKOLA PRIVAT
  {
    id: 'swe_096',
    authors: ['Skadekompassen'],
    year: 2024,
    title: 'Digital artrosbehandling - 5 minuter om dagen',
    journal: 'Skadekompassen',
    url: 'https://skadekompassen.se/behandling/artrosbehandling-i-mobilen-5-min-om-dagen/',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['digital', 'artros', 'app', 'hemträning']
  },
  {
    id: 'swe_097',
    authors: ['Idrottsskadeexperten'],
    year: 2024,
    title: 'Artrosskola online',
    journal: 'Idrottsskadeexperten',
    url: 'https://idrottsskadeexperten.se/artrosskola-online/',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['artrosskola', 'online', 'digital']
  },

  // SHOULDER CONTROL - NORDISK
  {
    id: 'swe_098',
    authors: ['Oslo Sports Trauma Research Center', 'Svenska Handbollsförbundet'],
    year: 2022,
    title: 'Shoulder Control Program - Randomiserad studie på svenska elithandbollsspelare',
    journal: 'Sports Medicine Open',
    url: 'https://sportsmedicine-open.springeropen.com/articles/10.1186/s40798-022-00478-z',
    evidenceLevel: 'A',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['shoulder control', 'handboll', 'prevention', 'RCT', 'axel']
  }
];

// ============================================
// HJÄLPFUNKTIONER FÖR SVENSKA KÄLLOR
// ============================================

/**
 * Hämta alla svenska källor för ett specifikt kroppsområde
 */
export function getSvenskaKallorByBodyArea(bodyArea: BodyArea): ScientificSource[] {
  return SVENSKA_KALLOR.filter(k => k.bodyAreas.includes(bodyArea));
}

/**
 * Hämta Axelina-specifika källor
 */
export function getAxelinaKallor(): ScientificSource[] {
  return SVENSKA_KALLOR.filter(k =>
    k.keywords.some(kw => kw.toLowerCase().includes('axelina'))
  );
}

/**
 * Hämta regionala källor (Kalmar, Dalarna, Jönköping etc.)
 */
export function getRegionalaSvenskaKallor(): ScientificSource[] {
  return SVENSKA_KALLOR.filter(k =>
    k.journal.toLowerCase().includes('region') ||
    k.keywords.some(kw => kw.toLowerCase().includes('region'))
  );
}

/**
 * Hämta FYSS-källor (Fysisk aktivitet vid sjukdom)
 */
export function getFYSSKallor(): ScientificSource[] {
  return SVENSKA_KALLOR.filter(k =>
    k.keywords.some(kw => kw.toLowerCase().includes('fyss'))
  );
}

/**
 * Hämta myndigherskällor (SBU, Socialstyrelsen)
 */
export function getMyndighetsKallor(): ScientificSource[] {
  return SVENSKA_KALLOR.filter(k =>
    k.keywords.some(kw =>
      kw.toLowerCase().includes('sbu') ||
      kw.toLowerCase().includes('socialstyrelsen')
    )
  );
}

/**
 * Sök i svenska källor med nyckelord
 */
export function searchSvenskaKallor(keyword: string): ScientificSource[] {
  const lowerKeyword = keyword.toLowerCase();
  return SVENSKA_KALLOR.filter(k =>
    k.title.toLowerCase().includes(lowerKeyword) ||
    k.keywords.some(kw => kw.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Hämta antal svenska källor per kategori
 */
export function getSvenskaKallorStats(): {
  total: number;
  axelina: number;
  regionala: number;
  fyss: number;
  myndigheter: number;
} {
  return {
    total: SVENSKA_KALLOR.length,
    axelina: getAxelinaKallor().length,
    regionala: getRegionalaSvenskaKallor().length,
    fyss: getFYSSKallor().length,
    myndigheter: getMyndighetsKallor().length
  };
}

export default SVENSKA_KALLOR;
