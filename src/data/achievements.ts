export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  category: 'journey' | 'depth' | 'practice' | 'collection';
  condition: string; // human-readable
  premium: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Journey milestones
  {
    id: 'first_card',
    title: 'Первое отражение',
    description: 'Вы сохранили первую карту в колоду. Начало картографии.',
    icon: 'eye',
    category: 'journey',
    condition: 'Сохранить первую карту',
    premium: false,
  },
  {
    id: 'first_cycle',
    title: 'Полный оборот',
    description: 'Завершён первый цикл. Вы прошли путь от картографии до плана безопасности.',
    icon: 'refresh-cw',
    category: 'journey',
    condition: 'Завершить первый цикл',
    premium: false,
  },
  {
    id: 'named_pattern',
    title: 'Имя паттерна',
    description: 'Вы впервые назвали свой повторяющийся сценарий. Осознание — первый шаг.',
    icon: 'pen-tool',
    category: 'depth',
    condition: 'Заполнить поле "паттерн" в Фазе 1',
    premium: false,
  },
  {
    id: 'met_shadow',
    title: 'Встреча с тенью',
    description: 'Вы прошли фазу Антипод. Встретились с тем, что обычно подавляется.',
    icon: 'moon',
    category: 'depth',
    condition: 'Завершить фазу Антипод',
    premium: false,
  },
  {
    id: 'new_choice',
    title: 'Новый выбор',
    description: 'Вы зафиксировали конкретное действие, которое ломает старый механизм.',
    icon: 'zap',
    category: 'depth',
    condition: 'Заполнить действие в Фазе 5',
    premium: true,
  },
  {
    id: 'letter_to_self',
    title: 'Письмо себе',
    description: 'Вы написали послание себе из Фазы 0. Мост между началом и концом.',
    icon: 'mail',
    category: 'depth',
    condition: 'Заполнить оба поля в Фазе 7 (Перенос)',
    premium: true,
  },
  {
    id: 'safety_plan',
    title: 'Спасательный алгоритм',
    description: 'Сгенерирован ваш первый план безопасности. Теперь у вас есть якорь.',
    icon: 'shield',
    category: 'journey',
    condition: 'Дойти до Safety Plan',
    premium: false,
  },

  // Practice streaks
  {
    id: 'streak_3',
    title: '3 дня подряд',
    description: 'Три дня практики подряд. Ритуал начинает формироваться.',
    icon: 'flame',
    category: 'practice',
    condition: '3 дня активности подряд',
    premium: true,
  },
  {
    id: 'streak_7',
    title: 'Неделя присутствия',
    description: 'Семь дней подряд вы возвращались к работе. Это уже привычка.',
    icon: 'flame',
    category: 'practice',
    condition: '7 дней активности подряд',
    premium: true,
  },
  {
    id: 'streak_30',
    title: 'Месяц практики',
    description: '30 дней. Нейропластичность на вашей стороне.',
    icon: 'flame',
    category: 'practice',
    condition: '30 дней активности подряд',
    premium: true,
  },

  // Collection
  {
    id: 'collector_10',
    title: '10 отражений',
    description: '10 карт в вашей колоде. Начинает проявляться рисунок.',
    icon: 'layers',
    category: 'collection',
    condition: 'Собрать 10 карт',
    premium: false,
  },
  {
    id: 'collector_30',
    title: '30 отражений',
    description: '30 карт. Ваша внутренняя карта становится подробной.',
    icon: 'layers',
    category: 'collection',
    condition: 'Собрать 30 карт',
    premium: true,
  },
  {
    id: 'high_resonance',
    title: 'Глубокий резонанс',
    description: 'Карта с интенсивностью выше 90%. Что-то задело по-настоящему.',
    icon: 'heart',
    category: 'depth',
    condition: 'Сохранить карту с intensity > 90%',
    premium: false,
  },
  {
    id: 'full_deep',
    title: 'Глубокий цикл',
    description: 'Завершён полный цикл в режиме "Глубокая работа" — все 9 фаз.',
    icon: 'compass',
    category: 'journey',
    condition: 'Завершить режим 3 (Глубокая работа)',
    premium: true,
  },
  {
    id: 'three_cycles',
    title: 'Три витка',
    description: 'Три завершённых цикла. Вы видите, как меняются ваши ответы.',
    icon: 'repeat',
    category: 'journey',
    condition: 'Завершить 3 цикла',
    premium: true,
  },
];

export const ACHIEVEMENT_CATEGORIES = {
  journey: { title: 'Путешествие', color: '#3B7A57' },
  depth: { title: 'Глубина', color: '#6B5B95' },
  practice: { title: 'Практика', color: '#8E6F3E' },
  collection: { title: 'Коллекция', color: '#2980B9' },
} as const;
