// scripts/cloudflare-pages.js
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolve4 } from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import {
  projectEnvPath,
  readEnvFile as readCodexEnvFile,
  sanitizeOutput as sanitizeCodexOutput,
} from './load-project-env.mjs';

const COMMAND_INDEX = 2;
const SCRIPT_PATH_INDEX = 1;
const DEFAULT_COMMAND = 'env-check';
const ROOT_ENV_FILE = '/Users/mal/GitHub/malnati/.env';
const PROJECT_ENV_FILE = projectEnvPath(process.cwd());
const ENV_FILE_PATHS = [ROOT_ENV_FILE, PROJECT_ENV_FILE];
const COMMENT_PREFIX = '#';
const ENV_SEPARATOR = '=';
const EMPTY_STRING = '';
const SLASH = '/';
const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';
const NPM_EXECUTABLE = 'npx';
const WRANGLER_COMMAND = 'wrangler';
const CLOUDFLARE_API_BASE_URL = 'https://api.cloudflare.com/client/v4';
const AUTHORIZATION_HEADER = 'Authorization';
const CONTENT_TYPE_HEADER = 'Content-Type';
const JSON_CONTENT_TYPE = 'application/json';
const BEARER_PREFIX = 'Bearer';
const PROJECT_NAME_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PROJECT_NAME';
const BRANCH_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_BRANCH';
const OUTPUT_DIR_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_OUTPUT_DIR';
const CUSTOM_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_CUSTOM_DOMAIN';
const PREVIEW_PROJECT_NAME_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PREVIEW_PROJECT_NAME';
const PREVIEW_DOMAIN_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PREVIEW_DOMAIN';
const PREVIEW_BRANCH_KEY = 'BRIKAYA_CLOUDFLARE_PAGES_PREVIEW_BRANCH';
const ZONE_NAME_KEY = 'BRIKAYA_CLOUDFLARE_ZONE_NAME';
const ACCOUNT_ID_KEY = 'CLOUDFLARE_ACCOUNT_ID';
const API_TOKEN_KEY = 'CLOUDFLARE_API_TOKEN';
const INDEX_HTML_FILE_NAME = 'index.html';
const NOT_FOUND_HTML_FILE_NAME = '404.html';
const DEFAULT_PAGES_PROJECT_NAME = 'brikaya-live';
const DEFAULT_PAGES_BRANCH = 'main';
const DEFAULT_OUTPUT_DIR = 'dist';
const DEFAULT_CUSTOM_DOMAIN = 'brikaya.com';
const DEFAULT_PREVIEW_PROJECT_NAME = 'brikaya-dev';
const DEFAULT_PREVIEW_DOMAIN = 'dev.brikaya.com';
const DEFAULT_PREVIEW_BRANCH = 'preview';
const DEFAULT_ZONE_NAME = 'brikaya.com';
const DEFAULT_REDIRECT_LIST_NAME = 'brikaya_pages_dev_redirects';
const DEFAULT_REDIRECT_RULE_REF = 'brikaya_pages_dev_redirect';
const DEFAULT_REDIRECT_RULESET_NAME = 'Brikaya canonical domain redirects';
const DEFAULT_REDIRECT_RULE_DESCRIPTION = 'Redirect Pages-generated domains to brikaya.com.';
const HTTPS_PROTOCOL = 'https://';
const PAGES_DEV_DOMAIN = 'pages.dev';
const DNS_STATUS_FALLBACK = 'desconhecido';
const API_RESULT_FALLBACK = [];
const DOMAIN_STATUS_FALLBACK = 'desconhecido';
const DNS_RECORD_TYPE_A = 'A';
const DNS_RECORD_TYPE_AAAA = 'AAAA';
const DNS_RECORD_TYPE_CNAME = 'CNAME';
const DNS_RECORD_TTL_AUTO = 1;
const DNS_RECORD_PROXIED = true;
const REDIRECT_STATUS_CODE = 301;
const MAX_REDIRECT_OPERATION_POLLS = 30;
const REDIRECT_OPERATION_POLL_DELAY_MS = 1000;
const HTTP_GET = 'GET';
const HTTP_POST = 'POST';
const HTTP_PUT = 'PUT';
const HTTP_PATCH = 'PATCH';
const HTTP_DELETE = 'DELETE';
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const NOT_FOUND_HANDLING_404 = '404';
const DEPLOYMENT_CONFIG_PRODUCTION = 'production';
const DEPLOYMENT_CONFIG_PREVIEW = 'preview';
const STALE_BUNDLE_PROBE_PATH = '/assets/index-__stale_probe__.js';
const STALE_BUNDLE_CHECK_PARAM = 'qaStaleBundleCheck';
const HTML_CONTENT_TYPE = 'text/html';
const JAVASCRIPT_CONTENT_TYPE = 'javascript';
const CSS_CONTENT_TYPE = 'css';
const FETCH_CACHE_NO_STORE = 'no-store';
const REDIRECT_LIST_KIND = 'redirect';
const RULESET_KIND_ROOT = 'root';
const RULESET_PHASE_REDIRECT = 'http_request_redirect';
const RULESET_ACTION_REDIRECT = 'redirect';
const RULESET_KEY_FULL_URI = 'http.request.full_uri';
const LIST_NAME_SEARCH_PARAM = 'name';
const ZONE_NAME_SEARCH_PARAM = 'name';
const ACCOUNT_ID_SEARCH_PARAM = 'account.id';
const BULK_OPERATION_COMPLETED_STATUS = 'completed';
const BULK_OPERATION_FAILED_STATUS = 'failed';
const PUBLIC_INDEX_MAX_POLLS = 24;
const PUBLIC_INDEX_POLL_DELAY_MS = 5000;
const PUBLIC_INDEX_FETCH_TIMEOUT_MS = 15000;
const PUBLIC_INDEX_CHECK_PARAM = 'qaPublicIndexCheck';
const PUBLIC_INDEX_TITLE_PATTERN = /<title>(.*?)<\/title>/i;
const PUBLIC_INDEX_SCRIPT_PATTERN = /assets\/index-[^"']+\.js/i;
const PUBLIC_INDEX_STYLE_PATTERN = /assets\/index-[^"']+\.css/i;
const PURGE_CACHE_EVERYTHING = true;
const RULE_ENABLED = true;
const CLOUDFLARE_AUTHENTICATION_ERROR = 'Authentication error';
const REQUIRED_ENV_KEYS = [
  ACCOUNT_ID_KEY,
  API_TOKEN_KEY,
  PROJECT_NAME_KEY,
  BRANCH_KEY,
  OUTPUT_DIR_KEY,
  CUSTOM_DOMAIN_KEY
];
const SENSITIVE_KEY_PATTERN = /TOKEN|SECRET|PASSWORD|JSON|REFRESH|ACCOUNT_ID|CLIENT_ID|AUD/i;
const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const HEX_ID_PATTERN = /\b[a-f0-9]{32}\b/g;
const SAFE_EMAIL_PLACEHOLDER = '[EMAIL]';
const SAFE_ID_PLACEHOLDER = '[ID]';
const SAFE_SECRET_PLACEHOLDER = '[REDACTED]';
const PROJECT_LIST_COMMAND = ['pages', 'project', 'list'];
const WHOAMI_COMMAND = ['whoami'];
const PROJECT_CREATE_COMMAND = ['pages', 'project', 'create'];
const PAGES_DEPLOY_COMMAND = ['pages', 'deploy'];
const PROJECT_NAME_OPTION = '--project-name';
const BRANCH_OPTION = '--branch';
const PRODUCTION_BRANCH_OPTION = '--production-branch';
const SKIP_CACHING_OPTION = '--skip-caching';
const PREVIEW_REQUIRED_ENV_KEYS = [
  ACCOUNT_ID_KEY,
  API_TOKEN_KEY,
  PREVIEW_PROJECT_NAME_KEY,
  PREVIEW_BRANCH_KEY,
  OUTPUT_DIR_KEY,
  PREVIEW_DOMAIN_KEY
];
const COMMANDS = new Set([
  'env-check',
  'whoami',
  'project-list',
  'ensure-project',
  'ensure-preview-project',
  'zone-check',
  'dns-state',
  'ensure-dns',
  'ensure-preview-dns',
  'domain-list',
  'ensure-domain',
  'ensure-preview-domain',
  'redirect-state',
  'ensure-pages-dev-redirect',
  'purge-public-cache',
  'verify-public-index',
  'verify-preview-index',
  'verify-stale-bundle-404',
  'verify-preview-stale-bundle-404',
  'deploy',
  'deploy-preview'
]);

function loadEnvironment() {
  const hasRequiredFromProcess = REQUIRED_ENV_KEYS.every(key => process.env[key]);
  if (!existsSync(PROJECT_ENV_FILE) && !hasRequiredFromProcess) {
    throw new Error('.env local ausente; execute npm run codex-env:bootstrap sem imprimir valores.');
  }

  const fileValues = ENV_FILE_PATHS.reduce((mergedValues, filePath) => {
    if (!existsSync(filePath)) {
      return mergedValues;
    }
    return { ...mergedValues, ...readCodexEnvFile(filePath) };
  }, {});

  return {
    ...process.env,
    ...fileValues,
    [PROJECT_NAME_KEY]: fileValues[PROJECT_NAME_KEY] || process.env[PROJECT_NAME_KEY] || DEFAULT_PAGES_PROJECT_NAME,
    [BRANCH_KEY]: fileValues[BRANCH_KEY] || process.env[BRANCH_KEY] || DEFAULT_PAGES_BRANCH,
    [OUTPUT_DIR_KEY]: fileValues[OUTPUT_DIR_KEY] || process.env[OUTPUT_DIR_KEY] || DEFAULT_OUTPUT_DIR,
    [CUSTOM_DOMAIN_KEY]: fileValues[CUSTOM_DOMAIN_KEY] || process.env[CUSTOM_DOMAIN_KEY] || DEFAULT_CUSTOM_DOMAIN,
    [PREVIEW_PROJECT_NAME_KEY]:
      fileValues[PREVIEW_PROJECT_NAME_KEY] || process.env[PREVIEW_PROJECT_NAME_KEY] || DEFAULT_PREVIEW_PROJECT_NAME,
    [PREVIEW_DOMAIN_KEY]:
      fileValues[PREVIEW_DOMAIN_KEY] || process.env[PREVIEW_DOMAIN_KEY] || DEFAULT_PREVIEW_DOMAIN,
    [PREVIEW_BRANCH_KEY]:
      fileValues[PREVIEW_BRANCH_KEY] || process.env[PREVIEW_BRANCH_KEY] || DEFAULT_PREVIEW_BRANCH,
    [ZONE_NAME_KEY]: fileValues[ZONE_NAME_KEY] || process.env[ZONE_NAME_KEY] || DEFAULT_ZONE_NAME
  };
}

function validatePreviewEnvironment(envValues) {
  const missingKeys = PREVIEW_REQUIRED_ENV_KEYS.filter(key => !envValues[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Variáveis preview ausentes: ${missingKeys.join(', ')}`);
  }
}

function resolveZoneName(envValues, customDomain = envValues[CUSTOM_DOMAIN_KEY]) {
  if (envValues[ZONE_NAME_KEY]) {
    return envValues[ZONE_NAME_KEY];
  }

  const parts = customDomain.split('.');
  if (parts.length <= 2) {
    return customDomain;
  }

  return parts.slice(-2).join('.');
}

function buildPreviewEnvValues(envValues) {
  return {
    ...envValues,
    [PROJECT_NAME_KEY]: envValues[PREVIEW_PROJECT_NAME_KEY],
    [CUSTOM_DOMAIN_KEY]: envValues[PREVIEW_DOMAIN_KEY],
    [BRANCH_KEY]: envValues[PREVIEW_BRANCH_KEY]
  };
}

function buildSensitiveValues(envValues) {
  return Object.entries(envValues)
    .filter(([key, value]) => SENSITIVE_KEY_PATTERN.test(key) && typeof value === 'string' && value.length > 0)
    .map(([, value]) => value)
    .sort((leftValue, rightValue) => rightValue.length - leftValue.length);
}

function sanitizeOutput(output, envValues) {
  return sanitizeCodexOutput(output, envValues);
}

function validateEnvironment(envValues) {
  const missingKeys = REQUIRED_ENV_KEYS.filter(key => !envValues[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Variáveis ausentes: ${missingKeys.join(', ')}`);
  }
}

function runWrangler(args, envValues) {
  const result = spawnSync(NPM_EXECUTABLE, [WRANGLER_COMMAND, ...args], {
    env: envValues,
    encoding: 'utf8'
  });
  const sanitizedStdout = sanitizeOutput(result.stdout || EMPTY_STRING, envValues);
  const sanitizedStderr = sanitizeOutput(result.stderr || EMPTY_STRING, envValues);

  if (sanitizedStdout) {
    process.stdout.write(sanitizedStdout);
  }

  if (sanitizedStderr) {
    process.stderr.write(sanitizedStderr);
  }

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Wrangler falhou com status ${result.status}.`);
  }

  return result.stdout || EMPTY_STRING;
}

function buildCloudflareApiUrl(pathname) {
  return `${CLOUDFLARE_API_BASE_URL}${pathname}`;
}

function buildCloudflareApiHeaders(envValues) {
  return {
    [AUTHORIZATION_HEADER]: `${BEARER_PREFIX} ${envValues[API_TOKEN_KEY]}`,
    [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE
  };
}

async function readCloudflareResponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  return JSON.parse(responseText);
}

function buildCloudflareErrorMessage(payload, envValues) {
  const serializedPayload = JSON.stringify(payload?.errors || payload?.messages || payload);
  return sanitizeOutput(serializedPayload, envValues);
}

async function requestCloudflareApi(pathname, options, envValues) {
  const response = await fetch(buildCloudflareApiUrl(pathname), {
    ...options,
    headers: {
      ...buildCloudflareApiHeaders(envValues),
      ...(options.headers || {})
    }
  });
  const payload = await readCloudflareResponse(response);

  if (!response.ok || payload.success === false) {
    throw new Error(`Cloudflare API falhou: ${buildCloudflareErrorMessage(payload, envValues)}`);
  }

  return payload;
}

function buildPagesDomainsPath(envValues) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/pages/projects/${envValues[PROJECT_NAME_KEY]}/domains`;
}

function buildPagesProjectsPath(envValues) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/pages/projects`;
}

function buildPagesProjectPath(envValues) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/pages/projects/${envValues[PROJECT_NAME_KEY]}`;
}

function buildNotFoundHandlingDeploymentConfigs() {
  return {
    [DEPLOYMENT_CONFIG_PRODUCTION]: {
      not_found_handling: NOT_FOUND_HANDLING_404
    },
    [DEPLOYMENT_CONFIG_PREVIEW]: {
      not_found_handling: NOT_FOUND_HANDLING_404
    }
  };
}

function hasRequiredNotFoundHandling(project) {
  const deploymentConfigs = project?.deployment_configs || {};

  return (
    deploymentConfigs[DEPLOYMENT_CONFIG_PRODUCTION]?.not_found_handling ===
      NOT_FOUND_HANDLING_404 &&
    deploymentConfigs[DEPLOYMENT_CONFIG_PREVIEW]?.not_found_handling === NOT_FOUND_HANDLING_404
  );
}

function buildZonesPath(envValues, zoneName = resolveZoneName(envValues)) {
  const searchParams = new URLSearchParams({
    [ZONE_NAME_SEARCH_PARAM]: zoneName,
    [ACCOUNT_ID_SEARCH_PARAM]: envValues[ACCOUNT_ID_KEY]
  });

  return `/zones?${searchParams.toString()}`;
}

function buildDnsRecordsPath(zoneId, searchParams = new URLSearchParams()) {
  const serializedParams = searchParams.toString();
  const querySuffix = serializedParams ? `?${serializedParams}` : EMPTY_STRING;

  return `/zones/${zoneId}/dns_records${querySuffix}`;
}

function buildDnsRecordPath(zoneId, recordId) {
  return `/zones/${zoneId}/dns_records/${recordId}`;
}

function buildRulesListsPath(envValues) {
  const searchParams = new URLSearchParams({
    [LIST_NAME_SEARCH_PARAM]: DEFAULT_REDIRECT_LIST_NAME
  });

  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rules/lists?${searchParams.toString()}`;
}

function buildRulesListsCreatePath(envValues) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rules/lists`;
}

function buildRulesListItemsPath(envValues, listId) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rules/lists/${listId}/items`;
}

function buildRulesListBulkOperationPath(envValues, operationId) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rules/lists/bulk_operations/${operationId}`;
}

