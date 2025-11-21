# prettier/Dockerfile
FROM node:20-alpine

# Instalar dependências necessárias para o script
RUN apk add --no-cache bash findutils

# Instalar Prettier globalmente
RUN npm install -g prettier@latest

# Definir diretório de trabalho
WORKDIR /workspace

# Definir variáveis de ambiente padrão
ENV IN_DOCKER=true
ENV WORK_DIR=/workspace

# Entrypoint será sobrescrito pelo docker-compose.yml
# O script será montado via volume do docker-compose.yml
ENTRYPOINT ["/bin/bash", "/workspace/prettier/entrypoint.sh"]
