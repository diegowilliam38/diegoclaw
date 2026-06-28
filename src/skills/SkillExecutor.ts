import fs from 'fs';
import path from 'path';

/**
 * SkillExecutor — Lê o conteúdo completo de uma skill selecionada.
 * Injeta o SKILL.md no AgentLoop apenas durante a requisição ativa.
 */
export class SkillExecutor {
  private skillsDir: string;

  constructor() {
    this.skillsDir = path.join(process.cwd(), '.agents', 'skills');
  }

  /**
   * Retorna o conteúdo completo do SKILL.md (sem frontmatter).
   * Retorna null se a skill não for encontrada.
   */
  loadSkillContent(skillName: string): string | null {
    const skillFile = path.join(this.skillsDir, skillName, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      console.warn(`[SkillExecutor] Skill não encontrada: ${skillName}`);
      return null;
    }

    const content = fs.readFileSync(skillFile, 'utf-8');

    // Remove frontmatter YAML (entre --- e ---) para enviar apenas as instruções
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\s*\n/, '');
    return withoutFrontmatter.trim();
  }
}
