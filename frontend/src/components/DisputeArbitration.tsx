import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './DisputeArbitration.css';

interface Evidence {
  type: 'text' | 'image' | 'tracking';
  content: string;
  description?: string;
}

interface ArbitrationResult {
  case_id: string;
  responsibility: string;
  responsibility_text: string;
  resolution: string;
  resolution_text: string;
  confidence: number;
  detailed_reasons: string[];
  evidence_summary: {
    buyer_evidence_count: number;
    seller_evidence_count: number;
    chat_messages_count: number;
  };
  recommendations: string[];
}

export const DisputeArbitration = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    dispute_type: 'not_received',
    buyer_claim: '',
    seller_response: '',
    chat_history: '',
  });
  
  const [buyerEvidence, setBuyerEvidence] = useState<Evidence[]>([]);
  const [sellerEvidence, setSellerEvidence] = useState<Evidence[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ArbitrationResult | null>(null);

  const disputeTypes = [
    { value: 'not_received', label: '未收到商品' },
    { value: 'not_as_described', label: '商品与描述不符' },
    { value: 'damaged', label: '商品损坏' },
    { value: 'fake', label: '假货/仿品' },
    { value: 'seller_no_ship', label: '卖家未发货' },
    { value: 'buyer_no_pay', label: '买家未付款' },
    { value: 'other', label: '其他争议' },
  ];

  const addEvidence = (party: 'buyer' | 'seller', type: Evidence['type']) => {
    const evidence: Evidence = {
      type,
      content: '',
      description: ''
    };
    
    if (party === 'buyer') {
      setBuyerEvidence([...buyerEvidence, evidence]);
    } else {
      setSellerEvidence([...sellerEvidence, evidence]);
    }
  };

  const updateEvidence = (
    party: 'buyer' | 'seller',
    index: number,
    field: keyof Evidence,
    value: string
  ) => {
    if (party === 'buyer') {
      const updated = [...buyerEvidence];
      updated[index] = { ...updated[index], [field]: value };
      setBuyerEvidence(updated);
    } else {
      const updated = [...sellerEvidence];
      updated[index] = { ...updated[index], [field]: value };
      setSellerEvidence(updated);
    }
  };

  const removeEvidence = (party: 'buyer' | 'seller', index: number) => {
    if (party === 'buyer') {
      setBuyerEvidence(buyerEvidence.filter((_, i) => i !== index));
    } else {
      setSellerEvidence(sellerEvidence.filter((_, i) => i !== index));
    }
  };

  const handleAnalyze = async () => {
    if (!formData.amount || !formData.buyer_claim) {
      alert('请填写必要信息');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const chatHistory = formData.chat_history
        .split('\n')
        .filter(line => line.trim());

      const response = await fetch('http://localhost:8002/api/dispute/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          chat_history: chatHistory,
          buyer_evidence: buyerEvidence.filter(e => e.content),
          seller_evidence: sellerEvidence.filter(e => e.content),
        })
      });

      if (!response.ok) {
        throw new Error('Arbitration analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Arbitration error:', error);
      alert('仲裁服务暂时不可用，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResponsibilityColor = (responsibility: string) => {
    switch (responsibility) {
      case 'seller': return '#ef4444';
      case 'buyer': return '#f59e0b';
      case 'both': return '#8b5cf6';
      case 'unclear': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="dispute-container">
      <div className="dispute-header">
        <h1 className="dispute-title">⚖️ 智能争议仲裁助手</h1>
        <p className="dispute-subtitle">AI 驱动的公正、透明、高效纠纷解决方案</p>
      </div>

      <div className="dispute-content">
        {/* 左侧：信息输入 */}
        <div className="dispute-form-section">
          <h2 className="section-title">📋 争议信息</h2>
          
          <div className="form-group">
            <label>交易金额 (cUSD)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1000"
              className="dispute-input"
            />
          </div>

          <div className="form-group">
            <label>交易描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="购买 iPhone 15 Pro"
              className="dispute-input"
            />
          </div>

          <div className="form-group">
            <label>争议类型</label>
            <select
              value={formData.dispute_type}
              onChange={(e) => setFormData({ ...formData, dispute_type: e.target.value })}
              className="dispute-select"
            >
              {disputeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>买家主张</label>
            <textarea
              value={formData.buyer_claim}
              onChange={(e) => setFormData({ ...formData, buyer_claim: e.target.value })}
              placeholder="描述买家的诉求和理由..."
              className="dispute-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>卖家回应</label>
            <textarea
              value={formData.seller_response}
              onChange={(e) => setFormData({ ...formData, seller_response: e.target.value })}
              placeholder="描述卖家的回应..."
              className="dispute-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>聊天记录（每行一条消息）</label>
            <textarea
              value={formData.chat_history}
              onChange={(e) => setFormData({ ...formData, chat_history: e.target.value })}
              placeholder="买家: 什么时候发货？&#10;卖家: 已经发货了&#10;买家: 我没收到"
              className="dispute-textarea"
              rows={4}
            />
          </div>

          {/* 证据部分 */}
          <div className="evidence-section">
            <h3 className="subsection-title">🔍 买家证据</h3>
            {buyerEvidence.map((evidence, index) => (
              <div key={index} className="evidence-item">
                <select
                  value={evidence.type}
                  onChange={(e) => updateEvidence('buyer', index, 'type', e.target.value)}
                  className="evidence-type-select"
                >
                  <option value="text">文字说明</option>
                  <option value="image">图片证据</option>
                  <option value="tracking">物流信息</option>
                </select>
                <input
                  type="text"
                  value={evidence.content}
                  onChange={(e) => updateEvidence('buyer', index, 'content', e.target.value)}
                  placeholder="证据内容或链接"
                  className="evidence-input"
                />
                <button
                  onClick={() => removeEvidence('buyer', index)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addEvidence('buyer', 'text')}
              className="add-evidence-btn"
            >
              + 添加买家证据
            </button>
          </div>

          <div className="evidence-section">
            <h3 className="subsection-title">🔍 卖家证据</h3>
            {sellerEvidence.map((evidence, index) => (
              <div key={index} className="evidence-item">
                <select
                  value={evidence.type}
                  onChange={(e) => updateEvidence('seller', index, 'type', e.target.value)}
                  className="evidence-type-select"
                >
                  <option value="text">文字说明</option>
                  <option value="image">图片证据</option>
                  <option value="tracking">物流信息</option>
                </select>
                <input
                  type="text"
                  value={evidence.content}
                  onChange={(e) => updateEvidence('seller', index, 'content', e.target.value)}
                  placeholder="证据内容或链接"
                  className="evidence-input"
                />
                <button
                  onClick={() => removeEvidence('seller', index)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addEvidence('seller', 'text')}
              className="add-evidence-btn"
            >
              + 添加卖家证据
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="analyze-button"
          >
            {isAnalyzing ? (
              <>
                <span className="spinner"></span>
                分析中...
              </>
            ) : (
              '🔍 开始仲裁分析'
            )}
          </button>
        </div>

        {/* 右侧：仲裁结果 */}
        {result && (
          <div className="dispute-result-section">
            <h2 className="section-title">⚖️ 仲裁结果</h2>
            
            <div className="result-card">
              <div className="case-id">案件编号: {result.case_id}</div>
              
              {/* 责任判定 */}
              <div className="judgment-box" style={{
                borderLeft: `4px solid ${getResponsibilityColor(result.responsibility)}`
              }}>
                <div className="judgment-label">责任方判定</div>
                <div className="judgment-value" style={{
                  color: getResponsibilityColor(result.responsibility)
                }}>
                  {result.responsibility_text}
                </div>
              </div>

              {/* 处理方案 */}
              <div className="resolution-box">
                <div className="resolution-label">建议处理方案</div>
                <div className="resolution-value">{result.resolution_text}</div>
              </div>

              {/* 置信度 */}
              <div className="confidence-box">
                <div className="confidence-label">置信度评分</div>
                <div className="confidence-bar-container">
                  <div
                    className="confidence-bar"
                    style={{
                      width: `${result.confidence}%`,
                      background: getConfidenceColor(result.confidence)
                    }}
                  />
                  <span className="confidence-text" style={{
                    color: getConfidenceColor(result.confidence)
                  }}>
                    {result.confidence}%
                  </span>
                </div>
              </div>

              {/* 详细理由 */}
              <div className="reasons-section">
                <h3 className="reasons-title">📝 详细理由</h3>
                <ul className="reasons-list">
                  {result.detailed_reasons.map((reason, index) => (
                    <li key={index} className="reason-item">{reason}</li>
                  ))}
                </ul>
              </div>

              {/* 证据汇总 */}
              <div className="evidence-summary">
                <h3 className="summary-title">📊 证据汇总</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">买家证据:</span>
                    <span className="summary-value">{result.evidence_summary.buyer_evidence_count} 项</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">卖家证据:</span>
                    <span className="summary-value">{result.evidence_summary.seller_evidence_count} 项</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">聊天记录:</span>
                    <span className="summary-value">{result.evidence_summary.chat_messages_count} 条</span>
                  </div>
                </div>
              </div>

              {/* 操作建议 */}
              <div className="recommendations-section">
                <h3 className="recommendations-title">💡 操作建议</h3>
                <ul className="recommendations-list">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
