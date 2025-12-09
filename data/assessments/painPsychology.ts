/**
 * Pain Psychology Assessment Scales
 *
 * Validated psychological assessment instruments for pain-related beliefs,
 * behaviors, and coping mechanisms.
 *
 * Based on:
 * - Pain Catastrophizing Scale (Sullivan et al., 1995)
 * - Fear-Avoidance Beliefs Questionnaire (Waddell et al., 1993)
 * - Tampa Scale for Kinesiophobia (Kori et al., 1990)
 * - Central Sensitization Inventory (Mayer et al., 2012)
 *
 * IMPORTANT: These are screening tools. High scores warrant referral to
 * pain psychologist or specialized multidisciplinary pain program.
 */

// Types
export interface AssessmentQuestion {
  id: string;
  text: string;
  textSv: string; // Swedish translation
  min: number;
  max: number;
  subscale?: string;
  reverseScored?: boolean;
}

export interface AssessmentScale {
  id: string;
  name: string;
  nameSv: string;
  description: string;
  descriptionSv: string;
  questions: AssessmentQuestion[];
  subscales?: {
    name: string;
    questionIds: string[];
    description: string;
  }[];
  scoring: {
    totalRange: { min: number; max: number };
    interpretation: {
      range: { min: number; max: number };
      level: 'low' | 'subclinical' | 'moderate' | 'high' | 'severe';
      description: string;
      descriptionSv: string;
      clinicalAction: string;
    }[];
  };
  adminTime: number; // minutes
  reliability: {
    cronbachAlpha: number;
    testRetest: number;
  };
  references: string[];
}

export interface AssessmentResult {
  scaleId: string;
  totalScore: number;
  subscaleScores?: Record<string, number>;
  interpretation: {
    level: string;
    description: string;
    clinicalAction: string;
  };
  answeredAt: string;
  answers: Record<string, number>;
}

export interface PatientPsychologicalProfile {
  catastrophizing: AssessmentResult | null;
  fearAvoidance: AssessmentResult | null;
  kinesiophobia: AssessmentResult | null;
  centralSensitization: AssessmentResult | null;
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  recommendations: string[];
  referralNeeded: boolean;
  referralType?: string[];
}

