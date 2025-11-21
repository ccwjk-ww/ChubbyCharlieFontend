import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

// Interface ที่รองรับทั้ง stockLot object และ stockLotId
export interface ThaiStock {
  stockItemId?: number;
  name: string;
  lotDate?: string;
  shopURL?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  stockLotId?: number; // เปลี่ยนเป็น optional เพื่อให้ยืดหยุ่นกว่า
  stockLot?: {        // field นี้สำหรับรับจาก backend หรือใช้ใน form
    stockLotId: number;
    lotName: string;
  };
  quantity: number;
  priceTotal: number;
  shippingCost?: number;
  pricePerUnit?: number;
  pricePerUnitWithShipping?: number;

  // ⭐ เพิ่ม Buffer fields
  bufferPercentage?: number;
  includeBuffer?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThaiStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/thai-stocks';

  constructor(private http: HttpClient) {}

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
    // แปลง object ให้เหมาะกับ backend
    const payload = {
      name: thaiStock.name,
      shopURL: thaiStock.shopURL,
      quantity: thaiStock.quantity,
      priceTotal: thaiStock.priceTotal,
      shippingCost: thaiStock.shippingCost || 0,
      status: thaiStock.status || 'ACTIVE',
      stockLotId: thaiStock.stockLotId || null, // ส่ง stockLotId แทน stockLot object

      // ⭐ เพิ่ม buffer fields
      includeBuffer: thaiStock.includeBuffer || false,
      bufferPercentage: thaiStock.bufferPercentage || 0
    };
    return this.http.post<ThaiStock>(this.apiUrl, payload);
  }

  updateThaiStock(id: number, thaiStock: ThaiStock): Observable<ThaiStock> {
    // แปลง object ให้เหมาะกับ backend
    const payload = {
      name: thaiStock.name,
      shopURL: thaiStock.shopURL,
      quantity: thaiStock.quantity,
      priceTotal: thaiStock.priceTotal,
      shippingCost: thaiStock.shippingCost || 0,
      status: thaiStock.status || 'ACTIVE',
      stockLotId: thaiStock.stockLotId || null,

      // ⭐ เพิ่ม buffer fields
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
