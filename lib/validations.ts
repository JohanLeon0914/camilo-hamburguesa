import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(20)
});

export const addressSchema = z.object({
  label: z.string().trim().min(1, "El nombre de la dirección es obligatorio").max(40),
  recipientName: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Ingresa un celular válido"),
  address: z.string().trim().min(5, "La dirección es obligatoria").max(180),
  addressDetails: z.string().trim().max(240).optional().default("")
});

export const createOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  addressId: z.string().uuid().optional(),
  address: addressSchema.optional()
}).refine((value) => value.addressId || value.address, {
  message: "Selecciona o crea una dirección"
});
