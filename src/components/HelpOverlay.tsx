import { BINDINGS, EXTRA_HELP, LAYOUT_NOTE } from '../deck.keys'

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="help" role="dialog" aria-label="Управление" onClick={onClose}>
      <div className="help__panel" onClick={(e) => e.stopPropagation()}>
        <h2 className="help__title">Управление презентацией</h2>
        <p className="help__lead">
          Работает как пульт: в полноэкранном режиме клавиши перехватываются браузером. Также
          работают колесо мыши, свайпы и тап по краям экрана. Полосу вверху можно перетащить
          мышью за кружок — слайд поедет за курсором.
        </p>

        <dl className="help__list">
          {BINDINGS.map((binding, i) => (
            <div key={i} className="help__row">
              <dt>
                {binding.caps.map((cap) => (
                  <kbd key={cap.code}>{cap.key}</kbd>
                ))}
              </dt>
              <dd>{binding.action}</dd>
            </div>
          ))}
          {EXTRA_HELP.map((row, i) => (
            <div key={'x' + i} className="help__row">
              <dt>
                {row.caps.map((c) => (
                  <kbd key={c}>{c}</kbd>
                ))}
              </dt>
              <dd>{row.action}</dd>
            </div>
          ))}
        </dl>

        <p className="help__note">{LAYOUT_NOTE}</p>

        <button type="button" className="help__close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  )
}
