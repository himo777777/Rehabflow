/**
 * Scientific Sources Database
 * ~200 evidence-based references for exercise recommendations
 */

import { ScientificSource, BodyArea, ExerciseType, EvidenceLevel } from '../../types';
import { SVENSKA_KALLOR, getSvenskaKallorByBodyArea } from './svenskaKallor';

export const SCIENTIFIC_SOURCES: ScientificSource[] = [
  // ============================================
  // SYSTEMATIC REVIEWS & META-ANALYSES (Level A)
  // ============================================

  // Strength Training
  {
    id: 'src_001',
    authors: ['Schoenfeld BJ', 'Ogborn D', 'Krieger JW'],
    year: 2017,
    title: 'Dose-response relationship between weekly resistance training volume and increases in muscle mass',
    journal: 'Journal of Sports Sciences',
    doi: '10.1080/02640414.2016.1210197',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'överkropp', 'underkropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['styrketräning', 'muskelhypertrofi', 'volym', 'dos-respons']
  },
  {
    id: 'src_002',
    authors: ['Schoenfeld BJ', 'Grgic J', 'Van Every DW', 'Plotkin DL'],
    year: 2021,
    title: 'Loading recommendations for muscle strength, hypertrophy, and local endurance',
    journal: 'International Journal of Environmental Research and Public Health',
    doi: '10.3390/ijerph18031145',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['belastning', 'styrka', 'hypertrofi', 'uthållighet']
  },
  {
    id: 'src_003',
    authors: ['Ralston GW', 'Kilgore L', 'Wyber F', 'Baker JS'],
    year: 2017,
    title: 'The effect of weekly set volume on strength gain: A meta-analysis',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-017-0762-7',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['setvolym', 'styrkeökning', 'träningsvolym']
  },

  // Low Back Pain
  {
    id: 'src_004',
    authors: ['Hayden JA', 'van Tulder MW', 'Malmivaara A', 'Koes BW'],
    year: 2005,
    title: 'Exercise therapy for treatment of non-specific low back pain',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD000335.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'stretching', 'stabilitet'],
    keywords: ['ländryggssmärta', 'träningsterapi', 'kronisk smärta']
  },
  {
    id: 'src_005',
    authors: ['Searle A', 'Spink M', 'Ho A', 'Chuter V'],
    year: 2015,
    title: 'Exercise interventions for the treatment of chronic low back pain',
    journal: 'Clinical Rehabilitation',
    doi: '10.1177/0269215515570379',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg', 'bål'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['kronisk ländryggssmärta', 'träning', 'rehabilitering']
  },
  {
    id: 'src_006',
    authors: ['Smith BE', 'Littlewood C', 'May S'],
    year: 2014,
    title: 'An update of stabilisation exercises for low back pain',
    journal: 'BMC Musculoskeletal Disorders',
    doi: '10.1186/1471-2474-15-416',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg', 'bål'],
    exerciseTypes: ['stabilitet'],
    keywords: ['stabiliseringsövningar', 'core', 'ländryggssmärta']
  },

  // Neck Pain
  {
    id: 'src_007',
    authors: ['Blanpied PR', 'Gross AR', 'Elliott JM'],
    year: 2017,
    title: 'Neck Pain: Revision 2017 - Clinical Practice Guidelines',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2017.0302',
    evidenceLevel: 'A',
    bodyAreas: ['nacke', 'övre_rygg'],
    exerciseTypes: ['stärkning', 'stretching', 'rörlighet'],
    keywords: ['nacksmärta', 'kliniska riktlinjer', 'fysioterapi']
  },
  {
    id: 'src_008',
    authors: ['Gross AR', 'Paquin JP', 'Dupont G'],
    year: 2016,
    title: 'Exercises for mechanical neck disorders',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD004250.pub5',
    evidenceLevel: 'A',
    bodyAreas: ['nacke'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['mekanisk nacksmärta', 'övningar', 'systematisk översikt']
  },

  // Shoulder
  {
    id: 'src_009',
    authors: ['Hanratty CE', 'McVeigh JG', 'Kerr DP'],
    year: 2012,
    title: 'The effectiveness of physiotherapy exercises in subacromial impingement syndrome',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2012-091619',
    evidenceLevel: 'A',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['impingement', 'axelsmärta', 'rotatorkuff']
  },
  {
    id: 'src_010',
    authors: ['Shire AR', 'Stæhr TA', 'Overby JB', 'Bastholm A'],
    year: 2017,
    title: 'Specific or general exercise strategy for subacromial impingement syndrome',
    journal: 'BMC Musculoskeletal Disorders',
    doi: '10.1186/s12891-017-1518-0',
    evidenceLevel: 'A',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['axelimpingement', 'specifik träning', 'rehabilitering']
  },

  // Knee
  {
    id: 'src_011',
    authors: ['Fransen M', 'McConnell S', 'Harmer AR', 'Van der Esch M'],
    year: 2015,
    title: 'Exercise for osteoarthritis of the knee',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD004376.pub3',
    evidenceLevel: 'A',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['knäartros', 'träning', 'smärtlindring']
  },
  {
    id: 'src_012',
    authors: ['van der Heijden RA', 'Lankhorst NE', 'van Linschoten R'],
    year: 2015,
    title: 'Exercise for treating patellofemoral pain syndrome',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD010387.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['patellofemoralt smärtsyndrom', 'främre knäsmärta', 'quadriceps']
  },

  // Hip
  {
    id: 'src_013',
    authors: ['Fransen M', 'McConnell S', 'Hernandez-Molina G', 'Reichenbach S'],
    year: 2014,
    title: 'Exercise for osteoarthritis of the hip',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD007912.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['höftartros', 'träning', 'funktion']
  },

  // Ankle/Foot
  {
    id: 'src_014',
    authors: ['Doherty C', 'Bleakley C', 'Delahunt E', 'Holden S'],
    year: 2017,
    title: 'Treatment and prevention of acute and recurrent ankle sprain',
    journal: 'Journal of Athletic Training',
    doi: '10.4085/1062-6050-51.5.07',
    evidenceLevel: 'A',
    bodyAreas: ['fotled'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['ankelstuk', 'prevention', 'rehabilitering']
  },

  // Balance
  {
    id: 'src_015',
    authors: ['Sherrington C', 'Michaleff ZA', 'Fairhall N'],
    year: 2017,
    title: 'Exercise to prevent falls in older adults',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2016-096547',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stabilitet', 'stärkning'],
    keywords: ['fallprevention', 'äldre', 'balansträning']
  },

  // Core/Trunk
  {
    id: 'src_016',
    authors: ['Brumitt J', 'Matheson JW', 'Meira EP'],
    year: 2013,
    title: 'Core stabilization exercise prescription',
    journal: 'Current Sports Medicine Reports',
    doi: '10.1097/01.CSMR.0000428713.98823.d0',
    evidenceLevel: 'A',
    bodyAreas: ['bål', 'ländrygg'],
    exerciseTypes: ['stabilitet'],
    keywords: ['core', 'bålstabilitet', 'föreskrifter']
  },

  // Stretching
  {
    id: 'src_017',
    authors: ['Page P'],
    year: 2012,
    title: 'Current concepts in muscle stretching for exercise and rehabilitation',
    journal: 'International Journal of Sports Physical Therapy',
    pmid: '22319684',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stretching', 'rörlighet'],
    keywords: ['stretching', 'rörlighet', 'flexibilitet']
  },

  // ============================================
  // RCTs AND COHORT STUDIES (Level B)
  // ============================================

  // McGill Back Exercises
  {
    id: 'src_018',
    authors: ['McGill SM'],
    year: 2007,
    title: 'Low Back Disorders: Evidence-Based Prevention and Rehabilitation',
    journal: 'Human Kinetics',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg', 'bål'],
    exerciseTypes: ['stabilitet', 'stärkning'],
    keywords: ['McGill Big 3', 'bird dog', 'curl-up', 'sidoplanka']
  },
  {
    id: 'src_019',
    authors: ['Huxel Bliven KC', 'Anderson BE'],
    year: 2013,
    title: 'Core stability training for injury prevention',
    journal: 'Sports Health',
    doi: '10.1177/1941738113481200',
    evidenceLevel: 'B',
    bodyAreas: ['bål', 'ländrygg'],
    exerciseTypes: ['stabilitet'],
    keywords: ['skadeförebyggande', 'core', 'stabilitet']
  },

  // Shoulder Rehabilitation
  {
    id: 'src_020',
    authors: ['Reinold MM', 'Escamilla RF', 'Wilk KE'],
    year: 2009,
    title: 'Current concepts in the scientific and clinical rationale behind exercises for glenohumeral and scapulothoracic musculature',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2009.2835',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['scapula', 'rotatorkuff', 'axelstabilitet']
  },
  {
    id: 'src_021',
    authors: ['Cools AM', 'Dewitte V', 'Lanszweert F'],
    year: 2007,
    title: 'Rehabilitation of scapular muscle balance',
    journal: 'American Journal of Sports Medicine',
    doi: '10.1177/0363546507303560',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'övre_rygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['scapular dyskinesi', 'muskelbalans', 'rehabilitering']
  },

  // Hip Strengthening
  {
    id: 'src_022',
    authors: ['Reiman MP', 'Bolgla LA', 'Loudon JK'],
    year: 2012,
    title: 'A literature review of studies evaluating gluteus maximus and gluteus medius activation during rehabilitation exercises',
    journal: 'Physiotherapy Theory and Practice',
    doi: '10.3109/09593985.2011.604981',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['gluteus', 'höftmuskulatur', 'EMG', 'aktivering']
  },
  {
    id: 'src_023',
    authors: ['Distefano LJ', 'Blackburn JT', 'Marshall SW', 'Padua DA'],
    year: 2009,
    title: 'Gluteal muscle activation during common therapeutic exercises',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2009.2796',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['gluteus medius', 'clamshell', 'sidoliggande höftabduktion']
  },

  // Quadriceps/Knee
  {
    id: 'src_024',
    authors: ['Earp JE', 'Newton RU', 'Cormie P', 'Blazevich AJ'],
    year: 2015,
    title: 'Inhomogeneous quadriceps femoris hypertrophy in response to strength and power training',
    journal: 'Medicine & Science in Sports & Exercise',
    doi: '10.1249/MSS.0000000000000604',
    evidenceLevel: 'B',
    bodyAreas: ['knä', 'underkropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['quadriceps', 'hypertrofi', 'knäextension']
  },

  // ACL Rehabilitation
  {
    id: 'src_025',
    authors: ['Grindem H', 'Snyder-Mackler L', 'Moksnes H', 'Engebretsen L', 'Risberg MA'],
    year: 2016,
    title: 'Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2016-096031',
    evidenceLevel: 'B',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'plyometri'],
    keywords: ['ACL', 'återgång till idrott', 'styrketest']
  },

  // Eccentric Training
  {
    id: 'src_026',
    authors: ['Lorenz D', 'Reiman M'],
    year: 2011,
    title: 'The role and implementation of eccentric training in athletic rehabilitation',
    journal: 'International Journal of Sports Physical Therapy',
    pmid: '22319687',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['excentrisk', 'stärkning'],
    keywords: ['excentrisk träning', 'senor', 'rehabilitering']
  },

  // Nordic Hamstring
  {
    id: 'src_027',
    authors: ['Mjolsnes R', 'Arnason A', 'Osthagen T', 'Raastad T', 'Bahr R'],
    year: 2004,
    title: 'A 10-week randomized trial comparing eccentric vs. concentric hamstring strength training',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsm.2003.010843',
    evidenceLevel: 'B',
    bodyAreas: ['underkropp', 'posterior_kedja'],
    exerciseTypes: ['excentrisk', 'stärkning'],
    keywords: ['nordic hamstring', 'excentrisk', 'hamstrings']
  },

  // Achilles Tendinopathy
  {
    id: 'src_028',
    authors: ['Alfredson H', 'Pietilä T', 'Jonsson P', 'Lorentzon R'],
    year: 1998,
    title: 'Heavy-load eccentric calf muscle training for the treatment of chronic Achilles tendinosis',
    journal: 'American Journal of Sports Medicine',
    doi: '10.1177/03635465980260030301',
    evidenceLevel: 'B',
    bodyAreas: ['fotled'],
    exerciseTypes: ['excentrisk'],
    keywords: ['hälsenetendinopati', 'excentrisk vadträning', 'Alfredson']
  },

  // Tennis Elbow
  {
    id: 'src_029',
    authors: ['Tyler TF', 'Thomas GC', 'Nicholas SJ', 'McHugh MP'],
    year: 2010,
    title: 'Addition of isolated wrist extensor eccentric exercise to standard treatment for chronic lateral epicondylosis',
    journal: 'Journal of Shoulder and Elbow Surgery',
    doi: '10.1016/j.jse.2010.04.041',
    evidenceLevel: 'B',
    bodyAreas: ['armbåge', 'handled'],
    exerciseTypes: ['excentrisk'],
    keywords: ['tennisarmbåge', 'lateral epikondylit', 'excentrisk']
  },

  // Cervical Spine
  {
    id: 'src_030',
    authors: ['Jull GA', 'Falla D', 'Vicenzino B', 'Hodges PW'],
    year: 2009,
    title: 'The effect of therapeutic exercise on activation of the deep cervical flexor muscles in people with chronic neck pain',
    journal: 'Manual Therapy',
    doi: '10.1016/j.math.2008.05.004',
    evidenceLevel: 'B',
    bodyAreas: ['nacke'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['djupa nackflexorer', 'kranioservical flexion', 'nacksmärta']
  },

  // Thoracic Spine
  {
    id: 'src_031',
    authors: ['Heneghan NR', 'Baker G', 'Thomas K', 'Falla D', 'Rushton A'],
    year: 2018,
    title: 'What is the effect of prolonged sitting and physical activity on thoracic spine mobility?',
    journal: 'Musculoskeletal Science and Practice',
    doi: '10.1016/j.msksp.2018.01.013',
    evidenceLevel: 'B',
    bodyAreas: ['övre_rygg'],
    exerciseTypes: ['rörlighet'],
    keywords: ['thorakal rörlighet', 'stillasittande', 'mobilisering']
  },

  // Rotator Cuff
  {
    id: 'src_032',
    authors: ['Edwards PK', 'Ebert JR', 'Joss B', 'Ackland T', 'Wang A', 'Pyrvis J'],
    year: 2016,
    title: 'A systematic review of electromyography studies in normal shoulders to inform postoperative rehabilitation following rotator cuff repair',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2016.6271',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['rotatorkuff', 'EMG', 'postoperativ rehabilitering']
  },

  // Scapular Exercises
  {
    id: 'src_033',
    authors: ['Kibler WB', 'Ludewig PM', 'McClure PW', 'Michener LA', 'Bak K', 'Sciascia AD'],
    year: 2013,
    title: 'Clinical implications of scapular dyskinesis in shoulder injury',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2012-091411',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'övre_rygg'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['scapular dyskinesi', 'skulderblad', 'kinematik']
  },

  // Wrist/Hand
  {
    id: 'src_034',
    authors: ['Page MJ', 'Massy-Westropp N', 'O\'Connor D', 'Pitt V'],
    year: 2012,
    title: 'Splinting for carpal tunnel syndrome',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD010003',
    evidenceLevel: 'B',
    bodyAreas: ['handled'],
    exerciseTypes: ['stretching', 'stärkning'],
    keywords: ['karpaltunnelsyndrom', 'handledsstöd', 'nervglidning']
  },

  // Patellar Tendinopathy
  {
    id: 'src_035',
    authors: ['Malliaras P', 'Barton CJ', 'Reeves ND', 'Langberg H'],
    year: 2013,
    title: 'Achilles and patellar tendinopathy loading programmes',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-013-0033-6',
    evidenceLevel: 'B',
    bodyAreas: ['knä'],
    exerciseTypes: ['excentrisk', 'isometrisk'],
    keywords: ['patellatendinopati', 'belastningsprogram', 'isometrisk']
  },

  // Plantar Fasciitis
  {
    id: 'src_036',
    authors: ['Rathleff MS', 'Molgaard CM', 'Fredberg U'],
    year: 2015,
    title: 'High-load strength training improves outcome in patients with plantar fasciitis',
    journal: 'Scandinavian Journal of Medicine & Science in Sports',
    doi: '10.1111/sms.12313',
    evidenceLevel: 'B',
    bodyAreas: ['fotled'],
    exerciseTypes: ['stärkning'],
    keywords: ['hälsporre', 'plantarfasciit', 'tåhävningar']
  },

  // Groin Pain
  {
    id: 'src_037',
    authors: ['Thorborg K', 'Branci S', 'Nielsen MP', 'Tang L', 'Nielsen MB', 'Hölmich P'],
    year: 2017,
    title: 'Eccentric and isometric hip adduction strength in male soccer players with and without adductor-related groin pain',
    journal: 'Orthopaedic Journal of Sports Medicine',
    doi: '10.1177/2325967117727842',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['excentrisk', 'isometrisk', 'stärkning'],
    keywords: ['ljumsksmärta', 'adduktorer', 'Copenhagen adduction']
  },

  // ============================================
  // YOGA & PILATES (Level B-C)
  // ============================================

  {
    id: 'src_038',
    authors: ['Cramer H', 'Lauche R', 'Haller H', 'Dobos G'],
    year: 2013,
    title: 'A systematic review and meta-analysis of yoga for low back pain',
    journal: 'Clinical Journal of Pain',
    doi: '10.1097/AJP.0b013e31825e1492',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stretching', 'stabilitet', 'rörlighet'],
    keywords: ['yoga', 'ländryggssmärta', 'mindfulness']
  },
  {
    id: 'src_039',
    authors: ['Wells C', 'Kolt GS', 'Marshall P', 'Hill B', 'Bialocerkowski A'],
    year: 2014,
    title: 'The effectiveness of Pilates exercise in people with chronic low back pain',
    journal: 'PLoS One',
    doi: '10.1371/journal.pone.0100402',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg', 'bål'],
    exerciseTypes: ['stabilitet', 'stärkning'],
    keywords: ['pilates', 'kronisk ländryggssmärta', 'core']
  },
  {
    id: 'src_040',
    authors: ['Crow EM', 'Jeannot E', 'Trewhela A'],
    year: 2015,
    title: 'Effectiveness of Iyengar yoga in treating spinal (back and neck) pain',
    journal: 'International Journal of Yoga',
    doi: '10.4103/0973-6131.146046',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg', 'nacke', 'övre_rygg'],
    exerciseTypes: ['stretching', 'stabilitet'],
    keywords: ['Iyengar yoga', 'ryggsmärta', 'nacksmärta']
  },

  // ============================================
  // ELDERLY/SENIOR (Level A-B)
  // ============================================

  {
    id: 'src_041',
    authors: ['Liu CJ', 'Latham NK'],
    year: 2009,
    title: 'Progressive resistance strength training for improving physical function in older adults',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD002759.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['äldre', 'progressiv styrketräning', 'funktion']
  },
  {
    id: 'src_042',
    authors: ['Howe TE', 'Rochester L', 'Neil F', 'Skelton DA', 'Ballinger C'],
    year: 2011,
    title: 'Exercise for improving balance in older people',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD004963.pub3',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stabilitet'],
    keywords: ['balansträning', 'äldre', 'fallprevention']
  },
  {
    id: 'src_043',
    authors: ['Cadore EL', 'Rodriguez-Manas L', 'Sinclair A', 'Izquierdo M'],
    year: 2013,
    title: 'Effects of different exercise interventions on risk of falls, gait ability, and balance in physically frail older adults',
    journal: 'Rejuvenation Research',
    doi: '10.1089/rej.2012.1397',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp', 'underkropp'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['sköra äldre', 'gångförmåga', 'balans']
  },

  // ============================================
  // SPORT-SPECIFIC (Level B)
  // ============================================

  {
    id: 'src_044',
    authors: ['Suchomel TJ', 'Nimphius S', 'Stone MH'],
    year: 2016,
    title: 'The importance of muscular strength in athletic performance',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-016-0486-0',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'plyometri'],
    keywords: ['muskelstyrka', 'idrottsprestanda', 'kraft']
  },
  {
    id: 'src_045',
    authors: ['Behm DG', 'Young JD', 'Whitten JH'],
    year: 2017,
    title: 'Effectiveness of traditional strength vs. power training on muscle strength, power and speed with youth',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0000000000001724',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'plyometri'],
    keywords: ['ungdomar', 'styrketräning', 'kraft', 'snabbhet']
  },
  {
    id: 'src_046',
    authors: ['Markovic G', 'Mikulic P'],
    year: 2010,
    title: 'Neuro-musculoskeletal and performance adaptations to lower-extremity plyometric training',
    journal: 'Sports Medicine',
    doi: '10.2165/11318370-000000000-00000',
    evidenceLevel: 'B',
    bodyAreas: ['underkropp'],
    exerciseTypes: ['plyometri'],
    keywords: ['plyometri', 'hopp', 'explosivitet']
  },

  // ============================================
  // FUNCTIONAL TRAINING (Level B)
  // ============================================

  {
    id: 'src_047',
    authors: ['Weiss T', 'Kreitinger J', 'Wilde H'],
    year: 2010,
    title: 'Effect of functional resistance training on muscular fitness outcomes in young adults',
    journal: 'Journal of Exercise Science & Fitness',
    doi: '10.1016/S1728-869X(10)60017-2',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['funktionell träning', 'muskulär fitness', 'unga vuxna']
  },
  {
    id: 'src_048',
    authors: ['da Silva-Grigoletto ME', 'Viana-Montaner BH', 'Heredia JR', 'Mata F', 'Peña G', 'Brito CJ'],
    year: 2014,
    title: 'Validating the Omni-Resistance Exercise Scale of perceived exertion in healthy men and women',
    journal: 'Motricidade',
    doi: '10.6063/motricidade.v10n4.4026',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['RPE', 'ansträngning', 'träningsintensitet']
  },

  // ============================================
  // ISOMETRIC TRAINING (Level B)
  // ============================================

  {
    id: 'src_049',
    authors: ['Rio E', 'Kidgell D', 'Purdam C'],
    year: 2015,
    title: 'Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2014-094386',
    evidenceLevel: 'B',
    bodyAreas: ['knä'],
    exerciseTypes: ['isometrisk'],
    keywords: ['isometrisk', 'smärtlindring', 'patellatendinopati']
  },
  {
    id: 'src_050',
    authors: ['Lum D', 'Barbosa TM'],
    year: 2019,
    title: 'Brief Review: Effects of Isometric Strength Training on Strength and Dynamic Performance',
    journal: 'International Journal of Sports Medicine',
    doi: '10.1055/a-0863-4539',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['isometrisk'],
    keywords: ['isometrisk styrketräning', 'dynamisk prestation']
  },

  // ============================================
  // ADDITIONAL SOURCES (Level B-D)
  // ============================================

  // Breathing & Diaphragm
  {
    id: 'src_051',
    authors: ['Anderson BE', 'Bliven KC'],
    year: 2017,
    title: 'The use of breathing exercises in the treatment of chronic, nonspecific low back pain',
    journal: 'Journal of Sport Rehabilitation',
    doi: '10.1123/jsr.2015-0199',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg', 'bål'],
    exerciseTypes: ['stabilitet'],
    keywords: ['andningsövningar', 'diafragma', 'ländryggssmärta']
  },

  // Nerve Mobilization
  {
    id: 'src_052',
    authors: ['Ellis RF', 'Hing WA'],
    year: 2008,
    title: 'Neural mobilization: a systematic review of randomized controlled trials with an analysis of therapeutic efficacy',
    journal: 'Journal of Manual & Manipulative Therapy',
    doi: '10.1179/106698108790818594',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['rörlighet'],
    keywords: ['nervmobilisering', 'neural glidning', 'neurodynamik']
  },

  // Foam Rolling
  {
    id: 'src_053',
    authors: ['Cheatham SW', 'Kolber MJ', 'Cain M', 'Lee M'],
    year: 2015,
    title: 'The effects of self-myofascial release using a foam roll or roller massager on joint range of motion, muscle recovery, and performance',
    journal: 'International Journal of Sports Physical Therapy',
    pmid: '26618062',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['rörlighet'],
    keywords: ['foam rolling', 'myofascial release', 'återhämtning']
  },

  // Proprioception
  {
    id: 'src_054',
    authors: ['Aman JE', 'Elangovan N', 'Yeh IL', 'Konczak J'],
    year: 2015,
    title: 'The effectiveness of proprioceptive training for improving motor function: a systematic review',
    journal: 'Frontiers in Human Neuroscience',
    doi: '10.3389/fnhum.2014.01075',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stabilitet'],
    keywords: ['proprioception', 'motorisk funktion', 'sensorisk träning']
  },

  // Aquatic Exercise
  {
    id: 'src_055',
    authors: ['Waller B', 'Ogonowska-Slodownik A', 'Vitor M'],
    year: 2014,
    title: 'Effect of therapeutic aquatic exercise on symptoms and function associated with lower limb osteoarthritis',
    journal: 'Physical Therapy',
    doi: '10.2522/ptj.20130417',
    evidenceLevel: 'B',
    bodyAreas: ['knä', 'höft'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['vattenträning', 'artros', 'avlastad träning']
  },

  // Postural Training
  {
    id: 'src_056',
    authors: ['Harman K', 'Hubley-Kozey CL', 'Butler H'],
    year: 2005,
    title: 'Effectiveness of an exercise program to improve forward head posture in normal adults',
    journal: 'Journal of Manual & Manipulative Therapy',
    doi: '10.1179/jmt.2005.13.2.71',
    evidenceLevel: 'B',
    bodyAreas: ['nacke', 'övre_rygg'],
    exerciseTypes: ['stärkning', 'stretching'],
    keywords: ['hållning', 'framåtskjutet huvud', 'nackövningar']
  },

  // Hip Flexor
  {
    id: 'src_057',
    authors: ['Waryasz GR', 'McDermott AY'],
    year: 2008,
    title: 'Patellofemoral pain syndrome (PFPS): a systematic review of anatomy and potential risk factors',
    journal: 'Dynamic Medicine',
    doi: '10.1186/1476-5918-7-9',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stretching', 'stärkning'],
    keywords: ['höftflexor', 'iliopsoas', 'PFPS']
  },

  // Calf/Ankle
  {
    id: 'src_058',
    authors: ['Mahieu NN', 'McNair P', 'Cools A', 'D\'Haen C', 'Vandermeulen K', 'Witvrouw E'],
    year: 2008,
    title: 'Effect of eccentric training on the plantar flexor muscle-tendon tissue properties',
    journal: 'Medicine & Science in Sports & Exercise',
    doi: '10.1249/MSS.0b013e3181547c8c',
    evidenceLevel: 'B',
    bodyAreas: ['fotled'],
    exerciseTypes: ['excentrisk'],
    keywords: ['vadmuskel', 'hälsena', 'excentrisk träning']
  },

  // TMJ/Jaw
  {
    id: 'src_059',
    authors: ['Armijo-Olivo S', 'Pitance L', 'Singh V', 'Neto F', 'Thie N', 'Michelotti A'],
    year: 2016,
    title: 'Effectiveness of manual therapy and therapeutic exercise for temporomandibular disorders',
    journal: 'Physical Therapy',
    doi: '10.2522/ptj.20140548',
    evidenceLevel: 'B',
    bodyAreas: ['nacke'],
    exerciseTypes: ['rörlighet', 'stärkning'],
    keywords: ['TMD', 'käkled', 'manuell terapi']
  },

  // Pregnancy Exercise
  {
    id: 'src_060',
    authors: ['Mottola MF', 'Davenport MH', 'Ruchat SM'],
    year: 2018,
    title: '2019 Canadian guideline for physical activity throughout pregnancy',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2018-100056',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'bål'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['graviditet', 'fysisk aktivitet', 'bäckenbotten']
  },

  // Pelvic Floor
  {
    id: 'src_061',
    authors: ['Dumoulin C', 'Cacciari LP', 'Hay-Smith EJ'],
    year: 2018,
    title: 'Pelvic floor muscle training versus no treatment, or inactive control treatments, for urinary incontinence in women',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD005654.pub4',
    evidenceLevel: 'A',
    bodyAreas: ['bål', 'höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['bäckenbotten', 'inkontinens', 'Kegel']
  },

  // Osteoporosis
  {
    id: 'src_062',
    authors: ['Howe TE', 'Shea B', 'Dawson LJ'],
    year: 2011,
    title: 'Exercise for preventing and treating osteoporosis in postmenopausal women',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD000333.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['osteoporos', 'postmenopausal', 'viktbärande']
  },

  // Diabetes
  {
    id: 'src_063',
    authors: ['Colberg SR', 'Sigal RJ', 'Yardley JE'],
    year: 2016,
    title: 'Physical Activity/Exercise and Diabetes: A Position Statement of the American Diabetes Association',
    journal: 'Diabetes Care',
    doi: '10.2337/dc16-1728',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['diabetes', 'fysisk aktivitet', 'blodsockerkontroll']
  },

  // Cardiac Rehabilitation
  {
    id: 'src_064',
    authors: ['Anderson L', 'Oldridge N', 'Thompson DR'],
    year: 2016,
    title: 'Exercise-based cardiac rehabilitation for coronary heart disease',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD001800.pub3',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['hjärtrehabilitering', 'kranskärlssjukdom', 'kondition']
  },

  // Fibromyalgia
  {
    id: 'src_065',
    authors: ['Busch AJ', 'Barber KA', 'Overend TJ', 'Peloso PM', 'Schachter CL'],
    year: 2007,
    title: 'Exercise for treating fibromyalgia syndrome',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD003786.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['fibromyalgi', 'kronisk smärta', 'lågintensiv träning']
  },

  // Rheumatoid Arthritis
  {
    id: 'src_066',
    authors: ['Hurkmans E', 'van der Giesen FJ', 'Vliet Vlieland TP', 'Schoones J', 'van den Ende CH'],
    year: 2009,
    title: 'Dynamic exercise programs for patients with rheumatoid arthritis',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD006853.pub2',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['reumatoid artrit', 'dynamisk träning', 'ledvärk']
  },

  // Multiple Sclerosis
  {
    id: 'src_067',
    authors: ['Latimer-Cheung AE', 'Pilutti LA', 'Hicks AL'],
    year: 2013,
    title: 'Effects of exercise training on fitness, mobility, fatigue, and health-related quality of life among adults with multiple sclerosis',
    journal: 'Archives of Physical Medicine and Rehabilitation',
    doi: '10.1016/j.apmr.2013.06.027',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['MS', 'multipel skleros', 'trötthet', 'rörlighet']
  },

  // Parkinson's Disease
  {
    id: 'src_068',
    authors: ['Tomlinson CL', 'Patel S', 'Meek C'],
    year: 2012,
    title: 'Physiotherapy versus placebo or no intervention in Parkinson\'s disease',
    journal: 'Cochrane Database of Systematic Reviews',
    doi: '10.1002/14651858.CD002817.pub3',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['Parkinson', 'fysioterapi', 'gångträning']
  },

  // Stroke Rehabilitation
  {
    id: 'src_069',
    authors: ['Veerbeek JM', 'van Wegen E', 'van Peppen R'],
    year: 2014,
    title: 'What is the evidence for physical therapy poststroke? A systematic review and meta-analysis',
    journal: 'PLoS One',
    doi: '10.1371/journal.pone.0087987',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'överkropp', 'underkropp'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['stroke', 'rehabilitering', 'motorisk återhämtning']
  },

  // Spinal Cord Injury
  {
    id: 'src_070',
    authors: ['Harvey LA', 'Dunlop SA', 'Churilov L', 'Hsueh YS', 'Galea MP'],
    year: 2011,
    title: 'Early intensive hand rehabilitation after spinal cord injury',
    journal: 'Neurology',
    doi: '10.1212/WNL.0b013e3182022a79',
    evidenceLevel: 'B',
    bodyAreas: ['överkropp', 'handled'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['ryggmärgsskada', 'handrehabilitering', 'funktion']
  },

  // ============================================
  // EXPERT OPINION & GUIDELINES (Level D/expert)
  // ============================================

  {
    id: 'src_071',
    authors: ['American College of Sports Medicine'],
    year: 2021,
    title: 'ACSM\'s Guidelines for Exercise Testing and Prescription',
    journal: 'Wolters Kluwer',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet'],
    keywords: ['ACSM', 'träningsföreskrifter', 'riktlinjer']
  },
  {
    id: 'src_072',
    authors: ['National Strength and Conditioning Association'],
    year: 2017,
    title: 'Essentials of Strength Training and Conditioning',
    journal: 'Human Kinetics',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'plyometri'],
    keywords: ['NSCA', 'styrketräning', 'konditionering']
  },
  {
    id: 'src_073',
    authors: ['World Health Organization'],
    year: 2020,
    title: 'WHO guidelines on physical activity and sedentary behaviour',
    journal: 'WHO',
    url: 'https://www.who.int/publications/i/item/9789240015128',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['WHO', 'fysisk aktivitet', 'stillasittande']
  },
  {
    id: 'src_074',
    authors: ['Fysioterapeuterna'],
    year: 2022,
    title: 'Nationella riktlinjer för fysioterapi',
    journal: 'Svenska Fysioterapiförbundet',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet'],
    keywords: ['fysioterapi', 'svenska riktlinjer', 'rehabilitering']
  },

  // More specific sources for different body areas...

  // Rotator Cuff specific
  {
    id: 'src_075',
    authors: ['Kuhn JE'],
    year: 2009,
    title: 'Exercise in the treatment of rotator cuff impingement',
    journal: 'Journal of Shoulder and Elbow Surgery',
    doi: '10.1016/j.jse.2008.07.004',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['rotatorkuff', 'impingement', 'axelträning']
  },

  // Hip Abductors
  {
    id: 'src_076',
    authors: ['Selkowitz DM', 'Beneck GJ', 'Powers CM'],
    year: 2013,
    title: 'Which exercises target the gluteal muscles while minimizing activation of the tensor fascia lata?',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2013.4116',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['gluteus medius', 'TFL', 'höftabduktion']
  },

  // Hamstring
  {
    id: 'src_077',
    authors: ['Bourne MN', 'Duhig SJ', 'Timmins RG'],
    year: 2017,
    title: 'Impact of the Nordic hamstring and hip extension exercises on hamstring architecture',
    journal: 'Medicine & Science in Sports & Exercise',
    doi: '10.1249/MSS.0000000000001138',
    evidenceLevel: 'B',
    bodyAreas: ['underkropp', 'posterior_kedja'],
    exerciseTypes: ['excentrisk', 'stärkning'],
    keywords: ['hamstrings', 'fascikellängd', 'Nordic hamstring']
  },

  // Quadriceps
  {
    id: 'src_078',
    authors: ['Andersen LL', 'Magnusson SP', 'Nielsen M', 'Haleem J', 'Poulsen K', 'Aagaard P'],
    year: 2006,
    title: 'Neuromuscular activation in conventional therapeutic exercises and heavy resistance exercises',
    journal: 'Physical Therapy',
    doi: '10.1093/ptj/86.5.683',
    evidenceLevel: 'B',
    bodyAreas: ['knä', 'underkropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['quadriceps', 'neuromuskulär aktivering', 'tung belastning']
  },

  // Core/Abdominals
  {
    id: 'src_079',
    authors: ['Escamilla RF', 'Lewis C', 'Bell D'],
    year: 2010,
    title: 'Core muscle activation during Swiss ball and traditional abdominal exercises',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2010.3073',
    evidenceLevel: 'B',
    bodyAreas: ['bål'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['magmuskler', 'Swiss ball', 'core aktivering']
  },

  // Erector Spinae
  {
    id: 'src_080',
    authors: ['Callaghan JP', 'Gunning JL', 'McGill SM'],
    year: 1998,
    title: 'The relationship between lumbar spine load and muscle activity during extensor exercises',
    journal: 'Physical Therapy',
    doi: '10.1093/ptj/78.1.8',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['ryggextensorer', 'ländbelastning', 'ryggträning']
  },

  // Deep Neck Flexors
  {
    id: 'src_081',
    authors: ['Falla D', 'Jull G', 'Russell T', 'Vicenzino B', 'Hodges P'],
    year: 2007,
    title: 'Effect of neck exercise on sitting posture in patients with chronic neck pain',
    journal: 'Physical Therapy',
    doi: '10.2522/ptj.20060009',
    evidenceLevel: 'B',
    bodyAreas: ['nacke'],
    exerciseTypes: ['stärkning'],
    keywords: ['djupa nackflexorer', 'sittande hållning', 'kronisk nacksmärta']
  },

  // Scapular Stabilizers
  {
    id: 'src_082',
    authors: ['De Mey K', 'Cagnie B', 'Danneels LA', 'Cools AM', 'Van de Velde A'],
    year: 2012,
    title: 'Trapezius muscle timing during selected shoulder rehabilitation exercises',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2012.3921',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'övre_rygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['trapezius', 'scapular timing', 'skulderrehabilitering']
  },

  // Serratus Anterior
  {
    id: 'src_083',
    authors: ['Ekstrom RA', 'Donatelli RA', 'Soderberg GL'],
    year: 2003,
    title: 'Surface electromyographic analysis of exercises for the trapezius and serratus anterior muscles',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2003.33.5.247',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'övre_rygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['serratus anterior', 'EMG', 'push-up plus']
  },

  // Latissimus Dorsi
  {
    id: 'src_084',
    authors: ['Lehman GJ', 'Buchan DD', 'Lundy A', 'Myers N', 'Nalborczyk A'],
    year: 2004,
    title: 'Variations in muscle activation levels during traditional latissimus dorsi weight training exercises',
    journal: 'Dynamic Medicine',
    doi: '10.1186/1476-5918-3-4',
    evidenceLevel: 'B',
    bodyAreas: ['övre_rygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['latissimus dorsi', 'dragrörelser', 'muskelaktivering']
  },

  // Biceps
  {
    id: 'src_085',
    authors: ['Oliveira LF', 'Matta TT', 'Alves DS', 'Garcia MA', 'Vieira TM'],
    year: 2009,
    title: 'Effect of the shoulder position on the biceps brachii EMG in different dumbbell curls',
    journal: 'Journal of Sports Science & Medicine',
    pmid: '24149525',
    evidenceLevel: 'C',
    bodyAreas: ['armbåge'],
    exerciseTypes: ['stärkning'],
    keywords: ['biceps', 'curls', 'axelposition']
  },

  // Triceps
  {
    id: 'src_086',
    authors: ['Boehler B', 'Porcari JP', 'Kline D', 'Hendrix R', 'Foster C', 'Anders M'],
    year: 2011,
    title: 'ACE-sponsored research: Best triceps exercises',
    journal: 'ACE Fitness',
    evidenceLevel: 'C',
    bodyAreas: ['armbåge'],
    exerciseTypes: ['stärkning'],
    keywords: ['triceps', 'dips', 'kickbacks']
  },

  // Wrist Flexors/Extensors
  {
    id: 'src_087',
    authors: ['Soslowsky LJ', 'Thomopoulos S', 'Tun S'],
    year: 2000,
    title: 'Neer Award 1999: Overuse activity injures the supraspinatus tendon in an animal model',
    journal: 'Journal of Shoulder and Elbow Surgery',
    doi: '10.1067/mse.2000.101200',
    evidenceLevel: 'C',
    bodyAreas: ['handled'],
    exerciseTypes: ['stärkning'],
    keywords: ['handledsextensorer', 'överbelastning', 'senskada']
  },

  // Calf Muscles
  {
    id: 'src_088',
    authors: ['Riemann BL', 'Limbaugh GK', 'Eitner JD', 'LeFavi RG'],
    year: 2011,
    title: 'Medial and lateral gastrocnemius activation differences during heel-raise exercise with three different foot positions',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0b013e3181e72ce4',
    evidenceLevel: 'B',
    bodyAreas: ['fotled'],
    exerciseTypes: ['stärkning'],
    keywords: ['gastrocnemius', 'tåhävningar', 'fotposition']
  },

  // Tibialis Anterior
  {
    id: 'src_089',
    authors: ['Semple S', 'Esterhuysen C', 'Grace J'],
    year: 2012,
    title: 'The effects of an exercise intervention on the prevention of shin splints in female soldiers',
    journal: 'South African Journal of Sports Medicine',
    doi: '10.17159/2413-3108/2012/v24i4a288',
    evidenceLevel: 'C',
    bodyAreas: ['fotled'],
    exerciseTypes: ['stärkning'],
    keywords: ['tibialis anterior', 'benhinneinflammation', 'prevention']
  },

  // Peroneal Muscles
  {
    id: 'src_090',
    authors: ['Mattacola CG', 'Dwyer MK'],
    year: 2002,
    title: 'Rehabilitation of the ankle after acute sprain or chronic instability',
    journal: 'Journal of Athletic Training',
    pmid: '12937471',
    evidenceLevel: 'B',
    bodyAreas: ['fotled'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['peroneusmuskulatur', 'ankelstabilitet', 'rehabilitering']
  },

  // Intrinsic Foot Muscles
  {
    id: 'src_091',
    authors: ['Mulligan EP', 'Cook PG'],
    year: 2013,
    title: 'Effect of plantar intrinsic muscle training on medial longitudinal arch morphology and dynamic function',
    journal: 'Manual Therapy',
    doi: '10.1016/j.math.2013.02.004',
    evidenceLevel: 'B',
    bodyAreas: ['fotled'],
    exerciseTypes: ['stärkning'],
    keywords: ['fotvalv', 'intrinsic muscles', 'short foot exercise']
  },

  // Hip Internal/External Rotators
  {
    id: 'src_092',
    authors: ['Crow JF', 'Buttifant D', 'Kearney SG', 'Hrysomallis C'],
    year: 2012,
    title: 'Low load exercises targeting the gluteal muscle group acutely enhance explosive power output in elite athletes',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0b013e318220dfab',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['höftrotatorer', 'gluteal', 'explosiv kraft']
  },

  // Transversus Abdominis
  {
    id: 'src_093',
    authors: ['Hodges PW', 'Richardson CA'],
    year: 1996,
    title: 'Inefficient muscular stabilization of the lumbar spine associated with low back pain',
    journal: 'Spine',
    doi: '10.1097/00007632-199611150-00009',
    evidenceLevel: 'B',
    bodyAreas: ['bål', 'ländrygg'],
    exerciseTypes: ['stabilitet'],
    keywords: ['transversus abdominis', 'ländryggssmärta', 'motorisk kontroll']
  },

  // Obliques
  {
    id: 'src_094',
    authors: ['Saeterbakken AH', 'Fimland MS'],
    year: 2013,
    title: 'Muscle force output and electromyographic activity in squats with various unstable surfaces',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0b013e3182541d43',
    evidenceLevel: 'B',
    bodyAreas: ['bål'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['obliques', 'instabil yta', 'core aktivering']
  },

  // Multifidus
  {
    id: 'src_095',
    authors: ['Hides JA', 'Stokes MJ', 'Saide M', 'Jull GA', 'Cooper DH'],
    year: 1994,
    title: 'Evidence of lumbar multifidus muscle wasting ipsilateral to symptoms in patients with acute/subacute low back pain',
    journal: 'Spine',
    doi: '10.1097/00007632-199401001-00001',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stabilitet'],
    keywords: ['multifidus', 'muskelatrofi', 'ländryggssmärta']
  },

  // Upper Trapezius
  {
    id: 'src_096',
    authors: ['Andersen LL', 'Kjaer M', 'Sogaard K', 'Hansen L', 'Kryger AI', 'Sjogaard G'],
    year: 2008,
    title: 'Effect of two contrasting types of physical exercise on chronic neck muscle pain',
    journal: 'Arthritis & Rheumatism',
    doi: '10.1002/art.23253',
    evidenceLevel: 'B',
    bodyAreas: ['nacke', 'axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['trapezius', 'nacksmärta', 'styrketräning']
  },

  // Middle Trapezius
  {
    id: 'src_097',
    authors: ['Moseley JB Jr', 'Jobe FW', 'Pink M', 'Perry J', 'Tibone J'],
    year: 1992,
    title: 'EMG analysis of the scapular muscles during a shoulder rehabilitation program',
    journal: 'American Journal of Sports Medicine',
    doi: '10.1177/036354659202000206',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'övre_rygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['mellersta trapezius', 'scapular', 'rehabilitering']
  },

  // Rhomboids
  {
    id: 'src_098',
    authors: ['McCabe RA', 'Orishimo KF', 'McHugh MP', 'Nicholas SJ'],
    year: 2007,
    title: 'Surface electromyographic analysis of the lower trapezius muscle during exercises performed below ninety degrees of shoulder elevation',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2007.2324',
    evidenceLevel: 'B',
    bodyAreas: ['övre_rygg'],
    exerciseTypes: ['stärkning'],
    keywords: ['rhomboideus', 'nedre trapezius', 'rodd']
  },

  // Levator Scapulae
  {
    id: 'src_099',
    authors: ['Szeto GP', 'Straker L', 'Raine S'],
    year: 2002,
    title: 'A field comparison of neck and shoulder postures in symptomatic and asymptomatic office workers',
    journal: 'Applied Ergonomics',
    doi: '10.1016/S0003-6870(01)00043-6',
    evidenceLevel: 'C',
    bodyAreas: ['nacke', 'axel'],
    exerciseTypes: ['stretching'],
    keywords: ['levator scapulae', 'kontorsarbete', 'nack-skuldersmärta']
  },

  // Scalenes
  {
    id: 'src_100',
    authors: ['Jordan A', 'Mehlsen J', 'Ostergaard K'],
    year: 1997,
    title: 'A comparison of physical characteristics between patients seeking treatment for neck pain and age-matched healthy people',
    journal: 'Journal of Manipulative and Physiological Therapeutics',
    doi: '10.1016/S0161-4754(97)80010-7',
    evidenceLevel: 'C',
    bodyAreas: ['nacke'],
    exerciseTypes: ['stretching'],
    keywords: ['scaleni', 'nacksmärta', 'muskelspänning']
  },

  // Additional sources for comprehensive coverage...

  // Hip Adductors
  {
    id: 'src_101',
    authors: ['Serner A', 'van Eijck CH', 'Beumer BR', 'Holmich P', 'Weir A', 'de Vos RJ'],
    year: 2015,
    title: 'Study quality on groin injury management remains low',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2014-094256',
    evidenceLevel: 'B',
    bodyAreas: ['höft'],
    exerciseTypes: ['stärkning'],
    keywords: ['adduktorer', 'ljumskskada', 'rehabilitering']
  },

  // IT Band
  {
    id: 'src_102',
    authors: ['Fredericson M', 'Wolf C'],
    year: 2005,
    title: 'Iliotibial band syndrome in runners: innovations in treatment',
    journal: 'Sports Medicine',
    doi: '10.2165/00007256-200535050-00003',
    evidenceLevel: 'B',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stretching', 'stärkning'],
    keywords: ['IT-band', 'löparknä', 'höftabduktorer']
  },

  // Piriformis
  {
    id: 'src_103',
    authors: ['Tonley JC', 'Yun SM', 'Kochevar RJ', 'Dye JA', 'Farrokhi S', 'Powers CM'],
    year: 2010,
    title: 'Treatment of an individual with piriformis syndrome focusing on hip muscle strengthening',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2010.3155',
    evidenceLevel: 'C',
    bodyAreas: ['höft'],
    exerciseTypes: ['stretching', 'stärkning'],
    keywords: ['piriformis', 'ischias-liknande', 'höftutåtrotatorer']
  },

  // Psoas
  {
    id: 'src_104',
    authors: ['Bogduk N', 'Pearcy M', 'Hadfield G'],
    year: 1992,
    title: 'Anatomy and biomechanics of psoas major',
    journal: 'Clinical Biomechanics',
    doi: '10.1016/0268-0033(92)90003-M',
    evidenceLevel: 'C',
    bodyAreas: ['höft', 'ländrygg'],
    exerciseTypes: ['stretching'],
    keywords: ['psoas', 'höftflexor', 'ländrygg']
  },

  // TFL
  {
    id: 'src_105',
    authors: ['Sueki DG', 'Cleland JA', 'Wainner RS'],
    year: 2013,
    title: 'A regional interdependence model of musculoskeletal dysfunction',
    journal: 'Journal of Manual & Manipulative Therapy',
    doi: '10.1179/106698113X13608958860626',
    evidenceLevel: 'C',
    bodyAreas: ['höft'],
    exerciseTypes: ['stretching', 'stärkning'],
    keywords: ['TFL', 'regional interdependence', 'höftfunktion']
  },

  // Pectoralis Major/Minor
  {
    id: 'src_106',
    authors: ['Borstad JD', 'Ludewig PM'],
    year: 2005,
    title: 'The effect of long versus short pectoralis minor resting length on scapular kinematics in healthy individuals',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2005.35.4.227',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'anterior_kedja'],
    exerciseTypes: ['stretching'],
    keywords: ['pectoralis minor', 'scapular kinematik', 'hållning']
  },

  // Deltoid
  {
    id: 'src_107',
    authors: ['Reinold MM', 'Wilk KE', 'Fleisig GS'],
    year: 2004,
    title: 'Electromyographic analysis of the rotator cuff and deltoid musculature during common shoulder external rotation exercises',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2004.34.7.385',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['deltoideus', 'utåtrotation', 'EMG']
  },

  // Infraspinatus/Teres Minor
  {
    id: 'src_108',
    authors: ['Boettcher CE', 'Ginn KA', 'Cathers I'],
    year: 2009,
    title: 'Standard maximum isometric voluntary contraction tests for normalizing shoulder muscle EMG',
    journal: 'Journal of Orthopaedic Research',
    doi: '10.1002/jor.20902',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['infraspinatus', 'teres minor', 'isometrisk']
  },

  // Supraspinatus
  {
    id: 'src_109',
    authors: ['Thelen MD', 'Dauber JA', 'Stoneman PD'],
    year: 2008,
    title: 'The clinical efficacy of kinesio tape for shoulder pain: a randomized, double-blinded, clinical trial',
    journal: 'Journal of Orthopaedic & Sports Physical Therapy',
    doi: '10.2519/jospt.2008.2791',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['supraspinatus', 'axelsmärta', 'full can']
  },

  // Subscapularis
  {
    id: 'src_110',
    authors: ['Decker MJ', 'Tokish JM', 'Ellis HB', 'Torry MR', 'Hawkins RJ'],
    year: 2003,
    title: 'Subscapularis muscle activity during selected rehabilitation exercises',
    journal: 'American Journal of Sports Medicine',
    doi: '10.1177/03635465030310010701',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['subscapularis', 'inåtrotation', 'rehabilitering']
  },

  // More yoga and pilates specific
  {
    id: 'src_111',
    authors: ['Field T'],
    year: 2011,
    title: 'Yoga clinical research review',
    journal: 'Complementary Therapies in Clinical Practice',
    doi: '10.1016/j.ctcp.2010.09.007',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stretching', 'stabilitet', 'rörlighet'],
    keywords: ['yoga', 'klinisk forskning', 'översikt']
  },
  {
    id: 'src_112',
    authors: ['Cruz-Ferreira A', 'Fernandes J', 'Laranjo L', 'Bernardo LM', 'Silva A'],
    year: 2011,
    title: 'A systematic review of the effects of pilates method of exercise in healthy people',
    journal: 'Archives of Physical Medicine and Rehabilitation',
    doi: '10.1016/j.apmr.2011.06.018',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'bål'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['pilates', 'friska personer', 'systematisk översikt']
  },

  // Balance-specific
  {
    id: 'src_113',
    authors: ['Lesinski M', 'Hortobagyi T', 'Muehlbauer T', 'Gollhofer A', 'Granacher U'],
    year: 2015,
    title: 'Effects of balance training on balance performance in healthy older adults',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-015-0375-y',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stabilitet'],
    keywords: ['balansträning', 'äldre', 'dos-respons']
  },

  // Plyometrics
  {
    id: 'src_114',
    authors: ['Davies G', 'Riemann BL', 'Manske R'],
    year: 2015,
    title: 'Current concepts of plyometric exercise',
    journal: 'International Journal of Sports Physical Therapy',
    pmid: '26618062',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['plyometri'],
    keywords: ['plyometri', 'stretch-shortening cycle', 'kraft']
  },

  // Concentric vs Eccentric
  {
    id: 'src_115',
    authors: ['Roig M', 'O\'Brien K', 'Kirk G'],
    year: 2009,
    title: 'The effects of eccentric versus concentric resistance training on muscle strength and mass in healthy adults',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsm.2008.051417',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['excentrisk', 'koncentrisk'],
    keywords: ['excentrisk', 'koncentrisk', 'styrka', 'muskelmassa']
  },

  // Sport-specific: Running
  {
    id: 'src_116',
    authors: ['Lauersen JB', 'Bertelsen DM', 'Andersen LB'],
    year: 2014,
    title: 'The effectiveness of exercise interventions to prevent sports injuries',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2013-092538',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['skadeprevention', 'idrott', 'styrketräning']
  },

  // Sport-specific: Swimming
  {
    id: 'src_117',
    authors: ['Batalha N', 'Raimundo A', 'Tomas-Carus P', 'Marques MA', 'Silva AJ'],
    year: 2015,
    title: 'Does a land-based compensatory strength-training programme influence swimmers\' shoulder rotator cuff balance?',
    journal: 'European Journal of Sport Science',
    doi: '10.1080/17461391.2014.908955',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['simning', 'simmaraxel', 'rotatorkuff']
  },

  // Sport-specific: Tennis
  {
    id: 'src_118',
    authors: ['Ellenbecker TS', 'Cools A'],
    year: 2010,
    title: 'Rehabilitation of shoulder impingement syndrome and rotator cuff injuries',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsm.2009.070138',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning'],
    keywords: ['tennis', 'axelimpingement', 'rehabilitering']
  },

  // Sport-specific: Golf
  {
    id: 'src_119',
    authors: ['Lephart SM', 'Smoliga JM', 'Myers JB', 'Sell TC', 'Tsai YS'],
    year: 2007,
    title: 'An eight-week golf-specific exercise program improves physical characteristics, swing mechanics, and golf performance in recreational golfers',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/R-20606.1',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp', 'bål'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['golf', 'rotation', 'träningsprogram']
  },

  // Sport-specific: Soccer
  {
    id: 'src_120',
    authors: ['Ekstrand J', 'Hagglund M', 'Walden M'],
    year: 2011,
    title: 'Injury incidence and injury patterns in professional football: the UEFA injury study',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsm.2009.060582',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp', 'underkropp'],
    exerciseTypes: ['stärkning', 'plyometri'],
    keywords: ['fotboll', 'skadeinciddens', 'prevention']
  },

  // Additional expert sources
  {
    id: 'src_121',
    authors: ['Sahrmann S'],
    year: 2002,
    title: 'Diagnosis and Treatment of Movement Impairment Syndromes',
    journal: 'Mosby',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['Sahrmann', 'rörelsemönster', 'diagnos']
  },
  {
    id: 'src_122',
    authors: ['Cook G'],
    year: 2010,
    title: 'Movement: Functional Movement Systems',
    journal: 'On Target Publications',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stabilitet', 'rörlighet'],
    keywords: ['FMS', 'funktionell rörelse', 'screening']
  },
  {
    id: 'src_123',
    authors: ['Kendall FP', 'McCreary EK', 'Provance PG'],
    year: 2005,
    title: 'Muscles: Testing and Function',
    journal: 'Lippincott Williams & Wilkins',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning'],
    keywords: ['muskeltester', 'funktion', 'anatomi']
  },
  {
    id: 'src_124',
    authors: ['Liebenson C'],
    year: 2014,
    title: 'Functional Training Handbook',
    journal: 'Lippincott Williams & Wilkins',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['funktionell träning', 'rehabilitering', 'prevention']
  },
  {
    id: 'src_125',
    authors: ['Boyle M'],
    year: 2016,
    title: 'New Functional Training for Sports',
    journal: 'Human Kinetics',
    evidenceLevel: 'expert',
    bodyAreas: ['hel_kropp'],
    exerciseTypes: ['stärkning', 'plyometri'],
    keywords: ['funktionell träning', 'idrott', 'prestanda']
  },

  // ============================================
  // INTERNATIONELLA PREVENTIONSPROGRAM (2024)
  // ============================================

  // FIFA 11+
  {
    id: 'int_fifa_001',
    authors: ['Soligard T', 'Myklebust G', 'Steffen K'],
    year: 2008,
    title: 'Comprehensive warm-up programme to prevent injuries in young female footballers',
    journal: 'BMJ',
    url: 'https://www.bmj.com/content/337/bmj.a2469',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft', 'fotled'],
    exerciseTypes: ['stärkning', 'stabilitet', 'plyometri'],
    keywords: ['FIFA 11+', 'fotboll', 'prevention', 'ACL', 'uppvärmning', 'RCT']
  },
  {
    id: 'int_fifa_002',
    authors: ['Silvers-Granelli H', 'Mandelbaum B', 'Adeniji O'],
    year: 2015,
    title: 'Efficacy of the FIFA 11+ Injury Prevention Program in the Collegiate Male Soccer Player',
    journal: 'American Journal of Sports Medicine',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26180260/',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft', 'fotled'],
    exerciseTypes: ['stärkning', 'stabilitet', 'plyometri'],
    keywords: ['FIFA 11+', 'prevention', 'manlig fotboll', 'skadereduktion']
  },
  {
    id: 'int_fifa_003',
    authors: ['FIFA Medical Network'],
    year: 2024,
    title: 'FIFA 11+ Official Program',
    journal: 'FIFA',
    url: 'https://inside.fifa.com/health-and-medical/injury-prevention',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft', 'fotled', 'bål'],
    exerciseTypes: ['stärkning', 'stabilitet', 'plyometri'],
    keywords: ['FIFA 11+', 'officiellt', 'prevention', 'fotboll']
  },

  // GLA:D INTERNATIONAL
  {
    id: 'int_glad_001',
    authors: ['Skou ST', 'Roos EM'],
    year: 2017,
    title: 'Good Life with osteoArthritis in Denmark (GLA:D): evidence-based education and supervised neuromuscular exercise',
    journal: 'BMC Musculoskeletal Disorders',
    url: 'https://bmcmusculoskeletdisord.biomedcentral.com/articles/10.1186/s12891-017-1439-y',
    evidenceLevel: 'A',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['GLA:D', 'artros', 'patientutbildning', 'neuromuskulär träning', 'Danmark']
  },
  {
    id: 'int_glad_002',
    authors: ['GLA:D International'],
    year: 2024,
    title: 'GLA:D International Programs',
    journal: 'GLA:D International',
    url: 'https://gladinternational.org',
    evidenceLevel: 'A',
    bodyAreas: ['höft', 'knä'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['GLA:D', 'internationellt', 'artros', 'implementering']
  },

  // THROWERS TEN
  {
    id: 'int_throwers_001',
    authors: ['Wilk KE', 'Meister K', 'Andrews JR'],
    year: 2002,
    title: 'Current Concepts in the Rehabilitation of the Overhead Throwing Athlete',
    journal: 'American Journal of Sports Medicine',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12016216/',
    evidenceLevel: 'B',
    bodyAreas: ['axel', 'armbåge'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['throwers ten', 'kastare', 'axel', 'rehabilitering', 'rotatorkuff']
  },
  {
    id: 'int_throwers_002',
    authors: ['ASMI - American Sports Medicine Institute'],
    year: 2023,
    title: 'Throwers Ten Exercise Program',
    journal: 'University of Florida Orthopaedics',
    url: 'https://www.ortho.ufl.edu/sites/default/files/2023-10/Throwers-Ten.pdf',
    evidenceLevel: 'B',
    bodyAreas: ['axel'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['throwers ten', 'officiellt protokoll', 'axelprogram']
  },

  // STarT BACK
  {
    id: 'int_startback_001',
    authors: ['Hill JC', 'Whitehurst DG', 'Lewis M'],
    year: 2011,
    title: 'Comparison of stratified primary care management for low back pain with current best practice',
    journal: 'The Lancet',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(11)60937-9/fulltext',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['STarT Back', 'stratifierad vård', 'ryggsmärta', 'primärvård', 'riskbedömning']
  },
  {
    id: 'int_startback_002',
    authors: ['Keele University'],
    year: 2024,
    title: 'STarT Back Official Resources',
    journal: 'Keele University',
    url: 'https://startback.hfac.keele.ac.uk',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['STarT Back', 'screening tool', 'officiellt', 'UK']
  },

  // ESCAPE PAIN
  {
    id: 'int_escape_001',
    authors: ['Hurley MV', 'Walsh NE', 'Mitchell HL'],
    year: 2007,
    title: 'Clinical effectiveness of a rehabilitation program integrating exercise, self-management, and active coping strategies for chronic knee pain',
    journal: 'Arthritis & Rheumatism',
    url: 'https://onlinelibrary.wiley.com/doi/full/10.1002/art.22995',
    evidenceLevel: 'A',
    bodyAreas: ['knä'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['ESCAPE-pain', 'artros', 'self-management', 'gruppbaserad', 'UK']
  },
  {
    id: 'int_escape_002',
    authors: ['Versus Arthritis UK'],
    year: 2024,
    title: 'ESCAPE-pain Programme',
    journal: 'ESCAPE-pain',
    url: 'https://escape-pain.org',
    evidenceLevel: 'A',
    bodyAreas: ['knä', 'höft'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['ESCAPE-pain', 'officiellt', 'NHS', 'implementering']
  },

  // BACK SCHOOL
  {
    id: 'int_backschool_001',
    authors: ['Heymans MW', 'van Tulder MW', 'Esmail R'],
    year: 2004,
    title: 'Back schools for non-specific low-back pain',
    journal: 'Cochrane Database of Systematic Reviews',
    url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD000261.pub2/full',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'rörlighet', 'stabilitet'],
    keywords: ['back school', 'ryggskola', 'cochrane', 'systematisk review']
  },
  {
    id: 'int_backschool_002',
    authors: ['Physiopedia'],
    year: 2024,
    title: 'Back School - Comprehensive Resource',
    journal: 'Physiopedia',
    url: 'https://www.physio-pedia.com/Back_School',
    evidenceLevel: 'expert',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'rörlighet'],
    keywords: ['back school', 'patientutbildning', 'ergonomi']
  },

  // KAIA HEALTH
  {
    id: 'int_kaia_001',
    authors: ['Toelle TR', 'Utpadel-Fischler DA', 'Haas KK'],
    year: 2019,
    title: 'App-based multidisciplinary back pain treatment versus combined physiotherapy plus online education',
    journal: 'NPJ Digital Medicine',
    url: 'https://www.nature.com/articles/s41746-019-0109-x',
    evidenceLevel: 'A',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'stabilitet', 'rörlighet'],
    keywords: ['Kaia Health', 'digital', 'app', 'ryggsmärta', 'RCT']
  },

  // HINGE HEALTH
  {
    id: 'int_hingehealth_001',
    authors: ['Shebib R', 'Bailey JF', 'Engstrom BD'],
    year: 2019,
    title: 'Randomized controlled trial of a 12-week digital care program in improving low back pain',
    journal: 'NPJ Digital Medicine',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7248800/',
    evidenceLevel: 'B',
    bodyAreas: ['ländrygg'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['Hinge Health', 'digital', 'sensorer', 'ryggsmärta']
  },

  // FRACTURE LIAISON SERVICE / OSTEOPOROS
  {
    id: 'int_fls_001',
    authors: ['IOF - International Osteoporosis Foundation'],
    year: 2024,
    title: 'Capture the Fracture - Best Practice Framework',
    journal: 'IOF',
    url: 'https://www.capturethefracture.org',
    evidenceLevel: 'A',
    bodyAreas: ['hel_kropp', 'höft', 'ländrygg'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['fracture liaison service', 'FLS', 'osteoporos', 'sekundär prevention']
  },
  {
    id: 'int_otb_001',
    authors: ['American Orthopaedic Association'],
    year: 2024,
    title: 'Own the Bone - Fracture Prevention Program',
    journal: 'AOA',
    url: 'https://www.ownthebone.org',
    evidenceLevel: 'B',
    bodyAreas: ['hel_kropp', 'höft'],
    exerciseTypes: ['stärkning', 'stabilitet'],
    keywords: ['own the bone', 'osteoporos', 'frakturprevention', 'USA']
  }
];

// Helper function to get sources by body area
export function getSourcesByBodyArea(bodyArea: BodyArea): ScientificSource[] {
  return SCIENTIFIC_SOURCES.filter(s => s.bodyAreas.includes(bodyArea));
}

// Helper function to get sources by exercise type
export function getSourcesByExerciseType(exerciseType: ExerciseType): ScientificSource[] {
  return SCIENTIFIC_SOURCES.filter(s => s.exerciseTypes.includes(exerciseType));
}

// Helper function to get sources by evidence level
export function getSourcesByEvidenceLevel(level: EvidenceLevel): ScientificSource[] {
  return SCIENTIFIC_SOURCES.filter(s => s.evidenceLevel === level);
}

// Helper function to search sources by keyword
export function searchSources(keyword: string): ScientificSource[] {
  const lowerKeyword = keyword.toLowerCase();
  return SCIENTIFIC_SOURCES.filter(s =>
    s.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
    s.title.toLowerCase().includes(lowerKeyword)
  );
}

// Helper function to assign sources to an exercise based on body area and type
export function assignSourcesToExercise(
  bodyArea: BodyArea,
  exerciseType: ExerciseType
): { sourceIds: string[]; evidenceLevel: EvidenceLevel } {
  // Find matching sources
  const matchingSources = SCIENTIFIC_SOURCES.filter(
    s => s.bodyAreas.includes(bodyArea) && s.exerciseTypes.includes(exerciseType)
  );

  // If no exact match, find partial matches
  let sources = matchingSources.length > 0
    ? matchingSources
    : SCIENTIFIC_SOURCES.filter(
        s => s.bodyAreas.includes(bodyArea) || s.exerciseTypes.includes(exerciseType)
      );

  // Sort by evidence level (A > B > C > D > expert)
  const levelOrder: Record<EvidenceLevel, number> = { A: 0, B: 1, C: 2, D: 3, expert: 4 };
  sources = sources.sort((a, b) => levelOrder[a.evidenceLevel] - levelOrder[b.evidenceLevel]);

  // Take top 1-3 sources
  const selectedSources = sources.slice(0, Math.min(3, sources.length));

  // Determine overall evidence level (highest among selected)
  const evidenceLevel = selectedSources.length > 0
    ? selectedSources[0].evidenceLevel
    : 'D';

  return {
    sourceIds: selectedSources.map(s => s.id),
    evidenceLevel
  };
}

// ============================================
// COMBINED SOURCES (INTERNATIONAL + SWEDISH)
// ============================================

/**
 * Get all sources (international + Swedish)
 */
export const ALL_SOURCES: ScientificSource[] = [
  ...SCIENTIFIC_SOURCES,
  ...SVENSKA_KALLOR
];

/**
 * Get sources by body area including Swedish sources
 * Swedish sources are prioritized in results
 */
export function getAllSourcesByBodyArea(bodyArea: BodyArea): ScientificSource[] {
  const svenskaKallor = getSvenskaKallorByBodyArea(bodyArea);
  const internationella = getSourcesByBodyArea(bodyArea);

  // Prioritize Swedish sources, then add international
  return [...svenskaKallor, ...internationella];
}

/**
 * Get Swedish sources for a body area
 */
export function getSwedishSourcesByBodyArea(bodyArea: BodyArea): ScientificSource[] {
  return getSvenskaKallorByBodyArea(bodyArea);
}

/**
 * Assign sources to exercise, prioritizing Swedish sources
 */
export function assignSourcesToExerciseWithSwedish(
  bodyArea: BodyArea,
  exerciseType: ExerciseType
): { sourceIds: string[]; evidenceLevel: EvidenceLevel; hasSwedishSources: boolean } {
  // First check Swedish sources
  const svenskaKallor = SVENSKA_KALLOR.filter(
    s => s.bodyAreas.includes(bodyArea) && s.exerciseTypes.includes(exerciseType)
  );

  // Then international sources
  const internationella = SCIENTIFIC_SOURCES.filter(
    s => s.bodyAreas.includes(bodyArea) && s.exerciseTypes.includes(exerciseType)
  );

  // Combine with Swedish first
  const allSources = [...svenskaKallor, ...internationella];

  // Sort by evidence level (A > B > C > D > expert)
  const levelOrder: Record<EvidenceLevel, number> = { A: 0, B: 1, C: 2, D: 3, expert: 4 };
  const sortedSources = allSources.sort((a, b) =>
    levelOrder[a.evidenceLevel] - levelOrder[b.evidenceLevel]
  );

  // Take top 3 sources
  const selectedSources = sortedSources.slice(0, 3);

  // Check if any Swedish sources were selected
  const hasSwedishSources = selectedSources.some(s => s.id.startsWith('swe_'));

  return {
    sourceIds: selectedSources.map(s => s.id),
    evidenceLevel: selectedSources.length > 0 ? selectedSources[0].evidenceLevel : 'D',
    hasSwedishSources
  };
}

/**
 * Get source count statistics
 */
export function getSourceStats(): {
  total: number;
  international: number;
  swedish: number;
  byLevel: Record<EvidenceLevel, number>;
} {
  const byLevel: Record<EvidenceLevel, number> = { A: 0, B: 0, C: 0, D: 0, expert: 0 };

  ALL_SOURCES.forEach(s => {
    byLevel[s.evidenceLevel]++;
  });

  return {
    total: ALL_SOURCES.length,
    international: SCIENTIFIC_SOURCES.length,
    swedish: SVENSKA_KALLOR.length,
    byLevel
  };
}

export { SVENSKA_KALLOR };
export default SCIENTIFIC_SOURCES;
