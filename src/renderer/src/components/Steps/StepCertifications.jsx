import { useState } from 'react'

const empty = { name: '', issuer: '', date: '', link: '', linkDisplay: 'below' }

function StepCertifications({ data, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const save = () => {
    if (!form.name) return
    if (editing !== null) {
      const u = [...data]
      u[editing] = form
      onChange(u)
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
      <h2>Certificações</h2>
      <p className="step-desc">Certificações aumentam a credibilidade no ATS.</p>

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
            <label>Nome da certificação</label>
            <input
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="Ex.: AWS Certified Developer"
            />
          </div>
          <div className="form-group">
            <label>Emissor</label>
            <input
              name="issuer"
              value={form.issuer}
              onChange={handle}
              placeholder="Ex.: Amazon, Google, Alura..."
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

export default StepCertifications
