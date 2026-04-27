import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemSummary {
  totalLots: number;
  totalItems: number;
  totalChinaItems: number;
  totalThaiItems: number;
  activeItems: number;
  totalInventoryValue: number;
}

export interface StockLotSummary {
  stockLotId: number;
  lotName: string;
  totalItemCount: number;
  chinaItemCount: number;
  thaiItemCount: number;

  // ⭐ VAT breakdown — เหมือนกับ stock-lot-detail component
  totalCostBeforeVat: number;   // ยอดรวมก่อน VAT
  totalVatAmount: number;       // VAT รวมทั้ง Lot
  totalCostWithVat: number;     // ยอดรวมหลัง VAT ← ใช้แสดงใน Dashboard

  // backward compat (grandTotalValue = totalCostWithVat)
  grandTotalValue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockSummaryService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/stock-lots';

  constructor(private http: HttpClient) {}

  getSystemSummary(): Observable<SystemSummary> {
    return this.http.get<SystemSummary>(`${this.apiUrl}/system-summary`);
  }

  getStockLotSummary(stockLotId: number): Observable<StockLotSummary> {
    return this.http.get<StockLotSummary>(`${this.apiUrl}/${stockLotId}/summary`);
  }
}