function buildPurgeCachePath(zoneId) {
  return `/zones/${zoneId}/purge_cache`;
}

function buildRulesetsPath(envValues) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rulesets`;
}

function buildRulesetPath(envValues, rulesetId) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rulesets/${rulesetId}`;
}

function buildRedirectEntrypointRulesetPath(envValues) {
  return `/accounts/${envValues[ACCOUNT_ID_KEY]}/rulesets/phases/${RULESET_PHASE_REDIRECT}/entrypoint`;
}

function ensureTrailingSlash(value) {
  if (value.endsWith(SLASH)) {
    return value;
  }

  return `${value}${SLASH}`;
}

function buildPagesDevHost(envValues) {
  return `${envValues[PROJECT_NAME_KEY]}.${PAGES_DEV_DOMAIN}`;
}

function buildPagesDevSourceUrl(envValues) {
  return ensureTrailingSlash(buildPagesDevHost(envValues));
}

function buildPagesDevUrl(envValues) {
  return ensureTrailingSlash(`${HTTPS_PROTOCOL}${buildPagesDevHost(envValues)}`);
}

function buildCustomDomainUrl(envValues) {
  return ensureTrailingSlash(`${HTTPS_PROTOCOL}${envValues[CUSTOM_DOMAIN_KEY]}`);
}

