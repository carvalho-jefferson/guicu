import { useState } from 'react'
import { FiHelpCircle, FiEdit2, FiX } from 'react-icons/fi'

function StepSkills({ data, onChange }) {
  const [inputValue, setInputValue] = useState('')

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

    onChange([...data, ...newSkills])
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
    // Remove todos os itens do grupo
    onChange(data.filter((s) => (s.category || 'Geral') !== cat))
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

    return (
      <div style={{ marginTop: 16 }}>
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 8, display: 'flex', alignItems: 'baseline' }}>
            <div style={{ flex: 1 }}>
              {cat !== 'Geral' && <strong>{cat}:</strong>}
              <span style={{ color: 'var(--muted)' }}> {items.join(', ')}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
              <button
                onClick={() => handleEditGroup(cat)}
                className="btn-edit"
                title="Editar grupo"
              >
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
        ))}
      </div>
    )
  }

  return (
    <div className="step">
      <h2>Habilidades Técnicas</h2>
      <p className="step-desc">
        Adicione habilidades no formato "Categoria: habilidade1, habilidade2". Priorize exatamente
        as palavras-chave que aparecem na descrição da vaga.
      </p>

      <div className="form-group" style={{ marginBottom: 12 }}>
        <label>
          Nova habilidade
          <FiHelpCircle
            title="Evite listar habilidades que você não domina ou que não são relevantes para a vaga. Lembre-se que na entrevista técnica, os recrutadores podem perguntar sobre qualquer habilidade listada no seu currículo. Seja honesto e estratégico na escolha das habilidades para aumentar suas chances de sucesso!"
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
            + Adicionar
          </button>
        </div>
      </div>

      {renderGrouped()}

      {data.length > 0 && data.length < 5 && (
        <p className="hint warn">Recomendado pelo menos 5 habilidades técnicas.</p>
      )}
      {data.length >= 5 && (
        <p className="hint good">Bom conjunto de habilidades ({data.length}) listadas.</p>
      )}
    </div>
  )
}

export default StepSkills