// ===== PAIN CATASTROPHIZING SCALE (PCS) =====
export const PCS_SCALE: AssessmentScale = {
  id: 'pcs',
  name: 'Pain Catastrophizing Scale',
  nameSv: 'Smärtkatastrofieringsskalan',
  description: 'Measures catastrophic thinking related to pain experiences',
  descriptionSv: 'Mäter katastrofierande tankemönster relaterade till smärtupplevelser',
  questions: [
    // Rumination subscale
    {
      id: 'pcs_1',
      text: "I can't seem to keep it out of my mind",
      textSv: 'Jag kan inte sluta tänka på smärtan',
      min: 0,
      max: 4,
      subscale: 'rumination'
    },
    {
      id: 'pcs_2',
      text: 'I keep thinking about how much it hurts',
      textSv: 'Jag tänker hela tiden på hur ont det gör',
      min: 0,
      max: 4,
      subscale: 'rumination'
    },
    {
      id: 'pcs_3',
      text: 'I keep thinking about how badly I want the pain to stop',
      textSv: 'Jag tänker hela tiden på hur gärna jag vill att smärtan ska sluta',
      min: 0,
      max: 4,
      subscale: 'rumination'
    },
    {
      id: 'pcs_4',
      text: "There's nothing I can do to reduce the intensity of the pain",
      textSv: 'Det finns inget jag kan göra för att minska smärtans intensitet',
      min: 0,
      max: 4,
      subscale: 'rumination'
    },
    // Magnification subscale
    {
      id: 'pcs_5',
      text: 'I worry all the time about whether the pain will end',
      textSv: 'Jag oroar mig hela tiden för om smärtan kommer att ta slut',
      min: 0,
      max: 4,
      subscale: 'magnification'
    },
    {
      id: 'pcs_6',
      text: 'I become afraid that the pain will get worse',
      textSv: 'Jag blir rädd att smärtan ska bli värre',
      min: 0,
      max: 4,
      subscale: 'magnification'
    },
    {
      id: 'pcs_7',
      text: 'I think of other painful events',
      textSv: 'Jag tänker på andra smärtsamma upplevelser',
      min: 0,
      max: 4,
      subscale: 'magnification'
    },
    // Helplessness subscale
    {
      id: 'pcs_8',
      text: 'I anxiously want the pain to go away',
      textSv: 'Jag vill ängsligt att smärtan ska försvinna',
      min: 0,
      max: 4,
      subscale: 'helplessness'
    },
    {
      id: 'pcs_9',
      text: "I feel I can't stand it anymore",
      textSv: 'Jag känner att jag inte orkar mer',
      min: 0,
      max: 4,
      subscale: 'helplessness'
    },
    {
      id: 'pcs_10',
      text: "I feel I can't go on",
      textSv: 'Jag känner att jag inte kan fortsätta',
      min: 0,
      max: 4,
      subscale: 'helplessness'
    },
    {
      id: 'pcs_11',
      text: "It's terrible and I think it's never going to get any better",
      textSv: 'Det är hemskt och jag tror aldrig det blir bättre',
      min: 0,
      max: 4,
      subscale: 'helplessness'
    },
    {
      id: 'pcs_12',
      text: 'I wonder whether something serious may happen',
      textSv: 'Jag undrar om något allvarligt kan hända',
      min: 0,
      max: 4,
      subscale: 'helplessness'
    },
    {
      id: 'pcs_13',
      text: 'It becomes overwhelming',
      textSv: 'Det blir överväldigande',
      min: 0,
      max: 4,
      subscale: 'helplessness'
    }
  ],
  subscales: [
    {
      name: 'Rumination',
      questionIds: ['pcs_1', 'pcs_2', 'pcs_3', 'pcs_4'],
      description: 'Inability to stop thinking about pain'
    },
    {
      name: 'Magnification',
      questionIds: ['pcs_5', 'pcs_6', 'pcs_7'],
      description: 'Exaggeration of pain threat'
    },
    {
      name: 'Helplessness',
      questionIds: ['pcs_8', 'pcs_9', 'pcs_10', 'pcs_11', 'pcs_12', 'pcs_13'],
      description: 'Inability to cope with pain'
    }
  ],
  scoring: {
    totalRange: { min: 0, max: 52 },
    interpretation: [
      {
        range: { min: 0, max: 15 },
        level: 'low',
        description: 'Low catastrophizing - normal pain-related thoughts',
        descriptionSv: 'Låg katastrofiering - normala smärtrelaterade tankar',
        clinicalAction: 'Continue with standard rehabilitation'
      },
      {
        range: { min: 16, max: 20 },
        level: 'subclinical',
        description: 'Subclinical - minor elevation, monitor for changes',
        descriptionSv: 'Subklinisk - lätt förhöjt, övervaka förändringar',
        clinicalAction: 'Provide pain education and coping strategies'
      },
      {
        range: { min: 21, max: 30 },
        level: 'moderate',
        description: 'Moderate catastrophizing - consider psychological input',
        descriptionSv: 'Måttlig katastrofiering - överväg psykologisk insats',
        clinicalAction: 'Include CBT-based pain education, consider psychology referral'
      },
      {
        range: { min: 31, max: 40 },
        level: 'high',
        description: 'High catastrophizing - psychological intervention indicated',
        descriptionSv: 'Hög katastrofiering - psykologisk intervention indicerad',
        clinicalAction: 'Refer to pain psychology, limit passive treatments'
      },
      {
        range: { min: 41, max: 52 },
        level: 'severe',
        description: 'Severe catastrophizing - specialist pain program needed',
        descriptionSv: 'Svår katastrofiering - specialistprogram för smärta behövs',
        clinicalAction: 'Multidisciplinary pain rehabilitation program'
      }
    ]
  },
  adminTime: 5,
  reliability: {
    cronbachAlpha: 0.87,
    testRetest: 0.75
  },
  references: [
    'Sullivan MJL, Bishop SR, Pivik J. The Pain Catastrophizing Scale: Development and validation. Psychol Assess. 1995;7(4):524-532'
  ]
};

