import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// ⭐ อัปเดต Interface รองรับ Quantity Tracking
export interface ThaiStock {
  stockItemId?: number;
  name: string;
  lotDate?: string;
  shopURL?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  stockLotId?: number;
  stockLot?: {
    stockLotId: number;
    lotName: string;
  };

  // ⭐ Quantity Management
  originalQuantity?: number;    // จำนวนทั้งหมด (ตอนนำเข้า)
  currentQuantity?: number;     // จำนวนคงเหลือ (ปัจจุบัน)
  usedQuantity?: number;        // จำนวนที่ใช้ไป
  usagePercentage?: number;     // เปอร์เซ็นต์ที่ใช้ไป
  remainingPercentage?: number; // เปอร์เซ็นต์ที่เหลือ
  quantity?: number;            // Backward compatibility

  priceTotal: number;
  shippingCost?: number;
  pricePerUnit?: number;
  pricePerUnitWithShipping?: number;
  bufferPercentage?: number;
  includeBuffer?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThaiStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/thai-stocks';

  constructor(private http: HttpClient) {}

  // ⭐ Format Quantity
  formatQuantity(stock: ThaiStock): string {
    const current = stock.currentQuantity || stock.quantity || 0;
    const original = stock.originalQuantity || current;
    return `${current} / ${original}`;
  }

  // ⭐ Get Usage Color
  getUsageColor(percentage: number | undefined): string {
    if (!percentage) return 'text-success';
    if (percentage < 30) return 'text-success';
    if (percentage < 70) return 'text-warning';
    return 'text-danger';
  }

  // ⭐ Get Remaining Color
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

  getTotalValueByLot(stockLotId: number): Observable<{totalValue: number}> {
    return this.http.get<{totalValue: number}>(`${this.apiUrl}/lot/${stockLotId}/total-value`);
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
      includeBuffer: thaiStock.includeBuffer || false,
      bufferPercentage: thaiStock.bufferPercentage || 0
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
      includeBuffer: thaiStock.includeBuffer || false,
      bufferPercentage: thaiStock.bufferPercentage || 0
    };
    return this.http.put<ThaiStock>(`${this.apiUrl}/${id}`, payload);
  }

  updateThaiStockStatus(id: number, status: string): Observable<ThaiStock> {
    return this.http.patch<ThaiStock>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteThaiStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
