import React from 'react';

function AboutSection() {
  return (
    <section className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-circle-info" style={{ color: 'var(--accent-secondary)' }}></i>
          About the Project
        </h1>
        <p className="breadcrumb">
          <i className="fas fa-home"></i> Home <i className="fas fa-chevron-right"></i> About
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-heart-pulse"></i>
          Quantum Heart Disease Prediction System
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '20px' }}>
          This project is an advanced heart disease prediction system that combines classical machine learning 
          with quantum computing techniques to provide accurate risk assessments and detailed explanations 
          for healthcare professionals and patients.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-microchip"></i>
          Technology Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="explanation-card">
            <div className="explanation-title">
              <i className="fas fa-atom"></i> Quantum Machine Learning
            </div>
            <div className="explanation-text">
              Utilizes Quantum Support Vector Classification (QSVC) for enhanced pattern recognition in medical data.
            </div>
          </div>
          <div className="explanation-card">
            <div className="explanation-title">
              <i className="fas fa-brain"></i> Classical ML Models
            </div>
            <div className="explanation-text">
              Ensemble of Random Forest, SVM, and Logistic Regression for robust predictions.
            </div>
          </div>
          <div className="explanation-card">
            <div className="explanation-title">
              <i className="fas fa-chart-pie"></i> SHAP Explainability
            </div>
            <div className="explanation-text">
              Feature contribution analysis using SHAP values for transparent AI decisions.
            </div>
          </div>
          <div className="explanation-card">
            <div className="explanation-title">
              <i className="fas fa-code"></i> Modern Web Stack
            </div>
            <div className="explanation-text">
              Built with React, Flask, and Python for a responsive and scalable application.
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-database"></i>
          Dataset Information
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
          The system is trained on the Cleveland Heart Disease dataset from the UCI Machine Learning Repository, 
          containing 303 patient records with 13 clinical features.
        </p>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-value">303</div>
            <div className="stat-label">Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">13</div>
            <div className="stat-label">Features</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">4</div>
            <div className="stat-label">Key Features</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">85%+</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-users"></i>
          Development Team
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          This project was developed as part of a research initiative exploring the applications of 
          quantum computing in healthcare diagnostics. The system aims to bridge the gap between 
          cutting-edge quantum technologies and practical medical applications.
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-shield-halved"></i>
          Disclaimer
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          This tool is intended for educational and research purposes only. It should not be used as a 
          substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of 
          your physician or other qualified health provider with any questions you may have regarding 
          a medical condition.
        </p>
      </div>
    </section>
  );
}

export default AboutSection;
