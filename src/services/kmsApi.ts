export interface KmsRequest {
  message: string;
  username: string;
  history: any[];
  stream: boolean;
}

export interface KmsResponse {
  type: 'chat' | 'info';
  content?: string;
  response?: string;
  evidence?: any;
  [key: string]: any;
}

export interface StreamCallbacks {
  onMessage: (data: KmsResponse) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

class KmsApiService {
  private abortController: AbortController | null = null;

  async query(
    apiUrl: string, 
    request: KmsRequest
  ): Promise<KmsResponse> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: false }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Regular API response:', data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name !== 'AbortError') {
          throw error;
        }
      }
      throw new Error('Unknown error occurred');
    } finally {
      this.abortController = null;
    }
  }

  async streamQuery(
    apiUrl: string, 
    request: KmsRequest, 
    callbacks: StreamCallbacks
  ): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'text/event-stream',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') continue;
          
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            
            if (dataStr === '[DONE]') {
              callbacks.onComplete();
              return;
            }

            try {
              // KMS returns Python dict format like {'type': 'info', 'content': '...'}
              let parsedData: KmsResponse;

              // First try to parse as JSON
              try {
                parsedData = JSON.parse(dataStr);
              } catch {
                // If JSON parsing fails, try converting Python dict to JSON
                if (dataStr.includes("{'") || dataStr.includes("': '")) {
                  // Simple Python dict to JSON conversion
                  const jsonStr = dataStr
                    .replace(/'/g, '"')           // Replace single quotes with double quotes
                    .replace(/True/g, 'true')     // Python True to JSON true  
                    .replace(/False/g, 'false')   // Python False to JSON false
                    .replace(/None/g, 'null');    // Python None to JSON null
                  
                  parsedData = JSON.parse(jsonStr);
                } else {
                  // Manual extraction as fallback
                  const typeMatch = dataStr.match(/['"]type['"]:\s*['"]([^'"]+)['"]/);
                  let contentMatch = dataStr.match(/['"]content['"]:\s*['"](.+?)['"]$/);
                  
                  // For very long content, try alternative pattern
                  if (!contentMatch) {
                    contentMatch = dataStr.match(/['"]content['"]:\s*['"](.+)/);
                    if (contentMatch) {
                      // Remove trailing quote if exists
                      contentMatch[1] = contentMatch[1].replace(/['"]$/, '');
                    }
                  }
                  
                  if (typeMatch) {
                    parsedData = {
                      type: typeMatch[1] as 'chat' | 'info',
                      content: contentMatch ? contentMatch[1] : ''
                    };
                  } else {
                    throw new Error('Could not extract type and content');
                  }
                }
              }

              callbacks.onMessage(parsedData);
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', dataStr.substring(0, 200) + '...', parseError);
              // As last resort, treat entire data as content if it seems meaningful
              if (dataStr.length > 10) {
                callbacks.onMessage({
                  type: 'info',
                  content: dataStr
                });
              }
            }
          }
        }
      }

      callbacks.onComplete();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Stream aborted');
        } else {
          callbacks.onError(error);
        }
      } else {
        callbacks.onError(new Error('Unknown error occurred'));
      }
    } finally {
      this.abortController = null;
    }
  }

  stopStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  createRequest(message: string, username: string = 'admin'): KmsRequest {
    return {
      message,
      username,
      history: [],
      stream: true,
    };
  }
}

export const kmsApiService = new KmsApiService();