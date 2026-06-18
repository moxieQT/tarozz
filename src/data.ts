import { CardType } from './types';

const gradients = [
  'from-slate-800 to-slate-900',
  'from-indigo-900 to-slate-900',
  'from-rose-900 to-slate-900',
  'from-emerald-900 to-slate-900',
  'from-amber-900 to-slate-900',
  'from-sky-900 to-slate-900',
  'from-fuchsia-900 to-slate-900',
  'from-stone-800 to-stone-900',
];

export const INITIAL_CARDS: CardType[] = Array.from({ length: 79 }, (_, i) => {
  if (i === 0) {
    return {
      id: `card-1`,
      title: `Гиперфикс на ХП`,
      description: 'Что если отпустить контроль над своим здоровьем? Насколько интенсивно это желание зафиксировать свое состояние?',
      gradient: gradients[0],
      imageUrl: '/0_cartography/mirror_01.png'
    };
  }
  
  if (i > 0 && i < 10) {
    const mirrorNum = (i + 1).toString().padStart(2, '0');
    return {
      id: `card-${i + 1}`,
      title: `Карта Инсайта ${i + 1}`,
      description: 'Что вы видите в этом отражении? Как этот образ резонирует с вашим текущим состоянием?',
      gradient: gradients[i % gradients.length],
      imageUrl: `/0_cartography/mirror_${mirrorNum}.png`
    };
  }

  return {
    id: `card-${i + 1}`,
    title: `Карта Инсайта ${i + 1}`,
    description: 'Прислушайтесь к своим ощущениям. Насколько эта концепция откликается в вас прямо сейчас?',
    gradient: gradients[i % gradients.length],
  };
});