// ===== FEAR-AVOIDANCE BELIEFS QUESTIONNAIRE (FABQ) =====
export const FABQ_SCALE: AssessmentScale = {
  id: 'fabq',
  name: 'Fear-Avoidance Beliefs Questionnaire',
  nameSv: 'Frågeformulär om rörelserädsla',
  description: 'Assesses fear-avoidance beliefs about physical activity and work',
  descriptionSv: 'Bedömer rädsla-undvikande-tankemönster om fysisk aktivitet och arbete',
  questions: [
    // Physical activity subscale (FABQ-PA)
    {
      id: 'fabq_1',
      text: 'My pain was caused by physical activity',
      textSv: 'Min smärta orsakades av fysisk aktivitet',
      min: 0,
      max: 6,
      subscale: 'physical_activity'
    },
    {
      id: 'fabq_2',
      text: 'Physical activity makes my pain worse',
      textSv: 'Fysisk aktivitet gör min smärta värre',
      min: 0,
      max: 6,
      subscale: 'physical_activity'
    },
    {
      id: 'fabq_3',
      text: 'Physical activity might harm my back',
      textSv: 'Fysisk aktivitet kan skada min rygg',
      min: 0,
      max: 6,
      subscale: 'physical_activity'
    },
    {
      id: 'fabq_4',
      text: 'I should not do physical activities which (might) make my pain worse',
      textSv: 'Jag borde inte göra fysiska aktiviteter som (kan) göra min smärta värre',
      min: 0,
      max: 6,
      subscale: 'physical_activity'
    },
    {
      id: 'fabq_5',
      text: 'I cannot do physical activities which (might) make my pain worse',
      textSv: 'Jag kan inte göra fysiska aktiviteter som (kan) göra min smärta värre',
      min: 0,
      max: 6,
      subscale: 'physical_activity'
    },
    // Work subscale (FABQ-W)
    {
      id: 'fabq_6',
      text: 'My pain was caused by my work or by an accident at work',
      textSv: 'Min smärta orsakades av mitt arbete eller en olycka på arbetet',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_7',
      text: 'My work aggravated my pain',
      textSv: 'Mitt arbete förvärrade min smärta',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_8',
      text: 'I have a claim for compensation for my pain',
      textSv: 'Jag har ett försäkringsärende för min smärta',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_9',
      text: 'My work is too heavy for me',
      textSv: 'Mitt arbete är för tungt för mig',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_10',
      text: 'My work makes or would make my pain worse',
      textSv: 'Mitt arbete gör eller skulle göra min smärta värre',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_11',
      text: 'My work might harm my back',
      textSv: 'Mitt arbete kan skada min rygg',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_12',
      text: 'I should not do my normal work with my present pain',
      textSv: 'Jag borde inte göra mitt vanliga arbete med min nuvarande smärta',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_13',
      text: 'I cannot do my normal work with my present pain',
      textSv: 'Jag kan inte göra mitt vanliga arbete med min nuvarande smärta',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_14',
      text: 'I cannot do my normal work until my pain is treated',
      textSv: 'Jag kan inte göra mitt vanliga arbete förrän min smärta är behandlad',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_15',
      text: "I do not think that I will be back to my normal work within 3 months",
      textSv: 'Jag tror inte att jag kommer tillbaka till mitt vanliga arbete inom 3 månader',
      min: 0,
      max: 6,
      subscale: 'work'
    },
    {
      id: 'fabq_16',
      text: 'I do not think that I will ever be able to go back to that work',
      textSv: 'Jag tror inte att jag någonsin kommer kunna gå tillbaka till det arbetet',
      min: 0,
      max: 6,
      subscale: 'work'
    }
  ],
  subscales: [
    {
      name: 'Physical Activity (FABQ-PA)',
      questionIds: ['fabq_2', 'fabq_3', 'fabq_4', 'fabq_5'],
      description: 'Fear-avoidance beliefs about physical activity'
    },
    {
      name: 'Work (FABQ-W)',
      questionIds: ['fabq_6', 'fabq_7', 'fabq_9', 'fabq_10', 'fabq_11', 'fabq_12', 'fabq_15'],
      description: 'Fear-avoidance beliefs about work'
    }
  ],
  scoring: {
    totalRange: { min: 0, max: 96 },
    interpretation: [
      {
        range: { min: 0, max: 14 },
        level: 'low',
        description: 'Low fear-avoidance - good prognosis',
        descriptionSv: 'Låg rörelserädsla - god prognos',
        clinicalAction: 'Standard active rehabilitation'
      },
      {
        range: { min: 15, max: 24 },
        level: 'subclinical',
        description: 'Subclinical - some avoidance behaviors present',
        descriptionSv: 'Subklinisk - vissa undvikande beteenden',
        clinicalAction: 'Activity pacing education, gradual exposure'
      },
      {
        range: { min: 25, max: 40 },
        level: 'moderate',
        description: 'Moderate fear-avoidance - affects recovery',
        descriptionSv: 'Måttlig rörelserädsla - påverkar återhämtning',
        clinicalAction: 'Graded activity, pain neuroscience education'
      },
      {
        range: { min: 41, max: 60 },
        level: 'high',
        description: 'High fear-avoidance - major barrier to recovery',
        descriptionSv: 'Hög rörelserädsla - stort hinder för återhämtning',
        clinicalAction: 'Graded exposure therapy, psychology referral'
      },
      {
        range: { min: 61, max: 96 },
        level: 'severe',
        description: 'Severe fear-avoidance - chronic pain risk',
        descriptionSv: 'Svår rörelserädsla - risk för kronisk smärta',
        clinicalAction: 'Multidisciplinary pain program mandatory'
      }
    ]
  },
  adminTime: 5,
  reliability: {
    cronbachAlpha: 0.88,
    testRetest: 0.74
  },
  references: [
    'Waddell G, Newton M, Henderson I, et al. A Fear-Avoidance Beliefs Questionnaire (FABQ) and the role of fear-avoidance beliefs in chronic low back pain and disability. Pain. 1993;52(2):157-168'
  ]
};

