import React, { useState, useEffect } from 'react';
import {
  X,
  Link as LinkIcon,
  Globe,
  ExternalLink,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';

export const LinkEditModal: React.FC = () => {
  const { linkEditingItem, setLinkEditingItem, updateGameLink, showToast, isAdmin } = useApp();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (linkEditingItem) {
      setUrl(linkEditingItem.downloadUrl && linkEditingItem.downloadUrl !== '#' ? linkEditingItem.downloadUrl : '');
      setError(null);
    }
  }, [linkEditingItem]);

  if (!linkEditingItem) return null;

  const handleClose = () => {
    setLinkEditingItem(null);
  };

  const handleTestLink = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      showToast('Por favor escribe un enlace para probarlo.');
      return;
    }
    const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
    showToast('Probando enlace en una nueva pestaña...');
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          showToast('Enlace pegado desde el portapapeles.');
        }
      }
    } catch {
      showToast('No se pudo acceder al portapapeles.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdmin) {
      setError('Solo el administrador verificado puede modificar los links.');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl) {
      setError('Por favor introduce un enlace web válido.');
      return;
    }

    // Auto prepend https:// if missing protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsSubmitting(true);
    await updateGameLink(linkEditingItem.id, finalUrl);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#091326] border border-[#1b2f56] rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-7 text-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#003791] to-[#0070d1] flex items-center justify-center text-white shadow-lg shadow-blue-900/40 border border-blue-400/30 shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Panel Admin
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              Cambiar Enlace / Sitio Web del Juego
            </h2>
          </div>
        </div>

        {/* Target Game Mini Banner */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0b162c] border border-[#18294a] flex items-center gap-3.5 mb-5 shadow-inner">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#20345d] bg-[#060c18] shrink-0 shadow-md">
            <SafeImage
              src={linkEditingItem.logoUrl}
              alt={linkEditingItem.title}
              fallbackTitle={linkEditingItem.title}
              itemType={linkEditingItem.type}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate">{linkEditingItem.title}</h3>
            <p className="text-xs text-slate-400 truncate">{linkEditingItem.developer} · {linkEditingItem.genre}</p>
            <p className="text-[11px] text-blue-300 font-mono mt-0.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate max-w-[240px]">
                {linkEditingItem.downloadUrl && linkEditingItem.downloadUrl !== '#'
                  ? linkEditingItem.downloadUrl
                  : 'Sin enlace web asignado actualmente'}
              </span>
            </p>
          </div>
        </div>

        {/* Edit Link Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Nuevo Link del Sitio Web Oficial *</span>
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Pegar</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://tu-juego.com o https://itch.io/tu-juego"
                className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-3.5 pr-24 py-3 focus:outline-none focus:border-blue-400 font-mono"
              />
              <button
                type="button"
                onClick={handleTestLink}
                className="absolute right-2 top-2 px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Probar en una nueva pestaña"
              >
                <span>Probar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              💡 Al guardar, el botón <strong>&quot;Visitar Sitio&quot;</strong> de este juego redirigirá inmediatamente a los usuarios a esta dirección URL.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#16274a]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#003791] to-[#0070d1] hover:brightness-110 text-white transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Enlace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
