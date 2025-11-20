import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvValidatorService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Aguardar um pouco para garantir que todas as configurações foram carregadas
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    console.log('🔍 Validando configuração de ambiente...');

    const missing: string[] = [];
    const warnings: string[] = [];

    // Verificar variáveis obrigatórias
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI',
    ];

    requiredVars.forEach((key) => {
      if (!this.configService.get(`env.${this.getConfigKey(key)}`)) {
        missing.push(key);
      }
    });

    this.validateOpenRouterCredentials(missing);

    // Verificar variáveis importantes com avisos
    const importantVars = ['GOOGLE_REFRESH_TOKEN'];

    importantVars.forEach((key) => {
      if (!this.configService.get(`env.${this.getConfigKey(key)}`)) {
        warnings.push(key);
      }
    });

    // Exibir resultados
    if (missing.length > 0) {
      console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
      missing.forEach((key) => console.error(`   - ${key}`));
      throw new Error('Variáveis de ambiente obrigatórias não definidas');
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Variáveis importantes não definidas:');
      warnings.forEach((key) => console.warn(`   - ${key}`));
    }

    // Verificar configurações específicas
    this.validateRateLimiting();

    console.log('✅ Validação de ambiente concluída com sucesso!');
  }

  private getConfigKey(envKey: string): string {
    const mapping: Record<string, string> = {
      OPENROUTER_API_KEY: 'openrouterApiKey',
      OPENROUTER_COOKIE: 'openrouterCookie',
      OPENROUTER_HTTP_REFERER: 'openrouterHttpReferer',
      OPENROUTER_APP_TITLE: 'openrouterAppTitle',
      GOOGLE_CLIENT_ID: 'googleClientId',
      GOOGLE_CLIENT_SECRET: 'googleClientSecret',
      GOOGLE_REDIRECT_URI: 'googleRedirectUri',
      GOOGLE_REFRESH_TOKEN: 'googleRefreshToken',
    };

    return mapping[envKey] || envKey.toLowerCase();
  }

  private validateRateLimiting(): void {
    const llmLimit = this.configService.get('env.nginxRateLimitLlm');
    const generalLimit = this.configService.get('env.nginxRateLimitGeneral');

    console.log('📊 Rate Limiting configurado:');
    console.log(`   - LLM: ${llmLimit}`);
    console.log(`   - Geral: ${generalLimit}`);
  }

  private validateOpenRouterCredentials(missing: string[]): void {
    const apiKey = this.configService.get<string>('env.openrouterApiKey');
    const cookie = this.configService.get<string>('env.openrouterCookie');

    if (!apiKey && !cookie) {
      missing.push('OPENROUTER_API_KEY/OPENROUTER_COOKIE');
    }
  }
}
