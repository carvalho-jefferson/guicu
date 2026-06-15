import { useState } from 'react'
import { FiHelpCircle, FiEdit2, FiX } from 'react-icons/fi'

const empty = { company: '', role: '', start: '', end: '', current: false, bullets: [] }

function StepExperience({ data, onChange }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [bulletInput, setBulletInput] = useState('')
  const [editingBulletIdx, setEditingBulletIdx] = useState(null)

  const handle = (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [e.target.name]: v }))
  }

  const addBullet = () => {
    if (!bulletInput.trim()) return
    if (editingBulletIdx !== null) {
      // modo edição: substitui o bullet existente
      const updated = [...(form.bullets || [])]
      updated[editingBulletIdx] = bulletInput.trim()
      setForm((p) => ({ ...p, bullets: updated }))
      setEditingBulletIdx(null)
    } else {
      setForm((p) => ({ ...p, bullets: [...(p.bullets || []), bulletInput.trim()] }))
    }
    setBulletInput('')
  }

  const editBullet = (i) => {
    setEditingBulletIdx(i)
    setBulletInput(form.bullets[i])
  }

  const cancelBulletEdit = () => {
    setEditingBulletIdx(null)
    setBulletInput('')
  }

  const removeBullet = (i) => {
    setForm((p) => ({ ...p, bullets: p.bullets.filter((_, idx) => idx !== i) }))
    if (editingBulletIdx === i) cancelBulletEdit()
  }

  const save = () => {
    if (!form.company || !form.role) return
    if (editing !== null) {
      const u = [...data]
      u[editing] = form
      onChange(u)
      setEditing(null)
    } else onChange([...data, form])
    setForm(empty)
    setBulletInput('')
  }

  const edit = (i) => {
    setEditing(i)
    setForm({ ...empty, ...data[i], bullets: data[i].bullets || [] })
    setBulletInput('')
  }
  const remove = (i) => onChange(data.filter((_, idx) => idx !== i))
  const cancel = () => {
    setEditing(null)
    setForm(empty)
    setBulletInput('')
    setEditingBulletIdx(null)
  }

  return (
    <div className="step">
      <h2>Experiência Profissional</h2>
      <p className="step-desc">
        Adicione suas experiências mais recentes e relevantes para a vaga.
      </p>

      {data.map((exp, i) => (
        <div key={i} className="list-item">
          <div>
            <strong>{exp.role}</strong> - {exp.company}
            <span className="date-range">
              {exp.start} – {exp.current ? 'Atual' : exp.end}
            </span>
            {exp.bullets?.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {exp.bullets.length} atividade(s)
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
        <h3>{editing !== null ? 'Editar experiência' : 'Nova experiência'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Cargo</label>
            <input
              name="role"
              value={form.role}
              onChange={handle}
              placeholder="Ex.: Desenvolvedor Backend Pleno"
            />
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input
              name="company"
              value={form.company}
              onChange={handle}
              placeholder="Ex.: Empresa XYZ"
            />
          </div>
          <div className="form-group">
            <label>Início</label>
            <input name="start" value={form.start} onChange={handle} placeholder="Jan 2020" />
          </div>
          <div className="form-group">
            <label>Fim</label>
            <input
              name="end"
              value={form.end}
              onChange={handle}
              placeholder="Dez 2022"
              disabled={form.current}
            />
          </div>
          <div className="form-group full checkbox-group">
            <label>
              <input type="checkbox" name="current" checked={form.current} onChange={handle} />{' '}
              Trabalho aqui atualmente
            </label>
          </div>
          <div className="form-group full">
            <label>
              Atividades e conquistas
              <FiHelpCircle
                title="Cite ferramentas utilizadas, quantifique resultados e use verbos de ação. Estrutura recomendada para cada item: verbo + tecnologia + atividade + resultado. Priorize palavras-chave da vaga."
                style={{ marginLeft: 6, cursor: 'help', color: 'var(--muted)', fontSize: 14 }}
              />
            </label>
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
                placeholder="Ex.: Desenvolvi APIs REST utilizando Python e Flask para integração com banco de dados PostgreSQL."
              />
              <button className="btn-add" onClick={addBullet}>
                {editingBulletIdx !== null ? 'Salvar' : '+ Adicionar'}
              </button>
            </div>
            {form.bullets?.length > 0 && (
              <div className="bullets-list">
                {form.bullets.map((b, i) => (
                  <div key={i} className="bullet-item">
                    <span className="bullet-dot">•</span>
                    <span className="text">{b}</span>
                    <button className="btn-edit" onClick={() => editBullet(i)} title="Editar">
                      <FiEdit2 size={12} />
                    </button>
                    <button className="btn-remove" onClick={() => removeBullet(i)} title="Remover">
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                {editingBulletIdx !== null && (
                  <button
                    className="btn-secondary"
                    style={{ marginTop: 4, fontSize: 12 }}
                    onClick={cancelBulletEdit}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="sub-form-actions">
          <button className="btn-primary" onClick={save}>
            {editing !== null ? 'Salvar alterações' : '+ Adicionar experiência'}
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
export default StepExperience
