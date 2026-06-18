import { PhaseConfig, ContentMatrix, ModalityType, DepthLevel } from '../types';

export interface PathConfig {
  id: string;
  title: string;
  description: string;
  phases: number[];
  subPaths?: PathConfig[];
}

export const PATHS: PathConfig[] = [
  {
    id: 'solo',
    title: 'Режим 1 — Самостоятельное использование',
    description: 'Без терапевта. Минимальный рабочий сет, 15–20 минут. Фокус на стабилизации.',
    phases: [0, 4, 5, 7]
  },
  {
    id: 'therapeutic',
    title: 'Режим 2 — Терапевтический',
    description: 'В сессии, 50 минут. Ветка выбирается под клиента в зависимости от подхода.',
    phases: [],
    subPaths: [
      {
        id: 'cbt',
        title: 'Когнитивный / поведенческий (КПТ)',
        description: 'Понять, как это работает сейчас, найти решение и перенести навык в жизнь (поведенческий эксперимент или домашнее задание).',
        phases: [0, 1, 5, 7]
      },
      {
        id: 'schema',
        title: 'Схема / привязанность',
        description: 'Увидеть истоки, прожить их соматически, найти новый поддерживающий образ (Антипод) и ассимилировать этот опыт (Интеграция), чтобы закрепить новое чувство безопасности в кабинете.',
        phases: [0, 2, 3, 4, 6]
      }
    ]
  },
  {
    id: 'full',
    title: 'Режим 3 — Глубокая работа',
    description: 'Полный цикл. Фундаментальная проработка одного паттерна.',
    phases: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 'crisis',
    title: 'Режим 4 — Кризисный',
    description: 'Острая тревога, дистресс. Фокус на стабилизации без глубоких раскопок.',
    phases: [4, 3, 5, 8]
  }
];

const generateMatrix = (phase: string, mode: 'Solo' | 'Group'): ContentMatrix => {
  const g = (depth: string, mod: string) => 
    mode === 'Solo' 
      ? `[${phase} / ${depth} / ${mod}] Индивидуальная практика. Сфокусируйтесь на своих внутренних ощущениях. Выполняйте инструкции в своем темпе.`
      : `[${phase} / ${depth} / ${mod}] Групповая адаптация. Обсудите этот аспект с партнером или группой. Обратите внимание на резонанс в поле.`;
  
  return {
    cognitive: {
      visual: g('Когнитивный', 'Визуал'),
      audio: g('Когнитивный', 'Аудио'),
      text: g('Когнитивный', 'Текст'),
      metaphor: g('Когнитивный', 'Метафора'),
    },
    emotional: {
      visual: g('Эмоциональный', 'Визуал'),
      audio: g('Эмоциональный', 'Аудио'),
      text: g('Эмоциональный', 'Текст'),
      metaphor: g('Эмоциональный', 'Метафора'),
    },
    somatic: {
      visual: g('Соматический', 'Визуал'),
      audio: g('Соматический', 'Аудио'),
      text: g('Соматический', 'Текст'),
      metaphor: g('Соматический', 'Метафора'),
    }
  };
};

