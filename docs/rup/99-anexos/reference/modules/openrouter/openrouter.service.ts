// Caminho relativo ao projeto: src/openrouter/openrouter.service.ts
import { Injectable, Logger } from '@nestjs/common';

interface PdfOptions {
  prompt: string;
  filename?: string;
  engine?: string;
  model?: string;
  context?: string;
}

const PDF_DATA_URL_PREFIX = 'data:application/pdf;base64,';
const DEFAULT_PDF_ENGINE = 'mistral-ocr';
const DEFAULT_PDF_FILENAME = 'document.pdf';
const AUTHORIZATION_HEADER = 'Authorization';
const COOKIE_HEADER = 'Cookie';
const CONTENT_TYPE_HEADER = 'Content-Type';
const HTTP_REFERER_HEADER = 'HTTP-Referer';
const X_TITLE_HEADER = 'X-Title';
const BEARER_PREFIX = 'Bearer ';
const CONTENT_TYPE_JSON = 'application/json';
const OPENROUTER_DEFAULT_ERROR_MESSAGE = 'OpenRouter request failed.';
const OPENROUTER_EMPTY_RESPONSE_ERROR_MESSAGE =
  'OpenRouter response did not contain usable text.';
const OPENROUTER_MISSING_CREDENTIALS_ERROR_MESSAGE =
  'OpenRouter credentials are not configured. Set OPENROUTER_API_KEY or OPENROUTER_COOKIE.';
const OPENROUTER_COOKIE_AUTH_ERROR_MESSAGE = 'No cookie auth credentials found';
const OPENROUTER_UNAUTHORIZED_ERROR_MESSAGE =
  'OpenRouter rejected the provided credentials. Confirm OPENROUTER_API_KEY or supply OPENROUTER_COOKIE.';
const SEGMENT_TEXT_PROPERTY = 'text';
const OPENROUTER_INVALID_JSON_ERROR_MESSAGE =
  'OpenRouter response could not be parsed as JSON.';
const OPENROUTER_EMPTY_BODY_ERROR_MESSAGE =
  'OpenRouter response body was empty.';
const OPENROUTER_MAX_ATTEMPTS_ERROR_MESSAGE =
  'OpenRouter request failed after maximum retry attempts.';
const OPENROUTER_INVALID_JSON_RETRY_LOG_MESSAGE =
  'executeRequest: failed to parse OpenRouter response as JSON.';
const OPENROUTER_RETRY_LOG_MESSAGE =
  'executeRequest: retrying OpenRouter request after recoverable error.';
const OPENROUTER_RAW_BODY_PREVIEW_PREFIX =
  'executeRequest: raw OpenRouter response preview=';
