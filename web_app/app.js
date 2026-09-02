// Global state
let currentPrediction = null;
let currentProbability = null;
let inputData = {};

// Feature order (all 13 features)
const ALL_FEATURES = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];

// Features used for prediction (4 features)
const PREDICTION_FEATURES = ['cp', 'thalach', 'oldpeak', 'thal'];

// Feature display names
const FEATURE_LABELS = {
    'age': 'Age', 'sex': 'Gender', 'cp': 'Chest Pain Type', 'trestbps': 'Resting BP',
    'chol': 'Cholesterol', 'fbs': 'Fasting Blood Sugar', 'restecg': 'Resting ECG',
    'thalach': 'Max Heart Rate', 'exang': 'Exercise Angina', 'oldpeak': 'ST Depression',
    'slope': 'ST Slope', 'ca': 'Major Vessels', 'thal': 'Thalassemia'
};

// Reverse mappings for display
const REVERSE_MAPPING = {
    'sex': { 1: 'Male', 0: 'Female' },
    'cp': { 1: 'Typical Angina', 2: 'Atypical Angina', 3: 'Non-anginal Pain', 4: 'Asymptomatic' },
    'fbs': { 1: 'Yes', 0: 'No' },
    'restecg': { 0: 'Normal', 1: 'ST-T Abnormality', 2: 'Left Ventricular Hypertrophy' },
    'exang': { 1: 'Yes', 0: 'No' },
    'slope': { 1: 'Upsloping', 2: 'Flat', 3: 'Downsloping' },
    'thal': { 3: 'Normal', 6: 'Fixed Defect', 7: 'Reversible Defect', 0: 'Unknown' }
};

// Update slider display value
function updateSlider(id, value) {
    document.getElementById(id + 'Value').textContent = value;
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName).classList.add('active');

    // Update sidebar
    document.querySelectorAll('.sidebar-nav-item').forEach((item, index) => {
        item.classList.remove('active');
        if ((sectionName === 'home' && index === 0) ||
            (sectionName === 'prediction' && index === 1) ||
            (sectionName === 'explainability' && index === 2)) {
            item.classList.add('active');
        }
    });
}

// Collect form data
function collectFormData() {
    const data = {};
    ALL_FEATURES.forEach(feature => {
        const element = document.getElementById(feature);
        if (element) {
            data[feature] = parseFloat(element.value);
        }
    });
    return data;
}

