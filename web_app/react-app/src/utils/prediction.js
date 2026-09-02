// Feature display names
export const FEATURE_LABELS = {
  'age': 'Age', 'sex': 'Gender', 'cp': 'Chest Pain Type', 'trestbps': 'Blood Pressure',
  'chol': 'Cholesterol', 'fbs': 'Blood Sugar', 'restecg': 'Resting ECG',
  'thalach': 'Max Heart Rate', 'exang': 'Exercise Induced Angina', 'oldpeak': 'Heart Stress During Exercise',
  'slope': 'ST Slope', 'ca': 'Major Vessels', 'thal': 'Heart Blood Flow'
};

// Reverse mappings for display
export const REVERSE_MAPPING = {
  'sex': {1: 'Male', 0: 'Female'},
  'cp': {1: 'Typical Angina', 2: 'Atypical Angina', 3: 'Non-anginal Pain', 4: 'Asymptomatic'},
  'fbs': {1: 'Yes', 0: 'No'},
  'restecg': {0: 'Normal', 1: 'ST-T Abnormality', 2: 'Left Ventricular Hypertrophy'},
  'exang': {1: 'Yes', 0: 'No'},
  'slope': {1: 'Upsloping', 2: 'Flat', 3: 'Downsloping'},
  'thal': {3: 'Normal', 6: 'Fixed Defect', 7: 'Reversible Defect', 0: 'Unknown'}
};

