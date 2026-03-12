DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = '${APPLICATION_IDENTITY_NAME}'
    ) THEN
        PERFORM pgaadauth_create_principal('${APPLICATION_IDENTITY_NAME}', false, false);
    END IF;
END$$;