import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CanonicalPerm {
  name: string;
  module: string;
  action: string;
  application: string;
  description: string;
  // Patterns / alias names that should be merged into this canonical permission
  aliases: string[];
}

const CANONICAL_PERMISSIONS: CanonicalPerm[] = [
  // GLOBAL
  {
    name: 'manage-all',
    module: 'all',
    action: 'manage',
    application: 'GLOBAL',
    description: 'Full system super administrator access',
    aliases: ['manage-all', 'all:manage', 'all_manage', 'manage_all'],
  },

  // DASHBOARD
  {
    name: 'read-dashboard',
    module: 'dashboard',
    action: 'read',
    application: 'GATEPASS',
    description: 'View dashboard overview',
    aliases: ['read-dashboard', 'read_dashboard', 'dashboard:read'],
  },
  {
    name: 'sidebar-dashboard',
    module: 'dashboard',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show dashboard link in navigation',
    aliases: ['sidebar-dashboard', 'sidebar_dashboard', 'dashboard:sidebar'],
  },

  // USERS
  {
    name: 'create-user',
    module: 'users',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create new system users',
    aliases: ['create-user', 'create-users', 'create_user', 'create_users', 'users:create', 'user:create'],
  },
  {
    name: 'read-user',
    module: 'users',
    action: 'read',
    application: 'GATEPASS',
    description: 'View system users',
    aliases: ['read-user', 'read-users', 'read_user', 'read_users', 'users:read', 'user:read'],
  },
  {
    name: 'update-user',
    module: 'users',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update system users',
    aliases: ['update-user', 'update-users', 'update_user', 'update_users', 'users:update', 'user:update', 'edit-user', 'edit-users'],
  },
  {
    name: 'delete-user',
    module: 'users',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete system users',
    aliases: ['delete-user', 'delete-users', 'delete_user', 'delete_users', 'users:delete', 'user:delete', 'manage-users'],
  },
  {
    name: 'sidebar-users',
    module: 'users',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show users menu in navigation',
    aliases: ['sidebar-users', 'sidebar-user', 'sidebar_users', 'users:sidebar'],
  },

  // ROLES
  {
    name: 'create-role',
    module: 'roles',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create security roles',
    aliases: ['create-role', 'create-roles', 'create_role', 'create_roles', 'roles:create', 'role:create'],
  },
  {
    name: 'read-role',
    module: 'roles',
    action: 'read',
    application: 'GATEPASS',
    description: 'View security roles',
    aliases: ['read-role', 'read-roles', 'read_role', 'read_roles', 'roles:read', 'role:read'],
  },
  {
    name: 'update-role',
    module: 'roles',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update security roles and permission mappings',
    aliases: ['update-role', 'update-roles', 'update_role', 'update_roles', 'roles:update', 'role:update', 'edit-role', 'edit-roles'],
  },
  {
    name: 'delete-role',
    module: 'roles',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete security roles',
    aliases: ['delete-role', 'delete-roles', 'delete_role', 'delete_roles', 'roles:delete', 'role:delete', 'manage-roles'],
  },
  {
    name: 'sidebar-roles',
    module: 'roles',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show roles & permissions in navigation',
    aliases: ['sidebar-roles', 'sidebar-role', 'sidebar_roles', 'roles:sidebar'],
  },

  // PERMISSIONS
  {
    name: 'create-permission',
    module: 'permissions',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create system permission codes',
    aliases: ['create-permission', 'create-permissions', 'create_permission'],
  },
  {
    name: 'read-permission',
    module: 'permissions',
    action: 'read',
    application: 'GATEPASS',
    description: 'View system permissions',
    aliases: ['read-permission', 'read-permissions', 'read_permission'],
  },
  {
    name: 'update-permission',
    module: 'permissions',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update system permissions',
    aliases: ['update-permission', 'update-permissions', 'update_permission'],
  },
  {
    name: 'delete-permission',
    module: 'permissions',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete system permissions',
    aliases: ['delete-permission', 'delete-permissions', 'delete_permission', 'manage-permissions'],
  },

  // FINANCE: ACCOUNTS
  {
    name: 'create-account',
    module: 'accounts',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create chart of accounts',
    aliases: ['create-account', 'create-accounts', 'create_account'],
  },
  {
    name: 'read-account',
    module: 'accounts',
    action: 'read',
    application: 'GATEPASS',
    description: 'View chart of accounts',
    aliases: ['read-account', 'read-accounts', 'read_account'],
  },
  {
    name: 'update-account',
    module: 'accounts',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update chart of accounts',
    aliases: ['update-account', 'update-accounts', 'update_account'],
  },
  {
    name: 'delete-account',
    module: 'accounts',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete chart of accounts',
    aliases: ['delete-account', 'delete-accounts', 'delete_account'],
  },
  {
    name: 'sidebar-accounts',
    module: 'accounts',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show accounts in navigation',
    aliases: ['sidebar-accounts', 'sidebar-account', 'sidebar_accounts'],
  },

  // FINANCE: VOUCHERS
  {
    name: 'create-voucher',
    module: 'vouchers',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create accounting vouchers',
    aliases: ['create-voucher', 'create-vouchers', 'create_voucher'],
  },
  {
    name: 'read-voucher',
    module: 'vouchers',
    action: 'read',
    application: 'GATEPASS',
    description: 'View accounting vouchers',
    aliases: ['read-voucher', 'read-vouchers', 'read_voucher'],
  },
  {
    name: 'update-voucher',
    module: 'vouchers',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update accounting vouchers',
    aliases: ['update-voucher', 'update-vouchers', 'update_voucher'],
  },
  {
    name: 'delete-voucher',
    module: 'vouchers',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete accounting vouchers',
    aliases: ['delete-voucher', 'delete-vouchers', 'delete_voucher'],
  },
  {
    name: 'approve-voucher',
    module: 'vouchers',
    action: 'approve',
    application: 'GATEPASS',
    description: 'Post and approve accounting vouchers',
    aliases: ['approve-voucher', 'approve-vouchers', 'approve_voucher'],
  },
  {
    name: 'sidebar-vouchers',
    module: 'vouchers',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show vouchers in navigation',
    aliases: ['sidebar-vouchers', 'sidebar-voucher', 'sidebar_vouchers'],
  },

  // FINANCE: LEDGERS & STATEMENTS
  {
    name: 'create-customer-ledger',
    module: 'customer_ledger',
    action: 'create',
    application: 'GATEPASS',
    description: 'Record customer payment receipts',
    aliases: ['create-customer-ledger', 'create_customer_ledger', 'record-customer-receipt'],
  },
  {
    name: 'read-customer-ledger',
    module: 'customer_ledger',
    action: 'read',
    application: 'GATEPASS',
    description: 'View customer accounts receivable ledger',
    aliases: ['read-customer-ledger', 'read_customer_ledger'],
  },
  {
    name: 'export-customer-ledger',
    module: 'customer_ledger',
    action: 'export',
    application: 'GATEPASS',
    description: 'Export customer AR ledger statement',
    aliases: ['export-customer-ledger', 'export_customer_ledger'],
  },
  {
    name: 'sidebar-customer-ledger',
    module: 'customer_ledger',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show customer ledger in navigation',
    aliases: ['sidebar-customer-ledger', 'sidebar_customer_ledger'],
  },

  {
    name: 'create-supplier-ledger',
    module: 'supplier_ledger',
    action: 'create',
    application: 'GATEPASS',
    description: 'Disburse vendor payments',
    aliases: ['create-supplier-ledger', 'create_supplier_ledger', 'disburse-vendor-payment'],
  },
  {
    name: 'read-supplier-ledger',
    module: 'supplier_ledger',
    action: 'read',
    application: 'GATEPASS',
    description: 'View supplier accounts payable ledger',
    aliases: ['read-supplier-ledger', 'read_supplier_ledger'],
  },
  {
    name: 'export-supplier-ledger',
    module: 'supplier_ledger',
    action: 'export',
    application: 'GATEPASS',
    description: 'Export supplier AP ledger statement',
    aliases: ['export-supplier-ledger', 'export_supplier_ledger'],
  },
  {
    name: 'sidebar-supplier-ledger',
    module: 'supplier_ledger',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show supplier ledger in navigation',
    aliases: ['sidebar-supplier-ledger', 'sidebar_supplier_ledger'],
  },

  {
    name: 'read-financial-reports',
    module: 'financial_reports',
    action: 'read',
    application: 'GATEPASS',
    description: 'View financial statements and reports',
    aliases: ['read-financial-reports', 'read_financial_reports'],
  },
  {
    name: 'export-financial-reports',
    module: 'financial_reports',
    action: 'export',
    application: 'GATEPASS',
    description: 'Export financial reports',
    aliases: ['export-financial-reports', 'export_financial_reports'],
  },
  {
    name: 'sidebar-financial-reports',
    module: 'financial_reports',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show financial statements in navigation',
    aliases: ['sidebar-financial-reports', 'sidebar_financial_reports'],
  },

  // PRODUCTS MASTER
  {
    name: 'create-product',
    module: 'product',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create product masters',
    aliases: ['create-product', 'create-products', 'create_product', 'create_products'],
  },
  {
    name: 'read-product',
    module: 'product',
    action: 'read',
    application: 'GATEPASS',
    description: 'View product master catalogue',
    aliases: ['read-product', 'read-products', 'read_product', 'read_products'],
  },
  {
    name: 'update-product',
    module: 'product',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update product details and specs',
    aliases: ['update-product', 'update-products', 'update_product', 'update_products', 'edit-product'],
  },
  {
    name: 'delete-product',
    module: 'product',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete product masters',
    aliases: ['delete-product', 'delete-products', 'delete_product', 'delete_products'],
  },
  {
    name: 'sidebar-products',
    module: 'product',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show product master in navigation',
    aliases: ['sidebar-products', 'sidebar-product', 'sidebar_products'],
  },

  // PRODUCT CATEGORIES
  {
    name: 'create-product-category',
    module: 'product_category',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create product categories',
    aliases: ['create-product-category', 'create-product-categories', 'create_product_category'],
  },
  {
    name: 'read-product-category',
    module: 'product_category',
    action: 'read',
    application: 'GATEPASS',
    description: 'View product categories',
    aliases: ['read-product-category', 'read-product-categories', 'read_product_category'],
  },
  {
    name: 'update-product-category',
    module: 'product_category',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update product categories',
    aliases: ['update-product-category', 'update-product-categories', 'update_product_category'],
  },
  {
    name: 'delete-product-category',
    module: 'product_category',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete product categories',
    aliases: ['delete-product-category', 'delete-product-categories', 'delete_product_category'],
  },
  {
    name: 'sidebar-product-categories',
    module: 'product_category',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show product categories in navigation',
    aliases: ['sidebar-product-categories', 'sidebar-product-category', 'sidebar_product_categories'],
  },

  // PRODUCT SUB-CATEGORIES
  {
    name: 'create-product-sub-category',
    module: 'product_sub_category',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create product sub-categories',
    aliases: ['create-product-sub-category', 'create-product-sub-categories', 'create_product_sub_category'],
  },
  {
    name: 'read-product-sub-category',
    module: 'product_sub_category',
    action: 'read',
    application: 'GATEPASS',
    description: 'View product sub-categories',
    aliases: ['read-product-sub-category', 'read-product-sub-categories', 'read_product_sub_category'],
  },
  {
    name: 'update-product-sub-category',
    module: 'product_sub_category',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update product sub-categories',
    aliases: ['update-product-sub-category', 'update-product-sub-categories', 'update_product_sub_category'],
  },
  {
    name: 'delete-product-sub-category',
    module: 'product_sub_category',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete product sub-categories',
    aliases: ['delete-product-sub-category', 'delete-product-sub-categories', 'delete_product_sub_category'],
  },
  {
    name: 'sidebar-product-sub-categories',
    module: 'product_sub_category',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show product sub-categories in navigation',
    aliases: ['sidebar-product-sub-categories', 'sidebar-product-sub-category', 'sidebar_product_sub_categories'],
  },

  // UOMS
  {
    name: 'create-uom',
    module: 'uom',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create units of measurement',
    aliases: ['create-uom', 'create-uoms', 'create_uom', 'create_uoms'],
  },
  {
    name: 'read-uom',
    module: 'uom',
    action: 'read',
    application: 'GATEPASS',
    description: 'View units of measurement',
    aliases: ['read-uom', 'read-uoms', 'read_uom', 'read_uoms'],
  },
  {
    name: 'update-uom',
    module: 'uom',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update units of measurement',
    aliases: ['update-uom', 'update-uoms', 'update_uom', 'update_uoms'],
  },
  {
    name: 'delete-uom',
    module: 'uom',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete units of measurement',
    aliases: ['delete-uom', 'delete-uoms', 'delete_uom', 'delete_uoms'],
  },
  {
    name: 'sidebar-uoms',
    module: 'uom',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show UOM master in navigation',
    aliases: ['sidebar-uoms', 'sidebar-uom', 'sidebar_uoms'],
  },

  // PACKING MATERIALS
  {
    name: 'create-packing-material',
    module: 'packing_material',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create packing materials',
    aliases: ['create-packing-material', 'create-packing-materials', 'create_packing_material', 'create_packing_materials'],
  },
  {
    name: 'read-packing-material',
    module: 'packing_material',
    action: 'read',
    application: 'GATEPASS',
    description: 'View packing materials catalogue',
    aliases: ['read-packing-material', 'read-packing-materials', 'read_packing_material', 'read_packing_materials'],
  },
  {
    name: 'update-packing-material',
    module: 'packing_material',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update packing materials',
    aliases: ['update-packing-material', 'update-packing-materials', 'update_packing_material', 'update_packing_materials'],
  },
  {
    name: 'delete-packing-material',
    module: 'packing_material',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete packing materials',
    aliases: ['delete-packing-material', 'delete-packing-materials', 'delete_packing_material', 'delete_packing_materials'],
  },
  {
    name: 'sidebar-packing-materials',
    module: 'packing_material',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show packing materials in navigation',
    aliases: ['sidebar-packing-materials', 'sidebar-packing-material', 'sidebar_packing_materials'],
  },

  // QC SPECIFICATIONS
  {
    name: 'create-qc-specification',
    module: 'qc_specification',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create QC specifications',
    aliases: ['create-qc-specification', 'create-qc-specifications', 'create_qc_specification', 'create_qc_specifications'],
  },
  {
    name: 'read-qc-specification',
    module: 'qc_specification',
    action: 'read',
    application: 'GATEPASS',
    description: 'View QC specifications',
    aliases: ['read-qc-specification', 'read-qc-specifications', 'read_qc_specification', 'read_qc_specifications'],
  },
  {
    name: 'update-qc-specification',
    module: 'qc_specification',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update QC specifications',
    aliases: ['update-qc-specification', 'update-qc-specifications', 'update_qc_specification', 'update_qc_specifications'],
  },
  {
    name: 'delete-qc-specification',
    module: 'qc_specification',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete QC specifications',
    aliases: ['delete-qc-specification', 'delete-qc-specifications', 'delete_qc_specification', 'delete_qc_specifications'],
  },
  {
    name: 'sidebar-qc-specifications',
    module: 'qc_specification',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show QC specifications in navigation',
    aliases: ['sidebar-qc-specifications', 'sidebar-qc-specification', 'sidebar_qc_specifications'],
  },

  // STORAGE LOCATIONS
  {
    name: 'create-storage-location',
    module: 'storage_location',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create warehouse storage locations',
    aliases: [
      'create-storage-location',
      'create-storage-locations',
      'create_storage_location',
      'create_storage_locations',
      'create storage location',
      'create-storage_location',
    ],
  },
  {
    name: 'read-storage-location',
    module: 'storage_location',
    action: 'read',
    application: 'GATEPASS',
    description: 'View warehouse storage locations',
    aliases: [
      'read-storage-location',
      'read-storage-locations',
      'read_storage_location',
      'read_storage_locations',
      'read storage location',
      'read-storage_location',
    ],
  },
  {
    name: 'update-storage-location',
    module: 'storage_location',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update storage locations',
    aliases: [
      'update-storage-location',
      'update-storage-locations',
      'update_storage_location',
      'update_storage_locations',
      'update storage location',
      'update-storage_location',
    ],
  },
  {
    name: 'delete-storage-location',
    module: 'storage_location',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete storage locations',
    aliases: [
      'delete-storage-location',
      'delete-storage-locations',
      'delete_storage_location',
      'delete_storage_locations',
      'delete storage location',
      'delete-storage_location',
    ],
  },
  {
    name: 'sidebar-storage-locations',
    module: 'storage_location',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show storage locations in navigation',
    aliases: ['sidebar-storage-locations', 'sidebar-storage-location', 'sidebar_storage_locations'],
  },

  // PASS CATEGORIES
  {
    name: 'create-pass-category',
    module: 'pass_category',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create pass categories',
    aliases: ['create-pass-category', 'create-pass-categories', 'create_pass_category', 'create_pass_categories'],
  },
  {
    name: 'read-pass-category',
    module: 'pass_category',
    action: 'read',
    application: 'GATEPASS',
    description: 'View pass categories',
    aliases: ['read-pass-category', 'read-pass-categories', 'read_pass_category', 'read_pass_categories'],
  },
  {
    name: 'update-pass-category',
    module: 'pass_category',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update pass categories',
    aliases: ['update-pass-category', 'update-pass-categories', 'update_pass_category', 'update_pass_categories'],
  },
  {
    name: 'delete-pass-category',
    module: 'pass_category',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete pass categories',
    aliases: ['delete-pass-category', 'delete-pass-categories', 'delete_pass_category', 'delete_pass_categories'],
  },
  {
    name: 'sidebar-pass-categories',
    module: 'pass_category',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show pass categories in navigation',
    aliases: ['sidebar-pass-categories', 'sidebar-pass-category', 'sidebar_pass_categories'],
  },

  // BANKS
  {
    name: 'create-bank',
    module: 'bank',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create bank masters',
    aliases: ['create-bank', 'create-banks', 'create_bank', 'create_banks'],
  },
  {
    name: 'read-bank',
    module: 'bank',
    action: 'read',
    application: 'GATEPASS',
    description: 'View bank masters',
    aliases: ['read-bank', 'read-banks', 'read_bank', 'read_banks'],
  },
  {
    name: 'update-bank',
    module: 'bank',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update bank masters',
    aliases: ['update-bank', 'update-banks', 'update_bank', 'update_banks'],
  },
  {
    name: 'delete-bank',
    module: 'bank',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete bank masters',
    aliases: ['delete-bank', 'delete-banks', 'delete_bank', 'delete_banks'],
  },
  {
    name: 'sidebar-banks',
    module: 'bank',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show bank master in navigation',
    aliases: ['sidebar-banks', 'sidebar-bank', 'sidebar_banks'],
  },

  // VENDORS
  {
    name: 'create-vendor',
    module: 'vendor',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create vendor master records',
    aliases: ['create-vendor', 'create-vendors', 'create_vendor', 'create_vendors'],
  },
  {
    name: 'read-vendor',
    module: 'vendor',
    action: 'read',
    application: 'GATEPASS',
    description: 'View vendor master records',
    aliases: ['read-vendor', 'read-vendors', 'read_vendor', 'read_vendors'],
  },
  {
    name: 'update-vendor',
    module: 'vendor',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update vendor master records',
    aliases: ['update-vendor', 'update-vendors', 'update_vendor', 'update_vendors'],
  },
  {
    name: 'delete-vendor',
    module: 'vendor',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete vendor master records',
    aliases: ['delete-vendor', 'delete-vendors', 'delete_vendor', 'delete_vendors'],
  },
  {
    name: 'sidebar-vendors',
    module: 'vendor',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show vendor master in navigation',
    aliases: ['sidebar-vendors', 'sidebar-vendor', 'sidebar_vendors'],
  },

  // CUSTOMERS
  {
    name: 'create-customer',
    module: 'customer',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create customer records',
    aliases: ['create-customer', 'create-customers', 'create_customer', 'create_customers'],
  },
  {
    name: 'read-customer',
    module: 'customer',
    action: 'read',
    application: 'GATEPASS',
    description: 'View customer records',
    aliases: ['read-customer', 'read-customers', 'read_customer', 'read_customers'],
  },
  {
    name: 'update-customer',
    module: 'customer',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update customer records',
    aliases: ['update-customer', 'update-customers', 'update_customer', 'update_customers'],
  },
  {
    name: 'delete-customer',
    module: 'customer',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete customer records',
    aliases: ['delete-customer', 'delete-customers', 'delete_customer', 'delete_customers'],
  },
  {
    name: 'sidebar-customers',
    module: 'customer',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show customer master in navigation',
    aliases: ['sidebar-customers', 'sidebar-customer', 'sidebar_customers'],
  },

  // SUPPLIERS
  {
    name: 'create-supplier',
    module: 'supplier',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create supplier records',
    aliases: ['create-supplier', 'create-suppliers', 'create_supplier', 'create_suppliers'],
  },
  {
    name: 'read-supplier',
    module: 'supplier',
    action: 'read',
    application: 'GATEPASS',
    description: 'View supplier records',
    aliases: ['read-supplier', 'read-suppliers', 'read_supplier', 'read_suppliers'],
  },
  {
    name: 'update-supplier',
    module: 'supplier',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update supplier records',
    aliases: ['update-supplier', 'update-suppliers', 'update_supplier', 'update_suppliers'],
  },
  {
    name: 'delete-supplier',
    module: 'supplier',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Delete supplier records',
    aliases: ['delete-supplier', 'delete-suppliers', 'delete_supplier', 'delete_suppliers'],
  },
  {
    name: 'sidebar-suppliers',
    module: 'supplier',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show supplier master in navigation',
    aliases: ['sidebar-suppliers', 'sidebar-supplier', 'sidebar_suppliers'],
  },

  // GATEPASS CORE
  {
    name: 'create-gatepass',
    module: 'gatepass',
    action: 'create',
    application: 'GATEPASS',
    description: 'Create new gate passes',
    aliases: ['create-gatepass', 'create-gatepasses', 'create_gatepass', 'create_gatepasses', 'create-app.gatepass', 'create-gate_pass'],
  },
  {
    name: 'read-gatepass',
    module: 'gatepass',
    action: 'read',
    application: 'GATEPASS',
    description: 'View gate pass logs',
    aliases: ['read-gatepass', 'read-gatepasses', 'read_gatepass', 'read_gatepasses', 'read-app.gatepass', 'read-gate_pass'],
  },
  {
    name: 'update-gatepass',
    module: 'gatepass',
    action: 'update',
    application: 'GATEPASS',
    description: 'Update and edit gate pass entries',
    aliases: ['update-gatepass', 'update-gatepasses', 'update_gatepass', 'update_gatepasses', 'update-app.gatepass', 'update-gate_pass'],
  },
  {
    name: 'delete-gatepass',
    module: 'gatepass',
    action: 'delete',
    application: 'GATEPASS',
    description: 'Cancel or delete gate passes',
    aliases: ['delete-gatepass', 'delete-gatepasses', 'delete_gatepass', 'delete_gatepasses', 'delete-app.gatepass', 'delete-gate_pass'],
  },
  {
    name: 'approve-gatepass',
    module: 'gatepass',
    action: 'approve',
    application: 'GATEPASS',
    description: 'Approve gate-in and gate-out security dispatch',
    aliases: ['approve-gatepass', 'approve-gatepasses', 'approve_gatepass', 'approve-app.gatepass'],
  },
  {
    name: 'sidebar-gatepass',
    module: 'gatepass',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show gate pass in navigation',
    aliases: ['sidebar-gatepass', 'sidebar-gatepasses', 'sidebar_gatepass'],
  },

  // AUDIT & ACTIVITY LOGS
  {
    name: 'read-activity-logs',
    module: 'activity_logs',
    action: 'read',
    application: 'GATEPASS',
    description: 'View system audit trails and logs',
    aliases: ['read-activity-logs', 'read-activity_logs', 'read_activity_logs', 'read-audit'],
  },
  {
    name: 'sidebar-activity-logs',
    module: 'activity_logs',
    action: 'sidebar',
    application: 'GATEPASS',
    description: 'Show activity logs in navigation',
    aliases: ['sidebar-activity-logs', 'sidebar-activity_logs', 'sidebar_activity_logs', 'sidebar-audit'],
  },

  // ──────────────── HRMS CANONICAL PERMISSIONS ────────────────
  {
    name: 'create-department',
    module: 'department',
    action: 'create',
    application: 'HRMS',
    description: 'Create departments',
    aliases: ['create-department', 'create-departments', 'create_department', 'create_departments'],
  },
  {
    name: 'read-department',
    module: 'department',
    action: 'read',
    application: 'HRMS',
    description: 'View departments',
    aliases: ['read-department', 'read-departments', 'read_department', 'read_departments'],
  },
  {
    name: 'update-department',
    module: 'department',
    action: 'update',
    application: 'HRMS',
    description: 'Update departments',
    aliases: ['update-department', 'update-departments', 'update_department', 'update_departments'],
  },
  {
    name: 'delete-department',
    module: 'department',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete departments',
    aliases: ['delete-department', 'delete-departments', 'delete_department', 'delete_departments'],
  },
  {
    name: 'sidebar-departments',
    module: 'department',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show department master in navigation',
    aliases: ['sidebar-departments', 'sidebar-department', 'sidebar_departments'],
  },

  {
    name: 'create-financial-year',
    module: 'financial_year',
    action: 'create',
    application: 'HRMS',
    description: 'Create financial years',
    aliases: ['create-financial-year', 'create-financial-years', 'create_financial_year'],
  },
  {
    name: 'read-financial-year',
    module: 'financial_year',
    action: 'read',
    application: 'HRMS',
    description: 'View financial years',
    aliases: ['read-financial-year', 'read-financial-years', 'read_financial_year'],
  },
  {
    name: 'update-financial-year',
    module: 'financial_year',
    action: 'update',
    application: 'HRMS',
    description: 'Update financial years',
    aliases: ['update-financial-year', 'update-financial-years', 'update_financial_year'],
  },
  {
    name: 'delete-financial-year',
    module: 'financial_year',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete financial years',
    aliases: ['delete-financial-year', 'delete-financial-years', 'delete_financial_year'],
  },
  {
    name: 'sidebar-financial-year',
    module: 'financial_year',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show financial year master in navigation',
    aliases: ['sidebar-financial-year', 'sidebar-financial-years', 'sidebar_financial_year'],
  },

  {
    name: 'create-training-type',
    module: 'training',
    action: 'create',
    application: 'HRMS',
    description: 'Create training programs',
    aliases: ['create-training-type', 'create-training-types', 'create_training_type', 'create_training'],
  },
  {
    name: 'read-training-type',
    module: 'training',
    action: 'read',
    application: 'HRMS',
    description: 'View training programs',
    aliases: ['read-training-type', 'read-training-types', 'read_training_type', 'read_training'],
  },
  {
    name: 'update-training-type',
    module: 'training',
    action: 'update',
    application: 'HRMS',
    description: 'Update training programs',
    aliases: ['update-training-type', 'update-training-types', 'update_training_type', 'update_training'],
  },
  {
    name: 'delete-training-type',
    module: 'training',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete training programs',
    aliases: ['delete-training-type', 'delete-training-types', 'delete_training_type', 'delete_training'],
  },
  {
    name: 'sidebar-training-type',
    module: 'training',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show training type in navigation',
    aliases: ['sidebar-training-type', 'sidebar-training-types', 'sidebar_training_type'],
  },

  {
    name: 'create-leave-master',
    module: 'leave_master',
    action: 'create',
    application: 'HRMS',
    description: 'Create leave types and quotas',
    aliases: ['create-leave-master', 'create_leave_master'],
  },
  {
    name: 'read-leave-master',
    module: 'leave_master',
    action: 'read',
    application: 'HRMS',
    description: 'View leave types',
    aliases: ['read-leave-master', 'read_leave_master'],
  },
  {
    name: 'update-leave-master',
    module: 'leave_master',
    action: 'update',
    application: 'HRMS',
    description: 'Update leave policies',
    aliases: ['update-leave-master', 'update_leave_master'],
  },
  {
    name: 'delete-leave-master',
    module: 'leave_master',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete leave types',
    aliases: ['delete-leave-master', 'delete_leave_master'],
  },
  {
    name: 'sidebar-leave-master',
    module: 'leave_master',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show leave master in navigation',
    aliases: ['sidebar-leave-master', 'sidebar_leave_master'],
  },

  {
    name: 'create-interview-rounds',
    module: 'interview_rounds',
    action: 'create',
    application: 'HRMS',
    description: 'Create interview rounds',
    aliases: ['create-interview-rounds', 'create-interview-round', 'create_interview_rounds'],
  },
  {
    name: 'read-interview-rounds',
    module: 'interview_rounds',
    action: 'read',
    application: 'HRMS',
    description: 'View interview rounds',
    aliases: ['read-interview-rounds', 'read-interview-round', 'read_interview_rounds'],
  },
  {
    name: 'update-interview-rounds',
    module: 'interview_rounds',
    action: 'update',
    application: 'HRMS',
    description: 'Update interview rounds',
    aliases: ['update-interview-rounds', 'update-interview-round', 'update_interview_rounds'],
  },
  {
    name: 'delete-interview-rounds',
    module: 'interview_rounds',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete interview rounds',
    aliases: ['delete-interview-rounds', 'delete-interview-round', 'delete_interview_rounds'],
  },
  {
    name: 'sidebar-interview-rounds',
    module: 'interview_rounds',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show interview rounds in navigation',
    aliases: ['sidebar-interview-rounds', 'sidebar-interview-round', 'sidebar_interview_rounds'],
  },

  {
    name: 'create-recruitment',
    module: 'recruitment',
    action: 'create',
    application: 'HRMS',
    description: 'Post job openings and applicants',
    aliases: ['create-recruitment', 'create_recruitment'],
  },
  {
    name: 'read-recruitment',
    module: 'recruitment',
    action: 'read',
    application: 'HRMS',
    description: 'View recruitment pipelines',
    aliases: ['read-recruitment', 'read_recruitment'],
  },
  {
    name: 'update-recruitment',
    module: 'recruitment',
    action: 'update',
    application: 'HRMS',
    description: 'Update candidate stages',
    aliases: ['update-recruitment', 'update_recruitment'],
  },
  {
    name: 'delete-recruitment',
    module: 'recruitment',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete candidate records',
    aliases: ['delete-recruitment', 'delete_recruitment'],
  },
  {
    name: 'sidebar-recruitment',
    module: 'recruitment',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show recruitment in navigation',
    aliases: ['sidebar-recruitment', 'sidebar_recruitment'],
  },

  {
    name: 'create-onboarding',
    module: 'onboarding',
    action: 'create',
    application: 'HRMS',
    description: 'Initiate employee onboarding',
    aliases: ['create-onboarding', 'create_onboarding'],
  },
  {
    name: 'read-onboarding',
    module: 'onboarding',
    action: 'read',
    application: 'HRMS',
    description: 'View employee onboarding checklists',
    aliases: ['read-onboarding', 'read_onboarding'],
  },
  {
    name: 'update-onboarding',
    module: 'onboarding',
    action: 'update',
    application: 'HRMS',
    description: 'Update employee onboarding tasks',
    aliases: ['update-onboarding', 'update_onboarding'],
  },
  {
    name: 'delete-onboarding',
    module: 'onboarding',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete onboarding instances',
    aliases: ['delete-onboarding', 'delete_onboarding'],
  },
  {
    name: 'sidebar-onboarding',
    module: 'onboarding',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show onboarding in navigation',
    aliases: ['sidebar-onboarding', 'sidebar_onboarding'],
  },

  {
    name: 'create-exit',
    module: 'exit',
    action: 'create',
    application: 'HRMS',
    description: 'Initiate employee exit process',
    aliases: ['create-exit', 'create_exit'],
  },
  {
    name: 'read-exit',
    module: 'exit',
    action: 'read',
    application: 'HRMS',
    description: 'View employee exit requests',
    aliases: ['read-exit', 'read_exit'],
  },
  {
    name: 'update-exit',
    module: 'exit',
    action: 'update',
    application: 'HRMS',
    description: 'Process clearances and exit interviews',
    aliases: ['update-exit', 'update_exit'],
  },
  {
    name: 'delete-exit',
    module: 'exit',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete exit records',
    aliases: ['delete-exit', 'delete_exit'],
  },
  {
    name: 'sidebar-exit',
    module: 'exit',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show exit process in navigation',
    aliases: ['sidebar-exit', 'sidebar_exit'],
  },

  {
    name: 'create-attendance',
    module: 'attendance',
    action: 'create',
    application: 'HRMS',
    description: 'Record manual attendance / punch',
    aliases: ['create-attendance', 'create_attendance'],
  },
  {
    name: 'read-attendance',
    module: 'attendance',
    action: 'read',
    application: 'HRMS',
    description: 'View attendance logs and timesheets',
    aliases: ['read-attendance', 'read_attendance'],
  },
  {
    name: 'update-attendance',
    module: 'attendance',
    action: 'update',
    application: 'HRMS',
    description: 'Regularize attendance punches',
    aliases: ['update-attendance', 'update_attendance'],
  },
  {
    name: 'delete-attendance',
    module: 'attendance',
    action: 'delete',
    application: 'HRMS',
    description: 'Remove invalid attendance logs',
    aliases: ['delete-attendance', 'delete_attendance'],
  },

  {
    name: 'create-leave',
    module: 'leave',
    action: 'create',
    application: 'HRMS',
    description: 'Apply for leaves',
    aliases: ['create-leave', 'create-leaves', 'create_leave', 'create_leaves'],
  },
  {
    name: 'read-leave',
    module: 'leave',
    action: 'read',
    application: 'HRMS',
    description: 'View applied leaves',
    aliases: ['read-leave', 'read-leaves', 'read_leave', 'read_leaves'],
  },
  {
    name: 'update-leave',
    module: 'leave',
    action: 'update',
    application: 'HRMS',
    description: 'Modify leave applications',
    aliases: ['update-leave', 'update-leaves', 'update_leave', 'update_leaves'],
  },
  {
    name: 'delete-leave',
    module: 'leave',
    action: 'delete',
    application: 'HRMS',
    description: 'Cancel leave applications',
    aliases: ['delete-leave', 'delete-leaves', 'delete_leave', 'delete_leaves'],
  },
  {
    name: 'approve-leave',
    module: 'leave',
    action: 'approve',
    application: 'HRMS',
    description: 'Approve or reject employee leave requests',
    aliases: ['approve-leave', 'approve-leaves', 'approve_leave', 'approve_leaves'],
  },
  {
    name: 'sidebar-attendance-leave',
    module: 'attendance',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show attendance and leave in navigation',
    aliases: ['sidebar-attendance-leave', 'sidebar_attendance_leave'],
  },

  {
    name: 'create-performance',
    module: 'performance',
    action: 'create',
    application: 'HRMS',
    description: 'Create performance reviews and goals',
    aliases: ['create-performance', 'create_performance'],
  },
  {
    name: 'read-performance',
    module: 'performance',
    action: 'read',
    application: 'HRMS',
    description: 'View performance ratings and feedback',
    aliases: ['read-performance', 'read_performance'],
  },
  {
    name: 'update-performance',
    module: 'performance',
    action: 'update',
    application: 'HRMS',
    description: 'Submit appraisals and reviews',
    aliases: ['update-performance', 'update_performance'],
  },
  {
    name: 'delete-performance',
    module: 'performance',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete performance reviews',
    aliases: ['delete-performance', 'delete_performance'],
  },
  {
    name: 'sidebar-performance-training',
    module: 'performance',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show performance & training in navigation',
    aliases: ['sidebar-performance-training', 'sidebar_performance_training'],
  },

  {
    name: 'create-payroll',
    module: 'payroll',
    action: 'create',
    application: 'HRMS',
    description: 'Create salary structures and process monthly payroll',
    aliases: ['create-payroll', 'create_payroll'],
  },
  {
    name: 'read-payroll',
    module: 'payroll',
    action: 'read',
    application: 'HRMS',
    description: 'View payslips and payroll register',
    aliases: ['read-payroll', 'read_payroll'],
  },
  {
    name: 'update-payroll',
    module: 'payroll',
    action: 'update',
    application: 'HRMS',
    description: 'Adjust salary structures and payroll entries',
    aliases: ['update-payroll', 'update_payroll'],
  },
  {
    name: 'delete-payroll',
    module: 'payroll',
    action: 'delete',
    application: 'HRMS',
    description: 'Delete or void payroll runs',
    aliases: ['delete-payroll', 'delete_payroll'],
  },
  {
    name: 'sidebar-salary-structures',
    module: 'payroll',
    action: 'sidebar',
    application: 'HRMS',
    description: 'Show salary structures in navigation',
    aliases: ['sidebar-salary-structures', 'sidebar_salary_structures'],
  },
  {
    name: 'sidebar-hra-tax',
    module: 'payroll',
    action: 'sidebar_hra',
    application: 'HRMS',
    description: 'Show HRA & tax exemption in navigation',
    aliases: ['sidebar-hra-tax', 'sidebar_hra_tax'],
  },
  {
    name: 'sidebar-loans',
    module: 'payroll',
    action: 'sidebar_loans',
    application: 'HRMS',
    description: 'Show loans & advances in navigation',
    aliases: ['sidebar-loans', 'sidebar_loans'],
  },
  {
    name: 'sidebar-monthly-run',
    module: 'payroll',
    action: 'sidebar_run',
    application: 'HRMS',
    description: 'Show monthly payroll run in navigation',
    aliases: ['sidebar-monthly-run', 'sidebar_monthly_run'],
  },
];

