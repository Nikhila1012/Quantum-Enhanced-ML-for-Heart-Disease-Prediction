import React, { useState, useRef, useEffect } from 'react';

// Fallback response generator for when backend is not available
const generateFallbackResponse = (userMessage, prediction, probability, inputData) => {
  const messageLower = userMessage.toLowerCase();
  
  const disclaimer = "\n\n⚠️ Disclaimer: I am an AI assistant, not a medical doctor. Please consult healthcare professionals for medical decisions.";
  
  if (messageLower.includes('explain') && messageLower.includes('prediction')) {
    if (prediction !== null && probability !== null) {
      const risk = prediction === 1 ? "HIGH" : "LOW";
      return `Based on your health data analysis:
      
**Risk Level: ${risk}**
**Probability: ${(probability * 100).toFixed(1)}%**

This prediction is based on key factors including chest pain type, maximum heart rate, ST depression, and thalassemia results. The quantum-enhanced model has analyzed these features to determine your cardiovascular risk profile.
      
Please consult a healthcare professional for a comprehensive medical evaluation.${disclaimer}`;
    } else {
      return `Please make a prediction first by entering your health data on the Home page, then I can explain your results.${disclaimer}`;
    }
  }
  
  if (messageLower.includes('shap') || messageLower.includes('contribution')) {
    return `**SHAP Values Explanation:**

SHAP (SHapley Additive exPlanations) values show how each feature contributes to your prediction:

- **Positive values** (red bars) increase heart disease risk
- **Negative values** (green bars) decrease heart disease risk

Key factors typically include:
- Chest Pain Type (cp): Typical angina increases risk significantly
- Max Heart Rate (thalach): Lower values indicate higher risk
- ST Depression (oldpeak): Higher values suggest ischemia
- Thalassemia (thal): Fixed/reversible defects increase risk

The longer the bar, the more that feature influenced your prediction.${disclaimer}`;
  }
  
  if (messageLower.includes('precaution') || messageLower.includes('prevent')) {
    return `**Heart Disease Precautions:**

1. **Diet:**
   - Eat more fruits, vegetables, and whole grains
   - Reduce saturated fats and sodium
   - Limit processed foods and sugar

2. **Exercise:**
   - 150 minutes of moderate activity per week
   - Include both cardio and strength training
   - Stay active throughout the day

3. **Lifestyle:**
   - Quit smoking
   - Limit alcohol consumption
   - Manage stress through meditation/yoga
   - Maintain healthy sleep habits

4. **Medical:**
   - Regular health checkups
   - Monitor blood pressure and cholesterol
   - Take prescribed medications
   - Control diabetes if applicable${disclaimer}`;
  }
  
  if (messageLower.includes('improve') || messageLower.includes('better')) {
    return `**How to Improve Heart Health:**

**Immediate Actions:**
- Start walking 30 minutes daily
- Replace sugary drinks with water
- Add one serving of vegetables to each meal
- Practice deep breathing for stress relief

**Long-term Changes:**
- Gradually transition to Mediterranean diet
- Build consistent exercise routine
- Achieve and maintain healthy weight
- Develop strong social connections

**Monitor Progress:**
- Track blood pressure regularly
- Get annual cholesterol checks
- Note improvements in energy levels
- Celebrate small victories!

Remember: Small, consistent changes lead to significant health improvements over time.${disclaimer}`;
  }
  
  // Default response for general questions
  return `I'm here to help with heart health questions! I can assist with:
- Explaining your prediction results
- Interpreting SHAP values and feature contributions
- Providing heart disease prevention tips
- Suggesting lifestyle improvements for better heart health

Try asking specific questions like:
- "Explain my prediction"
- "What do the SHAP values mean?"
- "Heart disease precautions"
- "How to improve heart health?"

${disclaimer}`;
};

function ChatWidget({ prediction, probability, inputData, contributions }) {
  const [isOpen, setIsOpen] = useState(false);
  const initialMessage = `Hello! I'm your Heart Health AI Assistant. I can help explain your prediction, interpret SHAP values, and answer heart-related questions. \n\nTry asking me:\n• "Explain my prediction"\n• "What do the SHAP values mean?"\n• "Heart disease precautions"\n• "How to improve heart health?"\n\n⚠️ Disclaimer: I am NOT a medical doctor. Always consult healthcare professionals for medical decisions.`;
  const [messages, setMessages] = useState([
    { role: 'assistant', text: initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Try to connect to the backend API (port 8000)
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          prediction: prediction,
          probability: probability,
          inputData: inputData,
          contributions: contributions
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'I apologize, but I\'m having trouble generating a response. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Fallback response when backend is not accessible
      const fallbackResponse = generateFallbackResponse(userMessage, prediction, probability, inputData);
      setMessages(prev => [...prev, { role: 'assistant', text: fallbackResponse }]);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Explain my prediction",
    "What do the SHAP values mean?",
    "Heart disease precautions",
    "How to improve heart health?"
  ];

  return (
    <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          <i className="fas fa-comment-dots"></i>
          <span className="chat-badge">♥</span>
        </button>
      )}
      
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="chat-title">
              <div className="chat-logo">
                <i className="fas fa-heart-pulse"></i>
              </div>
              <div>
                <span className="chat-title-main">Heart Health AI</span>
                <span className="chat-title-sub">Your wellness assistant</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="chat-avatar">
                  {msg.role === 'assistant' ? <i className="fas fa-stethoscope"></i> : <i className="fas fa-user"></i>}
                </div>
                <div className="chat-bubble">
                  <div className="chat-text">{msg.text}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant loading">
                <div className="chat-avatar">
                  <i className="fas fa-stethoscope"></i>
                </div>
                <div className="chat-bubble">
                  <div className="chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-quick-questions">
            {quickQuestions.map((q, idx) => (
              <button key={idx} className="quick-question" onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>
          
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your heart health, prediction, or precautions..."
              rows={1}
            />
            <button className="chat-send" onClick={sendMessage} disabled={isLoading || !input.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;