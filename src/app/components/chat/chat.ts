import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatResponse } from '../../services/chat.service';
import { Nl2brPipe } from '../../pipe/nl2br.pipe';

export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, Nl2brPipe],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: Message[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  private shouldScroll = false;

  // Quick questions
  quickQuestions = [
    { icon: '📦', text: 'สินค้าในระบบมีอะไรบ้าง?', color: '#667eea' },
    { icon: '📊', text: 'สต็อกคงเหลือเท่าไร?', color: '#f093fb' },
    { icon: '⚠️', text: 'สินค้าไหนใกล้หมดบ้าง?', color: '#ff6b6b' },
    { icon: '💰', text: 'ยอดขายเป็นอย่างไร?', color: '#4ecdc4' },
    { icon: '📈', text: 'วิเคราะห์แนวโน้มการขาย', color: '#95e1d3' },
    { icon: '💡', text: 'แนะนำการจัดการสต็อก', color: '#ffd93d' }
  ];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // ข้อความต้อนรับ
    this.addBotMessage(
      'สวัสดีครับ! ผม **Chubby AI** ผู้ช่วยระบบจัดการสต็อก 🤖\n\n' +
      'ผมสามารถช่วยคุณได้ในเรื่อง:\n\n' +
      '📦 **ตรวจสอบสินค้าคงเหลือ** - ดูรายการสินค้าและจำนวนในสต็อก\n' +
      '📊 **วิเคราะห์ยอดขาย** - สรุปยอดขายและแนวโน้ม\n' +
      '⚠️ **เตือนสต็อกใกล้หมด** - แจ้งเตือนสินค้าที่ต้องสั่งซื้อเร่งด่วน\n' +
      '💡 **แนะนำการจัดการ** - คำแนะนำในการจัดการสต็อกอย่างมีประสิทธิภาพ\n' +
      '📈 **พยากรณ์ความต้องการ** - ทำนายความต้องการสินค้าในอนาคต\n\n' +
      '💬 **คลิกคำถามด่วนด้านล่าง** หรือพิมพ์คำถามของคุณได้เลยครับ!'
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /**
   * ส่งข้อความ
   */
  sendMessage(message?: string): void {
    const messageToSend = message || this.currentMessage;

    if (!messageToSend.trim() || this.isLoading) {
      return;
    }

    this.addUserMessage(messageToSend);
    if (!message) {
      this.currentMessage = '';
    }
    this.isLoading = true;

    // เรียก API
    this.chatService.sendMessage(messageToSend).subscribe({
      next: (response: ChatResponse) => {
        this.isLoading = false;
        if (response.success) {
          this.addBotMessage(response.response);
        } else {
          this.addBotMessage('❌ **ขออภัยครับ เกิดข้อผิดพลาด**\n\n' + response.error);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.addBotMessage(
          '❌ **ขออภัยครับ ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้**\n\n' +
          '**กรุณาตรวจสอบ:**\n' +
          '• ✅ เชื่อมต่ออินเทอร์เน็ต\n' +
          '• ✅ Backend Server ทำงานอยู่\n' +
          '• ✅ Gemini API Key ถูกต้อง\n\n' +
          'หากปัญหายังคงมีอยู่ กรุณาติดต่อผู้ดูแลระบบ'
        );
        console.error('Chat error:', error);
      }
    });
  }

  /**
   * ส่งคำถามด่วน
   */
  sendQuickQuestion(question: string): void {
    this.sendMessage(question);
  }

  /**
   * เพิ่มข้อความของ user
   */
  private addUserMessage(text: string): void {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
    this.shouldScroll = true;
  }

  /**
   * เพิ่มข้อความของ bot
   */
  private addBotMessage(text: string): void {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
    this.shouldScroll = true;
  }

  /**
   * Scroll ไปด้านล่างสุด
   */
  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Scroll error:', err);
    }
  }

  /**
   * กด Enter เพื่อส่งข้อความ
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * ล้างประวัติการสนทนา
   */
  clearChat(): void {
    if (this.messages.length > 1) {
      if (confirm('🗑️ ต้องการล้างประวัติการสนทนาทั้งหมดใช่ไหม?')) {
        this.messages = [];
        this.addBotMessage(
          '✅ **ล้างประวัติการสนทนาเรียบร้อยแล้วครับ**\n\n' +
          'มีอะไรให้ผมช่วยเหลือไหมครับ? 😊'
        );
      }
    }
  }

  /**
   * Export ประวัติการสนทนา
   */
  exportChat(): void {
    if (this.messages.length === 0) {
      alert('ไม่มีประวัติการสนทนาที่จะ export');
      return;
    }

    const chatHistory = this.messages.map(m =>
      `[${m.timestamp.toLocaleString('th-TH')}] ${m.isUser ? '👤 You' : '🤖 AI'}:\n${m.text}`
    ).join('\n\n' + '='.repeat(80) + '\n\n');

    const header = `Chubby Charlie AI Chat History\nExported: ${new Date().toLocaleString('th-TH')}\n${'='.repeat(80)}\n\n`;
    const fullContent = header + chatHistory;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('✅ ส่งออกประวัติการสนทนาเรียบร้อยแล้ว!');
  }

  /**
   * Refresh conversation
   */
  refreshChat(): void {
    location.reload();
  }
}
