// cloud/app/api/src/agents/document-type-classifier.agent.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from '../openrouter/openrouter.service';

export type DocumentType = 'fatura' | 'recibo' | 'PIX' | null;

interface DocumentTypeClassifierRequest {
  pdfBase64: string;
  filename: string;
  extractedText: string;
  author?: string;
}

interface DocumentTypeClassifierResult {
  tipo: DocumentType;
  confidence: number;
  reasoning?: string;
}

const DOCUMENT_TYPE_CLASSIFICATION_PROMPT = `
Você receberá um documento financeiro (PDF ou imagem) e o texto extraído via OCR. Analise o conteúdo e classifique o tipo de documento em uma das seguintes categorias:

- "fatura": Documento que apresenta uma fatura, conta ou cobrança (ex: fatura de cartão de crédito, conta de luz, conta de telefone)
- "recibo": Documento que comprova pagamento ou recebimento (ex: comprovante de pagamento, recibo de pagamento)
- "PIX": Documento relacionado a transações PIX (comprovante de transferência PIX, QR Code PIX)

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
export class DocumentTypeClassifierAgent {
  private readonly logger = new Logger(DocumentTypeClassifierAgent.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async classifyType(
    request: DocumentTypeClassifierRequest,
  ): Promise<DocumentTypeClassifierResult> {
    const method = 'classifyType';
    const t0 = Date.now();

    this.logger.log(
      `${method} ENTER, { filename: ${request.filename}, textLength: ${request.extractedText?.length || 0} }`,
    );

    try {
      const response = await this.openRouterService.submitPdfBase64(
        request.pdfBase64,
        {
          prompt: DOCUMENT_TYPE_CLASSIFICATION_PROMPT,
          filename: request.filename,
          context: this.buildContext(request.extractedText, request.author),
        },
      );

      const trimmed = response.trim();
      const tipo = this.parseTypeFromResponse(trimmed);

      const dt = Date.now() - t0;
      this.logger.log(
        `${method} EXIT, { durationMs: ${dt}, tipo: ${tipo}, filename: ${request.filename} }`,
      );

      return {
        tipo,
        confidence: tipo !== null ? 0.8 : 0.0,
        reasoning: trimmed,
      };
    } catch (error) {
      const dt = Date.now() - t0;
      this.logger.warn(
        `${method} ERROR, ${error instanceof Error ? error.stack : String(error)}, ${method} durationMs=${dt}`,
      );
      return {
        tipo: null,
        confidence: 0.0,
        reasoning: error instanceof Error ? error.message : String(error),
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
