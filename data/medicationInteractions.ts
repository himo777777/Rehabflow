/**
 * Medication-Exercise Interactions Database
 *
 * Based on ACSM Guidelines for Exercise Testing and Prescription (11th ed.)
 * and clinical pharmacology literature
 *
 * IMPORTANT: This is educational information. Always verify with
 * prescribing physician before modifying exercise based on medications.
 */

// Types
export interface MedicationExerciseInteraction {
  drugClass: string;
  genericNames: string[];
  brandNames: string[];
  exerciseImpacts: ExerciseImpact[];
  contraindications: string[];
  recommendations: string[];
  hrAdjustment?: HRModification;
  monitoringRequired: MonitoringRequirement[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
}

export interface ExerciseImpact {
  system: 'cardiovascular' | 'musculoskeletal' | 'neurological' | 'metabolic' | 'respiratory' | 'thermoregulation';
  description: string;
  clinicalSignificance: 'low' | 'moderate' | 'high';
}

export interface HRModification {
  type: 'reduced_max' | 'blunted_response' | 'elevated_resting' | 'variable';
  percentReduction?: number;
  useRPE: boolean;
  targetRPE?: { min: number; max: number };
  notes: string;
}

export interface MonitoringRequirement {
  parameter: 'heart_rate' | 'blood_pressure' | 'blood_glucose' | 'symptoms' | 'balance' | 'hydration' | 'temperature';
  frequency: 'continuous' | 'every_5_min' | 'pre_post' | 'as_needed';
  threshold?: { warning: number; stop: number };
  notes: string;
}

export interface PatientMedication {
  medicationId: string;
  dosage?: string;
  frequency?: string;
  timeOfDay?: 'morning' | 'evening' | 'multiple' | 'as_needed';
  startDate?: string;
}

export interface MedicationSafetyCheck {
  safe: boolean;
  warnings: string[];
  contraindications: string[];
  recommendations: string[];
  exerciseModifications: string[];
  monitoringPlan: MonitoringRequirement[];
  overallRisk: 'low' | 'moderate' | 'high' | 'very_high';
}

// Medication Database
export const MEDICATION_INTERACTIONS: Record<string, MedicationExerciseInteraction> = {
  // ===== CARDIOVASCULAR MEDICATIONS =====

  beta_blockers: {
    drugClass: 'Betablockerare',
    genericNames: ['metoprolol', 'atenolol', 'bisoprolol', 'carvedilol', 'propranolol', 'nebivolol'],
    brandNames: ['Seloken', 'Tenormin', 'Emconcor', 'Kredex', 'Inderal'],
    exerciseImpacts: [
      {
        system: 'cardiovascular',
        description: 'Reducerar maximal hjärtfrekvens med 20-30 slag/min',
        clinicalSignificance: 'high'
      },
      {
        system: 'cardiovascular',
        description: 'Bluntar HR-respons på träning - HR ökar mindre än förväntat',
        clinicalSignificance: 'high'
      },
      {
        system: 'metabolic',
        description: 'Maskerar symtom på hypoglykemi (svettningar, takykardi)',
        clinicalSignificance: 'high'
      },
      {
        system: 'thermoregulation',
        description: 'Reducerad perifer vasodilatation - försämrad värmeavgivning',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Hög intensitetsträning utan RPE-styrning',
      'Träning i extrem värme utan förberedelse',
      'Kall uppvärmning - kräver längre tid'
    ],
    recommendations: [
      'Använd Borg RPE-skala (11-14) istället för HR-zoner',
      'Förlängd uppvärmning (minst 10-15 minuter)',
      'Undvik plötsliga intensitetsökningar',
      'Planera träning till samma tid dagligen för konsekvent läkemedelseffekt',
      'Träna 2-4 timmar efter dos för peak effekt'
    ],
    hrAdjustment: {
      type: 'reduced_max',
      percentReduction: 25,
      useRPE: true,
      targetRPE: { min: 11, max: 14 },
      notes: 'Max HR = (220 - ålder - 30). Använd Karvonen med vilohf mätt PÅ medicinering.'
    },
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Yrsel, extrem trötthet, bröstsmärta'
      },
      {
        parameter: 'blood_pressure',
        frequency: 'pre_post',
        threshold: { warning: 90, stop: 80 },
        notes: 'Systoliskt BP efter träning (ortostatisk hypotension)'
      }
    ],
    severity: 'high'
  },

