// tests/e2e/chromeLaunchArgs.js
const CHROME_HOST_RESOLVER_RULES_ENV_KEY = 'BRIKAYA_CHROME_HOST_RESOLVER_RULES';
const CHROME_HOST_RESOLVER_RULES_ARG = '--host-resolver-rules=';

export function buildChromeLaunchArgs(defaultArgs) {
  const hostResolverRules = process.env[CHROME_HOST_RESOLVER_RULES_ENV_KEY];
  const extraArgs = hostResolverRules ? [`${CHROME_HOST_RESOLVER_RULES_ARG}${hostResolverRules}`] : [];

  return [...defaultArgs, ...extraArgs];
}
