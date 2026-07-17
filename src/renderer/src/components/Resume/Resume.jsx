import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { calculateATSScore } from '../../utils/atsEngine'
import { getSectionTitles } from '../../i18n/resumeLabels'
import {
  ACCENT_PRESETS,
  HEADER_ALIGN_OPTIONS,
  HEADER_WEIGHT_OPTIONS,
  SPACING_OPTIONS,
  DIVIDER_OPTIONS,
  sanitizeDesign,
  designToCSSVars
} from '../../utils/designTokens'
import CustomSelect from '../common/CustomSelect'
import { FaLinkedin } from 'react-icons/fa'
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiMinus,
  FiSquare,
  FiSliders,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGithub,
  FiGlobe,
  FiChevronDown
} from 'react-icons/fi'

const CEFR_LABELS = {
  pt: {
    A1: 'Iniciante',
    A2: 'Básico',
    B1: 'Intermediário',
    B2: 'Intermediário avançado',
    C1: 'Avançado',
    C2: 'Proficiente'
  },
  en: {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficient'
  }
}

function getScoreBand(score) {
  if (score >= 85) return { label: 'Excelente', color: '#38a169', bg: '#f0fff4', border: '#9ae6b4' }
  if (score >= 70) return { label: 'Bom', color: '#2b6cb0', bg: '#ebf8ff', border: '#90cdf4' }
  if (score >= 50) return { label: 'Regular', color: '#d69e2e', bg: '#fffbeb', border: '#f6e05e' }
  return { label: 'Fraco', color: '#e53e3e', bg: '#fff5f5', border: '#fc8181' }
}

// Título de seção clicável: um clique transforma o texto num campo editável
// Permite personalizar cada seção (ex: traduzir "Certificações" para "CERTIFICATIONS" numa vaga internacional) sem precisar de seletor de idioma
function EditableSectionTitle({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft.trim() && draft.trim() !== value) onChange(draft)
    else setDraft(value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="r-section-title r-section-title-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        style={{
          border: 'none',
          borderBottom: '1.5px dashed #a0aec0',
          background: 'transparent',
          font: 'inherit',
          color: 'inherit',
          padding: 0,
          width: '100%',
          outline: 'none'
        }}
      />
    )
  }

  return (
    <h2
      className="r-section-title r-section-title-editable"
      onClick={() => setEditing(true)}
      title="Clique para editar o título desta seção"
    >
      {value}
    </h2>
  )
}

const SECTION_ORDER = [
  'summary',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
  'languages'
]

// Opções do seletor de fonte do documento (fontes padrão, seguras para ATS)
const FONT_OPTIONS = [
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Cambria', label: 'Cambria' },
  { value: 'Georgia', label: 'Georgia' }
]

function isGithubUrl(url) {
  return /(^|\/\/|\.)github\.com/i.test(url || '')
}

