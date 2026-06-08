import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  orderId?: number;
  orderNumber: string;
  source: 'SHOP_24' | 'SHOPEE' | 'TIKTOK' | 'MANUAL';
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  paymentDate?: Date;
  totalAmount?: number;
  shippingFee?: number;
  discount?: number;
  netAmount?: number;
  vatEnabled?: boolean;
  vatRate?: number;
  vatAmount?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  trackingNumber?: string;
  originalFileName?: string;
  createdDate?: Date;
  updatedDate?: Date;
  orderItems?: OrderItem[];
  totalCost?: number;
  profit?: number;
}

export interface OrderItem {
  orderItemId?: number;
  orderId?: number;
  productId?: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice?: number;
  costPerUnit?: number;
  totalCost?: number;
  profit?: number;
  notes?: string;
  stockDeductionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface OrderUploadResponse {
  success: boolean;
  message: string;
  order?: Order;
  orders?: Order[];
  totalOrders?: number;
  successCount?: number;
  errorCount?: number;
  stockDeductionMessages?: string[];
}

export interface StockCheckDetailsResponse {
  success: boolean;
  allAvailable: boolean;
  orderNumber: string;
  totalItems: number;
  details: StockCheckDetail[];
  message: string;
}

export interface StockCheckDetail {
  orderItemId: number;
  productName: string;
  orderQuantity: number;
  available: boolean;
  errorMessage?: string;
  ingredients: IngredientDetail[];
}

export interface IngredientDetail {
  ingredientName: string;
  unit: string;
  requiredQuantity: number;
  stockItemId?: number;
  stockItemName?: string;
  stockType?: 'CHINA' | 'THAI';
  currentStock?: number;
  available: boolean;
  shortage?: number;
  errorMessage?: string;
  stockLotId?: number;
  stockLotName?: string;
  stockLotStatus?: string;
  stockAllocations?: StockAllocationDetail[];
}

export interface StockAllocationDetail {
  stockName: string;
  stockType: string;
  lotName: string;
  allocatedQuantity: number;
  availableQuantity: number;
  allocationPriority: number;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  getOrdersBySource(source: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/source/${source}`);
  }

  searchOrders(keyword: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  updateOrder(id: number, orderData: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, orderData);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  updatePaymentStatus(id: number, paymentStatus: string, paymentDate?: Date): Observable<Order> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body: any = { paymentStatus };
    if (paymentDate) {
      body.paymentDate = paymentDate.toISOString();
    }
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}/payment-status`,
      body,
      { headers }
    );
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deductStockForOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/deduct-stock`, {});
  }

  checkStockAvailability(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/check-stock`);
  }

  checkStockDetails(id: number): Observable<StockCheckDetailsResponse> {
    return this.http.get<StockCheckDetailsResponse>(`${this.apiUrl}/${id}/check-stock-details`);
  }

  upload24ShopPDFWithCustomer(
    file: File,
    orderNumber: string,
    customerId: number,
    autoDeductStock: boolean = false
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderNumber', orderNumber);
    formData.append('customerId', customerId.toString());
    formData.append('autoDeductStock', autoDeductStock.toString());
    return this.http.post<any>(`${this.apiUrl}/upload/24shop-pdf`, formData);
  }

  preview24ShopPDF(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
  }

  /**
   * ⭐ Upload TikTok Excel — ใช้ Apache POI โดยตรง (ไม่ใช้ Gemini)
   */
  uploadTiktokExcel(file: File, customerId: number, autoDeductStock: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', customerId.toString());
    formData.append('autoDeductStock', autoDeductStock.toString());
    return this.http.post<any>(`${this.apiUrl}/upload/tiktok-excel`, formData);
  }

  /**
   * ⭐ Preview TikTok Excel — ส่ง customerId ด้วยเพื่อให้แสดงชื่อลูกค้า
   */
  previewTiktokExcel(file: File, customerId?: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (customerId) {
      formData.append('customerId', customerId.toString());
    }
    return this.http.post<any>(`${this.apiUrl}/upload/preview-tiktok-excel`, formData);
  }

  uploadShopeeExcel(file: File, autoDeductStock: boolean = false): Observable<OrderUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('autoDeductStock', autoDeductStock.toString());
    return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/shopee-excel`, formData);
  }

  previewExcel(file: File): Observable<OrderUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/preview-excel`, formData);
  }

  restoreStockForOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restore-stock`, {});
  }

  getStockDeductionStatus(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/stock-deduction-status`);
  }

  /**
   * ⭐ Scan TikTok Excel แบบ VAT — ดูรายงานเท่านั้น ไม่ save
   */
  scanTiktokExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/upload/scan-tiktok-excel`, formData);
  }
}