function buildRedirectExpression() {
  return `${RULESET_KEY_FULL_URI} in $${DEFAULT_REDIRECT_LIST_NAME}`;
}

function buildRedirectRule() {
  return {
    ref: DEFAULT_REDIRECT_RULE_REF,
    description: DEFAULT_REDIRECT_RULE_DESCRIPTION,
    expression: buildRedirectExpression(),
    action: RULESET_ACTION_REDIRECT,
    action_parameters: {
      from_list: {
        name: DEFAULT_REDIRECT_LIST_NAME,
        key: RULESET_KEY_FULL_URI
      }
    },
    enabled: RULE_ENABLED
  };
}

function buildRedirectRuleset(rules) {
  return {
    name: DEFAULT_REDIRECT_RULESET_NAME,
    kind: RULESET_KIND_ROOT,
    phase: RULESET_PHASE_REDIRECT,
    rules
  };
}

function buildRedirectListItem(envValues) {
  return {
    redirect: {
      source_url: buildPagesDevSourceUrl(envValues),
      target_url: buildCustomDomainUrl(envValues),
      status_code: REDIRECT_STATUS_CODE,
      include_subdomains: true,
      subpath_matching: true,
      preserve_query_string: true,
      preserve_path_suffix: true
    }
  };
}

function getPagesDomainName(domain) {
  return domain?.name || EMPTY_STRING;
}

function getPagesDomainStatus(domain) {
  return domain?.status || DOMAIN_STATUS_FALLBACK;
}

function getPagesProjectName(project) {
  return project?.name || EMPTY_STRING;
}

function getZoneName(zone) {
  return zone?.name || EMPTY_STRING;
}

function getZoneStatus(zone) {
  return zone?.status || DNS_STATUS_FALLBACK;
}

function getZoneId(zone) {
  return zone?.id || EMPTY_STRING;
}

function getDnsRecordId(record) {
  return record?.id || EMPTY_STRING;
}

function getDnsRecordType(record) {
  return record?.type || EMPTY_STRING;
}

function getDnsRecordContent(record) {
  return record?.content || EMPTY_STRING;
}

