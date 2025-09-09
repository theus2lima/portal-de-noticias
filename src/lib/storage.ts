// Sistema de armazenamento local
export class LocalStorage {
  private static prefix = 'news-portal-';

  static set(key: string, value: any): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return defaultValue || null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
}

// Tipos de dados
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  authorId: string;
  author?: User;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  commentsCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  articlesCount: number;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  adminEmail: string;
  contactEmail: string;
  smtpServer: string;
  smtpPort: number;
  encryption: 'tls' | 'ssl';
  twoFactorAuth: boolean;
  googleLogin: boolean;
  captcha: boolean;
  sessionTimeout: number;
  articlesPerPage: number;
  allowComments: boolean;
  moderateComments: boolean;
  newsletter: boolean;
  colorScheme: string;
  font: string;
  darkMode: boolean;
  animations: boolean;
  emailNewArticles: boolean;
  emailNewComments: boolean;
  emailNewLeads: boolean;
  pushSystemUpdates: boolean;
  pushWeeklyReports: boolean;
  pushSecurityAlerts: boolean;
}

// Utilitários para gerar IDs únicos
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utilitários para gerar slugs
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Dados iniciais padrão
export const getDefaultSettings = (): Settings => ({
  siteName: 'Portal de Notícias',
  siteDescription: 'Seu portal de notícias mais confiável',
  siteUrl: 'https://portal-noticias.com',
  adminEmail: 'admin@portal-noticias.com',
  contactEmail: 'contato@portal-noticias.com',
  smtpServer: 'smtp.gmail.com',
  smtpPort: 587,
  encryption: 'tls',
  twoFactorAuth: false,
  googleLogin: true,
  captcha: true,
  sessionTimeout: 120,
  articlesPerPage: 15,
  allowComments: true,
  moderateComments: true,
  newsletter: true,
  colorScheme: 'default',
  font: 'Inter',
  darkMode: false,
  animations: true,
  emailNewArticles: true,
  emailNewComments: true,
  emailNewLeads: true,
  pushSystemUpdates: false,
  pushWeeklyReports: true,
  pushSecurityAlerts: true
});

// Inicializar dados padrão se não existirem
export const initializeDefaultData = (): void => {
  if (typeof window === 'undefined') return;

  // Configurações padrão
  if (!LocalStorage.get('settings')) {
    LocalStorage.set('settings', getDefaultSettings());
  }

  // Usuário admin padrão
  if (!LocalStorage.get('users')) {
    const adminUser: User = {
      id: 'admin-001',
      name: 'Administrador',
      email: 'admin@portal-noticias.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    LocalStorage.set('users', [adminUser]);
  }

  // Categorias padrão
  if (!LocalStorage.get('categories')) {
    const defaultCategories: Category[] = [
      {
        id: 'cat-001',
        name: 'Notícias Gerais',
        slug: 'noticias-gerais',
        description: 'Notícias gerais e acontecimentos',
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        articlesCount: 0
      },
      {
        id: 'cat-002',
        name: 'Tecnologia',
        slug: 'tecnologia',
        description: 'Novidades do mundo da tecnologia',
        color: '#8B5CF6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        articlesCount: 0
      },
      {
        id: 'cat-003',
        name: 'Esportes',
        slug: 'esportes',
        description: 'Notícias esportivas',
        color: '#10B981',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        articlesCount: 0
      }
    ];
    LocalStorage.set('categories', defaultCategories);
  }

  // Arrays vazios para outros dados
  if (!LocalStorage.get('articles')) {
    LocalStorage.set('articles', []);
  }

  if (!LocalStorage.get('comments')) {
    LocalStorage.set('comments', []);
  }

  if (!LocalStorage.get('leads')) {
    LocalStorage.set('leads', []);
  }

  // Dados de autenticação
  if (!LocalStorage.get('currentUser')) {
    LocalStorage.set('currentUser', null);
  }
};
