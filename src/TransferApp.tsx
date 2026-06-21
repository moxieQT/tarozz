import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, BookOpen, ChevronRight, X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './store';

type NodeId = 'relations' | 'work' | 'body' | 'rest' | 'finance' | 'meaning';

interface NodeData {
  id: NodeId;
  title: string;
  was: string;
  changed: string;
  potential: string;
  description: string;
}

const INITIAL_NODES: Record<NodeId, NodeData> = {
  relations: { id: 'relations', title: 'Отношения', was: '', changed: '', potential: '', description: 'Как паттерн влиял на контакт с близкими' },
  work: { id: 'work', title: 'Работа', was: '', changed: '', potential: '', description: 'Как тревога проявлялась в делах и контроле' },
  body: { id: 'body', title: 'Тело', was: '', changed: '', potential: '', description: 'Отношения с телом вне самого паттерна' },
  rest: { id: 'rest', title: 'Отдых', was: '', changed: '', potential: '', description: 'Способность расслабляться без "продуктивности"' },
  finance: { id: 'finance', title: 'Финансы', was: '', changed: '', potential: '', description: 'Траты, связанные с тревогой и гиперконтролем' },
  meaning: { id: 'meaning', title: 'Смысл', was: '', changed: '', potential: '', description: 'Отношение к неопределенности и времени' },
};

const radius = 140;
const center = { x: 200, y: 200 };

