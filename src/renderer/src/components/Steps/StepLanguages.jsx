import { useState } from 'react'
const levels = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo']

function StepLanguages({ data, onChange }) {
  const [form, setForm] = useState({ language: '', level: 'Básico' })
  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const add = () => {
    if (!form.language.trim()) return
    onChange([...data, form])
    setForm({ language: '', level: 'Básico' })
  }
  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))

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
            <select name="level" value={form.level} onChange={handle}>
              {levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
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
}
export default StepLanguages
