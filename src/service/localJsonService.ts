// src/services/localJsonService.ts

// ==================== GUARDAR ====================
export const savePageToLocalStorage = (pageKey: string, data: any): boolean => {
  try {
    localStorage.setItem(`page_${pageKey}`, JSON.stringify(data));
    localStorage.setItem(`page_${pageKey}_updated`, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Erro ao guardar página:', error);
    return false;
  }
};

// ==================== CARREGAR ====================
export const loadPageFromLocalStorage = (pageKey: string): any | null => {
  try {
    const saved = localStorage.getItem(`page_${pageKey}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar página:', error);
    return null;
  }
};

// ==================== VERIFICAR ====================
export const hasPageData = (pageKey: string): boolean => {
  return localStorage.getItem(`page_${pageKey}`) !== null;
};

export const getLastUpdated = (pageKey: string): string | null => {
  return localStorage.getItem(`page_${pageKey}_updated`);
};

// ==================== TODAS AS PÁGINAS ====================
export const getAllPagesData = (): Record<string, any> => {
  const pages: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('page_') && !key?.endsWith('_updated')) {
      const pageKey = key.replace('page_', '');
      const data = localStorage.getItem(key);
      if (data) {
        pages[pageKey] = JSON.parse(data);
      }
    }
  }
  return pages;
};

// ==================== INICIALIZAR ====================
export const initializeFromJson = (jsonData: any): boolean => {
  try {
    Object.entries(jsonData).forEach(([key, value]) => {
      if (!localStorage.getItem(`page_${key}`)) {
        localStorage.setItem(`page_${key}`, JSON.stringify(value));
      }
    });
    return true;
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
    return false;
  }
};

// ==================== EXPORTAR ====================
export const exportAllPages = (): void => {
  const allPages = getAllPagesData();
  const jsonStr = JSON.stringify(allPages, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `all_pages_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportSinglePage = (pageKey: string, data: any): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pageKey}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ==================== IMPORTAR ====================
export const importAllPages = (data: Record<string, any>): boolean => {
  try {
    Object.entries(data).forEach(([pageKey, pageData]) => {
      localStorage.setItem(`page_${pageKey}`, JSON.stringify(pageData));
      localStorage.setItem(`page_${pageKey}_updated`, new Date().toISOString());
    });
    return true;
  } catch (error) {
    console.error('Erro ao importar páginas:', error);
    return false;
  }
};

// ==================== LIMPAR ====================
export const clearPageData = (pageKey: string): void => {
  localStorage.removeItem(`page_${pageKey}`);
  localStorage.removeItem(`page_${pageKey}_updated`);
};

export const clearAllPagesData = (): void => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('page_')) {
      localStorage.removeItem(key);
    }
  }
};