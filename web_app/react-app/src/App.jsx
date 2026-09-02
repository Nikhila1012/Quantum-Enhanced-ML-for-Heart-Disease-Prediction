import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import HomeSection from './components/HomeSection';
import PredictionSection from './components/PredictionSection';
import ExplainabilitySection from './components/ExplainabilitySection';
import AboutSection from './components/AboutSection';
import ChatWidget from './components/ChatWidget';
import { predictRisk, getFactors, calculateContributions } from './utils/prediction';

const ALL_FEATURES = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];

const DEFAULT_VALUES = {
  age: 0,
  sex: 1,
  cp: 1,
  trestbps: 130,
  chol: 245,
  fbs: 0,
  restecg: 0,
  thalach: 150,
  exang: 0,
  oldpeak: 2.3,
  slope: 1,
  ca: 0,
  thal: 3
};

function App() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [predictError, setPredictError] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [contributions, setContributions] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  const handlePredict = async () => {
    setPredictError(null);
    setIsPredicting(true);
    try {
      const result = await predictRisk(formData);
      setPrediction(result.prediction);
      setProbability(result.probability);
      setInputData({ ...formData });
      
      // Calculate SHAP values for this prediction
      try {
        const shapContributions = await calculateContributions(formData, result.prediction);
        setContributions(shapContributions);
      } catch (shapError) {
        console.error('SHAP calculation failed:', shapError);
        setContributions([]);
      }
      
      setActiveSection('prediction');
    } catch (error) {
      console.error('Prediction failed:', error);
      setPredictError(error.message || 'Prediction failed. Make sure the backend is running on port 8000.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_VALUES);
    setPrediction(null);
    setProbability(null);
    setInputData(null);
    setContributions([]);
  };

  const factors = inputData ? getFactors(inputData, prediction) : { riskFactors: [], protectiveFactors: [] };

  return (
    <div className="app-dark">
      <div className="bg-animation"></div>
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/home')} />} />
        <Route path="/home" element={
          <>
            <TopNav />
            <div className="container">
              <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
              <main className="main-content">
                {activeSection === 'home' && (
                  <HomeSection
                    formData={formData}
                    onInputChange={handleInputChange}
                    onPredict={handlePredict}
                    onReset={handleReset}
                    error={predictError}
                    isPredicting={isPredicting}
                  />
                )}
                {activeSection === 'prediction' && (
                  <PredictionSection
                    prediction={prediction}
                    probability={probability}
                    inputData={inputData}
                    riskFactors={factors.riskFactors}
                    protectiveFactors={factors.protectiveFactors}
                    onExplain={() => setActiveSection('explainability')}
                    onBack={() => setActiveSection('home')}
                  />
                )}
                {activeSection === 'explainability' && (
                  <ExplainabilitySection
                    prediction={prediction}
                    probability={probability}
                    contributions={contributions}
                    riskFactors={factors.riskFactors}
                    protectiveFactors={factors.protectiveFactors}
                    onBack={() => setActiveSection('home')}
                  />
                )}
                {activeSection === 'about' && <AboutSection />}
              </main>
            </div>
            <ChatWidget
              prediction={prediction}
              probability={probability}
              inputData={inputData}
              contributions={contributions}
            />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;
