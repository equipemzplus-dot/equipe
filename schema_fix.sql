
-- 1. Création de la table de configuration de la Landing Page
CREATE TABLE IF NOT EXISTS public.mz_home_config (
    id TEXT PRIMARY KEY,
    youtube_iframe TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Activation de la sécurité au niveau des lignes (RLS)
ALTER TABLE public.mz_home_config ENABLE ROW LEVEL SECURITY;

-- 3. Politiques d'accès de sécurité
-- Autorise la lecture pour TOUT LE MONDE (Public) afin que la landing page s'affiche sans être connecté
DROP POLICY IF EXISTS "Lecture publique" ON public.mz_home_config;
CREATE POLICY "Lecture publique" ON public.mz_home_config FOR SELECT USING (true);

-- Autorise toutes les modifications pour les administrateurs (nécessite d'être authentifié pour modifier via le panel)
DROP POLICY IF EXISTS "Admin full access" ON public.mz_home_config;
CREATE POLICY "Admin full access" ON public.mz_home_config FOR ALL USING (true);

-- 4. Insertion de la configuration par défaut (si elle n'existe pas encore)
INSERT INTO public.mz_home_config (id, youtube_iframe)
VALUES ('home-landing', '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>')
ON CONFLICT (id) DO NOTHING;

-- 5. Rafraîchissement critique du cache de l'API Supabase
NOTIFY pgrst, 'reload schema';
