import { useState } from 'react'
import { summaryTemplates } from '../../content/templates'

function StepSummary({ data, onChange }) {
  const trimmed = data.trim()
  const wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).filter(Boolean).length
  const MAX_WORDS = 80
  const isAtLimit = wordCount === MAX_WORDS

  const [templateIndex, setTemplateIndex] = useState(0)

  const handleChange = (e) => {
    const newValue = e.target.value
    const newWordCount =
      newValue.trim() === '' ? 0 : newValue.trim().split(/\s+/).filter(Boolean).length
    if (newWordCount <= MAX_WORDS) {
      onChange(newValue)
    }
  }

  const handleHelp = () => {
    const nextIndex = (templateIndex + 1) % summaryTemplates.length
    setTemplateIndex(nextIndex)
    onChange(summaryTemplates[nextIndex])
  }

  return (
    <div className="step">
      <h2>Resumo Profissional</h2>
      <p className="step-desc">Escreva 3–5 linhas sobre suas competências e objetivos.</p>
      <p className="step-desc">
        Estrutura recomendada:<br></br>[formação/experiência] + [principais tecnologias] + [área de
        atuação] + [cargo alvo].
      </p>
      <div className="form-group">
        <label>Resumo *</label>
        <textarea
          value={data}
          onChange={handleChange}
          placeholder={
            'Ex.: Desenvolvedor Backend com 4 anos de experiência em Python e Node.js, especializado em arquitetura de APIs RESTful e microsserviços. Sólida vivência com bancos de dados relacionais e não relacionais, containerização com Docker e deploy em ambientes cloud (AWS). Interesse em atuar como Desenvolvedor Backend Pleno...'
          }
          rows={6}
        />

        {/* Botão "Guicu, me ajuda!" */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <button
            type="button"
            className="help-pill"
            onClick={handleHelp}
            title="Preencher com um modelo de resumo (clique novamente para outra sugestão)"
          >
            Guicu, me ajuda!
          </button>
        </div>

        <span className={`word-count ${isAtLimit ? 'good' : wordCount < 40 ? 'warn' : 'good'}`}>
          {isAtLimit
            ? `${wordCount}/${MAX_WORDS} palavras — limite atingido`
            : wordCount < 40
              ? `${wordCount} palavras — recomendado pelo menos 40`
              : `${wordCount} palavras — ótimo para ATS`}
        </span>
      </div>
    </div>
  )
}

export default StepSummary
