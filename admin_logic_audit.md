# OmniMart Admin Logic Audit

This document summarizes the administrative capabilities and identifies potential security or functional gaps.

## 1. Role-Based Access Control (RBAC)
The system uses an `authMiddleware` that checks the `role` field in the user's JWT.

| Component | Admin Permissions | Seller Permissions | Customer Permissions |
|-----------|-------------------|-------------------|----------------------|
| Dashboard | View all platform stats | View shop-only stats | No access |
| Users | List, Lock/Unlock, Change Role | No access | No access |
| Products | View all, Add, Edit any, Delete any | View/Edit/Delete own products | View only |
| Shops | View all, Lock/Unlock Owner | Manage own shop | View only |
| Orders | View all, Update Status | View/Update shop orders | View own orders |
| Categories | Manage (Add/Edit) | View only | View only |
| Vouchers | Manage system-wide vouchers | No access (TBD) | Use vouchers |

## 2. Recent Implementations (Audit Results)
- **Category Management**: [NEW] Admin can now create categories in the UI.
- **Shop Oversight**: [NEW] Admin can see all shops, their balances, and owner info. Can lock shops by locking owner account.
- **Order Details**: [FIXED] Admin can now see full order items and update status (Pending -> Shipped -> Completed).
- **Voucher Management**: [FIXED] Backend routes added; Admin can create/delete system vouchers.

## 3. Remaining Gaps & Missing Features
1. **Withdrawal System**: Sellers need a way to request payout from their balance.
2. **Product Approval**: Currently all products are live instantly. An "Unapproved" state would be safer.
3. **Audit Logs**: No persistent record of admin actions (who locked which user/shop).
4. **Platform Fees**: No global setting for commission percentage (currently logic depends on manual DB values).

## 4. Verification & Testing Status
- [x] Test that a Seller CANNOT access `/admin/users` (Verified by Middleware).
- [x] Test that an Admin CAN delete a Seller's product (Verified).
- [x] Test that a Seller CANNOT edit another Seller's product (Verified by `admin.js` ownership check).
- [x] Verify that Platform Revenue is only visible to Admin (Verified in Dashboard logic).

---
*Updated on: 2026-05-11*
