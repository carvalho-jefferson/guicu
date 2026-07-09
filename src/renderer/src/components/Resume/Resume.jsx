import { useState, useEffect, useRef, useMemo } from 'react'
import { calculateATSScore } from '../../utils/atsEngine'
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiBarChart2,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi'

function getScoreBand(score) {
  if (score >= 85) return { label: 'Excelente', color: '#38a169', bg: '#f0fff4', border: '#9ae6b4' }
  if (score >= 70) return { label: 'Bom', color: '#2b6cb0', bg: '#ebf8ff', border: '#90cdf4' }
  if (score >= 50) return { label: 'Regular', color: '#d69e2e', bg: '#fffbeb', border: '#f6e05e' }
  return { label: 'Fraco', color: '#e53e3e', bg: '#fff5f5', border: '#fc8181' }
}

function Resume({ resumeData, onBack }) {
  const {
    personal,
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    languages,
    font
  } = resumeData
  const [selectedFont, setSelectedFont] = useState(font || 'Calibri')
  const { score, feedback } = useMemo(() => calculateATSScore(resumeData), [resumeData])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const wrapperRef = useRef(null)
  const band = getScoreBand(score)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const handleScroll = () => setScrolled(el.scrollTop > 30)
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  const exportPDF = async () => {
    const result = await window.resumeAPI.exportPDF(resumeData)
    if (!result.success && result.error !== 'Salvamento cancelado')
      alert('Erro ao exportar PDF: ' + result.error)
  }

  const exportDOCX = async () => {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      ExternalHyperlink,
      HeadingLevel,
      AlignmentType,
      BorderStyle,
      convertInchesToTwip
    } = await import('docx')
    const { saveAs } = await import('file-saver')

    const DARK = '1a1a2e'
    const MUTED = '4a5568'
    const LIGHT = '718096'
    const LINK = '2b6cb0'

    // Remove espaços nas pontas de forma segura
    const clean = (v) => (typeof v === 'string' ? v.trim() : v)

    // Garante que links funcionem como hyperlink mesmo sem "https://" na frente
    const withProtocol = (url) => {
      const u = clean(url || '')
      if (!u) return ''
      return /^https?:\/\//i.test(u) || /^mailto:/i.test(u) ? u : `https://${u}`
    }

    const sectionTitle = (text) =>
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 100 },
        border: { bottom: { color: DARK, size: 6, style: BorderStyle.SINGLE } }
      })

    const bullet = (text) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text, size: 22, color: MUTED })],
        spacing: { after: 40 }
      })

    // Cria um TextRun clicável (hyperlink real do Word)
    const link = (text, url, opts = {}) =>
      new ExternalHyperlink({
        link: withProtocol(url),
        children: [
          new TextRun({
            text,
            size: opts.size || 22,
            color: opts.color || LINK,
            underline: {}
          })
        ]
      })

    const children = []

    // Cabeçalho
    children.push(
      new Paragraph({
        children: [new TextRun({ text: personal.name || '', bold: true, size: 48, color: DARK })],
        alignment: AlignmentType.LEFT,
        spacing: { after: 40 }
      })
    )

    if (clean(personal.title)) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: personal.title, size: 26, color: MUTED })],
          spacing: { after: 60 }
        })
      )
    }

    // Linha de contatos: email, linkedin e github com hyperlinks reais
    const contacts = [
      personal.location && { text: personal.location },
      personal.phone && { text: personal.phone },
      personal.email && { text: personal.email, url: `mailto:${personal.email}` },
      personal.linkedin && { text: personal.linkedin, url: personal.linkedin },
      personal.github && { text: personal.github, url: personal.github }
    ].filter(Boolean)

    if (contacts.length > 0) {
      children.push(
        new Paragraph({
          children: contacts.flatMap((c, i) => [
            c.url
              ? link(c.text, c.url, { size: 20, color: LIGHT })
              : new TextRun({ text: c.text, size: 20, color: LIGHT }),
            ...(i < contacts.length - 1
              ? [new TextRun({ text: '   |   ', size: 20, color: LIGHT })]
              : [])
          ]),
          spacing: { after: 120 }
        })
      )
    }

    // Resumo
    if (clean(summary)) {
      children.push(sectionTitle('RESUMO PROFISSIONAL'))
      children.push(
        new Paragraph({
          children: [new TextRun({ text: summary, size: 22, color: MUTED })],
          spacing: { after: 120 }
        })
      )
    }

    // Habilidades
    if (skills.length > 0) {
      children.push(sectionTitle('HABILIDADES TÉCNICAS'))
      const grouped = skills.reduce((acc, s) => {
        const cat = (typeof s === 'string' ? '' : s.category) || 'Geral'
        const n = typeof s === 'string' ? s : s.name
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(n)
        return acc
      }, {})
      Object.entries(grouped).forEach(([cat, items]) => {
        children.push(
          new Paragraph({
            children: [
              ...(cat !== 'Geral'
                ? [new TextRun({ text: `${cat}: `, bold: true, size: 22, color: '2d3748' })]
                : []),
              new TextRun({ text: items.join(', '), size: 22, color: MUTED })
            ],
            spacing: { after: 60 }
          })
        )
      })
    }

    // Experiência
    if (experience.length > 0) {
      children.push(sectionTitle('EXPERIÊNCIA PROFISSIONAL'))
      experience.forEach((exp) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.role || '', bold: true, size: 24, color: DARK }),
              ...(clean(exp.company)
                ? [new TextRun({ text: `  -  ${exp.company}`, size: 22, color: MUTED })]
                : []),
              new TextRun({
                text: `   ${exp.start || ''} – ${exp.current ? 'Atual' : exp.end || ''}`,
                size: 20,
                color: LIGHT
              })
            ],
            spacing: { after: 60 }
          })
        )
        if (exp.bullets?.length > 0) exp.bullets.forEach((b) => children.push(bullet(b)))
        else if (clean(exp.description))
          children.push(
            new Paragraph({
              children: [new TextRun({ text: exp.description, size: 22, color: MUTED })],
              spacing: { after: 80 }
            })
          )
        children.push(new Paragraph({ text: '', spacing: { after: 60 } }))
      })
    }

    // Projetos
    if (projects.length > 0) {
      children.push(sectionTitle('PROJETOS'))
      projects.forEach((proj) => {
        const hasLink = clean(proj.link)
        const nameAsLink = hasLink && proj.linkDisplay === 'hyperlink'

        children.push(
          new Paragraph({
            children: [
              nameAsLink
                ? link(proj.name || '', proj.link, { size: 24, color: DARK })
                : new TextRun({ text: proj.name || '', bold: true, size: 24, color: DARK }),
              ...(clean(proj.tech)
                ? [new TextRun({ text: `  -  ${proj.tech}`, size: 20, color: LIGHT })]
                : [])
            ],
            spacing: { after: 40 }
          })
        )

        // Link exibido como linha própria (quando não está embutido no título)
        if (hasLink && proj.linkDisplay !== 'hyperlink') {
          children.push(
            new Paragraph({
              children: [link(proj.link, proj.link, { size: 20, color: LINK })],
              spacing: { after: 60 }
            })
          )
        }

        if (proj.bullets?.length > 0) proj.bullets.forEach((b) => children.push(bullet(b)))
        else if (clean(proj.description))
          children.push(
            new Paragraph({
              children: [new TextRun({ text: proj.description, size: 22, color: MUTED })],
              spacing: { after: 40 }
            })
          )
        children.push(new Paragraph({ text: '', spacing: { after: 40 } }))
      })
    }

    // Formação
    if (education.length > 0) {
      children.push(sectionTitle('FORMAÇÃO ACADÊMICA'))
      education.forEach((edu) => {
        const degree = clean(edu.degree)
        const field = clean(edu.field)
        // Só usa o conector "em" quando grau E curso existem; caso contrário, mostra apenas o que foi preenchido (corrige o bug "em [curso]" sem o grau)
        const degreeField = degree && field ? `${degree} em ${field}` : degree || field || ''

        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: degreeField, bold: true, size: 24, color: DARK }),
              ...(clean(edu.institution)
                ? [new TextRun({ text: `  -  ${edu.institution}`, size: 22, color: MUTED })]
                : []),
              new TextRun({
                text: `   ${edu.start || ''} – ${edu.current ? 'Cursando' : edu.end || ''}`,
                size: 20,
                color: LIGHT
              })
            ],
            spacing: { after: 80 }
          })
        )
      })
    }

    // Certificações
    if (certifications.length > 0) {
      children.push(sectionTitle('CURSOS E CERTIFICAÇÕES'))
      certifications.forEach((cert) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name || '', bold: true, size: 24, color: DARK }),
              ...(clean(cert.issuer)
                ? [new TextRun({ text: `  -  ${cert.issuer}`, size: 22, color: MUTED })]
                : []),
              ...(clean(cert.date)
                ? [new TextRun({ text: `  (${cert.date})`, size: 20, color: LIGHT })]
                : [])
            ],
            spacing: { after: 60 }
          })
        )
      })
    }

    // Idiomas
    if (languages.length > 0) {
      children.push(sectionTitle('IDIOMAS'))
      children.push(
        new Paragraph({
          children: languages.map(
            (l, i) =>
              new TextRun({
                text:
                  i < languages.length - 1
                    ? `${l.language} (${l.level})  |  `
                    : `${l.language} (${l.level})`,
                size: 22,
                color: MUTED
              })
          ),
          spacing: { after: 80 }
        })
      )
    }

    const doc = new Document({
      creator: 'Guicu',
      title: personal.name || 'Currículo',
      description: 'Currículo otimizado para ATS',
      styles: {
        default: {
          document: {
            run: { font: selectedFont || 'Calibri', size: 22, color: '2d3748' },
            paragraph: { spacing: { line: 276 } }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
                right: convertInchesToTwip(1)
              }
            }
          },
          children
        }
      ]
    })

    const blob = await Packer.toBlob(doc)
    const fileName = `${(personal.name || 'curriculo').replace(/\s+/g, '_')}.docx`
    saveAs(blob, fileName)
  }

  const groupedSkills = skills.reduce((acc, s) => {
    const cat = (typeof s === 'string' ? '' : s.category) || ''
    const n = typeof s === 'string' ? s : s.name
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(n)
    return acc
  }, {})
  const hasCategories = skills.some(
    (s) => typeof s === 'object' && s.category && s.category.trim() !== ''
  )

  return (
    <div className="resume-page">
      {/* Toolbar */}
      <div className="resume-toolbar">
        <button
          className="btn-secondary"
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <FiArrowLeft /> Voltar e editar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--muted)' }}>Fonte:</label>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1.5px solid var(--border)',
              fontSize: 13,
              background: 'var(--surface)',
              color: 'var(--text)'
            }}
          >
            <option value="Calibri">Calibri</option>
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Cambria">Cambria</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
        <div className="export-buttons">
          <button className="btn-export" onClick={exportPDF}>
            <FiDownload /> Exportar PDF
          </button>
          <button className="btn-export" onClick={exportDOCX}>
            <FiFileText /> Exportar DOCX
          </button>
        </div>
      </div>

      {/* Score card (fixo no topo ao rolar, expandido antes de rolar) */}
      <div style={{ flexShrink: 0 }}>
        {/* Versão expandida — só visível antes de rolar */}
        {!scrolled && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 0 18px',
              gap: 10
            }}
          >
            {/* Círculo + ondas contidas em overflow:hidden */}
            <div
              style={{
                position: 'relative',
                width: 140,
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Ondas — contidas dentro do container de 140px */}
              {[0, 0.7, 1.4].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: `2px solid ${band.color}`,
                    opacity: 0,
                    animation: `wave-ring 2.2s ease-out ${delay}s infinite`,
                    pointerEvents: 'none'
                  }}
                />
              ))}

              {/* Círculo principal */}
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  border: `6px solid ${band.color}`,
                  background: band.bg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: `0 0 20px ${band.color}44`
                }}
              >
                <span style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: band.color }}>
                  {score}
                </span>
              </div>
            </div>

            {/* Emblema de classificação */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: band.color,
                background: band.bg,
                border: `1.5px solid ${band.border}`,
                borderRadius: 20,
                padding: '4px 16px'
              }}
            >
              {band.label}
            </span>

            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Compatibilidade estimada com sistemas ATS
            </span>

            <button
              onClick={() => setShowAnalysis(true)}
              className="btn-analysis"
              style={{ marginTop: 2 }}
            >
              <FiBarChart2 style={{ marginRight: 6 }} /> Ver análise completa
            </button>
          </div>
        )}

        {/* Versão sticky (fixada) — só visível ao rolar */}
        {scrolled && (
          <div
            style={{
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            {/* Círculo compacto — mesma cor do expandido */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `4px solid ${band.color}`,
                background: band.bg,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 10px ${band.color}33`
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, color: band.color }}>
                {score}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
                Score ATS
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: band.color }}>{band.label}</span>
            </div>

            <button onClick={() => setShowAnalysis(true)} className="btn-analysis compact">
              <FiBarChart2 style={{ marginRight: 6 }} /> Ver análise
            </button>
          </div>
        )}
      </div>

      {/* Documento do currículo */}
      <div className="resume-wrapper" ref={wrapperRef}>
        <div className="resume-doc" id="resume-print" style={{ fontFamily: selectedFont }}>
          <div className="r-header">
            <h1>{personal.name || 'Seu Nome'}</h1>
            {personal.title && <p className="r-title">{personal.title}</p>}
            <div className="r-contacts">
              {personal.location && <span>{personal.location}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.email && (
                <a
                  href={`mailto:${personal.email}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {personal.email}
                </a>
              )}
              {personal.linkedin && (
                <a
                  href={
                    personal.linkedin.startsWith('http')
                      ? personal.linkedin
                      : `https://${personal.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {personal.linkedin}
                </a>
              )}
              {personal.github && (
                <a
                  href={
                    personal.github.startsWith('http')
                      ? personal.github
                      : `https://${personal.github}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {personal.github}
                </a>
              )}
            </div>
          </div>

          {summary && (
            <div className="r-section">
              <h2 className="r-section-title">Resumo Profissional</h2>
              <p className="r-desc">{summary}</p>
            </div>
          )}

          {skills.length > 0 && (
            <div className="r-section">
              <h2 className="r-section-title">Habilidades Técnicas</h2>
              {hasCategories ? (
                Object.entries(groupedSkills).map(([cat, items]) => (
                  <p
                    key={cat}
                    style={{
                      margin: '0 0 2px 0',
                      fontSize: 12,
                      color: '#4a5568',
                      lineHeight: 1.5
                    }}
                  >
                    {cat && <span className="r-skills-category">{cat}:</span>} {items.join(', ')}
                  </p>
                ))
              ) : (
                <div className="r-skills-plain">
                  {skills.map((s, i) => (
                    <span key={i} className="r-skill">
                      {typeof s === 'string' ? s : s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {experience.length > 0 && (
            <div className="r-section">
              <h2 className="r-section-title">Experiência Profissional</h2>
              {experience.map((exp, i) => (
                <div key={i} className="r-item">
                  <div className="r-item-header">
                    <strong className="r-item-title">{exp.role}</strong>
                    <span className="r-date">
                      {exp.start} – {exp.current ? 'Atual' : exp.end}
                    </span>
                  </div>
                  <div className="r-company">{exp.company}</div>
                  {exp.bullets?.length > 0 ? (
                    <ul className="r-bullets">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  ) : exp.description ? (
                    <p className="r-desc">{exp.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="r-section">
              <h2 className="r-section-title">Projetos</h2>
              {projects.map((proj, i) => (
                <div key={i} className="r-item">
                  <div
                    className="r-item-header"
                    style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}
                  >
                    <span
                      style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'baseline' }}
                    >
                      {proj.link && proj.linkDisplay === 'hyperlink' ? (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="r-item-title"
                          style={{ borderBottom: '1px solid #1a1a2e' }}
                        >
                          {proj.name}
                        </a>
                      ) : (
                        <span className="r-item-title">{proj.name}</span>
                      )}
                      {proj.tech && <span className="r-tech-inline">| {proj.tech}</span>}
                    </span>
                  </div>
                  {proj.link && proj.linkDisplay === 'below' && (
                    <div className="r-link">
                      <a href={proj.link} target="_blank" rel="noopener noreferrer">
                        {proj.link}
                      </a>
                    </div>
                  )}
                  {proj.bullets?.length > 0 ? (
                    <ul className="r-bullets">
                      {proj.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  ) : proj.description ? (
                    <p className="r-desc">{proj.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div className="r-section">
              <h2 className="r-section-title">Formação Acadêmica</h2>
              {education.map((edu, i) => (
                <div key={i} className="r-item">
                  <div className="r-item-header">
                    <strong className="r-item-title">
                      {' '}
                      {edu.degree && edu.field && `${edu.degree} em ${edu.field}`}
                      {edu.degree && !edu.field && edu.degree}
                      {!edu.degree && edu.field && edu.field}
                      {!edu.degree && !edu.field && edu.institution}
                    </strong>
                    <span className="r-date">
                      {edu.start} – {edu.current ? 'Cursando' : edu.end}
                    </span>
                  </div>
                  {(edu.degree || edu.field) && edu.institution && (
                    <div className="r-company">{edu.institution}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div className="r-section">
              <h2 className="r-section-title">Cursos e Certificações</h2>
              {certifications.map((cert, i) => (
                <div key={i} className="r-item">
                  <div className="r-item-header">
                    <div
                      style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 4 }}
                    >
                      {cert.link && cert.linkDisplay === 'hyperlink' ? (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="r-item-title"
                          style={{ borderBottom: '1px solid #1a1a2e' }}
                        >
                          {cert.name}
                        </a>
                      ) : (
                        <span className="r-item-title">{cert.name}</span>
                      )}
                      {cert.issuer && (
                        <span style={{ color: '#4a5568', fontSize: 11 }}>| {cert.issuer}</span>
                      )}
                    </div>
                    {cert.date && <span className="r-date">{cert.date}</span>}
                  </div>
                  {cert.link && cert.linkDisplay === 'below' && (
                    <div className="r-link">
                      <a href={cert.link} target="_blank" rel="noopener noreferrer">
                        {cert.link}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {languages.length > 0 && (
            <div className="r-section">
              <h2 className="r-section-title">Idiomas</h2>
              <div className="r-skills-plain">
                {languages.map((l, i) => (
                  <span key={i} className="r-skill">
                    {l.language} - {l.level}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de análise */}
      {showAnalysis && (
        <div
          onClick={() => setShowAnalysis(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              width: '90%',
              maxWidth: 500,
              maxHeight: '88vh',
              overflowY: 'auto',
              boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Cabeçalho sticky */}
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                position: 'sticky',
                top: 0,
                background: 'var(--surface)',
                borderRadius: '16px 16px 0 0',
                zIndex: 1
              }}
            >
              {/* Score circle */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  border: `4px solid ${band.color}`,
                  background: band.bg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 14px ${band.color}44`
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: band.color }}>
                  {score}
                </span>
                <span style={{ fontSize: 10, color: band.color, opacity: 0.7 }}>/100</span>
              </div>

              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                  Análise ATS
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: band.color,
                      background: band.bg,
                      border: `1px solid ${band.border}`,
                      borderRadius: 12,
                      padding: '2px 10px'
                    }}
                  >
                    {band.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {feedback.good.length} positivos ·{' '}
                    {feedback.warnings.length + feedback.suggestions.length} melhorias
                  </span>
                </div>
              </div>

              {/* Botão de fechar */}
              <button
                onClick={() => setShowAnalysis(false)}
                style={{
                  background: 'var(--surface2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  flexShrink: 0
                }}
              >
                <FiX size={15} />
              </button>
            </div>

            {/* Corpo */}
            <div
              style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              {feedback.warnings.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <FiAlertTriangle size={14} color="#d69e2e" />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#744210',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Atenção ({feedback.warnings.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {feedback.warnings.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 13,
                          color: '#744210',
                          background: '#fffbeb',
                          border: '1px solid #f6e05e',
                          padding: '7px 11px',
                          borderRadius: 8,
                          lineHeight: 1.45
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <FiInfo size={14} color="#3182ce" />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#2c5282',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Sugestões ({feedback.suggestions.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {feedback.suggestions.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 13,
                          color: '#2c5282',
                          background: '#ebf8ff',
                          border: '1px solid #90cdf4',
                          padding: '7px 11px',
                          borderRadius: 8,
                          lineHeight: 1.45
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedback.good.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                    <FiCheckCircle size={14} color="#38a169" />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#276749',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Pontos positivos ({feedback.good.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {feedback.good.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 13,
                          color: '#276749',
                          background: '#f0fff4',
                          border: '1px solid #9ae6b4',
                          padding: '7px 11px',
                          borderRadius: 8,
                          lineHeight: 1.45
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border)',
                position: 'sticky',
                bottom: 0,
                background: 'var(--surface)',
                borderRadius: '0 0 16px 16px'
              }}
            >
              <button
                onClick={onBack}
                style={{
                  width: '100%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Editar currículo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
      <style>{`
        @keyframes wave-ring {
          0%   { transform: scale(0.78); opacity: 0.55; }
          70%  { transform: scale(1);    opacity: 0;    }
          100% { transform: scale(1);    opacity: 0;    }
        }
      `}</style>
    </div>
  )
}

export default Resume
