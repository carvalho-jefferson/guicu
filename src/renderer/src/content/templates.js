// Templates de currículo otimizados para ATS (Applicant Tracking Systems) e leitura humana.
// Boas práticas aplicadas em todos os campos:
// - Verbo de ação no início de cada bullet (linguagem ativa, não passiva)
// - Estrutura "verbo + ação + ferramenta/método/contexto + resultado quantificável"
// - Sem abreviações sem forma completa (ex: usar "Indicadores-chave de desempenho (KPIs)")
// - Placeholders entre colchetes [ ] para fácil localização e substituição
// - Métricas sempre como placeholder numérico [X]% ou [X] para incentivar quantificação

// Os templates cobrem múltiplas áreas profissionais, para que o botão de ajuda do editor sugira exemplos relevantes independentemente da área do usuário:

// Tecnologia, Saúde, Marketing e Vendas, Educação, Administração/RH, Financeiro/Contábil Engenharia, Atendimento ao Cliente/Varejo, Direito e Logística/Operações.

export const summaryTemplates = [
  // Cada template abaixo tem entre 40 e 80 palavras.
  'Profissional com [X] anos de experiência em [área 1] e [área 2], atuando como [sua profissão] com foco em entregar resultados mensuráveis. Cursando [seu curso], desenvolvi conhecimentos sólidos em [habilidade1], [habilidade2] e [habilidade3]. Destaco-me por [diferencial1] e [diferencial2], sempre buscando contribuir de forma consistente. Tenho interesse em atuar como [cargo alvo], aplicando essas competências no dia a dia da equipe.',
  'Atuo há [X] anos como [sua profissão], com foco em [área principal] e experiência complementar em [área secundária]. Minhas principais competências incluem [habilidade1], [habilidade2] e [habilidade3], desenvolvidas em projetos de [contexto ou setor]. Já contribuí para [tipo de resultado, ex: aumento de produtividade]. Busco oportunidade como [cargo desejado] para contribuir diretamente com [objetivo da empresa].',
  'Profissional formado em [seu curso], com expertise prática em [ferramenta/tecnologia] e [ferramenta/tecnologia2]. Experiência comprovada em [área 1] e [área 2], atuando em projetos de [contexto, ex: pequeno, médio ou grande porte]. Reconhecido por [diferencial], especialmente em situações que exigem [habilidade específica]. Tenho interesse em posições de [cargo alvo] dentro de [setor ou tipo de empresa].',
  '[Sua profissão] com [X] anos de atuação em [área 1] e [área 2], sempre priorizando qualidade e organização no trabalho. Histórico de entrega em projetos de [tipo de projeto], utilizando [ferramenta/método1] e [ferramenta/método2] no dia a dia. Já colaborei com equipes multidisciplinares para atingir metas de [indicador]. Busco vaga de [cargo alvo] em empresas de [setor/segmento].',
  'Especialista em [área principal], com sólida base em [habilidade1] e [habilidade2] construída ao longo de [X] anos de atuação profissional. Já contribuí para [tipo de resultado, ex: aumento de eficiência, redução de custos] em projetos de [contexto], trabalhando lado a lado com times de [área relacionada]. Objetivo: atuar como [cargo alvo], agregando essa experiência prática ao time.',
  'Recém-formado em [seu curso], com experiência prática em [área 1] adquirida através de [estágio/projeto acadêmico/voluntariado] realizado ao longo de [X meses/anos]. Domínio de [habilidade1], [habilidade2] e [habilidade3], aplicados em contextos reais de trabalho e estudo. Em busca da primeira oportunidade como [cargo alvo], com disposição para aprender e evoluir rapidamente na função.',
  'Profissional multidisciplinar com atuação em [área 1] e [área 2], unindo conhecimentos técnicos em [ferramenta/método] a habilidades de [soft skill, ex: comunicação, liderança]. Já participei de projetos voltados a [contexto ou objetivo], colaborando com equipes de diferentes áreas. Busco posição de [cargo alvo], com foco em contribuir para [objetivo] dentro de um ambiente colaborativo.',
  '[X] anos de experiência em [área principal], com passagens por [tipo de empresa/setor] de diferentes portes e culturas organizacionais. Competências centrais incluem [habilidade1], [habilidade2] e [habilidade3], desenvolvidas em contato direto com [tipo de desafio ou cliente]. Motivado a aplicar esse conhecimento como [cargo alvo] em [tipo de empresa/setor desejado], contribuindo desde o primeiro momento.',
  'Profissional orientado a resultados, com histórico de [tipo de conquista, ex: entrega de projetos no prazo, otimização de processos] em [área principal] e [área secundária]. Proficiência em [ferramenta/método1] e [ferramenta/método2], aplicadas em rotinas de trabalho de [contexto]. Almejo a posição de [cargo alvo], levando essa experiência prática para novos desafios profissionais.',
  'Formação em [seu curso], complementada por certificações em [área/especialização] e [área/especialização2] concluídas nos últimos [X] anos. Experiência em [área 1], com ênfase em [habilidade específica] aplicada em [contexto de trabalho ou estudo]. Busco contribuir como [cargo alvo], aplicando conhecimentos técnicos e comportamentais em [objetivo ou setor desejado].'
]

