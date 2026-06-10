import { FiCheck } from 'react-icons/fi'

function ProgressBar({ steps, current, onStepClick }) {
  return (
    <>
      <span className="sidebar-title">Etapas</span>
      {steps.map((label, i) => (
        <button
          key={i}
          className={`sidebar-step ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}
          onClick={() => onStepClick(i)}
        >
          <div className="step-dot">{i < current ? <FiCheck size={14} /> : i + 1}</div>
          <span className="step-label">{label}</span>
        </button>
      ))}
    </>
  )
}
export default ProgressBar
