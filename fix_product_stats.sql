
-- 1. Création de la table product_stats si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.product_stats (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    clicks INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, product_id)
);

-- 2. Activation de RLS
ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;

-- 3. Politiques d'accès
-- Autoriser tout le monde à voir les stats (nécessaire pour le dashboard ambassadeur)
DROP POLICY IF EXISTS "Lecture stats personnelles" ON public.product_stats;
CREATE POLICY "Lecture stats personnelles" ON public.product_stats FOR SELECT USING (true);

-- Autoriser l'insertion/mise à jour via RPC
DROP POLICY IF EXISTS "Modif stats" ON public.product_stats;
CREATE POLICY "Modif stats" ON public.product_stats FOR ALL USING (true);

-- 4. Fonction RPC pour incrémenter les clics de manière atomique
CREATE OR REPLACE FUNCTION public.mz_increment_product_clicks(p_user_id UUID, p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.product_stats (user_id, product_id, clicks)
    VALUES (p_user_id, p_product_id, 1)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET clicks = product_stats.clicks + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Rafraîchissement du cache
NOTIFY pgrst, 'reload schema';
