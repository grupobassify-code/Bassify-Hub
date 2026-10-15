import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, KeyRound, ArrowRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../data/initialData';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, loginAs, logout } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    loginAs(customEmail.trim(), customName.trim());
    setIsAuthModalOpen(false);
  };

  const handleSelectAdmin = () => {
    loginAs(ADMIN_EMAIL, 'Bassify Admin');
    setIsAuthModalOpen(false);
  };

  const handleSelectGuest = () => {
    loginAs('usuario_gamer@bassify.net', 'BassifyGamer');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#091326] border border-[#1b2f56] rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-200">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00439c] to-[#0070d1] flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-900/40 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Gestión de Cuenta y Permisos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Solo el correo oficial <strong className="text-blue-400 font-mono">grupobassify@gmail.com</strong> puede subir contenidos.
          </p>
        </div>

        {/* Current status */}
        <div className="p-3 bg-[#0d1830] border border-[#1d3159] rounded-2xl mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-blue-500/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                {currentUser.email}
              </p>
            </div>
          </div>

          {currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? (
            <span className="text-[10px] font-mono bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
              ADMIN
            </span>
          ) : (
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              USUARIO
            </span>
          )}
        </div>

        {/* Quick Profiles Switch */}
        <div className="space-y-2 mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Acceso Rápido de Prueba:
          </p>

          <button
            onClick={handleSelectAdmin}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#00439c]/90 to-[#0055cb]/90 hover:brightness-110 text-white transition-all shadow-md text-left"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-200" />
              <div>
                <p className="text-xs font-bold leading-none">Acceder como Administrador</p>
                <p className="text-[10px] text-blue-200 font-mono mt-0.5">grupobassify@gmail.com</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-200" />
          </button>

          <button
            onClick={handleSelectGuest}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0e1a34] hover:bg-[#142345] border border-[#1b2f56] text-slate-300 hover:text-white transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs font-semibold leading-none">Acceder como Usuario Estándar</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">usuario_gamer@bassify.net</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Custom Email Login Form */}
        <form onSubmit={handleCustomLogin} className="pt-4 border-t border-[#18294a] space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            O introduce cualquier otro correo:
          </p>

          <div>
            <input
              type="email"
              required
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
              placeholder="tu_correo@ejemplo.com"
              className="w-full bg-[#070e1c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>

          <div>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Nombre de usuario (opcional)"
              className="w-full bg-[#070e1c] border border-[#1b2e56] text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
          >
            Iniciar Sesión con este Correo
          </button>
        </form>
      </div>
    </div>
  );
};
