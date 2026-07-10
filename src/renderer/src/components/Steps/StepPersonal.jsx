import { FiHelpCircle } from 'react-icons/fi'

const FIELD_FILTERS = {
  name: (value) => value.replace(/[^\p{L}\s'-]/gu, ''),
  title: (value) => value, // sem restrição no momento
  location: (value) => value.replace(/[^\p{L}\p{N}\s,-]/gu, ''),
  email: (value) => value.replace(/\s/g, ''),
  phone: (value) => value.replace(/[^0-9+\-\s()]/g, ''),
  linkedin: (value) => value.replace(/\s/g, ''),
  github: (value) => value.replace(/\s/g, '')
}

function StepPersonal({ data, onChange }) {
  const handle = (e) => {
    const { name, value } = e.target
    const filter = FIELD_FILTERS[name] || ((v) => v)
    onChange({ ...data, [name]: filter(value) })
  }

  return (
    <div className="step">
      <h2>Dados Pessoais</h2>
      <p className="step-desc">
        Essas informações aparecem logo no topo do currículo e são essenciais para identificar e
        contatar você. Mantenha seus dados sempre atualizados!
      </p>
      <div className="form-grid">
        <div className="form-group full">
          <label>Nome completo *</label>
          <input
            name="name"
            value={data.name}
            onChange={handle}
            placeholder="Ex.: Jefferson Carvalho"
          />
        </div>
        <div className="form-group full">
          <label>Título profissional *</label>
          <input
            name="title"
            value={data.title}
            onChange={handle}
            placeholder="Ex.: Desenvolvedor Backend | API | Python | Java"
          />
        </div>
        <div className="form-group">
          <label>Localização *</label>
          <input
            name="location"
            value={data.location}
            onChange={handle}
            placeholder="São Paulo, SP"
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input name="email" value={data.email} onChange={handle} placeholder="seu@email.com" />
        </div>
        <div className="form-group">
          <label>
            Telefone
            <FiHelpCircle
              title="Recomendado, mas opcional. Incluir um telefone no currículo facilita o contato dos recrutadores, mas também aumenta a exposição dos seus dados pessoais."
              style={{ marginLeft: 6, cursor: 'help', color: 'var(--muted)', fontSize: 14 }}
            />
          </label>
          <input
            name="phone"
            value={data.phone}
            onChange={handle}
            placeholder="+55 11 99999-9999"
          />
        </div>
        <div className="form-group">
          <label>LinkedIn</label>
          <input
            name="linkedin"
            value={data.linkedin}
            onChange={handle}
            placeholder="linkedin.com/in/seuperfil"
          />
        </div>
        <div className="form-group">
          <label>GitHub / Portfólio</label>
          <input
            name="github"
            value={data.github}
            onChange={handle}
            placeholder="github.com/seuusuario"
          />
        </div>
      </div>
    </div>
  )
}

export default StepPersonal
