import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  StockForecastService,
  StockOrderRecommendationDTO,
  StockForecastDTO
} from '../../services/stock-forecast.service';

/**
 * ✅ Stock Forecast Recommendations Component - IMPROVED VERSION
 * ปรับปรุงให้เข้าใจง่ายและใช้งานสะดวก
 */
@Component({
  selector: 'app-stock-forecast-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-forecast-recommendations.html',
  styleUrls: ['./stock-forecast-recommendations.css']
})
export class StockForecastRecommendationsComponent implements OnInit {
  // ============================================
  // ข้อมูลหลัก
  // ============================================
  recommendations: StockOrderRecommendationDTO | null = null;
  loading: boolean = false;

  // ============================================
  // การแสดงผล - ใช้ Tab เดียวให้เข้าใจง่าย
  // ============================================
  selectedTab: 'all' | 'urgent' | 'china' | 'thai' = 'all';

  // ⚠️ ลบ expandedItems ออก - ไม่จำเป็น ทำให้ UI ซับซ้อน
  // expandedItems: Set<number> = new Set();

  constructor(
    private stockForecastService: StockForecastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  // ============================================
  // โหลดข้อมูล
  // ============================================
  loadRecommendations(): void {
    this.loading = true;
    // ✅ ใช้ค่า default ที่เหมาะสม ไม่ต้องให้ user ปรับ
    const urgentDays = 14;  // เร่งด่วน = Stock หมดใน 14 วัน
    const soonDays = 30;     // วางแผน = Stock หมดใน 30 วัน

    this.stockForecastService.getOrderRecommendations(urgentDays, soonDays).subscribe({
      next: (data) => {
        this.recommendations = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading recommendations:', error);
        alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        this.loading = false;
      }
    });
  }

  refreshRecommendations(): void {
    this.loadRecommendations();
  }

  // ============================================
  // ⚠️ ฟังก์ชันที่ไม่จำเป็น - ลบออก
  // ============================================
  // toggleItemExpansion() - ซับซ้อนเกินไป แสดงข้อมูลเต็มเลยดีกว่า
  // isItemExpanded() - ไม่ใช้แล้ว

  // ============================================
  // Helper Methods - เก็บไว้เฉพาะที่จำเป็น
  // ============================================

  getUrgencyClass(urgencyLevel: string): string {
    const classMap: { [key: string]: string } = {
      'CRITICAL': 'urgency-critical',
      'HIGH': 'urgency-high',
      'MEDIUM': 'urgency-medium',
      'LOW': 'urgency-low'
    };
    return classMap[urgencyLevel] || 'urgency-unknown';
  }

  getPriorityClass(level: string): string {
    const classMap: { [key: string]: string } = {
      'CRITICAL': 'priority-critical',
      'HIGH': 'priority-high',
      'MEDIUM': 'priority-medium'
    };
    return classMap[level] || 'priority-low';
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatNumber(num: number | undefined): string {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ============================================
  // การนำทาง
  // ============================================

  goBack(): void {
    this.router.navigate(['/stock-forecast']);
  }

  // ============================================
  // ⚠️ Export/Print - ลบออก (ซับซ้อน ใช้น้อย)
  // ============================================
  // exportRecommendations() - User ไม่ค่อยใช้
  // printRecommendations() - User สามารถ Ctrl+P ได้

  // ============================================
  // ✅ เพิ่ม: Computed Properties สำหรับแสดงผล
  // ============================================

  /**
   * รายการทั้งหมดที่ต้องสั่งซื้อ
   */
  get allItems(): StockForecastDTO[] {
    if (!this.recommendations) return [];
    return [
      ...this.recommendations.urgentItems,
      ...this.recommendations.soonToOrderItems
    ];
  }

  /**
   * กรอง Items ตาม Tab ที่เลือก
   */
  get filteredItems(): StockForecastDTO[] {
    if (!this.recommendations) return [];

    switch (this.selectedTab) {
      case 'urgent':
        return this.recommendations.urgentItems;
      case 'china':
        return this.allItems.filter(item => item.stockType === 'CHINA');
      case 'thai':
        return this.allItems.filter(item => item.stockType === 'THAI');
      default: // 'all'
        return this.allItems;
    }
  }

  /**
   * นับจำนวน Items แต่ละประเภท
   */
  get urgentCount(): number {
    return this.recommendations?.urgentItems.length || 0;
  }

  get chinaCount(): number {
    return this.allItems.filter(item => item.stockType === 'CHINA').length;
  }

  get thaiCount(): number {
    return this.allItems.filter(item => item.stockType === 'THAI').length;
  }

  /**
   * คำนวณต้นทุนรวม
   */
  get totalCost(): number {
    return this.filteredItems.reduce((sum, item) => sum + (item.estimatedOrderCost || 0), 0);
  }

  get totalQuantity(): number {
    return this.filteredItems.reduce((sum, item) => sum + (item.recommendedOrderQuantity || 0), 0);
  }
}
