
import React, { useState } from 'react';
import { PatientEducation } from '../types';
import { BookOpen, Activity, Clock, Microscope, GraduationCap, ChevronDown, ChevronUp, AlertCircle, Quote } from 'lucide-react';

interface PatientEducationModuleProps {
  education: PatientEducation;
}

const PatientEducationModule: React.FC<PatientEducationModuleProps> = ({ education }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!education) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 print:border-none print:shadow-none">
      {/* Header - Always Visible */}
      <div 
        className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start cursor-pointer transition-colors hover:bg-slate-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm text-primary-600 border border-slate-100">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patientinformation</span>
                <span className="bg-primary-100 text-primary-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Evidensbaserad</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{education.diagnosis}</h2>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">{education.explanation}</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section 1: Pathology & Biology */}
                <div className="space-y-6">
                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                            <Microscope size={18} className="text-purple-500" /> 
                            Vad händer i kroppen?
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            {education.pathology}
                        </p>
                    </div>

                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                            <Clock size={18} className="text-blue-500" /> 
                            Prognos & Tidslinje
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            {education.prognosis}
                        </p>
                    </div>
                </div>

                {/* Section 2: Science & Tips */}
                <div className="space-y-6">
                     <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                            <Activity size={18} className="text-green-500" /> 
                            Varför fungerar rehabilitering?
                        </h3>
                        <div className="text-slate-600 text-sm leading-relaxed bg-green-50/50 p-4 rounded-xl border border-green-100">
                            {education.scienceBackground}
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                            <GraduationCap size={18} className="text-amber-500" /> 
                            Råd för vardagen
                        </h3>
                        <ul className="space-y-2">
                            {education.dailyTips.map((tip, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-slate-700 items-start">
                                    <span className="min-w-[6px] h-[6px] rounded-full bg-amber-400 mt-2"></span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Sources Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    <Quote size={12} /> Baserat på kliniska riktlinjer
                </h4>
                <div className="flex flex-wrap gap-2">
                    {education.sources.map((source, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                            {source}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientEducationModule;