// ===== TAMPA SCALE FOR KINESIOPHOBIA (TSK) =====
export const TSK_SCALE: AssessmentScale = {
  id: 'tsk',
  name: 'Tampa Scale for Kinesiophobia',
  nameSv: 'Tampa-skalan för kinesiofobi',
  description: 'Measures fear of movement and re-injury',
  descriptionSv: 'Mäter rädsla för rörelse och återskada',
  questions: [
    {
      id: 'tsk_1',
      text: "I'm afraid that I might injure myself if I exercise",
      textSv: 'Jag är rädd att jag kan skada mig om jag tränar',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_2',
      text: "If I were to try to overcome it, my pain would increase",
      textSv: 'Om jag försökte övervinna smärtan skulle den öka',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_3',
      text: "My body is telling me I have something dangerously wrong",
      textSv: 'Min kropp säger mig att något är farligt fel',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_4',
      text: "My pain would probably be relieved if I were to exercise",
      textSv: 'Min smärta skulle förmodligen lindras om jag tränade',
      min: 1,
      max: 4,
      reverseScored: true
    },
    {
      id: 'tsk_5',
      text: "People aren't taking my medical condition seriously enough",
      textSv: 'Folk tar inte mitt medicinska tillstånd tillräckligt seriöst',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_6',
      text: "My accident has put my body at risk for the rest of my life",
      textSv: 'Min skada har satt min kropp i riskzonen för resten av livet',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_7',
      text: "Pain always means I have injured my body",
      textSv: 'Smärta betyder alltid att jag har skadat min kropp',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_8',
      text: "Just because something aggravates my pain does not mean it is dangerous",
      textSv: 'Bara för att något förvärrar min smärta betyder det inte att det är farligt',
      min: 1,
      max: 4,
      reverseScored: true
    },
    {
      id: 'tsk_9',
      text: "I am afraid that I might injure myself accidentally",
      textSv: 'Jag är rädd att jag kan skada mig av misstag',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_10',
      text: "Simply being careful that I do not make any unnecessary movements is the safest thing I can do",
      textSv: 'Det säkraste jag kan göra är att vara försiktig så jag inte gör onödiga rörelser',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_11',
      text: "I wouldn't have this much pain if there wasn't something potentially dangerous going on",
      textSv: 'Jag skulle inte ha så ont om det inte pågick något potentiellt farligt',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_12',
      text: "Although my condition is painful, I would be better off if I were physically active",
      textSv: 'Även om mitt tillstånd är smärtsamt skulle jag må bättre om jag var fysiskt aktiv',
      min: 1,
      max: 4,
      reverseScored: true
    },
    {
      id: 'tsk_13',
      text: "Pain lets me know when to stop exercising so that I don't injure myself",
      textSv: 'Smärta säger mig när jag ska sluta träna så att jag inte skadar mig',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_14',
      text: "It's really not safe for a person with a condition like mine to be physically active",
      textSv: 'Det är verkligen inte säkert för en person med mitt tillstånd att vara fysiskt aktiv',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_15',
      text: "I can't do all the things normal people do because it's too easy for me to get injured",
      textSv: 'Jag kan inte göra allt som normala människor gör eftersom det är för lätt för mig att skada mig',
      min: 1,
      max: 4
    },
    {
      id: 'tsk_16',
      text: "Even though something is causing me a lot of pain, I don't think it's actually dangerous",
      textSv: 'Även om något orsakar mig mycket smärta tror jag inte det är farligt',
      min: 1,
      max: 4,
      reverseScored: true
    },
    {
      id: 'tsk_17',
      text: "No one should have to exercise when he/she is in pain",
      textSv: 'Ingen borde behöva träna när hen har ont',
      min: 1,
      max: 4
    }
  ],
  scoring: {
    totalRange: { min: 17, max: 68 },
    interpretation: [
      {
        range: { min: 17, max: 30 },
        level: 'low',
        description: 'Low kinesiophobia - movement confidence',
        descriptionSv: 'Låg kinesiofobi - rörelsesäkerhet',
        clinicalAction: 'Progress with active rehabilitation'
      },
      {
        range: { min: 31, max: 36 },
        level: 'subclinical',
        description: 'Subclinical kinesiophobia',
        descriptionSv: 'Subklinisk kinesiofobi',
        clinicalAction: 'Education about pain and movement'
      },
      {
        range: { min: 37, max: 44 },
        level: 'moderate',
        description: 'Moderate kinesiophobia - affects activity level',
        descriptionSv: 'Måttlig kinesiofobi - påverkar aktivitetsnivå',
        clinicalAction: 'Graded exposure, pain neuroscience education'
      },
      {
        range: { min: 45, max: 54 },
        level: 'high',
        description: 'High kinesiophobia - significant barrier',
        descriptionSv: 'Hög kinesiofobi - betydande hinder',
        clinicalAction: 'Structured graded exposure with psychology support'
      },
      {
        range: { min: 55, max: 68 },
        level: 'severe',
        description: 'Severe kinesiophobia - disabling fear',
        descriptionSv: 'Svår kinesiofobi - funktionsnedsättande rädsla',
        clinicalAction: 'Specialist pain psychology/psychiatry referral'
      }
    ]
  },
  adminTime: 5,
  reliability: {
    cronbachAlpha: 0.80,
    testRetest: 0.78
  },
  references: [
    'Kori SH, Miller RP, Todd DD. Kinesiophobia: A new view of chronic pain behavior. Pain Management. 1990;3:35-43'
  ]
};

