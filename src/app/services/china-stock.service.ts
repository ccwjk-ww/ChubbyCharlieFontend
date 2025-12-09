import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ⭐ อัปเดต Interface รองรับ Quantity Tracking
export interface ChinaStock {
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

  unitPriceYuan: number;
  totalValueYuan?: number;
  shippingWithinChinaYuan?: number;
  totalYuan?: number;
  totalBath?: number;
  pricePerUnitBath?: number;
  shippingChinaToThaiBath?: number;
  finalPricePerPair?: number;
  exchangeRate: number;
  bufferPercentage?: number;
  includeBuffer?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChinaStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/china-stocks';

  constructor(private http: HttpClient) {}

  // ⭐ Format number ให้เหลือ 2 ทศนิยม
  formatNumber(num: number | undefined): string {
    if (!num) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // ⭐ Format Quantity
  formatQuantity(stock: ChinaStock): string {
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

  getAllChinaStocks(): Observable<ChinaStock[]> {
    return this.http.get<ChinaStock[]>(this.apiUrl);
  }

  getChinaStockById(id: number): Observable<ChinaStock> {
    return this.http.get<ChinaStock>(`${this.apiUrl}/${id}`);
  }

  getChinaStocksByStatus(status: string): Observable<ChinaStock[]> {
    return this.http.get<ChinaStock[]>(`${this.apiUrl}/status/${status}`);
  }

  getChinaStocksByLot(stockLotId: number): Observable<ChinaStock[]> {
    return this.http.get<ChinaStock[]>(`${this.apiUrl}/lot/${stockLotId}`);
  }

  getTotalValueByLot(stockLotId: number): Observable<{totalValue: number}> {
    return this.http.get<{totalValue: number}>(`${this.apiUrl}/lot/${stockLotId}/total-value`);
  }

  searchChinaStocks(keyword: string): Observable<ChinaStock[]> {
    return this.http.get<ChinaStock[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  createChinaStock(chinaStock: ChinaStock): Observable<ChinaStock> {
    const payload = {
      name: chinaStock.name,
      shopURL: chinaStock.shopURL,
      unitPriceYuan: chinaStock.unitPriceYuan,
      quantity: chinaStock.quantity || chinaStock.currentQuantity,
      shippingWithinChinaYuan: chinaStock.shippingWithinChinaYuan || 0,
      exchangeRate: chinaStock.exchangeRate,
      shippingChinaToThaiBath: chinaStock.shippingChinaToThaiBath || 0,
      includeBuffer: chinaStock.includeBuffer || false,
      bufferPercentage: chinaStock.bufferPercentage || 0,
      status: chinaStock.status || 'ACTIVE',
      stockLotId: chinaStock.stockLotId || null
    };
    return this.http.post<ChinaStock>(this.apiUrl, payload);
  }

  updateChinaStock(id: number, chinaStock: ChinaStock): Observable<ChinaStock> {
    const payload = {
      name: chinaStock.name,
      shopURL: chinaStock.shopURL,
      unitPriceYuan: chinaStock.unitPriceYuan,
      quantity: chinaStock.quantity || chinaStock.currentQuantity,
      shippingWithinChinaYuan: chinaStock.shippingWithinChinaYuan || 0,
      exchangeRate: chinaStock.exchangeRate,
      shippingChinaToThaiBath: chinaStock.shippingChinaToThaiBath || 0,
      includeBuffer: chinaStock.includeBuffer || false,
      bufferPercentage: chinaStock.bufferPercentage || 0,
      status: chinaStock.status || 'ACTIVE',
      stockLotId: chinaStock.stockLotId || null
    };
    return this.http.put<ChinaStock>(`${this.apiUrl}/${id}`, payload);
  }

  updateChinaStockStatus(id: number, status: string): Observable<ChinaStock> {
    return this.http.patch<ChinaStock>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateExchangeRateForLot(stockLotId: number, exchangeRate: number): Observable<ChinaStock[]> {
    return this.http.patch<ChinaStock[]>(`${this.apiUrl}/lot/${stockLotId}/exchange-rate`, { exchangeRate });
  }

  distributeShippingCosts(stockLotId: number, totalShipping: number): Observable<ChinaStock[]> {
    return this.http.post<ChinaStock[]>(
      `${this.apiUrl}/lot/${stockLotId}/distribute-shipping`,
      { totalShipping }
    );
  }

  deleteChinaStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
