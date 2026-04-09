
-- Table pour suivre les popups premium envoyés aux membres
CREATE TABLE IF NOT EXISTS public.premium_welcome_popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id) -- Un seul popup de ce type par utilisateur
);

-- RLS pour la table
ALTER TABLE public.premium_welcome_popups ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre popup
CREATE POLICY "Users can see their own premium popup"
ON public.premium_welcome_popups FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent marquer leur popup comme lu
CREATE POLICY "Users can update their own premium popup"
ON public.premium_welcome_popups FOR UPDATE
USING (auth.uid() = user_id);

-- Les admins peuvent tout faire
CREATE POLICY "Admins can manage premium popups"
ON public.premium_welcome_popups FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND (is_admin = true OR admin_role = 'super_admin')
    )
);

-- Notification pour recharger le schéma
NOTIFY pgrst, 'reload schema';
