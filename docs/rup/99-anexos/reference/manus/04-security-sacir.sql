-- postgis/init-app/db02-security-sacir.sql
\set ON_ERROR_STOP 1

-- Aplica RLS exigindo sessão ativa em todas as tabelas do schema sacir
DO $$
DECLARE
  r record;
  v_policy text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
      FROM pg_tables
     WHERE schemaname = 'sacir'
       AND tablename NOT IN ('audit_log')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', r.schemaname, r.tablename);

    v_policy := format('rls_%s_require_session', r.tablename);

    IF EXISTS (
      SELECT 1
        FROM pg_policies
       WHERE schemaname = r.schemaname
         AND tablename  = r.tablename
         AND policyname = v_policy
    ) THEN
      EXECUTE format('DROP POLICY %I ON %I.%I;', v_policy, r.schemaname, r.tablename);
    END IF;

    IF r.tablename = 'sessions' THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I USING (sacir.session_is_valid() AND user_email = sacir.current_email()) WITH CHECK (sacir.session_is_valid() AND user_email = sacir.current_email());',
        v_policy,
        r.schemaname,
        r.tablename
      );
    ELSE
      EXECUTE format(
        'CREATE POLICY %I ON %I.%I USING (sacir.session_is_valid()) WITH CHECK (sacir.session_is_valid());',
        v_policy,
        r.schemaname,
        r.tablename
      );
    END IF;
  END LOOP;
END;
$$;

-- Cria gatilhos de auditoria para todas as tabelas do schema sacir (exceto a própria audit_log)
DO $$
DECLARE
  r record;
  v_trigger text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
      FROM pg_tables
     WHERE schemaname = 'sacir'
       AND tablename <> 'audit_log'
  LOOP
    v_trigger := format('trg_audit_%s', r.tablename);

    IF EXISTS (
      SELECT 1
        FROM pg_trigger
       WHERE tgname = v_trigger
         AND tgrelid = format('%I.%I', r.schemaname, r.tablename)::regclass
    ) THEN
      EXECUTE format('DROP TRIGGER %I ON %I.%I;', v_trigger, r.schemaname, r.tablename);
    END IF;

    EXECUTE format(
      'CREATE TRIGGER %I
         AFTER INSERT OR UPDATE OR DELETE ON %I.%I
         FOR EACH ROW
         EXECUTE FUNCTION sacir.log_dml();',
      v_trigger,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END;
$$;
