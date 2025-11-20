# Dockerfile
FROM node:20-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache bash git

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração de dependências
COPY package*.json ./

# Instalar dependências do projeto
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Expor porta do Vite (padrão 7979 conforme vite.config.ts)
EXPOSE 7979

# Variáveis de ambiente
ENV NODE_ENV=development
ENV PORT=7979

# Comando padrão: iniciar servidor de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
