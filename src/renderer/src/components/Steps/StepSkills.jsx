import { useState, forwardRef, useImperativeHandle } from 'react'
import { FiHelpCircle, FiEdit2, FiX } from 'react-icons/fi'

const StepSkills = forwardRef(function StepSkills({ data, onChange }, ref) {
  const [inputValue, setInputValue] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)

  const addSkill = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const colonIndex = trimmed.indexOf(':')
    let category = ''
    let itemsStr = trimmed

    if (colonIndex !== -1) {
      category = trimmed.substring(0, colonIndex).trim()
      itemsStr = trimmed.substring(colonIndex + 1).trim()
    }

    const items = itemsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const newSkills = items.map((name) => ({
      name,
      category: category || ''
    }))

    if (editingCategory !== null) {
      const withoutOld = data.filter((s) => (s.category || 'Geral') !== editingCategory)
      onChange([...withoutOld, ...newSkills])
      setEditingCategory(null)
    } else {
      onChange([...data, ...newSkills])
    }
    setInputValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  // Editar um grupo inteiro
  const handleEditGroup = (cat) => {
    const groupItems = data.filter((s) => (s.category || 'Geral') === cat)
    const itemNames = groupItems.map((s) => s.name).join(', ')
    const text = cat === 'Geral' ? itemNames : `${cat}: ${itemNames}`
    setInputValue(text)
    setEditingCategory(cat)
  }

  // Remover um grupo inteiro
  const handleRemoveGroup = (cat) => {
    onChange(data.filter((s) => (s.category || 'Geral') !== cat))
  }

  // Agrupamento para exibição
  const renderGrouped = () => {
    if (data.length === 0) return null

    const groups = {}
    data.forEach((skill) => {
      const cat = skill.category || 'Geral'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(skill.name)
    })

    return Object.entries(groups).map(([cat, items]) => (
      <div key={cat} className="list-item">
        <div>
          {cat !== 'Geral' && <strong>{cat}:</strong>} {items.join(', ')}
        </div>
        <div className="item-actions">
          <button onClick={() => handleEditGroup(cat)} className="btn-edit" title="Editar grupo">
            <FiEdit2 size={12} />
          </button>
          <button
            onClick={() => handleRemoveGroup(cat)}
            className="btn-remove"
            title="Remover grupo"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
    ))
  }

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => inputValue.trim() !== '',
    commit: () => {
      if (inputValue.trim()) addSkill()
      return true
    },
    discard: () => {
      setInputValue('')
      setEditingCategory(null)
    }
  }))

  return (
    <div className="step">
      <h2>Habilidades Técnicas</h2>
      <p className="step-desc">
        Adicione habilidades no formato &quot;Categoria: habilidade1, habilidade2&quot;. Priorize
        exatamente as palavras-chave que aparecem na descrição da vaga.
      </p>

      {renderGrouped()}

      <div className="sub-form">
        <h3>{editingCategory !== null ? 'Editar habilidades' : 'Nova habilidade'}</h3>
        <div className="form-group">
          <label>
            Categoria e habilidades
            <FiHelpCircle
              title="Evite listar habilidades que você não domina ou que não são relevantes para a vaga. Lembre-se que na entrevista técnica, os recrutadores podem perguntar sobre qualquer habilidade listada no seu currículo."
              style={{ marginLeft: 6, cursor: 'help', color: 'var(--muted)', fontSize: 14 }}
            />
          </label>
          <div className="input-row">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex.: Linguagens: Python, Java, JavaScript, C++"
            />
            <button className="btn-add" onClick={addSkill}>
              {editingCategory !== null ? 'Salvar' : '+ Adicionar'}
            </button>
          </div>
        </div>
      </div>

      {data.length > 0 && data.length < 5 && (
        <p className="hint warn">Recomendado pelo menos 5 habilidades técnicas.</p>
      )}
      {data.length >= 5 && (
        <p className="hint good">Bom conjunto de habilidades ({data.length}) listadas.</p>
      )}
    </div>
  )
})

export default StepSkills
