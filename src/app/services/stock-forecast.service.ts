// stock-forecast.service.ts - ENHANCED VERSION with Monthly Analysis
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================
// ⭐ ENHANCED DTOs with Monthly Analysis
// ============================================

export interface MonthlyUsageDTO {
  month: string; // "2025-01"
  totalUsage: number;
  totalOrderQuantity: number;
  averageDailyUsage: number;
  daysInMonth: number;
}

export interface StockForecastDTO {
  forecastId: number;
  stockItemId: number;
  stockItemName: string;
  stockType: string;

  // ข้อมูล Stock ปัจจุบัน
  currentStock: number;
  currentStockValue: number;

  // ⭐ NEW: การวิเคราะห์รายเดือน (6 เดือน)
  monthlyUsageHistory?: MonthlyUsageDTO[]; // ยอดใช้แต่ละเดือน
  last6MonthsUsage?: { [month: string]: number }; // {"2024-12": 500, "2025-01": 600}

  // ⭐ NEW: การคาดการณ์เดือนถัดไป
  predictedNextMonthUsage?: number; // คาดการณ์เดือนหน้าจะใช้เท่าไหร่
  nextMonth?: string; // "2025-02"
  forecastMethod?: string; // "AVERAGE", "LINEAR_REGRESSION", "WEIGHTED_AVERAGE"
  forecastConfidence?: number; // ความมั่นใจ 0-100%

  // ⭐ NEW: Trend Analysis
  usageTrend?: string; // "INCREASING", "DECREASING", "STABLE"
  trendPercentage?: number; // เปอร์เซ็นต์การเปลี่ยนแปลง
  trendDirection?: number; // 1 = เพิ่มขึ้น, 0 = คงที่, -1 = ลดลง

  // การวิเคราะห์ความต้องการ (เดิม)
  averageDailyUsage: number;
  averageWeeklyUsage: number;
  averageMonthlyUsage: number; // ค่าเฉลี่ยจาก 6 เดือน

  // การคาดการณ์
  daysUntilStockOut: number;
  estimatedStockOutDate: string;

  // ⭐ UPDATED: คำแนะนำการสั่งซื้อ
  recommendedOrderQuantity: number; // แนะนำสั่งซื้อเท่าไหร่
  recommendedOrderForNextMonth?: number; // สำหรับเดือนหน้าโดยเฉพาะ
  estimatedOrderCost: number;

  // ⭐ NEW: การวิเคราะห์เพิ่มเติม
  maxMonthlyUsage?: number; // เดือนที่ใช้มากที่สุด
  minMonthlyUsage?: number; // เดือนที่ใช้น้อยที่สุด

  // สถานะความเร่งด่วน
  urgencyLevel: string;
  urgencyDescription: string;
  recommendations: string;

  // ข้อมูลการวิเคราะห์
  analysisBasedOnDays: number;
  analysisBasedOnMonths?: number; // ⭐ NEW: จำนวนเดือนที่วิเคราะห์ (6)
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

  // ⭐ NEW: เพิ่มสรุปการคาดการณ์
  totalPredictedNextMonthUsage?: number; // รวมยอดคาดการณ์เดือนหน้า
  averageForecastConfidence?: number; // ความมั่นใจเฉลี่ย
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

// ⭐ NEW: Monthly Analysis Response
export interface MonthlyAnalysisDTO {
  stockItemId: number;
  stockItemName: string;
  stockType: string;
  currentStock: number;
  monthlyUsageHistory: MonthlyUsageDTO[];
  averageMonthlyUsage: number;
  predictedNextMonthUsage: number;
  forecastMethod: string;
  confidence: number;
  trend: string;
  trendPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockForecastService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/stock-forecast';
  // private apiUrl = 'http://localhost:8080/api/stock-forecast';
  private adminApiUrl = 'https://www.chubbycharlieshop.com/api/stock-forecast/admin';

  constructor(private http: HttpClient) {}

  // ============================================
  // การคำนวณ Forecast (อัพเดท)
  // ============================================

  /**
   * คำนวณ forecast ทั้งหมด (ใช้ algorithm ใหม่)
   */
  calculateAllForecasts(analysisBaseDays: number = 180): Observable<any> {
    const params = new HttpParams().set('analysisBaseDays', analysisBaseDays.toString());
    return this.http.post<any>(`${this.apiUrl}/calculate-all`, null, { params });
  }

  /**
   * คำนวณ forecast สำหรับ stock item เดียว
   */
  calculateStockForecast(stockItemId: number, analysisBaseDays: number = 180): Observable<any> {
    const params = new HttpParams().set('analysisBaseDays', analysisBaseDays.toString());
    return this.http.post<any>(`${this.apiUrl}/calculate/${stockItemId}`, null, { params });
  }

  // ============================================
  // ⭐ NEW: Monthly Analysis APIs
  // ============================================

  /**
   * ดึงการวิเคราะห์รายเดือนสำหรับ stock item เดียว
   */
  getMonthlyAnalysis(stockItemId: number): Observable<MonthlyAnalysisDTO> {
    return this.http.get<MonthlyAnalysisDTO>(`${this.apiUrl}/monthly-analysis/${stockItemId}`);
  }

  /**
   * ดึงการวิเคราะห์รายเดือนทั้งหมด
   */
  getAllMonthlyAnalysis(): Observable<MonthlyAnalysisDTO[]> {
    return this.http.get<MonthlyAnalysisDTO[]>(`${this.apiUrl}/monthly-analysis`);
  }

  /**
   * ดึงการคาดการณ์เดือนถัดไปทั้งหมด
   */
  getNextMonthPredictions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/next-month-predictions`);
  }

  /**
   * ดึงแนวโน้มการใช้งาน
   */
  getTrendAnalysis(stockType?: string): Observable<any> {
    let params = new HttpParams();
    if (stockType) {
      params = params.set('stockType', stockType);
    }
    return this.http.get(`${this.apiUrl}/trend-analysis`, { params });
  }

  // ============================================
  // การดึงข้อมูล (เดิม - คงไว้)
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
