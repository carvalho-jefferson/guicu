import { useState, forwardRef, useImperativeHandle } from 'react'
import CustomSelect from '../common/CustomSelect'
const levels = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo']

const StepLanguages = forwardRef(function StepLanguages({ data, onChange }, ref) {
  const [form, setForm] = useState({ language: '', level: 'Básico' })
  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const add = () => {
    if (!form.language.trim()) return
    onChange([...data, form])
    setForm({ language: '', level: 'Básico' })
  }
  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => form.language.trim() !== '',
    commit: () => {
      if (form.language.trim()) add()
      return true
    },
    discard: () => setForm({ language: '', level: 'Básico' })
  }))

  return (
    <div className="step">
      <h2>Idiomas (opcional)</h2>
      <p className="step-desc">
        Considere preencher esta etapa se você está se candidatando para uma vaga internacional,
        para uma empresa multinacional ou para áreas em que idiomas são frequentemente exigidos.
        Nesses contextos, idiomas são valorizados por ATS e recrutadores.
      </p>
      {data.map((lang, i) => (
        <div key={i} className="list-item">
          <div>
            <strong>{lang.language}</strong> - {lang.level}
          </div>
          <button className="btn-remove" onClick={() => remove(i)}>
            Remover
          </button>
        </div>
      ))}
      <div className="sub-form">
        <h3>Novo idioma</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Idioma</label>
            <input
              name="language"
              value={form.language}
              onChange={handle}
              placeholder="Ex.: Inglês, Espanhol..."
            />
          </div>
          <div className="form-group">
            <label>Nível</label>
            <CustomSelect
              className="form"
              triggerClassName="form"
              value={form.level}
              onChange={(level) => setForm((p) => ({ ...p, level }))}
              options={levels.map((l) => ({ value: l, label: l }))}
            />
          </div>
        </div>
        <div className="sub-form-actions">
          <button className="btn-primary" onClick={add}>
            + Adicionar idioma
          </button>
        </div>
      </div>
    </div>
  )
})
export default StepLanguages
