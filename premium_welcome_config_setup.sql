
-- Table de configuration pour l'accueil premium (popup de bienvenue)
CREATE TABLE IF NOT EXISTS public.mz_premium_welcome_config (
    id TEXT PRIMARY KEY,
    youtube_id TEXT,
    video_url TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.mz_premium_welcome_config ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Lecture publique premium welcome config" 
ON public.mz_premium_welcome_config FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin manage premium welcome config" 
ON public.mz_premium_welcome_config FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND (is_admin = true OR admin_role = 'super_admin')
    )
);

-- Insertion par défaut
INSERT INTO public.mz_premium_welcome_config (id, youtube_id, is_active)
VALUES ('premium-welcome-global', 'dQw4w9WgXcQ', true)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
