import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReportReason } from '../types';

export const ReportModal: React.FC = () => {
  const {
    reportingTarget,
    setReportingTarget,
    submitReport,
    currentUser,
  } = useApp();

  const [reason, setReason] = useState<ReportReason>('offensive_language');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportingTarget) return null;

  const reasonOptions: { id: ReportReason; label: string; desc: string }[] = [
    {
      id: 'offensive_language',
      label: 'Lenguaje ofensivo o malas palabras',
      desc: 'Insultos, groserías, lenguaje inapropiado o vulgar.',
    },
    {
      id: 'harassment',
      label: 'Acoso o toxicidad',
      desc: 'Ataques dirigidos, intimidación o incitación al odio.',
    },
    {
      id: 'spam',
      label: 'Contenido spam o publicidad',
      desc: 'Mensajes repetitivos, enlaces comerciales no solicitados.',
    },
    {
      id: 'malware',
      label: 'Enlace engañoso o peligroso',
      desc: 'Archivos sospechosos, phishing o malware.',
    },
    {
      id: 'fake_info',
      label: 'Información falsa o engañosa',
      desc: 'Versión adulterada o descripción no verídica.',
    },
    {
      id: 'other',
      label: 'Otro motivo',
      desc: 'Cualquier otra infracción a las normas de Bassify Hub.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedReasonObj = reasonOptions.find(r => r.id === reason);

    submitReport({
      targetType: reportingTarget.type,
      targetId: reportingTarget.id,
      targetTitle: reportingTarget.title,
      reportedContent: reportingTarget.content,
      authorEmail: reportingTarget.authorEmail || 'desconocido',
      reportedByEmail: currentUser.email,
      reportedByName: currentUser.name,
      reason,
      reasonText: selectedReasonObj?.label || 'Otro motivo',
      details: details.trim(),
    });

    setIsSubmitting(false);
    setReportingTarget(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#091326] border border-[#1b2f56] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#18294a] bg-gradient-to-r from-[#1a0f1d] via-[#121c38] to-[#091326] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Denunciar Contenido
              </h3>
              <p className="text-[11px] text-slate-400">
                Ayuda a mantener Bassify Hub seguro y libre de ofensas
              </p>
            </div>
          </div>

          <button
            onClick={() => setReportingTarget(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
          {/* Target preview snippet */}
          <div className="p-3 rounded-xl bg-[#070e1c] border border-[#18294a] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Elemento a denunciar:</span>
              <span className="font-mono text-blue-300 uppercase px-1.5 py-0.2 rounded bg-blue-950 text-[10px]">
                {reportingTarget.type === 'comment'
                  ? 'Comentario'
                  : reportingTarget.type === 'chat'
                  ? 'Mensaje de Chat'
                  : 'Publicación'}
              </span>
            </div>
            {reportingTarget.title && (
              <p className="text-xs font-bold text-white truncate">{reportingTarget.title}</p>
            )}
            <p className="text-xs text-slate-300 italic line-clamp-2 bg-[#0b162c] p-2 rounded-lg border border-[#16274a]">
              "{reportingTarget.content}"
            </p>
          </div>

          {/* Reason Radio Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Motivo principal de la denuncia *
            </label>
            <div className="space-y-1.5">
              {reasonOptions.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setReason(opt.id)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    reason === opt.id
                      ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/30'
                      : 'bg-[#0b162c] border-[#18294a] hover:bg-[#101e38]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id)}
                    className="mt-0.5 accent-rose-500"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{opt.label}</p>
                    <p className="text-[10px] text-slate-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detalles adicionales (Opcional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Explica brevemente por qué consideras ofensivo o inapropiado este elemento..."
              className="w-full bg-[#070e1c] border border-[#1b2f56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-rose-400 resize-none"
            />
          </div>

          {/* Privacy note */}
          <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              Tu reporte será evaluado directamente por el administrador oficial (grupobassify@gmail.com).
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setReportingTarget(null)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Denuncia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
