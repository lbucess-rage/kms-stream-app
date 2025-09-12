import React, { useState } from 'react';
import { StreamParser } from '../utils/streamParser';
import './EvidenceDisplay.css';

interface EvidenceDisplayProps {
  evidenceData: any[];
}

const EvidenceDisplay: React.FC<EvidenceDisplayProps> = ({ evidenceData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!evidenceData || evidenceData.length === 0) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderEvidenceItem = (evidence: any, index: number) => {
    const isHtmlContent = evidence.content && 
      (evidence.content.includes('<') || evidence.content.includes('&lt;'));
    
    // For HTML content, try to render it safely
    if (isHtmlContent && typeof evidence.content === 'string') {
      const cleanContent = evidence.content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
      
      return (
        <div key={index} className="evidence-item">
          <div className="evidence-header">
            <span className="evidence-index">#{index + 1}</span>
            <span className="evidence-type">HTML Content</span>
            {evidence.source && (
              <span className="evidence-source">{evidence.source}</span>
            )}
          </div>
          <div className="evidence-content html-content">
            <div 
              dangerouslySetInnerHTML={{ __html: cleanContent }}
              style={{ 
                maxHeight: '400px', 
                overflow: 'auto',
                border: '1px solid #e0e0e0',
                padding: '1rem',
                borderRadius: '4px',
                backgroundColor: '#fafafa'
              }}
            />
          </div>
        </div>
      );
    }
    
    // For non-HTML content, format as before
    const formattedEvidence = StreamParser.formatEvidence(evidence);
    
    return (
      <div key={index} className="evidence-item">
        <div className="evidence-header">
          <span className="evidence-index">#{index + 1}</span>
          <span className="evidence-type">JSON Data</span>
          {evidence.source && (
            <span className="evidence-source">{evidence.source}</span>
          )}
        </div>
        <div className="evidence-content">
          <pre>{formattedEvidence}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="evidence-display">
      <div className="evidence-header-section">
        <div className="evidence-title">
          <span className="evidence-icon">📄</span>
          <h3>참고 정보 (Evidence)</h3>
          <span className="evidence-count">{evidenceData.length}개</span>
        </div>
        <button 
          onClick={toggleExpanded}
          className="toggle-button"
          aria-label={isExpanded ? "접기" : "펼치기"}
        >
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </span>
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>

      {isExpanded && (
        <div className="evidence-content-section">
          <div className="evidence-description">
            <p>
              KMS에서 제공한 추가 참고 정보입니다. 
              응답 생성에 활용된 근거 자료나 관련 데이터를 확인할 수 있습니다.
            </p>
          </div>
          <div className="evidence-list">
            {evidenceData.map((evidence, index) => 
              renderEvidenceItem(evidence, index)
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceDisplay;