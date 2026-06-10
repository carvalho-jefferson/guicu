import { useState } from 'react'

const empty = { name: '', tech: '', link: '', bullets: [], linkDisplay: 'below' }

function StepProjects({ data, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [bulletInput, setBulletInput] = useState('')

  const handle = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addBullet = () => {
    if (!bulletInput.trim()) return
    setForm((prev) => ({ ...prev, bullets: [...(prev.bullets || []), bulletInput.trim()] }))
    setBulletInput('')
  }

  const removeBullet = (i) => {
    setForm((prev) => ({ ...prev, bullets: prev.bullets.filter((_, idx) => idx !== i) }))
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editing !== null) {
      const updated = [...data]
      updated[editing] = { ...form }
      onChange(updated)
      setEditing(null)
    } else {
      onChange([...data, { ...form }])
    }
    setForm(empty)
    setBulletInput('')
  }

  const edit = (i) => {
    setEditing(i)
    setForm({ ...data[i], bullets: data[i].bullets || [] })
    setBulletInput('')
  }

  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))
  const cancel = () => {
    setEditing(null)
    setForm(empty)
    setBulletInput('')
  }

  return (
    <div className="step">
      <h2>Projetos</h2>
      <p className="step-desc">
        Projetos práticos demonstram habilidades técnicas reais. Para o ATS, trate‑os como
        experiências profissionais.
      </p>

      {data.map((proj, i) => (
        <div key={i} className="list-item">
          <div>
            <strong>{proj.name}</strong>
            {proj.link && proj.linkDisplay === 'below' && (
              <div className="r-link">
                <a href={proj.link} target="_blank" rel="noopener noreferrer">
                  {proj.link}
                </a>
              </div>
            )}
            {proj.link && proj.linkDisplay === 'hyperlink' && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                Link no título
              </div>
            )}
            {proj.tech && (
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>— {proj.tech}</span>
            )}
            {proj.bullets?.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {proj.bullets.length} atividade(s)
              </div>
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
        <h3>{editing !== null ? 'Editar projeto' : 'Novo projeto'}</h3>
        <div className="form-grid">
          <div className="form-group full">
            <label>Nome do projeto</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Ex.: API RESTful" />
          </div>

          <div className="form-group full">
            <label>Tecnologias utilizadas</label>
            <input
              name="tech"
              value={form.tech}
              onChange={handle}
              placeholder="Ex.: Python, Flask, PostgreSQL, Git"
            />
          </div>

          <div className="form-group full">
            <label>Atividades e conquistas</label>
            <div className="input-row">
              <input
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBullet()
                  }
                }}
                placeholder="Ex.: Desenvolvi uma API REST para gerenciamento de estoque utilizando Python e Flask."
              />
              <button className="btn-add" onClick={addBullet}>
                + Adicionar
              </button>
            </div>
            {form.bullets?.length > 0 && (
              <div className="bullets-list">
                {form.bullets.map((b, i) => (
                  <div key={i} className="bullet-item">
                    <span className="bullet-dot">•</span>
                    <span className="text">{b}</span>
                    <button className="btn-remove" onClick={() => removeBullet(i)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group full">
            <label>Link (GitHub, deploy, etc)</label>
            <input
              name="link"
              value={form.link}
              onChange={handle}
              placeholder="https://github.com/..."
            />
          </div>

          {form.link && (
            <div className="form-group full">
              <label>Exibir link como:</label>
              <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="linkDisplay"
                    value="below"
                    checked={form.linkDisplay === 'below'}
                    onChange={handle}
                  />
                  Link abaixo do título
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
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

        <div className="sub-form-actions">
          <button className="btn-primary" onClick={save}>
            {editing !== null ? 'Salvar alterações' : '+ Adicionar projeto'}
          </button>
          {editing !== null && (
            <button className="btn-secondary" onClick={cancel}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StepProjects
