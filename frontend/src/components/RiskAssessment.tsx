import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './RiskAssessment.css';

interface RiskResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  risk_level_text: string;
  risk_reasons: string[];
  recommendation: string;
  should_continue: boolean;
  suggested_escrow_days: number;
}

export const RiskAssessment = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    buyer_address: '',
    seller_address: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  const handleAnalyze = async () => {
    if (!formData.amount || !formData.buyer_address || !formData.seller_address) {
      alert(t('common.fill_all'));
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8001/api/risk/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Risk assessment failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Risk assessment error:', error);
      alert(t('common.error', { message: 'Risk assessment service unavailable' }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskGradient = (level: string) => {
    switch (level) {
      case 'low': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'medium': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'high': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  return (
    <div className="risk-assessment-container">
      <div className="risk-header">
        <h1 className="risk-title">{t('risk.title')}</h1>
        <p className="risk-subtitle">{t('risk.subtitle')}</p>
      </div>

      <div className="risk-content">
        {/* 输入表单 */}
        <div className="risk-form-card">
          <div className="form-group">
            <label>{t('risk.form.amount')}</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1000"
              className="risk-input"
            />
          </div>

          <div className="form-group">
            <label>{t('risk.form.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('risk.form.description')}
              className="risk-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{t('risk.form.buyer_address')}</label>
            <input
              type="text"
              value={formData.buyer_address}
              onChange={(e) => setFormData({ ...formData, buyer_address: e.target.value })}
              placeholder="0x..."
              className="risk-input"
            />
          </div>

          <div className="form-group">
            <label>{t('risk.form.seller_address')}</label>
            <input
              type="text"
              value={formData.seller_address}
              onChange={(e) => setFormData({ ...formData, seller_address: e.target.value })}
              placeholder="0x..."
              className="risk-input"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="analyze-button"
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                {t('risk.form.analyzing')}
              </>
            ) : (
              t('risk.form.analyze_btn')
            )}
          </button>
        </div>

        {/* 结果展示 */}
        {result && (
          <div className="risk-result-card">
            <h2 className="result-title">{t('risk.result.title')}</h2>

            {/* 风险评分 */}
            <div className="risk-score-section">
              <div 
                className="risk-score-circle"
                style={{ 
                  background: getRiskGradient(result.risk_level),
                  boxShadow: `0 8px 24px ${getRiskColor(result.risk_level)}40`
                }}
              >
                <div className="score-value">{result.risk_score}</div>
                <div className="score-label">{t('risk.result.score')}</div>
              </div>

              <div className="risk-level-badge" style={{ 
                background: getRiskGradient(result.risk_level),
                boxShadow: `0 4px 12px ${getRiskColor(result.risk_level)}30`
              }}>
                {result.risk_level_text}
              </div>
            </div>

            {/* 风险原因 */}
            <div className="risk-section">
              <h3 className="section-title">{t('risk.result.reasons')}</h3>
              <ul className="risk-reasons-list">
                {result.risk_reasons.map((reason, index) => (
                  <li key={index} className="risk-reason-item">
                    <span className="reason-icon">⚠️</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* 建议 */}
            <div className="risk-section">
              <h3 className="section-title">{t('risk.result.recommendation')}</h3>
              <div className="recommendation-box" style={{
                borderLeft: `4px solid ${getRiskColor(result.risk_level)}`
              }}>
                <p className="recommendation-text">{result.recommendation}</p>
                
                <div className="recommendation-details">
                  <div className="detail-item">
                    <span className="detail-label">{t('risk.result.continue')}:</span>
                    <span className={`detail-value ${result.should_continue ? 'positive' : 'negative'}`}>
                      {result.should_continue ? t('risk.result.yes') : t('risk.result.no')}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">{t('risk.result.escrow_duration')}:</span>
                    <span className="detail-value">
                      {result.suggested_escrow_days} {t('risk.result.days')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
