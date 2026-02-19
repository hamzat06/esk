# Authorization & Permissions System

This document explains the comprehensive authorization and permissions system implemented in the application.

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Permission Types](#permission-types)
4. [Security Layers](#security-layers)
5. [Implementation Guide](#implementation-guide)
6. [Testing](#testing)

## Overview

The application uses a **multi-layered security approach** with three levels of protection:

1. **Middleware** - Route-level protection (Next.js middleware)
2. **Server-Side Checks** - Page and API route protection
3. **Row Level Security (RLS)** - Database-level protection (Supabase)

This ensures that even if one layer is bypassed, the others provide fallback security.

## User Roles

### Customer (`role: 'customer'`)
- Default role for all new users
- Can view their own orders, profile, and catering bookings
- Can place orders and make catering requests
- **Permissions field**: `null` (not used for customers)

### Admin (`role: 'admin'`)
There are two types of admins:

#### 1. Super Admin
- **Permissions**: `null`
- Has access to **ALL** admin features
- Can manage other admins
- Can access `/admin/admins` page
- **Cannot be restricted** - always has full access

#### 2. Regular Admin
- **Permissions**: `['products', 'orders', ...]` (array)
- Has access **only** to routes matching their permissions
- Cannot manage other admins
- Cannot access `/admin/admins` page
- Restricted based on permission array

## Permission Types

The following permissions can be assigned to regular admins:

| Permission | Description | Admin Pages Accessible |
|------------|-------------|------------------------|
| `products` | Manage products | `/admin/products` |
| `orders` | Manage orders | `/admin/orders` |
| `customers` | Manage customers | `/admin/customers` |
| `categories` | Manage categories | `/admin/categories` |
| `catering` | Manage catering bookings | `/admin/catering` |
| `settings` | Manage shop settings | `/admin/settings` |
| `analytics` | View analytics | `/admin/analytics` |
| `admins` | Manage admins (super admin only) | `/admin/admins` |

**Note**: The dashboard (`/admin`) is accessible to all admins, but shows stats based on their permissions.

## Security Layers

### Layer 1: Middleware (`/middleware.ts`)

- Runs on **every request** before the page loads
- Checks if user is authenticated
- Validates admin role for `/admin/*` routes
- Checks specific permissions for sub-routes
- Redirects unauthorized users

**Example:**
```typescript
// /admin/products requires 'products' permission
if (pathname === '/admin/products' && !hasPermission('products')) {
  redirect('/admin?error=no_permission');
}
```

### Layer 2: Server-Side Checks

#### A. Page Components (`app/(admin)/*/page.tsx`)

Every admin page uses authorization utilities:

```typescript
import { requirePermission } from "@/lib/auth/permissions";

export default async function ProductsPage() {
  // Require products permission - redirects if not authorized
  await requirePermission("products");

  // Rest of the page logic...
}
```

#### B. Server Actions

Server actions (form submissions, updates) also check permissions:

```typescript
async function updateProduct(productId: string, data: any) {
  "use server";

  // Validate permission
  await requirePermission("products");

  // Perform update...
}
```

#### C. API Routes (`app/api/*/route.ts`)

API routes use validation helpers:

```typescript
import { validateApiPermission } from "@/lib/auth/permissions";

export async function POST(request: NextRequest) {
  const { profile, supabase } = await validateApiPermission("products");

  // Profile is guaranteed to have permission
  // Rest of API logic...
}
```

### Layer 3: Row Level Security (RLS)

Database-level security using Supabase RLS policies.

**Setup:**
1. Run the SQL in `/supabase/rls-policies.sql`
2. Policies are automatically enforced on all queries

**Key Features:**
- Users can only see their own data (orders, bookings, etc.)
- Admins with specific permissions can access relevant tables
- Super admins have full database access
- Policies work even if Next.js is bypassed

**Example Policy:**
```sql
-- Only admins with 'products' permission can manage products
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL
  USING (
    public.has_permission(auth.uid(), 'products') OR
    public.is_super_admin(auth.uid())
  );
```

## Implementation Guide

### Using Authorization Utilities

The `/lib/auth/permissions.ts` file provides helper functions:

#### 1. Page-Level Authorization

```typescript
import { requirePermission, requireAdmin, requireSuperAdmin } from "@/lib/auth/permissions";

// Require any admin
await requireAdmin();

// Require specific permission
await requirePermission("products");

// Require super admin only
await requireSuperAdmin();

// Require any of multiple permissions
await requireAnyPermission(["products", "categories"]);

// Require all of multiple permissions
await requireAllPermissions(["products", "categories"]);
```

#### 2. Conditional Logic

```typescript
import { getCurrentUserWithProfile, hasPermission } from "@/lib/auth/permissions";

const profile = await getCurrentUserWithProfile();

if (hasPermission(profile, "analytics")) {
  // Show analytics data
}
```

#### 3. API Route Authorization

```typescript
import { validateApiAuth, validateApiAdmin, validateApiPermission } from "@/lib/auth/permissions";

// Require authenticated user
const { profile, supabase } = await validateApiAuth();

// Require admin (any)
const { profile, supabase } = await validateApiAdmin();

// Require specific permission
const { profile, supabase } = await validateApiPermission("orders");
```

### Adding New Permissions

1. **Update the Permission Type** in `/lib/auth/permissions.ts`:
   ```typescript
   export type Permission =
     | "products"
     | "orders"
     | "your_new_permission";  // Add here
   ```

2. **Add to Middleware** in `/middleware.ts`:
   ```typescript
   const ROUTE_PERMISSIONS: Record<string, string> = {
     "/admin/your-route": "your_new_permission",  // Add here
   };
   ```

3. **Add to Sidebar** in `/components/admin/AdminSidebar.tsx`:
   ```typescript
   {
     name: "Your Feature",
     href: "/admin/your-route",
     icon: YourIcon,
     permission: "your_new_permission",  // Add here
   }
   ```

4. **Protect the Page**:
   ```typescript
   import { requirePermission } from "@/lib/auth/permissions";

   export default async function YourPage() {
     await requirePermission("your_new_permission");
     // ...
   }
   ```

5. **Add RLS Policy** in `/supabase/rls-policies.sql`:
   ```sql
   CREATE POLICY "your_table_admin_all" ON public.your_table
     FOR ALL
     USING (
       public.has_permission(auth.uid(), 'your_new_permission') OR
       public.is_super_admin(auth.uid())
     );
   ```

## Testing

### Manual Testing

1. **Create Test Users:**
   - Super Admin: permissions = `null`
   - Products Admin: permissions = `["products"]`
   - Multi-Permission Admin: permissions = `["products", "orders"]`
   - Customer: role = `customer`

2. **Test Access:**
   - Try accessing different admin pages
   - Verify redirects for unauthorized access
   - Check that stats on dashboard respect permissions
   - Verify sidebar only shows permitted items

3. **Test Server Actions:**
   - Try updating data from the UI
   - Check that actions fail for users without permission
   - Verify error messages are appropriate

### Database Testing

Test RLS policies directly in Supabase SQL Editor:

```sql
-- Set authenticated role
SET ROLE authenticated;

-- Set user ID (replace with actual user UUID)
SET request.jwt.claims.sub = 'user-uuid-here';

-- Try selecting data
SELECT * FROM products;  -- Should respect RLS policy

-- Reset
RESET ROLE;
RESET request.jwt.claims.sub;
```

## Security Best Practices

1. **Always use server-side checks** - Never rely on middleware alone
2. **Apply RLS policies** - Database-level security is critical
3. **Validate in server actions** - Each action should check permissions
4. **Never expose super admin status** - Use helper functions
5. **Log permission failures** - Monitor for potential attacks
6. **Use least privilege** - Grant minimum necessary permissions
7. **Regular audits** - Review admin permissions periodically

## Common Issues

### Issue: "Super admins should have all permissions"
**Solution**: Ensure permissions is `null`, not an empty array `[]`

### Issue: "Admin can't access page despite having permission"
**Solution**: Check all three layers - middleware, server-side check, and RLS

### Issue: "Users can bypass authorization"
**Solution**: Ensure RLS is enabled on all tables

### Issue: "Getting 'unauthorized' on API routes"
**Solution**: Make sure you're using `validateApiPermission()` correctly

## Summary

This authorization system provides:

- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Fine-Grained Permissions**
- ✅ **Multi-Layer Security**
- ✅ **Super Admin Override**
- ✅ **Database-Level Protection**
- ✅ **Type-Safe Utilities**

All admin routes and sensitive operations are now properly protected with authorization checks at multiple levels.
