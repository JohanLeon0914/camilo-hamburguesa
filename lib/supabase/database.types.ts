export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          slug: string;
          description: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          completed_orders_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          recipient_name: string;
          phone: string;
          address: string;
          address_details: string | null;
          last_used_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["addresses"]["Row"]> & {
          user_id: string;
          label: string;
          recipient_name: string;
          phone: string;
          address: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          delivery_address: string;
          delivery_details: string | null;
          status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
          payment_status: "pending" | "paid" | "failed" | "expired";
          mercado_pago_preference_id: string | null;
          mercado_pago_payment_id: string | null;
          paid_at: string | null;
          subtotal: number;
          discount_percentage: number;
          discount_amount: number;
          total: number;
          loyalty_discount_applied: boolean;
          created_at: string;
          updated_at: string;
          delivered_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
          line_total: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      admins: {
        Row: { id: string; user_id: string | null; email: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["admins"]["Row"]> & { email: string };
        Update: Partial<Database["public"]["Tables"]["admins"]["Row"]>;
        Relationships: [];
      };
      loyalty_redemptions: {
        Row: { id: string; user_id: string; order_id: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["loyalty_redemptions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["loyalty_redemptions"]["Row"]>;
        Relationships: [];
      };
    };
    Functions: {
      create_order_secure: {
        Args: {
          payload_items: Json;
          payload_address_id: string | null;
          payload_address: Json | null;
        };
        Returns: { order_id: string; subtotal: number; discount_amount: number; total: number }[];
      };
      is_admin: {
        Args: { check_user_id?: string };
        Returns: boolean;
      };
    };
    Views: Record<string, never>;
    Enums: {
      order_status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
    };
    CompositeTypes: Record<string, never>;
  };
};
