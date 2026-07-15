import { useState, forwardRef, useImperativeHandle } from 'react'

const empty = { name: '', issuer: '', date: '', link: '', linkDisplay: 'below' }

const StepCertifications = forwardRef(function StepCertifications({ data, onChange }, ref) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [baseline, setBaseline] = useState(empty)

  const handle = (e) => {
    const { name, value } = e.target
    const newValue = name === 'link' ? value.replace(/\s/g, '') : value
    setForm((p) => ({ ...p, [name]: newValue }))
  }

  const resetForm = () => {
    setForm(empty)
    setBaseline(empty)
    setEditing(null)
  }

  const save = () => {
    if (!form.name) return
    if (editing !== null) {
      const u = [...data]
      u[editing] = form
      onChange(u)
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
      if (!form.name?.trim()) return false
      if (editing !== null) {
        const u = [...data]
        u[editing] = form
        onChange(u)
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
      <h2>Cursos e Certificações</h2>
      <p className="step-desc">
        Adicione aqui cursos livres, bootcamps, treinamentos e certificações formais. Eles aumentam
        a credibilidade no ATS.
      </p>

      {data.map((cert, i) => (
        <div key={i} className="list-item">
          <div>
            <strong>{cert.name}</strong>
            {cert.link && cert.linkDisplay === 'below' && (
              <div className="r-link">
                <a href={cert.link} target="_blank" rel="noopener noreferrer">
                  {cert.link}
                </a>
              </div>
            )}
            {cert.link && cert.linkDisplay === 'hyperlink' && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                Link no título
              </div>
            )}
            {cert.issuer && <span style={{ color: 'var(--muted)' }}> — {cert.issuer}</span>}
            {cert.date && (
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>({cert.date})</span>
            )}
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
        <h3>{editing !== null ? 'Editar certificação' : 'Nova certificação'}</h3>
        <div className="form-grid">
          <div className="form-group full">
            <label>Nome do curso ou certificação</label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Ex.: AWS Certified Developer, Python para Data Science..."
            />
          </div>
          <div className="form-group">
            <label>Instituição / Emissor</label>
            <input
              name="issuer"
              value={form.issuer}
              onChange={handle}
              placeholder="Ex.: Amazon, Google, Alura, Udemy..."
            />
          </div>
          <div className="form-group">
            <label>Data</label>
            <input name="date" value={form.date} onChange={handle} placeholder="Jan 2024" />
          </div>
          <div className="form-group full">
            <label>Link do certificado</label>
            <input name="link" value={form.link} onChange={handle} placeholder="https://..." />
            {form.link && (
              <div className="form-group full">
                <label>Exibir link como:</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <label
                    style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="linkDisplay"
                      value="below"
                      checked={form.linkDisplay === 'below'}
                      onChange={handle}
                    />
                    Link abaixo do título
                  </label>
                  <label
                    style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  >
                    <input
                      type="radio"
                      name="linkDisplay"
                      value="hyperlink"
                      checked={form.linkDisplay === 'hyperlink'}
                      onChange={handle}
                    />
                    Título como hyperlink
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="sub-form-actions">
          <button className="btn-primary" onClick={save}>
            {editing !== null ? 'Salvar alterações' : '+ Adicionar certificação'}
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

export default StepCertifications