// Agrupados por área para facilitar a exibição de sugestões relevantes no editor.
// Cada bloco mantém o mesmo formato "Categoria: item1, item2, item3".
export const skillTemplates = [
  // Atendimento ao Cliente e Varejo
  'Atendimento: suporte ao cliente, pós-venda, gestão de reclamações',
  'Ferramentas de atendimento: Zendesk, Freshdesk, WhatsApp Business',
  'Vendas no varejo: gestão de estoque, visual merchandising, ponto de venda (PDV)',

  // Tecnologia
  'Linguagens: Python, Java, TypeScript',
  'Frameworks: React.js, Django, FastAPI',
  'Versionamento: Git, GitHub',
  'Bancos de dados: PostgreSQL, MySQL, MongoDB',
  'Cloud e infraestrutura: AWS, Azure, Google Cloud Platform (GCP)',
  'Metodologias: Scrum, Kanban, Extreme Programming (XP)',
  'Testes e qualidade: Jest, Cypress, Selenium, testes unitários',

  // Saúde
  'Técnicas clínicas: aferição de sinais vitais, curativos, administração de medicamentos',
  'Sistemas de saúde: prontuário eletrônico, Sistema Único de Saúde (SUS), telemedicina',
  'Protocolos: biossegurança, controle de infecção, Classificação de Risco de Manchester',
  'Especialidades: cuidados intensivos, pediatria, geriatria, urgência e emergência',

  // Marketing e Vendas
  'Marketing digital: SEO, Google Ads, Meta Ads, e-mail marketing',
  'Ferramentas de marketing: HubSpot, RD Station, Google Analytics, Canva',
  'Vendas: prospecção ativa, negociação, gestão de funil de vendas, CRM (Salesforce, Pipedrive)',
  'Conteúdo: redação publicitária (copywriting), planejamento editorial, gestão de redes sociais',

  // Educação
  'Metodologias de ensino: aprendizagem ativa, sala de aula invertida, ensino híbrido',
  'Ferramentas educacionais: Google Classroom, Moodle, Kahoot',
  'Gestão de sala de aula: planejamento pedagógico, avaliação de aprendizagem, mediação de conflitos',
  'Educação especial: Plano de Ensino Individualizado (PEI), Libras, alfabetização',

  // Administração e Recursos Humanos
  'Gestão de pessoas: recrutamento e seleção, integração de novos colaboradores (onboarding), avaliação de desempenho',
  'Ferramentas de RH: sistemas de folha de pagamento, Gupy, LinkedIn Recruiter',
  'Rotinas administrativas: Excel avançado, elaboração de atas, gestão de contratos',
  'Legislação: Consolidação das Leis do Trabalho (CLT), Normas Regulamentadoras (NRs)',

  // Financeiro e Contábil
  'Ferramentas financeiras: Excel avançado, Enterprise Resource Planning (ERP), Systems, Applications and Products (SAP)',
  'Contabilidade: conciliação bancária, fechamento contábil, Demonstração do Resultado do Exercício (DRE)',
  'Análise financeira: fluxo de caixa, análise de indicadores, orçamento empresarial',
  'Certificações: Excel avançado, Certified Management Accountant (CMA), Chartered Financial Analyst (CFA)',

  // Engenharia
  'Projetos: AutoCAD, SolidWorks, Building Information Modeling (BIM)',
  'Normas técnicas: Associação Brasileira de Normas Técnicas (ABNT), Normas Regulamentadoras (NRs), International Organization for Standardization (ISO) 9001',
  'Gestão de obras/produção: planejamento de cronograma, controle de qualidade, gestão de fornecedores',

  // Direito
  'Áreas de atuação: direito civil, direito trabalhista, direito tributário',
  'Ferramentas jurídicas: elaboração de petições, pesquisa jurisprudencial, Processo Judicial Eletrônico (PJe)',

  // Logística e Operações
  'Gestão de estoque: controle de inventário, Warehouse Management System (WMS), giro de estoque',
  'Logística: roteirização, gestão de frotas, importação e exportação',

  // Genéricos
  'Análise de dados: Excel avançado, Power BI, SQL, Google Analytics',
  'Design e prototipação: Figma, Adobe XD, Canva',
  'Soft skills: comunicação, trabalho em equipe, resolução de problemas, adaptabilidade',
  'Gestão de projetos: planejamento, priorização de backlog, gestão de stakeholders'
]