  ace_inhibitors: {
    drugClass: 'ACE-hämmare',
    genericNames: ['enalapril', 'ramipril', 'lisinopril', 'captopril', 'perindopril'],
    brandNames: ['Renitec', 'Triatec', 'Zestril', 'Capoten', 'Coversyl'],
    exerciseImpacts: [
      {
        system: 'cardiovascular',
        description: 'Risk för hypotension, särskilt vid träningsstart',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'musculoskeletal',
        description: 'Sällsynt: muskelkramper och trötthet',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [
      'Plötslig ändring från liggande till stående position utan uppvärmning'
    ],
    recommendations: [
      'Gradvis övergång mellan positioner',
      'God hydrering före träning',
      'Undvik intensiv träning i värme',
      'Övervaka för yrsel första veckorna'
    ],
    monitoringRequired: [
      {
        parameter: 'blood_pressure',
        frequency: 'pre_post',
        threshold: { warning: 95, stop: 85 },
        notes: 'Systoliskt BP - risk för ortostatisk hypotension'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Yrsel, svimningskänsla'
      }
    ],
    severity: 'moderate'
  },

  calcium_channel_blockers: {
    drugClass: 'Kalciumantagonister',
    genericNames: ['amlodipin', 'nifedipin', 'felodipin', 'verapamil', 'diltiazem'],
    brandNames: ['Norvasc', 'Adalat', 'Plendil', 'Isoptin', 'Cardizem'],
    exerciseImpacts: [
      {
        system: 'cardiovascular',
        description: 'Verapamil/diltiazem reducerar HR (som betablockerare)',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'cardiovascular',
        description: 'Perifera ödem kan förvärras av stillasittande',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [],
    recommendations: [
      'Verapamil/diltiazem: använd RPE istället för HR',
      'Regelbunden rörelse för att minska ödem',
      'Kompressionsstrumpor vid benövningar om ödem finns'
    ],
    hrAdjustment: {
      type: 'blunted_response',
      useRPE: true,
      targetRPE: { min: 11, max: 14 },
      notes: 'Endast för verapamil/diltiazem, inte dihydropyridiner (amlodipin)'
    },
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'as_needed',
        notes: 'Ankelsvullnad, huvudvärk, flush'
      }
    ],
    severity: 'moderate'
  },

  diuretics: {
    drugClass: 'Diuretika',
    genericNames: ['furosemid', 'hydroklortiazid', 'bendroflumetiazid', 'spironolakton'],
    brandNames: ['Furix', 'Esidrex', 'Salures', 'Aldactone'],
    exerciseImpacts: [
      {
        system: 'cardiovascular',
        description: 'Dehydrering och elektrolytrubbning (K+, Mg2+)',
        clinicalSignificance: 'high'
      },
      {
        system: 'thermoregulation',
        description: 'Ökad risk för värmerelaterade problem',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Muskelkramper vid lågt kalium',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Intensiv träning utan adekvat vätskeintag',
      'Träning i värme utan extra försiktighetsåtgärder',
      'Träning vid kända elektrolytrubbningar'
    ],
    recommendations: [
      'Drick 500ml vatten 2h före träning',
      'Fortsatt vätskeintag under träning (150-250ml var 15-20 min)',
      'Överväg elektrolytdryck vid träning >60 min',
      'Planera träning så det inte är peak diuretisk effekt',
      'Känn till tecken på hypokalemi (svaghet, kramper, oregelbunden puls)'
    ],
    monitoringRequired: [
      {
        parameter: 'hydration',
        frequency: 'pre_post',
        notes: 'Urin färg, vikt före/efter'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Muskelkramper, svaghet, oregelbunden puls'
      },
      {
        parameter: 'blood_pressure',
        frequency: 'pre_post',
        threshold: { warning: 90, stop: 80 },
        notes: 'Systoliskt - dehydrering förstärker hypotension'
      }
    ],
    severity: 'high'
  },

  anticoagulants: {
    drugClass: 'Antikoagulantia (blodförtunnande)',
    genericNames: ['warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban'],
    brandNames: ['Waran', 'Eliquis', 'Xarelto', 'Pradaxa', 'Lixiana'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Ökad blödningsrisk vid trauma',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Risk för ledblödning (hemartros) vid överbelastning',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Kontaktsporter',
      'Övningar med hög fallrisk utan säkerhetsnät',
      'Tunga lyft utan erfarenhet eller instruktion',
      'Huvudets position under hjärtnivå vid höga doser'
    ],
    recommendations: [
      'Balansträning med stöd tillgängligt',
      'Undvik nya övningar utan instruktion',
      'Rapportera ovanliga blåmärken till läkare',
      'Ha information om medicinering tillgänglig vid träning',
      'Undvik NSAID för träningsrelaterad smärta',
      'Skyddsutrustning vid relevanta aktiviteter'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Ovanlig smärta, svullnad, blåmärken'
      }
    ],
    severity: 'high'
  },

  antiplatelets: {
    drugClass: 'Trombocythämmare',
    genericNames: ['acetylsalicylsyra', 'klopidogrel', 'tikagrelol', 'prasugrel'],
    brandNames: ['Trombyl', 'Plavix', 'Brilique', 'Efient'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Ökad blödningstendens',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Kontaktsporter vid dubbel trombocythämning'
    ],
    recommendations: [
      'Var försiktig med aktiviteter med fallrisk',
      'Rapportera långvarig blödning eller ovanliga blåmärken',
      'NSAID ökar blödningsrisken ytterligare'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'as_needed',
        notes: 'Blåmärken, blödning'
      }
    ],
    severity: 'moderate'
  },

  // ===== SMÄRTSTILLANDE/ANTI-INFLAMMATORISKA =====

  nsaids: {
    drugClass: 'NSAID (icke-steroida antiinflammatoriska)',
    genericNames: ['ibuprofen', 'naproxen', 'diklofenak', 'ketoprofen', 'celecoxib'],
    brandNames: ['Ipren', 'Pronaxen', 'Voltaren', 'Orudis', 'Celebra'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Maskerar smärtsignaler - risk för överbelastning',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Försämrad senläkning vid kroniskt bruk',
        clinicalSignificance: 'high'
      },
      {
        system: 'cardiovascular',
        description: 'Ökad kardiovaskulär risk vid kroniskt bruk och intensiv träning',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Använda NSAID för att "komma igenom" träning',
      'Träning inom 4h efter högdos utan adekvat hydrering',
      'Långtidsbruk vid senskada'
    ],
    recommendations: [
      'Undvik NSAID inom 4 timmar före träning',
      'Använd aldrig för att maskera smärta under träning',
      'Rapportera behov av daglig NSAID till fysioterapeut',
      'Vid senskada: paracetamol föredras',
      'God hydrering minskar GI-risk',
      'Korttidsbruk (<7 dagar) föredras'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Smärta som kräver NSAID för att träna = för hög belastning'
      }
    ],
    severity: 'moderate'
  },

