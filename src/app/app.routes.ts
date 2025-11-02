// import { Routes } from '@angular/router';
//
// export const routes: Routes = [
//   { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
//   {
//     path: 'dashboard',
//     loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
//   },
//
//   // Staff Management (existing)
//   {
//     path: 'staff',
//     loadComponent: () => import('./components/staff/staff').then(m => m.Staff)
//   },
//   {
//     path: 'staff/add',
//     loadComponent: () => import('./components/staff-add/staff-add').then(m => m.StaffAdd)
//   },
//   {
//     path: 'staff/edit/:id',
//     loadComponent: () => import('./components/staff-add/staff-add').then(m => m.StaffAdd)
//   },
//
//   // Customer Management (existing)
//   {
//     path: 'customers',
//     loadComponent: () => import('./components/customer/customer').then(m => m.CustomerComponent)
//   },
//   {
//     path: 'customers/add',
//     loadComponent: () => import('./components/customer-add/customer-add').then(m => m.CustomerAddComponent)
//   },
//   {
//     path: 'customers/edit/:id',
//     loadComponent: () => import('./components/customer-add/customer-add').then(m => m.CustomerAddComponent)
//   },
//
//   // Product Management (updated with new backend integration)
//   {
//     path: 'products',
//     loadComponent: () => import('./components/product/product').then(m => m.ProductComponent)
//   },
//   {
//     path: 'products/add',
//     loadComponent: () => import('./components/product-add/product-add').then(m => m.ProductAddComponent)
//   },
//   {
//     path: 'products/edit/:id',
//     loadComponent: () => import('./components/product-add/product-add').then(m => m.ProductAddComponent)
//   },
//   // Order Management (NEW)
//   {
//     path: 'orders',
//     loadComponent: () => import('./components/order-list/order-list').then(m => m.OrderListComponent)
//   },
//   {
//     path: 'orders/upload',
//     loadComponent: () => import('./components/order-upload/order-upload').then(m => m.OrderUploadComponent)
//   },
//   {
//     path: 'orders/add',
//     loadComponent: () => import('./components/order-add/order-add').then(m => m.OrderAddComponent)
//   },
//   {
//     path: 'orders/edit/:id',
//     loadComponent: () => import('./components/order-add/order-add').then(m => m.OrderAddComponent)
//   },
//   {
//     path: 'orders/:id',
//     loadComponent: () => import('./components/order-detail/order-detail').then(m => m.OrderDetailComponent)
//   },
//   // {
//   //   path: 'products/:id',
//   //   loadComponent: () => import('./components/product-detail/product-detail').then(m => m.ProductDetailComponent)
//   // },
//
//
//
//   // Stock Management (existing)
//   {
//     path: 'stock-lots',
//     loadComponent: () => import('./components/stock-lot/stock-lot').then(m => m.StockLotComponent)
//   },
//   {
//     path: 'stock-lots/add',
//     loadComponent: () => import('./components/stock-lot-add/stock-lot-add').then(m => m.StockLotAddComponent)
//   },
//   {
//     path: 'stock-lots/edit/:id',
//     loadComponent: () => import('./components/stock-lot-add/stock-lot-add').then(m => m.StockLotAddComponent)
//   },
//   {
//     path: 'stock-lots/:id',
//     loadComponent: () => import('./components/stock-lot-detail/stock-lot-detail').then(m => m.StockLotDetailComponent)
//   },
//
//   // China Stock routes (existing)
//   {
//     path: 'china-stocks',
//     loadComponent: () => import('./components/china-stock/china-stock').then(m => m.ChinaStockComponent)
//   },
//   {
//     path: 'china-stocks/add',
//     loadComponent: () => import('./components/china-stock-add/china-stock-add').then(m => m.ChinaStockAddComponent)
//   },
//   {
//     path: 'china-stocks/edit/:id',
//     loadComponent: () => import('./components/china-stock-add/china-stock-add').then(m => m.ChinaStockAddComponent)
//   },
//
//   // Thai Stock routes (existing)
//   {
//     path: 'thai-stocks',
//     loadComponent: () => import('./components/thai-stock/thai-stock').then(m => m.ThaiStockComponent)
//   },
//   {
//     path: 'thai-stocks/add',
//     loadComponent: () => import('./components/thai-stock-add/thai-stock-add').then(m => m.ThaiStockAddComponent)
//   },
//   {
//     path: 'thai-stocks/edit/:id',
//     loadComponent: () => import('./components/thai-stock-add/thai-stock-add').then(m => m.ThaiStockAddComponent)
//   },
//
//   // Stock Management Dashboard (existing)
//   {
//     path: 'stocks-inventory',
//     loadComponent: () => import('./components/stock-dashboard/stock-dashboard').then(m => m.StockDashboardComponent)
//   },
//
//   // Product Cost Analysis (new)
//   {
//     path: 'products/:id/cost-analysis',
//     loadComponent: () => import('./components/product-cost-analysis/product-cost-analysis').then(m => m.ProductCostAnalysisComponent)
//   },
// // Stock Forecast routes (add these after stock management routes)
//   {
//     path: 'stock-forecast',
//     loadComponent: () => import('./components/stock-forecast-dashboard/stock-forecast-dashboard')
//       .then(m => m.StockForecastDashboardComponent)
//   },
//   {
//     path: 'stock-forecast/urgent',
//     loadComponent: () => import('./components/stock-forecast-urgent/stock-forecast-urgent')
//       .then(m => m.StockForecastUrgentComponent)
//   },
//   {
//     path: 'stock-forecast/recommendations',
//     loadComponent: () => import('./components/stock-forecast-recommendations/stock-forecast-recommendations')
//       .then(m => m.StockForecastRecommendationsComponent)
//   },
//   {
//     path: 'stock-forecast/analysis',
//     loadComponent: () => import('./components/stock-forecast-analysis/stock-forecast-analysis')
//       .then(m => m.StockForecastAnalysisComponent)
//   },
//   // Transaction Management (NEW - Income/Expense Tracking)
//   {
//     path: 'transactions',
//     loadComponent: () => import('./components/transaction-list/transaction-list')
//       .then(m => m.TransactionListComponent)
//   },
//   {
//     path: 'transactions/add',
//     loadComponent: () => import('./components/transaction-add/transaction-add')
//       .then(m => m.TransactionAddComponent)
//   },
//   {
//     path: 'transactions/edit/:id',
//     loadComponent: () => import('./components/transaction-add/transaction-add')
//       .then(m => m.TransactionAddComponent)
//   },
//   {
//     path: 'transactions/reports',
//     loadComponent: () => import('./components/transaction-reports/transaction-reports')
//       .then(m => m.TransactionReportsComponent)
//   },
//   // Catch-all route
//   { path: '**', redirectTo: '/products' }
// ];

