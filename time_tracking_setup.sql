
-- ==========================================
-- SETUP : SUIVI DU TEMPS GLOBAL (RÉCOMPENSES)
-- ==========================================

-- 1. Table pour stocker le temps passé par jour
CREATE TABLE IF NOT EXISTS public.mz_rewards_time_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tracking_date DATE DEFAULT CURRENT_DATE,
    total_minutes INTEGER DEFAULT 0,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, tracking_date)
);

-- 2. Index pour les performances de l'audit
CREATE INDEX IF NOT EXISTS idx_rewards_time_user_date ON public.mz_rewards_time_tracking(user_id, tracking_date);
CREATE INDEX IF NOT EXISTS idx_rewards_time_last_ping ON public.mz_rewards_time_tracking(last_ping);

-- 3. RLS
ALTER TABLE public.mz_rewards_time_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own time" ON public.mz_rewards_time_tracking;
CREATE POLICY "Users can view own time" ON public.mz_rewards_time_tracking 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all time" ON public.mz_rewards_time_tracking;
CREATE POLICY "Admins view all time" ON public.mz_rewards_time_tracking 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND (is_admin = true OR admin_role IS NOT NULL)
    )
);

-- 4. FONCTION HEARTBEAT GLOBALE
-- Appelée toutes les minutes par l'App.tsx
CREATE OR REPLACE FUNCTION public.mz_rewards_heartbeat(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.mz_rewards_time_tracking (user_id, tracking_date, total_minutes, last_ping)
    VALUES (p_user_id, CURRENT_DATE, 1, now())
    ON CONFLICT (user_id, tracking_date) DO UPDATE
    SET total_minutes = mz_rewards_time_tracking.total_minutes + 1,
        last_ping = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VUE DU CLASSEMENT MONDIAL (Mise à jour pour priorité au mérite)
DROP VIEW IF EXISTS public.mz_rewards_leaderboard_v2 CASCADE;
CREATE VIEW public.mz_rewards_leaderboard_v2 AS
WITH user_time AS (
    SELECT 
        user_id,
        SUM(total_minutes) as raw_minutes
    FROM public.mz_rewards_time_tracking
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.full_name,
    u.user_level,
    COALESCE(ut.raw_minutes, 0)::INT as total_minutes,
    -- FORMULE DE SCORE :
    -- Points RPA + Solde RPA + (Minutes / 100)
    (
        COALESCE(u.rpa_points, 0) + 
        COALESCE(u.rpa_balance, 0) + 
        (COALESCE(ut.raw_minutes, 0) / 100)
    )::BIGINT as total_score
FROM public.users u
LEFT JOIN user_time ut ON u.id = ut.user_id
WHERE u.full_name IS NOT NULL
  AND u.full_name NOT IN ('Ambassadeur', '---')
ORDER BY total_score DESC;

-- 6. VUE D'AUDIT POUR LES ADMINS (Mise à jour)
DROP VIEW IF EXISTS public.mz_admin_activity_summary CASCADE;
CREATE VIEW public.mz_admin_activity_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.user_level,
    COALESCE((SELECT total_minutes FROM public.mz_rewards_time_tracking WHERE user_id = u.id AND tracking_date = CURRENT_DATE), 0) as minutes_today,
    COALESCE((SELECT SUM(total_minutes) FROM public.mz_rewards_time_tracking WHERE user_id = u.id), 0) as minutes_total,
    (SELECT MAX(last_ping) FROM public.mz_rewards_time_tracking WHERE user_id = u.id) as last_active
FROM public.users u
WHERE u.full_name IS NOT NULL AND u.full_name NOT IN ('Ambassadeur', '---');

-- 6. FONCTION POUR RÉCUPÉRER LE TEMPS TOTAL (Utilisée par l'offre flash)
CREATE OR REPLACE FUNCTION public.mz_get_user_total_minutes(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE((SELECT SUM(total_minutes) FROM public.mz_rewards_time_tracking WHERE user_id = p_user_id), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualisation
NOTIFY pgrst, 'reload schema';
