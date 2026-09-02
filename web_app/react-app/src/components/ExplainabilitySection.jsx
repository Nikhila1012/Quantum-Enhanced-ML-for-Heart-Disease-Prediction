import React from 'react';
import ContributionBar from './ContributionBar';

// Features that are actually collected from the home page inputs
const AVAILABLE_FEATURES = ['cp', 'thalach', 'oldpeak', 'thal', 'age', 'sex', 'trestbps', 'chol', 'fbs', 'exang'];

const allExplanations = [
  { title: 'Chest Pain Type (CP)', text: 'Typical angina is the most significant predictor of heart disease, characterized by substernal chest discomfort precipitated by exertion.', icon: 'fa-heart-crack' },
  { title: 'Max Heart Rate (THALACH)', text: 'Lower maximum heart rate achieved during exercise often indicates cardiovascular deconditioning or underlying heart disease.', icon: 'fa-heart-pulse' },
  { title: 'ST Depression (OLDPEAK)', text: 'ST depression induced by exercise relative to rest is a key indicator of myocardial ischemia and coronary artery disease.', icon: 'fa-wave-square' },
  { title: 'Thalassemia (THAL)', text: 'Blood disorder affecting oxygen transport. Fixed or reversible defects indicate compromised blood flow to the heart muscle.', icon: 'fa-droplet' },
  { title: 'Age (AGE)', text: 'Age is a significant risk factor for heart disease. Risk increases with age, particularly for men over 45 and women over 55.', icon: 'fa-calendar' },
  { title: 'Gender (SEX)', text: 'Males generally have a higher risk of heart disease compared to females, though the risk for females increases after menopause.', icon: 'fa-venus-mars' },
  { title: 'Blood Pressure (TRESTBPS)', text: 'High resting blood pressure (hypertension) forces the heart to work harder and can lead to cardiovascular disease.', icon: 'fa-gauge-high' },
  { title: 'Cholesterol (CHOL)', text: 'Serum cholesterol levels above 240 mg/dl significantly increase the risk of atherosclerosis and heart disease.', icon: 'fa-apple-whole' },
  { title: 'Blood Sugar (FBS)', text: 'Fasting blood sugar > 120 mg/dl indicates diabetes, which is a major risk factor for cardiovascular disease.', icon: 'fa-vial' },
  { title: 'Exercise Induced Angina (EXANG)', text: 'Chest pain or discomfort during exercise indicates reduced blood flow to the heart muscle and increased cardiovascular risk.', icon: 'fa-person-running' }
];

// Filter explanations to only show features that are collected from user inputs
const explanations = allExplanations.filter(exp => {
  // Extract feature code from title (e.g., 'CP' from 'Chest Pain Type (CP)')
  const match = exp.title.match(/\(([A-Z]+)\)/);
  if (match) {
    const featureCode = match[1].toLowerCase();
    return AVAILABLE_FEATURES.includes(featureCode);
  }
  return false;
});

function ExplainabilitySection({ prediction, probability, contributions, riskFactors, protectiveFactors, onBack }) {
  if (prediction === null) {
    return (
      <section className="fade-in">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-microscope" style={{ color: 'var(--accent-secondary)' }}></i>
            Explainability Analysis
          </h1>
          <p className="breadcrumb">
            <i className="fas fa-home"></i> Home <i className="fas fa-chevron-right"></i> Explainability Analysis
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <i className="fas fa-brain" style={{ fontSize: '64px', color: 'var(--text-secondary)', marginBottom: '20px' }}></i>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px' }}>
            No prediction to explain. Please make a prediction first.
          </p>
          <button className="btn btn-primary" onClick={onBack}>
            <i className="fas fa-arrow-left"></i> Go to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-microscope" style={{ color: 'var(--accent-secondary)' }}></i>
          Explainability Analysis
        </h1>
        <p className="breadcrumb">
          <i className="fas fa-home"></i> Home <i className="fas fa-chevron-right"></i> Explainability Analysis
        </p>
      </div>

      <div className="chart-container">
        <h2 className="card-title">
          <i className="fas fa-chart-bar"></i>
          Feature Contribution Analysis
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          <i className="fas fa-info-circle"></i>
          Prediction: <strong style={{ color: prediction === 1 ? 'var(--danger)' : 'var(--success)' }}>{prediction === 1 ? 'High Risk' : 'Low Risk'}</strong>
          ({(probability * 100).toFixed(0)}% probability)
        </div>

        {contributions.map((item, idx) => (
          <ContributionBar key={idx} item={item} />
        ))}

        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot risk"></div>
            <span>Increases Risk</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot protective"></div>
            <span>Decreases Risk</span>
          </div>
        </div>
      </div>

      {riskFactors.length > 0 && (
        <div className="chart-container">
          <h2 className="card-title">
            <i className="fas fa-triangle-exclamation" style={{ color: 'var(--danger)' }}></i>
            Risk Factors Detail
          </h2>
          {riskFactors.map((rf, idx) => (
            <div key={idx} className="explanation-card" style={{ borderLeftColor: 'var(--danger)', background: 'rgba(244, 63, 94, 0.06)' }}>
              <div className="explanation-title" style={{ color: 'var(--danger)' }}>
                <i className={`fas ${rf.icon}`}></i> {rf.text}
              </div>
              <div className="explanation-text">{rf.detail}</div>
            </div>
          ))}
        </div>
      )}

      {protectiveFactors.length > 0 && (
        <div className="chart-container">
          <h2 className="card-title">
            <i className="fas fa-shield-heart" style={{ color: 'var(--success)' }}></i>
            Protective Factors Detail
          </h2>
          {protectiveFactors.map((pf, idx) => (
            <div key={idx} className="explanation-card" style={{ borderLeftColor: 'var(--success)', background: 'rgba(34, 197, 94, 0.06)' }}>
              <div className="explanation-title" style={{ color: 'var(--success)' }}>
                <i className={`fas ${pf.icon}`}></i> {pf.text}
              </div>
              <div className="explanation-text">{pf.detail}</div>
            </div>
          ))}
        </div>
      )}

      <div className="chart-container">
        <h2 className="card-title">
          <i className="fas fa-book-medical"></i>
          Medical Feature Reference
        </h2>
        {explanations.map((exp, idx) => (
          <div key={idx} className="explanation-card">
            <div className="explanation-title">
              <i className={`fas ${exp.icon}`}></i> {exp.title}
            </div>
            <div className="explanation-text">{exp.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExplainabilitySection;
