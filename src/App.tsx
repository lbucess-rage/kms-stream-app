import React, { useState } from 'react';
import KmsApiInput from './components/KmsApiInput';
import QuestionInput from './components/QuestionInput';
import StreamResponse from './components/StreamResponse';
import EvidenceDisplay from './components/EvidenceDisplay';
import { kmsApiService } from './services/kmsApi';
import { StreamParser } from './utils/streamParser';
import './App.css';

function App() {
  const [apiUrl, setApiUrl] = useState('http://10.62.130.84:19001/chat/query');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamMode, setStreamMode] = useState(true); // true: streaming, false: regular
  const [chatContent, setChatContent] = useState('');
  const [evidenceData, setEvidenceData] = useState<any[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [requestHistory, setRequestHistory] = useState<string[]>([]);

  const streamParser = new StreamParser();

  const handleSubmitQuestion = async (question: string) => {
    if (!apiUrl.trim()) {
      setError('API URL을 입력해주세요.');
      return;
    }

    // Add original question to history (without markdown prompt)
    if (question.trim() && !requestHistory.includes(question.trim())) {
      setRequestHistory(prev => [question.trim(), ...prev.slice(0, 9)]); // Keep only 10 items
    }

    setIsStreaming(true);
    setError(undefined);
    setChatContent('');
    setEvidenceData([]);
    streamParser.reset();

    // Add markdown prompt suffix for better formatting (hidden from UI)
    const enhancedQuestion = question + ' 마크다운 형식으로 알려줘';
    const request = kmsApiService.createRequest(enhancedQuestion);

    try {
      if (streamMode) {
        // Streaming mode
        await kmsApiService.streamQuery(apiUrl, request, {
          onMessage: (data) => {
            const parsed = streamParser.processMessage(data);
            setChatContent(parsed.chatContent);
            setEvidenceData(parsed.evidenceData);
          },
          onError: (err) => {
            console.error('Stream error:', err);
            setError(err.message);
            setIsStreaming(false);
          },
          onComplete: () => {
            setIsStreaming(false);
          },
        });
      } else {
        // Regular mode
        const response = await kmsApiService.query(apiUrl, request);
        console.log('Regular mode response:', response);
        
        // Handle regular mode response format: {response: "text", conversation_id: "id", evidence: [...]}
        if (response.response) {
          // Main chat response is in the "response" field
          setChatContent(response.response);
        }
        
        if (response.evidence && Array.isArray(response.evidence)) {
          // Evidence array contains info items
          setEvidenceData(response.evidence);
        }
        setIsStreaming(false);
      }
    } catch (err) {
      console.error('Request error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setIsStreaming(false);
    }
  };

  const handleStopStream = () => {
    kmsApiService.stopStream();
    setIsStreaming(false);
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>🤖 KMS Stream Sample</h1>
          <p>KMS API를 이용한 실시간 스트리밍 응답 샘플</p>
        </header>

        <main className="app-main">
          <div className="input-section">
            <KmsApiInput 
              apiUrl={apiUrl}
              onApiUrlChange={setApiUrl}
              disabled={isStreaming}
            />
            
            <div className="mode-toggle">
              <label className="toggle-label">
                <span className="toggle-text">응답 모드:</span>
                <div className="toggle-switch">
                  <input 
                    type="checkbox"
                    checked={streamMode}
                    onChange={(e) => setStreamMode(e.target.checked)}
                    disabled={isStreaming}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-option left">일반</span>
                    <span className="toggle-option right">스트림</span>
                  </span>
                </div>
              </label>
            </div>
            
            <QuestionInput 
              onSubmit={handleSubmitQuestion}
              disabled={isStreaming}
              history={requestHistory}
            />

            {isStreaming && streamMode && (
              <button 
                onClick={handleStopStream}
                className="stop-button"
              >
                ⏹️ 중단
              </button>
            )}
          </div>

          <div className="response-section">
            <StreamResponse 
              content={chatContent}
              isLoading={isStreaming}
              error={error}
            />

            <EvidenceDisplay evidenceData={evidenceData} />
          </div>
        </main>

        <footer className="app-footer">
          <p>
            Powered by React {React.version} • 
            <a 
              href="http://10.62.130.84:19001/docs" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              KMS API Docs
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