  opioids: {
    drugClass: 'Opioider',
    genericNames: ['tramadol', 'kodein', 'oxikodon', 'morfin', 'fentanyl'],
    brandNames: ['Tradolan', 'Citodon', 'OxyContin', 'Dolcontin', 'Durogesic'],
    exerciseImpacts: [
      {
        system: 'neurological',
        description: 'Nedsatt reaktionsförmåga och koordination',
        clinicalSignificance: 'high'
      },
      {
        system: 'neurological',
        description: 'Maskerar smärta - risk för skada',
        clinicalSignificance: 'high'
      },
      {
        system: 'cardiovascular',
        description: 'Ortostatisk hypotension',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'respiratory',
        description: 'Andningsdepression vid höga doser',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Balansövningar utan stöd vid nya doser/höga doser',
      'Övningar som kräver snabb reaktionsförmåga',
      'Träning vid peak dos-effekt',
      'Ensam träning utan tillsyn'
    ],
    recommendations: [
      'Undvik träning vid peak medicineffekt (1-2h efter dos)',
      'Endast kontrollerade, övervakade övningar',
      'Fokus på ROM och lågintensitetsövningar',
      'Stöd tillgängligt vid alla övningar',
      'Gradvis nedtrappning av opioid parallellt med ökad aktivitet'
    ],
    monitoringRequired: [
      {
        parameter: 'balance',
        frequency: 'continuous',
        notes: 'Yrsel, ostadighetskänsla'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Illamående, dåsighet'
      }
    ],
    severity: 'critical'
  },

  // ===== KORTIKOSTEROIDER =====

  corticosteroids_systemic: {
    drugClass: 'Systemiska kortikosteroider',
    genericNames: ['prednisolon', 'betametason', 'dexametason', 'metylprednisolon'],
    brandNames: ['Prednisolon', 'Betapred', 'Fortecortin', 'Medrol'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Försvagade senor - ökad rupturisk',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Osteoporos vid långtidsbruk - frakturrisk',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Steroidmyopati - proximal muskelsvaghet',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'metabolic',
        description: 'Hyperglykemi - särskilt hos diabetiker',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Tung styrketräning vid högdosbehandling',
      'Plyometri och explosiva rörelser',
      'Maxbelastning på senor (t.ex. tung hällyft)'
    ],
    recommendations: [
      'Fokus på kontrollerad ROM och isometrisk styrka',
      'Viktbärande övningar för benhälsa',
      'Undvik explosiva rörelser',
      'Progrediera belastning långsamt',
      'D-vitamin och kalcium för benhälsa',
      'Övervaka blodsocker hos diabetiker'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Sensmärta, ledsymtom'
      },
      {
        parameter: 'blood_glucose',
        frequency: 'pre_post',
        threshold: { warning: 180, stop: 250 },
        notes: 'Vid diabetes - mg/dL'
      }
    ],
    severity: 'high'
  },

