
-- 1. Ajout de la colonne 'chapters' à la table mz_formations pour stocker les listes personnalisées
-- Type JSONB pour permettre une flexibilité totale
ALTER TABLE IF EXISTS public.mz_formations 
ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]'::jsonb;

-- 2. Optionnel : Nettoyage des anciennes données si nécessaire pour éviter les conflits de types
-- UPDATE public.mz_formations SET chapters = '[]'::jsonb WHERE chapters IS NULL;

-- 3. Rafraîchissement du cache de l'API PostgREST pour que l'application détecte la nouvelle colonne immédiatement
NOTIFY pgrst, 'reload schema';