// Call backend API for ML prediction using QSVC model
export async function predictRisk(data) {
  try {
    console.log('Sending prediction request with data:', data);
    const response = await fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    console.log('Response received:', response);
    if (!response.ok) {
      throw new Error(`Prediction API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Prediction result:', result);
    return result;
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Prediction failed. Is the backend running? Start it with: cd web_app && python api.py');
  }
}

// Get risk and protective factors
export function getFactors(data, prediction) {
  const riskFactors = [];
  const protectiveFactors = [];
  
  // Age analysis
  if (data.age > 55) {
    riskFactors.push({ icon: 'fa-user-clock', text: `Age (${data.age} years)`, detail: 'Advanced age increases cardiovascular risk' });
  } else if (data.age < 40) {
    protectiveFactors.push({ icon: 'fa-user-check', text: `Young Age (${data.age} years)`, detail: 'Lower age reduces cardiovascular risk' });
  }
  
  // Chest Pain Type
  if (data.cp === 1) {
    riskFactors.push({ icon: 'fa-heart-crack', text: 'Typical Angina', detail: 'Classic symptom of coronary artery disease' });
  } else if (data.cp === 4) {
    protectiveFactors.push({ icon: 'fa-shield-heart', text: 'Asymptomatic', detail: 'No chest pain symptoms present' });
  }
  
  // Max Heart Rate
  if (data.thalach < 130) {
    riskFactors.push({ icon: 'fa-heart-pulse', text: `Low Max HR (${data.thalach})`, detail: 'Poor cardiac response to exercise' });
  } else if (data.thalach > 170) {
    protectiveFactors.push({ icon: 'fa-heart-circle-check', text: `Good Max HR (${data.thalach})`, detail: 'Strong cardiac performance' });
  }
  
  // ST Depression
  if (data.oldpeak > 2.5) {
    riskFactors.push({ icon: 'fa-wave-square', text: `High ST Depression (${data.oldpeak})`, detail: 'Significant ischemia during exercise' });
  } else if (data.oldpeak < 1) {
    protectiveFactors.push({ icon: 'fa-wave-square', text: `Normal ST (${data.oldpeak})`, detail: 'No significant ST segment changes' });
  }
  
  // Thalassemia
  if (data.thal === 6) {
    riskFactors.push({ icon: 'fa-droplet', text: 'Thalassemia (Fixed Defect)', detail: 'Permanent blood flow abnormality' });
  } else if (data.thal === 7) {
    riskFactors.push({ icon: 'fa-droplet', text: 'Thalassemia (Reversible)', detail: 'Blood flow abnormality under stress' });
  } else if (data.thal === 3) {
    protectiveFactors.push({ icon: 'fa-droplet', text: 'Normal Thalassemia', detail: 'Normal blood disorder status' });
  }
  
  // Cholesterol
  if (data.chol > 260) {
    riskFactors.push({ icon: 'fa-apple-whole', text: `High Cholesterol (${data.chol})`, detail: 'Elevated lipid levels increase plaque formation' });
  } else if (data.chol < 200) {
    protectiveFactors.push({ icon: 'fa-apple-whole', text: `Healthy Cholesterol (${data.chol})`, detail: 'Optimal lipid profile' });
  }
  
  // Exercise Angina
  if (data.exang === 1) {
    riskFactors.push({ icon: 'fa-person-running', text: 'Exercise Induced Angina', detail: 'Chest pain during physical activity' });
  } else {
    protectiveFactors.push({ icon: 'fa-person-walking', text: 'No Exercise Angina', detail: 'No chest pain during exertion' });
  }
  
  // Major Vessels
  if (data.ca > 0) {
    riskFactors.push({ icon: 'fa-route', text: `${data.ca} Major Vessels Affected`, detail: 'Coronary artery disease present' });
  } else {
    protectiveFactors.push({ icon: 'fa-route', text: 'Clear Major Vessels', detail: 'No visible coronary blockage' });
  }
  
  // Blood Sugar
  if (data.fbs === 1) {
    riskFactors.push({ icon: 'fa-cubes', text: 'High Fasting Blood Sugar', detail: 'Diabetes indicator' });
  }
  
  // Resting ECG
  if (data.restecg === 0) {
    protectiveFactors.push({ icon: 'fa-heart-circle-check', text: 'Normal Resting ECG', detail: 'No electrical abnormalities' });
  }
  
  return { riskFactors, protectiveFactors };
}

// Calculate feature contributions using REAL SHAP values from backend
export async function calculateContributions(data, prediction) {
  try {
    const response = await fetch('/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Explain API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.contributions) {
      // Transform backend SHAP values to frontend format
      return result.contributions.map(contrib => ({
        feature: contrib.display_name || contrib.feature,
        contribution: contrib.contribution !== undefined ? contrib.contribution : contrib.shap_value,
        value: contrib.value,
        shap_value: contrib.shap_value,
        base_value: contrib.base_value,
        percentage: contrib.normalized_percentage || 0
      }));
    } else {
      return getFallbackContributions(data, prediction);
    }
  } catch (error) {
    console.error('Contribution calculation error:', error);
    return getFallbackContributions(data, prediction);
  }
}

// Fallback contribution calculation (if SHAP fails)
function getFallbackContributions(data, prediction) {
  const contributions = [
    { feat: 'cp', name: 'Chest Pain Type', weight: 0.25, highRisk: 1 },
    { feat: 'thalach', name: 'Max Heart Rate', weight: 0.20, inverse: true, highRisk: 140 },
    { feat: 'oldpeak', name: 'ST Depression', weight: 0.20, highRisk: 2.0 },
    { feat: 'thal', name: 'Thalassemia', weight: 0.15, highRisk: [6, 7] },
    { feat: 'age', name: 'Age', weight: 0.10, highRisk: 55 },
    { feat: 'chol', name: 'Cholesterol', weight: 0.05, highRisk: 240 },
    { feat: 'exang', name: 'Exercise Angina', weight: 0.03, highRisk: 1 },
    { feat: 'sex', name: 'Gender', weight: 0.02, highRisk: 1 },
    { feat: 'trestbps', name: 'Blood Pressure', weight: 0.02, highRisk: 140 },
    { feat: 'fbs', name: 'Blood Sugar', weight: 0.02, highRisk: 1 }
  ];
  
  const featureContributions = [];
  
  contributions.forEach(config => {
    if (config.feat in data) {
      const val = data[config.feat];
      let contribution = 0;
      
      if (Array.isArray(config.highRisk)) {
        const isHighRisk = config.highRisk.includes(val);
        contribution = config.weight * (isHighRisk ? 1.0 : 0.2);
      } else if (config.inverse) {
        if (val <= config.highRisk) {
          contribution = config.weight * Math.min(1.0, (config.highRisk - val) / config.highRisk + 0.5);
        } else {
          contribution = config.weight * 0.1;
        }
      } else {
        if (config.feat === 'cp' && val === 1) {
          contribution = config.weight * 1.0;
        } else if (config.feat === 'ca' && val > 0) {
          contribution = config.weight * Math.min(1.0, val / 3.0);
        } else if (val >= config.highRisk) {
          contribution = config.weight * Math.min(1.0, val / config.highRisk);
        } else {
          contribution = config.weight * 0.1;
        }
      }
      
      if (prediction === 0) {
        contribution = -contribution;
      }
      
      featureContributions.push({
        feature: config.name,
        contribution: contribution,
        value: val,
        weight: config.weight
      });
    }
  });
  
  // Normalize fallback contributions to sum to 100%
  const totalAbs = featureContributions.reduce((sum, fc) => sum + Math.abs(fc.contribution), 0);
  if (totalAbs > 0) {
    featureContributions.forEach(fc => {
      fc.percentage = (Math.abs(fc.contribution) / totalAbs) * 100;
    });
  } else {
    const equalShare = 100 / featureContributions.length;
    featureContributions.forEach(fc => {
      fc.percentage = equalShare;
    });
  }
  
  return featureContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}
