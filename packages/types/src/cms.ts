export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  status: 'draft' | 'published' | 'archived';
  createdBy: number | null;
  updatedBy: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: 'draft' | 'published' | 'archived';
  createdBy: number | null;
  updatedBy: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentTemplate {
  id: number;
  typeKey: string;
  name: string;
  description: string | null;
  allowedFieldsJson: Record<string, unknown> | null;
  status: string;
}

export interface ComponentStyle {
  id: number;
  templateId: number;
  styleKey: string;
  name: string;
  description: string | null;
  previewImagePath: string | null;
  cssClass: string | null;
  status: string;
}

export interface Section {
  id: number;
  pageId: number;
  templateId: number | null;
  styleId: number | null;
  componentType: string;
  styleVariant: string;
  title: string | null;
  description: string | null;
  contentJson: Record<string, unknown>;
  sortOrder: number;
  isVisible: boolean;
  status: 'draft' | 'published' | 'archived';
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: number | null;
}

export interface CreatePageInput {
  categoryId: number;
  title: string;
  slug?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CreateSectionInput {
  templateId: number;
  styleId: number;
  componentType: string;
  styleVariant: string;
  title?: string;
  description?: string;
  contentJson?: Record<string, unknown>;
}

export interface ReorderItem {
  id: number;
  sortOrder: number;
}

export interface PageWithSections extends Page {
  sections: Section[];
  category?: Category;
}

export interface Upload {
  id: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  uploadedBy: number | null;
  createdAt: string;
}
