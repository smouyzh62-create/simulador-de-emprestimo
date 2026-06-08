/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Lock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  TrendingUp, 
  Coins, 
  Calendar, 
  ChevronRight, 
  Settings, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  ArrowRight, 
  ExternalLink, 
  X,
  RefreshCw,
  Clock,
  Check,
  CheckCircle2,
  Users
} from 'lucide-react';
import { LoanSimulationConfig, UserFormData, SimulationResult } from './types';
import { DYNAMIC_SYSTEM_CONFIG, getActiveRotatedRoutes, advanceRotationIndex } from './config';
import { initializeFacebookPixel, trackFacebookContact } from './pixel';

export default function App() {
  // Simulation steps: 'PARAMETERS' | 'IDENTIFICATION' | 'PROCESSING' | 'RESULT'
  const [step, setStep] = useState<'PARAMETERS' | 'IDENTIFICATION' | 'PROCESSING' | 'RESULT'>('PARAMETERS');

  // Input States
  const [desiredAmount, setDesiredAmount] = useState<number>(75000);
  const [installments, setInstallments] = useState<number>(48);
  const [loanReason, setLoanReason] = useState<string>('Capital de Giro');

  const [formData, setFormData] = useState<UserFormData>({
    hasCNPJ: true,
    cnpj: '',
    companyName: '',
    fullName: '',
    cpf: '',
    phone: '',
    email: '',
    monthlyIncome: '',
    desiredAmount: 75000,
    installments: 48,
    loanReason: 'Capital de Giro'
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [tacAccepted, setTacAccepted] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback || ((cb: IdleRequestCallback) => window.setTimeout(cb, 1200));
    const idleId = idleCallback(() => initializeFacebookPixel());

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  // Processing Animation state
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  // Simulation Result State
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [customInviteCode, setCustomInviteCode] = useState('');

  const interestRateBase = 1.39; // Taxa de 1.39% a.m.

  // Real-time ticking indicators of simulated credit approvals (authentic trust elements)
  const [approvalTickers, setApprovalTickers] = useState([
    { name: 'Ricardo S.', city: 'São Paulo - SP', amount: 'R$ 15.000', label: 'Aprovado via WhatsApp', time: 'Há 2 min' },
    { name: 'Mariana F.', city: 'Belo Horizonte - MG', amount: 'R$ 38.000', label: 'Aprovado via Telegram', time: 'Há 5 min' },
    { name: 'José A.', city: 'Salvador - BA', amount: 'R$ 8.000', label: 'Aprovado via WhatsApp', time: 'Há 12 min' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate real-time loans being issued across map
      const names = ['Camila R.', 'Marcos O.', 'Fernanda L.', 'Lucas G.', 'Daiana S.', 'Bruno V.', 'Tatiane K.'];
      const cities = ['Brasília - DF', 'Curitiba - PR', 'Fortaleza - CE', 'Porto Alegre - RS', 'Recife - PE', 'Manaus - AM', 'Campinas - SP'];
      const values = ['5.000', '12.000', '25.000', '45.000', '70.000', '3.500', '18.500'];
      const channel = Math.random() > 0.5 ? 'Aprovado via WhatsApp' : 'Aprovado via Telegram';
      
      const newApproval = {
        name: names[Math.floor(Math.random() * names.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        amount: `R$ ${values[Math.floor(Math.random() * values.length)]}`,
        label: channel,
        time: 'Agora mesmo'
      };

      setApprovalTickers(prev => [newApproval, prev[0], prev[1]]);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  // Format Helpers
  const formatCNPJ = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 14);
    if (!clean) return '';
    if (clean.length <= 2) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
    if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
    if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12, 14)}`;
  };

  const formatCPF = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
  };

  const formatPhone = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 11);
    if (!clean) return '';
    if (clean.length <= 2) return `(${clean}`;
    if (clean.length <= 7) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  };

  const formatCurrencyInput = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    const number = parseInt(clean, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const getRawNumberFromCurrency = (formatted: string): number => {
    const clean = formatted.replace(/\D/g, '');
    if (!clean) return 0;
    return parseInt(clean, 10) / 100;
  };

  // Live Loan Calculation for Parameter sliders (Amortization math)
  const calculateInstallment = (principal: number, termMonths: number, ratePercent: number) => {
    const i = ratePercent / 100;
    const factor = (i * Math.pow(1 + i, termMonths)) / (Math.pow(1 + i, termMonths) - 1);
    return Math.round(principal * factor * 100) / 100;
  };

  const currentEstInstallment = calculateInstallment(desiredAmount, installments, interestRateBase);

  // Validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (formData.hasCNPJ) {
      const cleanCNPJ = formData.cnpj.replace(/\D/g, '');
      if (cleanCNPJ.length !== 14) {
        errors.cnpj = 'CNPJ inválido. Certifique-se de que possui 14 dígitos.';
      }
      if (!formData.companyName.trim()) {
        errors.companyName = 'Favor preencher o Nome Fantasia ou Razão Social da empresa.';
      }
    }

    if (!formData.fullName.trim() || formData.fullName.trim().split(' ').length < 2) {
      errors.fullName = 'Favor preencher o nome completo do representante legal (Nome e Sobrenome).';
    }

    const cleanCPF = formData.cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      errors.cpf = 'CPF inválido do representante. Certifique-se de que possui 11 dígitos.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      errors.phone = 'Insira um telefone/WhatsApp celular válido com DDD.';
    }

    if (!formData.email.includes('@') || formData.email.length < 5) {
      errors.email = 'Insira um endereço de e-mail de contato válido.';
    }

    const income = getRawNumberFromCurrency(formData.monthlyIncome);
    if (income < 1000) {
      errors.monthlyIncome = formData.hasCNPJ 
        ? 'O faturamento mensal mínimo exigido para simulação PJ é de R$ 1.000,00.'
        : 'O faturamento/rendimento autônomo mínimo de simulação é de R$ 1.000,00.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleStartSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      desiredAmount: desiredAmount,
      installments: installments,
      loanReason: loanReason
    }));
    setStep('IDENTIFICATION');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on type
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleIdentificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!tacAccepted) {
      alert('Favor aceitar a Declaração de Uso e os Termos de Privacidade.');
      return;
    }

    setStep('PROCESSING');
    setProgress(0);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Processing Simulated Hook
  useEffect(() => {
    if (step !== 'PROCESSING') return;

    let startTime = Date.now();
    const duration = 4200; // 4.2 seconds simulating deep banking scoring algorithm
    let frame: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct < 15) {
        setProcessingStatus('Inicializando conexões criptografadas de crédito PJ...');
      } else if (pct < 35) {
        setProcessingStatus(`Buscando perfil cadastral empresarial para ${formData.hasCNPJ ? `CNPJ: ${formData.cnpj}` : `CPF: ${formData.cpf}`}...`);
      } else if (pct < 55) {
        setProcessingStatus('Analisando faturamento mensal declarado e score de adimplência bancária...');
      } else if (pct < 75) {
        setProcessingStatus(`Calculando limite pré-aprovado corporativo baseado no faturamento de ${formData.monthlyIncome}...`);
      } else if (pct < 95) {
        setProcessingStatus('Avaliando taxas de subsídio corporativo e desconto especial PJ...');
      } else {
        setProcessingStatus('Gerando chaves de autenticação do contrato de limite autorizado PJ...');
      }

      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        // Calculation is complete! Setup simulated results matching their profile
        const userDesired = formData.desiredAmount;
        const incomeNum = getRawNumberFromCurrency(formData.monthlyIncome);
        
        // Define realistic maximum limit (e.g., up to 45% of user income monthly payment ceiling or customized)
        const incomeCeilingLimit = Math.min(incomeNum * 12, 180000); 
        let approved = userDesired;
        
        if (approved > incomeCeilingLimit) {
          // If they asked for more than they could afford, calculate realistic approved
          approved = Math.round(incomeCeilingLimit / 1000) * 1000;
        }

        // Add some random natural offset (between -10% and +20%) to make the approved amount look authentic!
        const randomFactor = 0.9 + Math.random() * 0.3;
        approved = Math.round((approved * randomFactor) / 500) * 500;
        if (approved < 1500) approved = 1500; // Minimum limit
        if (approved > 250000) approved = 250000; // Absolute ceiling

        const calculatedRate = +(1.19 + Math.random() * 0.4).toFixed(2); // Dynamic rate between 1.19% and 1.59% a.m.
        const approvedInstallment = calculateInstallment(approved, formData.installments, calculatedRate);

        // Date in 45 days formatted in PT-BR style
        const today = new Date();
        const dueDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
        const formattedDueDate = dueDate.toLocaleDateString('pt-BR');

        // Randomized code
        const randCode = Math.floor(100000 + Math.random() * 900000).toString();
        setCustomInviteCode(randCode);

        setResult({
          approvedAmount: approved,
          installments: formData.installments,
          installmentValue: approvedInstallment,
          interestRate: calculatedRate,
          firstDueDate: formattedDueDate,
          score: Math.floor(620 + Math.random() * 340) // High credit score representation
        });

        // Advance round-robin index for the next customer
        advanceRotationIndex();

        setStep('RESULT');
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step, formData]);

  // Generate customized redirect links with user details safely replaced
  const getWhatsAppLink = () => {
    if (!result) return '#';
    const { whatsappNumber } = getActiveRotatedRoutes();
    const rawNum = whatsappNumber.replace(/\D/g, '');
    
    // Replace placeholders
    let message = DYNAMIC_SYSTEM_CONFIG.whatsappMessageTemplate
      .replace(/{nome}/g, formData.fullName)
      .replace(/{cpf}/g, formData.cpf)
      .replace(/{cnpj}/g, formData.hasCNPJ ? formData.cnpj : 'Sem CNPJ')
      .replace(/{nome_empresa}/g, formData.hasCNPJ ? formData.companyName : 'Pessoa Física Autônoma')
      .replace(/{prazo}/g, result.installments.toString())
      .replace(/{valor_parcela}/g, `R$ ${result.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{valor_aprovado}/g, `R$ ${result.approvedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      .replace(/{codigo_atendimento}/g, `#BB-${customInviteCode}`);

    return `https://api.whatsapp.com/send?phone=${rawNum}&text=${encodeURIComponent(message)}`;
  };

  const getTelegramLink = () => {
    const { telegramLink } = getActiveRotatedRoutes();
    return telegramLink;
  };

  return (
    <div className="min-h-screen bg-[#F9D71C] font-sans text-[#0038A8] selection:bg-[#0038A8] selection:text-[#F9D71C] relative pb-20">
      
      {/* Official Top Compliance Alert Indicator */}
      <div id="top-alert-banner" className="bg-[#002766] text-[#F9D71C] py-2 px-4 text-xs text-center border-b border-[#0038A8] font-medium flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse-slow" />
        <span><strong>ALERTA DE SEGURANÇA:</strong> Os parceiros autorizados do Banco do Brasil NÃO solicitam depósitos, fiador ou parcelas antecipadas para liberar seu empréstimo.</span>
      </div>

      {/* Top Main Navigation Bar */}
      <nav id="main-navigation" className="bg-[#0038A8] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Banco do Brasil inspired Logo construct */}
            <div className="w-10 h-10 bg-[#F9D71C] rounded-sm flex items-center justify-center font-bold text-[#0038A8] text-xl border border-[#F9D71C]/20 shadow-sm">
              BB
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold text-[#F9D71C] tracking-tight leading-none uppercase">
                BANCO DO BRASIL
              </span>
              <span className="text-[10px] text-white/70 font-mono tracking-wider">
                Simulador de Crédito PJ & Financiamento Empresarial
              </span>
            </div>
          </div>

          {/* Secure SSL Connection status display */}
          <div className="hidden md:flex items-center gap-5 text-xs text-white/90">
            <span className="hover:text-[#F9D71C] cursor-pointer" onClick={() => setShowSecurityModal(true)}>Segurança Corporativa</span>
            <span className="hover:text-[#F9D71C] cursor-pointer font-medium" onClick={() => setShowPrivacyModal(true)}>Políticas de Privacidade PJ</span>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>SSL 256-Bit</span>
            </div>
          </div>
          {/* Mobile-only nav links */}
          <div className="flex md:hidden items-center justify-center gap-4 text-[11px] text-white/80 py-1.5 border-t border-white/10">
            <span className="cursor-pointer hover:text-[#F9D71C]" onClick={() => setShowSecurityModal(true)}>Segurança Corporativa</span>
            <span className="w-px h-3 bg-white/20"></span>
            <span className="cursor-pointer hover:text-[#F9D71C] font-medium" onClick={() => setShowPrivacyModal(true)}>Políticas PJ</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Secures and cleans navigation actions */}
          </div>
        </div>
      </nav>

      {/* Main Container Core */}
      <main className="max-w-6xl mx-auto px-4 mt-6 md:mt-10">
        
        {/* Dynamic header / breadcrumbs based on the active state */}
        <div className="mb-6 md:mb-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-block bg-[#0038A8] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest cursor-default shadow-sm border border-[#F9D71C]/20">
            Crédito de Empresa Pré-Aprovado
          </div>
          
          <h1 id="landing-headline" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0038A8] leading-tight">
            Tudo pronto para <br/><span className="text-blue-800">o capital de giro da sua empresa.</span>
          </h1>
          
          <p id="landing-sub-headline" className="mt-2.5 text-sm sm:text-base text-[#0038A8] max-w-lg mx-auto font-medium">
            Simule agora o empréstimo corporativo ideal para seu negócio (Simulação com ou sem CNPJ) e garanta taxas sob medida a partir de <strong className="font-extrabold underline decoration-white">1,19% a.m.</strong>
          </p>
        </div>

        {/* Outer Split: Left highlights block, Right active action area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE COLUMN: Interactive Trust Blocks, steps, testimonials, guarantees */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8 order-2 lg:order-1">
            
            {/* Visual Advantage Items */}
            <div id="adv-box" className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 bb-card-shadow space-y-4">
              <h3 className="font-bold text-slate-900 text-base md:text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                <TrendingUp className="text-[#0038A8] w-5 h-5" />
                <span>Vantagens Imperdíveis BB</span>
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600 mt-0.5">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0038A8] text-sm md:text-base">Liberdade para usar o saldo</h4>
                  <p className="text-xs text-slate-500 mt-1">Use o empréstimo como quiser: quite dívidas caras com alta economia, compre carros ou pague custos médicos.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center flex-shrink-0 text-sky-600 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0038A8] text-sm md:text-base">Até 84 parcelas fixas</h4>
                  <p className="text-xs text-slate-500 mt-1">Planos de pagamento sob medida que cabem no seu orçamento, com parcelas mensais que nunca mudam.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center flex-shrink-0 text-violet-600 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0038A8] text-sm md:text-base">Primeiro pagamento em 45 dias</h4>
                  <p className="text-xs text-slate-500 mt-1">Tenha um respiro para colocar as contas em ordem antes de pagar a primeira parcela da negociação.</p>
                </div>
              </div>
            </div>

            {/* Simulated Live approvals stream (Creates huge conversion value and matches authentic active platform) */}
            <div id="live-stream-box" className="bg-white p-5 rounded-2xl border border-slate-200/80 bb-card-shadow">
              <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Análises de Crédito Recentes na Região</span>
              </h3>

              <div className="space-y-3.5">
                {approvalTickers.map((ticker, index) => (
                  <div key={index} className="text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-[#0038A8]/5 text-[#0038A8] flex items-center justify-center rounded-full font-bold">
                        {ticker.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{ticker.name} <span className="text-slate-400 font-normal">({ticker.city})</span></div>
                        <div className={`text-[10px] font-medium flex items-center gap-1 ${ticker.label.includes('WhatsApp') ? 'text-emerald-600' : 'text-sky-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ticker.label.includes('WhatsApp') ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                          {ticker.label}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{ticker.amount}</div>
                      <div className="text-[10px] text-slate-400">{ticker.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Security Guarantee Box */}
            <div id="secure-guarantee-box" className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/50 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Info className="w-4.5 h-4.5 text-amber-700 flex-shrink-0" />
                <span>Instrução importante para sua segurança</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                Nesta ferramenta de simulação de limite, não exigimos dados sigilosos como senhas de banco ou logins de contas. Use dados cadastrais padrão e certifique-se de preencher a renda de forma correspondente para que possamos emitir um limite real e de alta fidelidade técnica.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE COLUMN: Core Loan Simulation card block, with 4 steps */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            
            <div id="core-simulation-card" className="bg-white rounded-3xl border-t-8 border-bb-blue-dark md:border-t-12 border-x border-b border-slate-200/50 shadow-2xl overflow-hidden transition-all duration-300">
              
              {/* Card Header showing Current Sim Step Title */}
              <div className="bg-[#0038A8] p-5 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-16 bg-[#F9D71C] transform rotate-12 translate-x-20 -translate-y-6 opacity-30"></div>
                
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <span className="text-xs text-[#F9D71C] uppercase tracking-wider font-bold">
                      {step === 'PARAMETERS' && 'Passo 1 de 3: Parâmetros'}
                      {step === 'IDENTIFICATION' && 'Passo 2 de 3: Seus Dados'}
                      {step === 'PROCESSING' && 'Consultando bases de dados'}
                      {step === 'RESULT' && 'Simulação Concluída!'}
                    </span>
                    <h2 className="text-lg md:text-xl font-extrabold mt-0.5">
                      {step === 'PARAMETERS' && 'Defina o Valor do Empréstimo'}
                      {step === 'IDENTIFICATION' && 'Fácil e Sem Burocracia'}
                      {step === 'PROCESSING' && 'Análise de Crédito Inteligente'}
                      {step === 'RESULT' && '💳 Proposta Disponível Encontrada!'}
                    </h2>
                  </div>

                  <div className="text-right">
                    {step !== 'RESULT' && step !== 'PROCESSING' && (
                      <span className="text-xs bg-white/10 text-white rounded-full px-3 py-1 font-mono">
                        Taxa: 1.39% a.m.
                      </span>
                    )}

                    {step === 'RESULT' && (
                      <span className="text-xs bg-emerald-500 text-white rounded-full px-3 py-1 font-bold flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" /> APROVADO
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="mt-4 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#F9D71C] h-1.5 transition-all duration-550"
                    style={{
                      width: step === 'PARAMETERS' ? '33%' : 
                             step === 'IDENTIFICATION' ? '66%' : 
                             step === 'PROCESSING' ? `${progress}%` : '100%'
                    }}
                  />
                </div>
              </div>

              {/* CARD BODY SCREEN 1: SLIDERS & BASIC REQUEST PRE-CALCULATOR */}
              {step === 'PARAMETERS' && (
                <form id="calculator-form-step-1" onSubmit={handleStartSimulation} className="p-6 md:p-8 space-y-7">
                  
                  {/* SLIDER 1: Desired amount */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700">Quanto você precisa?</label>
                      <span className="text-lg md:text-xl font-extrabold text-[#0038A8] font-mono">
                        {desiredAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    <input 
                      id="desired-amount-input-range"
                      type="range"
                      min={1000}
                      max={150000}
                      step={1000}
                      value={desiredAmount}
                      onChange={(e) => setDesiredAmount(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0038A8]"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>R$ 1.000</span>
                      <span>R$ 75.000</span>
                      <span>R$ 150.000+</span>
                    </div>
                  </div>

                  {/* SLIDER 2: Installments selection */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700 font-mono">Prazo para pagar</label>
                      <span className="text-lg font-bold text-[#0038A8]">
                        {installments} <span className="text-xs text-slate-500 font-normal">meses</span>
                      </span>
                    </div>

                    <input 
                      id="installments-input-range"
                      type="range"
                      min={12}
                      max={84}
                      step={6}
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0038A8]"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>12 meses</span>
                      <span>48 meses</span>
                      <span>84 meses</span>
                    </div>
                  </div>

                  {/* DROP DOWN Selector: Purpose */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Objetivo do Empréstimo</label>
                    <select 
                      id="loan-purpose-dropdown"
                      value={loanReason}
                      onChange={(e) => setLoanReason(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] bg-white text-sm"
                    >
                      <option value="Repactuar Dívidas">Repactuar Dívidas (Quitação de outras contas)</option>
                      <option value="Investimento Pessoal">Investar no próprio negócio / Ampliação</option>
                      <option value="Reforma de Casa">Reforma da Casa ou Apartamento</option>
                      <option value="Despesas de Saúde">Custos Médicos ou de Saúde Emergencial</option>
                      <option value="Viagem e Educação">Viagens ou investimento em Educação</option>
                      <option value="Uso Livre">Outros motivos / Uso Geral Livre</option>
                    </select>
                  </div>

                  {/* Real-time Math Estimation Box (Increases credibility enormously!) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Parcela Estimada</span>
                      <strong className="text-[#0038A8] text-lg sm:text-xl font-bold font-mono">
                        {currentEstInstallment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-4">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Planejado</span>
                      <strong className="text-slate-700 text-sm md:text-base font-bold font-mono">
                        {(currentEstInstallment * installments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>
                  </div>

                  {/* CTA Continue */}
                  <button 
                    id="submit-step-1-btn"
                    type="submit"
                    className="w-full bg-[#0038A8] text-white hover:bg-[#002c8a] font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer bb-btn-glow text-base"
                  >
                    <span>Simular Crédito Agora</span>
                    <ArrowRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1" />
                  </button>

                  <div className="flex items-center justify-center gap-5 text-[11px] text-[#0038A8]/60 pt-1 font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sem tarifa oculta</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Simulação rápida</span>
                  </div>
                </form>
              )}


              {/* CARD BODY SCREEN 2: IDENTIFICATION / FORM INPUT CAPTURE */}
              {step === 'IDENTIFICATION' && (
                <form id="calculator-form-step-2" onSubmit={handleIdentificationSubmit} className="p-6 md:p-8 space-y-5 animate-fade-in">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5 mb-2">
                    <Coins className="text-[#0038A8] w-5 h-5 flex-shrink-0" />
                    <span className="text-xs text-slate-600">
                      Simulando: <strong className="text-slate-800">{desiredAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</strong> em <strong className="text-slate-800">{installments}x</strong> para <strong className="text-slate-800">"{loanReason}"</strong>.
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setStep('PARAMETERS')}
                      className="text-xs text-[#0038A8] underline hover:text-[#002c8a] ml-auto flex-shrink-0"
                    >
                      Alterar
                    </button>
                  </div>

                  {/* Radio Selector: CNPJ option */}
                  <div className="bg-[#0038A8]/5 p-4 rounded-xl border border-[#0038A8]/10 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs font-bold text-[#0038A8] uppercase tracking-wider">A sua empresa possui CNPJ?</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                          <input
                            type="radio"
                            name="hasCNPJOption"
                            checked={formData.hasCNPJ === true}
                            onChange={() => {
                              setFormData(prev => ({ ...prev, hasCNPJ: true }));
                              setFormErrors(prev => ({ ...prev, cnpj: undefined, companyName: undefined }));
                            }}
                            className="text-[#0038A8] focus:ring-[#0038A8] w-4 h-4 cursor-pointer"
                          />
                          <span>Sim (Pessoa Jurídica)</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                          <input
                            type="radio"
                            name="hasCNPJOption"
                            checked={formData.hasCNPJ === false}
                            onChange={() => {
                              setFormData(prev => ({ ...prev, hasCNPJ: false, cnpj: '', companyName: '' }));
                              setFormErrors(prev => ({ ...prev, cnpj: undefined, companyName: undefined }));
                            }}
                            className="text-[#0038A8] focus:ring-[#0038A8] w-4 h-4 cursor-pointer"
                          />
                          <span>Não possui (Sem CNPJ)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Corporate/Enterprise Fields (Only if hasCNPJ is true) */}
                  {formData.hasCNPJ && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 transition-all">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">CNPJ do seu Negócio</label>
                        <input 
                          id="input-cnpj"
                          type="text"
                          className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.cnpj ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm font-mono text-slate-800`}
                          placeholder="00.000.000/0001-00"
                          value={formData.cnpj}
                          onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                          required={formData.hasCNPJ}
                        />
                        {formErrors.cnpj && <p className="text-[11px] text-red-500 font-medium">{formErrors.cnpj}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">Nome Fantasia / Razão Social</label>
                        <input 
                          id="input-company-name"
                          type="text"
                          className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.companyName ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm text-slate-800`}
                          placeholder="Ex: Minha Empresa LTDA"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          required={formData.hasCNPJ}
                        />
                        {formErrors.companyName && <p className="text-[11px] text-red-500 font-medium">{formErrors.companyName}</p>}
                      </div>
                    </div>
                  )}

                  {/* Personal Identity / Representative info Section */}
                  <div className="space-y-4 border-t border-slate-100 pt-3">
                    <h4 className="text-[11px] font-extrabold text-[#0038A8] uppercase tracking-wider">
                      {formData.hasCNPJ ? 'Dados da Pessoa Física (Representante Legal)': 'Dados da Pessoa Física / Proprietário'}
                    </h4>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">Nome Completo</label>
                      <input 
                        id="input-name"
                        type="text"
                        className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.fullName ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm text-slate-800`}
                        placeholder="Nome social ou conforme Receita Federal"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                      />
                      {formErrors.fullName && <p className="text-[11px] text-red-500 font-medium">{formErrors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Field 2: CPF */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">CPF do Representante</label>
                        <input 
                          id="input-cpf"
                          type="text"
                          className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.cpf ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm font-mono text-slate-800`}
                          placeholder="000.000.000-00"
                          value={formData.cpf}
                          onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                          required
                        />
                        {formErrors.cpf && <p className="text-[11px] text-red-500 font-medium">{formErrors.cpf}</p>}
                      </div>

                      {/* Field 3: Monthly Net Revenue */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">
                          {formData.hasCNPJ ? 'Faturamento Mensal do Negócio' : 'Sua Renda Líquida Mensal'}
                        </label>
                        <input 
                          id="input-income"
                          type="text"
                          className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.monthlyIncome ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm font-mono text-slate-800`}
                          placeholder="R$ 0,00"
                          value={formData.monthlyIncome}
                          onChange={(e) => handleInputChange('monthlyIncome', formatCurrencyInput(e.target.value))}
                          required
                        />
                        {formErrors.monthlyIncome && <p className="text-[11px] text-red-500 font-medium">{formErrors.monthlyIncome}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Row: Email & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                    {/* Field 4: WhatsApp Celular */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase font-mono">Celular / WhatsApp</label>
                      <input 
                        id="input-phone"
                        type="text"
                        className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm font-mono text-slate-800`}
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                        required
                      />
                      {formErrors.phone && <p className="text-[11px] text-red-500 font-medium">{formErrors.phone}</p>}
                    </div>

                    {/* Field 5: Email */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase">E-mail Principal</label>
                      <input 
                        id="input-email"
                        type="email"
                        className={`w-full px-4 py-2.5 rounded-lg border ${formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-slate-200'} outline-none focus:border-[#0038A8] focus:ring-1 focus:ring-[#0038A8] text-sm text-slate-800`}
                        placeholder="nome@exemplo.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                      {formErrors.email && <p className="text-[11px] text-red-500 font-medium">{formErrors.email}</p>}
                    </div>
                  </div>

                  {/* Term of Compliance Accept Checkbox */}
                  <div className="flex items-start gap-2.5 pt-1">
                    <input 
                      id="input-tac-accepted"
                      type="checkbox"
                      checked={tacAccepted}
                      onChange={(e) => setTacAccepted(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-[#0038A8] focus:ring-[#0038A8] w-4.5 h-4.5 cursor-pointer"
                    />
                    <label htmlFor="input-tac-accepted" className="text-xs text-slate-500 leading-snug cursor-pointer selection:bg-none">
                      Declaro que sou maior de 18 anos, concordo com os Termos de Uso e autorizo a consulta cadastral segura exclusiva para simulação rápida de crédito pj.
                    </label>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      id="back-to-step-1"
                      type="button"
                      onClick={() => setStep('PARAMETERS')}
                      className="px-5 py-3.5 border border-slate-200 text-[#0038A8] hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-semibold text-sm bg-white"
                    >
                      Voltar
                    </button>

                    <button 
                      id="submit-step-2-btn"
                      type="submit"
                      className="flex-1 bg-[#0038A8] text-white hover:bg-[#002c8a] font-bold py-3.5 px-6 rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer bb-btn-glow text-sm"
                    >
                      <span>Simular Limite Agora</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}


              {/* CARD BODY SCREEN 3: HIGH FIDELITY SCANNING / PROCESSING STAGE */}
              {step === 'PROCESSING' && (
                <div id="processing-view" className="p-8 md:p-12 text-center space-y-8 flex flex-col items-center">
                  
                  {/* Outer Pulsing & Scanning circle container */}
                  <div className="relative w-28 h-28 bg-[#0038A8]/5 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden">
                    {/* Laser line effect */}
                    <div className="absolute left-0 right-0 h-1 bg-[#F9D71C] shadow-[0_0_10px_#F9D71C] animate-scan top-1"></div>
                    
                    {/* Pulsing Core icon */}
                    <div className="w-16 h-16 bg-[#0038A8] text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-6 animate-pulse">
                      <Building className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Progress Display */}
                  <div className="space-y-4 max-w-sm w-full">
                    <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                      <span>Procurando margem segura</span>
                      <span className="font-bold text-[#0038A8] text-sm">{progress}%</span>
                    </div>

                    {/* Styled Track bar */}
                    <div className="h-2.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden w-full relative">
                      <div 
                        className="bg-gradient-to-r from-[#0038A8] to-[#002c8a] h-full transition-all duration-150 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Animated current action label */}
                    <div className="h-5 flex items-center justify-center">
                      <p className="text-xs text-slate-500 font-medium italic animate-pulse">
                        {processingStatus}
                      </p>
                    </div>
                  </div>

                  {/* Simple Loading Checklist layout */}
                  <div className="border border-slate-100 bg-slate-50 p-4 rounded-2xl max-w-sm w-full space-y-2 text-left">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      {progress >= 15 ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-[#0038A8] animate-spin flex-shrink-0" />
                      )}
                      <span className={progress >= 15 ? 'line-through text-slate-400' : ''}>Conectando ao terminal de crédito</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      {progress >= 55 ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <RefreshCw className={`w-4 h-4 ${progress >= 15 ? 'text-[#0038A8] animate-spin' : 'text-slate-300'} flex-shrink-0`} />
                      )}
                      <span className={progress >= 55 ? 'line-through text-slate-400' : ''}>Análise de CPF e históricos de margem</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      {progress >= 95 ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <RefreshCw className={`w-4 h-4 ${progress >= 55 ? 'text-[#0038A8] animate-spin' : 'text-slate-300'} flex-shrink-0`} />
                      )}
                      <span className={progress >= 95 ? 'line-through text-slate-400' : ''}>Ajustando limite contra {formData.monthlyIncome}</span>
                    </div>
                  </div>
                </div>
              )}


              {/* CARD BODY SCREEN 4: PRE-APPROVED LIMIT POPPED UP & PRIMARY WS / TG ACTION CTA REPLACE */}
              {step === 'RESULT' && result && (
                <div id="simulated-result-view" className="p-6 md:p-8 space-y-6">
                  
                  {/* Approved Limit Statement Card */}
                  <div className="bg-[#0038A8]/5 border-2 border-dashed border-[#0038A8]/40 p-5 rounded-2xl space-y-4">
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#0038A8]" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Proposta gerada com sucesso</span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300/30">
                        Score: {result.score} (Excelente)
                      </span>
                    </div>

                    {/* Massive Approved Amount display */}
                    <div className="text-center py-2 space-y-1">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wide block">
                        Limite de Crédito Disponível para Saque
                      </span>
                      <strong className="text-2xl sm:text-3xl md:text-3.5xl font-extrabold text-[#0038A8] tracking-tight font-mono block">
                        {result.approvedAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </strong>
                    </div>

                    {/* Breakdown table split */}
                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Forma de Pagto</span>
                        <strong className="text-slate-700 font-bold font-mono">
                          {result.installments} parcelas de {result.installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Taxa com Desconto</span>
                        <strong className="text-slate-700 font-bold font-mono">
                          {result.interestRate}% a.m. (Fixas)
                        </strong>
                      </div>

                      <div className="pt-2">
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Carência</span>
                        <strong className="text-slate-700 font-bold font-mono">
                          45 Dias para Estrear
                        </strong>
                      </div>
                      <div className="text-right pt-2">
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Vencimento Inicial</span>
                        <strong className="text-slate-700 font-bold font-mono">
                          {result.firstDueDate}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* Core Instructional notice directing checkout to the messaging buttons */}
                  <div className="text-center space-y-1.5 max-w-md mx-auto">
                    <h3 className="font-extrabold text-slate-800 text-base md:text-lg">
                      🔑 Liberação de Limite Requer Verificação
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Seu saldo pré-aprovado de empréstimo está pronto. Selecione abaixo seu canal preferido para atendimento com nosso correspondente e conclua a assinatura eletrônica do contrato.
                    </p>
                  </div>

                  {/* THE CRITICAL REPLACEMENT: WhatsApp and Telegram buttons when limit pops up */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    
                    {/* BUTTON 1: WhatsApp Button */}
                    <a 
                     id="whatsapp-claim-limit-cta"
                     href={getWhatsAppLink()}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] shadow-md ws-btn-glow cursor-pointer relative overflow-hidden group border border-[#25D366]/20"
                     onClick={() => trackFacebookContact('whatsapp')}
                    >
                      {/* Accent highlight */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full"></div>
                      
                      <div className="flex items-center gap-2">
                        {/* Custom vector SVG WhatsApp style icon */}
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.954-.272-.087-.484-.136-.677.136-.193.272-.725.95-.947 1.143-.222.193-.483.193-.87.05-.386-.145-1.63-.58-3.025-1.99-1.097-1.048-1.838-2.33-2.05-2.723-.213-.393-.03-.588.164-.78.165-.163.383-.425.556-.633.173-.208.243-.373.383-.61.14-.237.07-.447-.02-.593-.09-.145-.83-1.99-1.144-2.73-.297-.72-.594-.61-.87-.623-.276-.013-.554-.013-.83-.013-.277 0-.635.07-.968.347-.332.276-1.28 1.255-1.28 3.06 0 1.806 1.28 3.546 1.454 3.79.173.244 2.564 3.94 6.2 5.51 1.28.556 2.33 1.02 3.72.416.347-.15 1.94-.788 2.33-1.97.39-1.183.39-2.18.33-2.344-.06-.163-.27-.24-.58-.357z" fill="white"/>
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zm-5.1 14.28l-.29-.45c-.72-1.12-1.1-2.42-1.1-3.78 0-3.59 2.91-6.5 6.49-6.5 1.74 0 3.37.68 4.6 1.91 1.23 1.23 1.91 2.87 1.91 4.6 0 3.59-2.91 6.5-6.49 6.5-1.36 0-2.65-.39-3.76-1.13l-.47-.32-4.35 1.14 1.15-4.24.31-.44z" fill="white" fill-opacity="0.3"/>
                          </svg>
                        <span className="font-extrabold text-sm tracking-tight">RECEBER NO WHATSAPP</span>
                      </div>
                      <span className="text-[10px] text-white/95 font-medium mt-1">
                        Liberação Expressa via Atendente
                      </span>
                    </a>

                    {/* BUTTON 2: Telegram Button */}
                    <a 
                     id="telegram-claim-limit-cta"
                     href={getTelegramLink()}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-[#0088cc] hover:bg-[#007cbd] text-white p-4 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02] shadow-md tg-btn-glow cursor-pointer relative overflow-hidden group border border-[#0088cc]/20"
                     onClick={() => trackFacebookContact('telegram')}
                    >
                      {/* Accent highlight */}
                      <div className="absolute top-0 right-0 w-8 h-8 bg-white/10 rounded-bl-full"></div>

                      <div className="flex items-center gap-2">
                        {/* Custom vector SVG Telegram logo */}
                        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.88 8-3.42 3.81-1.55 4.6-1.82 5.12-1.83.11 0 .37.03.53.16.14.12.18.28.2.44.02.11.01.24-.01.37z"/>
                        </svg>
                        <span className="font-extrabold text-sm tracking-tight">RECEBER NO TELEGRAM</span>
                      </div>
                      <span className="text-[10px] text-white/95 font-medium mt-1">
                        Atendimento com Robô Assistente
                      </span>
                    </a>

                  </div>

                  {/* Service Ticket metadata box */}
                  <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0038A8]" />
                      <span>Protocolo de Empréstimo: <strong className="font-mono text-slate-700">#BB-{customInviteCode}</strong></span>
                    </div>
                    <span>Proposta garantida por 24 horas</span>
                  </div>

                  {/* Reset/Simulate again button */}
                  <div className="text-center pt-2">
                    <button 
                      id="reset-simulation-workflow"
                      type="button"
                      onClick={() => setStep('PARAMETERS')}
                      className="text-xs text-[#0038A8] font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Efetuar nova simulação de empréstimo</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* COMPREHENSIVE COMPLIANCE & PORTFOLIO BANNER UNDER CARD */}
        <div id="trust-footer-grid" className="mt-16 border-t border-[#0038A8]/20 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#0038A8]/90">
          
          <div className="space-y-2">
            <h5 className="font-bold text-[#0038A8] text-sm flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#0038A8]" />
              <span>Correspondente Certificado</span>
            </h5>
            <p className="leading-relaxed opacity-95">
              Atuamos como canal digital complementar que facilita o acesso a crédito operacionalizado com alta segurança. Nossas operações obedecem às resoluções do Banco Central do Brasil em conformidade com as diretrizes do Sistema Financeiro Nacional.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#0038A8] text-sm flex items-center gap-1">
              <Lock className="w-4 h-4 text-[#0038A8]" />
              <span>Privacidade Absoluta LGPDP</span>
            </h5>
            <p className="leading-relaxed opacity-95">
              Garantimos proteção integral dos seus dados pessoais em concordância estrita com a Lei Geral de Proteção de Dados (LGPDP). Suas informações são transmitidas criptografadas de ponta a ponta e descartadas após a emissão do limite.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#0038A8] text-sm flex items-center gap-1">
              <Info className="w-4 h-4 text-[#0038A8]" />
              <span>Custo Efetivo Total (CET)</span>
            </h5>
            <p className="leading-relaxed opacity-95">
              Nossas taxas de simulação variam de 1,19% a.m. a 1,69% a.m. e o Custo Efetivo Total (CET) é apresentado de forma transparente e detalhada antes da formalização eletrônica da liberação do empréstimo no chat.
            </p>
          </div>

        </div>

        {/* FAQ - Frequently Asked Questions (Adds real depth and completes high-conversion structure) */}
        <section id="faq-section" className="mt-14 max-w-4xl mx-auto space-y-6">
          <h3 className="text-lg md:text-xl font-extrabold text-[#0038A8] text-center">Perguntas Frequentes (FAQ)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm text-[#0038A8]">
              <h4 className="font-bold text-sm text-slate-800 mb-1">Como vou receber o meu dinheiro após a simulação?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Após simular seu limite, clique em WhatsApp ou Telegram. Nosso robô assistente ou correspondente de plantão efetuará a conferência documental e liberará o depósito via Pix em até 30 minutos!
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm text-[#0038A8]">
              <h4 className="font-bold text-sm text-slate-800 mb-1">Eu preciso realizar algum pagamento adiantado?</h4>
              <p className="text-xs leading-relaxed font-bold text-emerald-700">
                Absolutamente NUNCA! O Banco do Brasil e correspondentes digitais sérios são expressamente proibidos de exigir pagamentos prévios como taxas, seguros ou fiadores.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm text-[#0038A8]">
              <h4 className="font-bold text-sm text-slate-800 mb-1">O limite simulado é garantido?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sim, a simulação utiliza o padrão de cálculo do banco cruzando as faixas de renda declaradas com históricos vigentes. Mais de 95% das propostas simuladas são emitidas fielmente no chat.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-[#0038A8]/20 bg-white/90 shadow-sm text-[#0038A8]">
              <h4 className="font-bold text-sm text-slate-800 mb-1 font-sans">Estou negativado. Consigo simular e obter aprovação?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sim! Temos linhas de crédito que dispensam fiador e utilizam margens alternativas para liberação sob tarifas confortáveis no boleto ou com desconto em folha.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* PERSISTENT LEGAL FOOTER */}
      <footer id="global-page-footer" className="bg-[#0038A8] text-white mt-16 py-10 px-8 text-center text-[10px] space-y-3 shadow-inner">
        <p className="font-bold text-[11px] tracking-wide text-[#F9D71C]">Correspondente Digital Autorizado Banco do Brasil S.A. Digital</p>
        <p className="opacity-80 max-w-4xl mx-auto leading-relaxed">
          © 2026 Banco Simulado S.A. Digital. Todos os direitos reservados. CNPJ 00.000.000/0001-91. O portal realiza simulações cadastrais de conformidade com os regulamentos operados sob o art. 15 da Lei nº 12.865 de 2013 e a Resolução nº 3.954 do Banco Central do Brasil.
        </p>

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSecurityModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0038A8] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-lg">Segurança Corporativa</h3>
              </div>
              <button onClick={() => setShowSecurityModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-[#0038A8] text-base">Proteção de Dados Bancários</p>
              <p>Todas as transmissões de dados realizadas através do nosso portal são protegidas por criptografia <strong>SSL de 256 bits</strong>. Isso significa que todas as informações enviadas entre o seu dispositivo e nossos servidores são codificadas e inacessíveis a terceiros.</p>

              <p className="font-bold text-[#0038A8] text-base">Conformidade Regulatória</p>
              <p>Operamos em estrita conformidade com as regulamentações do <strong>Banco Central do Brasil</strong>, incluindo a Resolução nº 3.954 e a Lei nº 12.865 de 2013. Nossos processos de simulação e encaminhamento de crédito seguem rigorosamente as diretrizes do Sistema Financeiro Nacional.</p>

              <p className="font-bold text-[#0038A8] text-base">Certificação e Auditoria</p>
              <p>Nossa plataforma é auditada regularmente por empresas independentes de segurança cibernética. Mantemos certificações ativas de conformidade com padrões internacionais de proteção de dados, incluindo práticas alinhadas à <strong>ISO 27001</strong>.</p>

              <p className="font-bold text-[#0038A8] text-base">Monitoramento Contínuo</p>
              <p>Utilizamos sistemas avançados de detecção de intrusão e monitoramento 24 horas por dia, 7 dias por semana, para identificar e neutralizar quaisquer tentativas de acesso não autorizado aos nossos sistemas.</p>

              <p className="font-bold text-[#0038A8] text-base">Proteção contra Fraudes</p>
              <p>Nossos algoritmos de inteligência artificial analisam continuamente padrões de comportamento para detectar e prevenir atividades fraudulentas. Todos os correspondentes autorizados passam por rigoroso processo de verificação de identidade.</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPrivacyModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0038A8] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold text-lg">Políticas de Privacidade PJ</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-[#0038A8] text-base">Coleta de Dados</p>
              <p>Coletamos apenas os dados estritamente necessários para a realização da simulação de crédito empresarial: CNPJ, razão social, dados do representante legal (CPF, nome completo), telefone de contato, e-mail e informações de faturamento mensal declarado.</p>

              <p className="font-bold text-[#0038A8] text-base">Finalidade do Tratamento</p>
              <p>Os dados fornecidos são utilizados exclusivamente para: (1) realização da simulação de limite de crédito; (2) encaminhamento ao correspondente bancário autorizado via WhatsApp ou Telegram; (3) cumprimento de obrigações regulatórias junto ao Banco Central do Brasil.</p>

              <p className="font-bold text-[#0038A8] text-base">Compartilhamento de Dados</p>
              <p>Seus dados são compartilhados apenas com o <strong>correspondente bancário autorizado</strong> selecionado pelo sistema de atendimento, exclusivamente através dos canais oficiais (WhatsApp ou Telegram). Não vendemos, alugamos ou compartilhamos suas informações com terceiros não autorizados.</p>

              <p className="font-bold text-[#0038A8] text-base">Armazenamento e Descarte</p>
              <p>Os dados de simulação são armazenados de forma criptografada por um período máximo de <strong>90 dias</strong>, conforme exigido para auditoria regulatória. Após esse período, todas as informações são permanentemente descartadas de nossos sistemas.</p>

              <p className="font-bold text-[#0038A8] text-base">Direitos do Titular (LGPD)</p>
              <p>Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, você tem direito a: acessar seus dados, solicitar correção, revogar consentimento, solicitar exclusão e portabilidade. Para exercer esses direitos, entre em contato através do canal de atendimento disponibilizado na simulação.</p>

              <p className="font-bold text-[#0038A8] text-base">Cookies e Rastreamento</p>
              <p>Utilizamos apenas cookies essenciais para o funcionamento da plataforma (como manutenção de sessão e prevenção de fraudes). Não utilizamos cookies de rastreamento, publicidade comportamental ou quaisquer tecnologias de perfilamento.</p>

              <p className="font-bold text-[#0038A8] text-base">Consentimento</p>
              <p>Ao utilizar nossa plataforma de simulação e aceitar os Termos de Uso, você consente expressamente com o tratamento de seus dados conforme descrito nesta Política de Privacidade. Você pode revogar este consentimento a qualquer momento.</p>
            </div>
          </div>
        </div>
      )}

      </footer>

    </div>
  );
}
