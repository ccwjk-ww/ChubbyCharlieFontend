import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

// Interface ที่รองรับทั้ง stockLot object และ stockLotId
export interface ChinaStock {
  stockItemId?: number;
  name: string;
  lotDate?: string;
  shopURL?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  stockLotId?: number; // เพิ่ม field นี้สำหรับส่งไปยัง backend
  stockLot?: {        // field นี้สำหรับรับจาก backend หรือใช้ใน form
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
  avgShippingPerPair?: number;
  finalPricePerPair?: number;
  exchangeRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChinaStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/china-stocks';

  constructor(private http: HttpClient) {}

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
    // แปลง object ให้เหมาะกับ backend
    const payload = {
      name: chinaStock.name,
      shopURL: chinaStock.shopURL,
      unitPriceYuan: chinaStock.unitPriceYuan,
      quantity: chinaStock.quantity,
      shippingWithinChinaYuan: chinaStock.shippingWithinChinaYuan || 0,
      exchangeRate: chinaStock.exchangeRate,
      shippingChinaToThaiBath: chinaStock.shippingChinaToThaiBath || 0,
      avgShippingPerPair: chinaStock.avgShippingPerPair || 0,
      status: chinaStock.status || 'ACTIVE',
      stockLotId: chinaStock.stockLotId || null // ส่ง stockLotId แทน stockLot object
    };
    return this.http.post<ChinaStock>(this.apiUrl, payload);
  }

  updateChinaStock(id: number, chinaStock: ChinaStock): Observable<ChinaStock> {
    // แปลง object ให้เหมาะกับ backend
    const payload = {
      name: chinaStock.name,
      shopURL: chinaStock.shopURL,
      unitPriceYuan: chinaStock.unitPriceYuan,
      quantity: chinaStock.quantity,
      shippingWithinChinaYuan: chinaStock.shippingWithinChinaYuan || 0,
      exchangeRate: chinaStock.exchangeRate,
      shippingChinaToThaiBath: chinaStock.shippingChinaToThaiBath || 0,
      avgShippingPerPair: chinaStock.avgShippingPerPair || 0,
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

  distributeShippingCosts(stockLotId: number): Observable<ChinaStock[]> {
    return this.http.post<ChinaStock[]>(`${this.apiUrl}/lot/${stockLotId}/distribute-shipping`, {});
  }

  // เพิ่ม method ใหม่สำหรับ distribute shipping โดยระบุจำนวน
  distributeShippingCostsWithAmount(stockLotId: number, totalShipping: number): Observable<ChinaStock[]> {
    return this.http.post<ChinaStock[]>(`${this.apiUrl}/lot/${stockLotId}/distribute-shipping-with-amount`, { totalShipping });
  }

  deleteChinaStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
