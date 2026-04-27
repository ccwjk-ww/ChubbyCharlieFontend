import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DefectiveRecord } from './china-stock.service';

export interface ThaiStock {
  stockItemId?: number;
  name: string;
  lotDate?: string;
  shopURL?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  stockLotId?: number;
  stockLot?: { stockLotId: number; lotName: string; };

  // Quantity Management
  originalQuantity?: number;
  currentQuantity?: number;
  usedQuantity?: number;
  usagePercentage?: number;
  remainingPercentage?: number;
  quantity?: number;

  // Defective fields
  defectiveQuantity?: number;
  defectiveValue?: number;

  priceTotal: number;
  shippingCost?: number;
  pricePerUnit?: number;
  pricePerUnitWithShipping?: number;

  vatPercentage?: number;
  includeVat?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ThaiStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/thai-stocks';
  private defectiveApiUrl = 'https://www.chubbycharlieshop.com/api/defective-records';

  constructor(private http: HttpClient) {}

  getRemainingColor(percentage: number | undefined): string {
    if (!percentage) return 'text-danger';
    if (percentage >= 70) return 'text-success';
    if (percentage >= 30) return 'text-warning';
    return 'text-danger';
  }

  getAllThaiStocks(): Observable<ThaiStock[]> {
    return this.http.get<ThaiStock[]>(this.apiUrl);
  }

  getThaiStockById(id: number): Observable<ThaiStock> {
    return this.http.get<ThaiStock>(`${this.apiUrl}/${id}`);
  }

  getThaiStocksByStatus(status: string): Observable<ThaiStock[]> {
    return this.http.get<ThaiStock[]>(`${this.apiUrl}/status/${status}`);
  }

  getThaiStocksByLot(stockLotId: number): Observable<ThaiStock[]> {
    return this.http.get<ThaiStock[]>(`${this.apiUrl}/lot/${stockLotId}`);
  }

  getTotalValueByLot(stockLotId: number): Observable<{ totalValue: number }> {
    return this.http.get<{ totalValue: number }>(`${this.apiUrl}/lot/${stockLotId}/total-value`);
  }

  searchThaiStocks(keyword: string): Observable<ThaiStock[]> {
    return this.http.get<ThaiStock[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  createThaiStock(thaiStock: ThaiStock): Observable<ThaiStock> {
    const payload = {
      name: thaiStock.name,
      shopURL: thaiStock.shopURL,
      quantity: thaiStock.quantity || thaiStock.currentQuantity,
      priceTotal: thaiStock.priceTotal,
      shippingCost: thaiStock.shippingCost || 0,
      status: thaiStock.status || 'ACTIVE',
      stockLotId: thaiStock.stockLotId || null,
      includeVat: thaiStock.includeVat || false,
      vatPercentage: thaiStock.vatPercentage || 0
    };
    return this.http.post<ThaiStock>(this.apiUrl, payload);
  }

  updateThaiStock(id: number, thaiStock: ThaiStock): Observable<ThaiStock> {
    const payload = {
      name: thaiStock.name,
      shopURL: thaiStock.shopURL,
      quantity: thaiStock.quantity || thaiStock.currentQuantity,
      priceTotal: thaiStock.priceTotal,
      shippingCost: thaiStock.shippingCost || 0,
      status: thaiStock.status || 'ACTIVE',
      stockLotId: thaiStock.stockLotId || null,
      includeVat: thaiStock.includeVat || false,
      vatPercentage: thaiStock.vatPercentage || 0
    };
    return this.http.put<ThaiStock>(`${this.apiUrl}/${id}`, payload);
  }

  updateThaiStockStatus(id: number, status: string): Observable<ThaiStock> {
    return this.http.patch<ThaiStock>(`${this.apiUrl}/${id}/status`, { status });
  }

  /** เพิ่มของเสีย (ตัด quantity + บันทึก history) */
  recordDefective(id: number, count: number, note?: string): Observable<ThaiStock> {
    return this.http.patch<ThaiStock>(`${this.apiUrl}/${id}/defective`, { count, note });
  }

  setDefectiveQuantity(id: number, count: number): Observable<ThaiStock> {
    return this.http.put<ThaiStock>(`${this.apiUrl}/${id}/defective`, { count });
  }

  /** ดึงประวัติของเสีย */
  getDefectiveRecords(stockItemId: number): Observable<DefectiveRecord[]> {
    return this.http.get<DefectiveRecord[]>(`${this.defectiveApiUrl}/stock/${stockItemId}`);
  }

  deleteThaiStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
