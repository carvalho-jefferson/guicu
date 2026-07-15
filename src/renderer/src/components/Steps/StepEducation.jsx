import { useState, forwardRef, useImperativeHandle } from 'react'

const empty = { institution: '', degree: '', field: '', start: '', end: '', current: false }

const StepEducation = forwardRef(function StepEducation({ data, onChange }, ref) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [baseline, setBaseline] = useState(empty)

  const handle = (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [e.target.name]: v }))
  }

  const resetForm = () => {
    setForm(empty)
    setBaseline(empty)
    setEditing(null)
  }

  const save = () => {
    if (!form.institution.trim()) return
    if (editing !== null) {
      const updated = [...data]
      updated[editing] = form
      onChange(updated)
    } else {
      onChange([...data, form])
    }
    resetForm()
  }

  const edit = (i) => {
    setEditing(i)
    setForm(data[i])
    setBaseline(data[i])
  }
  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => JSON.stringify(form) !== JSON.stringify(baseline),
    commit: () => {
      if (!form.institution?.trim()) return false
      if (editing !== null) {
        const updated = [...data]
        updated[editing] = form
        onChange(updated)
      } else {
        onChange([...data, form])
      }
      resetForm()
      return true
    },
    discard: () => resetForm()
  }))

  return (
    <div className="step">
      <h2>Formação Acadêmica</h2>
      <p className="step-desc">
        Use esta seção apenas para graduação, ensino médio, curso técnico formal ou pós‑graduação.
        Cursos livres, bootcamps e treinamentos devem ser adicionados na etapa &quot;Cursos e
        Certificações&quot;.
      </p>

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
              placeholder={form.current ? '' : '2024'}
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
                setBaseline(empty)
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default StepEducation
