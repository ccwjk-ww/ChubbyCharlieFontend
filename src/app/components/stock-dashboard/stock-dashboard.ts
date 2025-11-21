import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StockSummaryService, SystemSummary, StockLotSummary } from '../../services/stock-summary.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';

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
  loading: boolean = false;

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

    // Load system summary
    this.stockSummaryService.getSystemSummary().subscribe({
      next: (summary) => {
        this.systemSummary = summary;
      },
      error: (error) => console.error('Error loading system summary:', error)
    });

    // Load recent stock lots
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => {
        this.recentStockLots = lots.slice(0, 5); // Get first 5 lots

        // Load summaries for each lot
        this.recentStockLots.forEach(lot => {
          if (lot.stockLotId) {
            this.stockSummaryService.getStockLotSummary(lot.stockLotId).subscribe({
              next: (summary) => {
                this.lotSummaries.set(lot.stockLotId!, summary);
              },
              error: (error) => console.error('Error loading lot summary:', error)
            });
          }
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stock lots:', error);
        this.loading = false;
      }
    });
  }

  navigateToStockLots(): void {
    this.router.navigate(['/stock-lots']);
  }

  navigateToChinaStocks(): void {
    this.router.navigate(['/china-stocks']);
  }

  navigateToThaiStocks(): void {
    this.router.navigate(['/thai-stocks']);
  }

  navigateToStockLot(lotId: number): void {
    this.router.navigate(['/stock-lots', lotId]);
  }

  getLotSummary(lotId: number): StockLotSummary | null {
    return this.lotSummaries.get(lotId) || null;
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'IN_TRANSIT':
        return 'status-in-transit';
      case 'ARRIVED':
        return 'status-arrived';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.000';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH');
  }

  // Helper methods for calculating percentages
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