function isReplaceableDnsRecord(record) {
  const recordType = getDnsRecordType(record);

  return [DNS_RECORD_TYPE_A, DNS_RECORD_TYPE_AAAA, DNS_RECORD_TYPE_CNAME].includes(recordType);
}

function isDesiredDnsRecord(record, envValues) {
  return (
    getDnsRecordType(record) === DNS_RECORD_TYPE_CNAME &&
    getDnsRecordContent(record) === buildPagesDevHost(envValues) &&
    record?.proxied === DNS_RECORD_PROXIED
  );
}

function getListName(list) {
  return list?.name || EMPTY_STRING;
}

function getListId(list) {
  return list?.id || EMPTY_STRING;
}

function getOperationId(payload) {
  return payload?.result?.operation_id || EMPTY_STRING;
}

function getOperationStatus(payload) {
  return payload?.result?.status || DNS_STATUS_FALLBACK;
}

function getRulesetId(ruleset) {
  return ruleset?.id || EMPTY_STRING;
}

function getRulesetRules(ruleset) {
  return ruleset?.rules || API_RESULT_FALLBACK;
}

function isMatchingRedirectRule(rule) {
  return rule?.ref === DEFAULT_REDIRECT_RULE_REF;
}

function isRedirectEntrypointMissing(error) {
  return error.message.includes('10003') || error.message.includes('not found');
}

function isCloudflareAuthenticationError(error) {
  return error.message.includes(CLOUDFLARE_AUTHENTICATION_ERROR);
}

function sleep(milliseconds) {
  return new Promise(resolveTimer => {
    setTimeout(resolveTimer, milliseconds);
  });
}

function readLocalPublicIndexExpectation(envValues) {
  const indexPath = resolve(
    process.cwd(),
    envValues[OUTPUT_DIR_KEY],
    'play',
    INDEX_HTML_FILE_NAME,
  );
  const indexHtml = readFileSync(indexPath, 'utf8');

  return {
    title: extractRequiredMatch(indexHtml, PUBLIC_INDEX_TITLE_PATTERN, 'título local'),
    script: extractRequiredMatch(indexHtml, PUBLIC_INDEX_SCRIPT_PATTERN, 'script local'),
    style: extractRequiredMatch(indexHtml, PUBLIC_INDEX_STYLE_PATTERN, 'estilo local')
  };
}

function extractRequiredMatch(content, pattern, label) {
  const match = content.match(pattern)?.[1] || content.match(pattern)?.[0];

  if (!match) {
    throw new Error(`Não foi possível ler ${label} do index público.`);
  }

  return match;
}

function extractOptionalMatch(content, pattern) {
  return content.match(pattern)?.[1] || content.match(pattern)?.[0] || EMPTY_STRING;
}

function buildPublicIndexCheckUrl(envValues) {
  const publicUrl = new URL(buildCustomDomainUrl(envValues));
  publicUrl.pathname = '/play/';
  publicUrl.searchParams.set(PUBLIC_INDEX_CHECK_PARAM, String(Date.now()));

  return publicUrl;
}

function createFetchTimeoutSignal() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PUBLIC_INDEX_FETCH_TIMEOUT_MS);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
}

async function fetchPublicIndex(envValues) {
  const { signal, clear } = createFetchTimeoutSignal();

  try {
    const response = await fetch(buildPublicIndexCheckUrl(envValues), {
      cache: FETCH_CACHE_NO_STORE,
      signal
    });
    const html = await response.text();

    return {
      status: response.status,
      title: extractOptionalMatch(html, PUBLIC_INDEX_TITLE_PATTERN),
      script: extractOptionalMatch(html, PUBLIC_INDEX_SCRIPT_PATTERN),
      style: extractOptionalMatch(html, PUBLIC_INDEX_STYLE_PATTERN)
    };
  } finally {
    clear();
  }
}

function isPublicIndexCurrent(expectedIndex, publicIndex) {
  return (
    publicIndex.status === HTTP_STATUS_OK &&
    publicIndex.title === expectedIndex.title &&
    publicIndex.script === expectedIndex.script &&
    publicIndex.style === expectedIndex.style
  );
}

function buildPublicIndexMismatchMessage(expectedIndex, publicIndex) {
  return (
    'Domínio público ainda não serve o build local: ' +
    `title=${publicIndex.title} expected=${expectedIndex.title}; ` +
    `script=${publicIndex.script} expected=${expectedIndex.script}; ` +
    `style=${publicIndex.style} expected=${expectedIndex.style}; ` +
    `status=${publicIndex.status}`
  );
}

async function verifyPublicIndex(envValues) {
  validateEnvironment(envValues);
  const expectedIndex = readLocalPublicIndexExpectation(envValues);
  let lastPublicIndex = null;

  for (let attempt = 1; attempt <= PUBLIC_INDEX_MAX_POLLS; attempt += 1) {
    lastPublicIndex = await fetchPublicIndex(envValues);

    if (isPublicIndexCurrent(expectedIndex, lastPublicIndex)) {
      console.log(`OK domínio público atualizado: ${buildCustomDomainUrl(envValues)}`);
      return;
    }

    console.log(
      `WARN domínio público defasado tentativa=${attempt}/${PUBLIC_INDEX_MAX_POLLS}: ` +
        buildPublicIndexMismatchMessage(expectedIndex, lastPublicIndex)
    );
    await sleep(PUBLIC_INDEX_POLL_DELAY_MS);
  }

  throw new Error(buildPublicIndexMismatchMessage(expectedIndex, lastPublicIndex));
}

function buildStaleBundleProbeUrl(envValues) {
  const probeUrl = new URL(STALE_BUNDLE_PROBE_PATH, buildCustomDomainUrl(envValues));
  probeUrl.searchParams.set(STALE_BUNDLE_CHECK_PARAM, String(Date.now()));

  return probeUrl;
}

async function fetchStaleBundleProbe(envValues) {
  const { signal, clear } = createFetchTimeoutSignal();

  try {
    const response = await fetch(buildStaleBundleProbeUrl(envValues), {
      method: HTTP_GET,
      cache: FETCH_CACHE_NO_STORE,
      signal
    });

    return {
      status: response.status,
      contentType: response.headers.get(CONTENT_TYPE_HEADER) || EMPTY_STRING
    };
  } finally {
    clear();
  }
}

function isStaleBundleProbeValid(probe) {
  return probe.status === HTTP_STATUS_NOT_FOUND;
}

function buildStaleBundleProbeMismatchMessage(probe) {
  return (
    `Stale bundle probe ainda não retorna 404: status=${probe?.status}; ` +
    `content-type=${probe?.contentType}`
  );
}

