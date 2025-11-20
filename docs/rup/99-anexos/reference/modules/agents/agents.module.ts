// src/agents/agents.module.ts
import { Global, Module } from '@nestjs/common';
import { OpenRouterModule } from '../openrouter/openrouter.module';
import { TextQualityAgent } from './text-quality.agent';
import { TextDiagnoseAgent } from './text-diagnose.agent';
import { PdfDiagnoseAgent } from './pdf-diagnose.agent';
import { ResultValidatorAgent } from './result-validator.agent';
import { ReceiptAuditAgent } from './receipt-audit.agent';
import { DocumentTypeClassifierAgent } from './document-type-classifier.agent';
import { DocumentTypeAuditAgent } from './document-type-audit.agent';

@Global()
@Module({
  imports: [OpenRouterModule],
  providers: [
    TextQualityAgent,
    TextDiagnoseAgent,
    PdfDiagnoseAgent,
    ResultValidatorAgent,
    ReceiptAuditAgent,
    DocumentTypeClassifierAgent,
    DocumentTypeAuditAgent,
  ],
  exports: [
    TextQualityAgent,
    TextDiagnoseAgent,
    PdfDiagnoseAgent,
    ResultValidatorAgent,
    ReceiptAuditAgent,
    DocumentTypeClassifierAgent,
    DocumentTypeAuditAgent,
  ],
})
export class AgentsModule {}
