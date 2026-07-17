// Lista de verbos de ação - usada apenas para feedback textual

const ACTION_VERBS = [
  'desenvolvi',
  'desenvolveu',
  'liderei',
  'liderou',
  'gerenciei',
  'gerenciou',
  'implementei',
  'implementou',
  'otimizei',
  'otimizou',
  'criei',
  'criou',
  'aumentei',
  'aumentou',
  'reduzi',
  'reduziu',
  'coordenei',
  'coordenou',
  'projetei',
  'projetou',
  'analisei',
  'analisou',
  'automatizei',
  'automatizou',
  'integrei',
  'integrou',
  'resolvi',
  'resolviu',
  'negociei',
  'negociou',
  'planejei',
  'planejou',
  'executei',
  'executou',
  'revisei',
  'revisou',
  'documentei',
  'documentou',
  'treinei',
  'treinou',
  'supervisionei',
  'supervisionou'
]

function hasActionVerb(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return ACTION_VERBS.some((v) => new RegExp(`\\b${v}\\b`).test(lower))
}

function countQuantifiableResults(bullets) {
  if (!bullets || !Array.isArray(bullets)) return 0
  const patterns = [
    /\d+%/,
    /r\$\s?\d+/,
    /\d+\s?mil/,
    /aumentei\s+em\s+\d+/,
    /reduzi\s+em\s+\d+/,
    /\d+\s+usuários/,
    /\d+\s+clientes/,
    /\d+\s+projetos/,
    /\d+x\b/,
    /\d+\s+horas/,
    /\d+\s+times/
  ]
  let count = 0
  for (const bullet of bullets) {
    for (const pattern of patterns) {
      if (pattern.test(bullet.toLowerCase())) {
        count++
        break
      }
    }
  }
  return count
}

// Retorna nomes de skills como array de strings normalizadas
function getSkillNames(skills) {
  if (!skills || !Array.isArray(skills)) return []
  return skills
    .map((s) => (typeof s === 'string' ? s : (s.name ?? '')).toLowerCase().trim())
    .filter(Boolean)
}

// Conta quantas skills aparecem em um texto
function countSkillsInText(skillNames, text) {
  if (!text) return 0
  const lower = text.toLowerCase()
  return skillNames.filter((s) => {
    if (!s) return false
    // Usa word boundary para skills alfanuméricas simples
    // Para skills com caracteres especiais (C++, .NET), fallback para includes com espaços
    const safe = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = /^[a-z0-9]+$/.test(s)
      ? new RegExp(`\\b${safe}\\b`)
      : new RegExp(`(^|\\s)${safe}(\\s|$)`)
    return pattern.test(lower)
  }).length
}

// -----------------------------------------------------------------------------------------------
// Pesos da pontuação (baseados em como ATS reais priorizam critérios. Pesquisa realizada em 06-2026):
//
//  Informações pessoais / parseabilidade  → 12 pts
//  Título profissional                    →  5 pts
//  Habilidades / keywords                 → 35 pts
//  Experiência profissional               → 25 pts
//  Resumo profissional                    → 10 pts
//  Formação acadêmica                     →  5 pts
//  Certificações e Cursos                 →  5 pts
//  Projetos                               →  3 pts
//  Total possível                         → 100 pts
//
//  Idiomas: removido da pontuação (ATS raramente filtra, com exceção para vagas internacionais).
// -----------------------------------------------------------------------------------------------

