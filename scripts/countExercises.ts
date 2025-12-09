/**
 * Exercise Count Script
 * Calculates total unique exercise variations from templates
 */

import { allTemplates } from '../data/exerciseGenerator/templates';

console.log('=== Exercise Variation Calculator ===');
console.log('Total templates:', allTemplates.length);

let totalVariations = 0;
const bodyRegionCounts: Record<string, { templates: number; variations: number }> = {};

for (const template of allTemplates) {
  const positions = template.allowedPositions?.length || 1;
  const equipment = template.allowedEquipment?.length || 1;
  const difficulties = template.allowedDifficulties?.length || 1;
  const lateralities = template.allowedLateralities?.length || 1;

  // Calculate variations for this template
  const variations = positions * equipment * difficulties * lateralities;
  totalVariations += variations;

  // Track by body region
  const region = template.bodyRegion || 'unknown';
  if (!bodyRegionCounts[region]) {
    bodyRegionCounts[region] = { templates: 0, variations: 0 };
  }
  bodyRegionCounts[region].templates++;
  bodyRegionCounts[region].variations += variations;
}

console.log('\n=== By Body Region ===');
for (const [region, counts] of Object.entries(bodyRegionCounts).sort((a, b) => b[1].variations - a[1].variations)) {
  console.log(`${region}: ${counts.templates} templates → ${counts.variations} variations`);
}

console.log('\n=== TOTAL ===');
console.log(`Templates: ${allTemplates.length}`);
console.log(`Total variations: ${totalVariations.toLocaleString()}`);
console.log(`Average variations per template: ${Math.round(totalVariations / allTemplates.length)}`);

// Check if we meet the 10,000 goal
if (totalVariations >= 10000) {
  console.log('\n✅ GOAL MET: 10,000+ unique exercise variations!');
} else {
  const templatesNeeded = Math.ceil((10000 - totalVariations) / (totalVariations / allTemplates.length));
  console.log(`\n⚠️ Need ${(10000 - totalVariations).toLocaleString()} more variations`);
  console.log(`Approximately ${templatesNeeded} more templates needed`);
}
