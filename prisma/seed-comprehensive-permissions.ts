import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface PermissionDef {
  name: string;
  module: string;
  action: string;
  application: string;
  description: string;
}

const ALL_PERMISSIONS: PermissionDef[] = [
  // GLOBAL
  { name: 'manage-all', module: 'all', action: 'manage', application: 'GLOBAL', description: 'Full system super administrator access' },

  // DASHBOARD
  { name: 'read-dashboard', module: 'dashboard', action: 'read', application: 'GATEPASS', description: 'View gatepass dashboard overview' },
  { name: 'sidebar-dashboard', module: 'dashboard', action: 'sidebar', application: 'GATEPASS', description: 'Show dashboard link in navigation' },

  // SECURITY & ACCESS
  { name: 'create-user', module: 'users', action: 'create', application: 'GATEPASS', description: 'Create new system users' },
  { name: 'read-user', module: 'users', action: 'read', application: 'GATEPASS', description: 'View system users' },
  { name: 'update-user', module: 'users', action: 'update', application: 'GATEPASS', description: 'Update system users' },
  { name: 'delete-user', module: 'users', action: 'delete', application: 'GATEPASS', description: 'Delete system users' },
  { name: 'sidebar-users', module: 'users', action: 'sidebar', application: 'GATEPASS', description: 'Show users menu in navigation' },

  { name: 'create-role', module: 'roles', action: 'create', application: 'GATEPASS', description: 'Create security roles' },
  { name: 'read-role', module: 'roles', action: 'read', application: 'GATEPASS', description: 'View security roles' },
  { name: 'update-role', module: 'roles', action: 'update', application: 'GATEPASS', description: 'Update security roles and permission mappings' },
  { name: 'delete-role', module: 'roles', action: 'delete', application: 'GATEPASS', description: 'Delete security roles' },
  { name: 'sidebar-roles', module: 'roles', action: 'sidebar', application: 'GATEPASS', description: 'Show roles & permissions in navigation' },

  { name: 'create-permission', module: 'permissions', action: 'create', application: 'GATEPASS', description: 'Create system permission codes' },
  { name: 'read-permission', module: 'permissions', action: 'read', application: 'GATEPASS', description: 'View system permissions' },
  { name: 'update-permission', module: 'permissions', action: 'update', application: 'GATEPASS', description: 'Update system permissions' },
  { name: 'delete-permission', module: 'permissions', action: 'delete', application: 'GATEPASS', description: 'Delete system permissions' },

  // FINANCE & ACCOUNTS
  { name: 'create-account', module: 'accounts', action: 'create', application: 'GATEPASS', description: 'Create chart of accounts' },
  { name: 'read-account', module: 'accounts', action: 'read', application: 'GATEPASS', description: 'View chart of accounts' },
  { name: 'update-account', module: 'accounts', action: 'update', application: 'GATEPASS', description: 'Update chart of accounts' },
  { name: 'delete-account', module: 'accounts', action: 'delete', application: 'GATEPASS', description: 'Delete chart of accounts' },
  { name: 'sidebar-accounts', module: 'accounts', action: 'sidebar', application: 'GATEPASS', description: 'Show accounts in navigation' },

  { name: 'create-voucher', module: 'vouchers', action: 'create', application: 'GATEPASS', description: 'Create accounting vouchers' },
  { name: 'read-voucher', module: 'vouchers', action: 'read', application: 'GATEPASS', description: 'View accounting vouchers' },
  { name: 'update-voucher', module: 'vouchers', action: 'update', application: 'GATEPASS', description: 'Update accounting vouchers' },
  { name: 'delete-voucher', module: 'vouchers', action: 'delete', application: 'GATEPASS', description: 'Delete accounting vouchers' },
  { name: 'approve-voucher', module: 'vouchers', action: 'approve', application: 'GATEPASS', description: 'Post and approve accounting vouchers' },
  { name: 'sidebar-vouchers', module: 'vouchers', action: 'sidebar', application: 'GATEPASS', description: 'Show vouchers in navigation' },

  { name: 'read-customer-ledger', module: 'customer_ledger', action: 'read', application: 'GATEPASS', description: 'View customer accounts receivable ledger' },
  { name: 'export-customer-ledger', module: 'customer_ledger', action: 'export', application: 'GATEPASS', description: 'Export customer AR ledger statement' },
  { name: 'sidebar-customer-ledger', module: 'customer_ledger', action: 'sidebar', application: 'GATEPASS', description: 'Show customer ledger in navigation' },

  { name: 'read-supplier-ledger', module: 'supplier_ledger', action: 'read', application: 'GATEPASS', description: 'View supplier accounts payable ledger' },
  { name: 'export-supplier-ledger', module: 'supplier_ledger', action: 'export', application: 'GATEPASS', description: 'Export supplier AP ledger statement' },
  { name: 'sidebar-supplier-ledger', module: 'supplier_ledger', action: 'sidebar', application: 'GATEPASS', description: 'Show supplier ledger in navigation' },

  { name: 'read-financial-reports', module: 'financial_reports', action: 'read', application: 'GATEPASS', description: 'View financial statements and reports' },
  { name: 'export-financial-reports', module: 'financial_reports', action: 'export', application: 'GATEPASS', description: 'Export balance sheet, P&L, trial balance' },
  { name: 'sidebar-financial-reports', module: 'financial_reports', action: 'sidebar', application: 'GATEPASS', description: 'Show financial statements in navigation' },

  // MASTERS - PRODUCTS & ENTITIES
  { name: 'create-product', module: 'products', action: 'create', application: 'GATEPASS', description: 'Create product masters' },
  { name: 'read-product', module: 'products', action: 'read', application: 'GATEPASS', description: 'View product master catalogue' },
  { name: 'update-product', module: 'products', action: 'update', application: 'GATEPASS', description: 'Update product details and specs' },
  { name: 'delete-product', module: 'products', action: 'delete', application: 'GATEPASS', description: 'Delete product masters' },
  { name: 'sidebar-products', module: 'products', action: 'sidebar', application: 'GATEPASS', description: 'Show product master in navigation' },

  { name: 'create-product-category', module: 'product_categories', action: 'create', application: 'GATEPASS', description: 'Create product categories' },
  { name: 'read-product-category', module: 'product_categories', action: 'read', application: 'GATEPASS', description: 'View product categories' },
  { name: 'update-product-category', module: 'product_categories', action: 'update', application: 'GATEPASS', description: 'Update product categories' },
  { name: 'delete-product-category', module: 'product_categories', action: 'delete', application: 'GATEPASS', description: 'Delete product categories' },
  { name: 'sidebar-product-categories', module: 'product_categories', action: 'sidebar', application: 'GATEPASS', description: 'Show product categories in navigation' },

  { name: 'create-product-sub-category', module: 'product_sub_categories', action: 'create', application: 'GATEPASS', description: 'Create product sub-categories' },
  { name: 'read-product-sub-category', module: 'product_sub_categories', action: 'read', application: 'GATEPASS', description: 'View product sub-categories' },
  { name: 'update-product-sub-category', module: 'product_sub_categories', action: 'update', application: 'GATEPASS', description: 'Update product sub-categories' },
  { name: 'delete-product-sub-category', module: 'product_sub_categories', action: 'delete', application: 'GATEPASS', description: 'Delete product sub-categories' },
  { name: 'sidebar-product-sub-categories', module: 'product_sub_categories', action: 'sidebar', application: 'GATEPASS', description: 'Show product sub-categories in navigation' },

  { name: 'create-uom', module: 'uoms', action: 'create', application: 'GATEPASS', description: 'Create units of measurement' },
  { name: 'read-uom', module: 'uoms', action: 'read', application: 'GATEPASS', description: 'View units of measurement' },
  { name: 'update-uom', module: 'uoms', action: 'update', application: 'GATEPASS', description: 'Update units of measurement' },
  { name: 'delete-uom', module: 'uoms', action: 'delete', application: 'GATEPASS', description: 'Delete units of measurement' },
  { name: 'sidebar-uoms', module: 'uoms', action: 'sidebar', application: 'GATEPASS', description: 'Show UOM master in navigation' },

  { name: 'create-packing-material', module: 'packing_materials', action: 'create', application: 'GATEPASS', description: 'Create packing materials' },
  { name: 'read-packing-material', module: 'packing_materials', action: 'read', application: 'GATEPASS', description: 'View packing materials catalogue' },
  { name: 'update-packing-material', module: 'packing_materials', action: 'update', application: 'GATEPASS', description: 'Update packing materials' },
  { name: 'delete-packing-material', module: 'packing_materials', action: 'delete', application: 'GATEPASS', description: 'Delete packing materials' },
  { name: 'sidebar-packing-materials', module: 'packing_materials', action: 'sidebar', application: 'GATEPASS', description: 'Show packing materials in navigation' },

  { name: 'create-qc-specification', module: 'qc_specifications', action: 'create', application: 'GATEPASS', description: 'Create QC specifications' },
  { name: 'read-qc-specification', module: 'qc_specifications', action: 'read', application: 'GATEPASS', description: 'View QC specifications' },
  { name: 'update-qc-specification', module: 'qc_specifications', action: 'update', application: 'GATEPASS', description: 'Update QC specifications' },
  { name: 'delete-qc-specification', module: 'qc_specifications', action: 'delete', application: 'GATEPASS', description: 'Delete QC specifications' },
  { name: 'sidebar-qc-specifications', module: 'qc_specifications', action: 'sidebar', application: 'GATEPASS', description: 'Show QC specifications in navigation' },

  { name: 'create-storage-location', module: 'storage_locations', action: 'create', application: 'GATEPASS', description: 'Create warehouse storage locations' },
  { name: 'read-storage-location', module: 'storage_locations', action: 'read', application: 'GATEPASS', description: 'View warehouse storage locations' },
  { name: 'update-storage-location', module: 'storage_locations', action: 'update', application: 'GATEPASS', description: 'Update storage locations' },
  { name: 'delete-storage-location', module: 'storage_locations', action: 'delete', application: 'GATEPASS', description: 'Delete storage locations' },
  { name: 'sidebar-storage-locations', module: 'storage_locations', action: 'sidebar', application: 'GATEPASS', description: 'Show storage locations in navigation' },

  { name: 'create-pass-category', module: 'pass_categories', action: 'create', application: 'GATEPASS', description: 'Create pass categories' },
  { name: 'read-pass-category', module: 'pass_categories', action: 'read', application: 'GATEPASS', description: 'View pass categories' },
  { name: 'update-pass-category', module: 'pass_categories', action: 'update', application: 'GATEPASS', description: 'Update pass categories' },
  { name: 'delete-pass-category', module: 'pass_categories', action: 'delete', application: 'GATEPASS', description: 'Delete pass categories' },
  { name: 'sidebar-pass-categories', module: 'pass_categories', action: 'sidebar', application: 'GATEPASS', description: 'Show pass categories in navigation' },

  { name: 'create-bank', module: 'banks', action: 'create', application: 'GATEPASS', description: 'Create bank masters' },
  { name: 'read-bank', module: 'banks', action: 'read', application: 'GATEPASS', description: 'View bank masters' },
  { name: 'update-bank', module: 'banks', action: 'update', application: 'GATEPASS', description: 'Update bank masters' },
  { name: 'delete-bank', module: 'banks', action: 'delete', application: 'GATEPASS', description: 'Delete bank masters' },
  { name: 'sidebar-banks', module: 'banks', action: 'sidebar', application: 'GATEPASS', description: 'Show bank master in navigation' },

  { name: 'create-vendor', module: 'vendors', action: 'create', application: 'GATEPASS', description: 'Create vendor master records' },
  { name: 'read-vendor', module: 'vendors', action: 'read', application: 'GATEPASS', description: 'View vendor master records' },
  { name: 'update-vendor', module: 'vendors', action: 'update', application: 'GATEPASS', description: 'Update vendor master records' },
  { name: 'delete-vendor', module: 'vendors', action: 'delete', application: 'GATEPASS', description: 'Delete vendor master records' },
  { name: 'sidebar-vendors', module: 'vendors', action: 'sidebar', application: 'GATEPASS', description: 'Show vendor master in navigation' },

  { name: 'create-customer', module: 'customers', action: 'create', application: 'GATEPASS', description: 'Create customer records' },
  { name: 'read-customer', module: 'customers', action: 'read', application: 'GATEPASS', description: 'View customer records' },
  { name: 'update-customer', module: 'customers', action: 'update', application: 'GATEPASS', description: 'Update customer records' },
  { name: 'delete-customer', module: 'customers', action: 'delete', application: 'GATEPASS', description: 'Delete customer records' },
  { name: 'sidebar-customers', module: 'customers', action: 'sidebar', application: 'GATEPASS', description: 'Show customer master in navigation' },

  { name: 'create-supplier', module: 'suppliers', action: 'create', application: 'GATEPASS', description: 'Create supplier records' },
  { name: 'read-supplier', module: 'suppliers', action: 'read', application: 'GATEPASS', description: 'View supplier records' },
  { name: 'update-supplier', module: 'suppliers', action: 'update', application: 'GATEPASS', description: 'Update supplier records' },
  { name: 'delete-supplier', module: 'suppliers', action: 'delete', application: 'GATEPASS', description: 'Delete supplier records' },
  { name: 'sidebar-suppliers', module: 'suppliers', action: 'sidebar', application: 'GATEPASS', description: 'Show supplier master in navigation' },

  // GATEPASS CORE
  { name: 'create-gatepass', module: 'gatepass', action: 'create', application: 'GATEPASS', description: 'Create new gate passes' },
  { name: 'read-gatepass', module: 'gatepass', action: 'read', application: 'GATEPASS', description: 'View gate pass logs' },
  { name: 'update-gatepass', module: 'gatepass', action: 'update', application: 'GATEPASS', description: 'Update and edit gate pass entries' },
  { name: 'delete-gatepass', module: 'gatepass', action: 'delete', application: 'GATEPASS', description: 'Cancel or delete gate passes' },
  { name: 'approve-gatepass', module: 'gatepass', action: 'approve', application: 'GATEPASS', description: 'Approve gate-in and gate-out security dispatch' },
  { name: 'sidebar-gatepass', module: 'gatepass', action: 'sidebar', application: 'GATEPASS', description: 'Show gate pass in navigation' },

  // AUDIT
  { name: 'read-activity-logs', module: 'activity_logs', action: 'read', application: 'GATEPASS', description: 'View system audit trails and logs' },
  { name: 'sidebar-activity-logs', module: 'activity_logs', action: 'sidebar', application: 'GATEPASS', description: 'Show activity logs in navigation' },

  // ──────────────── HRMS PERMISSIONS ────────────────
  { name: 'create-department', module: 'departments', action: 'create', application: 'HRMS', description: 'Create departments' },
  { name: 'read-department', module: 'departments', action: 'read', application: 'HRMS', description: 'View departments' },
  { name: 'update-department', module: 'departments', action: 'update', application: 'HRMS', description: 'Update departments' },
  { name: 'delete-department', module: 'departments', action: 'delete', application: 'HRMS', description: 'Delete departments' },
  { name: 'sidebar-departments', module: 'departments', action: 'sidebar', application: 'HRMS', description: 'Show department master in navigation' },

  { name: 'create-financial-year', module: 'financial_year', action: 'create', application: 'HRMS', description: 'Create financial years' },
  { name: 'read-financial-year', module: 'financial_year', action: 'read', application: 'HRMS', description: 'View financial years' },
  { name: 'update-financial-year', module: 'financial_year', action: 'update', application: 'HRMS', description: 'Update financial years' },
  { name: 'delete-financial-year', module: 'financial_year', action: 'delete', application: 'HRMS', description: 'Delete financial years' },
  { name: 'sidebar-financial-year', module: 'financial_year', action: 'sidebar', application: 'HRMS', description: 'Show financial year master in navigation' },

  { name: 'create-training-type', module: 'training_type', action: 'create', application: 'HRMS', description: 'Create training programs' },
  { name: 'read-training-type', module: 'training_type', action: 'read', application: 'HRMS', description: 'View training programs' },
  { name: 'update-training-type', module: 'training_type', action: 'update', application: 'HRMS', description: 'Update training programs' },
  { name: 'delete-training-type', module: 'training_type', action: 'delete', application: 'HRMS', description: 'Delete training programs' },
  { name: 'sidebar-training-type', module: 'training_type', action: 'sidebar', application: 'HRMS', description: 'Show training type in navigation' },

  { name: 'create-leave-master', module: 'leave_master', action: 'create', application: 'HRMS', description: 'Create leave types and quotas' },
  { name: 'read-leave-master', module: 'leave_master', action: 'read', application: 'HRMS', description: 'View leave types' },
  { name: 'update-leave-master', module: 'leave_master', action: 'update', application: 'HRMS', description: 'Update leave policies' },
  { name: 'delete-leave-master', module: 'leave_master', action: 'delete', application: 'HRMS', description: 'Delete leave types' },
  { name: 'sidebar-leave-master', module: 'leave_master', action: 'sidebar', application: 'HRMS', description: 'Show leave master in navigation' },

  { name: 'create-interview-rounds', module: 'interview_rounds', action: 'create', application: 'HRMS', description: 'Create interview rounds' },
  { name: 'read-interview-rounds', module: 'interview_rounds', action: 'read', application: 'HRMS', description: 'View interview rounds' },
  { name: 'update-interview-rounds', module: 'interview_rounds', action: 'update', application: 'HRMS', description: 'Update interview rounds' },
  { name: 'delete-interview-rounds', module: 'interview_rounds', action: 'delete', application: 'HRMS', description: 'Delete interview rounds' },
  { name: 'sidebar-interview-rounds', module: 'interview_rounds', action: 'sidebar', application: 'HRMS', description: 'Show interview rounds in navigation' },

  { name: 'create-recruitment', module: 'recruitment', action: 'create', application: 'HRMS', description: 'Post job openings and applicants' },
  { name: 'read-recruitment', module: 'recruitment', action: 'read', application: 'HRMS', description: 'View recruitment pipelines' },
  { name: 'update-recruitment', module: 'recruitment', action: 'update', application: 'HRMS', description: 'Update candidate stages' },
  { name: 'delete-recruitment', module: 'recruitment', action: 'delete', application: 'HRMS', description: 'Delete candidate records' },
  { name: 'sidebar-recruitment', module: 'recruitment', action: 'sidebar', application: 'HRMS', description: 'Show recruitment in navigation' },

  { name: 'create-onboarding', module: 'onboarding', action: 'create', application: 'HRMS', description: 'Initiate employee onboarding' },
  { name: 'read-onboarding', module: 'onboarding', action: 'read', application: 'HRMS', description: 'View employee onboarding checklists' },
  { name: 'update-onboarding', module: 'onboarding', action: 'update', application: 'HRMS', description: 'Update employee onboarding tasks' },
  { name: 'delete-onboarding', module: 'onboarding', action: 'delete', application: 'HRMS', description: 'Delete onboarding instances' },
  { name: 'sidebar-onboarding', module: 'onboarding', action: 'sidebar', application: 'HRMS', description: 'Show onboarding in navigation' },

  { name: 'create-exit', module: 'exit', action: 'create', application: 'HRMS', description: 'Initiate employee exit process' },
  { name: 'read-exit', module: 'exit', action: 'read', application: 'HRMS', description: 'View employee exit requests' },
  { name: 'update-exit', module: 'exit', action: 'update', application: 'HRMS', description: 'Process clearances and exit interviews' },
  { name: 'delete-exit', module: 'exit', action: 'delete', application: 'HRMS', description: 'Delete exit records' },
  { name: 'sidebar-exit', module: 'exit', action: 'sidebar', application: 'HRMS', description: 'Show exit process in navigation' },

  { name: 'create-attendance', module: 'attendance', action: 'create', application: 'HRMS', description: 'Record manual attendance / punch' },
  { name: 'read-attendance', module: 'attendance', action: 'read', application: 'HRMS', description: 'View attendance logs and timesheets' },
  { name: 'update-attendance', module: 'attendance', action: 'update', application: 'HRMS', description: 'Regularize attendance punches' },
  { name: 'delete-attendance', module: 'attendance', action: 'delete', application: 'HRMS', description: 'Remove invalid attendance logs' },

  { name: 'create-leave', module: 'leave', action: 'create', application: 'HRMS', description: 'Apply for leaves' },
  { name: 'read-leave', module: 'leave', action: 'read', application: 'HRMS', description: 'View applied leaves' },
  { name: 'update-leave', module: 'leave', action: 'update', application: 'HRMS', description: 'Modify leave applications' },
  { name: 'delete-leave', module: 'leave', action: 'delete', application: 'HRMS', description: 'Cancel leave applications' },
  { name: 'approve-leave', module: 'leave', action: 'approve', application: 'HRMS', description: 'Approve or reject employee leave requests' },
  { name: 'sidebar-attendance-leave', module: 'attendance', action: 'sidebar', application: 'HRMS', description: 'Show attendance and leave in navigation' },

  { name: 'create-performance', module: 'performance', action: 'create', application: 'HRMS', description: 'Create performance reviews and goals' },
  { name: 'read-performance', module: 'performance', action: 'read', application: 'HRMS', description: 'View performance ratings and feedback' },
  { name: 'update-performance', module: 'performance', action: 'update', application: 'HRMS', description: 'Submit appraisals and reviews' },
  { name: 'delete-performance', module: 'performance', action: 'delete', application: 'HRMS', description: 'Delete performance reviews' },
  { name: 'sidebar-performance-training', module: 'performance', action: 'sidebar', application: 'HRMS', description: 'Show performance & training in navigation' },

  { name: 'create-payroll', module: 'payroll', action: 'create', application: 'HRMS', description: 'Create salary structures and process monthly payroll' },
  { name: 'read-payroll', module: 'payroll', action: 'read', application: 'HRMS', description: 'View payslips and payroll register' },
  { name: 'update-payroll', module: 'payroll', action: 'update', application: 'HRMS', description: 'Adjust salary structures and payroll entries' },
  { name: 'delete-payroll', module: 'payroll', action: 'delete', application: 'HRMS', description: 'Delete or void payroll runs' },
  { name: 'sidebar-salary-structures', module: 'payroll', action: 'sidebar', application: 'HRMS', description: 'Show salary structures in navigation' },
  { name: 'sidebar-hra-tax', module: 'payroll_hra', action: 'sidebar', application: 'HRMS', description: 'Show HRA & tax exemption in navigation' },
  { name: 'sidebar-loans', module: 'payroll_loans', action: 'sidebar', application: 'HRMS', description: 'Show loans & advances in navigation' },
  { name: 'sidebar-monthly-run', module: 'payroll_run', action: 'sidebar', application: 'HRMS', description: 'Show monthly payroll run in navigation' },
];