export function calculateATSScore(data) {
  let score = 0
  const feedback = { good: [], warnings: [], suggestions: [] }

  // Aplicada no return para garantir que o cap funcione independente da ordem de execução das seções seguintes.

  const skillNames = getSkillNames(data.skills)

  // Informações pessoais (12 pts)

  if (data.personal.name?.trim()) {
    score += 3
  }

  if (data.personal.email?.trim()) {
    score += 3
  }

  if (data.personal.phone?.trim()) {
    score += 2
  } else {
    feedback.suggestions.push('Adicione seu telefone para facilitar o contato')
  }

  if (data.personal.location?.trim()) {
    score += 1
  }

  if (data.personal.linkedin?.trim()) {
    score += 2
    feedback.good.push('LinkedIn presente')
  } else {
    feedback.suggestions.push('LinkedIn é verificado por recrutadores — inclua se possível')
  }

  if (data.personal.github?.trim()) {
    score += 1
    feedback.good.push('GitHub/portfólio presente')
  } else {
    feedback.suggestions.push('Inclua GitHub ou portfólio se for relevante para a área')
  }

  // Título profissional (5 pts)
  if (data.personal.title?.trim()) {
    score += 5
    feedback.good.push('Título profissional definido')
  }

  // Habilidades / Palavras-chave
  // Distribuição: contagem de habilidades(15) + categorias(5) + contexto na experiência(15) = 35 pts
  // Este é o critério dominante em sistemas ATS atuais.
  const skillCount = skillNames.length

  if (skillCount >= 15) {
    score += 15
    feedback.good.push(`${skillCount} habilidades — cobertura excelente`)
  } else if (skillCount >= 10) {
    score += 10
    feedback.warnings.push(`${skillCount} habilidades. Recomendado pelo menos 15`)
  } else if (skillCount > 0) {
    score += 5
    feedback.warnings.push(`Apenas ${skillCount} habilidades — insuficiente`)
  } else {
    feedback.warnings.push('Nenhuma habilidade listada — seção essencial para ATS')
  }

  // Categorização melhora a densidade semântica de palavras-chave (5 pts)
  const hasCategories = data.skills.some((s) => typeof s === 'object' && s.category?.trim())
  if (hasCategories) {
    score += 5
    feedback.good.push('Habilidades categorizadas — melhora a leitura semântica do ATS')
  } else {
    feedback.suggestions.push(
      'Categorize as habilidades (Ex.: Linguagens, Frameworks, Ferramentas)'
    )
  }

  // Palavras-chave das habilidades aparecem na experiência (15 pts)
  const allBulletsText = (data.experience ?? []).flatMap((e) => e.bullets ?? []).join(' ')
  const skillsInExperience = countSkillsInText(skillNames, allBulletsText)

  if (skillsInExperience >= 5) {
    score += 15
    feedback.good.push(
      `${skillsInExperience} habilidades mencionadas na experiência — forte correspondência`
    )
  } else if (skillsInExperience >= 3) {
    score += 10
    feedback.suggestions.push('Mencione mais habilidades técnicas nas descrições de experiência')
  } else if (skillsInExperience > 0) {
    score += 4
    feedback.suggestions.push(
      `Apenas ${skillsInExperience} habilidade(s) na experiência — cite as ferramentas que usou`
    )
  } else {
    feedback.warnings.push(
      'Nenhuma habilidade técnica mencionada nas experiências — palavras-chave ausentes no contexto'
    )
  }

  // Qualidade da experiência profissional: 5 + 5 (detalhamento de data + bullets) + 10 (quantificação) + 5 (datas) = 25 pts
  // Experiência profissional (5 pts)
  if ((data.experience ?? []).length > 0) {
    score += 5
    feedback.good.push('Experiência profissional presente')

    const allBullets = data.experience.flatMap((e) => e.bullets ?? [])

    if (allBullets.length >= 3) {
      score += 5
      feedback.good.push('Experiências detalhadas com tópicos')
    } else if (allBullets.length > 0) {
      score += 2
      feedback.suggestions.push(
        'Adicione mais tópicos na experiência — detalhe atividades e resultados'
      )
    } else {
      feedback.warnings.push(
        'Experiências sem descrição — ATS não encontrará palavras-chave relevantes'
      )
    }

    // Resultados quantificáveis (10 pts)
    const quantCount = countQuantifiableResults(allBullets)
    if (quantCount >= 3) {
      score += 10
      feedback.good.push(`${quantCount} resultados quantificáveis — diferencial importante`)
    } else if (quantCount >= 1) {
      score += 5
      feedback.suggestions.push('Quantifique mais resultados: "reduzi 30%", "gerenciei R$ 50 mil"')
    } else if (allBullets.length > 0) {
      feedback.suggestions.push('Nenhum resultado quantificado — números aumentam o ranqueamento')
    }

    // Verbos de ação
    const bulletsWithVerb = allBullets.filter((b) => hasActionVerb(b)).length
    if (bulletsWithVerb === 0 && allBullets.length > 0) {
      feedback.suggestions.push(
        'Use verbos de ação nos tópicos: "desenvolvi", "liderei", "otimizei"...'
      )
    }

    // Experiências com datas - parsers precisam de datas para ordenação cronológica (5pts)
    const withDates = data.experience.filter((e) => e.start?.trim()).length
    if (withDates === data.experience.length) {
      score += 5
      feedback.good.push('Todas as experiências com datas — facilita a análise cronológica')
    } else if (withDates > 0) {
      score += 2
      feedback.warnings.push(
        'Algumas experiências sem data — complete para garantir a análise correta'
      )
    } else {
      feedback.warnings.push('Experiências sem datas — ATS podem analisar de forma incorreta')
    }
  } else {
    feedback.suggestions.push(
      'Adicione experiências profissionais — ou substitua por projetos relevantes'
    )
  }

  // Resumo profissional (10 pts)
  // ATS usa o resumo principalmente como portador de palavras-chave
  const summaryWords = data.summary ? data.summary.trim().split(/\s+/).filter(Boolean).length : 0
  const skillsInSummary = countSkillsInText(skillNames, data.summary)

  if (summaryWords >= 40) {
    score += 3
    feedback.good.push(`Resumo com ${summaryWords} palavras`)
  }

  if (skillsInSummary >= 4) {
    score += 7
    feedback.good.push(`${skillsInSummary} palavras-chave de habilidades no resumo — excelente`)
  } else if (skillsInSummary >= 2) {
    score += 4
    feedback.suggestions.push(
      'Inclua mais habilidades técnicas no resumo para aumentar correspondência com a vaga'
    )
  } else if (skillsInSummary > 0) {
    score += 1
    feedback.suggestions.push(
      `Apenas ${skillsInSummary} palavras-chave no resumo — mencione mais tecnologias`
    )
  } else if (summaryWords > 0) {
    feedback.warnings.push(
      'Resumo sem palavras-chave de habilidades — ATS não encontrará correspondência'
    )
  }

  // Formação acadêmica (5 pts)
  if ((data.education ?? []).length > 0) {
    score += 5
    feedback.good.push('Formação acadêmica presente')
  } else {
    feedback.suggestions.push('Inclua sua formação acadêmica')
  }

  // Certificações e Cursos (5 pts)
  if ((data.certifications ?? []).length >= 2) {
    score += 5
    feedback.good.push(`${data.certifications.length} cursos/certificações — credibilidade técnica`)
  } else if ((data.certifications ?? []).length === 1) {
    score += 3
    feedback.suggestions.push(
      'Adicione mais cursos ou certificações relevantes (AWS, Google, Alura, Udemy...)'
    )
  } else {
    feedback.suggestions.push('Certificações e Cursos aumentam a credibilidade — adicione se tiver')
  }

  // Projetos (3 pts)
  if ((data.projects ?? []).length >= 2) {
    score += 3
    feedback.good.push(`${data.projects.length} projetos — demonstra aplicação prática`)
  } else if ((data.projects ?? []).length === 1) {
    score += 1
    feedback.suggestions.push('Adicione mais projetos para demonstrar habilidades na prática')
  } else {
    feedback.suggestions.push('Projetos práticos são valorizados, especialmente em TI')
  }

  // Idiomas
  if ((data.languages ?? []).length === 0) {
    feedback.suggestions.push(
      'Se tiver conhecimento de idiomas, inclua (recomendado para vagas internacionais ou para empresas multinacionais)'
    )
  }

  return { score: Math.min(score, 100), feedback }
}
