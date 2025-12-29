/**
 * AI Context Service
 *
 * Provides enhanced contextual understanding for AI interactions by:
 * - Tracking conversation history with semantic memory
 * - Understanding user's rehabilitation journey
 * - Maintaining exercise preferences and patterns
 * - Remembering pain history and triggers
 * - Adapting responses based on emotional state
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  intent?: string;
}

export interface UserProfile {
  // Basic info
  name?: string;
  age?: number;
  injuryType?: string;
  injuryDate?: string;

  // Preferences
  preferredExerciseTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
  communicationStyle: 'formal' | 'casual' | 'encouraging' | 'direct';
  motivationType: 'achievement' | 'health' | 'independence' | 'sport';

  // Physical state
  currentPhase: number;
  mobilityLevel: 'limited' | 'moderate' | 'good' | 'excellent';
  strengthLevel: 'weak' | 'moderate' | 'strong';

  // History
  completedExercises: string[];
  favoriteExercises: string[];
  avoidedExercises: string[];

  // Pain info
  painTriggers: string[];
  painPatterns: {
    timeOfDay: string;
    activities: string[];
    weather?: string;
  };
}

export interface ConversationContext {
  currentTopic: string | null;
  recentTopics: string[];
  pendingQuestions: string[];
  userMood: 'frustrated' | 'motivated' | 'curious' | 'tired' | 'neutral';
  sessionGoal: string | null;
  followUpNeeded: boolean;
}

export interface SemanticMemory {
  key: string;
  value: string;
  importance: 'high' | 'medium' | 'low';
  lastAccessed: number;
  accessCount: number;
  category: 'pain' | 'exercise' | 'goal' | 'preference' | 'milestone';
}

// ============================================================================
// INTENT PATTERNS
// ============================================================================

const INTENT_PATTERNS: Record<string, RegExp[]> = {
  'ask_exercise': [
    /vilken övning|vilka övningar|rekommend/i,
    /vad ska jag (göra|träna)/i,
    /föreslå|tips på övning/i,
  ],
  'report_pain': [
    /ont|smärta|värk|gör ont/i,
    /känns (dåligt|jobbigt|svårt)/i,
    /problem med/i,
  ],
  'ask_progress': [
    /hur går det|framsteg|utveckling/i,
    /har jag blivit|förbättr/i,
    /statistik|resultat/i,
  ],
  'need_motivation': [
    /orkar inte|trött|svårt att/i,
    /motivation|peppa|uppmuntr/i,
    /meningslöst|hjälper det/i,
  ],
  'ask_technique': [
    /hur gör (jag|man)|rätt teknik/i,
    /visa|förklara|instruktion/i,
    /fel|gör jag rätt/i,
  ],
  'schedule_question': [
    /när ska|hur ofta|hur länge/i,
    /schema|planera|rutin/i,
    /vila|återhämtning/i,
  ],
  'general_question': [
    /vad är|varför|hur fungerar/i,
    /berätta om|förklara/i,
  ],
  'greeting': [
    /^(hej|hallå|tjena|god morgon|god kväll)/i,
    /hur mår du|läget/i,
  ],
  'gratitude': [
    /tack|tackar|uppskatt/i,
    /hjälpte|bra svar/i,
  ],
  'frustration': [
    /fungerar inte|dåligt|irriter/i,
    /förstår inte|hjälper inte/i,
  ],
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'knä': ['knä', 'knäled', 'knäskål', 'korsbandet', 'menisk', 'patella'],
  'axel': ['axel', 'skulder', 'rotatorcuff', 'axelled'],
  'rygg': ['rygg', 'ländrygg', 'korsrygg', 'diskbråck', 'ryggont'],
  'höft': ['höft', 'höftled', 'ljumske'],
  'nacke': ['nacke', 'halsrygg', 'nackont'],
  'fot': ['fot', 'vrist', 'fotled', 'häl', 'hälsena', 'achilles'],
  'handled': ['handled', 'handledsproblem', 'karpaltunnel'],
  'träning': ['träning', 'övning', 'rehab', 'program'],
  'smärta': ['smärta', 'ont', 'värk', 'stelhet'],
  'återhämtning': ['vila', 'återhämtning', 'sömn', 'stress'],
  'kost': ['mat', 'kost', 'näring', 'protein', 'vitamin'],
};

// ============================================================================
// SERVICE
// ============================================================================

class AIContextService {
  private conversationHistory: ConversationMessage[] = [];
  private userProfile: UserProfile;
  private context: ConversationContext;
  private semanticMemories: SemanticMemory[] = [];
  private maxHistoryLength = 50;
  private storageKey = 'ai_context_data';

  constructor() {
    this.userProfile = this.getDefaultProfile();
    this.context = this.getDefaultContext();
    this.loadFromStorage();
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * Add a message to conversation history and analyze it
   */
  addMessage(role: 'user' | 'assistant', content: string): ConversationMessage {
    const message: ConversationMessage = {
      id: this.generateId(),
      role,
      content,
      timestamp: Date.now(),
      topics: this.extractTopics(content),
      sentiment: this.analyzeSentiment(content),
      intent: role === 'user' ? this.detectIntent(content) : undefined,
    };

    this.conversationHistory.push(message);

    // Trim history if too long
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    // Update context based on message
    if (role === 'user') {
      this.updateContextFromMessage(message);
      this.extractAndStoreMemories(content);
    }

    this.saveToStorage();
    return message;
  }

  /**
   * Build context string for AI prompt
   */
  buildContextPrompt(): string {
    const parts: string[] = [];

    // User profile summary
    parts.push(this.buildProfileSummary());

    // Recent conversation context
    parts.push(this.buildConversationSummary());

    // Relevant memories
    parts.push(this.buildMemorySummary());

    // Current session context
    parts.push(this.buildSessionContext());

    return parts.filter(Boolean).join('\n\n');
  }

  /**
   * Get suggested responses based on context
   */
  getSuggestedResponses(): string[] {
    const suggestions: string[] = [];
    const lastUserMessage = this.getLastUserMessage();

    if (!lastUserMessage) {
      return ['Hur kan jag hjälpa dig idag?', 'Vill du börja med dagens övningar?'];
    }

    // Based on detected intent
    switch (lastUserMessage.intent) {
      case 'report_pain':
        suggestions.push(
          'Berätta mer om smärtan - var sitter den och när kommer den?',
          'Ska jag föreslå övningar som är skonsamma för det området?',
          'Vill du logga smärtan för att spåra mönster?'
        );
        break;
      case 'need_motivation':
        suggestions.push(
          'Kom ihåg varför du började - du har kommit långt!',
          'Ska vi ta en lättare session idag?',
          'Vill du se dina framsteg den senaste månaden?'
        );
        break;
      case 'ask_exercise':
        suggestions.push(
          'Baserat på din historik rekommenderar jag...',
          'Här är övningar anpassade för ditt nuvarande fas.',
          'Vill du ha en komplett träningsplan?'
        );
        break;
      case 'ask_progress':
        suggestions.push(
          'Din rörlighet har förbättrats med X% senaste veckan.',
          'Du har tränat regelbundet - bra jobbat!',
          'Här är en översikt av din utveckling.'
        );
        break;
    }

    // Based on mood
    if (this.context.userMood === 'frustrated') {
      suggestions.unshift('Jag förstår att det kan vara frustrerande. Låt mig hjälpa dig.');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<UserProfile>): void {
    this.userProfile = { ...this.userProfile, ...updates };
    this.saveToStorage();
    logger.info('[AIContext] Profile updated', updates);
  }

  /**
   * Get user profile
   */
  getProfile(): UserProfile {
    return { ...this.userProfile };
  }

  /**
   * Add semantic memory
   */
  addMemory(key: string, value: string, category: SemanticMemory['category'], importance: SemanticMemory['importance'] = 'medium'): void {
    // Check if memory already exists
    const existingIndex = this.semanticMemories.findIndex(m => m.key === key);

    if (existingIndex >= 0) {
      // Update existing memory
      this.semanticMemories[existingIndex] = {
        ...this.semanticMemories[existingIndex],
        value,
        lastAccessed: Date.now(),
        accessCount: this.semanticMemories[existingIndex].accessCount + 1,
      };
    } else {
      // Add new memory
      this.semanticMemories.push({
        key,
        value,
        importance,
        lastAccessed: Date.now(),
        accessCount: 1,
        category,
      });
    }

    // Limit memories
    if (this.semanticMemories.length > 100) {
      this.pruneMemories();
    }

    this.saveToStorage();
  }

  /**
   * Get relevant memories for a topic
   */
  getRelevantMemories(topic: string): SemanticMemory[] {
    const topicLower = topic.toLowerCase();
    return this.semanticMemories
      .filter(m =>
        m.key.toLowerCase().includes(topicLower) ||
        m.value.toLowerCase().includes(topicLower)
      )
      .sort((a, b) => {
        // Sort by importance, then access count
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        const diff = importanceOrder[b.importance] - importanceOrder[a.importance];
        if (diff !== 0) return diff;
        return b.accessCount - a.accessCount;
      })
      .slice(0, 5);
  }

  /**
   * Get conversation history
   */
  getHistory(limit?: number): ConversationMessage[] {
    const history = [...this.conversationHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    this.context = this.getDefaultContext();
    this.saveToStorage();
    logger.info('[AIContext] History cleared');
  }

  /**
   * Get current context
   */
  getContext(): ConversationContext {
    return { ...this.context };
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  private buildProfileSummary(): string {
    const p = this.userProfile;
    const parts: string[] = ['[ANVÄNDARPROFIL]'];

    if (p.injuryType) {
      parts.push(`Skada: ${p.injuryType}${p.injuryDate ? ` (sedan ${p.injuryDate})` : ''}`);
    }
    parts.push(`Rehabiliteringsfas: ${p.currentPhase}`);
    parts.push(`Rörlighet: ${p.mobilityLevel}, Styrka: ${p.strengthLevel}`);

    if (p.favoriteExercises.length > 0) {
      parts.push(`Föredragna övningar: ${p.favoriteExercises.slice(0, 3).join(', ')}`);
    }

    if (p.painTriggers.length > 0) {
      parts.push(`Kända smärtutlösare: ${p.painTriggers.join(', ')}`);
    }

    return parts.join('\n');
  }

  private buildConversationSummary(): string {
    const recent = this.conversationHistory.slice(-5);
    if (recent.length === 0) return '';

    const parts: string[] = ['[SAMTALSKONTEXT]'];

    // Summarize topics discussed
    const allTopics = recent.flatMap(m => m.topics);
    const uniqueTopics = [...new Set(allTopics)];
    if (uniqueTopics.length > 0) {
      parts.push(`Diskuterade ämnen: ${uniqueTopics.join(', ')}`);
    }

    // Recent exchange summary
    const lastExchange = recent.slice(-2);
    if (lastExchange.length > 0) {
      parts.push('Senaste utbyte:');
      lastExchange.forEach(m => {
        const prefix = m.role === 'user' ? 'Användare' : 'Assistent';
        const truncated = m.content.length > 100 ? m.content.substring(0, 100) + '...' : m.content;
        parts.push(`  ${prefix}: ${truncated}`);
      });
    }

    return parts.join('\n');
  }

  private buildMemorySummary(): string {
    const importantMemories = this.semanticMemories
      .filter(m => m.importance === 'high')
      .slice(0, 5);

    if (importantMemories.length === 0) return '';

    const parts: string[] = ['[VIKTIGA MINNEN]'];
    importantMemories.forEach(m => {
      parts.push(`- ${m.key}: ${m.value}`);
    });

    return parts.join('\n');
  }

  private buildSessionContext(): string {
    const ctx = this.context;
    const parts: string[] = ['[AKTUELL SESSION]'];

    if (ctx.currentTopic) {
      parts.push(`Aktuellt ämne: ${ctx.currentTopic}`);
    }

    parts.push(`Användarens humör: ${this.translateMood(ctx.userMood)}`);

    if (ctx.sessionGoal) {
      parts.push(`Sessionsmål: ${ctx.sessionGoal}`);
    }

    if (ctx.pendingQuestions.length > 0) {
      parts.push(`Obesvarade frågor: ${ctx.pendingQuestions.join(', ')}`);
    }

    return parts.join('\n');
  }

  private translateMood(mood: string): string {
    const translations: Record<string, string> = {
      frustrated: 'frustrerad',
      motivated: 'motiverad',
      curious: 'nyfiken',
      tired: 'trött',
      neutral: 'neutral',
    };
    return translations[mood] || mood;
  }

  private detectIntent(text: string): string | undefined {
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return intent;
        }
      }
    }
    return 'general_question';
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const textLower = text.toLowerCase();

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      if (keywords.some(kw => textLower.includes(kw))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['bra', 'bättre', 'fantastisk', 'tack', 'glad', 'nöjd', 'underbar', 'perfekt'];
    const negativeWords = ['ont', 'smärta', 'svårt', 'jobbigt', 'frustrer', 'hopplös', 'dålig', 'värre'];

    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(w => textLower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => textLower.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private updateContextFromMessage(message: ConversationMessage): void {
    // Update current topic
    if (message.topics.length > 0) {
      this.context.currentTopic = message.topics[0];
      this.context.recentTopics = [
        ...new Set([message.topics[0], ...this.context.recentTopics])
      ].slice(0, 5);
    }

    // Update mood based on sentiment and intent
    if (message.sentiment === 'negative' || message.intent === 'frustration') {
      this.context.userMood = 'frustrated';
    } else if (message.intent === 'need_motivation') {
      this.context.userMood = 'tired';
    } else if (message.sentiment === 'positive') {
      this.context.userMood = 'motivated';
    } else if (message.intent === 'general_question' || message.intent === 'ask_technique') {
      this.context.userMood = 'curious';
    }

    // Check for pending questions
    if (message.content.includes('?')) {
      const questions = message.content.match(/[^.!?]*\?/g) || [];
      this.context.pendingQuestions = questions.slice(0, 3);
      this.context.followUpNeeded = true;
    }
  }

  private extractAndStoreMemories(text: string): void {
    // Extract pain mentions
    const painPatterns = [
      /ont i (\w+)/gi,
      /smärta i (\w+)/gi,
      /problem med (\w+)/gi,
    ];

    for (const pattern of painPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          this.addMemory(
            `smärta_${match[1]}`,
            `Användaren rapporterade problem med ${match[1]}`,
            'pain',
            'high'
          );
        }
      }
    }

    // Extract goals
    const goalPatterns = [
      /vill (kunna )?([\w\s]+)/i,
      /mitt mål är ([\w\s]+)/i,
      /siktar på ([\w\s]+)/i,
    ];

    for (const pattern of goalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const goal = match[2] || match[1];
        if (goal && goal.length > 3) {
          this.addMemory(
            `mål_${Date.now()}`,
            goal.trim(),
            'goal',
            'high'
          );
        }
      }
    }
  }

  private pruneMemories(): void {
    // Keep high importance, remove old low importance
    this.semanticMemories.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });

    this.semanticMemories = this.semanticMemories.slice(0, 80);
  }

  private getLastUserMessage(): ConversationMessage | undefined {
    return [...this.conversationHistory]
      .reverse()
      .find(m => m.role === 'user');
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultProfile(): UserProfile {
    return {
      preferredExerciseTime: 'flexible',
      communicationStyle: 'encouraging',
      motivationType: 'health',
      currentPhase: 1,
      mobilityLevel: 'moderate',
      strengthLevel: 'moderate',
      completedExercises: [],
      favoriteExercises: [],
      avoidedExercises: [],
      painTriggers: [],
      painPatterns: {
        timeOfDay: '',
        activities: [],
      },
    };
  }

  private getDefaultContext(): ConversationContext {
    return {
      currentTopic: null,
      recentTopics: [],
      pendingQuestions: [],
      userMood: 'neutral',
      sessionGoal: null,
      followUpNeeded: false,
    };
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.conversationHistory = parsed.history || [];
        this.userProfile = { ...this.getDefaultProfile(), ...parsed.profile };
        this.semanticMemories = parsed.memories || [];
      }
    } catch (error) {
      logger.warn('[AIContext] Failed to load from storage', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        history: this.conversationHistory,
        profile: this.userProfile,
        memories: this.semanticMemories,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      logger.warn('[AIContext] Failed to save to storage', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const aiContextService = new AIContextService();
export default aiContextService;
