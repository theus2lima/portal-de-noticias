/**
 * Configuração de emojis e templates para compartilhamento no WhatsApp
 * Baseado no roadmap para implementar compartilhamento personalizado por categoria
 */

export interface CategoryConfig {
  emoji: string;
  name: string;
  color: string;
}

export const WHATSAPP_CATEGORIES: Record<string, CategoryConfig> = {
  'Política': {
    emoji: '🏤',
    name: 'Política',
    color: 'bg-primary-900'
  },
  'Economia': {
    emoji: '💰',
    name: 'Economia', 
    color: 'bg-secondary-600'
  },
  'Esportes': {
    emoji: '⚽',
    name: 'Esportes',
    color: 'bg-accent-500'
  },
  'Cultura': {
    emoji: '🎨',
    name: 'Cultura',
    color: 'bg-primary-500'
  },
  'Cidades': {
    emoji: '🏠',
    name: 'Cidades',
    color: 'bg-secondary-700'
  },
  'Tecnologia': {
    emoji: '💻',
    name: 'Tecnologia',
    color: 'bg-primary-600'
  },
  'Educação': {
    emoji: '📚',
    name: 'Educação',
    color: 'bg-blue-600'
  },
  'Meio Ambiente': {
    emoji: '🌱',
    name: 'Meio Ambiente',
    color: 'bg-green-600'
  },
  'Saúde': {
    emoji: '❤️',
    name: 'Saúde',
    color: 'bg-red-600'
  },
  'Segurança': {
    emoji: '🚔',
    name: 'Segurança',
    color: 'bg-gray-700'
  },
  'Turismo': {
    emoji: '🏖️',
    name: 'Turismo',
    color: 'bg-purple-600'
  },
  'Entretenimento': {
    emoji: '🎬',
    name: 'Entretenimento',
    color: 'bg-pink-600'
  }
};

/**
 * Obtém emoji para uma categoria
 */
export function getCategoryEmoji(categoryName: string): string {
  const category = WHATSAPP_CATEGORIES[categoryName];
  return category?.emoji || '📰'; // emoji padrão para notícias
}

/**
 * Obtém configuração completa de uma categoria
 */
export function getCategoryConfig(categoryName: string): CategoryConfig {
  return WHATSAPP_CATEGORIES[categoryName] || {
    emoji: '📰',
    name: categoryName || 'Notícias',
    color: 'bg-primary-900'
  };
}

/**
 * Template simples para mensagem do WhatsApp
 * Formato simplificado: apenas título + call-to-action + link (igual ao Diário do Noroeste)
 */
export function generateWhatsAppMessage(
  title: string,
  summary: string,
  url: string,
  categoryName: string
): string {
  const message = `${title}

Leia a notícia completa: ${url}`;

  return message;
}

/**
 * Codifica mensagem para URL do WhatsApp usando abordagem mais simples
 */
export function encodeWhatsAppMessage(message: string): string {
  // Usar encodeURIComponent que é mais confiável para URLs
  return encodeURIComponent(message)
}

/**
 * Gera URL completa para compartilhamento no WhatsApp
 */
export function generateWhatsAppShareURL(
  title: string,
  summary: string,
  url: string,
  categoryName: string
): string {
  const message = generateWhatsAppMessage(title, summary, url, categoryName);
  const encodedMessage = encodeWhatsAppMessage(message);
  return `https://wa.me/?text=${encodedMessage}`;
}
