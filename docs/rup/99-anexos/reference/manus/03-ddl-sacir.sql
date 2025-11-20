-- postgis/init-app/db03-ddl-sacir.sql

-- PostgreSQL database dump
--

-- Dumped from database version 14.9 (Debian 14.9-1.pgdg110+1)
-- Dumped by pg_dump version 14.9 (Debian 14.9-1.pgdg110+1)

-- Started on 2025-09-25 17:11:17 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 9 (class 2615 OID 278273)
-- Name: sacir; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS sacir;


--
-- TOC entry 2 (class 3079 OID 277057)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 4616 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 1109 (class 1255 OID 278274)
-- Name: _column_list(text); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._column_list(_table text) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT string_agg(quote_ident(col_name), ', ' ORDER BY ordinal)
  FROM sacir._src_columns(_table)
$$;


--
-- TOC entry 1110 (class 1255 OID 278275)
-- Name: _connstr(); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._connstr() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT 'host=127.0.0.1 port=5432 dbname=sacir user=postgres password=postgres'
$$;


--
-- TOC entry 1111 (class 1255 OID 278276)
-- Name: _copy_data(text, boolean); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._copy_data(_table text, _truncate boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  cols text;
  sel  text;
  ins  text;
  cs   text;
BEGIN
  cols := sacir._column_list(_table);
  cs   := sacir._connstr();

  IF _truncate THEN
    EXECUTE format('TRUNCATE TABLE sacir.%I', _table);
  END IF;

  -- SELECT remoto com tipagem explícita (garante compatibilidade de tipos, inclusive geometry)
  sel := 'SELECT ' ||
         (SELECT string_agg(format('%I::%s', col_name, col_type), ', ' ORDER BY ordinal)
            FROM sacir._src_columns(_table)) ||
         format(' FROM sacir.%I', _table);

  -- Monta INSERT local <- dblink(connstr, sel) com assinatura tipada
  ins := format(
           'INSERT INTO sacir.%I(%s) SELECT %s',
           _table, cols,
           (SELECT ' * FROM dblink('||quote_literal(cs)||','||quote_literal(sel)||') AS t('||
                   string_agg(format('%I %s', col_name, col_type), ', ' ORDER BY ordinal)
                   ||')'
            FROM sacir._src_columns(_table))
         );

  EXECUTE ins;

  PERFORM sacir._sync_sequences(_table);
END$$;


--
-- TOC entry 1112 (class 1255 OID 278277)
-- Name: _ensure_table(text); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._ensure_table(_table text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  ddl text;
BEGIN
  IF NOT sacir._table_exists(_table) THEN
    ddl := 'CREATE TABLE sacir.'||quote_ident(_table)||' (';
    ddl := ddl || (
      SELECT string_agg(format('%I %s', col_name, col_type), ', ' ORDER BY ordinal)
      FROM sacir._src_columns(_table)
    ) || ')';
    EXECUTE ddl;
  END IF;
END$$;


--
-- TOC entry 1113 (class 1255 OID 278278)
-- Name: _src_columns(text); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._src_columns(_table text) RETURNS TABLE(col_name text, col_type text, ordinal integer)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  q  text;
  cs text;
BEGIN
  q := format($f$
    SELECT a.attname AS col_name,
           format_type(a.atttypid, a.atttypmod) AS col_type,
           a.attnum AS ordinal
    FROM pg_attribute a
    JOIN pg_class c   ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'sacir'
      AND c.relname = %L
      AND a.attnum > 0
      AND NOT a.attisdropped
    ORDER BY a.attnum
  $f$, _table);

  cs := sacir._connstr();

  RETURN QUERY
    SELECT t.col_name, t.col_type, t.ordinal
    FROM dblink(cs, q) AS t(col_name text, col_type text, ordinal int);
END$_$;


--
-- TOC entry 1114 (class 1255 OID 278279)
-- Name: _sync_sequences(text); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._sync_sequences(_table text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  r record;
  q text;
BEGIN
  FOR r IN
    SELECT
      a.attname AS col_name,
      seq.relname AS seq_name,
      nseq.nspname AS seq_schema
    FROM pg_class t
    JOIN pg_namespace nt ON nt.oid = t.relnamespace
    JOIN pg_attribute a   ON a.attrelid = t.oid AND a.attnum > 0 AND NOT a.attisdropped
    JOIN pg_attrdef d     ON d.adrelid = t.oid AND d.adnum = a.attnum
    JOIN LATERAL pg_get_expr(d.adbin, d.adrelid) AS defexpr(def)
      ON true
    LEFT JOIN pg_depend dep ON dep.refobjid = t.oid AND dep.refobjsubid = a.attnum AND dep.objid = d.oid
    LEFT JOIN pg_class seq ON seq.oid = dep.objid AND seq.relkind = 'S'
    LEFT JOIN pg_namespace nseq ON nseq.oid = seq.relnamespace
    WHERE nt.nspname='sacir' AND t.relname=_table
      AND defexpr.def LIKE 'nextval%'    -- default é nextval(...)
  LOOP
    q := format(
           'SELECT setval(%L, (SELECT COALESCE(MAX(%I),0) FROM sacir.%I), true)',
           quote_ident(r.seq_schema)||'.'||quote_ident(r.seq_name),
           r.col_name, _table
         );
    EXECUTE q;
  END LOOP;
END$$;


--
-- TOC entry 1115 (class 1255 OID 278280)
-- Name: _table_exists(text); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir._table_exists(_table text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema='sacir' AND table_name=_table
  )
$$;


--
-- TOC entry 1116 (class 1255 OID 278281)
-- Name: migrate_table_via_dblink(text, boolean); Type: FUNCTION; Schema: sacir; Owner: -
--

CREATE OR REPLACE FUNCTION sacir.migrate_table_via_dblink(_table text, _truncate boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM sacir._ensure_table(_table);
  PERFORM sacir._copy_data(_table, _truncate);
END$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 247 (class 1259 OID 278397)
-- Name: 1985; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE IF NOT EXISTS sacir."1985" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 248 (class 1259 OID 278402)
-- Name: 2008; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE IF NOT EXISTS sacir."2008" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 249 (class 1259 OID 278407)
-- Name: 2009; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE IF NOT EXISTS sacir."2009" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 250 (class 1259 OID 278412)
-- Name: 2010; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE IF NOT EXISTS sacir."2010" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 251 (class 1259 OID 278417)
-- Name: 2011; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE IF NOT EXISTS sacir."2011" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 252 (class 1259 OID 278422)
-- Name: 2012; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE IF NOT EXISTS sacir."2012" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 253 (class 1259 OID 278427)
-- Name: 2013; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2013" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 254 (class 1259 OID 278432)
-- Name: 2014; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2014" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 255 (class 1259 OID 278437)
-- Name: 2015; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2015" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 256 (class 1259 OID 278442)
-- Name: 2016; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2016" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 257 (class 1259 OID 278447)
-- Name: 2017; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2017" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 258 (class 1259 OID 278452)
-- Name: 2018; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2018" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 259 (class 1259 OID 278457)
-- Name: 2019; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2019" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 260 (class 1259 OID 278462)
-- Name: 2020; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2020" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 261 (class 1259 OID 278467)
-- Name: 2021; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir."2021" (
    cd_uso bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 224 (class 1259 OID 278282)
-- Name: app_user; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.app_user (
    id uuid,
    email text,
    pass_hash text,
    created_at timestamp with time zone
);


--
-- TOC entry 225 (class 1259 OID 278287)
-- Name: aptidao_edafo; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.aptidao_edafo (
    aptd_edafo text,
    cd_edafo text,
    leg_solo text,
    cod_imovel character varying(100),
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 263 (class 1259 OID 555229)
-- Name: cartograma_uso_cobertura_solo_serie; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.cartograma_uso_cobertura_solo_serie (
    cod_imovel text NOT NULL,
    imagem_estado_imovel text,
    legenda_uso_terra text,
    imagem_uso_terra_2008 text,
    imagem_uso_terra_2011 text,
    imagem_uso_terra_2016 text,
    imagem_uso_terra_2021 text,
    legenda_solo text,
    imagem_solo text,
    legenda_declividade text,
    imagem_declividade text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cod_estado character varying,
    nom_munici character varying
);


--
-- TOC entry 262 (class 1259 OID 536280)
-- Name: declividade; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.declividade (
    cd_decliv bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 226 (class 1259 OID 278292)
-- Name: declividade_declividade; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.declividade_declividade (
    cd_decliv bigint,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 227 (class 1259 OID 278297)
-- Name: imovel_area_imovel; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.imovel_area_imovel (
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326),
    vegetacao double precision,
    agricultura double precision
);


--
-- TOC entry 228 (class 1259 OID 278302)
-- Name: limite_administrativo_municipio; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.limite_administrativo_municipio (
    gid integer,
    cd_mun character varying(254),
    nm_mun character varying(254),
    sigla character varying(254),
    area_km2 numeric,
    geom public.geometry(MultiPolygon,4674)
);


--
-- TOC entry 229 (class 1259 OID 278307)
-- Name: limite_administrativo_uf; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.limite_administrativo_uf (
    gid integer,
    cd_uf character varying(254),
    nm_uf character varying(254),
    sigla character varying(254),
    nm_regiao character varying(254),
    geom public.geometry(MultiPolygon,4674)
);


--
-- TOC entry 270 (class 1259 OID 555288)
-- Name: municipio; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.municipio (
    id integer NOT NULL,
    nome character varying(150),
    sigla character varying(10),
    geom public.geometry(MultiPolygon,4674)
);


--
-- TOC entry 269 (class 1259 OID 555287)
-- Name: municipio_id_seq; Type: SEQUENCE; Schema: sacir; Owner: -
--

CREATE SEQUENCE sacir.municipio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4618 (class 0 OID 0)
-- Dependencies: 269
-- Name: municipio_id_seq; Type: SEQUENCE OWNED BY; Schema: sacir; Owner: -
--

ALTER SEQUENCE sacir.municipio_id_seq OWNED BY sacir.municipio.id;


--
-- TOC entry 230 (class 1259 OID 278312)
-- Name: potencial_agropecuario_2008; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.potencial_agropecuario_2008 (
    cd_uso text,
    cod_imovel text,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    cd_mun text,
    cd_decliv text,
    aptd_edafo text,
    cd_edafo text,
    leg_solo text,
    cd_amzlg text,
    cd_ucpi text,
    cd_terrind text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 231 (class 1259 OID 278317)
-- Name: potencial_agropecuario_2021; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.potencial_agropecuario_2021 (
    cd_uso text,
    cod_imovel text,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    cd_mun text,
    cd_decliv text,
    aptd_edafo text,
    cd_edafo text,
    leg_solo text,
    cd_amzlg text,
    cd_ucpi text,
    cd_terrind text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 232 (class 1259 OID 278322)
-- Name: potencial_agropecuario_temp_2021; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.potencial_agropecuario_temp_2021 (
    cd_uso text,
    cod_imovel text,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    cd_mun text,
    cd_decliv text,
    aptd_edafo text,
    cd_edafo text,
    leg_solo text,
    cd_amzlg text,
    cd_ucpi text,
    cd_terrind text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 233 (class 1259 OID 278327)
-- Name: qualidade_pastagem_2008; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2008 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 234 (class 1259 OID 278332)
-- Name: qualidade_pastagem_2009; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2009 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 235 (class 1259 OID 278337)
-- Name: qualidade_pastagem_2010; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2010 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 236 (class 1259 OID 278342)
-- Name: qualidade_pastagem_2011; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2011 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 237 (class 1259 OID 278347)
-- Name: qualidade_pastagem_2012; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2012 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 238 (class 1259 OID 278352)
-- Name: qualidade_pastagem_2013; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2013 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 239 (class 1259 OID 278357)
-- Name: qualidade_pastagem_2014; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2014 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 240 (class 1259 OID 278362)
-- Name: qualidade_pastagem_2015; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2015 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 241 (class 1259 OID 278367)
-- Name: qualidade_pastagem_2016; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2016 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 242 (class 1259 OID 278372)
-- Name: qualidade_pastagem_2017; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2017 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 243 (class 1259 OID 278377)
-- Name: qualidade_pastagem_2018; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2018 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 244 (class 1259 OID 278382)
-- Name: qualidade_pastagem_2019; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2019 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 245 (class 1259 OID 278387)
-- Name: qualidade_pastagem_2020; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2020 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 246 (class 1259 OID 278392)
-- Name: qualidade_pastagem_2021; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.qualidade_pastagem_2021 (
    cd_degpast text,
    cod_imovel text,
    num_area double precision,
    cod_estado text,
    nom_munici text,
    num_modulo double precision,
    tipo_imove text,
    situacao text,
    condicao_i text,
    geom public.geometry(Polygon,4326)
);


--
-- TOC entry 264 (class 1259 OID 555236)
-- Name: tabela_historico_uso_solo; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.tabela_historico_uso_solo (
    cod_imovel text NOT NULL,
    cod_estado text NOT NULL,
    nom_munici text,
    imagemestado text,
    legendausoterra text,
    imagemusocoberturasolo1985 text,
    imagemusocoberturasolo1990 text,
    imagemusocoberturasolo2021 text
);


--
-- TOC entry 266 (class 1259 OID 555248)
-- Name: tabela_sintese; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.tabela_sintese (
    cod_imovel text NOT NULL,
    cod_estado character varying(2),
    nom_munici text,
    amz double precision,
    pct_amz double precision,
    amz_ate_8 double precision,
    amz_8_ate_20 double precision,
    amz_20_ate_45 double precision,
    amz_45_ate_100 double precision,
    amz_acima_100 double precision,
    declividade double precision,
    pct_declividade double precision,
    declividade_ate_8 double precision,
    declividade_de_8_ate_20 double precision,
    declividade_de_20_ate_45 double precision,
    declividade_de_45_ate_100 double precision,
    declividade_de_acima_100 double precision,
    vegetacao double precision,
    pct_vegetacao double precision,
    vegetacao_ate_8 double precision,
    vegetacaode_8_ate_20 double precision,
    vegetacaode_20_ate_45 double precision,
    vegetacaode_45_ate_100 double precision,
    vegetacaode_acima_100 double precision,
    vegetacao_livre double precision,
    pct_vegetacao_livre double precision,
    vegetacao_livre_ate_8 double precision,
    vegetacao_livre_8_ate_20 double precision,
    vegetacao_livre_20_ate_45 double precision,
    vegetacao_livre_45_ate_100 double precision,
    vegetacao_livre_acima_100 double precision,
    vegetacao_livre_apto double precision,
    pct_vegetacao_livre_apto double precision,
    vegetacao_livre_ate_8_apto double precision,
    vegetacao_livre_8_ate_20_apto double precision,
    vegetacao_livre_20_ate_45_apto double precision,
    vegetacao_livre_45_ate_100_apto double precision,
    vegetacao_livre_acima_100_apto double precision,
    vegetacao_livre_inapto double precision,
    pct_vegetacao_livre_inapto double precision,
    vegetacao_livre_ate_8_inapto double precision,
    vegetacao_livre_8_ate_20_inapto double precision,
    vegetacao_livre_20_ate_45_inapto double precision,
    vegetacao_livre_45_ate_100_inapto double precision,
    vegetacao_livre_acima_100_inapto double precision,
    agropecuario double precision,
    pct_agropecuario double precision,
    agropecuario_ate_8 double precision,
    agropecuario_de_8_ate_20 double precision,
    agropecuario_de_20_ate_45 double precision,
    agropecuario_45_ate_100 double precision,
    agropecuario_acima_100 double precision,
    agropecuario_livre double precision,
    pct_agropecuario_livre double precision,
    agropecuario_livre_ate_8 double precision,
    agropecuario_livre_8_ate_20 double precision,
    agropecuario_livre_20_ate_45 double precision,
    agropecuario_livre_45_ate_100 double precision,
    agropecuario_livre_acima_100 double precision,
    agropecuario_livre_apto double precision,
    pct_agropecuario_livre_apto double precision,
    agropecuario_livre_ate_8_apto double precision,
    agropecuario_livre_8_ate_20_apto double precision,
    agropecuario_livre_20_ate_45_apto double precision,
    agropecuario_livre_45_ate_100_apto double precision,
    agropecuario_livre_acima_100_apto double precision,
    agropecuario_livre_inapto double precision,
    pct_agropecuario_livre_inapto double precision,
    agropecuario_livre_ate_8_inapto double precision,
    agropecuario_livre_8_ate_20_inapto double precision,
    agropecuario_livre_20_ate_45_inapto double precision,
    agropecuario_livre_45_ate_100_inapto double precision,
    agropecuario_livre_acima_100_inapto double precision,
    ti double precision,
    pct_ti double precision,
    ti_ate_8 double precision,
    ti_de_8_ate_20 double precision,
    ti_de_20_ate_45 double precision,
    ti_de_45_ate_100 double precision,
    ti_de_acima_100 double precision,
    vegetacao_ti double precision,
    pct_vegetacao_ti double precision,
    vegetacao_ti_ate_8 double precision,
    vegetacao_ti_8_ate_20 double precision,
    vegetacao_ti_20_ate_45 double precision,
    vegetacao_ti_45_ate_100 double precision,
    vegetacao_ti_acima_100 double precision,
    agro_ti double precision,
    pct_agro_ti double precision,
    agro_ti_ate_8 double precision,
    agro_ti_8_ate_20 double precision,
    agro_ti_20_ate_45 double precision,
    agro_ti_45_ate_100 double precision,
    agro_ti_acima_100 double precision,
    ucpi double precision,
    pct_ucpi double precision,
    ucpi_ate_8 double precision,
    ucpi_de_8_ate_20 double precision,
    ucpi_de_20_ate_45 double precision,
    ucpi_de_45_ate_100 double precision,
    ucpi_de_acima_100 double precision,
    vegetacao_ucpi double precision,
    pct_vegetacao_ucpi double precision,
    vegetacao_ucpi_ate_8 double precision,
    vegetacao_ucpi_8_ate_20 double precision,
    vegetacao_ucpi_20_ate_45 double precision,
    vegetacao_ucpi_45_ate_100 double precision,
    vegetacao_ucpi_acima_100 double precision,
    agro_ucpi double precision,
    pct_agro_ucpi double precision,
    agro_ucpi_ate_8 double precision,
    agro_ucpi_8_ate_20 double precision,
    agro_ucpi_20_ate_45 double precision,
    agro_ucpi_45_ate_100 double precision,
    agro_ucpi_acima_100 double precision,
    agua double precision,
    pct_agua double precision,
    agua_ate_8 double precision,
    agua_8_ate_20 double precision,
    agua_20_ate_45 double precision,
    agua_45_ate_100 double precision,
    agua_acima_100 double precision,
    infra double precision,
    pct_infra double precision,
    infra_ate_8 double precision,
    infra_8_ate_20 double precision,
    infra_20_ate_45 double precision,
    infra_45_ate_100 double precision,
    infra_acima_100 double precision,
    outros double precision,
    pct_outros double precision,
    outros_ate_8 double precision,
    outros_8_ate_20 double precision,
    outros_20_ate_45 double precision,
    outros_45_ate_100 double precision,
    outros_acima_100 double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 265 (class 1259 OID 555241)
-- Name: tabela_sintese2008; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.tabela_sintese2008 (
    cod_imovel text NOT NULL,
    cod_estado character varying(2),
    nom_munici text,
    amz double precision,
    pct_amz double precision,
    amz_ate_8 double precision,
    amz_8_ate_20 double precision,
    amz_20_ate_45 double precision,
    amz_45_ate_100 double precision,
    amz_acima_100 double precision,
    declividade double precision,
    pct_declividade double precision,
    declividade_ate_8 double precision,
    declividade_de_8_ate_20 double precision,
    declividade_de_20_ate_45 double precision,
    declividade_de_45_ate_100 double precision,
    declividade_de_acima_100 double precision,
    vegetacao double precision,
    pct_vegetacao double precision,
    vegetacao_ate_8 double precision,
    vegetacaode_8_ate_20 double precision,
    vegetacaode_20_ate_45 double precision,
    vegetacaode_45_ate_100 double precision,
    vegetacaode_acima_100 double precision,
    vegetacao_livre double precision,
    pct_vegetacao_livre double precision,
    vegetacao_livre_ate_8 double precision,
    vegetacao_livre_8_ate_20 double precision,
    vegetacao_livre_20_ate_45 double precision,
    vegetacao_livre_45_ate_100 double precision,
    vegetacao_livre_acima_100 double precision,
    vegetacao_livre_apto double precision,
    pct_vegetacao_livre_apto double precision,
    vegetacao_livre_ate_8_apto double precision,
    vegetacao_livre_8_ate_20_apto double precision,
    vegetacao_livre_20_ate_45_apto double precision,
    vegetacao_livre_45_ate_100_apto double precision,
    vegetacao_livre_acima_100_apto double precision,
    vegetacao_livre_inapto double precision,
    pct_vegetacao_livre_inapto double precision,
    vegetacao_livre_ate_8_inapto double precision,
    vegetacao_livre_8_ate_20_inapto double precision,
    vegetacao_livre_20_ate_45_inapto double precision,
    vegetacao_livre_45_ate_100_inapto double precision,
    vegetacao_livre_acima_100_inapto double precision,
    agropecuario double precision,
    pct_agropecuario double precision,
    agropecuario_ate_8 double precision,
    agropecuario_de_8_ate_20 double precision,
    agropecuario_de_20_ate_45 double precision,
    agropecuario_45_ate_100 double precision,
    agropecuario_acima_100 double precision,
    agropecuario_livre double precision,
    pct_agropecuario_livre double precision,
    agropecuario_livre_ate_8 double precision,
    agropecuario_livre_8_ate_20 double precision,
    agropecuario_livre_20_ate_45 double precision,
    agropecuario_livre_45_ate_100 double precision,
    agropecuario_livre_acima_100 double precision,
    agropecuario_livre_apto double precision,
    pct_agropecuario_livre_apto double precision,
    agropecuario_livre_ate_8_apto double precision,
    agropecuario_livre_8_ate_20_apto double precision,
    agropecuario_livre_20_ate_45_apto double precision,
    agropecuario_livre_45_ate_100_apto double precision,
    agropecuario_livre_acima_100_apto double precision,
    agropecuario_livre_inapto double precision,
    pct_agropecuario_livre_inapto double precision,
    agropecuario_livre_ate_8_inapto double precision,
    agropecuario_livre_8_ate_20_inapto double precision,
    agropecuario_livre_20_ate_45_inapto double precision,
    agropecuario_livre_45_ate_100_inapto double precision,
    agropecuario_livre_acima_100_inapto double precision,
    ti double precision,
    pct_ti double precision,
    ti_ate_8 double precision,
    ti_de_8_ate_20 double precision,
    ti_de_20_ate_45 double precision,
    ti_de_45_ate_100 double precision,
    ti_de_acima_100 double precision,
    vegetacao_ti double precision,
    pct_vegetacao_ti double precision,
    vegetacao_ti_ate_8 double precision,
    vegetacao_ti_8_ate_20 double precision,
    vegetacao_ti_20_ate_45 double precision,
    vegetacao_ti_45_ate_100 double precision,
    vegetacao_ti_acima_100 double precision,
    agro_ti double precision,
    pct_agro_ti double precision,
    agro_ti_ate_8 double precision,
    agro_ti_8_ate_20 double precision,
    agro_ti_20_ate_45 double precision,
    agro_ti_45_ate_100 double precision,
    agro_ti_acima_100 double precision,
    ucpi double precision,
    pct_ucpi double precision,
    ucpi_ate_8 double precision,
    ucpi_de_8_ate_20 double precision,
    ucpi_de_20_ate_45 double precision,
    ucpi_de_45_ate_100 double precision,
    ucpi_de_acima_100 double precision,
    vegetacao_ucpi double precision,
    pct_vegetacao_ucpi double precision,
    vegetacao_ucpi_ate_8 double precision,
    vegetacao_ucpi_8_ate_20 double precision,
    vegetacao_ucpi_20_ate_45 double precision,
    vegetacao_ucpi_45_ate_100 double precision,
    vegetacao_ucpi_acima_100 double precision,
    agro_ucpi double precision,
    pct_agro_ucpi double precision,
    agro_ucpi_ate_8 double precision,
    agro_ucpi_8_ate_20 double precision,
    agro_ucpi_20_ate_45 double precision,
    agro_ucpi_45_ate_100 double precision,
    agro_ucpi_acima_100 double precision,
    agua double precision,
    pct_agua double precision,
    agua_ate_8 double precision,
    agua_8_ate_20 double precision,
    agua_20_ate_45 double precision,
    agua_45_ate_100 double precision,
    agua_acima_100 double precision,
    infra double precision,
    pct_infra double precision,
    infra_ate_8 double precision,
    infra_8_ate_20 double precision,
    infra_20_ate_45 double precision,
    infra_45_ate_100 double precision,
    infra_acima_100 double precision,
    outros double precision,
    pct_outros double precision,
    outros_ate_8 double precision,
    outros_8_ate_20 double precision,
    outros_20_ate_45 double precision,
    outros_45_ate_100 double precision,
    outros_acima_100 double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 268 (class 1259 OID 555257)
-- Name: uf; Type: TABLE; Schema: sacir; Owner: -
--

CREATE TABLE sacir.uf (
    id integer NOT NULL,
    nome character varying(100),
    sigla character(2),
    geom public.geometry(MultiPolygon,4674)
);


--
-- TOC entry 267 (class 1259 OID 555256)
-- Name: uf_id_seq; Type: SEQUENCE; Schema: sacir; Owner: -
--

CREATE SEQUENCE sacir.uf_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4619 (class 0 OID 0)
-- Dependencies: 267
-- Name: uf_id_seq; Type: SEQUENCE OWNED BY; Schema: sacir; Owner: -
--

ALTER SEQUENCE sacir.uf_id_seq OWNED BY sacir.uf.id;


--
-- TOC entry 4395 (class 2604 OID 555291)
-- Name: municipio id; Type: DEFAULT; Schema: sacir; Owner: -
--

ALTER TABLE ONLY sacir.municipio ALTER COLUMN id SET DEFAULT nextval('sacir.municipio_id_seq'::regclass);


--
-- TOC entry 4394 (class 2604 OID 555260)
-- Name: uf id; Type: DEFAULT; Schema: sacir; Owner: -
--

ALTER TABLE ONLY sacir.uf ALTER COLUMN id SET DEFAULT nextval('sacir.uf_id_seq'::regclass);

