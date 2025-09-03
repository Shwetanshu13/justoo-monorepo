declare module "@justoo/db" {
  // Minimal ambient types for JS projects consuming Drizzle tables.
  // You can refine these with actual Drizzle types later if needed.
  export const adminRole: any;
  export const inventoryUserRole: any;
  export const riderStatus: any;
  export const paymentMethod: any;
  export const paymentStatus: any;
  export const orderStatus: any;
  export const itemUnit: any;

  export const justoo_admins: any;
  export const inventory_users: any;
  export const justoo_riders: any;
  export const justoo_payments: any;

  export const orders: any;
  export const order_items: any;
  export const orderItems: any;
  export const items: any;
  export const customers: any;

  // Default-like named exports
  export {};
}
