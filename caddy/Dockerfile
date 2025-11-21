# caddy/Dockerfile
FROM caddy:2.8-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY entrypoint.sh /usr/local/bin/brickbreaker-caddy-entrypoint

RUN chmod +x /usr/local/bin/brickbreaker-caddy-entrypoint

ENTRYPOINT ["/usr/local/bin/brickbreaker-caddy-entrypoint"]
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