// ===== CENTRAL SENSITIZATION INVENTORY (CSI) =====
export const CSI_SCALE: AssessmentScale = {
  id: 'csi',
  name: 'Central Sensitization Inventory',
  nameSv: 'Centralt Sensitiserings-Index',
  description: 'Screens for symptoms of central sensitization',
  descriptionSv: 'Screening för symtom på central sensitisering',
  questions: [
    {
      id: 'csi_1',
      text: 'I feel unrefreshed when I wake up in the morning',
      textSv: 'Jag känner mig inte utvilad när jag vaknar på morgonen',
      min: 0,
      max: 4
    },
    {
      id: 'csi_2',
      text: 'My muscles feel stiff and achy',
      textSv: 'Mina muskler känns stela och ömmande',
      min: 0,
      max: 4
    },
    {
      id: 'csi_3',
      text: 'I have anxiety attacks',
      textSv: 'Jag har ångestattacker',
      min: 0,
      max: 4
    },
    {
      id: 'csi_4',
      text: 'I grind or clench my teeth',
      textSv: 'Jag gnisslar eller pressar ihop tänderna',
      min: 0,
      max: 4
    },
    {
      id: 'csi_5',
      text: 'I have problems with diarrhea and/or constipation',
      textSv: 'Jag har problem med diarré och/eller förstoppning',
      min: 0,
      max: 4
    },
    {
      id: 'csi_6',
      text: 'I need help in performing my daily activities',
      textSv: 'Jag behöver hjälp med dagliga aktiviteter',
      min: 0,
      max: 4
    },
    {
      id: 'csi_7',
      text: 'I am sensitive to bright lights',
      textSv: 'Jag är känslig för starkt ljus',
      min: 0,
      max: 4
    },
    {
      id: 'csi_8',
      text: 'I get tired very easily when I am physically active',
      textSv: 'Jag blir väldigt trött av fysisk aktivitet',
      min: 0,
      max: 4
    },
    {
      id: 'csi_9',
      text: 'I feel pain all over my body',
      textSv: 'Jag känner smärta i hela kroppen',
      min: 0,
      max: 4
    },
    {
      id: 'csi_10',
      text: 'I have headaches',
      textSv: 'Jag har huvudvärk',
      min: 0,
      max: 4
    },
    {
      id: 'csi_11',
      text: 'I feel discomfort in my bladder and/or burning when I urinate',
      textSv: 'Jag känner obehag i urinblåsan och/eller sveda när jag kissar',
      min: 0,
      max: 4
    },
    {
      id: 'csi_12',
      text: 'I do not sleep well',
      textSv: 'Jag sover inte bra',
      min: 0,
      max: 4
    },
    {
      id: 'csi_13',
      text: 'I have difficulty concentrating',
      textSv: 'Jag har svårt att koncentrera mig',
      min: 0,
      max: 4
    },
    {
      id: 'csi_14',
      text: 'I have skin problems such as dryness, itchiness, or rashes',
      textSv: 'Jag har hudproblem som torrhet, klåda eller utslag',
      min: 0,
      max: 4
    },
    {
      id: 'csi_15',
      text: 'Stress makes my physical symptoms get worse',
      textSv: 'Stress gör att mina fysiska symtom blir värre',
      min: 0,
      max: 4
    },
    {
      id: 'csi_16',
      text: 'I feel sad or depressed',
      textSv: 'Jag känner mig ledsen eller nedstämd',
      min: 0,
      max: 4
    },
    {
      id: 'csi_17',
      text: 'I have low energy',
      textSv: 'Jag har låg energi',
      min: 0,
      max: 4
    },
    {
      id: 'csi_18',
      text: 'I have muscle tension in my neck and shoulders',
      textSv: 'Jag har muskelspänningar i nacke och axlar',
      min: 0,
      max: 4
    },
    {
      id: 'csi_19',
      text: 'I have pain in my jaw',
      textSv: 'Jag har smärta i käken',
      min: 0,
      max: 4
    },
    {
      id: 'csi_20',
      text: 'Certain smells, such as perfumes, make me feel dizzy and nauseated',
      textSv: 'Vissa lukter, som parfym, gör mig yr och illamående',
      min: 0,
      max: 4
    },
    {
      id: 'csi_21',
      text: 'I have to urinate frequently',
      textSv: 'Jag måste kissa ofta',
      min: 0,
      max: 4
    },
    {
      id: 'csi_22',
      text: 'My legs feel uncomfortable and restless when I am trying to go to sleep at night',
      textSv: 'Mina ben känns obekväma och rastlösa när jag ska sova',
      min: 0,
      max: 4
    },
    {
      id: 'csi_23',
      text: 'I have difficulty remembering things',
      textSv: 'Jag har svårt att minnas saker',
      min: 0,
      max: 4
    },
    {
      id: 'csi_24',
      text: 'I suffered trauma as a child',
      textSv: 'Jag upplevde trauma som barn',
      min: 0,
      max: 4
    },
    {
      id: 'csi_25',
      text: 'I have pain in my pelvic area',
      textSv: 'Jag har smärta i bäckenområdet',
      min: 0,
      max: 4
    }
  ],
  scoring: {
    totalRange: { min: 0, max: 100 },
    interpretation: [
      {
        range: { min: 0, max: 29 },
        level: 'low',
        description: 'Subclinical - no evidence of central sensitization',
        descriptionSv: 'Subklinisk - ingen evidens för central sensitisering',
        clinicalAction: 'Standard rehabilitation approach'
      },
      {
        range: { min: 30, max: 39 },
        level: 'subclinical',
        description: 'Borderline - possible mild central sensitization',
        descriptionSv: 'Gränsvärde - möjlig mild central sensitisering',
        clinicalAction: 'Pain neuroscience education, monitor'
      },
      {
        range: { min: 40, max: 49 },
        level: 'moderate',
        description: 'Moderate - likely central sensitization present',
        descriptionSv: 'Måttlig - trolig central sensitisering',
        clinicalAction: 'Multimodal approach including CNS-targeted treatment'
      },
      {
        range: { min: 50, max: 69 },
        level: 'high',
        description: 'High - central sensitization syndrome likely',
        descriptionSv: 'Hög - central sensitiseringssyndrom troligt',
        clinicalAction: 'Specialist pain medicine referral'
      },
      {
        range: { min: 70, max: 100 },
        level: 'severe',
        description: 'Severe - significant central sensitization',
        descriptionSv: 'Svår - signifikant central sensitisering',
        clinicalAction: 'Multidisciplinary pain program essential'
      }
    ]
  },
  adminTime: 10,
  reliability: {
    cronbachAlpha: 0.92,
    testRetest: 0.82
  },
  references: [
    'Mayer TG, Neblett R, Cohen H, et al. The development and psychometric validation of the central sensitization inventory. Pain Pract. 2012;12(4):276-285'
  ]
};