async function runCleanup() {
  console.log('🚀 Starting standard single-permission database cleanup & consolidation...');

  // 1. Fetch all current permissions and their assigned roles
  const existingPerms = await prisma.permission.findMany({
    include: {
      roles: true,
    },
  });
  console.log(`Found ${existingPerms.length} total permissions in database before cleanup.`);

  // Build a map of role assignments per alias
  // roleId -> Set<canonicalPermName>
  const roleGrantedCanonical = new Map<string, Set<string>>();

  for (const p of existingPerms) {
    const rawName = (p.name || '').toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-');
    const rawCode = `${p.module}:${p.action}`.toLowerCase();

    // Match with canonical
    const matchedCanonical = CANONICAL_PERMISSIONS.find((c) => {
      const cName = c.name.toLowerCase();
      if (rawName === cName) return true;
      if (c.aliases.some((a) => a.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-') === rawName)) return true;
      if (p.module.toLowerCase() === c.module.toLowerCase() && p.action.toLowerCase() === c.action.toLowerCase()) return true;
      return false;
    });

    if (matchedCanonical) {
      for (const rp of p.roles) {
        if (!roleGrantedCanonical.has(rp.roleId)) {
          roleGrantedCanonical.set(rp.roleId, new Set());
        }
        roleGrantedCanonical.get(rp.roleId)!.add(matchedCanonical.name);
      }
    }
  }

  // 2. Clear out all RolePermission mappings and Permission table entirely to ensure zero duplicate / trash records remain
  console.log('🧹 Clearing legacy RolePermissions and Permissions...');
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});

  // 3. Create exactly 1 clean canonical record for each canonical permission
  console.log(`✨ Creating exactly ${CANONICAL_PERMISSIONS.length} single standard permissions...`);
  const createdPermMap = new Map<string, string>(); // canonicalName -> newPermissionId

  for (const c of CANONICAL_PERMISSIONS) {
    const perm = await prisma.permission.create({
      data: {
        name: c.name,
        module: c.module.toLowerCase(),
        action: c.action.toLowerCase(),
        application: c.application.toUpperCase(),
        description: c.description,
      },
    });
    createdPermMap.set(c.name, perm.id);
  }
  console.log(`✅ Seeded ${createdPermMap.size} clean single permissions.`);

  // 4. Restore role permissions with clean IDs
  console.log('🔄 Restoring role-permission associations...');
  const allRoles = await prisma.role.findMany();
  const allNewPermIds = Array.from(createdPermMap.values());

  for (const role of allRoles) {
    const roleName = (role.name || '').toUpperCase();

    if (roleName === 'SUPER_ADMIN' || roleName === 'ADMIN') {
      // Super Admin and Admin get ALL permissions
      for (const permId of allNewPermIds) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
      console.log(`  └─ Role ${role.name}: Granted all ${allNewPermIds.length} permissions`);
    } else {
      // Other roles: Restore their previously held canonical permissions
      const grantedNames = roleGrantedCanonical.get(role.id) || new Set();
      let grantedCount = 0;

      for (const permName of grantedNames) {
        const permId = createdPermMap.get(permName);
        if (permId) {
          await prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId: permId,
            },
          });
          grantedCount++;
        }
      }
      console.log(`  └─ Role ${role.displayName || role.name}: Restored ${grantedCount} permissions`);
    }
  }

  console.log('🎉 Clean-up and single-permission standardization finished successfully!');
}

runCleanup()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
