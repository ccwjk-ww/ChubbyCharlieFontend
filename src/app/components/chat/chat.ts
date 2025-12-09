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

  // ⭐ Quick questions - อัพเดทให้รองรับ Top Selling & Yearly Summary
  quickQuestions = [
    // สินค้า & Product
    { icon: '📦', text: 'สินค้าในระบบมีกี่ชิ้น?', color: '#667eea' },
    { icon: '🏷️', text: 'สินค้าแบ่งตาม category อย่างไร?', color: '#764ba2' },
    { icon: '🏆', text: 'จัดอันดับสินค้าขายดี Top 10 ปี 2568', color: '#f093fb' },  // ⭐ NEW

    // Stock & Inventory
    { icon: '📊', text: 'มูลค่า stock ทั้งหมดเท่าไหร่?', color: '#4ecdc4' },
    { icon: '⚠️', text: 'Stock ไหนใกล้หมดและควรสั่งซื้อเท่าไหร่?', color: '#ff6b6b' },
    { icon: '🇨🇳', text: 'China Stock กับ Thai Stock แตกต่างกันอย่างไร?', color: '#ff4757' },

    // Orders & Sales
    { icon: '💰', text: 'ยอดขายรายเดือน 12/2568 เท่าไหร่?', color: '#95e1d3' },
    { icon: '📈', text: 'สรุปยอดขายรายปี 2568 พร้อมรายเดือน', color: '#26de81' },  // ⭐ NEW
    { icon: '🛒', text: 'คำสั่งซื้อจากช่องทางไหนมากที่สุด?', color: '#5f27cd' },

    // Financial
    { icon: '💵', text: 'รายรับรายจ่ายกำไรสุทธิเดือน 6/2568', color: '#ffd93d' },
    { icon: '📊', text: 'สรุปรายรับรายจ่ายกำไรรายปี 2568', color: '#feca57' },  // ⭐ NEW
    { icon: '💸', text: 'Transaction ในระบบมีกี่รายการ?', color: '#ff9ff3' },

    // Employee & Salary
    { icon: '👥', text: 'จำนวนพนักงานมีกี่คน?', color: '#341f97' },
    { icon: '💼', text: 'เงินเดือนพนักงานเดือน 11/2568 เท่าไหร่?', color: '#5f27cd' },

    // Insights
    { icon: '💡', text: 'แนะนำการจัดการสต็อกให้ดีขึ้น', color: '#48dbfb' },
    { icon: '🎯', text: 'วิเคราะห์ธุรกิจโดยรวมประจำปี 2568', color: '#00d2d3' },  // ⭐ NEW
    { icon: '📋', text: 'สรุปภาพรวมระบบทั้งหมด', color: '#667eea' }
  ];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // ข้อความต้อนรับ
    this.addBotMessage(
      'สวัสดีครับ! ผม **Chubby AI Assistant** ผู้ช่วยระบบจัดการสต็อกอัจฉริยะ 🤖✨\n\n' +
      'ผมสามารถช่วยคุณได้ในเรื่อง:\n\n' +
      '📦 **สินค้า & Product** - ตรวจสอบจำนวนสินค้า, category, ราคา, **จัดอันดับสินค้าขายดี**\n' +
      '📊 **Stock & Inventory** - ดูสต็อกคงเหลือ, มูลค่า, Stock จากจีนและไทย\n' +
      '⚠️ **การพยากรณ์** - แจ้งเตือนสินค้าใกล้หมด, คำนวณควรสั่งซื้อเท่าไหร่\n' +
      '💰 **ยอดขาย & Orders** - วิเคราะห์ยอดขายรายเดือน, **สรุปยอดขายรายปี**, ช่องทางขาย\n' +
      '💵 **การเงิน** - ดูรายรับ-รายจ่าย, กำไรสุทธิ, **สรุปการเงินรายปี**, Transaction\n' +
      '👥 **พนักงาน** - ตรวจสอบจำนวนพนักงาน, ประเภท, บทบาท\n' +
      '💼 **เงินเดือน** - คำนวณเงินเดือนรายเดือน, รายวัน\n' +
      '💡 **การวิเคราะห์** - ให้คำแนะนำเชิงธุรกิจ, วิเคราะห์แนวโน้ม, **สรุปธุรกิจรายปี**\n\n' +
      '💬 **วิธีใช้งาน:**\n' +
      '• คลิกคำถามด่วนด้านซ้าย\n' +
      '• หรือพิมพ์คำถามของคุณเอง (รองรับภาษาไทยและอังกฤษ)\n' +
      '• ถามข้อมูลรายเดือน: "ยอดขาย 12/2568" หรือ "เงินเดือนเดือน 11 ปี 2568"\n' +
      '• ⭐ ถามข้อมูลรายปี: "สรุปยอดขายรายปี 2568" หรือ "จัดอันดับสินค้าขายดีปี 2568"\n\n' +
      '🚀 **พร้อมให้บริการแล้วครับ!**'
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