import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  // ============================================
  // PUBLIC ROUTES (ไม่ต้อง login)
  // ============================================
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },

  // ============================================
  // PROTECTED ROUTES (ต้อง login - ADMIN & MANAGER เท่านั้น)
  // ============================================

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Staff Management
  {
    path: 'staff',
    loadComponent: () => import('./components/staff/staff').then(m => m.Staff),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'staff/add',
    loadComponent: () => import('./components/staff-add/staff-add').then(m => m.StaffAdd),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'staff/edit/:id',
    loadComponent: () => import('./components/staff-add/staff-add').then(m => m.StaffAdd),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Customer Management
  {
    path: 'customers',
    loadComponent: () => import('./components/customer/customer').then(m => m.CustomerComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'customers/add',
    loadComponent: () => import('./components/customer-add/customer-add').then(m => m.CustomerAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'customers/edit/:id',
    loadComponent: () => import('./components/customer-add/customer-add').then(m => m.CustomerAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Product Management
  {
    path: 'products',
    loadComponent: () => import('./components/product/product').then(m => m.ProductComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'products/add',
    loadComponent: () => import('./components/product-add/product-add').then(m => m.ProductAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./components/product-add/product-add').then(m => m.ProductAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'products/:id/cost-analysis',
    loadComponent: () => import('./components/product-cost-analysis/product-cost-analysis').then(m => m.ProductCostAnalysisComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Order Management
  {
    path: 'orders',
    loadComponent: () => import('./components/order-list/order-list').then(m => m.OrderListComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'orders/upload',
    loadComponent: () => import('./components/order-upload/order-upload').then(m => m.OrderUploadComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'orders/add',
    loadComponent: () => import('./components/order-add/order-add').then(m => m.OrderAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'orders/edit/:id',
    loadComponent: () => import('./components/order-add/order-add').then(m => m.OrderAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./components/order-detail/order-detail').then(m => m.OrderDetailComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Stock Lot Management
  {
    path: 'stock-lots',
    loadComponent: () => import('./components/stock-lot/stock-lot').then(m => m.StockLotComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'stock-lots/add',
    loadComponent: () => import('./components/stock-lot-add/stock-lot-add').then(m => m.StockLotAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'stock-lots/edit/:id',
    loadComponent: () => import('./components/stock-lot-add/stock-lot-add').then(m => m.StockLotAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'stock-lots/:id',
    loadComponent: () => import('./components/stock-lot-detail/stock-lot-detail').then(m => m.StockLotDetailComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // China Stock Management
  {
    path: 'china-stocks',
    loadComponent: () => import('./components/china-stock/china-stock').then(m => m.ChinaStockComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'china-stocks/add',
    loadComponent: () => import('./components/china-stock-add/china-stock-add').then(m => m.ChinaStockAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'china-stocks/edit/:id',
    loadComponent: () => import('./components/china-stock-add/china-stock-add').then(m => m.ChinaStockAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Thai Stock Management
  {
    path: 'thai-stocks',
    loadComponent: () => import('./components/thai-stock/thai-stock').then(m => m.ThaiStockComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'thai-stocks/add',
    loadComponent: () => import('./components/thai-stock-add/thai-stock-add').then(m => m.ThaiStockAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'thai-stocks/edit/:id',
    loadComponent: () => import('./components/thai-stock-add/thai-stock-add').then(m => m.ThaiStockAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Stock Inventory Dashboard
  {
    path: 'stocks-inventory',
    loadComponent: () => import('./components/stock-dashboard/stock-dashboard').then(m => m.StockDashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Stock Forecast
  {
    path: 'stock-forecast',
    loadComponent: () => import('./components/stock-forecast-dashboard/stock-forecast-dashboard')
      .then(m => m.StockForecastDashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'stock-forecast/urgent',
    loadComponent: () => import('./components/stock-forecast-urgent/stock-forecast-urgent')
      .then(m => m.StockForecastUrgentComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'stock-forecast/recommendations',
    loadComponent: () => import('./components/stock-forecast-recommendations/stock-forecast-recommendations')
      .then(m => m.StockForecastRecommendationsComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'stock-forecast/analysis',
    loadComponent: () => import('./components/stock-forecast-analysis/stock-forecast-analysis')
      .then(m => m.StockForecastAnalysisComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // Transaction Management (Income/Expense)
  {
    path: 'transactions',
    loadComponent: () => import('./components/transaction-list/transaction-list')
      .then(m => m.TransactionListComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'transactions/add',
    loadComponent: () => import('./components/transaction-add/transaction-add')
      .then(m => m.TransactionAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'transactions/edit/:id',
    loadComponent: () => import('./components/transaction-add/transaction-add')
      .then(m => m.TransactionAddComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'transactions/reports',
    loadComponent: () => import('./components/transaction-reports/transaction-reports')
      .then(m => m.TransactionReportsComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },

  // ... routes อื่นๆ
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat')
      .then(m => m.ChatComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  // ============================================
  // DEFAULT & WILDCARD ROUTES
  // ============================================

  // Default redirect - ถ้ายัง login ให้ไปหน้า login, ถ้า login แล้วให้ไป dashboard
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Unauthorized page (optional)
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized')
      .then(m => m.UnauthorizedComponent)
  },

  // Catch-all route - redirect ไป login
  {
    path: '**',
    redirectTo: '/login'
  }
];
