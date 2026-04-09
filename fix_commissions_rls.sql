
-- 1. Activer RLS sur la table commissions
ALTER TABLE IF EXISTS public.commissions ENABLE ROW LEVEL SECURITY;

-- 2. Permettre l'insertion publique (nécessaire pour les ventes via liens affiliés)
-- On autorise n'importe qui à insérer une commission en attente
DROP POLICY IF EXISTS "Insertion publique des commissions" ON public.commissions;
CREATE POLICY "Insertion publique des commissions" ON public.commissions 
FOR INSERT WITH CHECK (status = 'pending');

-- 3. Permettre aux ambassadeurs de voir leurs propres commissions
DROP POLICY IF EXISTS "Lecture commissions personnelles" ON public.commissions;
CREATE POLICY "Lecture commissions personnelles" ON public.commissions 
FOR SELECT USING (auth.uid() = user_id);

-- 4. Permettre aux administrateurs de tout voir et tout modifier
DROP POLICY IF EXISTS "Admin full access commissions" ON public.commissions;
CREATE POLICY "Admin full access commissions" ON public.commissions 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND (is_admin = true OR admin_role IS NOT NULL)
    )
);

-- 5. Rafraîchissement du cache
NOTIFY pgrst, 'reload schema';
