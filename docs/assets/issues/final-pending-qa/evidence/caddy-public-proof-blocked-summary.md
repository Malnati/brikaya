<!-- docs/assets/issues/final-pending-qa/evidence/caddy-public-proof-blocked-summary.md -->
# BrickBreaker Caddy proof

- Checked UTC: `2026-07-03T07:29:33Z`
- Domain: `brickbreacker.cranio.dev`
- DNS: `false`; addresses: `none`
- DNS status summary: `system A: NXDOMAIN;system AAAA: NXDOMAIN;cloudflare A: NXDOMAIN;google A: NXDOMAIN;getent hosts: no-result;`
- TLS: `false`; certificate metadata unavailable because DNS did not resolve.
- /healthz: `false`; status: `000`; body snippet: ``
- Root: `false`; status: `000`

## Conclusion

Proof blocked. DNS for `brickbreacker.cranio.dev` did not resolve from the orchestrator, so public TLS issuance and the `/healthz` endpoint could not be validated.

## Blockers
- DNS did not resolve brickbreacker.cranio.dev from the orchestrator; A/AAAA checks returned no addresses; status summary: system A: NXDOMAIN;system AAAA: NXDOMAIN;cloudflare A: NXDOMAIN;google A: NXDOMAIN;getent hosts: no-result;
- TLS certificate issuance could not be validated because the hostname did not resolve; openssl error snippet: 40A735F47D760000:error:10080002:BIO routines:BIO_lookup_ex:system lib:../crypto/bio/bio_addr.c:738:Name or service not known connect:errno=2 Could not read certificate from <stdin>
- /healthz could not be validated because normal-TLS curl could not resolve/connect; status=000; error snippet: curl: (6) Could not resolve host: brickbreacker.cranio.dev 
- root endpoint could not be optionally validated because normal-TLS curl could not resolve/connect; status=000; error snippet: curl: (6) Could not resolve host: brickbreacker.cranio.dev 
