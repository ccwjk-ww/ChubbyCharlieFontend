// stock-forecast-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  StockForecastService,
  StockForecastSummaryDTO,
  StockForecastDTO,
  AIRecommendationDTO
} from '../../services/stock-forecast.service';

@Component({
  selector: 'app-stock-forecast-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stock-forecast-dashboard.html',
  styleUrls: ['./stock-forecast-dashboard.css']
})
export class StockForecastDashboardComponent implements OnInit {
  summary: StockForecastSummaryDTO | null = null;
  urgentItems: StockForecastDTO[] = [];
  soonestToRunOut: StockForecastDTO[] = [];
  aiRecommendations: AIRecommendationDTO | null = null;
  chinaStockCount: number = 0;
  thaiStockCount: number = 0;
  urgentOrderCost: number = 0;
  loading: boolean = false;
  calculating: boolean = false;
  calculatingAI: boolean = false;
  loadingAI: boolean = false;

  constructor(
    private stockForecastService: StockForecastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadAIRecommendations();
  }

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
        this.loading = false;
      }
    });
  }

  loadAIRecommendations(): void {
    this.loadingAI = true;
    this.stockForecastService.getAIRecommendations().subscribe({
      next: (data) => {
        this.aiRecommendations = data;
        this.loadingAI = false;
      },
      error: (error) => {
        console.error('Error loading AI recommendations:', error);
        this.loadingAI = false;
      }
    });
  }

  calculateForecasts(): void {
    if (confirm('This will recalculate all stock forecasts using basic analysis. Continue?')) {
      this.calculating = true;
      this.stockForecastService.calculateAllForecasts().subscribe({
        next: () => {
          alert('Stock forecasts calculated successfully!');
          this.calculating = false;
          this.loadDashboard();
        },
        error: (error) => {
          console.error('Error calculating forecasts:', error);
          alert('Error calculating forecasts. Please try again.');
          this.calculating = false;
        }
      });
    }
  }

  /**
   * 🤖 NEW: Calculate forecasts with AI enhancement
   */
  calculateForecastsWithAI(): void {
    if (confirm('This will recalculate all stock forecasts with AI-powered analysis. This may take a few minutes. Continue?')) {
      this.calculatingAI = true;
      this.stockForecastService.calculateAllForecastsWithAI(90).subscribe({
        next: (response) => {
          alert(`AI-Enhanced forecasts calculated successfully!\n\n✅ Success: ${response.successCount || 0}\n❌ Failed: ${response.failureCount || 0}`);
          this.calculatingAI = false;
          this.loadDashboard();
          this.loadAIRecommendations();
        },
        error: (error) => {
          console.error('Error calculating AI forecasts:', error);
          alert('Error calculating AI-enhanced forecasts. Please try again.');
          this.calculatingAI = false;
        }
      });
    }
  }

  navigateToUrgentItems(): void {
    this.router.navigate(['/stock-forecast/urgent']);
  }

  navigateToRecommendations(): void {
    this.router.navigate(['/stock-forecast/recommendations']);
  }

  navigateToAnalysis(): void {
    this.router.navigate(['/stock-forecast/analysis']);
  }

  /**
   * Navigate to AI Recommendations page
   */
  navigateToAIRecommendations(): void {
    this.router.navigate(['/stock-forecast/ai-recommendations']);
  }

  getUrgencyClass(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'CRITICAL':
        return 'urgency-critical';
      case 'HIGH':
        return 'urgency-high';
      case 'MEDIUM':
        return 'urgency-medium';
      case 'LOW':
        return 'urgency-low';
      default:
        return 'urgency-unknown';
    }
  }

  /**
   * Get trend icon based on AI trend
   */
  getTrendIcon(trend: string | undefined): string {
    if (!trend) return 'bi-dash-circle';
    switch (trend.toUpperCase()) {
      case 'INCREASING':
        return 'bi-arrow-up-circle-fill';
      case 'DECREASING':
        return 'bi-arrow-down-circle-fill';
      case 'STABLE':
        return 'bi-dash-circle-fill';
      default:
        return 'bi-dash-circle';
    }
  }

  /**
   * Get trend class for styling
   */
  getTrendClass(trend: string | undefined): string {
    if (!trend) return '';
    switch (trend.toUpperCase()) {
      case 'INCREASING':
        return 'trend-increasing';
      case 'DECREASING':
        return 'trend-decreasing';
      case 'STABLE':
        return 'trend-stable';
      default:
        return '';
    }
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH');
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('th-TH');
  }

  getProgressPercentage(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  }

  /**
   * Check if item has AI enhancement
   */
  isAIPowered(item: StockForecastDTO): boolean {
    return item.aiPowered === true;
  }

  /**
   * Get AI confidence badge color
   */
  getConfidenceClass(confidence: number | undefined): string {
    if (!confidence) return 'confidence-unknown';
    if (confidence >= 80) return 'confidence-high';
    if (confidence >= 60) return 'confidence-medium';
    return 'confidence-low';
  }
}
