// Toda opção exposta aqui precisa continuar 100% segura para leitura por sistemas ATS (coluna única, sem tabelas, sem texto embutido em imagem).

export const DEFAULT_DESIGN = {
  accentColor: '#1a1a2e', // livre: cor não é lida pelo parser, só ignorada
  headerAlign: 'left', // guardrail: 'left' | 'center'
  headerWeight: 'bold', // guardrail: 'normal' | 'bold'
  spacing: 'normal', // guardrail: 'compact' | 'normal'
  divider: 'line', // guardrail: 'line' | 'none'
  showIcons: false, // ícones decorativos ao lado do contato (desligado por padrão)
  pageMargin: 'normal'
}

// Atalho visual de paleta de cores de destaque
export const ACCENT_PRESETS = [
  { label: 'Grafite', value: '#1a1a2e' },
  { label: 'Azul petróleo', value: '#1e3a5f' },
  { label: 'Verde-escuro', value: '#1f4d3a' },
  { label: 'Vinho', value: '#5f1e2e' },
  { label: 'Roxo-escuro', value: '#3a1e5f' },
  { label: 'Preto puro', value: '#111111' }
]

export const HEADER_ALIGN_OPTIONS = [
  { label: 'Esquerda', value: 'left' },
  { label: 'Centralizado', value: 'center' }
]

export const HEADER_WEIGHT_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Negrito', value: 'bold' }
]

export const SPACING_OPTIONS = [
  { label: 'Compacto', value: 'compact' },
  { label: 'Normal', value: 'normal' }
]

export const DIVIDER_OPTIONS = [
  { label: 'Linha', value: 'line' },
  { label: 'Sem linha', value: 'none' }
]

const SPACING_SCALE = {
  compact: { section: '9px', item: '6px', lineHeight: '1.3' },
  normal: { section: '14px', item: '10px', lineHeight: '1.4' }
}

const WEIGHT_SCALE = {
  normal: '400',
  bold: '700'
}

export const PAGE_MARGIN_OPTIONS = [
  { label: 'Normal (18mm)', value: 'normal' },
  { label: 'Estreita (12mm)', value: 'narrow' }
]

// Trava de legibilidade da cor de destaque
// Sem essa trava, o usuário poderia escolher um tom claro demais que ficaria ilegível pra um ser humano. Usa a fórmula de contraste do WCAG 2.1 e escurece a cor (mantendo o matiz) até atingir pelo menos a razão de contraste recomendada para texto pequeno (4.5:1) contra fundo branco.

const MIN_CONTRAST_ON_WHITE = 4.5

function hexToRgb(hex) {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(h.slice(0, 6), 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function rgbToHex({ r, g, b }) {
  const toHex = (v) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function rgbToHsl({ r, g, b }) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h, s, l }
}

function hslToRgb({ h, s, l }) {
  if (s === 0) {
    const v = l * 255
    return { r: v, g: v, b: v }
  }
  const hue2rgb = (p, q, t) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255
  }
}

// Luminância relativa (WCAG 2.1)
function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const cs = c / 255
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexToRgb(hexA))
  const lB = relativeLuminance(hexToRgb(hexB))
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}

// Escurece a cor (preservando matiz e saturação) até garantir contraste legível contra branco.
// Cores já escuras o bastante voltam inalteradas.
export function ensureReadableAccent(hex) {
  if (contrastRatio(hex, '#ffffff') >= MIN_CONTRAST_ON_WHITE) return hex

  const hsl = rgbToHsl(hexToRgb(hex))
  let { l } = hsl
  for (let i = 0; i < 40 && l > 0; i++) {
    l = Math.max(0, l - 0.025)
    const candidate = rgbToHex(hslToRgb({ ...hsl, l }))
    if (contrastRatio(candidate, '#ffffff') >= MIN_CONTRAST_ON_WHITE) return candidate
  }
  return '#111111'
}

// Garante que valores vindos de currículos salvos antigamente (ou corrompidos) nunca escapem do conjunto permitido

export function sanitizeDesign(design) {
  const d = { ...DEFAULT_DESIGN, ...(design || {}) }

  if (!HEADER_ALIGN_OPTIONS.some((o) => o.value === d.headerAlign)) d.headerAlign = 'left'
  if (!HEADER_WEIGHT_OPTIONS.some((o) => o.value === d.headerWeight)) d.headerWeight = 'bold'
  if (!SPACING_OPTIONS.some((o) => o.value === d.spacing)) d.spacing = 'normal'
  if (!DIVIDER_OPTIONS.some((o) => o.value === d.divider)) d.divider = 'line'
  if (!PAGE_MARGIN_OPTIONS.some((o) => o.value === d.pageMargin)) d.pageMargin = 'normal'

  if (typeof d.accentColor !== 'string' || !/^#[0-9a-fA-F]{3,8}$/.test(d.accentColor.trim())) {
    d.accentColor = DEFAULT_DESIGN.accentColor
  } else {
    d.accentColor = ensureReadableAccent(d.accentColor.trim())
  }

  d.showIcons = Boolean(d.showIcons)
  return d
}

// Converte os tokens em CSS custom properties para aplicar via `style` no elemento raiz do documento (.resume-doc)

export function designToCSSVars(design) {
  const d = sanitizeDesign(design)
  const scale = SPACING_SCALE[d.spacing]
  return {
    '--r-accent': d.accentColor,
    '--r-header-align': d.headerAlign === 'center' ? 'center' : 'left',
    '--r-header-weight': WEIGHT_SCALE[d.headerWeight],
    '--r-section-gap': scale.section,
    '--r-item-gap': scale.item,
    '--r-line-height': scale.lineHeight,
    '--r-divider-width': d.divider === 'none' ? '0px' : '1px',
    '--r-page-margin': d.pageMargin === 'narrow' ? '12mm' : '18mm'
  }
}
