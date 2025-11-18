import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockForecastDTO {
  forecastId: number;
  stockItemId: number;
  stockItemName: string;
  stockType: string;
  currentStock: number;
  currentStockValue: number;
  averageDailyUsage: number;
  averageWeeklyUsage: number;
  averageMonthlyUsage: number;
  daysUntilStockOut: number;
  estimatedStockOutDate: string;
  recommendedOrderQuantity: number;
  estimatedOrderCost: number;
  urgencyLevel: string;
  urgencyDescription: string;
  recommendations: string;
  analysisBasedOnDays: number;
  lastCalculatedDate: string;
  safetyStockDays: number;
  leadTimeDays: number;
}

export interface StockForecastSummaryDTO {
  totalItems: number;
  criticalItems: number;
  highUrgencyItems: number;
  mediumUrgencyItems: number;
  lowUrgencyItems: number;
  totalEstimatedCost: number;
  criticalItemsCost: number;
  highUrgencyItemsCost: number;
  lastUpdated: string;
}

export interface OrderGroupDTO {
  stockType: string;
  itemCount: number;
  totalCost: number;
  items: StockForecastDTO[];
}

export interface StockOrderRecommendationDTO {
  urgentItems: StockForecastDTO[];
  soonToOrderItems: StockForecastDTO[];
  totalItemsToOrder: number;
  totalOrderCost: number;
  priorityLevel: string;
  chinaStockOrders: OrderGroupDTO;
  thaiStockOrders: OrderGroupDTO;
}

@Injectable({
  providedIn: 'root'
})
export class StockForecastService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/stock-forecast';
  private adminApiUrl = 'https://www.chubbycharlieshop.com/api/stock-forecast/admin';

  constructor(private http: HttpClient) {}

  // ============================================
  // Calculation APIs
  // ============================================

  calculateAllForecasts(analysisBaseDays: number = 90): Observable<any> {
    const params = new HttpParams().set('analysisBaseDays', analysisBaseDays.toString());
    return this.http.post(`${this.apiUrl}/calculate-all`, null, { params });
  }

  calculateStockForecast(stockItemId: number, analysisBaseDays: number = 90): Observable<any> {
    const params = new HttpParams().set('analysisBaseDays', analysisBaseDays.toString());
    return this.http.post(`${this.apiUrl}/calculate/${stockItemId}`, null, { params });
  }

  // ============================================
  // Data Retrieval APIs
  // ============================================

  getUrgentStockItems(): Observable<StockForecastDTO[]> {
    return this.http.get<StockForecastDTO[]>(`${this.apiUrl}/urgent`);
  }

  getStockRunningOut(days: number = 30): Observable<StockForecastDTO[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<StockForecastDTO[]>(`${this.apiUrl}/running-out`, { params });
  }

  getForecastsByStockType(stockType: string): Observable<StockForecastDTO[]> {
    return this.http.get<StockForecastDTO[]>(`${this.apiUrl}/by-type/${stockType}`);
  }

  getForecastSummary(): Observable<StockForecastSummaryDTO> {
    return this.http.get<StockForecastSummaryDTO>(`${this.apiUrl}/summary`);
  }

  getOrderRecommendations(urgentDays: number = 14, soonDays: number = 30): Observable<StockOrderRecommendationDTO> {
    const params = new HttpParams()
      .set('urgentDays', urgentDays.toString())
      .set('soonDays', soonDays.toString());
    return this.http.get<StockOrderRecommendationDTO>(`${this.apiUrl}/order-recommendations`, { params });
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getUsageAnalysis(topItems: number = 30): Observable<any> {
    const params = new HttpParams().set('topItems', topItems.toString());
    return this.http.get(`${this.apiUrl}/usage-analysis`, { params });
  }

  exportForecastReport(urgencyLevel: string = 'ALL', stockType: string = 'ALL'): Observable<any> {
    const params = new HttpParams()
      .set('urgencyLevel', urgencyLevel)
      .set('stockType', stockType);
    return this.http.get(`${this.apiUrl}/export`, { params });
  }

  // ============================================
  // Management APIs
  // ============================================

  cleanupOldForecasts(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cleanup`);
  }

  // ============================================
  // Admin APIs
  // ============================================

  triggerCalculation(): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/trigger-calculation`, null);
  }

  triggerReport(): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/trigger-report`, null);
  }

  testSingleCalculation(stockItemId: number): Observable<any> {
    return this.http.post(`${this.adminApiUrl}/test-single/${stockItemId}`, null);
  }

  getSystemHealth(): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/health`);
  }

  resetAllForecasts(): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/reset-all`);
  }
}
