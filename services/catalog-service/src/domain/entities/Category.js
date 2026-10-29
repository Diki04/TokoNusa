import { ValidationError } from '@tokonusa/common';

export class Category {
  constructor({ id, name, slug, icon = 'Tag', imageUrl = null, image_url = null }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('Category name cannot be empty');
    }
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      throw new ValidationError('Category slug cannot be empty');
    }

    this.id = id;
    this.name = name.trim();
    this.slug = slug.trim();
    this.icon = icon || 'Tag';
    this.image_url = image_url || imageUrl || null;
    this.imageUrl = this.image_url;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      icon: this.icon,
      image_url: this.image_url,
      imageUrl: this.imageUrl,
    };
  }
}
