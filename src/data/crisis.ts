export interface CrisisContact {
  name: string;
  phone: string;
  href: string;
  note: string;
  highlight?: boolean;
}

// ⚠️ ВРЕМЕННЫЕ КОНТАКТЫ (Украина) — плейсхолдеры для разработки.
// Перед релизом заменить на проверенные актуальные номера и сверить режим работы.
export const CRISIS_COUNTRY = 'Украина';

export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    name: 'Экстренные службы',
    phone: '112',
    href: 'tel:112',
    note: 'Полиция, скорая, спасатели — круглосуточно',
    highlight: true,
  },
  {
    name: 'Линия эмоциональной поддержки',
    phone: '7333',
    href: 'tel:7333',
    note: 'Бесплатно, анонимно, круглосуточно',
  },
  {
    name: 'Горячая линия предотвращения суицидов',
    phone: '0 800 100 200',
    href: 'tel:0800100200',
    note: 'Ежедневно, звонок бесплатный',
  },
  {
    name: 'Психологическая кризисная помощь',
    phone: '0 800 200 300',
    href: 'tel:0800200300',
    note: 'Поддержка в трудной ситуации',
  },
];