// Call backend API for ML prediction using QSVC model
async function makePrediction(data) {
    try {
        console.log('Sending prediction request with data:', data);
        const response = await fetch('http://localhost:8765/predict', {
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
        // Fallback to a default prediction if API call fails
        return { prediction: 0, probability: 0.5 };
    }
}

// Predict risk
async function predictRisk() {
    inputData = collectFormData();
    console.log('Collected form data:', inputData);
    const result = await makePrediction(inputData);

    currentPrediction = result.prediction;
    currentProbability = result.probability;

    console.log('Setting prediction result:', { currentPrediction, currentProbability });

    // Render prediction page
    renderPredictionPage();

    // Render explainability page
    renderExplainabilityPage();

    // Go to prediction page
    showSection('prediction');
}

// Reset form
function resetForm() {
    document.getElementById('predictionForm').reset();
    updateSlider('age', 54);
    updateSlider('thalach', 150);
    currentPrediction = null;
    currentProbability = null;
    inputData = {};
}

// Get risk and protective factors
function getFactors(data, prediction) {
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

// Render prediction page
function renderPredictionPage() {
    const isHighRisk = currentPrediction === 1;
    const riskClass = isHighRisk ? 'risk-high' : 'risk-low';
    const riskText = isHighRisk ? '<i class="fas fa-triangle-exclamation"></i> High Risk Detected' : '<i class="fas fa-check-circle"></i> Low Risk';
    const cardClass = isHighRisk ? '' : 'low-risk';

    const { riskFactors, protectiveFactors } = getFactors(inputData, currentPrediction);

    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${(currentProbability * 100).toFixed(0)}%</div>
                <div class="stat-label">Risk Probability</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${isHighRisk ? 'High' : 'Low'}</div>
                <div class="stat-label">Risk Level</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">QSVC</div>
                <div class="stat-label">Model</div>
            </div>
        </div>
        
        <div class="card">
            <h2 class="card-title">
                <i class="fas fa-clipboard-list"></i>
                Patient Information Summary
            </h2>
            <table>
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
    `;

    ALL_FEATURES.forEach(feat => {
        if (feat in inputData) {
            let val = inputData[feat];
            if (REVERSE_MAPPING[feat] && REVERSE_MAPPING[feat][val] !== undefined) {
                val = REVERSE_MAPPING[feat][val];
            }
            html += `<tr><td>${FEATURE_LABELS[feat]}</td><td>${val}</td></tr>`;
        }
    });

    html += `
                </tbody>
            </table>
        </div>
        
        <div class="result-card ${cardClass}">
            <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                Prediction Result
            </div>
            <div class="risk-title ${riskClass}">${riskText}</div>
            <div class="probability-section">
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                    Risk Probability: <span style="font-size: 24px; font-weight: 700; color: ${isHighRisk ? 'var(--danger)' : 'var(--success)'};">${(currentProbability * 100).toFixed(0)}%</span>
                </div>
                <div class="probability-bar">
                    <div class="probability-marker" style="left: ${currentProbability * 100}%;">${(currentProbability * 100).toFixed(0)}%</div>
                </div>
                <div class="probability-labels">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                </div>
            </div>
            <div class="model-badge">
                <i class="fas fa-microchip"></i>
                Ensemble Quantum QSVC Model
            </div>
    `;

    // Add risk factors
    if (riskFactors.length > 0) {
        html += `
            <div class="risk-factors">
                <div class="risk-factors-title">
                    <i class="fas fa-triangle-exclamation"></i>
                    Key Risk Factors
                </div>
                ${riskFactors.map(rf => `
                    <div class="risk-factor-item">
                        <i class="fas ${rf.icon}"></i>
                        <div>
                            <div style="font-weight: 500;">${rf.text}</div>
                            <div style="font-size: 12px; opacity: 0.8;">${rf.detail}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Add protective factors
    if (protectiveFactors.length > 0) {
        html += `
            <div class="protective-factors">
                <div class="protective-factors-title">
                    <i class="fas fa-shield-heart"></i>
                    Protective Factors
                </div>
                ${protectiveFactors.map(pf => `
                    <div class="protective-factor-item">
                        <i class="fas ${pf.icon}"></i>
                        <div>
                            <div style="font-weight: 500;">${pf.text}</div>
                            <div style="font-size: 12px; opacity: 0.8;">${pf.detail}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    html += `
            <div style="display: flex; gap: 16px; margin-top: 24px;">
                <button class="btn btn-primary" onclick="showSection('explainability')" style="flex: 1;">
                    <i class="fas fa-microscope"></i> Explain Prediction
                </button>
                <button class="btn btn-outline" onclick="downloadPDF()" style="flex: 1; border-color: var(--accent-secondary); color: var(--accent-secondary);">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </button>
            </div>
        </div>
    `;

    document.getElementById('predictionContent').innerHTML = html;
}

// Function to download prediction result as PDF
function downloadPDF() {
    const isHighRisk = currentPrediction === 1;
    const probabilityText = (currentProbability * 100).toFixed(0) + '%';
    const riskLevel = isHighRisk ? 'High Risk' : 'Low Risk';

    // Build simple HTML layout
    let htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #000; background: #fff;">
            <h1 style="text-align: center; color: #333; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 10px;">Heart Risk Prediction Report</h1>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #444; margin-bottom: 15px;">Prediction Summary</h3>
                <p><strong>Risk Level:</strong> <span style="color: ${isHighRisk ? '#e74c3c' : '#2ecc71'}; font-weight: bold;">${riskLevel}</span></p>
                <p><strong>Risk Probability:</strong> ${probabilityText}</p>
                <p><strong>Model Used:</strong> Ensemble Quantum QSVC Model</p>
            </div>

            <div>
                <h3 style="color: #444; margin-bottom: 15px;">Patient Information</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Feature</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Value</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    ALL_FEATURES.forEach(feat => {
        if (feat in inputData) {
            let val = inputData[feat];
            if (REVERSE_MAPPING[feat] && REVERSE_MAPPING[feat][val] !== undefined) {
                val = REVERSE_MAPPING[feat][val];
            }
            htmlContent += `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${FEATURE_LABELS[feat]}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${val}</td>
                        </tr>
            `;
        }
    });

    htmlContent += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 50px; text-align: center; color: #777; font-size: 12px;">
                <p>Disclaimer: This report is generated by an AI assistant and is not a medical diagnosis. Please consult a healthcare professional.</p>
            </div>
        </div>
    `;

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;

    // Position it off-screen
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    const opt = {
        margin: 0.5,
        filename: 'Heart_Risk_Prediction_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Generate PDF and then clean up the container
    html2pdf().set(opt).from(tempContainer).save().then(() => {
        document.body.removeChild(tempContainer);
    });
}

// Render explainability page
function renderExplainabilityPage() {
    const { riskFactors, protectiveFactors } = getFactors(inputData, currentPrediction);

    // Calculate feature contributions
    const contributions = [
        { feat: 'cp', name: 'Chest Pain Type', weight: 0.25, highRisk: 1 },
        { feat: 'thalach', name: 'Max Heart Rate', weight: 0.20, inverse: true, highRisk: 140 },
        { feat: 'oldpeak', name: 'ST Depression', weight: 0.20, highRisk: 2.0 },
        { feat: 'thal', name: 'Thalassemia', weight: 0.15, highRisk: [6, 7] },
        { feat: 'age', name: 'Age', weight: 0.10, highRisk: 55 },
        { feat: 'chol', name: 'Cholesterol', weight: 0.05, highRisk: 240 },
        { feat: 'exang', name: 'Exercise Angina', weight: 0.03, highRisk: 1 },
        { feat: 'ca', name: 'Major Vessels', weight: 0.02, highRisk: 0 }
    ];

    const featureContributions = [];

    contributions.forEach(config => {
        if (config.feat in inputData) {
            const val = inputData[config.feat];
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

            if (currentPrediction === 0) {
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

    featureContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    let html = `
        <div class="chart-container">
            <h2 class="card-title">
                <i class="fas fa-chart-bar"></i>
                Feature Contribution Analysis
            </h2>
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">
                <i class="fas fa-info-circle"></i>
                Prediction: <strong style="color: ${currentPrediction === 1 ? 'var(--danger)' : 'var(--success)'}">${currentPrediction === 1 ? 'High Risk' : 'Low Risk'}</strong> 
                (${(currentProbability * 100).toFixed(0)}% probability)
            </div>
    `;

    featureContributions.forEach(item => {
        const width = Math.abs(item.contribution) * 100;
        const isRisk = item.contribution > 0;
        const fillClass = isRisk ? 'risk' : 'protective';
        const displayWidth = Math.max(width, 5); // Minimum 5% for visibility

        html += `
            <div class="contribution-bar">
                <div class="contribution-header">
                    <span class="contribution-name">${item.feature}</span>
                    <span class="contribution-value">Value: ${item.value}</span>
                </div>
                <div class="contribution-track">
                    <div class="contribution-fill ${fillClass}" style="width: ${displayWidth}%">
                        ${width > 12 ? width.toFixed(1) + '%' : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += `
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-dot risk"></div>
                    <span>Increases Risk</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot protective"></div>
                    <span>Decreases Risk</span>
                </div>
            </div>
        </div>
    `;

    // Risk Factors Detail
    if (riskFactors.length > 0) {
        html += `
            <div class="chart-container">
                <h2 class="card-title">
                    <i class="fas fa-triangle-exclamation" style="color: var(--danger);"></i>
                    Risk Factors Detail
                </h2>
        `;

        riskFactors.forEach(rf => {
            html += `
                <div class="explanation-card" style="border-left-color: var(--danger); background: rgba(239, 68, 68, 0.05);">
                    <div class="explanation-title" style="color: #f87171;">
                        <i class="fas ${rf.icon}"></i> ${rf.text}
                    </div>
                    <div class="explanation-text">${rf.detail}</div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Protective Factors Detail
    if (protectiveFactors.length > 0) {
        html += `
            <div class="chart-container">
                <h2 class="card-title">
                    <i class="fas fa-shield-heart" style="color: var(--success);"></i>
                    Protective Factors Detail
                </h2>
        `;

        protectiveFactors.forEach(pf => {
            html += `
                <div class="explanation-card" style="border-left-color: var(--success); background: rgba(16, 185, 129, 0.05);">
                    <div class="explanation-title" style="color: #34d399;">
                        <i class="fas ${pf.icon}"></i> ${pf.text}
                    </div>
                    <div class="explanation-text">${pf.detail}</div>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Feature Explanations
    html += `
        <div class="chart-container">
            <h2 class="card-title">
                <i class="fas fa-book-medical"></i>
                Medical Feature Reference
            </h2>
    `;

    const explanations = [
        { title: 'Chest Pain Type (CP)', text: 'Typical angina is the most significant predictor of heart disease, characterized by substernal chest discomfort precipitated by exertion.', icon: 'fa-heart-crack' },
        { title: 'Max Heart Rate (THALACH)', text: 'Lower maximum heart rate achieved during exercise often indicates cardiovascular deconditioning or underlying heart disease.', icon: 'fa-heart-pulse' },
        { title: 'ST Depression (OLDPEAK)', text: 'ST depression induced by exercise relative to rest is a key indicator of myocardial ischemia and coronary artery disease.', icon: 'fa-wave-square' },
        { title: 'Thalassemia (THAL)', text: 'Blood disorder affecting oxygen transport. Fixed or reversible defects indicate compromised blood flow to the heart muscle.', icon: 'fa-droplet' },
        { title: 'Major Vessels (CA)', text: 'Number of major vessels colored by fluoroscopy indicates the severity of coronary artery disease and blockage.', icon: 'fa-route' },
        { title: 'Cholesterol (CHOL)', text: 'Serum cholesterol levels above 240 mg/dl significantly increase the risk of atherosclerosis and heart disease.', icon: 'fa-apple-whole' }
    ];

    explanations.forEach(exp => {
        html += `
            <div class="explanation-card">
                <div class="explanation-title">
                    <i class="fas ${exp.icon}"></i> ${exp.title}
                </div>
                <div class="explanation-text">${exp.text}</div>
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('explainabilityContent').innerHTML = html;
}

// Initialize
showSection('home');

// Chatbot functionality
let chatHistory = [];

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';

    // Prepare system prompt
    const systemPrompt = `You are a Heart Health AI Assistant.

CRITICAL INSTRUCTIONS:

1. You are NOT a medical doctor. Always remind users to consult healthcare professionals for medical decisions.

2. ONLY respond to questions related to heart health, cardiovascular disease, heart disease predictions, SHAP values, heart health precautions, and heart-related medical information.

3. If asked about any other topics (politics, math, science, general knowledge, etc.), politely decline and redirect to heart health topics.

4. Provide accurate, helpful information about:
   - Explaining heart disease predictions and risk factors
   - Interpreting SHAP values and feature contributions
   - Heart health education and information
   - Lifestyle changes and precautions for heart health
   - Answering questions about cardiovascular health
   - Providing basic information about heart medications and treatments

5. Be empathetic, clear, and concise in your responses.

6. Always include a disclaimer that you are an AI assistant, not a medical doctor.

Remember: Your purpose is to help users understand their heart health data and provide general educational information.`;

    // Include prediction data if available
    let predictionContext = "";
    if (currentPrediction !== null && currentProbability !== null) {
        predictionContext = `\n\nCurrent Prediction Data:\n- Risk Level: ${currentPrediction === 1 ? 'High Risk' : 'Low Risk'}\n- Probability: ${(currentProbability * 100).toFixed(2)}%\n`;

        if (inputData) {
            predictionContext += "\nPatient Features:\n";
            for (const [key, value] of Object.entries(inputData)) {
                predictionContext += `- ${key}: ${value}\n`;
            }
        }
    }

    const fullPrompt = `${systemPrompt}${predictionContext}\n\nUser Question: ${message}\n\nAssistant Response:`;

    try {
        // Show typing indicator
        showTypingIndicator();

        // Call Ollama API
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'phi',
                prompt: fullPrompt,
                stream: false,
                options: {
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.response || "I'm sorry, I couldn't process your request. Please try again.";

        // Hide typing indicator and add AI response to chat
        hideTypingIndicator();
        addMessageToChat(aiResponse, 'bot');
    } catch (error) {
        console.error('Chat error:', error);
        // Hide typing indicator and show error message
        hideTypingIndicator();
        addMessageToChat("Sorry, I'm having trouble connecting to the AI service. Please make sure Ollama is running with the 'phi' model.", 'bot');
    }
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Convert newlines to <br> for proper formatting
    const formattedMessage = message.replace(/\n/g, '<br>');
    contentDiv.innerHTML = formattedMessage;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');

    // Check if typing indicator already exists
    if (document.getElementById('typingIndicator')) {
        return;
    }

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message bot-message';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'typing-indicator';

    contentDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;

    typingDiv.appendChild(contentDiv);
    chatMessages.appendChild(typingDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Toggle chat window
function toggleChat() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('active');

    // Scroll to bottom when opening
    if (chatWindow.classList.contains('active')) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Handle Enter key press in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add event listener for send button
document.addEventListener('DOMContentLoaded', function () {
    const sendButton = document.getElementById('sendChat');
    const chatInput = document.getElementById('chatInput');

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
