-- postgis/init-app/db01-postgrest-preconfig.sql
\set ON_ERROR_STOP 1

CREATE OR REPLACE FUNCTION sacir.pre_config()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = sacir, public
AS $$
DECLARE
  v_db_secret        text := nullif(current_setting('app.jwt_secret', true), '');
  v_pgrst_secret     text := nullif(current_setting('pgrst.jwt_secret', true), '');
  v_effective_secret text := coalesce(v_pgrst_secret, v_db_secret);
  v_db_ttl           text := nullif(current_setting('app.jwt_ttl_seconds', true), '');
  v_effective_ttl    text := coalesce(
                           nullif(current_setting('pgrst.jwt_ttl_seconds', true), ''),
                           v_db_ttl
                         );
BEGIN
  IF v_effective_secret IS NULL THEN
    RAISE EXCEPTION 'jwt secret not configured for PostgREST';
  END IF;

  PERFORM set_config('app.jwt_secret', v_effective_secret, false);
  PERFORM set_config('pgrst.jwt_secret', v_effective_secret, false);

  IF v_db_secret IS DISTINCT FROM v_effective_secret THEN
    EXECUTE format(
      'ALTER DATABASE %I SET app.jwt_secret = %L',
      current_database(),
      v_effective_secret
    );

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
      EXECUTE format(
        'ALTER ROLE authenticator SET app.jwt_secret = %L',
        v_effective_secret
      );
    END IF;
  END IF;

  IF v_effective_ttl IS NOT NULL THEN
    PERFORM set_config('app.jwt_ttl_seconds', v_effective_ttl, false);

    IF v_db_ttl IS DISTINCT FROM v_effective_ttl THEN
      EXECUTE format(
        'ALTER DATABASE %I SET app.jwt_ttl_seconds = %L',
        current_database(),
        v_effective_ttl
      );

      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
        EXECUTE format(
          'ALTER ROLE authenticator SET app.jwt_ttl_seconds = %L',
          v_effective_ttl
        );
      END IF;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION sacir.pre_config() TO authenticator;