// ===== ÖREBRO MUSCULOSKELETAL PAIN SCREENING QUESTIONNAIRE (SHORT FORM) =====
export const OMPSQ_SHORT: AssessmentScale = {
  id: 'ompsq_short',
  name: 'Örebro Musculoskeletal Pain Screening Questionnaire (Short Form)',
  nameSv: 'Örebro muskuloskeletalt smärtformulär (Kortversion)',
  description: 'Predicts risk of poor recovery from acute musculoskeletal pain',
  descriptionSv: 'Förutsäger risk för dålig återhämtning från akut muskuloskeletal smärta',
  questions: [
    {
      id: 'ompsq_1',
      text: 'How long have you had your current pain problem?',
      textSv: 'Hur länge har du haft ditt nuvarande smärtproblem?',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_2',
      text: 'How would you rate the pain that you have had during the past week? (0 = no pain, 10 = worst possible pain)',
      textSv: 'Hur skulle du skatta smärtan du haft den senaste veckan? (0 = ingen smärta, 10 = värsta möjliga smärta)',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_3',
      text: 'How tense or anxious have you felt in the past week? (0 = absolutely calm, 10 = as tense as possible)',
      textSv: 'Hur spänd eller orolig har du känt dig den senaste veckan?',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_4',
      text: 'How much have you been bothered by feeling depressed in the past week?',
      textSv: 'Hur mycket har du besvärats av nedstämdhet den senaste veckan?',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_5',
      text: 'In your view, how large is the risk that your current pain may become persistent?',
      textSv: 'Hur stor är risken enligt dig att din nuvarande smärta blir bestående?',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_6',
      text: 'In your estimation, what are the chances that you will be able to work in 6 months?',
      textSv: 'Hur stor är chansen att du kan arbeta om 6 månader?',
      min: 0,
      max: 10,
      reverseScored: true
    },
    {
      id: 'ompsq_7',
      text: 'How satisfied are you with your work? (Not employed = leave blank)',
      textSv: 'Hur nöjd är du med ditt arbete? (Ej anställd = lämna blankt)',
      min: 0,
      max: 10,
      reverseScored: true
    },
    {
      id: 'ompsq_8',
      text: 'Physical activity makes my pain worse',
      textSv: 'Fysisk aktivitet gör min smärta värre',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_9',
      text: 'An increase in pain is an indication that I should stop what I am doing',
      textSv: 'Ökad smärta är en signal att jag borde sluta med det jag gör',
      min: 0,
      max: 10
    },
    {
      id: 'ompsq_10',
      text: 'I should not do my normal work with my present pain',
      textSv: 'Jag borde inte göra mitt vanliga arbete med min nuvarande smärta',
      min: 0,
      max: 10
    }
  ],
  scoring: {
    totalRange: { min: 0, max: 100 },
    interpretation: [
      {
        range: { min: 0, max: 39 },
        level: 'low',
        description: 'Low risk - good prognosis for recovery',
        descriptionSv: 'Låg risk - god prognos för återhämtning',
        clinicalAction: 'Standard care, activity encouragement'
      },
      {
        range: { min: 40, max: 49 },
        level: 'subclinical',
        description: 'Low-moderate risk',
        descriptionSv: 'Låg-måttlig risk',
        clinicalAction: 'Brief cognitive-behavioral intervention'
      },
      {
        range: { min: 50, max: 59 },
        level: 'moderate',
        description: 'Moderate risk - monitor closely',
        descriptionSv: 'Måttlig risk - följ noga',
        clinicalAction: 'Early psychologically informed intervention'
      },
      {
        range: { min: 60, max: 79 },
        level: 'high',
        description: 'High risk of poor recovery',
        descriptionSv: 'Hög risk för dålig återhämtning',
        clinicalAction: 'Multimodal rehabilitation program'
      },
      {
        range: { min: 80, max: 100 },
        level: 'severe',
        description: 'Very high risk of chronicity',
        descriptionSv: 'Mycket hög risk för kronifiering',
        clinicalAction: 'Intensive multidisciplinary intervention'
      }
    ]
  },
  adminTime: 5,
  reliability: {
    cronbachAlpha: 0.73,
    testRetest: 0.83
  },
  references: [
    'Linton SJ, Halldén K. Can we screen for problematic back pain? A screening questionnaire for predicting outcome. Clin J Pain. 1998;14(3):209-215',
    'Linton SJ, Nicholas M, MacDonald S. Development of a short form of the Örebro Musculoskeletal Pain Screening Questionnaire. Spine. 2011;36(22):1891-1895'
  ]
};

