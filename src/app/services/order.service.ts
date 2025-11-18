// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
//
// export interface Order {
//   orderId?: number;
//   orderNumber: string;
//   source: 'SHOP_24' | 'SHOPEE' | 'MANUAL';
//   customerId?: number;
//   customerName: string;
//   customerPhone?: string;
//   shippingAddress?: string;
//   orderDate?: Date;
//   deliveryDate?: Date;
//   totalAmount?: number;
//   shippingFee?: number;
//   discount?: number;
//   netAmount?: number;
//   status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
//   paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
//   notes?: string;
//   trackingNumber?: string;
//   originalFileName?: string;
//   createdDate?: Date;
//   updatedDate?: Date;
//   orderItems?: OrderItem[];
// }
//
// export interface OrderItem {
//   orderItemId?: number;
//   orderId?: number;
//   productId?: number;
//   productName: string;
//   productSku?: string;
//   quantity: number;
//   unitPrice: number;
//   discount?: number;
//   totalPrice?: number;
//   costPerUnit?: number;
//   totalCost?: number;
//   profit?: number;
//   notes?: string;
//   stockDeductionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
// }
//
// export interface OrderUploadResponse {
//   success: boolean;
//   message: string;
//   order?: Order;
//   orders?: Order[];
//   totalOrders?: number;
//   successCount?: number;
//   errorCount?: number;
//   stockDeductionMessages?: string[];
// }
//
// @Injectable({
//   providedIn: 'root'
// })
// export class OrderService {
//   private apiUrl = 'http://localhost:8080/api/orders';
//
//   constructor(private http: HttpClient) {}
//
//   getAllOrders(): Observable<Order[]> {
//     return this.http.get<Order[]>(this.apiUrl);
//   }
//
//   getOrderById(id: number): Observable<Order> {
//     return this.http.get<Order>(`${this.apiUrl}/${id}`);
//   }
//
//   getOrderByNumber(orderNumber: string): Observable<Order> {
//     return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
//   }
//
//   getOrdersByStatus(status: string): Observable<Order[]> {
//     return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
//   }
//
//   getOrdersBySource(source: string): Observable<Order[]> {
//     return this.http.get<Order[]>(`${this.apiUrl}/source/${source}`);
//   }
//
//   searchOrders(keyword: string): Observable<Order[]> {
//     return this.http.get<Order[]>(`${this.apiUrl}/search?keyword=${keyword}`);
//   }
//
//   createOrder(orderData: any): Observable<Order> {
//     return this.http.post<Order>(this.apiUrl, orderData);
//   }
//
//   updateOrder(id: number, orderData: any): Observable<Order> {
//     return this.http.put<Order>(`${this.apiUrl}/${id}`, orderData);
//   }
//
//   updateOrderStatus(id: number, status: string): Observable<Order> {
//     return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
//   }
//
//   updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
//     return this.http.patch<Order>(`${this.apiUrl}/${id}/payment-status`, { paymentStatus });
//   }
//
//   cancelOrder(id: number): Observable<Order> {
//     return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
//   }
//
//   deleteOrder(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`);
//   }
//
//   deductStockForOrder(id: number): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${id}/deduct-stock`, {});
//   }
//
//   checkStockAvailability(id: number): Observable<any> {
//     return this.http.get(`${this.apiUrl}/${id}/check-stock`);
//   }
//
// // ใหม่: อัพโหลด PDF พร้อมระบุ Customer และเลข PO
//   upload24ShopPDFWithCustomer(
//     file: File,
//     orderNumber: string,
//     customerId: number,
//     autoDeductStock: boolean = false
//   ): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('orderNumber', orderNumber);
//     formData.append('customerId', customerId.toString());
//     formData.append('autoDeductStock', autoDeductStock.toString());
//
//     return this.http.post<any>(`${this.apiUrl}/upload/24shop-pdf`, formData);
//   }
//
//   // ใหม่: Preview PDF (แสดงเฉพาะรายการสินค้า)
//   preview24ShopPDF(file: File): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//
//     return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
//   }
//
//   uploadShopeeExcel(file: File, autoDeductStock: boolean = false): Observable<OrderUploadResponse> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('autoDeductStock', autoDeductStock.toString());
//
//     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/shopee-excel`, formData);
//   }
//
//
//   previewExcel(file: File): Observable<OrderUploadResponse> {
//     const formData = new FormData();
//     formData.append('file', file);
//
//     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/preview-excel`, formData);
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  orderId?: number;
  orderNumber: string;
  source: 'SHOP_24' | 'SHOPEE' | 'MANUAL';
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  totalAmount?: number;
  shippingFee?: number;
  discount?: number;
  netAmount?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  trackingNumber?: string;
  originalFileName?: string;
  createdDate?: Date;
  updatedDate?: Date;
  orderItems?: OrderItem[];
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

  // ✅ แก้ไขการส่งข้อมูล Payment Status
  updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}/payment-status`,
      { paymentStatus },
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

  // ใหม่: อัพโหลด PDF พร้อมระบุ Customer และเลข PO
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

  // ใหม่: Preview PDF (แสดงเฉพาะรายการสินค้า)
  preview24ShopPDF(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
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
}
