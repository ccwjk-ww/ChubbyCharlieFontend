import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DefectiveRecord {
  recordId: number;
  stockItemId: number;
  count: number;
  unitCost: number;
  totalValue: number;
  recordedAt: string; // ISO datetime
  note?: string;
  stockType: string;
}

export interface ChinaStock {
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

  unitPriceYuan: number;
  totalValueYuan?: number;
  shippingWithinChinaYuan?: number;
  totalYuan?: number;
  totalBath?: number;
  pricePerUnitBath?: number;
  shippingChinaToThaiBath?: number;
  finalPricePerPair?: number;
  exchangeRate: number;

  vatPercentage?: number;
  includeVat?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChinaStockService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/china-stocks';
  private defectiveApiUrl = 'https://www.chubbycharlieshop.com/api/defective-records';

  constructor(private http: HttpClient) {}

  formatNumber(num: number | undefined): string {
    if (!num) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

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

  getTotalValueByLot(stockLotId: number): Observable<{ totalValue: number }> {
    return this.http.get<{ totalValue: number }>(`${this.apiUrl}/lot/${stockLotId}/total-value`);
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
      includeVat: chinaStock.includeVat || false,
      vatPercentage: chinaStock.vatPercentage || 0,
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
      includeVat: chinaStock.includeVat || false,
      vatPercentage: chinaStock.vatPercentage || 0,
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
    return this.http.post<ChinaStock[]>(`${this.apiUrl}/lot/${stockLotId}/distribute-shipping`, { totalShipping });
  }

  /** เพิ่มของเสีย (ตัด quantity + บันทึก history) */
  recordDefective(id: number, count: number, note?: string): Observable<ChinaStock> {
    return this.http.patch<ChinaStock>(`${this.apiUrl}/${id}/defective`, { count, note });
  }

  /** reset defective (ไม่ตัด quantity) */
  setDefectiveQuantity(id: number, count: number): Observable<ChinaStock> {
    return this.http.put<ChinaStock>(`${this.apiUrl}/${id}/defective`, { count });
  }

  /** ดึงประวัติของเสีย */
  getDefectiveRecords(stockItemId: number): Observable<DefectiveRecord[]> {
    return this.http.get<DefectiveRecord[]>(`${this.defectiveApiUrl}/stock/${stockItemId}`);
  }

  deleteChinaStock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
