import fs from 'fs';
import path from 'path';

export interface SkillMetadata {
  name: string;
  description: string;
}

/**
 * SkillLoader — Lê as skills disponíveis em .agents/skills/
 * Hot-reload: lê o filesystem a cada requisição, sem cache.
 *
 * Pattern: Registry (via FS)
 */
export class SkillLoader {
  private skillsDir: string;

  constructor() {
    this.skillsDir = path.join(process.cwd(), '.agents', 'skills');
  }

  /**
   * Retorna metadados (name, description) de todas as skills instaladas.
   * Lê o frontmatter YAML do SKILL.md de cada subpasta.
   */
  loadSkills(): SkillMetadata[] {
    if (!fs.existsSync(this.skillsDir)) {
      console.warn(`[SkillLoader] Pasta de skills não encontrada: ${this.skillsDir}`);
      return [];
    }

    const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });
    const skills: SkillMetadata[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillFile = path.join(this.skillsDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillFile)) continue;

      const content = fs.readFileSync(skillFile, 'utf-8');
      const metadata = this.parseFrontmatter(content, entry.name);
      skills.push(metadata);
    }

    return skills;
  }

  private parseFrontmatter(content: string, folderName: string): SkillMetadata {
    // Regex para extrair frontmatter YAML entre ---
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return { name: folderName, description: '' };

    const yaml = match[1];
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    const descMatch = yaml.match(/^description:\s*[>|]?\s*\n?([\s\S]*?)(?=\n\w|$)/m);

    return {
      name: nameMatch?.[1]?.trim() ?? folderName,
      description: descMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
    };
  }
}