async function verifyStaleBundle404(envValues) {
  validateEnvironment(envValues);
  let lastProbe = null;

  for (let attempt = 1; attempt <= PUBLIC_INDEX_MAX_POLLS; attempt += 1) {
    lastProbe = await fetchStaleBundleProbe(envValues);

    if (isStaleBundleProbeValid(lastProbe)) {
      console.log(`OK stale bundle probe retorna 404: ${buildCustomDomainUrl(envValues)}`);
      return;
    }

    console.log(
      `WARN stale bundle probe tentativa=${attempt}/${PUBLIC_INDEX_MAX_POLLS}: ` +
        buildStaleBundleProbeMismatchMessage(lastProbe)
    );
    await sleep(PUBLIC_INDEX_POLL_DELAY_MS);
  }

  throw new Error(buildStaleBundleProbeMismatchMessage(lastProbe));
}

function extractBundlePathsFromIndexHtml(indexHtml) {
  const script = extractRequiredMatch(indexHtml, PUBLIC_INDEX_SCRIPT_PATTERN, 'script publicado');
  const style = extractRequiredMatch(indexHtml, PUBLIC_INDEX_STYLE_PATTERN, 'estilo publicado');

  return { script, style };
}

function isExpectedBundleContentType(contentType, bundleKind) {
  const normalizedContentType = contentType.toLowerCase();

  if (normalizedContentType.includes(HTML_CONTENT_TYPE)) {
    return false;
  }

  if (bundleKind === JAVASCRIPT_CONTENT_TYPE) {
    return normalizedContentType.includes(JAVASCRIPT_CONTENT_TYPE);
  }

  if (bundleKind === CSS_CONTENT_TYPE) {
    return normalizedContentType.includes(CSS_CONTENT_TYPE);
  }

  return false;
}

async function fetchPublishedBundleProbe(envValues, bundlePath, bundleKind) {
  const bundleUrl = new URL(bundlePath, buildCustomDomainUrl(envValues));
  bundleUrl.searchParams.set(STALE_BUNDLE_CHECK_PARAM, String(Date.now()));
  const { signal, clear } = createFetchTimeoutSignal();

  try {
    const response = await fetch(bundleUrl, {
      method: HTTP_GET,
      cache: FETCH_CACHE_NO_STORE,
      signal
    });
    const contentType = response.headers.get(CONTENT_TYPE_HEADER) || EMPTY_STRING;

    return {
      path: bundlePath,
      kind: bundleKind,
      status: response.status,
      contentType,
      valid:
        response.status === HTTP_STATUS_OK &&
        isExpectedBundleContentType(contentType, bundleKind)
    };
  } finally {
    clear();
  }
}

async function verifyPublishedBundleMimeTypes(envValues) {
  validateEnvironment(envValues);
  const expectedIndex = readLocalPublicIndexExpectation(envValues);
  const bundlePaths = {
    script: expectedIndex.script,
    style: expectedIndex.style,
  };
  let lastInvalidProbe = null;

  for (let attempt = 1; attempt <= PUBLIC_INDEX_MAX_POLLS; attempt += 1) {
    const probes = await Promise.all([
      fetchPublishedBundleProbe(envValues, bundlePaths.script, JAVASCRIPT_CONTENT_TYPE),
      fetchPublishedBundleProbe(envValues, bundlePaths.style, CSS_CONTENT_TYPE),
    ]);
    const invalidProbe = probes.find(probe => !probe.valid);

    if (!invalidProbe) {
      console.log(
        `OK bundles publicados com MIME válido: ${bundlePaths.script}, ${bundlePaths.style}`,
      );
      return;
    }

    lastInvalidProbe = invalidProbe;
    console.log(
      `WARN bundle MIME tentativa=${attempt}/${PUBLIC_INDEX_MAX_POLLS}: ` +
        `path=${invalidProbe.path}; status=${invalidProbe.status}; ` +
        `content-type=${invalidProbe.contentType}`,
    );
    await sleep(PUBLIC_INDEX_POLL_DELAY_MS);
  }

  throw new Error(
    `Bundle publicado com MIME inválido: path=${lastInvalidProbe.path}; ` +
      `status=${lastInvalidProbe.status}; content-type=${lastInvalidProbe.contentType}`,
  );
}

async function listZones(envValues) {
  return listZonesForName(envValues, resolveZoneName(envValues));
}

async function getPrimaryZone(envValues, customDomain = envValues[CUSTOM_DOMAIN_KEY]) {
  const zoneName = resolveZoneName(envValues, customDomain);
  const zones = await listZonesForName(envValues, zoneName);
  const zone = zones.find(candidateZone => getZoneName(candidateZone) === zoneName);

  if (!zone) {
    throw new Error(`Zona Cloudflare ausente para ${zoneName}.`);
  }

  return zone;
}

async function listZonesForName(envValues, zoneName) {
  validateEnvironment(envValues);
  const payload = await requestCloudflareApi(
    buildZonesPath(envValues, zoneName),
    {
      method: HTTP_GET
    },
    envValues
  );
  const zones = payload.result || API_RESULT_FALLBACK;

  if (zones.length === 0) {
    console.log(`WARN zona não encontrada: ${zoneName}`);
    return zones;
  }

  zones.forEach(zone => {
    console.log(`OK zona ${getZoneName(zone)} status=${getZoneStatus(zone)}`);
  });

  return zones;
}

async function hasPublicARecords(envValues) {
  try {
    const addresses = await resolve4(envValues[CUSTOM_DOMAIN_KEY]);

    return addresses.length > 0;
  } catch {
    return false;
  }
}

async function handleDnsAuthenticationFallback(envValues, error) {
  if (!isCloudflareAuthenticationError(error)) {
    return false;
  }

  if (!(await hasPublicARecords(envValues))) {
    return false;
  }

  console.log(`WARN DNS Records API sem permissão; DNS público resolve ${envValues[CUSTOM_DOMAIN_KEY]}.`);
  return true;
}

async function listDnsRecords(envValues, allowPublicFallback = true) {
  const zone = await getPrimaryZone(envValues);
  const searchParams = new URLSearchParams({
    [ZONE_NAME_SEARCH_PARAM]: envValues[CUSTOM_DOMAIN_KEY]
  });
  let payload;

  try {
    payload = await requestCloudflareApi(
      buildDnsRecordsPath(getZoneId(zone), searchParams),
      {
        method: HTTP_GET
      },
      envValues
    );
  } catch (error) {
    if (allowPublicFallback && (await handleDnsAuthenticationFallback(envValues, error))) {
      return API_RESULT_FALLBACK;
    }

    throw error;
  }

  const records = payload.result || API_RESULT_FALLBACK;

  if (records.length === 0) {
    console.log(`OK DNS sem registro apex para ${envValues[CUSTOM_DOMAIN_KEY]}.`);
    return records;
  }

  records.forEach(record => {
    console.log(
      `OK DNS ${getDnsRecordType(record)} ${envValues[CUSTOM_DOMAIN_KEY]} -> ${getDnsRecordContent(record)} proxied=${record?.proxied === DNS_RECORD_PROXIED}`
    );
  });

  return records;
}

