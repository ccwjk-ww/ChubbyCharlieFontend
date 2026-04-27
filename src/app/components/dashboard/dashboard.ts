import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType, TooltipItem } from 'chart.js';
import { DashboardService } from './../../services/dashboard.service';

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

interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalTransactions: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Data
  summary: DashboardSummary = {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalStock: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    monthlyGrowth: 0
  };

  transactionSummary: TransactionSummary | null = null;
  isLoading = true;
  errorMessage = '';

  // Chart: Revenue Trend (เดิม)
  revenueLineChartType: ChartType = 'line';
  revenueLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'รายได้ (บาท)',
      data: [],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#4F46E5',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  revenueLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => `฿${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `฿${Number(value).toLocaleString()}`
        }
      }
    }
  };

  // Chart: Transaction Trend (ใหม่)
  transactionLineChartType: ChartType = 'line';
  transactionLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'รายรับ',
        data: [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'รายจ่าย',
        data: [],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'กำไรสุทธิ',
        data: [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  transactionLineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ฿${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `฿${Number(value).toLocaleString()}`
        }
      }
    }
  };

  // Other Charts (เหมือนเดิม)
  orderSourcePieChartType: ChartType = 'pie';
  orderSourcePieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'], hoverOffset: 4 }] };

  orderSourcePieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  orderStatusBarChartType: ChartType = 'bar';
  orderStatusBarChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'จำนวนคำสั่งซื้อ',
      data: [],
      backgroundColor: ['#FFC107', '#2196F3', '#9C27B0', '#4CAF50', '#F44336', '#FF9800', '#607D8B', '#E91E63'],
      borderRadius: 8
    }]
  };

  orderStatusBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } }
  };

  topProductsChartType: ChartType = 'bar';
  topProductsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'ยอดขาย',
      data: [],
      backgroundColor: '#10B981',
      borderRadius: 8
    }]
  };

  topProductsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await Promise.all([
        this.loadMainSummary(),
        this.loadTransactionSummary(),
        this.loadRevenueData(),
        this.loadOrdersBySource(),
        this.loadOrdersByStatus(),
        this.loadTopProducts(),
        this.loadMonthlyTransactions()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.errorMessage = 'เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadMainSummary(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getDashboardSummary().subscribe({
        next: (data: DashboardSummary) => {
          this.summary = data;
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private async loadTransactionSummary(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getTransactionSummary().subscribe({
        next: (data: TransactionSummary) => {
          this.transactionSummary = data;
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private async loadRevenueData(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getRevenueByMonth(6).subscribe({
        next: (data: any[]) => {
          if (data?.length > 0) {
            this.revenueLineChartData = {
              labels: data.map(d => d.month),
              datasets: [{
                ...this.revenueLineChartData.datasets[0],
                data: data.map(d => d.revenue)
              }]
            };
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  //6 month
//   private async loadMonthlyTransactions(): Promise<void> {
//     return new Promise((resolve) => {
//       this.dashboardService.getLastSixMonthsTransactions().subscribe({
//         next: (data: any[]) => {
//           const labels = data.map(d => d.month);
//           const income = data.map(d => d.totalIncome);
//           const expense = data.map(d => d.totalExpense);
//           const profit = data.map(d => d.netAmount);
//
//           this.transactionLineChartData = {
//             labels,
//             datasets: [
//               { ...this.transactionLineChartData.datasets[0], data: income },
//               { ...this.transactionLineChartData.datasets[1], data: expense },
//               { ...this.transactionLineChartData.datasets[2], data: profit }
//             ]
//           };
//           resolve();
//         },
//         error: () => resolve()
//       });
//     });
//   }

  //1 year
  private async loadMonthlyTransactions(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getLastTwelveMonthsTransactions().subscribe({
        next: (data: any[]) => {
          const month = data.map(d => d.month);      // 12 เดือนล่าสุด
          const income = data.map(d => d.totalIncome);
          const expense = data.map(d => d.totalExpense);
          const profit = data.map(d => d.netAmount);

          this.transactionLineChartData = {
            labels: month,
            datasets: [
              { ...this.transactionLineChartData.datasets[0], data: income },
              { ...this.transactionLineChartData.datasets[1], data: expense },
              { ...this.transactionLineChartData.datasets[2], data: profit }
            ]
          };
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private async loadOrdersBySource(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getOrdersBySourceDistribution().subscribe({
        next: (data: { [key: string]: number }) => {
          const labels = Object.keys(data);
          const values = Object.values(data);
          if (labels.length > 0) {
            this.orderSourcePieChartData = {
              labels,
              datasets: [{ ...this.orderSourcePieChartData.datasets[0], data: values }]
            };
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private async loadOrdersByStatus(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getOrdersByStatusDistribution().subscribe({
        next: (data: { [key: string]: number }) => {
          const labels = Object.keys(data);
          const values = Object.values(data);
          if (labels.length > 0) {
            this.orderStatusBarChartData = {
              labels,
              datasets: [{ ...this.orderStatusBarChartData.datasets[0], data: values }]
            };
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  private async loadTopProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.dashboardService.getTopSellingProducts(5).subscribe({
        next: (data: any[]) => {
          if (data?.length > 0) {
            this.topProductsChartData = {
              labels: data.map(p => p.productName),
              datasets: [{ ...this.topProductsChartData.datasets[0], data: data.map(p => p.totalSold) }]
            };
          }
          resolve();
        },
        error: () => resolve()
      });
    });
  }

  // Utility
  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '฿0';
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return new Intl.NumberFormat('th-TH').format(value);
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'Up' : 'Down';
  }

  getGrowthColor(growth: number): string {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
