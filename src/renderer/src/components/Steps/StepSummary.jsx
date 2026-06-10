function StepSummary({ data, onChange }) {
  const wordCount = data.trim() === '' ? 0 : data.trim().split(/\s+/).length
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
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            'Ex.: Desenvolvedor Backend com 4 anos de experiência em Python e Node.js, especializado em arquitetura de APIs RESTful e microsserviços. Sólida vivência com bancos de dados relacionais e não relacionais, containerização com Docker e deploy em ambientes cloud (AWS). Interesse em atuar como Desenvolvedor Backend Pleno para contribuir com sistemas escaláveis...'
          }
          rows={6}
        />
        <span className={`word-count ${wordCount < 40 ? 'warn' : 'good'}`}>
          {wordCount < 40
            ? `${wordCount} palavras — recomendado pelo menos 40`
            : `${wordCount} palavras — ótimo para ATS`}
        </span>
      </div>
    </div>
  )
}
export default StepSummary
