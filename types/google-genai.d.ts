// Type declarations for @google/genai (loaded via CDN importmap)
declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(config: { apiKey: string });
    models: {
      generateContent(options: {
        model: string;
        contents: string | Array<{ role: string; parts: Array<{ text: string }> }>;
        config?: {
          responseMimeType?: string;
          responseSchema?: Schema;
          temperature?: number;
          topP?: number;
          topK?: number;
          maxOutputTokens?: number;
          [key: string]: unknown;
        };
      }): Promise<{ text: string }>;
    };
  }

  export const Type: {
    STRING: string;
    NUMBER: string;
    BOOLEAN: string;
    ARRAY: string;
    OBJECT: string;
  };

  export interface Schema {
    type: string;
    description?: string;
    properties?: Record<string, Schema>;
    items?: Schema;
    required?: string[];
    enum?: string[];
    [key: string]: unknown;
  }
}
