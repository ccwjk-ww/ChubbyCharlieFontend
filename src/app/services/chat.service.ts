import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/chat';

  constructor(private http: HttpClient) {}

  /**
   * ส่งข้อความไปยัง AI
   */
  sendMessage(message: string, context?: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      message,
      context
    };
    return this.http.post<ChatResponse>(this.apiUrl, request);
  }

  /**
   * ตรวจสอบสถานะ API
   */
  checkHealth(): Observable<string> {
    return this.http.get(`${this.apiUrl}/health`, { responseType: 'text' });
  }
}
