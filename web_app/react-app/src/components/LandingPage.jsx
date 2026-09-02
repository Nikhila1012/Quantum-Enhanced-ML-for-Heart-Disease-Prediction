import React, { useEffect, useState } from 'react';

function LandingPage({ onGetStarted }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations after mount
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className={`landing-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Animated Background Elements */}
      <div className="landing-bg-elements">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Remove static image, use CSS instead */}
      <div className="landing-background" />

      <div className="landing-content">
        <div className="landing-hero fade-up-1">
          <div className="hero-badge fade-up-2">
            <i className="fas fa-microchip"></i> Powered by Quantum AI
          </div>

          <h1 className="landing-title fade-up-3">
            <span className="text-gradient">Quantum</span> Heart
          </h1>

          <p className="landing-subtitle fade-up-4">
            Advanced Cardiovascular Risk Assessment using Ensemble Quantum Support Vector Classification. Fast, secure, and predictive.
          </p>

          <div className="landing-cta fade-up-5">
            <button className="landing-btn btn btn-primary pulse-btn" onClick={onGetStarted}>
              Start Assessment <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* Floating Graphics Section */}
        <div className="landing-graphics fade-in-delayed">
          <div className="graphic-container float-slow">
            <i className="fas fa-heartbeat graphic-main-icon"></i>

            <div className="floating-card stat-card-1 float-fast">
              <i className="fas fa-chart-pie text-accent"></i>
              <span>High Precision</span>
            </div>

            <div className="floating-card stat-card-2 float-medium">
              <i className="fas fa-microchip text-success"></i>
              <span>Quantum Engine</span>
            </div>

            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
