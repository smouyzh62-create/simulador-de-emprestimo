import { useState, useEffect, type FormEvent } from 'react';
import { 
  Lock, ShieldCheck, Phone, MessageCircle, Send, 
  Plus, Trash2, Save, RotateCcw, LogOut, AlertCircle, CheckCircle 
} from 'lucide-react';
import { DYNAMIC_SYSTEM_CONFIG, LoanRouteConfig, syncConfigToCookies } from './config';
import { getFacebookPixelId, saveFacebookPixelId } from './pixel';

const AUTH_KEY = 'bb_admin_auth';
const WS_POOL_KEY = 'bb_whatsapp_pool';
const TG_POOL_KEY = 'bb_telegram_pool';
const MSG_TEMPLATE_KEY = 'bb_message_template';
const DEFAULT_PASSWORD = 'admin123';
const PLACEHOLDERS = ['{nome}', '{cpf}', '{cnpj}', '{nome_empresa}', '{prazo}', '{valor_parcela}', '{valor_aprovado}', '{codigo_atendimento}'];

function readConfig(): LoanRouteConfig {
  try {
    const ws = localStorage.getItem(WS_POOL_KEY);
    const tg = localStorage.getItem(TG_POOL_KEY);
    const msg = localStorage.getItem(MSG_TEMPLATE_KEY);
    const wsPool = ws ? JSON.parse(ws) : DYNAMIC_SYSTEM_CONFIG.whatsappPool;
    const tgPool = tg ? JSON.parse(tg) : DYNAMIC_SYSTEM_CONFIG.telegramPool;
    const template = msg || DYNAMIC_SYSTEM_CONFIG.whatsappMessageTemplate;
    return { whatsappPool: wsPool, telegramPool: tgPool, whatsappMessageTemplate: template };
  } catch {
    return DYNAMIC_SYSTEM_CONFIG;
  }
}

function saveConfig(config: LoanRouteConfig) {
  localStorage.setItem(WS_POOL_KEY, JSON.stringify(config.whatsappPool));
  localStorage.setItem(TG_POOL_KEY, JSON.stringify(config.telegramPool));
  localStorage.setItem(MSG_TEMPLATE_KEY, config.whatsappMessageTemplate);
}

function resetConfig() {
  localStorage.removeItem(WS_POOL_KEY);
  localStorage.removeItem(TG_POOL_KEY);
  localStorage.removeItem(MSG_TEMPLATE_KEY);
}

