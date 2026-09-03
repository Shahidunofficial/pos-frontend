import {
  HomeIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CubeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CloudIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'New Sale', href: '/sales/new', icon: ShoppingCartIcon },
  { name: 'Repair Billing', href: '/repairs', icon: WrenchScrewdriverIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Categories', href: '/categories/manage', icon: Squares2X2Icon },
  { name: 'Orders', href: '/orders', icon: ShoppingBagIcon },
  { name: 'Sales Reports', href: '/SalesReport', icon: ChartBarIcon },
  { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Google Merchant', href: '/merchant-sync', icon: CloudIcon },
];