async function deleteDnsRecord(envValues, zoneId, record) {
  await requestCloudflareApi(
    buildDnsRecordPath(zoneId, getDnsRecordId(record)),
    {
      method: HTTP_DELETE
    },
    envValues
  );
  console.log(`DNS removido: ${getDnsRecordType(record)} ${envValues[CUSTOM_DOMAIN_KEY]}`);
}

async function createDnsRecord(envValues, zoneId) {
  await requestCloudflareApi(
    buildDnsRecordsPath(zoneId),
    {
      method: HTTP_POST,
      body: JSON.stringify({
        type: DNS_RECORD_TYPE_CNAME,
        name: envValues[CUSTOM_DOMAIN_KEY],
        content: buildPagesDevHost(envValues),
        ttl: DNS_RECORD_TTL_AUTO,
        proxied: DNS_RECORD_PROXIED
      })
    },
    envValues
  );
  console.log(`DNS criado: ${envValues[CUSTOM_DOMAIN_KEY]} -> ${buildPagesDevHost(envValues)}`);
}

async function purgePublicCache(envValues) {
  const zone = await getPrimaryZone(envValues);
  try {
    await requestCloudflareApi(
      buildPurgeCachePath(getZoneId(zone)),
      {
        method: HTTP_POST,
        body: JSON.stringify({ purge_everything: PURGE_CACHE_EVERYTHING })
      },
      envValues
    );
    console.log(`Cache público limpo para ${envValues[CUSTOM_DOMAIN_KEY]}.`);
  } catch (error) {
    if (isCloudflareAuthenticationError(error)) {
      console.log(
        'WARN Cache purge API sem permissão; configure CLOUDFLARE_API_TOKEN com Zone.Cache Purge. ' +
          'Verificação MIME/404 já concluída; limpeza de cache fica pendente.'
      );
      return;
    }

    throw error;
  }
}

function ensurePublic404Page() {
  const notFoundPath = resolve(process.cwd(), 'public', NOT_FOUND_HTML_FILE_NAME);

  if (!existsSync(notFoundPath)) {
    throw new Error(
      'public/404.html ausente; necessário para desativar SPA fallback do Cloudflare Pages.'
    );
  }

  console.log('OK public/404.html presente.');
}

async function ensureDnsRecord(envValues) {
  let zone;
  let records;

  try {
    zone = await getPrimaryZone(envValues);
    records = await listDnsRecords(envValues, false);
  } catch (error) {
    if (await handleDnsAuthenticationFallback(envValues, error)) {
      return;
    }

    throw error;
  }

  const existingDesiredRecord = records.find(record => isDesiredDnsRecord(record, envValues));

  if (existingDesiredRecord) {
    console.log(`DNS canônico já existe: ${envValues[CUSTOM_DOMAIN_KEY]} -> ${buildPagesDevHost(envValues)}`);
    return;
  }

  for (const record of records.filter(isReplaceableDnsRecord)) {
    await deleteDnsRecord(envValues, getZoneId(zone), record);
  }

  await createDnsRecord(envValues, getZoneId(zone));
}

async function listDomains(envValues) {
  validateEnvironment(envValues);
  const payload = await requestCloudflareApi(
    buildPagesDomainsPath(envValues),
    {
      method: HTTP_GET
    },
    envValues
  );
  const domains = payload.result || API_RESULT_FALLBACK;

  if (domains.length === 0) {
    console.log('OK nenhum domínio customizado no Pages.');
    return domains;
  }

  domains.forEach(domain => {
    console.log(`OK ${getPagesDomainName(domain)} status=${getPagesDomainStatus(domain)}`);
  });

  return domains;
}

async function ensureDomain(envValues) {
  const zones = await listZones(envValues);

  if (zones.length === 0) {
    throw new Error(`Zona Cloudflare ausente para ${envValues[CUSTOM_DOMAIN_KEY]}.`);
  }

  const domains = await listDomains(envValues);
  const targetDomain = envValues[CUSTOM_DOMAIN_KEY];
  const existingDomain = domains.find(domain => getPagesDomainName(domain) === targetDomain);

  if (existingDomain) {
    console.log(`Domínio Pages já existe: ${targetDomain} status=${getPagesDomainStatus(existingDomain)}`);
    return existingDomain;
  }

  const payload = await requestCloudflareApi(
    buildPagesDomainsPath(envValues),
    {
      method: HTTP_POST,
      body: JSON.stringify({ name: targetDomain })
    },
    envValues
  );
  const createdDomain = payload.result;

  console.log(`Domínio Pages configurado: ${targetDomain} status=${getPagesDomainStatus(createdDomain)}`);
  return createdDomain;
}

async function listRedirectLists(envValues) {
  validateEnvironment(envValues);
  const payload = await requestCloudflareApi(
    buildRulesListsPath(envValues),
    {
      method: HTTP_GET
    },
    envValues
  );
  const lists = payload.result || API_RESULT_FALLBACK;

  if (lists.length === 0) {
    console.log(`OK lista redirect ausente: ${DEFAULT_REDIRECT_LIST_NAME}`);
    return lists;
  }

  lists.forEach(list => {
    console.log(`OK lista redirect ${getListName(list)} itens=${list?.num_items ?? DNS_STATUS_FALLBACK}`);
  });

  return lists;
}

async function ensureRedirectList(envValues) {
  const lists = await listRedirectLists(envValues);
  const existingList = lists.find(list => getListName(list) === DEFAULT_REDIRECT_LIST_NAME);

  if (existingList) {
    return existingList;
  }

  const payload = await requestCloudflareApi(
    buildRulesListsCreatePath(envValues),
    {
      method: HTTP_POST,
      body: JSON.stringify({
        name: DEFAULT_REDIRECT_LIST_NAME,
        description: DEFAULT_REDIRECT_RULE_DESCRIPTION,
        kind: REDIRECT_LIST_KIND
      })
    },
    envValues
  );

  console.log(`Lista redirect criada: ${DEFAULT_REDIRECT_LIST_NAME}`);
  return payload.result;
}

async function waitForBulkOperation(envValues, operationId) {
  for (let attempt = 0; attempt < MAX_REDIRECT_OPERATION_POLLS; attempt += 1) {
    const payload = await requestCloudflareApi(
      buildRulesListBulkOperationPath(envValues, operationId),
      {
        method: HTTP_GET
      },
      envValues
    );
    const operationStatus = getOperationStatus(payload);

    if (operationStatus === BULK_OPERATION_COMPLETED_STATUS) {
      console.log(`Operação redirect concluída: ${operationStatus}`);
      return;
    }

    if (operationStatus === BULK_OPERATION_FAILED_STATUS) {
      throw new Error(`Operação redirect falhou: ${operationStatus}`);
    }

    await sleep(REDIRECT_OPERATION_POLL_DELAY_MS);
  }

  throw new Error('Operação redirect não concluiu no tempo esperado.');
}