export function TransferApp() {
  const { completePhase, currentPhaseIndex, activePathPhases } = useAppStore();
  const currentPhaseId = activePathPhases[currentPhaseIndex] || 0;
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Record<NodeId, NodeData>>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
  const [step, setStep] = useState<'intro' | 'map'>('intro');

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  const handleUpdateNode = (id: NodeId, field: keyof NodeData, value: string) => {
    setNodes(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const getCoordinates = (index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle)
    };
  };

  const nodeEntries = Object.values(nodes) as NodeData[];

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

      <div className="flex-1 w-full relative z-10 flex flex-col max-w-2xl mx-auto" style={{ color: 'var(--ink)' }}>

        <AnimatePresence mode="wait">
          {step === 'intro' ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center items-center p-8 text-center"
            >
              <Compass className="w-20 h-20 mb-8" strokeWidth={1} style={{ color: 'var(--ink3)' }} />
              <div className="flex items-center justify-center gap-3 mb-2 opacity-70">
                <span className="text-[10px] uppercase tracking-[0.3em] font-mono font-bold" style={{ color: 'var(--ink)' }}>
                  Фаза 8
                </span>
              </div>
              <h1 className="text-5xl font-serif italic mb-6 tracking-tight leading-[1.05]" style={{ color: 'var(--ink)' }}>Перенос</h1>
              <p className="mb-12 leading-relaxed max-w-sm text-sm" style={{ color: 'var(--ink2)' }}>
                Терапевтические изменения спонтанно распространяются на другие области жизни.
                Мы не создаем эти связи, мы лишь свидетельствуем их появление на карте.
              </p>

              <button
                onClick={() => setStep('map')}
                className={`px-10 py-5 rounded-[20px] flex items-center justify-center gap-4 transition-all relative overflow-hidden group active:scale-[0.98]`}
                style={{ 
                  background: 'var(--accent)', 
                  color: '#fff', 
                  boxShadow: '0 12px 30px -10px var(--accent), inset 0 1px 2px rgba(255,255,255,0.4)',
                }}
              >
                <span className="text-[13px] font-bold uppercase tracking-[0.15em] relative z-10">Развернуть карту</span>
                <ChevronRight className="w-5 h-5 relative z-10" />
                <div className={`absolute top-0 left-[-100%] w-[50%] h-full mix-blend-overlay bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out`} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col relative"
            >
              <header
                className="p-6 flex justify-between items-center backdrop-blur-2xl z-10 sticky top-0"
                style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-1)' }}
              >
                <div>
                  <h2 className="text-2xl font-serif italic" style={{ color: 'var(--ink)' }}>Карта Связей</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] mt-1 font-mono" style={{ color: 'var(--ink3)' }}>Топография изменений</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      completePhase(currentPhaseId, {});
                      if (currentPhaseIndex >= activePathPhases.length - 1) {
                        navigate('/safety-plan');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                    className="px-5 py-2.5 rounded-[12px] text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 group active:scale-95"
                    style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 4px 12px -4px var(--accent), inset 0 1px 1px rgba(255,255,255,0.3)' }}
                  >
                    <span>Завершить</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto pb-32">
                <div className="p-6">
                  {/* SVG Map */}
                  <div className="relative w-full max-w-[400px] aspect-square mx-auto my-8">
                    <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
                      <circle cx="200" cy="200" r="180" fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 6" opacity="0.1" />
                      <circle cx="200" cy="200" r="100" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.05" />

                      {nodeEntries.map((node, i) => {
                        const coords = getCoordinates(i, nodeEntries.length);
                        const isActive = node.changed.length > 0;
                        return (
                          <line
                            key={`line-${node.id}`}
                            x1="200" y1="200"
                            x2={coords.x} y2={coords.y}
                            stroke={isActive ? 'var(--ink)' : 'var(--ink)'}
                            strokeWidth={isActive ? '2' : '1'}
                            strokeDasharray={isActive ? 'none' : '2 4'}
                            opacity={isActive ? 0.3 : 0.1}
                            className="transition-all duration-700"
                          />
                        );
                      })}

                      {/* Central Node */}
                      <g className="cursor-pointer group [transform-origin:200px_200px] hover:scale-[1.15] transition-transform duration-300 ease-out">
                        <circle cx="200" cy="200" r="50" fill="var(--accent)" />
                        <circle cx="200" cy="200" r="44" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
                        <text x="200" y="196" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold" letterSpacing="1">ПАТТЕРН</text>
                        <text x="200" y="212" textAnchor="middle" fill="#fff" fontSize="9" opacity="0.7">разрешен</text>
                      </g>

                      {/* Peripheral Nodes */}
                      {nodeEntries.map((node, i) => {
                        const coords = getCoordinates(i, nodeEntries.length);
                        const isActive = node.changed.length > 0;
                        const isSelected = selectedNodeId === node.id;

                        return (
                          <g
                            key={`node-${node.id}`}
                            transform={`translate(${coords.x}, ${coords.y})`}
                            onClick={() => setSelectedNodeId(node.id)}
                            className="cursor-pointer group"
                          >
                            <circle
                              r={isSelected ? '32' : '28'}
                              fill={isActive ? 'var(--glass-2)' : 'var(--glass-1)'}
                              stroke={isActive ? 'var(--accent)' : 'var(--glass-border)'}
                              strokeWidth={isSelected ? '2' : '1'}
                              className="transition-all duration-300 backdrop-blur-md shadow-inner"
                            />
                            {isActive && (
                              <circle r="20" fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.3" />
                            )}
                            <foreignObject x="-36" y="-12" width="72" height="24" className="pointer-events-none">
                              <div className="w-full h-full flex items-center justify-center text-center">
                                <span
                                  className="text-[9px] uppercase tracking-wider font-bold"
                                  style={{ color: isActive ? 'var(--ink)' : 'var(--ink3)' }}
                                >
                                  {node.title}
                                </span>
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Level Questions */}
                  <div className="mt-12 space-y-6">
                    <h3 className="font-serif italic text-2xl mb-6 pb-4" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--glass-border)' }}>Уровни глубины</h3>

                    {[
                      { label: 'Поведенческий', text: 'Что изменилось в других областях жизни? Что заметили окружающие — не вы, а они?' },
                      { label: 'Реляционный', text: 'Кто первым заметил изменения — вы или партнеры/коллеги? Что именно они описывали?' },
                      { label: 'Системный', text: 'Посмотрите на всю карту. Что объединяет все эти изменения? Есть ли один общий сдвиг за разными проявлениями?' },
                    ].map(q => (
                      <div key={q.label} className="p-6 rounded-[20px] backdrop-blur-md transition-all" style={{ background: 'var(--glass-1)', border: '1px solid var(--glass-border)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)' }}>
                        <h4 className="text-[11px] uppercase tracking-widest mb-3 font-bold font-mono" style={{ color: 'var(--ink)' }}>{q.label}</h4>
                        <p className="text-[14px] leading-relaxed opacity-80" style={{ color: 'var(--ink)' }}>{q.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Node Modal */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-x-0 bottom-0 top-20 rounded-t-[32px] backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.2)] flex flex-col z-50 overflow-hidden"
              style={{ background: 'var(--glass-2)', borderTop: '1px solid var(--glass-border)', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />
              
              <div className="p-6 flex justify-between items-start relative z-10" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <div className="flex items-center space-x-2 mb-2 opacity-70">
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--ink)' }} />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: 'var(--ink)' }}>Территория</span>
                  </div>
                  <h2 className="text-3xl font-serif italic" style={{ color: 'var(--ink)' }}>{selectedNode.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-3 rounded-full transition-all hover:bg-[rgba(255,255,255,0.1)] backdrop-blur-md"
                  style={{ color: 'var(--ink)', border: '1px solid var(--glass-border)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 w-full mb-8">
                {[
                  { label: '1. Было (Как паттерн проявлялся)', field: 'was' as keyof NodeData, placeholder: selectedNode.description },
                  { label: '2. Изменилось (Что уже другое)', field: 'changed' as keyof NodeData, placeholder: 'Какие изменения вы или другие уже заметили?' },
                  { label: '3. Может измениться (Потенциал)', field: 'potential' as keyof NodeData, placeholder: 'Что еще может сдвинуться в этой сфере?' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-[11px] uppercase tracking-widest mb-3 font-mono" style={{ color: 'var(--ink2)' }}>
                      {label}
                    </label>
                    <textarea
                      value={selectedNode[field] as string}
                      onChange={(e) => handleUpdateNode(selectedNode.id, field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full p-4 rounded-[20px] text-[15px] leading-relaxed transition-all resize-none outline-none backdrop-blur-md"
                      rows={3}
                      style={{
                        background: 'var(--glass-1)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--ink)',
                        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