  corticosteroid_injection: {
    drugClass: 'Kortisoninjektion (lokal)',
    genericNames: ['triamcinolon', 'metylprednisolon', 'betametason'],
    brandNames: ['Kenacort', 'Depo-Medrol', 'Celeston'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Temporär försvagning av injicerad sena/led',
        clinicalSignificance: 'high'
      }
    ],
    contraindications: [
      'Belastning av injicerad struktur inom 2-6 veckor',
      'Full belastning inom 6 veckor för viktbärande sena'
    ],
    recommendations: [
      '2 veckors vila från tung belastning på injektionsstället',
      '6 veckor före full belastning på viktbärande senor (achilles, patellarsena)',
      'Gradvis återgång till aktivitet',
      'Maximal 3-4 injektioner per led/sena'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Lokal smärta, svullnad'
      }
    ],
    severity: 'high'
  },

  // ===== DIABETES MEDICINER =====

  insulin: {
    drugClass: 'Insulin',
    genericNames: ['insulin glargin', 'insulin aspart', 'insulin lispro', 'insulin detemir'],
    brandNames: ['Lantus', 'NovoRapid', 'Humalog', 'Levemir'],
    exerciseImpacts: [
      {
        system: 'metabolic',
        description: 'Ökad risk för hypoglykemi vid/efter träning',
        clinicalSignificance: 'high'
      },
      {
        system: 'metabolic',
        description: 'Snabbare insulinabsorption vid värme/massage av injektionsställe',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Träning vid blodsocker <5.5 mmol/L utan förberedelse',
      'Intensiv träning inom 2h efter injektion i aktiv muskelgrupp',
      'Träning vid blodsocker >14 mmol/L med ketoner'
    ],
    recommendations: [
      'Kontrollera blodsocker före träning',
      'Ha snabba kolhydrater tillgängliga (15-20g)',
      'Undvik injektion i muskelgrupp som ska tränas',
      'Reducera insulindos 25-50% före planerad träning (enligt läkare)',
      'Ät kolhydratrik måltid 1-3h före träning',
      'Kontrollera blodsocker 30 min efter träning'
    ],
    monitoringRequired: [
      {
        parameter: 'blood_glucose',
        frequency: 'pre_post',
        threshold: { warning: 5.5, stop: 4.0 },
        notes: 'mmol/L - under 4.0 = avbryt och behandla hypoglykemi'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Darrningar, svettningar, förvirring, yrsel'
      }
    ],
    severity: 'critical'
  },

  sulfonylureas: {
    drugClass: 'Sulfonylurea',
    genericNames: ['glimepirid', 'glibenklamid', 'glipizid'],
    brandNames: ['Amaryl', 'Daonil', 'Mindiab'],
    exerciseImpacts: [
      {
        system: 'metabolic',
        description: 'Ökad hypoglykemirisk, särskilt vid förlängd träning',
        clinicalSignificance: 'high'
      }
    ],
    contraindications: [
      'Träning på fastande mage',
      'Förlängd träning >60 min utan kolhydratintag'
    ],
    recommendations: [
      'Ät kolhydratrik måltid före träning',
      'Ha snabba kolhydrater tillgängliga',
      'Kontrollera blodsocker vid symtom',
      'Överväg kolhydratintag var 30-45 min vid längre träning'
    ],
    monitoringRequired: [
      {
        parameter: 'blood_glucose',
        frequency: 'pre_post',
        threshold: { warning: 5.0, stop: 4.0 },
        notes: 'mmol/L'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Hypoglykemisymtom'
      }
    ],
    severity: 'high'
  },

  metformin: {
    drugClass: 'Biguanider',
    genericNames: ['metformin'],
    brandNames: ['Metformin', 'Glucophage'],
    exerciseImpacts: [
      {
        system: 'metabolic',
        description: 'Låg hypoglykemirisk som monoterapi',
        clinicalSignificance: 'low'
      },
      {
        system: 'metabolic',
        description: 'Sällsynt: laktatacidos vid extrem ansträngning',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [],
    recommendations: [
      'Generellt säkert att träna på',
      'Vid GI-biverkningar: träna 2h efter dos',
      'God hydrering'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'as_needed',
        notes: 'GI-besvär'
      }
    ],
    severity: 'low'
  },

  // ===== PSYKIATRISKA LÄKEMEDEL =====

  ssri_snri: {
    drugClass: 'SSRI/SNRI antidepressiva',
    genericNames: ['sertralin', 'citalopram', 'escitalopram', 'venlafaxin', 'duloxetin'],
    brandNames: ['Zoloft', 'Cipramil', 'Cipralex', 'Efexor', 'Cymbalta'],
    exerciseImpacts: [
      {
        system: 'thermoregulation',
        description: 'Ökad svettning - dehydreringsrisk',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'cardiovascular',
        description: 'Venlafaxin kan höja blodtryck',
        clinicalSignificance: 'low'
      },
      {
        system: 'neurological',
        description: 'Sällsynt: hyponatremi vid intensiv träning',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [],
    recommendations: [
      'God hydrering viktigt p.g.a. ökad svettning',
      'Träning har synergistisk effekt med SSRI - uppmuntra!',
      'Morgonträning kan förstärka antidepressiv effekt'
    ],
    monitoringRequired: [
      {
        parameter: 'hydration',
        frequency: 'pre_post',
        notes: 'Extra uppmärksam vid värme'
      }
    ],
    severity: 'low'
  },

  benzodiazepines: {
    drugClass: 'Bensodiazepiner',
    genericNames: ['diazepam', 'oxazepam', 'lorazepam', 'alprazolam'],
    brandNames: ['Stesolid', 'Oxascand', 'Temesta', 'Xanor'],
    exerciseImpacts: [
      {
        system: 'neurological',
        description: 'Nedsatt koordination och reaktionsförmåga',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Muskelavslappning - risk för instabilitet',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Balansövningar utan stöd',
      'Tunga fria vikter',
      'Aktiviteter med fallrisk'
    ],
    recommendations: [
      'Övningar med stöd/säkerhetsnät',
      'Undvik peak medicineffekt vid träning',
      'Maskiner föredras framför fria vikter',
      'Fokus på kontrollerade rörelser'
    ],
    monitoringRequired: [
      {
        parameter: 'balance',
        frequency: 'continuous',
        notes: 'Ostadighetskänsla'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Dåsighet, yrsel'
      }
    ],
    severity: 'high'
  },

  antipsychotics: {
    drugClass: 'Antipsykotika',
    genericNames: ['olanzapin', 'risperidon', 'quetiapin', 'aripiprazol'],
    brandNames: ['Zyprexa', 'Risperdal', 'Seroquel', 'Abilify'],
    exerciseImpacts: [
      {
        system: 'metabolic',
        description: 'Ökad risk för viktuppgång - träning extra viktigt',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'thermoregulation',
        description: 'Försämrad temperaturreglering',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'cardiovascular',
        description: 'Ortostatisk hypotension',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Intensiv träning i extrem värme'
    ],
    recommendations: [
      'Regelbunden träning viktigt för metabol hälsa',
      'Undvik träning i värme',
      'Gradvis positionsändring',
      'God hydrering'
    ],
    monitoringRequired: [
      {
        parameter: 'temperature',
        frequency: 'as_needed',
        notes: 'Undvik överhettning'
      },
      {
        parameter: 'blood_pressure',
        frequency: 'pre_post',
        notes: 'Ortostatism'
      }
    ],
    severity: 'moderate'
  },

  // ===== MUSKELRELAXANTIA =====

  muscle_relaxants: {
    drugClass: 'Muskelavslappnande',
    genericNames: ['baklofen', 'tizanidin', 'orfenadrin', 'karisoprodol'],
    brandNames: ['Lioresal', 'Sirdalud', 'Norflex', 'Somadril'],
    exerciseImpacts: [
      {
        system: 'neurological',
        description: 'Dåsighet och nedsatt reaktionsförmåga',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Reducerad muskeltonus - instabilitet',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'cardiovascular',
        description: 'Hypotension möjlig',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [
      'Tunga lyft utan stöd/maskiner',
      'Snabba riktningsförändringar',
      'Övningar som kräver snabb reaktionsförmåga'
    ],
    recommendations: [
      'Kontrollerade, långsamma rörelser',
      'Maskiner föredras för styrketräning',
      'Undvik träning vid peak medicineffekt',
      'Extra uppmärksam på kroppsposition'
    ],
    monitoringRequired: [
      {
        parameter: 'balance',
        frequency: 'continuous',
        notes: 'Ostadighetskänsla'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Svaghetskänsla'
      }
    ],
    severity: 'moderate'
  },

  // ===== ASTMA/KOL =====

  bronchodilators_beta_agonist: {
    drugClass: 'Beta-agonister (bronkdilaterare)',
    genericNames: ['salbutamol', 'terbutalin', 'formoterol', 'salmeterol'],
    brandNames: ['Ventoline', 'Bricanyl', 'Oxis', 'Serevent'],
    exerciseImpacts: [
      {
        system: 'cardiovascular',
        description: 'Kan öka hjärtfrekvens (särskilt salbutamol)',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'musculoskeletal',
        description: 'Möjliga muskelkramper',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [],
    recommendations: [
      'Kortverkande (salbutamol) 15 min före träning vid ansträngningsutlöst astma',
      'God uppvärmning minskar behovet',
      'Undvik kall, torr luft om möjligt',
      'Ha akutmedicin tillgänglig'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Pip i bröstet, andnöd'
      }
    ],
    severity: 'low'
  },

  // ===== IMMUNOSUPPRESSIVA =====

  immunosuppressants: {
    drugClass: 'Immunosuppressiva',
    genericNames: ['metotrexat', 'azatioprin', 'ciklosporin', 'mykofenolatmofetil'],
    brandNames: ['Methotrexate', 'Imurel', 'Sandimmun', 'CellCept'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Ökad infektionskänslighet - risk i gym-miljö',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'musculoskeletal',
        description: 'Metotrexat: risk för mucosit och trötthet',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Träning vid feber eller infektion',
      'Träning i högtrafikerade gym vid neutropeni'
    ],
    recommendations: [
      'God hygien - tvätta händer, torka av utrustning',
      'Undvik träning vid infektionstecken',
      'Hemträning kan vara säkrare vid låga leukocyter',
      'Metotrexat: planera lättare dagar efter dos-dag'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Feber, infektionstecken'
      }
    ],
    severity: 'moderate'
  },

  // ===== STATINER (Lipidsänkande) =====

  statins: {
    drugClass: 'Statiner',
    genericNames: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'fluvastatin'],
    brandNames: ['Lipitor', 'Zocor', 'Crestor', 'Pravachol', 'Lescol', 'Atorvastatin', 'Simvastatin'],
    exerciseImpacts: [
      {
        system: 'musculoskeletal',
        description: 'Myopati och muskelsmärta (2-11% av användare)',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Ökad rabdomyolysrisk vid intensiv/ovanlig träning',
        clinicalSignificance: 'high'
      },
      {
        system: 'musculoskeletal',
        description: 'Muskelsvaghet och kramper, särskilt proximala muskler',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'musculoskeletal',
        description: 'Minskad mitokondriefunktion kan påverka uthållighet',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Extremt intensiv träning utan gradvis uppbyggnad',
      'Ny/ovanlig träningsform vid hög intensitet',
      'Träning vid befintlig muskelsmärta utan läkarkontakt',
      'Kombinerat med fibrat + intensiv träning'
    ],
    recommendations: [
      'Rapportera ALL muskelsmärta till läkare omedelbart',
      'Gradvis progression av träningsintensitet',
      'Undvik plötsliga intensitetsökningar',
      'God hydrering före, under och efter träning',
      'CoQ10 supplementering kan övervägas (diskutera med läkare)',
      'Övervaka för mörk urin (tecken på rabdomyolys)',
      'Lättare intensitet rekommenderas initialt'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Muskelsmärta, svaghet, kramper, mörk urin'
      }
    ],
    severity: 'high'
  },

  // ===== SGLT2-HÄMMARE (Diabetes typ 2) =====

  sglt2_inhibitors: {
    drugClass: 'SGLT2-hämmare',
    genericNames: ['empagliflozin', 'dapagliflozin', 'canagliflozin', 'ertugliflozin'],
    brandNames: ['Jardiance', 'Forxiga', 'Invokana', 'Steglatro'],
    exerciseImpacts: [
      {
        system: 'metabolic',
        description: 'Euglykemisk DKA-risk vid intensiv/långvarig träning (blodsocker kan vara normalt men ketoner höga)',
        clinicalSignificance: 'high'
      },
      {
        system: 'cardiovascular',
        description: 'Dehydrering och hypotension (läkemedlet ökar urinproduktion)',
        clinicalSignificance: 'high'
      },
      {
        system: 'metabolic',
        description: 'Ökad risk för urogenitala infektioner',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'cardiovascular',
        description: 'Ortostatisk yrsel, särskilt vid träningsstart',
        clinicalSignificance: 'moderate'
      }
    ],
    contraindications: [
      'Intensiv träning >60 min utan kolhydratintag',
      'Träning vid ketos eller misstänkt ketos',
      'Träning vid magsjuka/kräkning/diarré (dehydreringsrisk)',
      'Lågkolhydratkost + intensiv träning',
      'Fasta + träning'
    ],
    recommendations: [
      'Kolhydratintag före och under långvarig träning (>45 min)',
      'EXTRA hydrering - drick 500ml extra före träning',
      'Vätskeersättning under träning var 15-20 min',
      'Känn till symtom på euglykemisk DKA: illamående, buksmärta, djup andning, trötthet',
      'Pausa SGLT2-hämmare 3 dagar före planerad intensiv träning (efter läkarordination)',
      'Undvik träning vid urinvägsinfektion',
      'Gradvis positionsändring efter träning'
    ],
    monitoringRequired: [
      {
        parameter: 'hydration',
        frequency: 'pre_post',
        notes: 'Urinmängd och färg, vikt före/efter'
      },
      {
        parameter: 'blood_glucose',
        frequency: 'pre_post',
        notes: 'OBS: Normalt blodsocker utesluter EJ DKA vid SGLT2-hämmare'
      },
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Illamående, buksmärta, fruktlukt, djup andning, extrem trötthet = STOPP + sök vård'
      },
      {
        parameter: 'blood_pressure',
        frequency: 'pre_post',
        threshold: { warning: 95, stop: 85 },
        notes: 'Systoliskt - ökad hypotensionsrisk'
      }
    ],
    severity: 'high'
  },

  // ===== GLP-1-AGONISTER (Diabetes/Viktminskning) =====

  glp1_agonists: {
    drugClass: 'GLP-1-agonister',
    genericNames: ['semaglutid', 'liraglutid', 'dulaglutid', 'tirzepatid', 'exenatid'],
    brandNames: ['Ozempic', 'Wegovy', 'Victoza', 'Saxenda', 'Trulicity', 'Mounjaro', 'Byetta'],
    exerciseImpacts: [
      {
        system: 'metabolic',
        description: 'Kraftigt reducerad aptit kan leda till energibrist vid träning',
        clinicalSignificance: 'high'
      },
      {
        system: 'metabolic',
        description: 'Illamående kan förvärras av intensiv träning',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'metabolic',
        description: 'Risk för hypoglykemi vid kombination med insulin/SU',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'musculoskeletal',
        description: 'Muskelförlust vid snabb viktminskning om proteinintag är otillräckligt',
        clinicalSignificance: 'moderate'
      },
      {
        system: 'cardiovascular',
        description: 'Förhöjd vilopuls kan förekomma',
        clinicalSignificance: 'low'
      }
    ],
    contraindications: [
      'Träning vid kraftigt illamående',
      'Träning på helt fastande mage',
      'Mycket intensiv träning under första veckorna av ny dos'
    ],
    recommendations: [
      'Ät en lätt måltid 1-2h före träning TROTS minskad aptit - detta är kritiskt',
      'Prioritera proteinrik mat (1.6-2.2g/kg kroppsvikt) för att bevara muskelmassa',
      'Undvik intensiv träning om kraftigt illamående - välj lågintensiv rörelse istället',
      'Planera träning till låg-illamående period på dagen',
      'Styrketräning är EXTRA viktigt för att motverka muskelförlust',
      'Gradvis ökning av intensitet vid dosökning',
      'Ha kolhydratrik snack tillgänglig (banan, sportdryck)'
    ],
    monitoringRequired: [
      {
        parameter: 'symptoms',
        frequency: 'continuous',
        notes: 'Illamående, yrsel, svaghet'
      },
      {
        parameter: 'blood_glucose',
        frequency: 'pre_post',
        threshold: { warning: 5.0, stop: 4.0 },
        notes: 'mmol/L - viktigt vid kombination med insulin/SU'
      }
    ],
    severity: 'moderate'
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Get medication interaction by generic name
 */
export function getMedicationInteraction(
  medicationName: string
): MedicationExerciseInteraction | undefined {
  const normalizedName = medicationName.toLowerCase().trim();

  for (const [, interaction] of Object.entries(MEDICATION_INTERACTIONS)) {
    if (
      interaction.genericNames.some(name => name.toLowerCase() === normalizedName) ||
      interaction.brandNames.some(name => name.toLowerCase() === normalizedName)
    ) {
      return interaction;
    }
  }

  return undefined;
}

/**
 * Get medication interaction by drug class
 */
export function getMedicationByClass(
  drugClass: string
): MedicationExerciseInteraction | undefined {
  return MEDICATION_INTERACTIONS[drugClass];
}

/**
 * Check exercise safety for a list of medications
 */
export function checkMedicationExerciseSafety(
  medications: PatientMedication[]
): MedicationSafetyCheck {
  const allWarnings: string[] = [];
  const allContraindications: string[] = [];
  const allRecommendations: string[] = [];
  const allModifications: string[] = [];
  const allMonitoring: MonitoringRequirement[] = [];
  const severities: Array<MedicationExerciseInteraction['severity']> = [];

  for (const med of medications) {
    const interaction = getMedicationByClass(med.medicationId) ||
                       getMedicationInteraction(med.medicationId);

    if (!interaction) continue;

    severities.push(interaction.severity);

    // Add impacts as warnings
    for (const impact of interaction.exerciseImpacts) {
      if (impact.clinicalSignificance === 'high') {
        allWarnings.push(`${interaction.drugClass}: ${impact.description}`);
      }
    }

    // Add contraindications
    allContraindications.push(...interaction.contraindications.map(
      c => `${interaction.drugClass}: ${c}`
    ));

    // Add recommendations
    allRecommendations.push(...interaction.recommendations);

    // Add HR adjustment as modification
    if (interaction.hrAdjustment?.useRPE) {
      allModifications.push(
        `Använd RPE ${interaction.hrAdjustment.targetRPE?.min}-${interaction.hrAdjustment.targetRPE?.max} istället för HR-zoner (p.g.a. ${interaction.drugClass})`
      );
    }

    // Add monitoring requirements
    allMonitoring.push(...interaction.monitoringRequired);
  }

  // Determine overall risk
  let overallRisk: MedicationSafetyCheck['overallRisk'] = 'low';
  if (severities.includes('critical')) {
    overallRisk = 'very_high';
  } else if (severities.includes('high')) {
    overallRisk = severities.filter(s => s === 'high').length >= 2 ? 'very_high' : 'high';
  } else if (severities.includes('moderate')) {
    overallRisk = severities.filter(s => s === 'moderate').length >= 2 ? 'high' : 'moderate';
  }

  // Check for dangerous combinations
  const dangerousCombos = checkDangerousCombinations(medications);
  if (dangerousCombos.length > 0) {
    allWarnings.push(...dangerousCombos);
    overallRisk = 'very_high';
  }

  // Remove duplicates
  const uniqueWarnings = [...new Set(allWarnings)];
  const uniqueContraindications = [...new Set(allContraindications)];
  const uniqueRecommendations = [...new Set(allRecommendations)];
  const uniqueModifications = [...new Set(allModifications)];

  return {
    safe: overallRisk !== 'very_high' && allContraindications.length === 0,
    warnings: uniqueWarnings,
    contraindications: uniqueContraindications,
    recommendations: uniqueRecommendations,
    exerciseModifications: uniqueModifications,
    monitoringPlan: deduplicateMonitoring(allMonitoring),
    overallRisk
  };
}

/**
 * Check for dangerous medication combinations during exercise
 */
function checkDangerousCombinations(medications: PatientMedication[]): string[] {
  const warnings: string[] = [];
  const medIds = medications.map(m => m.medicationId.toLowerCase());

  // Beta blocker + Insulin = masked hypoglycemia
  if (
    (medIds.includes('beta_blockers') || medIds.some(m =>
      ['metoprolol', 'atenolol', 'bisoprolol', 'carvedilol', 'propranolol'].includes(m)
    )) &&
    (medIds.includes('insulin') || medIds.some(m =>
      ['insulin glargin', 'insulin aspart', 'insulin lispro'].includes(m)
    ))
  ) {
    warnings.push(
      'VARNING: Betablockerare + Insulin = hypoglykemisymtom maskeras. ' +
      'Övervaka blodsocker extra noga!'
    );
  }

  // Diuretic + NSAID = kidney risk + dehydration
  if (
    medIds.includes('diuretics') &&
    medIds.includes('nsaids')
  ) {
    warnings.push(
      'VARNING: Diuretika + NSAID = ökad dehydreringsrisk och njurpåverkan. ' +
      'Strikt vätskebalans krävs!'
    );
  }

  // Anticoagulant + NSAID = bleeding risk
  if (
    (medIds.includes('anticoagulants') || medIds.includes('antiplatelets')) &&
    medIds.includes('nsaids')
  ) {
    warnings.push(
      'VARNING: Antikoagulantia/trombocythämmare + NSAID = kraftigt ökad blödningsrisk!'
    );
  }

  // Multiple sedating medications
  const sedatingMeds = medIds.filter(m =>
    ['benzodiazepines', 'opioids', 'muscle_relaxants', 'antipsychotics'].includes(m)
  );
  if (sedatingMeds.length >= 2) {
    warnings.push(
      'VARNING: Flera sederande läkemedel = kraftigt nedsatt reaktionsförmåga och koordination. ' +
      'Endast övervakad träning med stöd!'
    );
  }

  // Statins + Intense exercise = Rhabdomyolysis risk
  if (
    medIds.includes('statins') || medIds.some(m =>
      ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'fluvastatin'].includes(m)
    )
  ) {
    warnings.push(
      'VARNING: Statin + intensiv träning = ökad rabdomyolysrisk. ' +
      'Rapportera ALL muskelsmärta. Undvik extremt intensiv/ovanlig träning. Övervaka för mörk urin.'
    );
  }

  // SGLT2 + GLP-1 = Enhanced dehydration/metabolic risk
  if (
    (medIds.includes('sglt2_inhibitors') || medIds.some(m =>
      ['empagliflozin', 'dapagliflozin', 'canagliflozin'].includes(m)
    )) &&
    (medIds.includes('glp1_agonists') || medIds.some(m =>
      ['semaglutid', 'liraglutid', 'tirzepatid'].includes(m)
    ))
  ) {
    warnings.push(
      'VARNING: SGLT2-hämmare + GLP-1-agonist = förstärkt dehydreringsrisk och aptitnedsättning. ' +
      'Extra hydrering och kolhydratintag kritiskt!'
    );
  }

  // SGLT2 + Diuretics = Severe dehydration risk
  if (
    (medIds.includes('sglt2_inhibitors') || medIds.some(m =>
      ['empagliflozin', 'dapagliflozin', 'canagliflozin'].includes(m)
    )) &&
    medIds.includes('diuretics')
  ) {
    warnings.push(
      'VARNING: SGLT2-hämmare + diuretika = kraftigt ökad dehydrerings- och hypotensionsrisk. ' +
      'Extra försiktighet med vätskebalans!'
    );
  }

  return warnings;
}

/**
 * Deduplicate monitoring requirements, keeping the stricter one
 */
function deduplicateMonitoring(monitoring: MonitoringRequirement[]): MonitoringRequirement[] {
  const byParameter: Record<string, MonitoringRequirement> = {};

  const frequencyOrder = ['continuous', 'every_5_min', 'pre_post', 'as_needed'];

  for (const req of monitoring) {
    const existing = byParameter[req.parameter];
    if (!existing) {
      byParameter[req.parameter] = req;
    } else {
      // Keep the more frequent monitoring
      const existingIndex = frequencyOrder.indexOf(existing.frequency);
      const newIndex = frequencyOrder.indexOf(req.frequency);
      if (newIndex < existingIndex) {
        byParameter[req.parameter] = {
          ...req,
          notes: `${existing.notes}; ${req.notes}`
        };
      }
    }
  }

  return Object.values(byParameter);
}

/**
 * Get exercise recommendations based on medications
 */
export function getExerciseRecommendationsForMedications(
  medications: PatientMedication[]
): {
  useRPE: boolean;
  targetRPE?: { min: number; max: number };
  maxHRReduction?: number;
  warmupMinutes: number;
  cooldownMinutes: number;
  hydrationML: number;
  avoidActivities: string[];
  preferActivities: string[];
} {
  let useRPE = false;
  let maxHRReduction = 0;
  let warmupMinutes = 5;
  let cooldownMinutes = 5;
  let hydrationML = 500;
  const avoidActivities: Set<string> = new Set();
  const preferActivities: Set<string> = new Set();

  for (const med of medications) {
    const interaction = getMedicationByClass(med.medicationId) ||
                       getMedicationInteraction(med.medicationId);
    if (!interaction) continue;

    if (interaction.hrAdjustment?.useRPE) {
      useRPE = true;
      if (interaction.hrAdjustment.percentReduction) {
        maxHRReduction = Math.max(maxHRReduction, interaction.hrAdjustment.percentReduction);
      }
    }

    // Increase warmup for certain medications
    if (['beta_blockers', 'ace_inhibitors', 'calcium_channel_blockers'].includes(med.medicationId)) {
      warmupMinutes = Math.max(warmupMinutes, 15);
      cooldownMinutes = Math.max(cooldownMinutes, 10);
    }

    // Increase hydration for certain medications
    if (['diuretics', 'ssri_snri', 'antipsychotics'].includes(med.medicationId)) {
      hydrationML = Math.max(hydrationML, 750);
    }

    // SGLT2 inhibitors need extra hydration
    if (['sglt2_inhibitors'].includes(med.medicationId)) {
      hydrationML = Math.max(hydrationML, 1000);
      avoidActivities.add('Intensiv träning >60 min utan kolhydrater');
      avoidActivities.add('Träning vid misstänkt ketos');
    }

    // GLP-1 agonists - prioritize strength training
    if (['glp1_agonists'].includes(med.medicationId)) {
      preferActivities.add('Styrketräning (för att bevara muskelmassa)');
      avoidActivities.add('Träning på helt fastande mage');
    }

    // Statins - avoid extreme intensity
    if (['statins'].includes(med.medicationId)) {
      avoidActivities.add('Extremt intensiv/ovanlig träning');
      preferActivities.add('Gradvis intensitetsökning');
    }

    // Add activity restrictions
    if (['anticoagulants', 'antiplatelets'].includes(med.medicationId)) {
      avoidActivities.add('Kontaktsporter');
      avoidActivities.add('Övningar med hög fallrisk');
      preferActivities.add('Balansträning med stöd');
    }

    if (['benzodiazepines', 'opioids', 'muscle_relaxants'].includes(med.medicationId)) {
      avoidActivities.add('Fria vikter utan instruktion');
      avoidActivities.add('Snabba riktningsförändringar');
      preferActivities.add('Maskinträning');
      preferActivities.add('Kontrollerade ROM-övningar');
    }
  }

  return {
    useRPE,
    targetRPE: useRPE ? { min: 11, max: 14 } : undefined,
    maxHRReduction: maxHRReduction > 0 ? maxHRReduction : undefined,
    warmupMinutes,
    cooldownMinutes,
    hydrationML,
    avoidActivities: [...avoidActivities],
    preferActivities: [...preferActivities]
  };
}

/**
 * Generate patient-friendly medication exercise guide
 */
export function generateMedicationExerciseGuide(
  medications: PatientMedication[]
): string {
  const safetyCheck = checkMedicationExerciseSafety(medications);
  const recommendations = getExerciseRecommendationsForMedications(medications);

  let guide = '# Träningsguide baserad på dina läkemedel\n\n';

  // Risk level
  guide += `## Risknivå: ${
    safetyCheck.overallRisk === 'very_high' ? '⛔ Mycket hög - kräver övervakning' :
    safetyCheck.overallRisk === 'high' ? '⚠️ Hög - var försiktig' :
    safetyCheck.overallRisk === 'moderate' ? '⚡ Måttlig - följ rekommendationerna' :
    '✅ Låg - normala försiktighetsåtgärder'
  }\n\n`;

  // Warnings
  if (safetyCheck.warnings.length > 0) {
    guide += '## Viktiga varningar\n';
    for (const warning of safetyCheck.warnings) {
      guide += `- ${warning}\n`;
    }
    guide += '\n';
  }

  // Contraindications
  if (safetyCheck.contraindications.length > 0) {
    guide += '## Undvik\n';
    for (const contra of safetyCheck.contraindications) {
      guide += `- ❌ ${contra}\n`;
    }
    guide += '\n';
  }

  // Exercise settings
  guide += '## Träningsinställningar\n';
  if (recommendations.useRPE) {
    guide += `- Använd RPE (ansträngningsskala) ${recommendations.targetRPE?.min}-${recommendations.targetRPE?.max} istället för puls\n`;
  }
  guide += `- Uppvärmning: minst ${recommendations.warmupMinutes} minuter\n`;
  guide += `- Nedvarvning: minst ${recommendations.cooldownMinutes} minuter\n`;
  guide += `- Vätskeintag: minst ${recommendations.hydrationML}ml före träning\n\n`;

  // Activities to avoid
  if (recommendations.avoidActivities.length > 0) {
    guide += '## Aktiviteter att undvika\n';
    for (const activity of recommendations.avoidActivities) {
      guide += `- ${activity}\n`;
    }
    guide += '\n';
  }

  // Preferred activities
  if (recommendations.preferActivities.length > 0) {
    guide += '## Rekommenderade aktiviteter\n';
    for (const activity of recommendations.preferActivities) {
      guide += `- ${activity}\n`;
    }
    guide += '\n';
  }

  // Monitoring
  if (safetyCheck.monitoringPlan.length > 0) {
    guide += '## Övervakning\n';
    for (const mon of safetyCheck.monitoringPlan) {
      guide += `- ${mon.parameter}: ${mon.notes}\n`;
    }
    guide += '\n';
  }

  guide += '\n---\n*Detta är automatiskt genererad information. Rådgör alltid med din läkare eller fysioterapeut.*';

  return guide;
}