export const experienceBulletTemplates = [
  // Genéricos
  'Desenvolvi [solução/processo] utilizando [ferramenta/método], resultando em [métrica quantificável].',
  'Liderei a implementação de [projeto/mudança], reduzindo [custo/tempo] em [X]%.',
  'Implementei [processo/ferramenta] que aumentou a eficiência da equipe em [X]%.',
  'Otimizei [processo/rotina existente], reduzindo o tempo de [tarefa] de [valor inicial] para [valor final].',
  'Coordenei equipe de [X] pessoas na execução de [projeto], entregando [resultado] dentro do prazo estipulado.',
  'Automatizei [tarefa/processo manual] com [ferramenta], eliminando [X] horas de trabalho manual por [semana/mês].',
  'Criei [relatório/dashboard] para monitorar [indicador], permitindo decisões mais rápidas sobre [área de negócio].',
  'Reduzi custos operacionais em [X]% ao [ação realizada, ex: renegociar contratos, otimizar processos] na área de [departamento].',
  'Treinei e mentorei [X] novos colaboradores em [processo/ferramenta], acelerando o período de adaptação em [X]%.',
  'Apresentei resultados de [projeto/análise] para [stakeholders/diretoria], influenciando a decisão sobre [ação de negócio].',

  // Tecnologia
  'Liderei a migração de [sistema] para [nova tecnologia], reduzindo [custo/tempo] em [X]%.',
  'Integrei [sistema A] com [sistema B] utilizando [tecnologia/API], melhorando [métrica, ex: tempo de resposta, precisão de dados].',
  'Identifiquei e corrigi [X] bugs críticos em [sistema/aplicação], aumentando a estabilidade em [X]%.',

  // Saúde
  'Realizei atendimento de [X] pacientes por [turno/dia], mantendo taxa de satisfação de [X]%.',
  'Implementei protocolo de [procedimento/segurança do paciente], reduzindo taxa de [incidente/complicação] em [X]%.',
  'Atuei em [setor/especialidade, ex: pronto-socorro, unidade de terapia intensiva] prestando assistência a [X] pacientes por [período].',

  // Marketing e Vendas
  'Planejei e executei campanha de [tipo de campanha] utilizando [ferramenta], gerando [X] leads/vendas em [período].',
  'Aumentei o alcance das redes sociais em [X]% através de [estratégia de conteúdo] ao longo de [período].',
  'Bati meta de vendas em [X]% ao [ação realizada, ex: prospectar novos clientes, negociar contratos], superando meta trimestral.',
  'Gerenciei carteira de [X] clientes, aumentando a taxa de retenção em [X]% através de [estratégia de relacionamento].',

  // Educação
  'Ministrei aulas de [disciplina] para turmas de [X] alunos, elevando o índice de aprovação em [X]%.',
  'Desenvolvi material didático para [disciplina/curso], utilizando [metodologia/ferramenta], melhorando o engajamento dos alunos em [X]%.',
  'Implementei [metodologia de ensino] em sala de aula, resultando em [melhoria mensurável no desempenho dos alunos].',

  // Administração e Recursos Humanos
  'Conduzi processo seletivo para [X] vagas de [cargo], reduzindo o tempo médio de contratação em [X]%.',
  'Implementei programa de [integração/treinamento], reduzindo a rotatividade (turnover) em [X]%.',
  'Organizei [X] processos administrativos/contratos por [período], garantindo conformidade com [norma/legislação].',

  // Financeiro e Contábil
  'Realizei fechamento contábil mensal de [X] empresas/centros de custo, garantindo conformidade com [norma/legislação].',
  'Reduzi inadimplência em [X]% ao implementar [processo de cobrança/análise de crédito].',
  'Elaborei relatórios financeiros mensais para [stakeholders], apoiando decisões sobre [tipo de investimento/orçamento].',

  // Engenharia
  'Supervisionei execução de [obra/projeto], garantindo entrega dentro do prazo e redução de [X]% no orçamento previsto.',
  'Elaborei projeto de [tipo de projeto] utilizando [ferramenta, ex: AutoCAD], atendendo às normas de [órgão regulador].',

  // Atendimento ao Cliente e Varejo
  'Atendi média de [X] clientes por dia, mantendo índice de satisfação (Net Promoter Score - NPS) acima de [X].',
  'Reduzi tempo médio de atendimento em [X]% ao implementar [processo/ferramenta] na central de suporte.',
  'Gerenciei estoque de [tipo de produto], reduzindo perdas/rupturas em [X]% através de [método de controle].',

  // Direito
  'Elaborei [X] petições/contratos por [período] na área de [ramo do direito], com [taxa de êxito/aprovação] de [X]%.',
  'Conduzi [X] audiências/negociações, resultando em [tipo de acordo] favorável em [X]% dos casos.',

  // Logística e Operações
  'Otimizei rotas de entrega utilizando [ferramenta/sistema], reduzindo custo de frete em [X]% e prazo médio em [X]%.',
  'Gerenciei estoque de [X] itens/SKUs, reduzindo divergências de inventário em [X]%.'
]

