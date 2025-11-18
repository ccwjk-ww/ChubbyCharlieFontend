// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
//
// export interface StockLot {
//   stockLotId?: number;
//   lotName: string;
//   importDate?: string;
//   arrivalDate?: string;
//   // ลบ totalShippingBath ออกแล้ว
//   status?: 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED'; // อัปเดต status ให้ตรงกับ backend
// }
//
// export interface StockLotOption {
//   value: number;
//   label: string;
//   status: string;
// }
//
// @Injectable({
//   providedIn: 'root'
// })
// export class StockLotService {
//   private apiUrl = 'http://localhost:8080/api/stock-lots';
//
//   constructor(private http: HttpClient) {}
//
//   getAllStockLots(): Observable<StockLot[]> {
//     return this.http.get<StockLot[]>(this.apiUrl);
//   }
//
//   // เพิ่ม method ใหม่สำหรับ dropdown options
//   getStockLotOptions(): Observable<StockLotOption[]> {
//     return this.http.get<StockLotOption[]>(`${this.apiUrl}/options`);
//   }
//
//   getStockLotById(id: number): Observable<StockLot> {
//     return this.http.get<StockLot>(`${this.apiUrl}/${id}`);
//   }
//
//   getStockLotByName(lotName: string): Observable<StockLot> {
//     return this.http.get<StockLot>(`${this.apiUrl}/name/${lotName}`);
//   }
//
//   getStockLotsByStatus(status: string): Observable<StockLot[]> {
//     return this.http.get<StockLot[]>(`${this.apiUrl}/status/${status}`);
//   }
//
//   getStockLotsByDateRange(startDate: string, endDate: string, dateType: string = 'import'): Observable<StockLot[]> {
//     return this.http.get<StockLot[]>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}&dateType=${dateType}`);
//   }
//
//   createStockLot(stockLot: StockLot): Observable<StockLot> {
//     return this.http.post<StockLot>(this.apiUrl, stockLot);
//   }
//
//   updateStockLot(id: number, stockLot: StockLot): Observable<StockLot> {
//     return this.http.put<StockLot>(`${this.apiUrl}/${id}`, stockLot);
//   }
//
//   updateStockLotStatus(id: number, status: string): Observable<StockLot> {
//     return this.http.patch<StockLot>(`${this.apiUrl}/${id}/status`, { status });
//   }
//
//   deleteStockLot(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`);
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StockLot {
  stockLotId?: number;
  lotName: string;
  importDate?: string;
  arrivalDate?: string;
  status?: 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  items?: any[]; // สำหรับเก็บ ChinaStock และ ThaiStock
}

export interface StockLotOption {
  value: number;
  label: string;
  status: string;
}

export interface CompleteStockLotResponse {
  success: boolean;
  message: string;
  stockLot: StockLot;
  totalCost: number;
  itemsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StockLotService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/stock-lots';

  constructor(private http: HttpClient) {}

  getAllStockLots(): Observable<StockLot[]> {
    return this.http.get<StockLot[]>(this.apiUrl);
  }

  getStockLotOptions(): Observable<StockLotOption[]> {
    return this.http.get<StockLotOption[]>(`${this.apiUrl}/options`);
  }

  getStockLotById(id: number): Observable<StockLot> {
    return this.http.get<StockLot>(`${this.apiUrl}/${id}`);
  }

  getStockLotByName(lotName: string): Observable<StockLot> {
    return this.http.get<StockLot>(`${this.apiUrl}/name/${lotName}`);
  }

  getStockLotsByStatus(status: string): Observable<StockLot[]> {
    return this.http.get<StockLot[]>(`${this.apiUrl}/status/${status}`);
  }

  getStockLotsByDateRange(startDate: string, endDate: string, dateType: string = 'import'): Observable<StockLot[]> {
    return this.http.get<StockLot[]>(`${this.apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}&dateType=${dateType}`);
  }

  createStockLot(stockLot: StockLot): Observable<StockLot> {
    return this.http.post<StockLot>(this.apiUrl, stockLot);
  }

  updateStockLot(id: number, stockLot: StockLot): Observable<StockLot> {
    return this.http.put<StockLot>(`${this.apiUrl}/${id}`, stockLot);
  }

  updateStockLotStatus(id: number, status: string): Observable<StockLot> {
    return this.http.patch<StockLot>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * ⭐ NEW: Complete Stock Lot และสร้าง Transaction อัตโนมัติ
   * POST /api/stock-lots/{id}/complete
   */
  completeStockLot(id: number): Observable<CompleteStockLotResponse> {
    return this.http.post<CompleteStockLotResponse>(`${this.apiUrl}/${id}/complete`, {});
  }

  deleteStockLot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Helper: Format currency
   */
  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.00';
    return `฿${amount.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
