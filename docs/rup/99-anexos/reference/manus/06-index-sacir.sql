-- postgis/init-app/db05-index-sacir.sql

SELECT pg_catalog.setval('sacir.municipio_id_seq', 93, true);

SELECT pg_catalog.setval('sacir.uf_id_seq', 27, true);

ALTER TABLE ONLY sacir.municipio
    ADD CONSTRAINT municipio_pkey PRIMARY KEY (id);

ALTER TABLE ONLY sacir.uf
    ADD CONSTRAINT uf_pkey PRIMARY KEY (id);

CREATE INDEX aptidao_edafo_idx_aptidao_edafo_geom ON sacir.aptidao_edafo USING gist (geom);

CREATE INDEX declividade_idx_declividade_geom ON sacir.declividade_declividade USING gist (geom);

CREATE INDEX idx_municipio_geom ON sacir.municipio USING gist (geom);

CREATE INDEX idx_uf_geom ON sacir.uf USING gist (geom);

CREATE INDEX potencial_agropecuario_idx_2008_geom ON sacir.potencial_agropecuario_2008 USING gist (geom);

CREATE INDEX potencial_agropecuario_idx_2021_geom ON sacir.potencial_agropecuario_2021 USING gist (geom);

CREATE INDEX potencial_agropecuario_idx_temp_2021_geom ON sacir.potencial_agropecuario_temp_2021 USING gist (geom);

CREATE UNIQUE INDEX uq_aptidao_cod_imovel ON sacir.aptidao_edafo USING btree (cod_imovel);

CREATE UNIQUE INDEX uq_pot2021_cod_imovel ON sacir.potencial_agropecuario_2021 USING btree (cod_imovel);