function DesignPanel({ design, onChange }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const set = (key, value) => onChange({ ...design, [key]: value })

  return (
    <div className="design-panel-wrap" ref={panelRef}>
      <button
        type="button"
        className="design-trigger"
        onClick={() => setOpen((v) => !v)}
        title="Personalizar aparência (não afeta a compatibilidade com ATS)"
      >
        <FiSliders /> Personalizar
      </button>

      {open && (
        <div className="design-panel">
          <div className="design-row">
            <label>Cor de destaque</label>
            <input
              type="color"
              value={design.accentColor}
              onChange={(e) => set('accentColor', e.target.value)}
            />
            <div className="design-accent-presets">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`design-accent-dot${design.accentColor === p.value ? ' active' : ''}`}
                  style={{ background: p.value }}
                  title={p.label}
                  onClick={() => set('accentColor', p.value)}
                />
              ))}
            </div>
          </div>

          <div className="design-row">
            <label>Alinhamento do cabeçalho</label>
            <select value={design.headerAlign} onChange={(e) => set('headerAlign', e.target.value)}>
              {HEADER_ALIGN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="design-row">
            <label>Peso do nome/cabeçalho</label>
            <select
              value={design.headerWeight}
              onChange={(e) => set('headerWeight', e.target.value)}
            >
              {HEADER_WEIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="design-row">
            <label>Espaçamento entre seções</label>
            <select value={design.spacing} onChange={(e) => set('spacing', e.target.value)}>
              {SPACING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="design-row">
            <label>Linha divisória dos títulos</label>
            <select value={design.divider} onChange={(e) => set('divider', e.target.value)}>
              {DIVIDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <label className="design-checkbox-row">
            <input
              type="checkbox"
              checked={design.showIcons}
              onChange={(e) => set('showIcons', e.target.checked)}
            />
            Ícones ao lado do contato
            <FiAlertTriangle
              size={13}
              title="Alguns sistemas ATS mais antigos podem interpretar ícones como caracteres aleatórios em vez de ignorá-los. No geral, é seguro usar ícones e os sistemas modernos lidam bem com eles."
              style={{ marginLeft: 2, cursor: 'help', color: '#d69e2e' }}
            />
          </label>

          <p className="design-panel-hint">
            Essa personalização é apenas para deixar o documento mais bonito. Não se preocupe, seu
            currículo continuará totalmente compatível com leitura por sistemas automatizados.
          </p>
        </div>
      )}
    </div>
  )
}

