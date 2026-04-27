// stock-forecast-dashboard.component.ts - ENHANCED VERSION
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  StockForecastService,
  StockForecastSummaryDTO,
  StockForecastDTO
} from '../../services/stock-forecast.service';

@Component({
  selector: 'app-stock-forecast-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stock-forecast-dashboard.html',
  styleUrls: ['./stock-forecast-dashboard.css']
})
export class StockForecastDashboardComponent implements OnInit {
  // Data
  summary: StockForecastSummaryDTO | null = null;
  urgentItems: StockForecastDTO[] = [];
  soonestToRunOut: StockForecastDTO[] = [];

  // ⭐ NEW: การคาดการณ์เดือนถัดไป
  nextMonthPredictions: any[] = [];
  nextMonthSummary: any = null;

  // Counts
  chinaStockCount: number = 0;
  thaiStockCount: number = 0;
  urgentOrderCost: number = 0;

  // States
  loading: boolean = false;
  calculating: boolean = false;

  constructor(
    private stockForecastService: StockForecastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadNextMonthPredictions(); // ⭐ NEW
  }

  /**
   * โหลดข้อมูล dashboard
   */
  loadDashboard(): void {
    this.loading = true;
    this.stockForecastService.getDashboard().subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.urgentItems = data.urgentItems || [];
        this.soonestToRunOut = data.soonestToRunOut || [];
        this.chinaStockCount = data.chinaStockCount || 0;
        this.thaiStockCount = data.thaiStockCount || 0;
        this.urgentOrderCost = data.urgentOrderCost || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        alert('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        this.loading = false;
      }
    });
  }

  /**
   * ⭐ NEW: โหลดการคาดการณ์เดือนถัดไป
   */
  loadNextMonthPredictions(): void {
    this.stockForecastService.getNextMonthPredictions().subscribe({
      next: (data) => {
        this.nextMonthPredictions = (data.predictions || []).slice(0, 10); // เอา 10 อันดับแรก
        this.nextMonthSummary = {
          totalPredicted: data.totalPredictedNextMonthUsage || 0,
          averageConfidence: data.averageConfidence || 0,
          nextMonth: this.nextMonthPredictions.length > 0 ? this.nextMonthPredictions[0].nextMonth : 'N/A'
        };
      },
      error: (error) => {
        console.error('Error loading predictions:', error);
      }
    });
  }

  /**
   * คำนวณ forecast ใหม่
   */
  calculateForecasts(): void {
    if (!confirm('คำนวณ Stock Forecast ทั้งหมดใหม่หรือไม่?\n\n(ใช้เวลาประมาณ 1-2 นาที)')) {
      return;
    }

    this.calculating = true;
    this.stockForecastService.calculateAllForecasts(180).subscribe({
      next: (response) => {
        alert(`✅ คำนวณสำเร็จ!\n\n📊 ประมวลผล: ${response.totalItems} รายการ`);
        this.calculating = false;
        this.loadDashboard();
        this.loadNextMonthPredictions(); // ⭐ NEW: โหลดการคาดการณ์ใหม่
      },
      error: (error) => {
        console.error('Error calculating forecasts:', error);
        alert('❌ เกิดข้อผิดพลาดในการคำนวณ กรุณาลองใหม่อีกครั้ง');
        this.calculating = false;
      }
    });
  }

  /**
   * Refresh ข้อมูล
   */
  refresh(): void {
    this.loadDashboard();
    this.loadNextMonthPredictions();
  }

  // ============================================
  // Navigation Methods
  // ============================================

  navigateToUrgentItems(): void {
    this.router.navigate(['/stock-forecast/urgent']);
  }

  navigateToRecommendations(): void {
    this.router.navigate(['/stock-forecast/recommendations']);
  }

  navigateToAnalysis(): void {
    this.router.navigate(['/stock-forecast/analysis']);
  }

  // ============================================
  // Helper Methods
  // ============================================

  getUrgencyClass(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'CRITICAL': return 'urgency-critical';
      case 'HIGH': return 'urgency-high';
      case 'MEDIUM': return 'urgency-medium';
      case 'LOW': return 'urgency-low';
      default: return 'urgency-unknown';
    }
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

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProgressPercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  }
}
