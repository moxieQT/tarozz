import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BookOpen, AlertCircle, Phone, Home, Download, Crown, BrainCircuit, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';

export function SafetyPlan() {
  const navigate = useNavigate();
  const { answers, subscription, openPaywall, recordCycleCompletion, checkAndUnlockAchievements, recordActivity, completedCycles, activePathPhases } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);
  const isPremium = subscription === 'premium';
  
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Record cycle completion on mount
  useEffect(() => {
    recordCycleCompletion();
    recordActivity();
    checkAndUnlockAchievements();
  }, []);

  const intent = answers[0]?.['intent'] || 'Обрести устойчивость и ясность';
  const pattern = answers[1]?.['pattern'] || 'Автоматическая реакция избегания';
  const newAction = answers[5]?.['action'] || 'Сделать паузу, замедлиться и дышать';
  const shadowGift = answers[4]?.['shadow'] || 'Сила для защиты своих границ';
  
  const fetchInsight = async () => {
    if (!isPremium) {
      openPaywall('feature');
      return;
    }
    setLoadingInsight(true);
    setTimeout(() => {
      setInsight('Данный инсайт теперь доступен локально. Ваши ответы проанализированы: ваша тень готова помочь вам установить новые ограничения, а выбранное осознанное действие открывает путь к спокойствию.');
      setLoadingInsight(false);
    }, 1500);
  };

  const handleDownloadPDF = async () => {
    if (!isPremium) {
      openPaywall('feature');
      return;
    }
    const element = printRef.current;
    if (!element) return;

    // Временно убираем темную тему перед рендером PDF (если нужно, чтобы PDF всегда был светлым)
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');

    const opt = {
      margin:       10,
      filename:     'TenthPhase_SafetyPlan.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#F9F8F6' },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
      // Lazy-load the heavy PDF library only when actually exporting
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf().set(opt).from(element).save();
    } finally {
      // Возвращаем тему обратно
      if (currentTheme) document.documentElement.setAttribute('data-theme', currentTheme);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col font-sans overflow-x-hidden"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* GLASSMORPHISM 3.0 - LAYER 1: Breathing Atmospheric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(-5%, 10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full "
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', opacity: 0.15}}
        />
        <motion.div
          animate={{
            transform: ['translate(0%, 0%) scale(1)', 'translate(5%, -10%) scale(1.1)', 'translate(0%, 0%) scale(1)'],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full "
          style={{ background: 'radial-gradient(circle, var(--ink) 0%, transparent 70%)', opacity: 0.05}}
        />
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="fixed top-6 left-6 z-50 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-xl"
        style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)', color: 'var(--ink2)' }}
      >
        <Home size={16} />
        <span>Домой</span>
      </button>

      <div className="flex-1 w-full px-6 pt-24 pb-24 relative z-10 flex justify-center object-center sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          {/* Контейнер, который пойдет в PDF */}
          <div 
            ref={printRef}
            className="rounded-[32px] p-8 md:p-12 space-y-12 relative overflow-hidden backdrop-blur-2xl"
            style={{ 
              background: 'var(--glass-2)', 
              border: '1px solid var(--glass-border-2)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield size={160} style={{ color: 'var(--ink)' }} />
            </div>

            <div className="relative z-10 space-y-4">
              <div
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[9px] font-mono border mb-2 font-bold uppercase tracking-[0.2em]"
                style={{ background: 'var(--glass-1)', color: 'var(--ink)', borderColor: 'var(--glass-border)' }}
              >
                <Shield size={12} />
                <span>Финальный Артефакт</span>
              </div>
              <h1 className="text-5xl font-serif italic tracking-tight" style={{ color: 'var(--ink)' }}>План Безопасности</h1>
              <p className="leading-relaxed md:pr-16 text-sm" style={{ color: 'var(--ink2)' }}>
                Сгенерировано по итогам прохождения цикла "Tenth Phase". Используйте этот документ как спасательный алгоритм при возникновении откатов.
              </p>
            </div>

            <div className="space-y-8 relative z-10">
              {/* Блоки с контентом */}
              <section className="space-y-4">
                <div className="flex items-center space-x-3" style={{ color: 'var(--ink)' }}>
                  <BookOpen size={20} style={{ color: 'var(--ink3)' }} />
                  <h3 className="text-xl font-serif italic">Ваш базовый якорь</h3>
                </div>
                <div className="p-6 rounded-[20px]" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--ink3)' }}>Начальное намерение (Фаза 0)</p>
                  <p className="text-lg font-serif leading-relaxed italic" style={{ color: 'var(--ink)' }}>«{intent}»</p>
                  <div className="h-px my-6" style={{ background: 'var(--glass-1)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--ink3)' }}>Дар вашей тени (Фаза 4)</p>
                  <p className="text-lg font-serif leading-relaxed italic" style={{ color: 'var(--ink)' }}>«{shadowGift}»</p>
                </div>
              </section>
              
              <section className="space-y-4">
                <div className="flex items-center space-x-3" style={{ color: 'var(--ink)' }}>
                  <AlertCircle size={20} style={{ color: 'var(--ink3)' }} />
                  <h3 className="text-xl font-serif italic">Алгоритм перехвата</h3>
                </div>
                <div className="p-6 rounded-[20px]" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)' }}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--ink3)' }}>Триггер: Знакомый паттерн (Фаза 1)</p>
                  <p className="text-lg line-through" style={{ color: 'var(--ink2)', textDecorationColor: 'var(--ink3)' }}>«{pattern}»</p>
                  <div className="h-px my-6" style={{ background: 'var(--glass-1)' }} />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold mb-3" style={{ color: 'var(--ink)' }}>Реакция: Ваш осознанный выбор (Фаза 5)</p>
                  <p className="text-xl font-serif italic tracking-tight" style={{ color: 'var(--ink)' }}>«{newAction}»</p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center space-x-3" style={{ color: 'var(--ink)' }}>
                  <Phone size={20} style={{ color: 'var(--ink3)' }} />
                  <h3 className="text-xl font-serif italic">Экология процесса</h3>
                </div>
                <div className="p-6 rounded-[20px] text-[13px] leading-relaxed" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)', color: 'var(--ink2)' }}>
                  Помните, что откаты — естественная часть процесса интеграции. Если напряжение становится невыносимым, обратитесь к специалисту. Вы не обязаны проходить уязвимые этапы в одиночку.
                </div>
              </section>

              {/* AI Insight Section */}
              <section className="space-y-4 mt-8">
                <div className="flex items-center space-x-3" style={{ color: 'var(--ink)' }}>
                  <BrainCircuit size={20} style={{ color: 'var(--ink3)' }} />
                  <h3 className="text-xl font-serif italic">Синтез Смыслов</h3>
                </div>
                {!insight ? (
                  <button 
                    onClick={fetchInsight}
                    disabled={loadingInsight}
                    className="w-full relative overflow-hidden group p-6 rounded-[20px] text-left transition-all active:scale-[0.98]"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)' }}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)', color: '#fff' }}>
                        {loadingInsight ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--ink)' }}>Глубокий анализ AI</p>
                        <p className="text-sm" style={{ color: 'var(--ink2)' }}>Сгенерировать персональный инсайт на основе ваших ответов с помощью модели высокой сложности (ThinkingLevel HIGH).</p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 rounded-[20px] text-[14px] leading-relaxed relative overflow-hidden" 
                      style={{ background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--ink)' }}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <BrainCircuit size={100} />
                      </div>
                      <p className="relative z-10">{insight}</p>
                    </motion.div>
                  </AnimatePresence>
                )}
              </section>
            </div>
          </div>

          {/* Кнопка скачивания ВНЕ блока printRef, чтобы она не попадала в PDF */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 pb-12 w-full max-w-[340px] mx-auto">
            <button
              onClick={handleDownloadPDF}
              className={`w-full py-5 rounded-[16px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all relative overflow-hidden group`}
              style={{ 
                background: isPremium ? 'var(--accent)' : 'linear-gradient(135deg, #8E6F3E, #C4A35A)', 
                color: '#fff', 
                boxShadow: isPremium
                  ? '0 12px 30px -10px var(--accent), inset 0 1px 2px rgba(255,255,255,0.4)'
                  : '0 12px 30px -10px rgba(142,111,62,0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
                border: 'none'
              }}
            >
              {!isPremium && <Crown size={16} className="relative z-10" />}
              <span className="text-[12px] font-bold uppercase tracking-[0.15em] relative z-10">
                {isPremium ? 'Сохранить PDF' : 'PDF — Premium'}
              </span>
              <Download size={18} className="relative z-10" />
              <div className={`absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out`} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
