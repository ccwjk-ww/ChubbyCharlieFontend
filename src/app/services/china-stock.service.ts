import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface ที่รองรับทั้ง stockLot object และ stockLotId
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
  unitPriceYuan: number;
  quantity: number;
  totalValueYuan?: number;
  shippingWithinChinaYuan?: number;
  totalYuan?: number;
  totalBath?: number;
  pricePerUnitBath?: number;
  shippingChinaToThaiBath?: number;
  // ⭐ ลบออก - จะคำนวณอัตโนมัติ
  // avgShippingPerPair?: number;
  finalPricePerPair?: number;
  exchangeRate: number;

  // ⭐ เพิ่ม buffer fields
  bufferPercentage?: number;
  includeBuffer?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChinaStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/china-stocks';

  constructor(private http: HttpClient) {}

  // ⭐ เพิ่ม helper method ที่นี่ (ใน class)
  formatNumber(num: number | undefined): string {
    if (!num) return '0.000';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
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
    // ⭐ แก้ไข: ลบ avgShippingPerPair ออก + เพิ่ม buffer fields
    const payload = {
      name: chinaStock.name,
      shopURL: chinaStock.shopURL,
      unitPriceYuan: chinaStock.unitPriceYuan,
      quantity: chinaStock.quantity,
      shippingWithinChinaYuan: chinaStock.shippingWithinChinaYuan || 0,
      exchangeRate: chinaStock.exchangeRate,
      shippingChinaToThaiBath: chinaStock.shippingChinaToThaiBath || 0,
      // ⭐ ลบ avgShippingPerPair ออก
      includeBuffer: chinaStock.includeBuffer || false,
      bufferPercentage: chinaStock.bufferPercentage || 0,
      status: chinaStock.status || 'ACTIVE',
      stockLotId: chinaStock.stockLotId || null
    };
    return this.http.post<ChinaStock>(this.apiUrl, payload);
  }

  updateChinaStock(id: number, chinaStock: ChinaStock): Observable<ChinaStock> {
    // ⭐ แก้ไข: ลบ avgShippingPerPair ออก + เพิ่ม buffer fields
    const payload = {
      name: chinaStock.name,
      shopURL: chinaStock.shopURL,
      unitPriceYuan: chinaStock.unitPriceYuan,
      quantity: chinaStock.quantity,
      shippingWithinChinaYuan: chinaStock.shippingWithinChinaYuan || 0,
      exchangeRate: chinaStock.exchangeRate,
      shippingChinaToThaiBath: chinaStock.shippingChinaToThaiBath || 0,
      // ⭐ ลบ avgShippingPerPair ออก
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

  // ⭐ แก้ไข: ใช้ endpoint เดียว รับ totalShipping
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
