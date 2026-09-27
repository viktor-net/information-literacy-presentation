import type { ReactNode } from 'react'
import type { Slide } from './types'
import { renderInline } from './types'
import { useDeckNav } from '../nav'

function Inline({ text }: { text: string }): ReactNode {
  return (
    <>
      {renderInline(text).map((part, i) =>
        part.bold ? <strong key={i}>{part.value}</strong> : <span key={i}>{part.value}</span>,
      )}
    </>
  )
}

function SlideHead({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) {
  return (
    <header className="s-head">
      {kicker && <div className="s-kicker">{kicker}</div>}
      <h2 className="s-title">{title}</h2>
      {lead && (
        <p className="s-lead">
          <Inline text={lead} />
        </p>
      )}
    </header>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="s-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="s-list__dot" aria-hidden="true" />
          <span>
            <Inline text={item} />
          </span>
        </li>
      ))}
    </ul>
  )
}

function Body({ children }: { children: ReactNode }) {
  return <div className="s-body">{children}</div>
}

export function SlideView({ slide }: { slide: Slide }) {
  const nav = useDeckNav()

  switch (slide.layout) {
    case 'title':
      return (
        <div className="s s--title">
          {slide.kicker && <div className="s-title__kicker">{slide.kicker}</div>}
          <h1 className="s-title__h1">
            {slide.title.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>
          <p className="s-title__sub">{slide.subtitle}</p>

          <div className="s-title__meta">
            {slide.university && (
              <div className="s-title__entry s-title__entry--university">
                <span className="s-title__key">ВУЗ</span>
                <span className="s-title__line">{slide.university}</span>
              </div>
            )}
            <div className="s-title__entry">
              <span className="s-title__key">Дисциплина</span>
              <span className="s-title__line">{slide.course}</span>
            </div>
          </div>

          <div className="s-title__people">
            <div className="s-title__entry s-title__entry--author">
              <span className="s-title__key">Выполнил аспирант</span>
              <span className="s-title__line">{slide.author}</span>
            </div>
            <div className="s-title__entry s-title__entry--sup">
              <span className="s-title__key">{slide.supervisorTitle}</span>
              <span className="s-title__line">{slide.supervisor}</span>
            </div>
          </div>
        </div>
      )

    case 'agenda':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <ol className="s-agenda">
              {slide.items.map((item, i) => {
                // Пункт плана ведёт на слайд-заголовок блока. В сетке
                // превью контекста нет, поэтому там это обычный текст.
                const target = nav?.planTargets[i]
                const inner = (
                  <>
                    <span className="s-agenda__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="s-agenda__label">{item}</span>
                    {target !== undefined && (
                      <span className="s-agenda__go" aria-hidden="true">
                        →
                      </span>
                    )}
                  </>
                )
                return (
                  <li
                    key={i}
                    className={target === undefined ? 's-agenda__item' : 's-agenda__item is-link'}
                  >
                    {target === undefined ? (
                      inner
                    ) : (
                      <button
                        type="button"
                        className="s-agenda__btn"
                        onClick={() => nav?.go(target)}
                        onDoubleClick={(e) => e.stopPropagation()}
                        title={`Перейти: ${item}`}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
          </Body>
        </div>
      )

    case 'section':
      return (
        <div className="s s--section">
          <div className="s-section__num">{slide.number}</div>
          {slide.kicker && <div className="s-section__kicker">{slide.kicker}</div>}
          <h2 className="s-section__title">{slide.title}</h2>
          <p className="s-section__hint">{slide.hint}</p>
        </div>
      )

    case 'bullets':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} lead={slide.lead} />
          <Body>
            <Bullets items={slide.items} />
          </Body>
        </div>
      )

    case 'timeline':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <div className="s-timeline">
              <div className="s-timeline__line" aria-hidden="true" />
              {slide.items.map((item, i) => (
                <div
                  key={i}
                  className={`s-tl-item${item.active ? ' is-active' : ''}`}
                >
                  <div className="s-tl-item__node" aria-hidden="true">
                    {String(i + 1)}
                  </div>
                  <div className="s-tl-item__title">{item.title}</div>
                  <div className="s-tl-item__text">{item.text}</div>
                </div>
              ))}
            </div>
          </Body>
        </div>
      )

    case 'cards':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <div className={`s-cards s-cards--${slide.columns}`}>
              {slide.items.map((item, i) => (
                <div key={i} className="s-card">
                  <div className="s-card__label">{item.label}</div>
                  <div className="s-card__title">{item.title}</div>
                  <div className="s-card__text">{item.text}</div>
                </div>
              ))}
            </div>
          </Body>
        </div>
      )

    case 'quadrants':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <div className="s-cards s-cards--2">
              {slide.items.map((item, i) => (
                <div key={i} className="s-card s-card--quad">
                  <div className="s-card__num">{item.label}</div>
                  <div className="s-card__title">{item.title}</div>
                  <div className="s-card__text">{item.text}</div>
                </div>
              ))}
            </div>
          </Body>
        </div>
      )

    case 'split':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <div className="s-split">
              <blockquote className="s-quote">
                <div className="s-quote__mark" aria-hidden="true">
                  &laquo;
                </div>
                <p className="s-quote__text">{slide.quote.text}</p>
                <cite className="s-quote__author">{slide.quote.author}</cite>
              </blockquote>
              <div className="s-split__list">
                <div className="s-split__label">Аспекты проявления</div>
                <Bullets items={slide.items} />
              </div>
            </div>
          </Body>
        </div>
      )

    case 'compare':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <div className="s-compare">
              {[slide.left, slide.right].map((side, si) => (
                <div key={si} className={`s-side s-side--${si === 0 ? 'old' : 'new'}`}>
                  <div className="s-side__badge">{side.badge}</div>
                  <div className="s-side__title">{side.title}</div>
                  <ul className="s-side__list">
                    {side.items.map((it, i) => (
                      <li key={i}>
                        <Inline text={it} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="s-stats">
              {slide.stats.map((s, i) => (
                <div key={i} className="s-stat">
                  <div className="s-stat__value">{s.value}</div>
                  <div className="s-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </Body>
        </div>
      )

    case 'conclusion':
      return (
        <div className="s">
          <SlideHead kicker={slide.kicker} title={slide.title} />
          <Body>
            <Bullets items={slide.items} />
            <div className="s-closing">
              <span className="s-closing__quote" aria-hidden="true">
                &raquo;
              </span>
              <p>{slide.closing}</p>
            </div>
          </Body>
        </div>
      )
  }
}
