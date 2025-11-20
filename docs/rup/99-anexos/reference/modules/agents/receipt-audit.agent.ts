// cloud/app/api/src/agents/receipt-audit.agent.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from '../openrouter/openrouter.service';
import {
  EXTRACTION_STATUS_ORIGINAL,
  EXTRACTION_STATUS_VERIFIED,
  EXTRACTION_CLASSIFICATION_TRUSTED,
  EXTRACTION_CLASSIFICATION_UNREAL,
  ExtractionStatus,
  ExtractionClassification,
} from '../constants/whatsapp.constants';

interface ReceiptAuditRequest {
  pdfBase64: string;
  filename: string;
  primaryText: string;
  author?: string;
}

interface ReceiptAuditResult {
  status: ExtractionStatus;
  classification: ExtractionClassification;
  correctedText: string;
}

const RECEIPT_AUDIT_PROMPT = `
Você irá receber novamente um comprovante financeiro em PDF. Extraia o texto na íntegra, mantendo a ordem das informações, sem adicionar explicações. Responda apenas com o texto puro, sem adornos ou comentários.
`.trim();
const AUDIT_SIMILARITY_THRESHOLD = 0.65;
const WORD_SEPARATOR_REGEX = /\s+/g;
const NORMALIZE_REGEX = /[^\p{L}\p{N}]+/gu;

@Injectable()
export class ReceiptAuditAgent {
  private readonly logger = new Logger(ReceiptAuditAgent.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async auditExtraction(
    request: ReceiptAuditRequest,
  ): Promise<ReceiptAuditResult> {
    const method = 'auditExtraction';
    const normalizedPrimary = this.normalizeText(request.primaryText);

    if (!normalizedPrimary) {
      return {
        status: EXTRACTION_STATUS_ORIGINAL,
        classification: null,
        correctedText: request.primaryText,
      };
    }

    try {
      const response = await this.openRouterService.submitPdfBase64(
        request.pdfBase64,
        {
          prompt: RECEIPT_AUDIT_PROMPT,
          filename: request.filename,
          context: this.buildContext(request.author),
        },
      );

      const trimmed = response.trim();
      const normalizedAudit = this.normalizeText(trimmed);

      if (!normalizedAudit) {
        return {
          status: EXTRACTION_STATUS_VERIFIED,
          classification: EXTRACTION_CLASSIFICATION_UNREAL,
          correctedText: trimmed,
        };
      }

      const similarity = this.computeSimilarity(
        normalizedPrimary,
        normalizedAudit,
      );

      if (similarity >= AUDIT_SIMILARITY_THRESHOLD) {
        return {
          status: EXTRACTION_STATUS_VERIFIED,
          classification: EXTRACTION_CLASSIFICATION_TRUSTED,
          correctedText: trimmed,
        };
      }

      return {
        status: EXTRACTION_STATUS_VERIFIED,
        classification: EXTRACTION_CLASSIFICATION_UNREAL,
        correctedText: trimmed,
      };
    } catch (error) {
      this.logger.warn(
        `${method}: falha ao executar auditoria da extração.`,
        error instanceof Error ? error : new Error(String(error)),
      );
      return {
        status: EXTRACTION_STATUS_ORIGINAL,
        classification: null,
        correctedText: request.primaryText,
      };
    }
  }

  private buildContext(author?: string): string | undefined {
    const normalized = author?.trim();
    return normalized && normalized.length > 0
      ? `Autor identificado na conversa: ${normalized}`
      : undefined;
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFKD')
      .replace(NORMALIZE_REGEX, ' ')
      .trim()
      .toLowerCase();
  }

  private computeSimilarity(a: string, b: string): number {
    if (!a || !b) {
      return 0;
    }

    if (a === b) {
      return 1;
    }

    const tokensA = new Set(a.split(WORD_SEPARATOR_REGEX).filter(Boolean));
    const tokensB = new Set(b.split(WORD_SEPARATOR_REGEX).filter(Boolean));

    if (tokensA.size === 0 || tokensB.size === 0) {
      return 0;
    }

    let intersection = 0;
    tokensA.forEach((token) => {
      if (tokensB.has(token)) {
        intersection += 1;
      }
    });

    const union = tokensA.size + tokensB.size - intersection;
    return union === 0 ? 0 : intersection / union;
  }
}
