import React, { useState, KeyboardEvent } from 'react';
import './QuestionInput.css';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  placeholder?: string;
  history?: string[];
}

const QuestionInput: React.FC<QuestionInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "질문을 입력하세요...",
  history = [],
}) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (question.trim() && !disabled) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="question-input">
      <label htmlFor="question" className="question-input-label">
        사용자 질문
      </label>
      <div className="question-input-container">
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="question-textarea"
          disabled={disabled}
          rows={4}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !question.trim()}
          className="submit-button"
        >
          {disabled ? '처리 중...' : '전송'}
        </button>
      </div>
      <div className="question-help">
        <small>
          Enter 키로 전송, Shift + Enter로 줄바꿈
        </small>
      </div>
      
      {history.length > 0 && (
        <div className="question-history">
          <div className="history-title">
            <span className="history-icon">🕐</span>
            <span>최근 질문 ({history.length}개)</span>
          </div>
          <div className="history-list">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => setQuestion(item)}
                disabled={disabled}
                className="history-item"
                title={item}
              >
                {item.length > 50 ? `${item.substring(0, 50)}...` : item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionInput;