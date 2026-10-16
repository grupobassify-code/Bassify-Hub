import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ADMIN_EMAIL } from '../data/initialData';
import { DEFAULT_FIGURE_AVATARS } from '../utils/avatars';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, login, register, resetAdminPassword, logout } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register states
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState(DEFAULT_FIGURE_AVATARS[1].url);
  const [regError, setRegError] = useState<string | null>(null);

  // Recovery states - Strictly protected, no default credentials shown
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryPin, setRecoveryPin] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryPass, setShowRecoveryPass] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isTryingAdmin = loginEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Por favor completa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    const res = await login(loginEmail.trim(), loginPassword);
    setIsLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setLoginPassword('');
    } else {
      setLoginError(res.error || 'No se pudo iniciar sesión.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regEmail.trim() || !regName.trim() || !regPassword) {
      setRegError('Todos los campos son obligatorios.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (regEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setRegError('Este correo oficial solo puede ser accedido en la pestaña Iniciar Sesión con su contraseña.');
      return;
    }

    setIsLoading(true);
    const res = await register(regEmail.trim(), regName.trim(), regPassword, regAvatar);
    setIsLoading(false);

    if (res.success) {
      setIsAuthModalOpen(false);
      setRegPassword('');
    } else {
      setRegError(res.error || 'Error al crear la cuenta.');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (!recoveryEmail.trim() || !recoveryPin.trim() || !recoveryNewPassword) {
      setRecoveryError('Por favor completa el correo, el PIN de seguridad y tu nueva contraseña.');
      return;
    }

    if (recoveryNewPassword.length < 6) {
      setRecoveryError('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    const res = await resetAdminPassword(recoveryPin.trim(), recoveryNewPassword, recoveryEmail.trim());
    setIsLoading(false);

    if (res.success) {
      setRecoverySuccess('¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
      setLoginEmail(recoveryEmail.trim());
      setLoginPassword(recoveryNewPassword);
      setRecoveryPin('');
      setRecoveryNewPassword('');
      setRecoveryConfirmPassword('');
      setTimeout(() => {
        setActiveTab('login');
      }, 1600);
    } else {
      setRecoveryError(res.error || 'Código o PIN de recuperación incorrecto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#091326] border border-[#1b2f56] rounded-3xl overflow-hidden shadow-2xl p-5 sm:p-7 text-slate-200 my-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003791] to-[#0070d1] flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-900/40 mb-3 border border-blue-400/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            Centro de Acceso y Seguridad
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma protegida Bassify Hub. Acceso con contraseña requerida.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-[#060c18] p-1 border border-[#16274a] mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-[#00439c] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-[#00439c] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('recovery');
              setRecoveryError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'recovery'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Recuperar contraseña o acceso a tu cuenta"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recuperar</span>
          </button>
        </div>

        {/* TAB 1: INICIAR SESIÓN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Notice if user enters protected admin account */}
            {isTryingAdmin ? (
              <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-200 space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white">
                    Cuenta de Administrador Protegida
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Esta cuenta oficial está protegida. Ingresa tu contraseña confidencial de acceso.
                </p>
                <div className="pt-1 flex items-center justify-end text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(loginEmail);
                      setActiveTab('recovery');
                    }}
                    className="text-blue-300 hover:text-white underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ingresa con tu correo y contraseña</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('recovery')}
                  className="text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tu_correo@ejemplo.com"
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                {isTryingAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('recovery')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline"
                  >
                    Recuperar con PIN
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña..."
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003791] to-[#0070d1] hover:brightness-110 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: REGISTRARSE */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre de Usuario o Gamertag *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ej. BassifyMaster, NeonPilot..."
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="tu_correo@ejemplo.com"
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña (Mínimo 6 caracteres) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Crea una contraseña segura..."
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Geometric Figure Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Elige tu Foto de Perfil (Figuras Minimalistas)</span>
                </label>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-[#060c18] p-2.5 rounded-2xl border border-[#16274a]">
                {DEFAULT_FIGURE_AVATARS.slice(1).map(avatar => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setRegAvatar(avatar.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                      regAvatar === avatar.url
                        ? 'border-blue-400 scale-105 shadow-md shadow-blue-500/30'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-600'
                    }`}
                    title={avatar.name}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    {regAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-blue-600/25 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003791] to-[#0070d1] hover:brightness-110 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}</span>
            </button>
          </form>
        )}

        {/* TAB 3: RECUPERACIÓN DE CUENTA */}
        {activeTab === 'recovery' && (
          <form onSubmit={handleRecoverySubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#0b1730] border border-blue-500/30 text-blue-200 space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">
                  Restablecer Contraseña de Acceso
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ingresa el correo electrónico de tu cuenta y tu PIN o clave de seguridad privada para configurar una nueva contraseña.
              </p>
            </div>

            {/* Email of account to recover */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico de la Cuenta *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  placeholder="tu_correo@ejemplo.com"
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Private Security PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                PIN o Clave Secreta de Seguridad *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={recoveryPin}
                  onChange={e => setRecoveryPin(e.target.value)}
                  placeholder="Ingresa tu PIN de seguridad..."
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-400 font-mono tracking-wider"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showRecoveryPass ? 'text' : 'password'}
                  required
                  value={recoveryNewPassword}
                  onChange={e => setRecoveryNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowRecoveryPass(!showRecoveryPass)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showRecoveryPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showRecoveryPass ? 'text' : 'password'}
                  required
                  value={recoveryConfirmPassword}
                  onChange={e => setRecoveryConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña..."
                  className="w-full bg-[#060c18] border border-[#1b2f56] text-sm text-white rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>
            </div>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{recoveryError}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#003791] to-[#0070d1] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}</span>
            </button>
          </form>
        )}

        {/* Guest Mode or current user info footer */}
        <div className="mt-5 pt-4 border-t border-[#16274a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 truncate max-w-[220px]">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            <span className="truncate">Actual: <strong className="text-white">{currentUser.name}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAuthModalOpen(false);
            }}
            className="text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors font-medium"
          >
            Continuar Navegando
          </button>
        </div>
      </div>
    </div>
  );
};
