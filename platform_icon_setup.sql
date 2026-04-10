
-- Ajout de la colonne pour l'icône de la plateforme
ALTER TABLE public.mz_home_config ADD COLUMN IF NOT EXISTS platform_icon_url TEXT;

-- S'assurer que les politiques RLS permettent l'accès
-- (Déjà fait dans schema_fix.sql mais on sécurise)
DROP POLICY IF EXISTS "Lecture publique" ON public.mz_home_config;
CREATE POLICY "Lecture publique" ON public.mz_home_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access" ON public.mz_home_config;
CREATE POLICY "Admin full access" ON public.mz_home_config FOR ALL USING (true);

-- Rafraîchissement du cache
NOTIFY pgrst, 'reload schema';
