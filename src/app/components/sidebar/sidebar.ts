// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule, NavigationEnd } from '@angular/router';
// import { filter } from 'rxjs/operators';
//
// interface MenuItem {
//   icon: string;
//   label: string;
//   route: string;
//   subItems?: MenuItem[];
// }
//
// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './sidebar.html',
//   styleUrls: ['./sidebar.css']
// })
// export class Sidebar implements OnInit {
//   activeRoute: string = '/dashboard';
//   isCollapsed: boolean = false;
//   isMobileMenuOpen: boolean = false;
//   expandedMenus: Set<string> = new Set();
//
//   // @ts-ignore
//   menuItems: MenuItem[] = [
//     { icon: 'bi-grid', label: 'Dashboard', route: '/dashboard' },
//     { icon: 'bi-person-vcard', label: 'Staff', route: '/staff' },
//     { icon: 'bi-people', label: 'Customer', route: '/customers' },
//     {
//       icon: 'bi-cart-check',
//       label: 'Order Management',
//       route: '/orders',
//       subItems: [
//         { icon: 'bi-list-ul', label: 'All Orders', route: '/orders' },
//         { icon: 'bi-cloud-upload', label: 'Upload Orders', route: '/orders/upload' },
//         { icon: 'bi-plus-circle', label: 'Add Manual Order', route: '/orders/add' }
//       ]
//     },
//     {
//       icon: 'bi-box-seam',
//       label: 'Product Management',
//       route: '/products',
//       subItems: [
//         { icon: 'bi-boxes', label: 'All Products', route: '/products' },
//       ]
//     },
//     {
//       icon: 'bi-shop-window',
//       label: 'Stock Management',
//       route: '/stock-management',
//       subItems: [
//         { icon: 'bi-box-seam', label: 'Dashboard', route: '/stocks-inventory' },
//         { icon: 'bi-archive', label: 'Stock Lots', route: '/stock-lots' },
//         { icon: 'bi-geo-alt', label: 'China Stock', route: '/china-stocks' },
//         { icon: 'bi-house-fill', label: 'Thai Stock', route: '/thai-stocks' }
//       ]
//     },
//     {
//       icon: 'bi-graph-up-arrow',
//       label: 'Stock Forecast',
//       route: '/stock-forecast',
//       subItems: [
//         { icon: 'bi-speedometer2', label: 'Dashboard', route: '/stock-forecast' },
//         { icon: 'bi-exclamation-triangle', label: 'Urgent Items', route: '/stock-forecast/urgent' },
//         { icon: 'bi-cart-check', label: 'Recommendations', route: '/stock-forecast/recommendations' },
//         { icon: 'bi-graph-up', label: 'Usage Analysis', route: '/stock-forecast/analysis' }
//       ]
//     },
//     // ⭐ เพิ่ม Transaction Management Menu (NEW)
//     {
//       icon: 'bi-cash-coin',
//       label: 'Income & Expense',
//       route: '/transactions',
//       subItems: [
//         { icon: 'bi-list-ul', label: 'All Transactions', route: '/transactions' },
//         { icon: 'bi-plus-circle', label: 'Add Transaction', route: '/transactions/add' },
//         { icon: 'bi-bar-chart', label: 'Reports', route: '/transactions/reports' }
//       ]
//     },
//     { icon: 'bi-tools', label: 'Maintenance', route: '/maintenance' },
//     { icon: 'bi-truck', label: 'Logistics', route: '/logistics' },
//     { icon: 'bi-calculator', label: 'Office Budget', route: '/office-budget' },
//     { icon: 'bi-bell', label: 'Notifications', route: '/notifications' },
//     { icon: 'bi-bar-chart', label: 'Capacity Building', route: '/capacity-building' },
//     { icon: 'bi-clipboard-data', label: 'Procurements', route: '/procurements' }
//   ];
//
//   constructor(private router: Router) {
//     this.router.events.pipe(
//       filter(event => event instanceof NavigationEnd)
//     ).subscribe((event: NavigationEnd) => {
//       this.activeRoute = event.url;
//       this.updateExpandedMenus();
//     });
//   }
//
//   ngOnInit(): void {
//     const savedState = localStorage.getItem('sidebarCollapsed');
//     this.isCollapsed = savedState === 'true';
//     this.updateExpandedMenus();
//     this.notifySidebarState();
//   }
//
//   private updateExpandedMenus(): void {
//     this.menuItems.forEach(item => {
//       if (item.subItems) {
//         const hasActiveSubItem = item.subItems.some(subItem =>
//           this.activeRoute.startsWith(subItem.route)
//         );
//         if (hasActiveSubItem) {
//           this.expandedMenus.add(item.route);
//         }
//       }
//     });
//   }
//
//   isActiveRoute(route: string): boolean {
//     return this.activeRoute.startsWith(route);
//   }
//
//   isSubItemActive(subItem: MenuItem): boolean {
//     return this.activeRoute.startsWith(subItem.route);
//   }
//
//   navigateToRoute(route: string): void {
//     this.activeRoute = route;
//     this.router.navigate([route]);
//     if (this.isMobile) {
//       this.isMobileMenuOpen = false;
//       this.notifySidebarState();
//     }
//   }
//
//   toggleSubMenu(item: MenuItem, event: Event): void {
//     event.preventDefault();
//     event.stopPropagation();
//
//     if (item.subItems) {
//       if (this.expandedMenus.has(item.route)) {
//         this.expandedMenus.delete(item.route);
//       } else {
//         this.expandedMenus.add(item.route);
//       }
//     }
//   }
//
//   isMenuExpanded(route: string): boolean {
//     return this.expandedMenus.has(route);
//   }
//
//   toggleSidebar(): void {
//     if (this.isMobile) {
//       this.isMobileMenuOpen = !this.isMobileMenuOpen;
//     } else {
//       this.isCollapsed = !this.isCollapsed;
//       localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
//     }
//     this.notifySidebarState();
//   }
//
//   private notifySidebarState(): void {
//     window.dispatchEvent(new CustomEvent('sidebarToggle', {
//       detail: { collapsed: this.isCollapsed || (this.isMobile && !this.isMobileMenuOpen) }
//     }));
//   }
//
//   get isMobile(): boolean {
//     return window.innerWidth <= 768;
//   }
// }
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService, EmployeeDTO } from '../../services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  subItems?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeRoute: string = '/dashboard';
  isCollapsed: boolean = false;
  isMobileMenuOpen: boolean = false;
  expandedMenus: Set<string> = new Set();

  // ⭐ User Data จาก AuthService
  currentUser: EmployeeDTO | null = null;

  menuItems: MenuItem[] = [
    { icon: 'bi-grid', label: 'Dashboard', route: '/dashboard' },
    { icon: 'bi-person-vcard', label: 'Staff', route: '/staff' },
    { icon: 'bi-people', label: 'Customer', route: '/customers' },
    {
      icon: 'bi-cart-check',
      label: 'Order Management',
      route: '/orders',
      subItems: [
        { icon: 'bi-list-ul', label: 'All Orders', route: '/orders' },
        { icon: 'bi-cloud-upload', label: 'Upload Orders', route: '/orders/upload' },
        { icon: 'bi-plus-circle', label: 'Add Manual Order', route: '/orders/add' }
      ]
    },
    {
      icon: 'bi-box-seam',
      label: 'Product Management',
      route: '/products',
      subItems: [
        { icon: 'bi-boxes', label: 'All Products', route: '/products' },
      ]
    },
    {
      icon: 'bi-shop-window',
      label: 'Stock Management',
      route: '/stock-management',
      subItems: [
        { icon: 'bi-box-seam', label: 'Dashboard', route: '/stocks-inventory' },
        { icon: 'bi-archive', label: 'Stock Lots', route: '/stock-lots' },
        { icon: 'bi-geo-alt', label: 'China Stock', route: '/china-stocks' },
        { icon: 'bi-house-fill', label: 'Thai Stock', route: '/thai-stocks' }
      ]
    },
    {
      icon: 'bi-graph-up-arrow',
      label: 'Stock Forecast',
      route: '/stock-forecast',
      subItems: [
        { icon: 'bi-speedometer2', label: 'Dashboard', route: '/stock-forecast' },
        { icon: 'bi-exclamation-triangle', label: 'Urgent Items', route: '/stock-forecast/urgent' },
        { icon: 'bi-cart-check', label: 'Recommendations', route: '/stock-forecast/recommendations' },
        { icon: 'bi-graph-up', label: 'Usage Analysis', route: '/stock-forecast/analysis' }
      ]
    },
    {
      icon: 'bi-cash-coin',
      label: 'Income & Expense',
      route: '/transactions',
      subItems: [
        { icon: 'bi-list-ul', label: 'All Transactions', route: '/transactions' },
        { icon: 'bi-plus-circle', label: 'Add Transaction', route: '/transactions/add' },
        { icon: 'bi-bar-chart', label: 'Reports', route: '/transactions/reports' }
      ]
    },
    { icon: 'bi-chat-right-heart', label: 'Chubby Charlie AI', route: '/chat' },
    // { icon: 'bi-truck', label: 'Logistics', route: '/logistics' },
    // { icon: 'bi-calculator', label: 'Office Budget', route: '/office-budget' },
    // { icon: 'bi-bell', label: 'Notifications', route: '/notifications' },
    // { icon: 'bi-bar-chart', label: 'Capacity Building', route: '/capacity-building' },
    // { icon: 'bi-clipboard-data', label: 'Procurements', route: '/procurements' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.activeRoute = event.url;
      this.updateExpandedMenus();
    });
  }

  ngOnInit(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    this.isCollapsed = savedState === 'true';
    this.updateExpandedMenus();
    this.notifySidebarState();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ⭐ โหลดข้อมูลผู้ใช้จาก AuthService
   */
  private loadUserData(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private updateExpandedMenus(): void {
    this.menuItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem =>
          this.activeRoute.startsWith(subItem.route)
        );
        if (hasActiveSubItem) {
          this.expandedMenus.add(item.route);
        }
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }

  isSubItemActive(subItem: MenuItem): boolean {
    return this.activeRoute.startsWith(subItem.route);
  }

  navigateToRoute(route: string): void {
    this.activeRoute = route;
    this.router.navigate([route]);
    if (this.isMobile) {
      this.isMobileMenuOpen = false;
      this.notifySidebarState();
    }
  }

  toggleSubMenu(item: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (item.subItems) {
      if (this.expandedMenus.has(item.route)) {
        this.expandedMenus.delete(item.route);
      } else {
        this.expandedMenus.add(item.route);
      }
    }
  }

  isMenuExpanded(route: string): boolean {
    return this.expandedMenus.has(route);
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
    }
    this.notifySidebarState();
  }

  private notifySidebarState(): void {
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: this.isCollapsed || (this.isMobile && !this.isMobileMenuOpen) }
    }));
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  // ====================== PROFILE & LOGOUT ======================

  /**
   * ⭐ ชื่อผู้ใช้
   */
  get userName(): string {
    return this.currentUser?.empName || 'User';
  }

  /**
   * ⭐ Role ผู้ใช้
   */
  get userRole(): string {
    return this.currentUser?.role || 'Employee';
  }

  /**
   * ⭐ Email ผู้ใช้
   */
  get userEmail(): string {
    return this.currentUser?.email || '';
  }

  /**
   * ⭐ Initial ชื่อผู้ใช้ (ตัวอักษรแรก)
   */
  get userInitial(): string {
    if (!this.currentUser?.empName) return 'U';
    return this.currentUser.empName.charAt(0).toUpperCase();
  }

  /**
   * ⭐ ตรวจสอบว่าเป็น Admin หรือไม่
   */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * ⭐ ตรวจสอบว่าเป็น Manager หรือไม่
   */
  get isManager(): boolean {
    return this.authService.isManager();
  }

  /**
   * ⭐ Navigate ไป Profile
   */
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * ⭐ Navigate ไป Settings
   */
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  /**
   * ⭐ Logout
   */
  logout(): void {
    if (confirm('คุณแน่ใจว่าต้องการออกจากระบบ?')) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Logged out successfully');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
