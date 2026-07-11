function OnboardingModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Bem‑vindo(a) ao Guicu! 🎉</h2>
        <p style={{ marginTop: '16px' }}>
          Crie currículos profissionais, completos e bem estruturados, com recomendações que ajudam
          você a destacar suas qualificações e aumentar suas chances em processos seletivos.
        </p>
        <ul style={{ margin: '16px 0', paddingLeft: 20 }}>
          <li>Preencha seus dados em etapas guiadas</li>
          <li>Visualize e exporte em PDF ou DOCX</li>
          <li>Receba análise de compatibilidade com sistemas ATS</li>
          <li>Seus dados ficam salvos apenas no seu computador</li>
        </ul>
        <p>Obrigado por usar o Guicu! 💚</p>
        <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
          Iniciar meu currículo
        </button>
      </div>
    </div>
  )
}

export default OnboardingModal