const OPENROUTER_ATTEMPT_LABEL = ' attempt=';
const OPENROUTER_STATUS_LABEL = ', status=';
const OPENROUTER_RETRY_CAUSE_SEPARATOR = ' Cause: ';
const OPENROUTER_REQUEST_MAX_ATTEMPTS = 3;
const OPENROUTER_REQUEST_RETRY_DELAY_MS = 1500;
const OPENROUTER_RAW_BODY_PREVIEW_LIMIT = 512;
const TYPE_ERROR_NAME = 'TypeError';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly baseUrl =
    process.env.OPENROUTER_BASE_URL ||
    'https://openrouter.ai/app/api/v1/chat/completions';
  private readonly apiKey = (process.env.OPENROUTER_API_KEY ?? '').trim();
  private readonly cookieAuth = (process.env.OPENROUTER_COOKIE ?? '').trim();
  private readonly httpReferer = (
    process.env.OPENROUTER_HTTP_REFERER ?? ''
  ).trim();
  private readonly appTitle = (process.env.OPENROUTER_APP_TITLE ?? '').trim();
  private readonly defaultModel =
    process.env.OPENROUTER_PDF_MODEL || 'anthropic/claude-sonnet-4';
  private readonly defaultEngine =
    process.env.OPENROUTER_PDF_ENGINE || DEFAULT_PDF_ENGINE;

  async submitPdfBase64(
    pdfBase64: string,
    options: PdfOptions,
  ): Promise<string> {
    const method = 'submitPdfBase64';
    try {
      this.logger.log(`${method} ENTER`);
      const dataUrl = this.ensurePdfDataUrl(pdfBase64);
      return await this.submit(dataUrl, options);
    } catch (error) {
      this.logger.error(`${method} ERROR`, error as Error);
      throw error;
    }
  }

  private async submit(fileData: string, options: PdfOptions): Promise<string> {
    const method = 'submit';
    const t0 = Date.now();
    const filename = options.filename ?? DEFAULT_PDF_FILENAME;
    const engine = options.engine ?? this.defaultEngine;
    const model = options.model ?? this.defaultModel;

    this.logger.log(`${method} ENTER, { model: ${model}, engine: ${engine} }`);

    const content = [
      { type: 'text', text: options.prompt },
      { type: 'file', file: { filename, file_data: fileData } },
    ];

    if (options.context && options.context.trim().length > 0) {
      content.push({ type: 'text', text: options.context });
    }

    const messages = [
      {
        role: 'user',
        content,
      },
    ];

    const plugins = [
      {
        id: 'file-parser',
        pdf: { engine },
      },
    ];

    const payload = { model, messages, plugins };

    try {
      const { result, data } = await this.executeRequest(payload);
      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, resultLength: ${result.length} }`,
      );
      this.logger.debug(`${method} response data: ${JSON.stringify(data)}`);
      return result;
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.error(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      throw error;
    }
  }

  private async executeRequest(
    payload: Record<string, unknown>,
  ): Promise<{ result: string; data: unknown }> {
    const headers = this.buildHeaders();

    let lastError: Error | undefined;

    for (
      let attempt = 1;
      attempt <= OPENROUTER_REQUEST_MAX_ATTEMPTS;
      attempt += 1
    ) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data: any = await this.parseResponseData(response, attempt);

        if (!response.ok) {
          const errorMessage = this.extractOpenRouterError(
            data,
            response.status,
          );
          throw new Error(errorMessage);
        }

        const result = this.normalizeMessageContent(
          data?.choices?.[0]?.message?.content,
        );

        if (!result) {
          throw new Error(OPENROUTER_EMPTY_RESPONSE_ERROR_MESSAGE);
        }

        return { result, data };
      } catch (error) {
        const normalizedError = this.normalizeError(error);
        lastError = normalizedError;

        if (this.isRetryableError(normalizedError)) {
          if (attempt < OPENROUTER_REQUEST_MAX_ATTEMPTS) {
            this.logger.warn(
              `${OPENROUTER_RETRY_LOG_MESSAGE}${OPENROUTER_ATTEMPT_LABEL}${attempt}`,
              normalizedError,
            );
            await this.delay(OPENROUTER_REQUEST_RETRY_DELAY_MS);
            continue;
          }

          const aggregatedMessage = `${OPENROUTER_MAX_ATTEMPTS_ERROR_MESSAGE}${OPENROUTER_RETRY_CAUSE_SEPARATOR}${normalizedError.message}`;
          const aggregatedError = new Error(aggregatedMessage);
          this.logger.error(aggregatedMessage, normalizedError);
          throw aggregatedError;
        }

        throw normalizedError;
      }
    }

    throw lastError ?? new Error(OPENROUTER_MAX_ATTEMPTS_ERROR_MESSAGE);
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
    };

    if (this.apiKey.length > 0) {
      headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX}${this.apiKey}`;
    }

    if (this.cookieAuth.length > 0) {
      headers[COOKIE_HEADER] = this.cookieAuth;
    }

    if (this.httpReferer.length > 0) {
      headers[HTTP_REFERER_HEADER] = this.httpReferer;
    }

    if (this.appTitle.length > 0) {
      headers[X_TITLE_HEADER] = this.appTitle;
    }

    if (!headers[AUTHORIZATION_HEADER] && !headers[COOKIE_HEADER]) {
      throw new Error(OPENROUTER_MISSING_CREDENTIALS_ERROR_MESSAGE);
    }

    return headers;
  }

  private async parseResponseData(
    response: Response,
    attempt: number,
  ): Promise<any> {
    const rawBody = await response.text();
    const trimmedBody = rawBody.trim();

    if (trimmedBody.length === 0) {
      throw new Error(OPENROUTER_EMPTY_BODY_ERROR_MESSAGE);
    }

    try {
      return JSON.parse(trimmedBody);
    } catch (error) {
      this.logger.warn(
        `${OPENROUTER_INVALID_JSON_RETRY_LOG_MESSAGE}${OPENROUTER_ATTEMPT_LABEL}${attempt}${OPENROUTER_STATUS_LABEL}${response.status}`,
        error as Error,
      );
      const preview = trimmedBody.slice(0, OPENROUTER_RAW_BODY_PREVIEW_LIMIT);
      this.logger.debug(`${OPENROUTER_RAW_BODY_PREVIEW_PREFIX}${preview}`);
      throw new Error(OPENROUTER_INVALID_JSON_ERROR_MESSAGE);
    }
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }

  private isRetryableError(error: Error): boolean {
    if (error.name === TYPE_ERROR_NAME) {
      return true;
    }

    return (
      error.message === OPENROUTER_INVALID_JSON_ERROR_MESSAGE ||
      error.message === OPENROUTER_EMPTY_BODY_ERROR_MESSAGE
    );
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  private extractOpenRouterError(data: any, status?: number): string {
    const errorNode = data?.error;

    if (typeof errorNode === 'string' && errorNode.trim().length > 0) {
      return this.normalizeOpenRouterErrorMessage(errorNode.trim());
    }

    const nestedMessage =
      typeof errorNode?.message === 'string' ? errorNode.message.trim() : '';

    if (nestedMessage.length > 0) {
      return this.normalizeOpenRouterErrorMessage(nestedMessage);
    }

    if (typeof status === 'number') {
      return `${OPENROUTER_DEFAULT_ERROR_MESSAGE} Status: ${status}.`;
    }

    return OPENROUTER_DEFAULT_ERROR_MESSAGE;
  }

  private normalizeOpenRouterErrorMessage(message: string): string {
    if (message === OPENROUTER_COOKIE_AUTH_ERROR_MESSAGE) {
      return OPENROUTER_UNAUTHORIZED_ERROR_MESSAGE;
    }

    return message;
  }

  private normalizeMessageContent(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((segment) => {
          if (typeof segment === 'string') {
            return segment;
          }

          if (
            segment &&
            typeof segment === 'object' &&
            typeof (segment as Record<string, unknown>)[
              SEGMENT_TEXT_PROPERTY
            ] === 'string'
          ) {
            return (segment as Record<string, unknown>)[
              SEGMENT_TEXT_PROPERTY
            ] as string;
          }

          return '';
        })
        .filter((part) => part && part.length > 0)
        .join('');
    }

    return '';
  }

  private ensurePdfDataUrl(pdfData: string): string {
    if (!pdfData) {
      this.logger.warn('ensurePdfDataUrl: pdfData is empty or null.');
      return PDF_DATA_URL_PREFIX;
    }

    const trimmed = pdfData.trim();

    if (trimmed.startsWith(PDF_DATA_URL_PREFIX)) {
      this.logger.log(
        'ensurePdfDataUrl: PDF data already has data URL prefix.',
      );
      return trimmed;
    }

    this.logger.log('ensurePdfDataUrl: Adding PDF data URL prefix.');
    return `${PDF_DATA_URL_PREFIX}${trimmed}`;
  }
}
