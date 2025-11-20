// Caminho relativo ao projeto: src/agents/pdf-diagnose.agent.ts
import { Injectable } from '@nestjs/common';

const OPENAI_PDF_DIAGNOSIS_DISABLED_MESSAGE =
  'Integração com OpenAI desativada.';

@Injectable()
export class PdfDiagnoseAgent {
  constructor() {}

  async diagnose(file: Express.Multer.File): Promise<string> {
    try {
      // return await this.openai.generateDiagnosisFromPdf(
      //   file.buffer.toString('base64'),
      // ); // Integração OpenAI desativada
      return OPENAI_PDF_DIAGNOSIS_DISABLED_MESSAGE;
    } catch (error) {
      console.error('PdfDiagnoseAgent.diagnose error:', error);
      throw error;
    }
  }
}
