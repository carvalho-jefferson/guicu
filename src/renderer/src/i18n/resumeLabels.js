// Valores padrão dos títulos de seção do currículo (resumo, habilidades, etc) — o usuário pode editá-los diretamente na tela de pré-visualização do currículo (ex: trocar "Certificações" por "CERTIFICATIONS" para uma vaga internacional), sem precisar de um seletor de idioma nem de um dicionário de traduções mantido pelo app.

// Quando o guicu ganhar i18n completo da interface, o valor padrão de currículos novos pode simplesmente acompanhar o idioma do app — mas o campo continua sendo um texto livre e editável, então currículos já personalizados não são afetados.

export const DEFAULT_SECTION_TITLES = {
  summary: 'Resumo Profissional',
  skills: 'Habilidades Técnicas',
  experience: 'Experiência Profissional',
  projects: 'Projetos',
  education: 'Formação Acadêmica',
  certifications: 'Cursos e Certificações',
  languages: 'Idiomas'
}

export const getSectionTitles = (saved) => ({ ...DEFAULT_SECTION_TITLES, ...(saved || {}) })