const ScoreCircle = memo(function ScoreCircle({ score, band }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 140,
        height: 140,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Ondas — contidas dentro do container de 140px */}
      {[0, 1.3, 2.6].map((delay, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid ${band.color}`,
            opacity: 0,
            animation: `wave-ring 4s ease-out ${delay}s infinite`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Círculo principal */}
      <div
        style={{
          width: 110,
          height: 110,
          flexShrink: 0,
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
  )
})

function Resume({ resumeData, onBack, onUpdate }) {
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
  useEffect(() => {
    onUpdate?.('font', selectedFont)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFont])

  const [design, setDesign] = useState(sanitizeDesign(resumeData.design))
  const updateDesign = (next) => {
    const sanitized = sanitizeDesign(next)
    setDesign(sanitized)
    onUpdate?.('design', sanitized)
  }
  const designVars = useMemo(() => designToCSSVars(design), [design])

  // Títulos de seção editáveis
  const [sectionTitles, setSectionTitles] = useState(getSectionTitles(resumeData.sectionTitles))
  const updateSectionTitle = (key, value) => {
    setSectionTitles((prev) => {
      const next = { ...prev, [key]: value.trim() || prev[key] }
      onUpdate?.('sectionTitles', next)
      return next
    })
  }
  const { score, feedback } = useMemo(() => calculateATSScore(resumeData), [resumeData])
  const [goodExpanded, setGoodExpanded] = useState(false)
  const band = useMemo(() => getScoreBand(score), [score])

  const handleMinimize = () => window.resumeAPI.minimizeWindow()
  const handleMaximize = () => window.resumeAPI.maximizeWindow()
  const handleClose = () => window.resumeAPI.closeWindow()

  const exportPDF = async () => {
    document.activeElement?.blur()
    const result = await window.resumeAPI.exportPDF(resumeData)
    if (!result.success && result.error !== 'Salvamento cancelado')
      alert('Erro ao exportar PDF: ' + result.error)
  }

  const exportDOCX = async () => {
    document.activeElement?.blur()
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      ExternalHyperlink,
      AlignmentType,
      BorderStyle,
      TabStopType,
      convertMillimetersToTwip
    } = await import('docx')
    const { saveAs } = await import('file-saver')

    // Mesmo tamanho de página (A4) e margem (18mm) usados na exportação em PDF
    const PAGE_WIDTH_MM = 210
    const PAGE_HEIGHT_MM = 297
    const PAGE_MARGIN_MM = 18
    const PAGE_WIDTH_TWIP = convertMillimetersToTwip(PAGE_WIDTH_MM)
    const PAGE_HEIGHT_TWIP = convertMillimetersToTwip(PAGE_HEIGHT_MM)
    const PAGE_MARGIN_TWIP = convertMillimetersToTwip(PAGE_MARGIN_MM)
    const CONTENT_WIDTH_TWIP = PAGE_WIDTH_TWIP - PAGE_MARGIN_TWIP * 2
    const RIGHT_DATE_TAB = { tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH_TWIP }] }
    const DARK = (design.accentColor || '#1a1a2e').replace('#', '')
    const MUTED = '4a5568'
    const LIGHT = '718096'
    const LINK = '2b6cb0'
    const HEADER_ALIGNMENT =
      design.headerAlign === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT
    const SECTION_SPACING_BEFORE =
      design.spacing === 'compact' ? 180 : design.spacing === 'relaxed' ? 340 : 260
    const HEADER_BOLD = design.headerWeight !== 'normal'

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
        children: [new TextRun({ text, bold: true, size: 24, color: DARK })],
        spacing: { before: SECTION_SPACING_BEFORE, after: 100 },
        border:
          design.divider === 'none'
            ? undefined
            : { bottom: { color: DARK, size: 6, style: BorderStyle.SINGLE } }
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
        children: [
          new TextRun({ text: personal.name || '', bold: HEADER_BOLD, size: 48, color: DARK })
        ],
        alignment: HEADER_ALIGNMENT,
        spacing: { after: 40 }
      })
    )

    if (clean(personal.title)) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: personal.title, size: 26, color: MUTED })],
          alignment: HEADER_ALIGNMENT,
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
              ? [new TextRun({ text: '   ', size: 20, color: LIGHT })]
              : [])
          ]),
          alignment: HEADER_ALIGNMENT,
          spacing: { after: 120 }
        })
      )
    }

    // Resumo
    const buildSummary = () => {
      if (!clean(summary)) return
      children.push(sectionTitle(sectionTitles.summary.toUpperCase()))
      children.push(
        new Paragraph({
          children: [new TextRun({ text: summary, size: 22, color: MUTED })],
          spacing: { after: 120 }
        })
      )
    }

    // Habilidades
    const buildSkills = () => {
      if (skills.length > 0) {
        children.push(sectionTitle(sectionTitles.skills.toUpperCase()))
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
    }

    // Experiência
    const buildExperience = () => {
      if (experience.length > 0) {
        children.push(sectionTitle(sectionTitles.experience.toUpperCase()))
        experience.forEach((exp) => {
          children.push(
            new Paragraph({
              ...RIGHT_DATE_TAB,
              children: [
                new TextRun({ text: exp.role || '', bold: true, size: 24, color: DARK }),
                ...(clean(exp.company)
                  ? [new TextRun({ text: `  -  ${exp.company}`, size: 22, color: MUTED })]
                  : []),
                new TextRun({
                  text: `\t${exp.start || ''} – ${exp.current ? 'Atual' : exp.end || ''}`,
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
    }

    // Projetos
    const buildProjects = () => {
      if (projects.length > 0) {
        children.push(sectionTitle(sectionTitles.projects.toUpperCase()))
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

          if (hasLink && proj.linkDisplay !== 'hyperlink') {
            children.push(
              new Paragraph({
                children: [link(proj.link, proj.link, { size: 20, color: LIGHT })],
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
    }

    // Formação
    const buildEducation = () => {
      if (education.length > 0) {
        children.push(sectionTitle(sectionTitles.education.toUpperCase()))
        education.forEach((edu) => {
          const degree = clean(edu.degree)
          const field = clean(edu.field)
          // Só usa o conector "em" quando grau E curso existem; caso contrário, mostra apenas o que foi preenchido (corrige o bug "em [curso]" sem o grau)
          const degreeField = degree && field ? `${degree} em ${field}` : degree || field || ''

          children.push(
            new Paragraph({
              ...RIGHT_DATE_TAB,
              children: [
                new TextRun({ text: degreeField, bold: true, size: 24, color: DARK }),
                ...(clean(edu.institution)
                  ? [new TextRun({ text: `  -  ${edu.institution}`, size: 22, color: MUTED })]
                  : []),
                new TextRun({
                  text: `\t${edu.start || ''} – ${edu.current ? 'Cursando' : edu.end || ''}`,
                  size: 20,
                  color: LIGHT
                })
              ],
              spacing: { after: 80 }
            })
          )
        })
      }
    }

    // Certificações
    const buildCertifications = () => {
      if (certifications.length > 0) {
        children.push(sectionTitle(sectionTitles.certifications.toUpperCase()))
        certifications.forEach((cert) => {
          const hasLink = clean(cert.link)
          const nameAsLink = hasLink && cert.linkDisplay === 'hyperlink'

          children.push(
            new Paragraph({
              ...RIGHT_DATE_TAB,
              children: [
                nameAsLink
                  ? link(cert.name || '', cert.link, { size: 24, color: DARK })
                  : new TextRun({ text: cert.name || '', bold: true, size: 24, color: DARK }),
                ...(clean(cert.issuer)
                  ? [new TextRun({ text: `  -  ${cert.issuer}`, size: 22, color: MUTED })]
                  : []),
                ...(clean(cert.date)
                  ? [new TextRun({ text: `\t${cert.date}`, size: 20, color: LIGHT })]
                  : [])
              ],
              spacing: { after: hasLink && !nameAsLink ? 40 : 60 }
            })
          )

          if (hasLink && !nameAsLink) {
            children.push(
              new Paragraph({
                children: [link(cert.link, cert.link, { size: 20, color: LIGHT })],
                spacing: { after: 60 }
              })
            )
          }
        })
      }
    }

    // Idiomas
    const buildLanguages = () => {
      if (languages.length > 0) {
        children.push(sectionTitle(sectionTitles.languages.toUpperCase()))
        const displayLang = resumeData.languageDisplay || 'pt'
        const cefrMap = CEFR_LABELS[displayLang] || CEFR_LABELS.pt
        languages.forEach((l) => {
          const desc = cefrMap[l.level] || l.level
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${l.language} — ${desc} (${l.level} CEFR)`,
                  size: 22,
                  color: MUTED
                })
              ],
              spacing: { after: 60 }
            })
          )
        })
      }
    }

    const sectionBuilders = {
      summary: buildSummary,
      skills: buildSkills,
      experience: buildExperience,
      projects: buildProjects,
      education: buildEducation,
      certifications: buildCertifications,
      languages: buildLanguages
    }
    SECTION_ORDER.forEach((key) => sectionBuilders[key]?.())

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
              size: { width: PAGE_WIDTH_TWIP, height: PAGE_HEIGHT_TWIP },
              margin: {
                top: PAGE_MARGIN_TWIP,
                bottom: PAGE_MARGIN_TWIP,
                left: PAGE_MARGIN_TWIP,
                right: PAGE_MARGIN_TWIP
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

  const displayLang = resumeData.languageDisplay || 'pt'
  const cefrMap = displayLang === 'en' ? CEFR_LABELS.en : CEFR_LABELS.pt

  return (
    <div className="resume-page">
      {/* Toolbar */}
      <div className="resume-toolbar">
        <button className="btn-secondary" onClick={onBack}>
          <FiArrowLeft /> Voltar e editar
        </button>
        <div className="toolbar-actions">
          <div className="font-selector">
            <label>Fonte:</label>
            <CustomSelect
              triggerClassName="toolbar"
              value={selectedFont}
              onChange={setSelectedFont}
              options={FONT_OPTIONS}
            />
          </div>
          <DesignPanel design={design} onChange={updateDesign} />
          <div className="export-buttons">
            <button className="btn-export" onClick={exportPDF}>
              <FiDownload /> Exportar PDF
            </button>
            <button className="btn-export" onClick={exportDOCX}>
              <FiFileText /> Exportar DOCX
            </button>
          </div>
        </div>

        <div className="window-controls">
          <button onClick={handleMinimize} className="window-btn" title="Minimizar">
            <FiMinus size={14} />
          </button>
          <button onClick={handleMaximize} className="window-btn" title="Maximizar/Restaurar">
            <FiSquare size={12} />
          </button>
          <button onClick={handleClose} className="window-btn window-close" title="Fechar">
            <FiX size={14} />
          </button>
        </div>
      </div>

      {/* Corpo: coluna do score à esquerda (fixa) + currículo à direita (rolável) */}
      <div className="resume-layout">
        <aside className="resume-score-col">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 20px',
              gap: 10
            }}
          >
            <ScoreCircle score={score} band={band} />

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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  textAlign: 'center',
                  fontWeight: 600
                }}
              >
                Compatibilidade estimada com sistemas ATS
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  textAlign: 'center',
                  maxWidth: 300,
                  lineHeight: 1.4
                }}
              >
                O Guicu já formatou e estruturou seu currículo da forma correta. Em relação ao
                conteúdo, a compatibilidade estimada com sistemas ATS é a pontuação mostrada no
                círculo — para melhorá-la, siga as orientações da seção abaixo.
              </span>
            </div>

            {/* Análise — sempre visível, ancorada na própria coluna */}
            <div className="ats-analysis-inline">
              {feedback.warnings.length > 0 && (
                <div>
                  <div className="ats-analysis-heading">
                    <FiAlertTriangle size={13} color="#d69e2e" />
                    <span style={{ color: '#744210' }}>Atenção ({feedback.warnings.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {feedback.warnings.map((item, i) => (
                      <div key={i} className="ats-item">
                        <span className="ats-item-dot ats-item-dot--warn" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedback.suggestions.length > 0 && (
                <div>
                  <div className="ats-analysis-heading">
                    <FiInfo size={13} color="#3182ce" />
                    <span style={{ color: '#2c5282' }}>
                      Sugestões ({feedback.suggestions.length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {feedback.suggestions.map((item, i) => (
                      <div key={i} className="ats-item">
                        <span className="ats-item-dot ats-item-dot--suggest" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedback.good.length > 0 && (
                <div>
                  <button
                    type="button"
                    className="ats-analysis-heading ats-analysis-heading--toggle"
                    onClick={() => setGoodExpanded((v) => !v)}
                  >
                    <FiCheckCircle size={13} color="#38a169" />
                    <span style={{ color: '#276749' }}>
                      Pontos positivos ({feedback.good.length})
                    </span>
                    <FiChevronDown
                      size={13}
                      style={{
                        marginLeft: 'auto',
                        transition: 'transform 0.15s',
                        transform: goodExpanded ? 'rotate(180deg)' : 'none',
                        color: '#276749'
                      }}
                    />
                  </button>
                  {goodExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {feedback.good.map((item, i) => (
                        <div key={i} className="ats-item">
                          <span className="ats-item-dot ats-item-dot--good" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Documento do currículo */}
        <div className="resume-wrapper">
          <div
            className="resume-doc"
            id="resume-print"
            style={{ fontFamily: selectedFont, ...designVars }}
          >
            <div className="r-header" data-align={design.headerAlign}>
              <h1>{personal.name || 'Seu Nome'}</h1>
              {personal.title && <p className="r-title">{personal.title}</p>}
              <div className="r-contacts">
                {personal.location && (
                  <span>
                    {design.showIcons && <FiMapPin className="r-icon" size={11} />}
                    {personal.location}
                  </span>
                )}
                {personal.phone && (
                  <span>
                    {design.showIcons && <FiPhone className="r-icon" size={11} />}
                    {personal.phone}
                  </span>
                )}
                {personal.email && (
                  <a
                    href={`mailto:${personal.email}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {design.showIcons && <FiMail className="r-icon" size={11} />}
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
                    {design.showIcons && <FaLinkedin className="r-icon" size={12} />}
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
                    {design.showIcons &&
                      (isGithubUrl(personal.github) ? (
                        <FiGithub className="r-icon" size={11} />
                      ) : (
                        <FiGlobe className="r-icon" size={11} />
                      ))}
                    {personal.github}
                  </a>
                )}
              </div>
            </div>

            {SECTION_ORDER.map((key) => {
              if (key === 'summary' && summary) {
                return (
                  <div className="r-section" key="summary">
                    <EditableSectionTitle
                      value={sectionTitles.summary}
                      onChange={(v) => updateSectionTitle('summary', v)}
                    />
                    <p className="r-desc">{summary}</p>
                  </div>
                )
              }

              if (key === 'skills' && skills.length > 0) {
                return (
                  <div className="r-section" key="skills">
                    <EditableSectionTitle
                      value={sectionTitles.skills}
                      onChange={(v) => updateSectionTitle('skills', v)}
                    />
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
                          {cat && <span className="r-skills-category">{cat}:</span>}{' '}
                          {items.join(', ')}
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
                )
              }

              if (key === 'experience' && experience.length > 0) {
                return (
                  <div className="r-section" key="experience">
                    <EditableSectionTitle
                      value={sectionTitles.experience}
                      onChange={(v) => updateSectionTitle('experience', v)}
                    />
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
                )
              }

              if (key === 'projects' && projects.length > 0) {
                return (
                  <div className="r-section" key="projects">
                    <EditableSectionTitle
                      value={sectionTitles.projects}
                      onChange={(v) => updateSectionTitle('projects', v)}
                    />
                    {projects.map((proj, i) => (
                      <div key={i} className="r-item">
                        <div
                          className="r-item-header"
                          style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              flexWrap: 'wrap',
                              alignItems: 'baseline'
                            }}
                          >
                            {proj.link && proj.linkDisplay === 'hyperlink' ? (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="r-item-title"
                                style={{ borderBottom: '1px solid var(--r-accent)' }}
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
                )
              }

              if (key === 'education' && education.length > 0) {
                return (
                  <div className="r-section" key="education">
                    <EditableSectionTitle
                      value={sectionTitles.education}
                      onChange={(v) => updateSectionTitle('education', v)}
                    />
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
                )
              }

              if (key === 'certifications' && certifications.length > 0) {
                return (
                  <div className="r-section" key="certifications">
                    <EditableSectionTitle
                      value={sectionTitles.certifications}
                      onChange={(v) => updateSectionTitle('certifications', v)}
                    />
                    {certifications.map((cert, i) => (
                      <div key={i} className="r-item">
                        <div className="r-item-header">
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              flexWrap: 'wrap',
                              gap: 4
                            }}
                          >
                            {cert.link && cert.linkDisplay === 'hyperlink' ? (
                              <a
                                href={cert.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="r-item-title"
                                style={{ borderBottom: '1px solid var(--r-accent)' }}
                              >
                                {cert.name}
                              </a>
                            ) : (
                              <span className="r-item-title">{cert.name}</span>
                            )}
                            {cert.issuer && (
                              <span style={{ color: '#4a5568', fontSize: 11 }}>
                                | {cert.issuer}
                              </span>
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
                )
              }

              if (key === 'languages' && languages.length > 0) {
                return (
                  <div className="r-section" key="languages">
                    <EditableSectionTitle
                      value={sectionTitles.languages}
                      onChange={(v) => updateSectionTitle('languages', v)}
                    />
                    <div>
                      {languages.map((l, i) => (
                        <div key={i} className="r-skills-items">
                          {l.language} — {cefrMap[l.level] || l.level} ({l.level} CEFR)
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      </div>
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
