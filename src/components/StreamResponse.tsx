import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './StreamResponse.css';

interface StreamResponseProps {
  content: string;
  isLoading: boolean;
  error?: string;
}

const StreamResponse: React.FC<StreamResponseProps> = ({
  content,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <div className="stream-response">
        <div className="response-header">
          <h3>응답</h3>
        </div>
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <strong>오류가 발생했습니다:</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content && !isLoading) {
    return (
      <div className="stream-response">
        <div className="response-header">
          <h3>응답</h3>
        </div>
        <div className="empty-state">
          질문을 입력하여 KMS에 문의해보세요.
        </div>
      </div>
    );
  }

  return (
    <div className="stream-response">
      <div className="response-header">
        <h3>응답</h3>
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      <div className="response-content">
        {content && (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            className="markdown-content"
          >
            {content}
          </ReactMarkdown>
        )}
        {isLoading && content && (
          <span className="typing-cursor">▋</span>
        )}
      </div>
    </div>
  );
};

export default StreamResponse;