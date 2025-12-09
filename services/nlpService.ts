/**
 * NLPService - Sprint 5.24
 *
 * Natural Language Processing för RehabFlow med:
 * - Textanalys och sentiment
 * - Named Entity Recognition (NER)
 * - Textklassificering
 * - Sammanfattning
 * - Nyckelordsextraktion
 * - Språkdetektering
 * - Svensk språkstöd
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SentimentScore = 'positive' | 'negative' | 'neutral';
export type EntityType = 'person' | 'organization' | 'location' | 'date' | 'time' | 'money' | 'percent' | 'exercise' | 'body_part' | 'symptom' | 'medication';

export interface TextAnalysis {
  text: string;
  language: string;
  wordCount: number;
  sentenceCount: number;
  characterCount: number;
  readabilityScore: number;
  tokens: Token[];
}

export interface Token {
  text: string;
  lemma: string;
  pos: PartOfSpeech;
  start: number;
  end: number;
  isStopWord: boolean;
}

export type PartOfSpeech =
  | 'NOUN' | 'VERB' | 'ADJ' | 'ADV' | 'PRON'
  | 'DET' | 'ADP' | 'CONJ' | 'NUM' | 'PUNCT'
  | 'INTJ' | 'SYM' | 'X';

export interface SentimentResult {
  score: number; // -1 till 1
  label: SentimentScore;
  confidence: number;
  sentences: SentenceSentiment[];
}

export interface SentenceSentiment {
  text: string;
  score: number;
  label: SentimentScore;
}

export interface Entity {
  text: string;
  type: EntityType;
  start: number;
  end: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface ClassificationResult {
  label: string;
  confidence: number;
  allScores: { label: string; score: number }[];
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  ratio: number;
}

export interface KeywordResult {
  keyword: string;
  score: number;
  frequency: number;
}

export interface LanguageDetection {
  language: string;
  confidence: number;
  alternatives: { language: string; confidence: number }[];
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Entity[];
  slots: Record<string, string>;
}

export interface NLPConfig {
  language?: string;
  useCache?: boolean;
  maxCacheSize?: number;
}

// ============================================================================
// SWEDISH LANGUAGE DATA
// ============================================================================

const SWEDISH_STOP_WORDS = new Set([
  'och', 'i', 'att', 'det', 'som', 'en', 'på', 'är', 'av', 'för',
  'med', 'till', 'den', 'har', 'de', 'inte', 'om', 'ett', 'men', 'var',
  'jag', 'hon', 'han', 'vi', 'ni', 'dem', 'min', 'din', 'sin', 'sig',
  'så', 'kan', 'nu', 'mot', 'här', 'där', 'eller', 'när', 'om', 'ut',
  'vid', 'från', 'ska', 'skulle', 'ha', 'hade', 'blev', 'bli', 'blir',
  'denna', 'detta', 'dessa', 'under', 'efter', 'före', 'mellan', 'genom'
]);

const SWEDISH_POSITIVE_WORDS = new Set([
  'bra', 'fantastisk', 'underbar', 'utmärkt', 'perfekt', 'härlig',
  'glad', 'nöjd', 'positiv', 'lycka', 'framgång', 'förbättring',
  'stark', 'frisk', 'hälsosam', 'energisk', 'motiverad', 'inspirerad',
  'imponerad', 'tacksam', 'stolt', 'optimistisk', 'entusiastisk'
]);

const SWEDISH_NEGATIVE_WORDS = new Set([
  'dålig', 'hemskt', 'fruktansvärd', 'svår', 'ont', 'smärta',
  'trött', 'utmattad', 'ledsen', 'orolig', 'rädd', 'stressad',
  'svag', 'sjuk', 'problem', 'besvär', 'skada', 'inflammation',
  'fel', 'misslyckad', 'negativ', 'hopplös', 'frustrerande'
]);

const REHAB_ENTITIES: Record<string, EntityType> = {
  // Kroppsdelar
  'knä': 'body_part', 'höft': 'body_part', 'axel': 'body_part',
  'rygg': 'body_part', 'nacke': 'body_part', 'handled': 'body_part',
  'armbåge': 'body_part', 'fotled': 'body_part', 'ben': 'body_part',
  'arm': 'body_part', 'hand': 'body_part', 'fot': 'body_part',

  // Symptom
  'smärta': 'symptom', 'värk': 'symptom', 'stelhet': 'symptom',
  'svullnad': 'symptom', 'domningar': 'symptom', 'yrsel': 'symptom',
  'huvudvärk': 'symptom', 'trötthet': 'symptom', 'svaghet': 'symptom',

  // Övningar
  'stretch': 'exercise', 'styrketräning': 'exercise', 'balansövning': 'exercise',
  'knäböj': 'exercise', 'plankan': 'exercise', 'utfall': 'exercise',
  'mobilitet': 'exercise', 'rörlighet': 'exercise', 'kondition': 'exercise'
};

// ============================================================================
// NLP SERVICE
// ============================================================================

class NLPService {
  private static instance: NLPService;

  private cache: Map<string, unknown> = new Map();
  private config: NLPConfig = {
    language: 'sv',
    useCache: true,
    maxCacheSize: 1000
  };
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  private constructor() {}

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  /**
   * Konfigurera NLP
   */
  public configure(config: Partial<NLPConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // TEXT ANALYSIS
  // ============================================================================

  /**
   * Analysera text
   */
  public analyzeText(text: string): TextAnalysis {
    const cacheKey = `analyze_${text}`;
    if (this.config.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as TextAnalysis;
    }

    const sentences = this.splitSentences(text);
    const tokens = this.tokenize(text);
    const language = this.detectLanguage(text).language;
    const readabilityScore = this.calculateReadability(text);

    const result: TextAnalysis = {
      text,
      language,
      wordCount: tokens.filter(t => t.pos !== 'PUNCT').length,
      sentenceCount: sentences.length,
      characterCount: text.length,
      readabilityScore,
      tokens
    };

    this.setCached(cacheKey, result);
    return result;
  }

  /**
   * Tokenisera text
   */
  public tokenize(text: string): Token[] {
    const words = text.match(/[\wåäöÅÄÖ]+|[^\s\wåäöÅÄÖ]+/g) || [];
    let position = 0;

    return words.map(word => {
      const start = text.indexOf(word, position);
      const end = start + word.length;
      position = end;

      const isStopWord = SWEDISH_STOP_WORDS.has(word.toLowerCase());
      const pos = this.detectPOS(word);
      const lemma = this.lemmatize(word);

      return {
        text: word,
        lemma,
        pos,
        start,
        end,
        isStopWord
      };
    });
  }

  private detectPOS(word: string): PartOfSpeech {
    const lower = word.toLowerCase();

    // Enkla regler för svensk POS-taggning
    if (/^[0-9]+$/.test(word)) return 'NUM';
    if (/^[^\wåäöÅÄÖ]+$/.test(word)) return 'PUNCT';
    if (SWEDISH_STOP_WORDS.has(lower)) {
      if (['jag', 'du', 'han', 'hon', 'vi', 'ni', 'de'].includes(lower)) return 'PRON';
      if (['en', 'ett', 'den', 'det', 'de'].includes(lower)) return 'DET';
      if (['och', 'eller', 'men', 'för', 'så'].includes(lower)) return 'CONJ';
      if (['i', 'på', 'av', 'till', 'från', 'med'].includes(lower)) return 'ADP';
    }

    // Suffix-baserade regler
    if (/ing$|ande$|ende$/.test(lower)) return 'VERB';
    if (/het$|tion$|else$|skap$/.test(lower)) return 'NOUN';
    if (/lig$|ig$|isk$|sam$/.test(lower)) return 'ADJ';
    if (/vis$|ligen$/.test(lower)) return 'ADV';

    return 'NOUN'; // Default
  }

  private lemmatize(word: string): string {
    const lower = word.toLowerCase();

    // Enkla lemmatiseringsregler för svenska
    const suffixes = [
      { suffix: 'erna', replacement: '' },
      { suffix: 'orna', replacement: 'a' },
      { suffix: 'arna', replacement: 'are' },
      { suffix: 'ade', replacement: 'a' },
      { suffix: 'ande', replacement: 'a' },
      { suffix: 'ar', replacement: '' },
      { suffix: 'or', replacement: 'a' },
      { suffix: 'er', replacement: '' },
      { suffix: 'en', replacement: '' },
      { suffix: 'et', replacement: '' },
      { suffix: 'na', replacement: '' },
      { suffix: 's', replacement: '' }
    ];

    for (const { suffix, replacement } of suffixes) {
      if (lower.endsWith(suffix) && lower.length > suffix.length + 2) {
        return lower.slice(0, -suffix.length) + replacement;
      }
    }

    return lower;
  }

  private splitSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private calculateReadability(text: string): number {
    const sentences = this.splitSentences(text);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    // LIX-formel (svensk läsbarhetsindex)
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const longWords = words.filter(w => w.length > 6).length;
    const longWordRatio = (longWords / words.length) * 100;
    const avgSentenceLength = words.length / sentences.length;

    return Math.round(avgSentenceLength + longWordRatio);
  }

  private countSyllables(word: string): number {
    const vowels = word.toLowerCase().match(/[aeiouyåäö]/g);
    return vowels ? vowels.length : 1;
  }

  // ============================================================================
  // SENTIMENT ANALYSIS
  // ============================================================================

  /**
   * Analysera sentiment
   */
  public analyzeSentiment(text: string): SentimentResult {
    const cacheKey = `sentiment_${text}`;
    if (this.config.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as SentimentResult;
    }

    const sentences = this.splitSentences(text);
    const sentenceSentiments: SentenceSentiment[] = [];
    let totalScore = 0;

    for (const sentence of sentences) {
      const sentenceScore = this.calculateSentenceScore(sentence);
      const label = this.scoreToLabel(sentenceScore);

      sentenceSentiments.push({
        text: sentence.trim(),
        score: sentenceScore,
        label
      });

      totalScore += sentenceScore;
    }

    const avgScore = sentences.length > 0 ? totalScore / sentences.length : 0;
    const confidence = Math.min(1, Math.abs(avgScore) * 1.5);

    const result: SentimentResult = {
      score: avgScore,
      label: this.scoreToLabel(avgScore),
      confidence,
      sentences: sentenceSentiments
    };

    this.setCached(cacheKey, result);
    return result;
  }

  private calculateSentenceScore(sentence: string): number {
    const words = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    let wordCount = 0;

    for (const word of words) {
      if (SWEDISH_POSITIVE_WORDS.has(word)) {
        score += 1;
        wordCount++;
      } else if (SWEDISH_NEGATIVE_WORDS.has(word)) {
        score -= 1;
        wordCount++;
      }
    }

    // Hantera negation
    const negations = ['inte', 'ingen', 'inget', 'aldrig', 'utan'];
    for (let i = 0; i < words.length - 1; i++) {
      if (negations.includes(words[i])) {
        // Invertera nästa ord om det är sentiment-laddat
        if (SWEDISH_POSITIVE_WORDS.has(words[i + 1])) {
          score -= 2;
        } else if (SWEDISH_NEGATIVE_WORDS.has(words[i + 1])) {
          score += 2;
        }
      }
    }

    return wordCount > 0 ? score / wordCount : 0;
  }

  private scoreToLabel(score: number): SentimentScore {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  // ============================================================================
  // NAMED ENTITY RECOGNITION
  // ============================================================================

  /**
   * Extrahera namngivna entiteter
   */
  public extractEntities(text: string): Entity[] {
    const cacheKey = `entities_${text}`;
    if (this.config.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as Entity[];
    }

    const entities: Entity[] = [];
    const lowerText = text.toLowerCase();

    // Rehab-specifika entiteter
    for (const [term, type] of Object.entries(REHAB_ENTITIES)) {
      let index = 0;
      while ((index = lowerText.indexOf(term, index)) !== -1) {
        entities.push({
          text: text.slice(index, index + term.length),
          type,
          start: index,
          end: index + term.length,
          confidence: 0.9
        });
        index++;
      }
    }

    // Datum
    const datePattern = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/g;
    let match;
    while ((match = datePattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'date',
        start: match.index,
        end: match.index + match[0].length,
        confidence: 0.95
      });
    }

    // Tid
    const timePattern = /(\d{1,2}):(\d{2})(?:\s*(fm|em|AM|PM))?/g;
    while ((match = timePattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'time',
        start: match.index,
        end: match.index + match[0].length,
        confidence: 0.95
      });
    }

    // Procent
    const percentPattern = /(\d+(?:,\d+)?)\s*%/g;
    while ((match = percentPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'percent',
        start: match.index,
        end: match.index + match[0].length,
        confidence: 0.95
      });
    }

    // Namn (kapitaliserade ord)
    const namePattern = /\b([A-ZÅÄÖ][a-zåäö]+(?:\s+[A-ZÅÄÖ][a-zåäö]+)?)\b/g;
    while ((match = namePattern.exec(text)) !== null) {
      // Filtrera bort vanliga ord
      if (!['Jag', 'Vi', 'Du', 'Och', 'Men', 'För'].includes(match[1])) {
        entities.push({
          text: match[1],
          type: 'person',
          start: match.index,
          end: match.index + match[1].length,
          confidence: 0.6
        });
      }
    }

    // Sortera och ta bort överlappande
    entities.sort((a, b) => a.start - b.start);
    const filtered = this.removeOverlapping(entities);

    this.setCached(cacheKey, filtered);
    return filtered;
  }

  private removeOverlapping(entities: Entity[]): Entity[] {
    const result: Entity[] = [];
    let lastEnd = -1;

    for (const entity of entities) {
      if (entity.start >= lastEnd) {
        result.push(entity);
        lastEnd = entity.end;
      } else if (entity.confidence > (result[result.length - 1]?.confidence || 0)) {
        result.pop();
        result.push(entity);
        lastEnd = entity.end;
      }
    }

    return result;
  }

  // ============================================================================
  // TEXT CLASSIFICATION
  // ============================================================================

  /**
   * Klassificera text
   */
  public classifyText(
    text: string,
    categories: string[],
    trainingData?: { text: string; label: string }[]
  ): ClassificationResult {
    // Enkel keyword-baserad klassificering
    const scores: Map<string, number> = new Map();
    categories.forEach(cat => scores.set(cat, 0));

    const tokens = this.tokenize(text);
    const keywords = tokens.filter(t => !t.isStopWord).map(t => t.lemma);

    // Om vi har träningsdata, använd den för att bygga keyword-weights
    if (trainingData) {
      const categoryKeywords = this.buildCategoryKeywords(trainingData);

      for (const keyword of keywords) {
        for (const [category, words] of categoryKeywords) {
          if (words.has(keyword)) {
            scores.set(category, (scores.get(category) || 0) + 1);
          }
        }
      }
    }

    // Normalisera scores
    const total = Array.from(scores.values()).reduce((a, b) => a + b, 0) || 1;
    const allScores = Array.from(scores.entries())
      .map(([label, score]) => ({ label, score: score / total }))
      .sort((a, b) => b.score - a.score);

    return {
      label: allScores[0]?.label || categories[0],
      confidence: allScores[0]?.score || 0,
      allScores
    };
  }

  private buildCategoryKeywords(
    trainingData: { text: string; label: string }[]
  ): Map<string, Set<string>> {
    const categoryKeywords = new Map<string, Set<string>>();

    for (const { text, label } of trainingData) {
      if (!categoryKeywords.has(label)) {
        categoryKeywords.set(label, new Set());
      }

      const tokens = this.tokenize(text);
      const keywords = tokens.filter(t => !t.isStopWord).map(t => t.lemma);

      keywords.forEach(kw => categoryKeywords.get(label)!.add(kw));
    }

    return categoryKeywords;
  }

  // ============================================================================
  // SUMMARIZATION
  // ============================================================================

  /**
   * Sammanfatta text
   */
  public summarize(text: string, ratio: number = 0.3): SummaryResult {
    const sentences = this.splitSentences(text);
    if (sentences.length === 0) {
      return { summary: '', keyPoints: [], ratio };
    }

    // Beräkna poäng för varje mening
    const sentenceScores = sentences.map((sentence, index) => {
      let score = 0;

      // Position bonus (första och sista meningar)
      if (index === 0) score += 2;
      if (index === sentences.length - 1) score += 1;

      // Keyword-densitet
      const tokens = this.tokenize(sentence);
      const keywords = tokens.filter(t => !t.isStopWord);
      score += keywords.length / tokens.length;

      // Entiteter
      const entities = this.extractEntities(sentence);
      score += entities.length * 0.5;

      return { sentence, score };
    });

    // Sortera och välj de bästa
    const targetCount = Math.max(1, Math.ceil(sentences.length * ratio));
    const selected = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));

    const summary = selected.map(s => s.sentence.trim()).join('. ') + '.';

    // Extrahera nyckelpoäng
    const keyPoints = selected.slice(0, 3).map(s => s.sentence.trim());

    return { summary, keyPoints, ratio };
  }

  // ============================================================================
  // KEYWORD EXTRACTION
  // ============================================================================

  /**
   * Extrahera nyckelord
   */
  public extractKeywords(text: string, topN: number = 10): KeywordResult[] {
    const cacheKey = `keywords_${text}_${topN}`;
    if (this.config.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as KeywordResult[];
    }

    const tokens = this.tokenize(text);
    const wordFreq = new Map<string, number>();
    const wordScores = new Map<string, number>();

    // Räkna frekvenser
    for (const token of tokens) {
      if (token.isStopWord || token.pos === 'PUNCT') continue;

      const lemma = token.lemma;
      wordFreq.set(lemma, (wordFreq.get(lemma) || 0) + 1);
    }

    // Beräkna TF-IDF-liknande score
    const docLength = tokens.length;
    for (const [word, freq] of wordFreq) {
      // TF (term frequency)
      const tf = freq / docLength;

      // Enkel IDF-approximation baserat på ordlängd
      const idf = Math.log(1 + word.length);

      // Extra bonus för substantiv och verb
      const posBonus = ['NOUN', 'VERB'].includes(
        tokens.find(t => t.lemma === word)?.pos || ''
      ) ? 1.5 : 1;

      wordScores.set(word, tf * idf * posBonus);
    }

    // Sortera och returnera top N
    const results = Array.from(wordScores.entries())
      .map(([keyword, score]) => ({
        keyword,
        score,
        frequency: wordFreq.get(keyword) || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    this.setCached(cacheKey, results);
    return results;
  }

  // ============================================================================
  // LANGUAGE DETECTION
  // ============================================================================

  /**
   * Detektera språk
   */
  public detectLanguage(text: string): LanguageDetection {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Karakteristiska ord för olika språk
    const languageIndicators: Record<string, Set<string>> = {
      sv: new Set(['och', 'att', 'det', 'är', 'jag', 'för', 'med', 'på', 'har', 'som', 'en', 'av', 'till', 'inte']),
      en: new Set(['the', 'and', 'to', 'of', 'is', 'in', 'it', 'you', 'that', 'was', 'for', 'on', 'are']),
      de: new Set(['und', 'der', 'die', 'das', 'ist', 'nicht', 'sie', 'ich', 'mit', 'auf', 'ein', 'für']),
      no: new Set(['og', 'er', 'det', 'av', 'til', 'som', 'på', 'for', 'med', 'har', 'ikke', 'en']),
      da: new Set(['og', 'er', 'det', 'af', 'til', 'som', 'på', 'for', 'med', 'har', 'ikke', 'en'])
    };

    // Karakterspecifik detektion
    const hasSwedishChars = /[åäöÅÄÖ]/.test(text);
    const hasGermanChars = /[äöüßÄÖÜ]/.test(text);

    const scores: Record<string, number> = {};

    for (const [lang, indicators] of Object.entries(languageIndicators)) {
      let matchCount = 0;
      for (const word of words) {
        if (indicators.has(word)) matchCount++;
      }
      scores[lang] = matchCount / words.length;
    }

    // Bonus för svenska tecken
    if (hasSwedishChars && !hasGermanChars) {
      scores['sv'] = (scores['sv'] || 0) + 0.3;
    }

    // Hitta bästa matchning
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const best = sorted[0];
    const alternatives = sorted.slice(1, 4).map(([language, score]) => ({
      language,
      confidence: Math.min(1, score)
    }));

    return {
      language: best?.[0] || 'sv',
      confidence: Math.min(1, (best?.[1] || 0) * 2),
      alternatives
    };
  }

  // ============================================================================
  // INTENT RECOGNITION
  // ============================================================================

  /**
   * Identifiera avsikt
   */
  public recognizeIntent(
    text: string,
    intents: { name: string; examples: string[] }[]
  ): IntentResult {
    const tokens = this.tokenize(text);
    const keywords = tokens.filter(t => !t.isStopWord).map(t => t.lemma);
    const entities = this.extractEntities(text);

    let bestIntent = '';
    let bestScore = 0;

    for (const intent of intents) {
      let score = 0;

      for (const example of intent.examples) {
        const exampleTokens = this.tokenize(example)
          .filter(t => !t.isStopWord)
          .map(t => t.lemma);

        // Beräkna överlapp
        const overlap = keywords.filter(k => exampleTokens.includes(k)).length;
        const similarity = overlap / Math.max(keywords.length, exampleTokens.length);

        score = Math.max(score, similarity);
      }

      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent.name;
      }
    }

    // Extrahera slots
    const slots: Record<string, string> = {};
    for (const entity of entities) {
      slots[entity.type] = entity.text;
    }

    return {
      intent: bestIntent || 'unknown',
      confidence: bestScore,
      entities,
      slots
    };
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private setCached(key: string, value: unknown): void {
    if (!this.config.useCache) return;

    if (this.cache.size >= (this.config.maxCacheSize || 1000)) {
      // Ta bort äldsta entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  /**
   * Rensa cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  public on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useCallback, useMemo } from 'react';

/**
 * Hook för textanalys
 */
export function useTextAnalysis() {
  const service = useMemo(() => NLPService.getInstance(), []);

  const analyze = useCallback((text: string) => {
    return service.analyzeText(text);
  }, [service]);

  return { analyze };
}

/**
 * Hook för sentiment
 */
export function useSentiment() {
  const [result, setResult] = useState<SentimentResult | null>(null);
  const service = useMemo(() => NLPService.getInstance(), []);

  const analyze = useCallback((text: string) => {
    const sentimentResult = service.analyzeSentiment(text);
    setResult(sentimentResult);
    return sentimentResult;
  }, [service]);

  return { result, analyze };
}

/**
 * Hook för entiteter
 */
export function useEntityExtraction() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const service = useMemo(() => NLPService.getInstance(), []);

  const extract = useCallback((text: string) => {
    const extracted = service.extractEntities(text);
    setEntities(extracted);
    return extracted;
  }, [service]);

  return { entities, extract };
}

/**
 * Hook för nyckelord
 */
export function useKeywords(topN: number = 10) {
  const [keywords, setKeywords] = useState<KeywordResult[]>([]);
  const service = useMemo(() => NLPService.getInstance(), []);

  const extract = useCallback((text: string) => {
    const extracted = service.extractKeywords(text, topN);
    setKeywords(extracted);
    return extracted;
  }, [service, topN]);

  return { keywords, extract };
}

/**
 * Hook för sammanfattning
 */
export function useSummarization(ratio: number = 0.3) {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const service = useMemo(() => NLPService.getInstance(), []);

  const summarize = useCallback((text: string) => {
    const result = service.summarize(text, ratio);
    setSummary(result);
    return result;
  }, [service, ratio]);

  return { summary, summarize };
}

/**
 * Hook för intent recognition
 */
export function useIntentRecognition(
  intents: { name: string; examples: string[] }[]
) {
  const [result, setResult] = useState<IntentResult | null>(null);
  const service = useMemo(() => NLPService.getInstance(), []);

  const recognize = useCallback((text: string) => {
    const intentResult = service.recognizeIntent(text, intents);
    setResult(intentResult);
    return intentResult;
  }, [service, intents]);

  return { result, recognize };
}

// ============================================================================
// EXPORT
// ============================================================================

export const nlpService = NLPService.getInstance();
export default nlpService;
