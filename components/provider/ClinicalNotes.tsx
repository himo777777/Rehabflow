/**
 * Clinical Notes Component - SOAP Format
 *
 * Implements standardized SOAP (Subjective, Objective, Assessment, Plan) documentation
 * for healthcare providers. Essential for clinical documentation and billing.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { auditLog, auditCreate, auditUpdate } from '../../services/auditService';
import { logger } from '../../lib/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalSigns {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painLevel?: number;
}

export interface ROMEntry {
  joint: string;
  movement: string;
  activeROM: number;
  passiveROM?: number;
  normalROM: number;
  notes?: string;
}

export interface StrengthEntry {
  muscle: string;
  side: 'left' | 'right' | 'bilateral';
  grade: 0 | 1 | 2 | 3 | 4 | 5; // MMT scale
  notes?: string;
}

export interface SpecialTest {
  name: string;
  result: 'positive' | 'negative' | 'equivocal';
  notes?: string;
}

export interface SOAPNote {
  id: string;
  patientId: string;
  providerId: string;
  date: string;
  visitType: 'initial_evaluation' | 'follow_up' | 're_evaluation' | 'discharge';
  status: 'draft' | 'signed' | 'amended' | 'locked';

  // Subjective
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    painLocation?: string;
    painLevel: number;
    painDescription?: string;
    symptomsChanged: 'improved' | 'unchanged' | 'worsened';
    sleepQuality?: 'good' | 'fair' | 'poor';
    functionalLimitations?: string;
    patientGoals?: string;
    medications?: string;
    recentActivities?: string;
  };

  // Objective
  objective: {
    vitalSigns?: VitalSigns;
    observation?: string;
    palpation?: string;
    rom: ROMEntry[];
    strength: StrengthEntry[];
    specialTests: SpecialTest[];
    gait?: string;
    posture?: string;
    balance?: string;
    functionalTests?: string;
    neurological?: string;
  };

  // Assessment
  assessment: {
    diagnosis: string;
    icdCodes?: string[];
    currentPhase: 1 | 2 | 3 | 4;
    progressTowardGoals: 'excellent' | 'good' | 'fair' | 'poor';
    barriers?: string[];
    prognosis: 'excellent' | 'good' | 'fair' | 'guarded' | 'poor';
    clinicalReasoning?: string;
    rehabilitationPotential?: string;
  };

  // Plan
  plan: {
    interventions: string[];
    homeExercises: string[];
    frequency: string;
    duration: string;
    shortTermGoals?: string[];
    longTermGoals?: string[];
    nextVisit?: string;
    referrals?: string[];
    precautions: string[];
    patientEducation?: string;
  };

  // Metadata
  signedBy?: string;
  signedAt?: string;
  amendedAt?: string;
  amendmentReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicalNotesProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSave?: (note: SOAPNote) => void;
  existingNote?: SOAPNote;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ClinicalNotes: React.FC<ClinicalNotesProps> = ({
  patientId,
  patientName,
  onClose,
  onSave,
  existingNote,
}) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'S' | 'O' | 'A' | 'P'>('S');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Initialize empty SOAP note
  const createEmptyNote = (): Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'> => ({
    patientId,
    providerId: user?.id || '',
    date: new Date().toISOString().split('T')[0],
    visitType: 'follow_up',
    status: 'draft',
    subjective: {
      chiefComplaint: '',
      painLevel: 0,
      symptomsChanged: 'unchanged',
    },
    objective: {
      rom: [],
      strength: [],
      specialTests: [],
    },
    assessment: {
      diagnosis: '',
      currentPhase: 1,
      progressTowardGoals: 'fair',
      prognosis: 'good',
    },
    plan: {
      interventions: [],
      homeExercises: [],
      frequency: '',
      duration: '',
      precautions: [],
    },
  });

  const [note, setNote] = useState<Omit<SOAPNote, 'id' | 'createdAt' | 'updatedAt'>>(
    existingNote || createEmptyNote()
  );

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (note.status !== 'draft') return;

    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [note]);

  const saveDraft = async () => {
    setAutoSaveStatus('saving');
    try {
      // Save to localStorage for now
      localStorage.setItem(
        `soap_draft_${patientId}_${note.date}`,
        JSON.stringify({ ...note, updatedAt: new Date().toISOString() })
      );
      setAutoSaveStatus('saved');
    } catch {
      setAutoSaveStatus('error');
    }
  };

  const handleSignNote = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const signedNote: SOAPNote = {
        ...note,
        id: existingNote?.id || crypto.randomUUID(),
        status: 'signed',
        signedBy: user.displayName,
        signedAt: new Date().toISOString(),
        createdAt: existingNote?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('clinical_notes')
          .upsert({
            id: signedNote.id,
            patient_id: patientId,
            provider_id: user.id,
            visit_date: signedNote.date,
            visit_type: signedNote.visitType,
            status: signedNote.status,
            subjective: signedNote.subjective,
            objective: signedNote.objective,
            assessment: signedNote.assessment,
            plan: signedNote.plan,
            signed_by: signedNote.signedBy,
            signed_at: signedNote.signedAt,
          });

        if (error) {
          logger.error('Failed to save clinical note', error);
          throw error;
        }

        // Audit the creation/update
        if (existingNote) {
          await auditUpdate(
            'clinical_notes',
            signedNote.id,
            existingNote as unknown as Record<string, unknown>,
            signedNote as unknown as Record<string, unknown>,
            { resourceOwnerId: patientId, phiAccessed: true }
          );
        } else {
          await auditCreate(
            'clinical_notes',
            signedNote.id,
            signedNote as unknown as Record<string, unknown>,
            { resourceOwnerId: patientId, phiAccessed: true }
          );
        }
      }

      // Remove draft from localStorage
      localStorage.removeItem(`soap_draft_${patientId}_${note.date}`);

      onSave?.(signedNote);
      onClose();
    } catch (error) {
      logger.error('Failed to sign note', error);
      alert('Kunde inte spara anteckningen. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSubjective = (updates: Partial<SOAPNote['subjective']>) => {
    setNote(prev => ({
      ...prev,
      subjective: { ...prev.subjective, ...updates },
    }));
  };

  const updateObjective = (updates: Partial<SOAPNote['objective']>) => {
    setNote(prev => ({
      ...prev,
      objective: { ...prev.objective, ...updates },
    }));
  };

  const updateAssessment = (updates: Partial<SOAPNote['assessment']>) => {
    setNote(prev => ({
      ...prev,
      assessment: { ...prev.assessment, ...updates },
    }));
  };

  const updatePlan = (updates: Partial<SOAPNote['plan']>) => {
    setNote(prev => ({
      ...prev,
      plan: { ...prev.plan, ...updates },
    }));
  };

  // ============================================================================
  // RENDER SECTIONS
  // ============================================================================

  const renderSubjective = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Subjective - Patientens berättelse</h3>

      {/* Chief Complaint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Huvudsakligt besvär *
        </label>
        <textarea
          value={note.subjective.chiefComplaint}
          onChange={(e) => updateSubjective({ chiefComplaint: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Patientens huvudsakliga besvär idag..."
        />
      </div>

      {/* History of Present Illness */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anamnes
        </label>
        <textarea
          value={note.subjective.historyOfPresentIllness || ''}
          onChange={(e) => updateSubjective({ historyOfPresentIllness: e.target.value })}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Sjukdomshistoria, onset, duration, förvärring/lindring..."
        />
      </div>

      {/* Pain Assessment */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Smärtnivå (0-10)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={note.subjective.painLevel}
            onChange={(e) => updateSubjective({ painLevel: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>0</span>
            <span className="font-medium text-lg">{note.subjective.painLevel}</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Smärtans lokalisation
          </label>
          <input
            type="text"
            value={note.subjective.painLocation || ''}
            onChange={(e) => updateSubjective({ painLocation: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="T.ex. Höger knä, lateral sida"
          />
        </div>
      </div>

      {/* Symptom Change */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Förändring sedan senast
        </label>
        <div className="flex gap-4">
          {(['improved', 'unchanged', 'worsened'] as const).map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={note.subjective.symptomsChanged === status}
                onChange={() => updateSubjective({ symptomsChanged: status })}
                className="text-blue-600"
              />
              <span>
                {status === 'improved' ? 'Förbättrad' :
                 status === 'unchanged' ? 'Oförändrad' : 'Försämrad'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Functional Limitations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Funktionella begränsningar
        </label>
        <textarea
          value={note.subjective.functionalLimitations || ''}
          onChange={(e) => updateSubjective({ functionalLimitations: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={2}
          placeholder="Aktiviteter som är svåra att utföra..."
        />
      </div>

      {/* Patient Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patientens mål
        </label>
        <textarea
          value={note.subjective.patientGoals || ''}
          onChange={(e) => updateSubjective({ patientGoals: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={2}
          placeholder="Vad patienten vill uppnå..."
        />
      </div>
    </div>
  );

  const renderObjective = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Objective - Kliniska fynd</h3>

      {/* Vital Signs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vitalparametrar</label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500">Puls</label>
            <input
              type="number"
              value={note.objective.vitalSigns?.heartRate || ''}
              onChange={(e) => updateObjective({
                vitalSigns: { ...note.objective.vitalSigns, heartRate: parseInt(e.target.value) || undefined }
              })}
              className="w-full p-2 border rounded"
              placeholder="bpm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Blodtryck</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={note.objective.vitalSigns?.bloodPressure?.systolic || ''}
                onChange={(e) => updateObjective({
                  vitalSigns: {
                    ...note.objective.vitalSigns,
                    bloodPressure: {
                      systolic: parseInt(e.target.value) || 0,
                      diastolic: note.objective.vitalSigns?.bloodPressure?.diastolic || 0
                    }
                  }
                })}
                className="w-16 p-2 border rounded"
                placeholder="sys"
              />
              <span className="self-center">/</span>
              <input
                type="number"
                value={note.objective.vitalSigns?.bloodPressure?.diastolic || ''}
                onChange={(e) => updateObjective({
                  vitalSigns: {
                    ...note.objective.vitalSigns,
                    bloodPressure: {
                      systolic: note.objective.vitalSigns?.bloodPressure?.systolic || 0,
                      diastolic: parseInt(e.target.value) || 0
                    }
                  }
                })}
                className="w-16 p-2 border rounded"
                placeholder="dia"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">SpO2</label>
            <input
              type="number"
              value={note.objective.vitalSigns?.oxygenSaturation || ''}
              onChange={(e) => updateObjective({
                vitalSigns: { ...note.objective.vitalSigns, oxygenSaturation: parseInt(e.target.value) || undefined }
              })}
              className="w-full p-2 border rounded"
              placeholder="%"
            />
          </div>
        </div>
      </div>

      {/* Observation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observation
        </label>
        <textarea
          value={note.objective.observation || ''}
          onChange={(e) => updateObjective({ observation: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={2}
          placeholder="Visuell observation: gång, hållning, svullnad, rodnad..."
        />
      </div>

      {/* ROM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Range of Motion
        </label>
        <div className="bg-gray-50 p-3 rounded-lg">
          {note.objective.rom.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Inga ROM-mätningar tillagda</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="pb-2">Led</th>
                  <th className="pb-2">Rörelse</th>
                  <th className="pb-2">Aktiv</th>
                  <th className="pb-2">Passiv</th>
                  <th className="pb-2">Normal</th>
                </tr>
              </thead>
              <tbody>
                {note.objective.rom.map((entry, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="py-2">{entry.joint}</td>
                    <td>{entry.movement}</td>
                    <td>{entry.activeROM}°</td>
                    <td>{entry.passiveROM ? `${entry.passiveROM}°` : '-'}</td>
                    <td>{entry.normalROM}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            type="button"
            onClick={() => {
              const newEntry: ROMEntry = {
                joint: '',
                movement: '',
                activeROM: 0,
                normalROM: 0,
              };
              updateObjective({ rom: [...note.objective.rom, newEntry] });
            }}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            + Lägg till ROM-mätning
          </button>
        </div>
      </div>

      {/* Strength */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Muskelstyrka (MMT 0-5)
        </label>
        <div className="bg-gray-50 p-3 rounded-lg">
          {note.objective.strength.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Inga styrketester tillagda</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="pb-2">Muskel</th>
                  <th className="pb-2">Sida</th>
                  <th className="pb-2">Grad</th>
                  <th className="pb-2">Anteckningar</th>
                </tr>
              </thead>
              <tbody>
                {note.objective.strength.map((entry, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="py-2">{entry.muscle}</td>
                    <td>{entry.side}</td>
                    <td>{entry.grade}/5</td>
                    <td className="text-gray-600">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            type="button"
            onClick={() => {
              const newEntry: StrengthEntry = { muscle: '', side: 'bilateral', grade: 5 };
              updateObjective({ strength: [...note.objective.strength, newEntry] });
            }}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            + Lägg till styrketest
          </button>
        </div>
      </div>

      {/* Special Tests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialtester
        </label>
        <div className="bg-gray-50 p-3 rounded-lg">
          {note.objective.specialTests.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Inga specialtester utförda</p>
          ) : (
            <div className="space-y-2">
              {note.objective.specialTests.map((test, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span className="font-medium">{test.name}</span>
                  <span className={`px-2 py-1 rounded ${
                    test.result === 'positive' ? 'bg-red-100 text-red-700' :
                    test.result === 'negative' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {test.result === 'positive' ? 'Positiv' :
                     test.result === 'negative' ? 'Negativ' : 'Osäker'}
                  </span>
                  {test.notes && <span className="text-gray-600">{test.notes}</span>}
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              const newTest: SpecialTest = { name: '', result: 'negative' };
              updateObjective({ specialTests: [...note.objective.specialTests, newTest] });
            }}
            className="mt-2 text-blue-600 text-sm hover:underline"
          >
            + Lägg till specialtest
          </button>
        </div>
      </div>

      {/* Gait & Posture */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gånganalys</label>
          <textarea
            value={note.objective.gait || ''}
            onChange={(e) => updateObjective({ gait: e.target.value })}
            className="w-full p-2 border rounded"
            rows={2}
            placeholder="Gångmönster, hjälpmedel..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hållning</label>
          <textarea
            value={note.objective.posture || ''}
            onChange={(e) => updateObjective({ posture: e.target.value })}
            className="w-full p-2 border rounded"
            rows={2}
            placeholder="Statisk hållning, asymmetrier..."
          />
        </div>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Assessment - Bedömning</h3>

      {/* Diagnosis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diagnos *
        </label>
        <input
          type="text"
          value={note.assessment.diagnosis}
          onChange={(e) => updateAssessment({ diagnosis: e.target.value })}
          className="w-full p-3 border rounded-lg"
          placeholder="Primär diagnos..."
        />
      </div>

      {/* ICD Codes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ICD-10 koder
        </label>
        <input
          type="text"
          value={(note.assessment.icdCodes || []).join(', ')}
          onChange={(e) => updateAssessment({
            icdCodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="w-full p-2 border rounded-lg"
          placeholder="T.ex. S83.5, M23.5"
        />
      </div>

      {/* Current Phase */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nuvarande rehabiliteringsfas
        </label>
        <div className="flex gap-4">
          {([1, 2, 3, 4] as const).map((phase) => (
            <label key={phase} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={note.assessment.currentPhase === phase}
                onChange={() => updateAssessment({ currentPhase: phase })}
                className="text-blue-600"
              />
              <span>Fas {phase}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Framsteg mot mål
        </label>
        <div className="flex gap-4">
          {(['excellent', 'good', 'fair', 'poor'] as const).map((progress) => (
            <label key={progress} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={note.assessment.progressTowardGoals === progress}
                onChange={() => updateAssessment({ progressTowardGoals: progress })}
                className="text-blue-600"
              />
              <span>
                {progress === 'excellent' ? 'Utmärkt' :
                 progress === 'good' ? 'Bra' :
                 progress === 'fair' ? 'Acceptabel' : 'Dålig'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prognosis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prognos
        </label>
        <select
          value={note.assessment.prognosis}
          onChange={(e) => updateAssessment({
            prognosis: e.target.value as SOAPNote['assessment']['prognosis']
          })}
          className="w-full p-2 border rounded-lg"
        >
          <option value="excellent">Utmärkt</option>
          <option value="good">God</option>
          <option value="fair">Måttlig</option>
          <option value="guarded">Försiktig</option>
          <option value="poor">Dålig</option>
        </select>
      </div>

      {/* Barriers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barriärer för återhämtning
        </label>
        <textarea
          value={(note.assessment.barriers || []).join('\n')}
          onChange={(e) => updateAssessment({
            barriers: e.target.value.split('\n').filter(Boolean)
          })}
          className="w-full p-3 border rounded-lg"
          rows={2}
          placeholder="En barriär per rad..."
        />
      </div>

      {/* Clinical Reasoning */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kliniskt resonemang
        </label>
        <textarea
          value={note.assessment.clinicalReasoning || ''}
          onChange={(e) => updateAssessment({ clinicalReasoning: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={3}
          placeholder="Analys och tolkning av fynd..."
        />
      </div>
    </div>
  );

  const renderPlan = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Plan - Behandlingsplan</h3>

      {/* Interventions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Behandlingsinterventioner *
        </label>
        <textarea
          value={note.plan.interventions.join('\n')}
          onChange={(e) => updatePlan({
            interventions: e.target.value.split('\n').filter(Boolean)
          })}
          className="w-full p-3 border rounded-lg"
          rows={4}
          placeholder="En intervention per rad..."
        />
      </div>

      {/* Home Exercises */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hemövningar
        </label>
        <textarea
          value={note.plan.homeExercises.join('\n')}
          onChange={(e) => updatePlan({
            homeExercises: e.target.value.split('\n').filter(Boolean)
          })}
          className="w-full p-3 border rounded-lg"
          rows={3}
          placeholder="En övning per rad..."
        />
      </div>

      {/* Frequency & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Behandlingsfrekvens
          </label>
          <input
            type="text"
            value={note.plan.frequency}
            onChange={(e) => updatePlan({ frequency: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="T.ex. 2x/vecka"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Förväntad duration
          </label>
          <input
            type="text"
            value={note.plan.duration}
            onChange={(e) => updatePlan({ duration: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="T.ex. 6 veckor"
          />
        </div>
      </div>

      {/* Goals */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kortsiktiga mål (2 veckor)
          </label>
          <textarea
            value={(note.plan.shortTermGoals || []).join('\n')}
            onChange={(e) => updatePlan({
              shortTermGoals: e.target.value.split('\n').filter(Boolean)
            })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Ett mål per rad..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Långsiktiga mål (utskrivning)
          </label>
          <textarea
            value={(note.plan.longTermGoals || []).join('\n')}
            onChange={(e) => updatePlan({
              longTermGoals: e.target.value.split('\n').filter(Boolean)
            })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Ett mål per rad..."
          />
        </div>
      </div>

      {/* Precautions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Försiktighetsåtgärder
        </label>
        <textarea
          value={note.plan.precautions.join('\n')}
          onChange={(e) => updatePlan({
            precautions: e.target.value.split('\n').filter(Boolean)
          })}
          className="w-full p-3 border rounded-lg"
          rows={2}
          placeholder="En försiktighetsåtgärd per rad..."
        />
      </div>

      {/* Next Visit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nästa besök
        </label>
        <input
          type="date"
          value={note.plan.nextVisit || ''}
          onChange={(e) => updatePlan({ nextVisit: e.target.value })}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Referrals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remisser
        </label>
        <textarea
          value={(note.plan.referrals || []).join('\n')}
          onChange={(e) => updatePlan({
            referrals: e.target.value.split('\n').filter(Boolean)
          })}
          className="w-full p-2 border rounded-lg"
          rows={2}
          placeholder="T.ex. Ortoped, Smärtrehabilitering..."
        />
      </div>

      {/* Patient Education */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patientutbildning
        </label>
        <textarea
          value={note.plan.patientEducation || ''}
          onChange={(e) => updatePlan({ patientEducation: e.target.value })}
          className="w-full p-3 border rounded-lg"
          rows={2}
          placeholder="Vad patienten informerats om..."
        />
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Klinisk Anteckning (SOAP)</h2>
            <p className="text-gray-600">{patientName} - {note.date}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${
              autoSaveStatus === 'saved' ? 'text-green-600' :
              autoSaveStatus === 'saving' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {autoSaveStatus === 'saved' ? 'Sparad' :
               autoSaveStatus === 'saving' ? 'Sparar...' : 'Fel vid sparning'}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b">
          {(['S', 'O', 'A', 'P'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeSection === section
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{section}</span>
              <span className="ml-2 text-sm">
                {section === 'S' ? 'Subjective' :
                 section === 'O' ? 'Objective' :
                 section === 'A' ? 'Assessment' : 'Plan'}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'S' && renderSubjective()}
          {activeSection === 'O' && renderObjective()}
          {activeSection === 'A' && renderAssessment()}
          {activeSection === 'P' && renderPlan()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <select
              value={note.visitType}
              onChange={(e) => setNote(prev => ({
                ...prev,
                visitType: e.target.value as SOAPNote['visitType']
              }))}
              className="p-2 border rounded"
            >
              <option value="initial_evaluation">Initial bedömning</option>
              <option value="follow_up">Uppföljning</option>
              <option value="re_evaluation">Ombedömning</option>
              <option value="discharge">Utskrivning</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Spara utkast
            </button>
            <button
              onClick={handleSignNote}
              disabled={isSaving || !note.subjective.chiefComplaint || !note.assessment.diagnosis}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Signerar...' : 'Signera anteckning'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNotes;
