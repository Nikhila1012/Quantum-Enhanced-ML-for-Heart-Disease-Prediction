import React from 'react';
import SliderInput from './SliderInput';
import SelectInput from './SelectInput';
import NumberInput from './NumberInput';

function HomeSection({ formData, onInputChange, onPredict, onReset, error, isPredicting }) {
  return (
    <section className="fade-in">
      <div className="page-header">
        <h1 className="page-title">
          <i className="fas fa-stethoscope" style={{ color: 'var(--accent-secondary)' }}></i>
          Heart Disease Prediction
        </h1>
        <p className="breadcrumb">
          <i className="fas fa-home"></i> Home <i className="fas fa-chevron-right"></i> Heart Disease Prediction
        </p>
      </div>

      <div className="card">
        <h2 className="card-title">
          <i className="fas fa-user-plus"></i>
          Enter Patient Information
        </h2>
        <form>
          <div className="form-row">
            <SliderInput
              label="Age"
              id="age"
              min={0}
              max={77}
              value={formData.age}
              onChange={(val) => onInputChange('age', val)}
            />
            <SelectInput
              label="Gender"
              id="sex"
              value={formData.sex}
              onChange={(val) => onInputChange('sex', val)}
              options={[
                { value: 1, label: 'Male' },
                { value: 0, label: 'Female' }
              ]}
            />
          </div>

          <div className="form-row">
            <SelectInput
              label="Chest Pain Type"
              id="cp"
              value={formData.cp}
              onChange={(val) => onInputChange('cp', val)}
              options={[
                { value: 1, label: 'Typical Angina - Chest pain during physical activity' },
                { value: 2, label: 'Atypical Angina - Unusual chest pain or discomfort' },
                { value: 3, label: 'Non-anginal Pain - Chest pain caused by acidity' },
                { value: 4, label: 'Asymptomatic - No chest pain symptoms' }
              ]}
            />
            <SelectInput
              label="Exercise Induced Angina"
              id="exang"
              value={formData.exang}
              onChange={(val) => onInputChange('exang', val)}
              options={[
                { value: 1, label: 'Yes - Chest pain during exercise' },
                { value: 0, label: 'No - No chest pain during exercise' }
              ]}
            />
          </div>

          <div className="form-row">
            <NumberInput
              label="Blood Pressure (mm Hg)"
              id="trestbps"
              min={94}
              max={200}
              value={formData.trestbps}
              onChange={(val) => onInputChange('trestbps', val)}
            />
            <NumberInput
              label="Cholesterol (mg/dl)"
              id="chol"
              min={126}
              max={564}
              value={formData.chol}
              onChange={(val) => onInputChange('chol', val)}
            />
          </div>

          <div className="form-row">
            <SelectInput
              label="Blood Sugar > 120 mg/dl?"
              id="fbs"
              value={formData.fbs}
              onChange={(val) => onInputChange('fbs', val)}
              options={[
                { value: 0, label: 'No' },
                { value: 1, label: 'Yes' }
              ]}
            />
            <SliderInput
              label="Max Heart Rate"
              id="thalach"
              min={71}
              max={202}
              value={formData.thalach}
              onChange={(val) => onInputChange('thalach', val)}
            />
          </div>

          <div className="form-row">
            <NumberInput
              label="Heart Stress During Exercise (ECG change)"
              id="oldpeak"
              min={0}
              max={6.2}
              step={0.1}
              value={formData.oldpeak}
              onChange={(val) => onInputChange('oldpeak', val)}
            />
            <SelectInput
              label="Heart Blood Flow"
              id="thal"
              value={formData.thal}
              onChange={(val) => onInputChange('thal', val)}
              options={[
                { value: 3, label: 'Normal Blood Flow' },
                { value: 6, label: 'Permanent Blood Flow Problem' },
                { value: 7, label: 'Temporary Blood Flow Problem' },
                { value: 0, label: 'Test Result Not Available' }
              ]}
            />
          </div>

          {error && (
            <div className="predict-error" style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '12px', color: '#fda4af' }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          <div style={{ marginTop: '28px' }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={onPredict}
              disabled={isPredicting}
              style={{ position: 'relative' }}
            >
              {isPredicting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Predicting...
                </>
              ) : (
                <>
                  <i className="fas fa-calculator"></i> Predict Risk
                </>
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onReset}>
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default HomeSection;
