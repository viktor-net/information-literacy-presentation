export interface SlideMeta {
  id: string
  /** Надзаголовок: номер раздела или служебная метка */
  kicker?: string
  title: string
  /** Заметки докладчика */
  notes?: string
}

export interface CardItem {
  /** Имя автора / короткая метка */
  label: string
  title: string
  text: string
}

export interface TimelineItem {
  title: string
  text: string
  /** Текущая (пятая) революция */
  active?: boolean
}

export interface CompareSide {
  badge: string
  title: string
  items: string[]
}

export type Slide =
  | (SlideMeta & {
      layout: 'title'
      subtitle: string
      university?: string
      course: string
      author: string
      supervisorTitle: string
      supervisor: string
      /** Подпись слева внизу, если не совпадает с названием слайда */
      foot?: string
    })
  | (SlideMeta & { layout: 'agenda'; items: string[] })
  | (SlideMeta & { layout: 'section'; number: string; hint: string })
  | (SlideMeta & { layout: 'bullets'; lead?: string; items: string[] })
  | (SlideMeta & { layout: 'timeline'; items: TimelineItem[] })
  | (SlideMeta & { layout: 'cards'; columns: 2 | 3; items: CardItem[] })
  | (SlideMeta & { layout: 'split'; quote: { text: string; author: string }; items: string[] })
  | (SlideMeta & { layout: 'quadrants'; items: CardItem[] })
  | (SlideMeta & { layout: 'compare'; left: CompareSide; right: CompareSide; stats: { value: string; label: string }[] })
  | (SlideMeta & { layout: 'conclusion'; items: string[]; closing: string })

/** Поддерживается простая разметка **жирный** внутри текста */
export function renderInline(text: string): { bold: boolean; value: string }[] {
  return text.split('**').map((value, i) => ({ bold: i % 2 === 1, value }))
}
