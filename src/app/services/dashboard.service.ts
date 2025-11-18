import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';

interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalStock: number;
  pendingOrders: number;
  lowStockItems: number;
  totalCustomers: number;
  totalEmployees: number;
  monthlyGrowth: number;
}

interface StockSummary {
  chinaTotalValue: number;
  chinaItemCount: number;
  chinaTotalQuantity: number;
  thaiTotalValue: number;
  thaiItemCount: number;
  thaiTotalQuantity: number;
  grandTotalValue: number;
  totalItemCount: number;
  totalQuantity: number;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalTransactions: number;
  incomeCount: number;
  expenseCount: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productName: string;
  totalSold: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api';

  constructor(private http: HttpClient) {}

  // ============================================
  // Orders API
  // ============================================

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`)
      .pipe(catchError(() => of([])));
  }
  getMonthlyTransactions(months: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/monthly?months=${months}`);
  }

  getOrdersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/status/${status}`)
      .pipe(catchError(() => of([])));
  }

  getOrdersBySource(source: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/source/${source}`)
      .pipe(catchError(() => of([])));
  }

  // ============================================
  // Products API
  // ============================================

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`)
      .pipe(catchError(() => of([])));
  }

  getActiveProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/active`)
      .pipe(catchError(() => of([])));
  }

  // ============================================
  // Stock API
  // ============================================

  getSystemSummary(): Observable<StockSummary> {
    return this.http.get<StockSummary>(`${this.apiUrl}/summary/system`)
      .pipe(catchError(() => of({
        chinaTotalValue: 0,
        chinaItemCount: 0,
        chinaTotalQuantity: 0,
        thaiTotalValue: 0,
        thaiItemCount: 0,
        thaiTotalQuantity: 0,
        grandTotalValue: 0,
        totalItemCount: 0,
        totalQuantity: 0
      })));
  }

  getAllChinaStocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/china-stocks`)
      .pipe(catchError(() => of([])));
  }

  getAllThaiStocks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/thai-stocks`)
      .pipe(catchError(() => of([])));
  }

  getAllStockLots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-lots`)
      .pipe(catchError(() => of([])));
  }

  // ============================================
  // Transactions API
  // ============================================

  getTransactionSummary(): Observable<TransactionSummary> {
    return this.http.get<TransactionSummary>(`${this.apiUrl}/transactions/summary`)
      .pipe(catchError(() => of({
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        totalTransactions: 0,
        incomeCount: 0,
        expenseCount: 0
      })));
  }

  // ============================================
  // Customers & Employees API
  // ============================================

  getAllCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customers`)
      .pipe(catchError(() => of([])));
  }

  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees`)
      .pipe(catchError(() => of([])));
  }

  getActiveEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/employees/status/ACTIVE`)
      .pipe(catchError(() => of([])));
  }

  // ============================================
  // Stock Forecast API
  // ============================================

  getStockForecastSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock-forecast/summary`)
      .pipe(catchError(() => of({
        totalItems: 0,
        criticalItems: 0,
        highUrgencyItems: 0,
        mediumUrgencyItems: 0,
        lowUrgencyItems: 0
      })));
  }

  getUrgentStockItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stock-forecast/urgent`)
      .pipe(catchError(() => of([])));
  }

  // ============================================
  // Dashboard Summary (รวมข้อมูลทั้งหมด)
  // ============================================

  getDashboardSummary(): Observable<DashboardSummary> {
    return forkJoin({
      orders: this.getAllOrders(),
      products: this.getAllProducts(),
      stockSummary: this.getSystemSummary(),
      customers: this.getAllCustomers(),
      employees: this.getAllEmployees(),
      transactions: this.getTransactionSummary()
    }).pipe(
      map(result => {
        const orders = result.orders || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // คำนวณรายได้และยอดขายเดือนนี้
        const thisMonthOrders = orders.filter(o => {
          if (!o.orderDate) return false;
          const orderDate = new Date(o.orderDate);
          return orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear;
        });

        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) =>
          sum + (order.netAmount || 0), 0);

        // คำนวณรายได้เดือนที่แล้ว
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const lastMonthOrders = orders.filter(o => {
          if (!o.orderDate) return false;
          const orderDate = new Date(o.orderDate);
          return orderDate.getMonth() === lastMonth &&
            orderDate.getFullYear() === lastMonthYear;
        });

        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) =>
          sum + (order.netAmount || 0), 0);

        // คำนวณ Growth Rate
        let monthlyGrowth = 0;
        if (lastMonthRevenue > 0) {
          monthlyGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (thisMonthRevenue > 0) {
          monthlyGrowth = 100;
        }

        const totalRevenue = orders.reduce((sum, order) =>
          sum + (order.netAmount || 0), 0);

        const pendingOrders = orders.filter(o =>
          o.status === 'PENDING').length;

        // นับสต็อกต่ำจาก Stock Forecast (ถ้ามี)
        const lowStockItems = 0; // จะได้จาก Stock Forecast API

        return {
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalProducts: result.products.length,
          totalStock: result.stockSummary.totalQuantity || 0,
          pendingOrders: pendingOrders,
          lowStockItems: lowStockItems,
          totalCustomers: result.customers.length,
          totalEmployees: result.employees.length,
          monthlyGrowth: Math.round(monthlyGrowth * 10) / 10
        };
      }),
      catchError(() => of({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalStock: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        totalCustomers: 0,
        totalEmployees: 0,
        monthlyGrowth: 0
      }))
    );
  }

  // ============================================
  // Analytics - Revenue by Month
  // ============================================

  getRevenueByMonth(months: number = 6): Observable<MonthlyRevenue[]> {
    return this.getAllOrders().pipe(
      map(orders => {
        const monthlyData: { [key: string]: { revenue: number; count: number } } = {};

        orders.forEach(order => {
          if (order.orderDate && order.netAmount) {
            const date = new Date(order.orderDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { revenue: 0, count: 0 };
            }

            monthlyData[monthKey].revenue += order.netAmount;
            monthlyData[monthKey].count += 1;
          }
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const lastMonths = sortedMonths.slice(-months);

        return lastMonths.map(month => ({
          month: this.formatMonth(month),
          revenue: monthlyData[month].revenue,
          orders: monthlyData[month].count
        }));
      }),
      catchError(() => of([]))
    );
  }

  // ============================================
  // Analytics - Top Selling Products
  // ============================================

  getTopSellingProducts(limit: number = 5): Observable<TopProduct[]> {
    return this.getAllOrders().pipe(
      map(orders => {
        const productSales: {
          [key: string]: {
            quantity: number;
            revenue: number
          }
        } = {};

        orders.forEach(order => {
          if (order.orderItems && Array.isArray(order.orderItems)) {
            order.orderItems.forEach((item: any) => {
              const productName = item.productName || 'Unknown';
              const quantity = item.quantity || 0;
              const revenue = item.totalPrice || 0;

              if (!productSales[productName]) {
                productSales[productName] = { quantity: 0, revenue: 0 };
              }

              productSales[productName].quantity += quantity;
              productSales[productName].revenue += revenue;
            });
          }
        });

        return Object.entries(productSales)
          .map(([productName, data]) => ({
            productName,
            totalSold: data.quantity,
            revenue: data.revenue
          }))
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, limit);
      }),
      catchError(() => of([]))
    );
  }

  // ============================================
  // Orders by Status Distribution
  // ============================================

  getOrdersByStatusDistribution(): Observable<{ [key: string]: number }> {
    return this.getAllOrders().pipe(
      map(orders => {
        const statusCount: { [key: string]: number } = {};
        orders.forEach(order => {
          const status = order.status || 'UNKNOWN';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        return statusCount;
      }),
      catchError(() => of({}))
    );
  }

  // ============================================
  // Orders by Source Distribution
  // ============================================

  getOrdersBySourceDistribution(): Observable<{ [key: string]: number }> {
    return this.getAllOrders().pipe(
      map(orders => {
        const sourceCount: { [key: string]: number } = {};
        orders.forEach(order => {
          const source = order.source || 'UNKNOWN';
          sourceCount[source] = (sourceCount[source] || 0) + 1;
        });
        return sourceCount;
      }),
      catchError(() => of({}))
    );
  }

  // ============================================
  // Helper Methods
  // ============================================

  private formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('th-TH', {
      month: 'short',
      year: 'numeric'
    });
  }
}
