import type { Database } from "@/lib/supabase/database.types";

export type OrderWithItems = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: Database["public"]["Tables"]["order_items"]["Row"][];
};
