
-- 1. On renomme la colonne si elle s'appelle read_at
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketing_announcement_reads' AND column_name='read_at') THEN
        ALTER TABLE public.marketing_announcement_reads RENAME COLUMN read_at TO created_at;
    END IF;
END $$;

-- 2. On s'assure que created_at existe avec la bonne valeur par défaut
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketing_announcement_reads' AND column_name='created_at') THEN
        ALTER TABLE public.marketing_announcement_reads ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- 3. Nettoyage des contraintes redondantes (Rappel de la solution précédente)
ALTER TABLE IF EXISTS public.marketing_announcement_reads 
DROP CONSTRAINT IF EXISTS fk_reads_user;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_announcement_reads_user_id_fkey') THEN
        ALTER TABLE public.marketing_announcement_reads 
        ADD CONSTRAINT marketing_announcement_reads_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES public.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Recharger le schéma pour PostgREST
NOTIFY pgrst, 'reload schema';
