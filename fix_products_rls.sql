
-- Assurer que la table products est accessible en lecture pour tout le monde
-- (Nécessaire pour que les ambassadeurs voient le catalogue)

DO $$ 
BEGIN
    -- Activer RLS si ce n'est pas déjà fait
    ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

    -- Supprimer l'ancienne politique si elle existe
    DROP POLICY IF EXISTS "Lecture publique des produits" ON public.products;
    
    -- Créer la politique de lecture publique
    CREATE POLICY "Lecture publique des produits" ON public.products
    FOR SELECT USING (true);

    -- Supprimer l'ancienne politique admin si elle existe
    DROP POLICY IF EXISTS "Admin full access products" ON public.products;

    -- Créer la politique d'accès complet pour les admins
    CREATE POLICY "Admin full access products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND (is_admin = true OR admin_role IS NOT NULL)
        )
    );
END $$;

-- Notification pour recharger le schéma
NOTIFY pgrst, 'reload schema';
