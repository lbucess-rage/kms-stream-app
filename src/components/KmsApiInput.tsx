import React from 'react';
import './KmsApiInput.css';

interface KmsApiInputProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
  disabled?: boolean;
}

const KmsApiInput: React.FC<KmsApiInputProps> = ({
  apiUrl,
  onApiUrlChange,
  disabled = false,
}) => {
  return (
    <div className="kms-api-input">
      <label htmlFor="api-url" className="api-input-label">
        KMS API URL
      </label>
      <input
        id="api-url"
        type="url"
        value={apiUrl}
        onChange={(e) => onApiUrlChange(e.target.value)}
        placeholder="http://10.62.130.84:19001/chat/query"
        className="api-input-field"
        disabled={disabled}
      />
      <div className="api-info">
        <small>
          Swagger API 문서: 
          <a 
            href="http://10.62.130.84:19001/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="api-docs-link"
          >
            http://10.62.130.84:19001/docs
          </a>
        </small>
      </div>
    </div>
  );
};

export default KmsApiInput;