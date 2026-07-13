import { useState, useEffect, useRef } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  placeholder = 'Selecionar',
  title
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div className={`custom-select ${className}`} ref={wrapRef}>
      <button
        type="button"
        className={`custom-select-trigger ${triggerClassName}`}
        onClick={() => setOpen((v) => !v)}
        title={title || selected?.label || ''}
      >
        <span className="custom-select-trigger-label">{selected?.label || placeholder}</span>
        <FiChevronDown size={14} className={`custom-select-chevron${open ? ' open' : ''}`} />
      </button>

      {open && (
        <div className={`custom-select-menu ${menuClassName}`}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`custom-select-option${o.value === value ? ' active' : ''}`}
              title={o.label}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
            >
              <span className="custom-select-option-label">{o.label}</span>
              {o.value === value && <FiCheck size={14} className="custom-select-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
