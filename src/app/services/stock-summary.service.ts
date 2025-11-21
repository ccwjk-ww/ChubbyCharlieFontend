import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

export interface StockLotSummary {
  stockLotId: number;
  chinaTotalValue: number;
  chinaItemCount: number;
  chinaTotalQuantity: number;
  thaiTotalValue: number;
  thaiItemCount: number;
  thaiTotalQuantity: number;
  grandTotalValue: number; // ⭐ Grand Total (รวม Buffer)
  totalItemCount: number;
  totalQuantity: number;
}

export interface SystemSummary {
  totalLots: number;
  totalChinaItems: number;
  totalThaiItems: number;
  totalItems: number;
  activeChinaItems: number;
  activeThaiItems: number;
  activeItems: number;
  totalInventoryValue?: number; // ⭐ เพิ่ม Total Inventory Value (optional)
}

@Injectable({
  providedIn: 'root'
})
export class StockSummaryService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/summary';

  constructor(private http: HttpClient) {}

  getStockLotSummary(stockLotId: number): Observable<StockLotSummary> {
    return this.http.get<StockLotSummary>(`${this.apiUrl}/lot/${stockLotId}`);
  }

  getSystemSummary(): Observable<SystemSummary> {
    return this.http.get<SystemSummary>(`${this.apiUrl}/system`);
  }
}