// ===== SCORING FUNCTIONS =====

/**
 * Calculate score for an assessment
 */
export function scoreAssessment(
  scale: AssessmentScale,
  answers: Record<string, number>
): AssessmentResult {
  // Calculate total score with reverse scoring
  let totalScore = 0;
  const subscaleScores: Record<string, number> = {};

  for (const question of scale.questions) {
    let score = answers[question.id] ?? 0;

    // Handle reverse scoring
    if (question.reverseScored) {
      score = question.max - score + question.min;
    }

    totalScore += score;

    // Track subscale scores
    if (question.subscale) {
      subscaleScores[question.subscale] = (subscaleScores[question.subscale] || 0) + score;
    }
  }

  // Find interpretation
  let interpretation = scale.scoring.interpretation[0];
  for (const interp of scale.scoring.interpretation) {
    if (totalScore >= interp.range.min && totalScore <= interp.range.max) {
      interpretation = interp;
      break;
    }
  }

  return {
    scaleId: scale.id,
    totalScore,
    subscaleScores: Object.keys(subscaleScores).length > 0 ? subscaleScores : undefined,
    interpretation: {
      level: interpretation.level,
      description: interpretation.description,
      clinicalAction: interpretation.clinicalAction
    },
    answeredAt: new Date().toISOString(),
    answers
  };
}

/**
 * Calculate FABQ subscale scores specifically
 */
export function scoreFABQ(
  answers: Record<string, number>
): {
  total: number;
  physicalActivity: number;
  work: number;
  interpretation: string;
} {
  // FABQ-PA: items 2, 3, 4, 5 (0-24)
  const paItems = ['fabq_2', 'fabq_3', 'fabq_4', 'fabq_5'];
  const physicalActivity = paItems.reduce((sum, id) => sum + (answers[id] || 0), 0);

  // FABQ-W: items 6, 7, 9, 10, 11, 12, 15 (0-42)
  const workItems = ['fabq_6', 'fabq_7', 'fabq_9', 'fabq_10', 'fabq_11', 'fabq_12', 'fabq_15'];
  const work = workItems.reduce((sum, id) => sum + (answers[id] || 0), 0);

  const total = physicalActivity + work;

  let interpretation = '';
  if (physicalActivity >= 15) {
    interpretation += 'Hög rädsla-undvikande för fysisk aktivitet (FABQ-PA ≥15). ';
  }
  if (work >= 25) {
    interpretation += 'Hög rädsla-undvikande för arbete (FABQ-W ≥25). ';
  }
  if (!interpretation) {
    interpretation = 'Normala nivåer av rädsla-undvikande.';
  }

  return { total, physicalActivity, work, interpretation };
}

/**
 * Create comprehensive psychological profile
 */
