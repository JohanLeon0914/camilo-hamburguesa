insert into public.products (name, slug, description, price, image_url, is_featured)
values
  (
    'Classic Burger',
    'classic-burger',
    'Carne smash, cheddar, pepinillos, cebolla grillada y salsa Camilo.',
    22000,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
    true
  ),
  (
    'Bacon Burger',
    'bacon-burger',
    'Doble queso cheddar, tocineta crocante, cebolla caramelizada y salsa ahumada.',
    28000,
    'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    true
  ),
  (
    'Double Cheese',
    'double-cheese',
    'Doble carne, doble cheddar, pan brioche tostado y pepinillos frescos.',
    32000,
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1200&auto=format&fit=crop',
    false
  ),
  (
    'BBQ Burger',
    'bbq-burger',
    'Carne jugosa, aros de cebolla, queso, BBQ de la casa y toque mostaza.',
    30000,
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1200&auto=format&fit=crop',
    false
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  is_featured = excluded.is_featured,
  is_available = true;
