// cloud/app/api/src/agents/document-type-audit.agent.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from '../openrouter/openrouter.service';
import type { DocumentType } from './document-type-classifier.agent';

interface DocumentTypeAuditRequest {
  pdfBase64: string;
  filename: string;
  extractedText: string;
  currentTipo: DocumentType;
  author?: string;
}

interface DocumentTypeAuditResult {
  tipo: DocumentType;
  previousTipo: DocumentType;
  isConsistent: boolean;
  confidence: number;
  reasoning?: string;
  needsCorrection: boolean;
}

const DOCUMENT_TYPE_AUDIT_PROMPT = `
Você receberá um documento financeiro (PDF ou imagem) e o texto extraído via OCR. Uma classificação anterior foi feita e você deve validar se está correta.

Classificação anterior: {PREVIOUS_TYPE}

Analise o documento novamente e classifique o tipo em uma das seguintes categorias:

- "fatura": Documento que apresenta uma fatura, conta ou cobrança
- "recibo": Documento que comprova pagamento ou recebimento
- "PIX": Documento relacionado a transações PIX

Responda APENAS com uma das palavras: "fatura", "recibo" ou "PIX". Se não conseguir identificar claramente, responda "null".

Formato de resposta esperado:
tipo: [fatura|recibo|PIX|null]
`.trim();

const TYPE_MAP: Record<string, DocumentType> = {
  fatura: 'fatura',
  recibo: 'recibo',
  pix: 'PIX',
  null: null,
};

@Injectable()
export class DocumentTypeAuditAgent {
  private readonly logger = new Logger(DocumentTypeAuditAgent.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async auditClassification(
    request: DocumentTypeAuditRequest,
  ): Promise<DocumentTypeAuditResult> {
    const method = 'auditClassification';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { filename: ${request.filename}, currentTipo: ${request.currentTipo} }`,
    );

    try {
      const prompt = DOCUMENT_TYPE_AUDIT_PROMPT.replace(
        '{PREVIOUS_TYPE}',
        request.currentTipo || 'null',
      );

      const response = await this.openRouterService.submitPdfBase64(
        request.pdfBase64,
        {
          prompt,
          filename: request.filename,
          context: this.buildContext(request.extractedText, request.author),
        },
      );

      const trimmed = response.trim();
      const newTipo = this.parseTypeFromResponse(trimmed);

      const isConsistent = newTipo === request.currentTipo;
      const needsCorrection = !isConsistent && newTipo !== null;

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, previousTipo: ${request.currentTipo}, newTipo: ${newTipo}, isConsistent: ${isConsistent}, needsCorrection: ${needsCorrection} }`,
      );

      return {
        tipo: newTipo,
        previousTipo: request.currentTipo,
        isConsistent,
        confidence: newTipo !== null ? 0.8 : 0.0,
        reasoning: trimmed,
        needsCorrection,
      };
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.warn(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      return {
        tipo: request.currentTipo,
        previousTipo: request.currentTipo,
        isConsistent: true,
        confidence: 0.0,
        reasoning: error instanceof Error ? error.message : String(error),
        needsCorrection: false,
      };
    }
  }

  private buildContext(extractedText: string, author?: string): string {
    const parts: string[] = [];

    if (author && author.trim()) {
      parts.push(`Autor do documento: ${author.trim()}`);
    }

    if (extractedText && extractedText.trim()) {
      parts.push(
        `Texto extraído via OCR:\n${extractedText.trim().substring(0, 1000)}`,
      );
    }

    return parts.length > 0 ? parts.join('\n\n') : '';
  }

  private parseTypeFromResponse(response: string): DocumentType {
    const normalized = response.toLowerCase().trim();

    // Procura por padrões no texto
    if (normalized.includes('tipo:')) {
      const match = normalized.match(/tipo:\s*(\w+)/);
      if (match && match[1]) {
        const type = TYPE_MAP[match[1].toLowerCase()];
        if (type !== undefined) {
          return type;
        }
      }
    }

    // Busca direta pelas palavras-chave
    for (const [key, value] of Object.entries(TYPE_MAP)) {
      if (normalized === key || normalized.includes(`"${key}"`)) {
        return value;
      }
    }

    // Busca por palavras-chave no texto
    if (/fatura|bill|invoice|conta/i.test(normalized)) {
      return 'fatura';
    }
    if (/recibo|receipt|comprovante de pagamento/i.test(normalized)) {
      return 'recibo';
    }
    if (/pix|transferência pix/i.test(normalized)) {
      return 'PIX';
    }

    return null;
  }
}
