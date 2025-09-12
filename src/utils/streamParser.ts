import { KmsResponse } from '../services/kmsApi';

export interface ParsedStreamData {
  chatContent: string;
  evidenceData: any[];
}

export class StreamParser {
  private chatContent: string = '';
  private evidenceData: any[] = [];

  reset(): void {
    this.chatContent = '';
    this.evidenceData = [];
  }

  processMessage(data: KmsResponse): ParsedStreamData {
    if (data.type === 'chat') {
      // Handle chat content - could be incremental or full response
      if (data.content) {
        // For incremental updates, just append the content
        this.chatContent += data.content;
      } else if (data.response) {
        // For full response, replace the content
        this.chatContent = data.response;
      }
    } else if (data.type === 'info') {
      // Handle evidence/info data
      if (data.evidence) {
        this.evidenceData.push(data.evidence);
      } else if (data.content) {
        // Evidence content might be in the content field
        this.evidenceData.push({
          type: 'evidence',
          content: data.content,
          source: 'KMS Evidence'
        });
      } else {
        // Push the entire data object as evidence
        this.evidenceData.push(data);
      }
    }

    return {
      chatContent: this.chatContent,
      evidenceData: [...this.evidenceData],
    };
  }

  getCurrentData(): ParsedStreamData {
    return {
      chatContent: this.chatContent,
      evidenceData: [...this.evidenceData],
    };
  }

  static formatEvidence(evidence: any): string {
    if (typeof evidence === 'string') {
      return evidence;
    }

    if (typeof evidence === 'object') {
      return JSON.stringify(evidence, null, 2);
    }

    return String(evidence);
  }
}