import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StockSummaryService, SystemSummary, StockLotSummary } from '../../services/stock-summary.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-stock-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stock-dashboard.html',
  styleUrls: ['./stock-dashboard.css']
})
export class StockDashboardComponent implements OnInit {
  systemSummary: SystemSummary | null = null;
  recentStockLots: StockLot[] = [];
  lotSummaries: Map<number, StockLotSummary> = new Map();
  loading: boolean = true;

  constructor(
    private stockSummaryService: StockSummaryService,
    private stockLotService: StockLotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // ⭐ โหลด system summary (ไม่ block loading)
    this.stockSummaryService.getSystemSummary().subscribe({
      next: (summary) => { this.systemSummary = summary; },
      error: (error) => console.error('Error loading system summary:', error)
    });

    // ⭐ โหลด lots แล้วรอ summaries ทุกตัวก่อน loading = false
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => {
        this.recentStockLots = lots.slice(0, 10);

        if (this.recentStockLots.length === 0) {
          this.loading = false;
          return;
        }

        // ⭐ forkJoin รอ summary ทุก lot พร้อมกัน
        const summaryRequests = this.recentStockLots
          .filter(lot => lot.stockLotId != null)
          .map(lot =>
            this.stockSummaryService.getStockLotSummary(lot.stockLotId!).pipe(
              catchError(() => of(null))  // ถ้า lot ไหน error ให้ส่ง null แทน
            )
          );

        forkJoin(summaryRequests).subscribe({
          next: (summaries) => {
            summaries.forEach((summary, index) => {
              const lot = this.recentStockLots.filter(l => l.stockLotId != null)[index];
              if (summary && lot?.stockLotId) {
                this.lotSummaries.set(lot.stockLotId, summary);
              }
            });
            // ⭐ ตั้ง loading = false หลังจาก summaries ทุกตัวโหลดเสร็จ
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading summaries:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading stock lots:', error);
        this.loading = false;
      }
    });
  }

  navigateToStockLots(): void { this.router.navigate(['/stock-lots']); }
  navigateToChinaStocks(): void { this.router.navigate(['/china-stocks']); }
  navigateToThaiStocks(): void { this.router.navigate(['/thai-stocks']); }
  navigateToStockLot(lotId: number): void { this.router.navigate(['/stock-lots', lotId]); }

  getLotSummary(lotId: number): StockLotSummary | null {
    return this.lotSummaries.get(lotId) || null;
  }

  lotHasVat(lotId: number): boolean {
    const summary = this.getLotSummary(lotId);
    return summary != null && (summary.totalVatAmount ?? 0) > 0;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING':   return 'status-pending';
      case 'IN_TRANSIT': return 'status-in-transit';
      case 'ARRIVED':   return 'status-arrived';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default:          return 'status-unknown';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status) {
      case 'PENDING':   return 'รอดำเนินการ';
      case 'ARRIVED':   return 'สินค้าถึงแล้ว';
      case 'COMPLETED': return 'เสร็จสมบูรณ์';
      case 'CANCELLED': return 'ยกเลิก';
      default:          return status || 'ไม่ทราบ';
    }
  }

  formatCurrency(amount: number | undefined | null): string {
    if (amount == null || amount === 0) return '฿0.00';
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH');
  }

  getChinaPercentage(): number {
    if (!this.systemSummary || this.systemSummary.totalItems === 0) return 0;
    return Math.round((this.systemSummary.totalChinaItems / this.systemSummary.totalItems) * 100);
  }

  getThaiPercentage(): number {
    if (!this.systemSummary || this.systemSummary.totalItems === 0) return 0;
    return Math.round((this.systemSummary.totalThaiItems / this.systemSummary.totalItems) * 100);
  }

  getActivePercentage(): number {
    if (!this.systemSummary || this.systemSummary.totalItems === 0) return 0;
    return Math.round((this.systemSummary.activeItems / this.systemSummary.totalItems) * 100);
  }
}
