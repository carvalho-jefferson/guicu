import { useState } from 'react'

const empty = { institution: '', degree: '', field: '', start: '', end: '', current: false }

function StepEducation({ data, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)

  const handle = (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [e.target.name]: v }))
  }

  const save = () => {
    if (!form.institution.trim()) return
    if (editing !== null) {
      const updated = [...data]
      updated[editing] = form
      onChange(updated)
      setEditing(null)
    } else {
      onChange([...data, form])
    }
    setForm(empty)
  }

  const edit = (i) => {
    setEditing(i)
    setForm(data[i])
  }
  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))

  return (
    <div className="step">
      <h2>Formação Acadêmica</h2>
      <p className="step-desc">Inclua graduação, pós‑graduação ou cursos técnicos relevantes.</p>

      {data.map((edu, i) => (
        <div key={i} className="list-item">
          <div>
            <strong>
              {edu.degree && edu.field && `${edu.degree} em ${edu.field}`}
              {edu.degree && !edu.field && edu.degree}
              {!edu.degree && edu.field && edu.field}
              {!edu.degree && !edu.field && edu.institution}
            </strong>
            {edu.institution && ` - ${edu.institution}`}
            <span className="date-range">
              {edu.start} – {edu.current ? 'Cursando' : edu.end}
            </span>
          </div>
          <div className="item-actions">
            <button className="btn-edit" onClick={() => edit(i)}>
              Editar
            </button>
            <button className="btn-remove" onClick={() => remove(i)}>
              Remover
            </button>
          </div>
        </div>
      ))}

      <div className="sub-form">
        <h3>{editing !== null ? 'Editar formação' : 'Nova formação'}</h3>
        <div className="form-grid">
          <div className="form-group full">
            <label>Instituição</label>
            <input
              name="institution"
              value={form.institution}
              onChange={handle}
              placeholder="Ex.: UFMG"
            />
          </div>
          <div className="form-group">
            <label>
              Grau <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(opcional)</span>
            </label>
            <input
              name="degree"
              value={form.degree}
              onChange={handle}
              placeholder="Ex.: Bacharelado, Tecnólogo, Técnico..."
            />
          </div>
          <div className="form-group">
            <label>Área / Curso</label>
            <input
              name="field"
              value={form.field}
              onChange={handle}
              placeholder="Ex.: Ciência da Computação"
            />
          </div>
          <div className="form-group">
            <label>Início</label>
            <input name="start" value={form.start} onChange={handle} placeholder="2020" />
          </div>
          <div className="form-group">
            <label>Fim</label>
            <input
              name="end"
              value={form.end}
              onChange={handle}
              placeholder="2024"
              disabled={form.current}
            />
          </div>
          <div className="form-group full checkbox-group">
            <label>
              <input type="checkbox" name="current" checked={form.current} onChange={handle} />{' '}
              Cursando atualmente
            </label>
          </div>
        </div>
        <div className="sub-form-actions">
          <button className="btn-primary" onClick={save}>
            {editing !== null ? 'Salvar alterações' : '+ Adicionar formação'}
          </button>
          {editing !== null && (
            <button
              className="btn-secondary"
              onClick={() => {
                setEditing(null)
                setForm(empty)
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StepEducation
