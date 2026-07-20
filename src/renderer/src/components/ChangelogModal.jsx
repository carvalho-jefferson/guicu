// CHECKLIST PRÉ-RELEASE — CHANGELOG

// 1. Atualizar o package.json para a nova versão.

// 2. Neste arquivo, adicionar uma nova entrada no objeto CHANGELOG com a chave correspondente à nova versão (ex: '1.6.0').

// 3. Preencher "title" e "items" com as mudanças.

const CHANGELOG = {
  '1.6.0': {
    title: 'Novidades da versão 1.6.0 ✨',
    items: [
      'Aparência geral aprimorada',
      'Níveis de idioma agora seguem o padrão Europeu CEFR (A1 a C2)',
      'Adicionados um menu de configurações e uma página de apoio ao projeto',
      'Seletor bilíngue (PT/EN) nos idiomas — currículo pronto para vagas internacionais',
      'Ajuste da aparência da seção de idiomas. Agora seguem o mesmo estilo dos outros elementos do currículo — removida a tarja cinza',
      'Adicionada validação para impedir prosseguir sem ter salvado os campos já preenchidos',
      'Correção da aparência de habilidades sem categoria — agora se transformam em tópicos',
      'A partir desta versão, os nomes dos executáveis serão padronizados para cada sistema operacional'
    ]
  },
  '1.6.1': {
    title: 'Novidades da versão 1.6.1 ✨',
    items: [
      'Aparência dos subtítulos melhorada — removido o negrito pesado, tornando o visual mais moderno',
      'Renomeada a penúltima seção para "Certificações e Cursos"'
    ]
  },
  '1.7.0': {
    title: 'Novidades da versão 1.7.0 ✨',
    items: [
      'Nova funcionalidade: modelos pré-preenchidos para te ajudar. Basta clicar em "Guicu, me ajuda!"',
      'Nova função que restaura o currículo para o modelo padrão',
      'Modificados alguns textos da interface para melhor compreensão',
      'Nova aparência da função de personalização do currículo — mais compacta e intuitiva',
      'Nova personalização: ajuste de margem do currículo (normal ou estreita)',
      'Corrigida a aparência da barra vertical "|" que estava desalinhada no currículo',
      'Corrigido o comportamento ao avançar etapas — agora você é redirecionado para o topo da próxima seção',
      'Correção de bugs e melhorias gerais'
    ]
  }
}

function ChangelogModal({ onClose }) {
  const version = __APP_VERSION__
  const changelog = CHANGELOG[version]

  // Se a versão atual não tiver changelog, não renderiza nada
  if (!changelog) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>{changelog.title}</h2>
        <ul style={{ paddingLeft: 20, margin: '16px 0' }}>
          {changelog.items.map((item, i) => (
            <li key={i} style={{ marginBottom: 8, lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ul>
        <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onClose}>
          Valeu, Guicu!
        </button>
      </div>
    </div>
  )
}

export default ChangelogModal