export const PHASES: PhaseConfig[] = [
  {
    id: 0,
    title: 'ФАЗА 0',
    subtitle: 'Картография',
    description: 'Инициализация, сбор базовых данных, оценка ландшафта.',
    readinessMarkers: [
      { id: '0_1', text: 'Я готов выделить 30 минут в тишине.' },
      { id: '0_2', text: 'Я осознаю, что этот путь потребует предельной честности.' }
    ],
    contraindications: [
      { id: '0_c1', text: 'У меня диагностировано острое психическое расстройство.' },
      { id: '0_c2', text: 'Я нахожусь под воздействием психоактивных веществ.' }
    ],
    content: {
      solo: generateMatrix('Картография', 'Solo'),
      group: generateMatrix('Картография', 'Group')
    },
    measurement: {
      title: 'Сбор профиля',
      description: 'Эти данные станут базой для вашей дальнейшей работы. Мы сверимся с ними в следующих фазах.',
      questions: [
        { id: 'intent', label: 'Сформулируйте ваше ключевое намерение на этот процесс', type: 'text' },
        { id: 'energy', label: 'Оцените ваш текущий уровень энергии (1-10)', type: 'scale' }
      ]
    }
  },
  {
    id: 1,
    title: 'ФАЗА 1',
    subtitle: 'Механизм',
    description: 'Анализ паттернов и повторяющихся жизненных сценариев.',
    readinessMarkers: [{ id: '1_1', text: 'Я готов исследовать свои автоматические реакции без осуждения.' }],
    contraindications: [{ id: '1_c1', text: 'У меня нет ресурса на аналитическую работу сегодня.' }],
    content: { solo: generateMatrix('Механизм', 'Solo'), group: generateMatrix('Механизм', 'Group') },
    measurement: {
      title: 'Деконструкция',
      description: 'Опишите ваш центральный паттерн, как будто это шестеренка в механизме.',
      questions: [{ id: 'pattern', label: 'Какой паттерн повторяется чаще всего?', type: 'text' }]
    }
  },
  {
    id: 2,
    title: 'ФАЗА 2',
    subtitle: 'Корни',
    description: 'Поиск первопричин и фундаментальных ограничивающих убеждений.',
    readinessMarkers: [{ id: '2_1', text: 'Я чувствую устойчивость для погружения в опыт прошлого.' }],
    contraindications: [{ id: '2_c1', text: 'Я переживаю возвращение сильной травматической памяти (флешбеки, диссоциация).' }],
    content: { solo: generateMatrix('Корни', 'Solo'), group: generateMatrix('Корни', 'Group') },
    measurement: {
      title: 'Исток',
      description: 'Зафиксируйте найденное убеждение, чтобы в дальнейшем трансформировать его.',
      questions: [{ id: 'root', label: 'Ключевое ограничивающее убеждение', type: 'text' }]
    }
  },
  {
    id: 3,
    title: 'ФАЗА 3',
    subtitle: 'Тело',
    description: 'Соматическая работа и освобождение заблокированной эмоциональной энергии.',
    readinessMarkers: [{ id: '3_1', text: 'Я нахожусь в безопасном пространстве, где могу свободно звучать и двигаться.' }],
    contraindications: [{ id: '3_c1', text: 'Острые физические боли или строгие медицинские запреты на движение.' }],
    content: { solo: generateMatrix('Тело', 'Solo'), group: generateMatrix('Тело', 'Group') },
    measurement: {
      title: 'Соматический отклик',
      description: 'Как тело отреагировало на практику освобождения?',
      questions: [{ id: 'body_state', label: 'Изменение телесного состояния (1-10)', type: 'scale' }]
    }
  },
  {
    id: 4,
    title: 'ФАЗА 4',
    subtitle: 'Антипод',
    description: 'Исследование теневых аспектов личности и подавленных качеств.',
    readinessMarkers: [{ id: '4_1', text: 'Я готов встретиться с тем, что обычно осуждаю в других.' }],
    contraindications: [{ id: '4_c1', text: 'Я склонен к жесткому самобичеванию прямо сейчас.' }],
    content: { solo: generateMatrix('Антипод', 'Solo'), group: generateMatrix('Антипод', 'Group') },
    measurement: {
      title: 'Интеграция тени',
      description: 'У каждой тени есть свой дар. Что принес вам ваш Антипод?',
      questions: [{ id: 'shadow', label: 'Каков дар (ресурс) вашего антипода?', type: 'text' }]
    }
  },
  {
    id: 5,
    title: 'ФАЗА 5',
    subtitle: 'Интервенция',
    description: 'Активное вмешательство и переписывание старого сценария.',
    readinessMarkers: [{ id: '5_1', text: 'У меня есть подлинное намерение совершить реальное изменение.' }],
    contraindications: [{ id: '5_c1', text: 'Ощущение полной беспомощности (при наличии — требуется откат к фазе 0).' }],
    content: { solo: generateMatrix('Интервенция', 'Solo'), group: generateMatrix('Интервенция', 'Group') },
    measurement: {
      title: 'Новый выбор',
      description: 'Зафиксируйте ваше новое решение, которое ломает старый механизм.',
      questions: [{ id: 'action', label: 'Какое новое действие вы совершите в ближайшие 24 часа?', type: 'text' }]
    }
  },
  {
    id: 6,
    title: 'ФАЗА 6',
    subtitle: 'Интеграция',
    description: 'Усвоение нового опыта и встраивание его в ткань повседневности.',
    readinessMarkers: [{ id: '6_1', text: 'Я дал себе достаточно времени на отдых после активной интервенции.' }],
    contraindications: [{ id: '6_c1', text: 'Ощущение сильной разбалансировки (заземлитесь перед началом).' }],
    content: { solo: generateMatrix('Интеграция', 'Solo'), group: generateMatrix('Интеграция', 'Group') },
    measurement: {
      title: 'Кристаллизация',
      description: 'Как этот опыт начинает менять вашу обычную жизнь?',
      questions: [{ id: 'integration', label: 'Оцените степень интеграции опыта (1-10)', type: 'scale' }]
    }
  },
  {
    id: 7,
    title: 'ФАЗА 7',
    subtitle: 'Перенос',
    description: 'Работа с проекциями, сопротивлением и экологией процесса трансформации.',
    readinessMarkers: [{ id: '7_1', text: 'Я готов честно рассмотреть свое сопротивление методу, приложению или себе.' }],
    contraindications: [],
    content: { solo: generateMatrix('Перенос', 'Solo'), group: generateMatrix('Перенос', 'Group') },
    measurement: {
      title: 'Легализация сопротивления',
      description: 'Специальная форма. Легализация скрытого напряжения — ключ к освобождению энергии.',
      questions: [
        { id: 'resistance', label: 'Что вас больше всего злило или вызывало сопротивление в процессе прохождения?', type: 'text' },
        { id: 'feedback', label: 'Что бы вы сказали себе из момента Фазы 0 прямо сейчас?', type: 'text' }
      ]
    }
  },
  {
    id: 8,
    title: 'ФАЗА 8',
    subtitle: 'Рецидив-план',
    description: 'Генерация спасательного алгоритма и экологичное завершение цикла.',
    readinessMarkers: [{ id: '8_1', text: 'Я прошел через все этапы и готов зафиксировать результаты.' }],
    contraindications: [],
    content: { solo: generateMatrix('Рецидив-план', 'Solo'), group: generateMatrix('Рецидив-план', 'Group') },
    measurement: {
      title: 'План безопасности',
      description: 'Формирование финального артефакта.',
      questions: [] // Особая логика финального экрана
    }
  }
];