async function seed() {
  console.log(`Starting comprehensive permission seed (${ALL_PERMISSIONS.length} permissions)...`);

  let upsertedCount = 0;

  for (const item of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        application_module_action: {
          application: item.application.toUpperCase(),
          module: item.module.toLowerCase(),
          action: item.action.toLowerCase(),
        },
      },
      update: {
        name: item.name,
        description: item.description,
      },
      create: {
        name: item.name,
        module: item.module.toLowerCase(),
        action: item.action.toLowerCase(),
        application: item.application.toUpperCase(),
        description: item.description,
      },
    });
    upsertedCount++;
  }

  console.log(`✅ Upserted ${upsertedCount} permissions.`);

  // Link all permissions to SUPER_ADMIN & ADMIN roles
  const superAdminRole = await prisma.role.findFirst({
    where: { name: 'SUPER_ADMIN' },
  });
  const adminRole = await prisma.role.findFirst({
    where: { name: 'ADMIN' },
  });

  const allPerms = await prisma.permission.findMany();
  console.log(`Total permissions in database now: ${allPerms.length}`);

  if (superAdminRole) {
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      });
    }
    console.log(`✅ Linked all ${allPerms.length} permissions to SUPER_ADMIN role`);
  }

  if (adminRole) {
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: p.id,
        },
      });
    }
    console.log(`✅ Linked all ${allPerms.length} permissions to ADMIN role`);
  }
}

seed()
  .catch((e) => {
    console.error('Error seeding permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