function hashPassword(pw: string): string {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const chr = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [config, setConfig] = useState<LoanRouteConfig>(DYNAMIC_SYSTEM_CONFIG);
  const [newWs, setNewWs] = useState('');
  const [newTg, setNewTg] = useState('');
  const [pixelId, setPixelId] = useState(() => getFacebookPixelId());

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved === hashPassword(DEFAULT_PASSWORD)) {
      setAuthenticated(true);
      setConfig(readConfig());
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (hashPassword(password) === hashPassword(DEFAULT_PASSWORD)) {
      localStorage.setItem(AUTH_KEY, hashPassword(DEFAULT_PASSWORD));
      setAuthenticated(true);
      setConfig(readConfig());
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setPassword('');
  };

  const handleSave = () => {
    saveConfig(config);
    syncConfigToCookies(config);
    saveFacebookPixelId(pixelId);
    setSuccess('Configuracao salva!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleReset = () => {
    if (window.confirm('Restaurar padrao?')) {
      resetConfig();
      setConfig(DYNAMIC_SYSTEM_CONFIG);
      setSuccess('Restaurado!');
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const addWs = () => {
    if (!newWs.trim()) return;
    setConfig(prev => ({ ...prev, whatsappPool: [...prev.whatsappPool, newWs.trim()] }));
    setNewWs('');
  };

  const removeWs = (index: number) => {
    setConfig(prev => ({ ...prev, whatsappPool: prev.whatsappPool.filter((_, i) => i !== index) }));
  };

  const updateWs = (index: number, value: string) => {
    setConfig(prev => { const pool = [...prev.whatsappPool]; pool[index] = value; return { ...prev, whatsappPool: pool }; });
  };

  const addTg = () => {
    if (!newTg.trim()) return;
    setConfig(prev => ({ ...prev, telegramPool: [...prev.telegramPool, newTg.trim()] }));
    setNewTg('');
  };

  const removeTg = (index: number) => {
    setConfig(prev => ({ ...prev, telegramPool: prev.telegramPool.filter((_, i) => i !== index) }));
  };

  const updateTg = (index: number, value: string) => {
    setConfig(prev => { const pool = [...prev.telegramPool]; pool[index] = value; return { ...prev, telegramPool: pool }; });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold text-center mb-2">Painel de Administracao</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Insira a senha</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" className="w-full bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" autoFocus />
            {error && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" /><span>{error}</span></div>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-sm font-bold">Painel de Configuracao</h1><p className="text-[10px] text-slate-400">Rotas de Atendimento</p></div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs"><LogOut className="w-4 h-4" />Sair</button>
      </header>

      {success && <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm"><CheckCircle className="w-4 h-4" />{success}</div>}

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5"><Phone className="w-5 h-5 text-emerald-400" /><h2 className="font-bold text-base">WhatsApp - Numeros</h2></div>
          <div className="space-y-3">
            {config.whatsappPool.map((num, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-500 text-xs w-6">{idx + 1}.</span>
                <input value={num} onChange={e => updateWs(idx, e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" />
                <button onClick={() => removeWs(idx)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input value={newWs} onChange={e => setNewWs(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWs()} placeholder="Novo numero (ex: 551199990000)" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono placeholder:text-slate-500" />
            <button onClick={addWs} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 text-xs font-semibold"><Plus className="w-4 h-4" />Adicionar</button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5"><Send className="w-5 h-5 text-sky-400" /><h2 className="font-bold text-base">Telegram - Links</h2></div>
          <div className="space-y-3">
            {config.telegramPool.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-500 text-xs w-6">{idx + 1}.</span>
                <input value={link} onChange={e => updateTg(idx, e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono" />
                <button onClick={() => removeTg(idx)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input value={newTg} onChange={e => setNewTg(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTg()} placeholder="Novo link (ex: https://t.me/seu_bot)" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono placeholder:text-slate-500" />
            <button onClick={addTg} className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3 py-2 text-xs font-semibold"><Plus className="w-4 h-4" />Adicionar</button>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5"><MessageCircle className="w-5 h-5 text-indigo-400" /><h2 className="font-bold text-base">Template da Mensagem</h2></div>
          <textarea value={config.whatsappMessageTemplate} onChange={e => setConfig(prev => ({ ...prev, whatsappMessageTemplate: e.target.value }))} rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono resize-y" />
          <div className="mt-3 flex flex-wrap gap-2"><span className="text-[10px] text-slate-500 mr-1 mt-0.5">Variaveis:</span>{PLACEHOLDERS.map(p => (<span key={p} className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono border border-slate-700">{p}</span>))}</div>
        </section>

        {/* Facebook Pixel */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3"><MessageCircle className="w-5 h-5 text-blue-400" /><h2 className="font-bold text-base">Facebook Pixel</h2></div>
          <p className="text-xs text-slate-400 mb-3">Insira o ID do seu Pixel para rastrear conversoes.</p>
          <input value={pixelId} onChange={e => setPixelId(e.target.value)} placeholder="Ex: 123456789012345" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono placeholder:text-slate-500" />
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-lg"><Save className="w-4 h-4" />Salvar</button>
          <button onClick={handleReset} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-3 rounded-xl text-sm border border-slate-700"><RotateCcw className="w-4 h-4" />Restaurar</button>
        </div>
        <p className="text-[10px] text-slate-600 text-center pt-4 border-t border-slate-800">Limpe o cache para restaurar o padrao.</p>
      </div>
    </div>
  );
}
