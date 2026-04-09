
-- ==========================================
-- OPTIMISATION DU CALCUL DES POINTS (CLASSEMENT)
-- ==========================================
-- Objectif : Diminuer l'importance du temps passé sur la plateforme
-- au profit des actions concrètes (RPA, Ventes, etc.)

-- 1. Redéfinition de la vue du classement mondial
CREATE OR REPLACE VIEW public.mz_rewards_leaderboard_v2 AS
WITH user_time AS (
    SELECT 
        user_id,
        SUM(total_minutes) as total_minutes
    FROM public.mz_rewards_time_tracking
    GROUP BY user_id
),
user_rpa AS (
    -- On récupère les points attribués manuellement par les admins pour les missions RPA
    SELECT 
        user_id,
        SUM(points_awarded) as rpa_points
    FROM public.mz_rpa_submissions
    WHERE status = 'approved'
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.full_name,
    u.user_level,
    COALESCE(ut.total_minutes, 0) as total_minutes,
    -- NOUVELLE FORMULE : 
    -- Le temps ne rapporte plus que 1 point par minute (au lieu de 10 précédemment supposé)
    -- Les points RPA (missions, vidéos, ventes) deviennent le facteur principal
    (COALESCE(ut.total_minutes, 0) * 1) + COALESCE(ur.rpa_points, 0) as total_score
FROM public.users u
LEFT JOIN user_time ut ON u.id = ut.user_id
LEFT JOIN user_rpa ur ON u.id = ur.user_id
WHERE u.full_name IS NOT NULL
ORDER BY total_score DESC;

-- 2. Mise à jour de la vue d'audit pour les admins (cohérence)
CREATE OR REPLACE VIEW public.mz_admin_activity_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.user_level,
    COALESCE((SELECT total_minutes FROM public.mz_rewards_time_tracking WHERE user_id = u.id AND tracking_date = CURRENT_DATE), 0) as minutes_today,
    COALESCE((SELECT SUM(total_minutes) FROM public.mz_rewards_time_tracking WHERE user_id = u.id), 0) as minutes_total,
    (SELECT MAX(last_ping) FROM public.mz_rewards_time_tracking WHERE user_id = u.id) as last_active
FROM public.users u;

-- 3. Notification du changement de schéma
NOTIFY pgrst, 'reload schema';