async function updateRedirectList(envValues, redirectList) {
  const payload = await requestCloudflareApi(
    buildRulesListItemsPath(envValues, getListId(redirectList)),
    {
      method: HTTP_PUT,
      body: JSON.stringify([buildRedirectListItem(envValues)])
    },
    envValues
  );
  const operationId = getOperationId(payload);

  if (operationId) {
    await waitForBulkOperation(envValues, operationId);
  }

  console.log(`Redirect Pages configurado: ${buildPagesDevSourceUrl(envValues)} -> ${buildCustomDomainUrl(envValues)}`);
}

async function readRedirectEntrypointRuleset(envValues) {
  try {
    const payload = await requestCloudflareApi(
      buildRedirectEntrypointRulesetPath(envValues),
      {
        method: HTTP_GET
      },
      envValues
    );

    return payload.result;
  } catch (error) {
    if (isRedirectEntrypointMissing(error)) {
      return null;
    }

    throw error;
  }
}

async function printRedirectState(envValues) {
  validateEnvironment(envValues);
  await listRedirectLists(envValues);
  const ruleset = await readRedirectEntrypointRuleset(envValues);

  if (!ruleset) {
    console.log('OK ruleset redirect ausente.');
    return;
  }

  const matchingRule = getRulesetRules(ruleset).find(isMatchingRedirectRule);
  const ruleStatus = matchingRule?.enabled === RULE_ENABLED ? 'ativo' : 'ausente';
  console.log(`OK ruleset redirect presente status=${ruleStatus}`);
}

async function ensureRedirectRule(envValues) {
  const ruleset = await readRedirectEntrypointRuleset(envValues);
  const redirectRule = buildRedirectRule();

  if (!ruleset) {
    await requestCloudflareApi(
      buildRulesetsPath(envValues),
      {
        method: HTTP_POST,
        body: JSON.stringify(buildRedirectRuleset([redirectRule]))
      },
      envValues
    );
    console.log(`Ruleset redirect criado: ${DEFAULT_REDIRECT_RULESET_NAME}`);
    return;
  }

  const existingRules = getRulesetRules(ruleset);
  const nextRules = existingRules.some(isMatchingRedirectRule)
    ? existingRules.map(rule => (isMatchingRedirectRule(rule) ? { ...rule, ...redirectRule } : rule))
    : [...existingRules, redirectRule];

  await requestCloudflareApi(
    buildRulesetPath(envValues, getRulesetId(ruleset)),
    {
      method: HTTP_PUT,
      body: JSON.stringify(buildRedirectRuleset(nextRules))
    },
    envValues
  );
  console.log(`Ruleset redirect atualizado: ${DEFAULT_REDIRECT_RULESET_NAME}`);
}

async function ensurePagesDevRedirect(envValues) {
  validateEnvironment(envValues);
  const redirectList = await ensureRedirectList(envValues);
  await updateRedirectList(envValues, redirectList);
  await ensureRedirectRule(envValues);
}

function printEnvCheck(envValues) {
  validateEnvironment(envValues);
  REQUIRED_ENV_KEYS.forEach(key => {
    console.log(`OK ${key}`);
  });
}

async function listPagesProjects(envValues) {
  const payload = await requestCloudflareApi(
    buildPagesProjectsPath(envValues),
    {
      method: HTTP_GET
    },
    envValues
  );

  return payload.result || API_RESULT_FALLBACK;
}

async function getPagesProject(envValues) {
  const payload = await requestCloudflareApi(
    buildPagesProjectPath(envValues),
    {
      method: HTTP_GET
    },
    envValues
  );

  return payload.result;
}

async function ensurePagesNotFoundHandling(envValues) {
  validateEnvironment(envValues);
  const projectName = envValues[PROJECT_NAME_KEY];
  let project;

  try {
    project = await getPagesProject(envValues);
  } catch (error) {
    if (isCloudflareAuthenticationError(error)) {
      console.log(`WARN Pages API sem permissão; not_found_handling não verificado para ${projectName}.`);
      return;
    }

    throw error;
  }

  if (hasRequiredNotFoundHandling(project)) {
    console.log(`OK not_found_handling=404 já configurado: ${projectName}`);
    return;
  }

  const deploymentConfigs = project?.deployment_configs || {};
  const hasHandlingField =
    'not_found_handling' in (deploymentConfigs[DEPLOYMENT_CONFIG_PRODUCTION] || {}) ||
    'not_found_handling' in (deploymentConfigs[DEPLOYMENT_CONFIG_PREVIEW] || {});

  if (!hasHandlingField) {
    console.log(
      `WARN Pages API não expõe not_found_handling para ${projectName}; usando public/404.html como fallback canônico.`
    );
    return;
  }

  await requestCloudflareApi(
    buildPagesProjectPath(envValues),
    {
      method: HTTP_PATCH,
      body: JSON.stringify({
        deployment_configs: buildNotFoundHandlingDeploymentConfigs()
      })
    },
    envValues
  );
  console.log(`not_found_handling=404 configurado para ${projectName}.`);
}

async function ensureProject(envValues) {
  validateEnvironment(envValues);
  ensurePublic404Page();
  const projectName = envValues[PROJECT_NAME_KEY];
  const projects = await listPagesProjects(envValues);
  const projectExists = projects.some(project => getPagesProjectName(project) === projectName);

  if (!projectExists) {
    runWrangler(
      [...PROJECT_CREATE_COMMAND, projectName, PRODUCTION_BRANCH_OPTION, envValues[BRANCH_KEY]],
      envValues
    );
  } else {
    console.log(`Projeto Pages já existe: ${projectName}`);
  }

  await ensurePagesNotFoundHandling(envValues);
}

async function ensurePreviewProject(envValues) {
  validatePreviewEnvironment(envValues);
  ensurePublic404Page();
  const previewEnvValues = buildPreviewEnvValues(envValues);
  const projectName = previewEnvValues[PROJECT_NAME_KEY];
  const projects = await listPagesProjects(previewEnvValues);
  const projectExists = projects.some(project => getPagesProjectName(project) === projectName);

  if (!projectExists) {
    runWrangler(
      [
        ...PROJECT_CREATE_COMMAND,
        projectName,
        PRODUCTION_BRANCH_OPTION,
        previewEnvValues[BRANCH_KEY]
      ],
      previewEnvValues
    );
  } else {
    console.log(`Projeto Pages preview já existe: ${projectName}`);
  }

  await ensurePagesNotFoundHandling(previewEnvValues);
}

