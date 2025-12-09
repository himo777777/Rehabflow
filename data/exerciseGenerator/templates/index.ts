/**
 * Templates Index
 *
 * Exports all exercise templates
 */

export { NECK_TEMPLATES } from './neckTemplates';
export { SHOULDER_TEMPLATES } from './shoulderTemplates';
export { lumbarTemplates } from './lumbarTemplates';
export { hipTemplates } from './hipTemplates';
export { kneeTemplates } from './kneeTemplates';
export { ankleTemplates } from './ankleTemplates';
export { coreTemplates } from './coreTemplates';
export { thoracicTemplates } from './thoracicTemplates';
export { wristHandTemplates } from './wristHandTemplates';
export { elbowTemplates } from './elbowTemplates';
export { seniorsFallRiskTemplates } from './seniorsFallRiskTemplates';

// Combined templates
import { NECK_TEMPLATES } from './neckTemplates';
import { SHOULDER_TEMPLATES } from './shoulderTemplates';
import { lumbarTemplates } from './lumbarTemplates';
import { hipTemplates } from './hipTemplates';
import { kneeTemplates } from './kneeTemplates';
import { ankleTemplates } from './ankleTemplates';
import { coreTemplates } from './coreTemplates';
import { thoracicTemplates } from './thoracicTemplates';
import { wristHandTemplates } from './wristHandTemplates';
import { elbowTemplates } from './elbowTemplates';
import { seniorsFallRiskTemplates } from './seniorsFallRiskTemplates';

export const allTemplates = [
  ...NECK_TEMPLATES,
  ...SHOULDER_TEMPLATES,
  ...lumbarTemplates,
  ...hipTemplates,
  ...kneeTemplates,
  ...ankleTemplates,
  ...coreTemplates,
  ...thoracicTemplates,
  ...wristHandTemplates,
  ...elbowTemplates,
  ...seniorsFallRiskTemplates
];

export default allTemplates;
