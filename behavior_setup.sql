
-- ==========================================
-- SETUP : SUIVI COMPORTEMENTAL MZ+
-- ==========================================

-- 1. Création de la table de tracking
CREATE TABLE IF NOT EXISTS public.mz_offer_page_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    duration_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Index de performance pour le Panel Admin
CREATE INDEX IF NOT EXISTS idx_tracking_user_id ON public.mz_offer_page_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_last_ping ON public.mz_offer_page_tracking(last_ping);

-- 3. Activation de la sécurité RLS
ALTER TABLE public.mz_offer_page_tracking ENABLE ROW LEVEL SECURITY;

-- 4. Politiques de sécurité (RLS)
-- Permettre à tout utilisateur d'insérer son propre suivi
DROP POLICY IF EXISTS "Insert own tracking" ON public.mz_offer_page_tracking;
CREATE POLICY "Insert own tracking" ON public.mz_offer_page_tracking 
FOR INSERT WITH CHECK (true);

-- Permettre à l'utilisateur de mettre à jour sa session
DROP POLICY IF EXISTS "Update own tracking" ON public.mz_offer_page_tracking;
CREATE POLICY "Update own tracking" ON public.mz_offer_page_tracking 
FOR UPDATE USING (auth.uid() = user_id);

-- Permettre aux Admins de tout voir
DROP POLICY IF EXISTS "Admins view all tracking" ON public.mz_offer_page_tracking;
CREATE POLICY "Admins view all tracking" ON public.mz_offer_page_tracking 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND (is_admin = true OR admin_role IS NOT NULL)
    )
);

-- 5. LE MOTEUR : Fonction Heartbeat (Appelée par le frontend toutes les 10s)
-- Cette fonction gère intelligemment les sessions : 
-- Si l'utilisateur est déjà là, elle augmente son temps. Sinon, elle crée une nouvelle visite.
CREATE OR REPLACE FUNCTION public.mz_track_offer_heartbeat(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- On cherche une session pour cet utilisateur active dans les 5 dernières minutes
    SELECT id INTO v_session_id
    FROM public.mz_offer_page_tracking
    WHERE user_id = p_user_id
      AND last_ping > (now() - interval '5 minutes')
    ORDER BY last_ping DESC
    LIMIT 1;

    IF v_session_id IS NOT NULL THEN
        -- Mise à jour de la session existante : on incrémente le temps réel passé
        UPDATE public.mz_offer_page_tracking
        SET duration_seconds = duration_seconds + LEAST(EXTRACT(EPOCH FROM (now() - last_ping))::INT, 20),
            last_ping = now()
        WHERE id = v_session_id;
    ELSE
        -- Création d'une nouvelle session de visite
        INSERT INTO public.mz_offer_page_tracking (user_id, started_at, last_ping, duration_seconds)
        VALUES (p_user_id, now(), now(), 0);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Actualisation du cache API
NOTIFY pgrst, 'reload schema';
