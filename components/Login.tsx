
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Novas credenciais de administrador seguras
    if (email === 'admin@chegouseupedido.com.br' && password === 'C#egou!P3dido2024*') {
      onLogin();
    } else {
      setError('Credenciais inválidas. Verifique os dados e tente novamente.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="bg-[#0047BA] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100 transform -rotate-3">
            <i className="fa-solid fa-shield-halved text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tighter uppercase italic">Acesso Restrito</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Área de Administração</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">E-mail Administrativo</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0047BA] focus:bg-white focus:border-[#0047BA] outline-none transition-all font-bold text-gray-700 shadow-inner"
                placeholder="exemplo@chegouseupedido.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="fa-solid fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1 tracking-widest">Senha de Segurança</label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#0047BA] focus:bg-white focus:border-[#0047BA] outline-none transition-all font-bold text-gray-700 shadow-inner"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fa-solid fa-key absolute right-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-black uppercase text-center p-3 rounded-xl border border-red-100 flex items-center justify-center gap-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              className="w-full bg-[#0047BA] hover:bg-[#00338a] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase italic tracking-tighter text-lg"
            >
              ENTRAR NO PAINEL
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-gray-400 font-black py-2 text-[10px] uppercase tracking-widest hover:text-[#0047BA] transition-colors"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Voltar para o site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
