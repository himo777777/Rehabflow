/**
 * Protokoll Index
 *
 * Aggregerar alla protokoll-exports för enkel import.
 */

// Postoperativa protokoll
export * from './postOpProtocols';

// Axelina protokoll
export * from './axelinaProtocols';

// Svenska regionprotokoll
export * from './svenskaRegionProtokoll';

// Return-to-Sport protokoll
export * from './rtsProtocols';

// Preventionsprogram (FIFA 11+, Axelkontroll, etc.)
export * from './preventionProtocols';

// Patientutbildning (GLA:D, artrosskolor, ryggskolor, etc.)
export * from './patientEducationSchools';

// Digitala program (Joint Academy, Kaia Health, etc.)
export * from './digitalPrograms';

// ============================================
// AGGREGERADE PROTOKOLLREGISTER
// ============================================

import { POST_OP_PROTOCOLS } from './postOpProtocols';
import { AXELINA_PROTOCOLS } from './axelinaProtocols';
import { ALLA_SVENSKA_PROTOKOLL } from './svenskaRegionProtokoll';
import { PREVENTION_PROTOCOLS } from './preventionProtocols';
import { EDUCATION_SCHOOLS } from './patientEducationSchools';
import { DIGITAL_PROGRAMS } from './digitalPrograms';

/**
 * Hämta antal protokoll per kategori
 */
export function getProtocolStats(): {
  postOp: number;
  axelina: number;
  svenska: number;
  prevention: number;
  education: number;
  digital: number;
  total: number;
} {
  return {
    postOp: Object.keys(POST_OP_PROTOCOLS).length,
    axelina: AXELINA_PROTOCOLS.length,
    svenska: ALLA_SVENSKA_PROTOKOLL.length,
    prevention: PREVENTION_PROTOCOLS.length,
    education: EDUCATION_SCHOOLS.length,
    digital: DIGITAL_PROGRAMS.length,
    total:
      Object.keys(POST_OP_PROTOCOLS).length +
      AXELINA_PROTOCOLS.length +
      ALLA_SVENSKA_PROTOKOLL.length +
      PREVENTION_PROTOCOLS.length +
      EDUCATION_SCHOOLS.length +
      DIGITAL_PROGRAMS.length
  };
}

/**
 * Skriv ut protokollöversikt till konsol
 */
export function logProtocolOverview(): void {
  const stats = getProtocolStats();
  console.log('=== PROTOKOLLÖVERSIKT ===');
  console.log(`Postoperativa: ${stats.postOp}`);
  console.log(`Axelina: ${stats.axelina}`);
  console.log(`Svenska region: ${stats.svenska}`);
  console.log(`Prevention: ${stats.prevention}`);
  console.log(`Patientutbildning: ${stats.education}`);
  console.log(`Digitala: ${stats.digital}`);
  console.log(`TOTALT: ${stats.total}`);
}