export const projectBulletTemplates = [
  // Genéricos
  'Implementei [funcionalidade/melhoria] com [ferramenta/método], alcançando [resultado].',
  'Contribuí para o desenvolvimento de [projeto] usando [ferramenta/metodologia], entregando [resultado].',
  'Criei [protótipo/solução] para resolver [problema], utilizando [ferramenta/método].',
  'Participei de [evento/competição, ex: hackathon, feira, olimpíada] desenvolvendo [solução] em equipe de [X] pessoas em [prazo].',

  // Tecnologia
  'Projetei arquitetura de [sistema/aplicação] com [tecnologia], suportando [X] usuários simultâneos.',
  'Desenvolvi API RESTful para [funcionalidade] usando [tecnologia], documentada com [ferramenta, ex: Swagger].',
  'Construí pipeline de dados para [finalidade] com [tecnologia], processando [volume de dados] por [período].',
  'Refatorei código legado de [sistema], reduzindo a complexidade e o tempo de compilação (build) em [X]%.',
  'Desenvolvi testes automatizados para [funcionalidade/sistema], elevando a cobertura de testes para [X]%.',
  'Publiquei [projeto] em [plataforma, ex: GitHub, App Store], recebendo [X] estrelas/downloads/avaliações.',
  'Integrei modelo de [machine learning/inteligência artificial] em [projeto], alcançando [métrica de performance, ex: acurácia de X%].',

  // Saúde
  'Desenvolvi projeto de melhoria assistencial em [área/setor], reduzindo [indicador, ex: tempo de espera] em [X]%.',
  'Participei de campanha de [tipo de campanha, ex: vacinação, prevenção] atendendo [X] pessoas em [período].',
  'Elaborei protocolo de [procedimento clínico] adotado por [setor/instituição], reduzindo [tipo de incidente] em [X]%.',

  // Marketing e Vendas
  'Criei landing page/campanha para [projeto/produto] com [ferramenta], obtendo [X] acessos/leads/conversões.',
  'Desenvolvi plano de marketing para [produto/marca], aumentando o reconhecimento da marca em [X]% no período.',
  'Lancei produto/serviço de [tipo], estruturando estratégia de [canal, ex: mídia paga, parcerias] com resultado de [X] vendas.',

  // Educação
  'Desenvolvi projeto pedagógico sobre [tema], aplicado a [X] alunos, com melhoria de [X]% no desempenho avaliado.',
  'Criei material/curso sobre [tema] utilizando [ferramenta, ex: Google Classroom], alcançando [X] alunos/participantes.',

  // Administração e Recursos Humanos
  'Implementei projeto de [melhoria de processo/clima organizacional], elevando indicador de [satisfação/engajamento] em [X]%.',
  'Estruturei programa de [treinamento/desenvolvimento], capacitando [X] colaboradores em [tema].',

  // Financeiro e Contábil
  'Desenvolvi modelo de [planilha/análise financeira] para [finalidade], utilizando [ferramenta, ex: Excel avançado], reduzindo [X] horas de trabalho manual.',
  'Conduzi projeto de [redução de custos/reestruturação financeira], gerando economia de [X] em [período].',

  // Engenharia
  'Desenvolvi projeto de [tipo de estrutura/sistema] utilizando [ferramenta, ex: AutoCAD, SolidWorks], atendendo especificações de [norma].',
  'Participei de projeto de melhoria de processo produtivo, reduzindo [desperdício/tempo de ciclo] em [X]%.',

  // Atendimento ao Cliente e Varejo
  'Desenvolvi projeto de melhoria no atendimento ao cliente, elevando [Net Promoter Score - NPS/satisfação] em [X] pontos.',
  'Reestruturei layout/visual merchandising de [loja/seção], aumentando conversão de vendas em [X]%.',

  // Direito
  'Conduzi projeto de organização de [processos/contratos jurídicos], reduzindo tempo de consulta em [X]%.',

  // Logística e Operações
  'Desenvolvi projeto de otimização de [rota/estoque/processo logístico], reduzindo custo operacional em [X]%.'
]