export function createPsychologicalProfile(
  results: {
    pcs?: AssessmentResult;
    fabq?: AssessmentResult;
    tsk?: AssessmentResult;
    csi?: AssessmentResult;
    ompsq?: AssessmentResult;
  }
): PatientPsychologicalProfile {
  const recommendations: string[] = [];
  let referralNeeded = false;
  const referralTypes: string[] = [];
  const levels: string[] = [];

  // Analyze PCS
  if (results.pcs) {
    levels.push(results.pcs.interpretation.level);
    if (['high', 'severe'].includes(results.pcs.interpretation.level)) {
      recommendations.push('Smärtkatastrofiering kräver kognitiv beteendeterapi (KBT)');
      referralNeeded = true;
      referralTypes.push('Smärtpsykolog');
    } else if (results.pcs.interpretation.level === 'moderate') {
      recommendations.push('Inkludera smärtedukation och copingstrategier');
    }
  }

  // Analyze FABQ
  if (results.fabq) {
    levels.push(results.fabq.interpretation.level);
    if (['high', 'severe'].includes(results.fabq.interpretation.level)) {
      recommendations.push('Gradvis exponering och rörelseträning indicerat');
      referralNeeded = true;
      referralTypes.push('Smärtrehabteam');
    } else if (results.fabq.interpretation.level === 'moderate') {
      recommendations.push('Aktivitetsträning med pacing');
    }
  }

  // Analyze TSK
  if (results.tsk) {
    levels.push(results.tsk.interpretation.level);
    if (['high', 'severe'].includes(results.tsk.interpretation.level)) {
      recommendations.push('Strukturerad gradvis exponering för kinesiofobi');
      referralNeeded = true;
    }
  }

  // Analyze CSI
  if (results.csi) {
    levels.push(results.csi.interpretation.level);
    if (['high', 'severe'].includes(results.csi.interpretation.level)) {
      recommendations.push('Central sensitisering kräver multimodal smärtbehandling');
      recommendations.push('Fokusera på CNS-nedreglering snarare än lokal vävnadsbehandling');
      referralNeeded = true;
      referralTypes.push('Smärtspecialist/läkare');
    }
  }

  // Analyze OMPSQ
  if (results.ompsq) {
    levels.push(results.ompsq.interpretation.level);
    if (['high', 'severe'].includes(results.ompsq.interpretation.level)) {
      recommendations.push('Hög risk för kronifiering - tidig intensiv intervention');
      referralNeeded = true;
      referralTypes.push('Multimodalt smärtrehab-team');
    }
  }

  // Determine overall risk
  let overallRiskLevel: PatientPsychologicalProfile['overallRiskLevel'] = 'low';
  const severeCount = levels.filter(l => l === 'severe').length;
  const highCount = levels.filter(l => l === 'high').length;
  const moderateCount = levels.filter(l => l === 'moderate').length;

  if (severeCount >= 2 || (severeCount >= 1 && highCount >= 2)) {
    overallRiskLevel = 'very_high';
    recommendations.unshift('⛔ MYCKET HÖG RISK - Multimodal specialistbehandling krävs');
  } else if (severeCount >= 1 || highCount >= 2) {
    overallRiskLevel = 'high';
    recommendations.unshift('⚠️ HÖG RISK - Psykologisk intervention rekommenderas');
  } else if (highCount >= 1 || moderateCount >= 2) {
    overallRiskLevel = 'moderate';
    recommendations.unshift('⚡ MÅTTLIG RISK - Inkludera psykologiskt informerad vård');
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push('Normala psykologiska parametrar - fortsätt standardrehabilitering');
  }

  return {
    catastrophizing: results.pcs || null,
    fearAvoidance: results.fabq || null,
    kinesiophobia: results.tsk || null,
    centralSensitization: results.csi || null,
    overallRiskLevel,
    recommendations: [...new Set(recommendations)],
    referralNeeded,
    referralType: referralNeeded ? [...new Set(referralTypes)] : undefined
  };
}

/**
 * Get appropriate scales for patient condition
 */
export function getRecommendedScales(
  condition: string,
  chronicity: 'acute' | 'subacute' | 'chronic'
): AssessmentScale[] {
  const scales: AssessmentScale[] = [];

  // Always include Örebro for acute/subacute
  if (chronicity !== 'chronic') {
    scales.push(OMPSQ_SHORT);
  }

  // Always include FABQ for musculoskeletal
  scales.push(FABQ_SCALE);

  // PCS for moderate-severe pain or chronic conditions
  if (chronicity === 'chronic') {
    scales.push(PCS_SCALE);
    scales.push(TSK_SCALE);
  }

  // CSI for widespread pain, fibromyalgia-like symptoms
  if (condition.toLowerCase().includes('fibromyalgi') ||
      condition.toLowerCase().includes('widespread') ||
      condition.toLowerCase().includes('utbredd smärta')) {
    scales.push(CSI_SCALE);
  }

  return scales;
}

// Export all scales
export const ALL_PAIN_PSYCHOLOGY_SCALES: AssessmentScale[] = [
  PCS_SCALE,
  FABQ_SCALE,
  TSK_SCALE,
  CSI_SCALE,
  OMPSQ_SHORT
];