function deploy(envValues) {
  validateEnvironment(envValues);
  runWrangler(
    [
      ...PAGES_DEPLOY_COMMAND,
      envValues[OUTPUT_DIR_KEY],
      PROJECT_NAME_OPTION,
      envValues[PROJECT_NAME_KEY],
      BRANCH_OPTION,
      envValues[BRANCH_KEY],
      SKIP_CACHING_OPTION
    ],
    envValues
  );
}

function deployPreview(envValues) {
  validatePreviewEnvironment(envValues);
  const previewEnvValues = buildPreviewEnvValues(envValues);
  runWrangler(
    [
      ...PAGES_DEPLOY_COMMAND,
      previewEnvValues[OUTPUT_DIR_KEY],
      PROJECT_NAME_OPTION,
      previewEnvValues[PROJECT_NAME_KEY],
      BRANCH_OPTION,
      previewEnvValues[BRANCH_KEY],
      SKIP_CACHING_OPTION
    ],
    previewEnvValues
  );
}

async function ensurePreviewDomain(envValues) {
  validatePreviewEnvironment(envValues);
  const previewEnvValues = buildPreviewEnvValues(envValues);
  return ensureDomain(previewEnvValues);
}

async function ensurePreviewDns(envValues) {
  validatePreviewEnvironment(envValues);
  const previewEnvValues = buildPreviewEnvValues(envValues);

  try {
    return await ensureDnsRecord(previewEnvValues);
  } catch (error) {
    if (!isCloudflareAuthenticationError(error)) {
      throw error;
    }

    console.log(
      `WARN preview DNS API sem permissão; mantendo domínio Pages ${previewEnvValues[CUSTOM_DOMAIN_KEY]}.`,
    );
  }
}

async function verifyPreviewIndex(envValues) {
  validatePreviewEnvironment(envValues);
  const previewEnvValues = buildPreviewEnvValues(envValues);

  try {
    return await verifyPublicIndex(previewEnvValues);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const shouldFallback =
      message.includes('fetch failed') ||
      message.includes('ainda não serve o build local') ||
      message.includes('Não foi possível ler');

    if (!shouldFallback) {
      throw error;
    }

    const fallbackEnvValues = {
      ...previewEnvValues,
      [CUSTOM_DOMAIN_KEY]: buildPagesDevHost(previewEnvValues),
    };

    console.log(
      `WARN preview index via ${previewEnvValues[CUSTOM_DOMAIN_KEY]} indisponível; ` +
        `verificando ${buildPagesDevUrl(previewEnvValues)}`,
    );
    return verifyPublicIndex(fallbackEnvValues);
  }
}

async function verifyPreviewStaleBundle404(envValues) {
  validatePreviewEnvironment(envValues);
  const previewEnvValues = buildPreviewEnvValues(envValues);

  try {
    await verifyStaleBundle404(previewEnvValues);
    await verifyPublishedBundleMimeTypes(previewEnvValues);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('fetch failed')) {
      throw error;
    }

    const fallbackEnvValues = {
      ...previewEnvValues,
      [CUSTOM_DOMAIN_KEY]: buildPagesDevHost(previewEnvValues),
    };

    console.log(
      `WARN preview stale bundle via ${previewEnvValues[CUSTOM_DOMAIN_KEY]} indisponível; ` +
        `verificando ${buildPagesDevUrl(previewEnvValues)}`,
    );
    await verifyStaleBundle404(fallbackEnvValues);
    await verifyPublishedBundleMimeTypes(fallbackEnvValues);
  }
}

async function run() {
  const command = process.argv[COMMAND_INDEX] || DEFAULT_COMMAND;
  const envValues = loadEnvironment();

  if (!COMMANDS.has(command)) {
    throw new Error(`Comando inválido: ${command}`);
  }

  if (command === 'env-check') {
    printEnvCheck(envValues);
    return;
  }

  if (command === 'whoami') {
    validateEnvironment(envValues);
    runWrangler(WHOAMI_COMMAND, envValues);
    return;
  }

  if (command === 'project-list') {
    validateEnvironment(envValues);
    runWrangler(PROJECT_LIST_COMMAND, envValues);
    return;
  }

  if (command === 'ensure-project') {
    await ensureProject(envValues);
    return;
  }

  if (command === 'ensure-preview-project') {
    await ensurePreviewProject(envValues);
    return;
  }

  if (command === 'zone-check') {
    await listZones(envValues);
    return;
  }

  if (command === 'dns-state') {
    await listDnsRecords(envValues);
    return;
  }

  if (command === 'ensure-dns') {
    await ensureDnsRecord(envValues);
    return;
  }

  if (command === 'ensure-preview-dns') {
    await ensurePreviewDns(envValues);
    return;
  }

  if (command === 'domain-list') {
    await listDomains(envValues);
    return;
  }

  if (command === 'ensure-domain') {
    await ensureDomain(envValues);
    return;
  }

  if (command === 'ensure-preview-domain') {
    await ensurePreviewDomain(envValues);
    return;
  }

  if (command === 'redirect-state') {
    await printRedirectState(envValues);
    return;
  }

  if (command === 'ensure-pages-dev-redirect') {
    await ensurePagesDevRedirect(envValues);
    return;
  }

  if (command === 'purge-public-cache') {
    await purgePublicCache(envValues);
    return;
  }

  if (command === 'verify-public-index') {
    await verifyPublicIndex(envValues);
    return;
  }

  if (command === 'verify-preview-index') {
    await verifyPreviewIndex(envValues);
    return;
  }

  if (command === 'verify-stale-bundle-404') {
    await verifyStaleBundle404(envValues);
    await verifyPublishedBundleMimeTypes(envValues);
    return;
  }

  if (command === 'verify-preview-stale-bundle-404') {
    await verifyPreviewStaleBundle404(envValues);
    return;
  }

  if (command === 'deploy-preview') {
    deployPreview(envValues);
    return;
  }

  deploy(envValues);
}

function isDirectInvocation() {
  const scriptPath = process.argv[SCRIPT_PATH_INDEX];

  return Boolean(scriptPath) && fileURLToPath(import.meta.url) === resolve(scriptPath);
}

export const __testables = {
  readLocalPublicIndexExpectation,
  buildPublicIndexCheckUrl,
  isPublicIndexCurrent,
  buildPublicIndexMismatchMessage,
  buildNotFoundHandlingDeploymentConfigs,
  hasRequiredNotFoundHandling,
  buildStaleBundleProbeUrl,
  isStaleBundleProbeValid,
  buildStaleBundleProbeMismatchMessage,
  isExpectedBundleContentType,
  extractBundlePathsFromIndexHtml
};

if (isDirectInvocation()) {
  run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
