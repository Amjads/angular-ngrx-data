import { EntityMetadataMap, PropsFilterFnFactory } from 'ngrx-data';

import { Hero, Villain } from '../core/model';

/////////
// AOT obliges us to encapsulate the logic in wrapper functions
export function sortByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

/**
 * Returns the `id` property value as the primary key for any entity with an `id` property.
 * This function is a demonstration.
 * It isn't necessary because `id` is the primary key property by default.
 */
export function selectId<T extends { id: any }>(entity: T) {
  return entity.id;
}

/** Filter for entities whose name matches the case-insensitive pattern */
export function nameFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory(['name'])(entities, pattern);
}

/** Filter for entities whose name or saying matches the case-insensitive pattern */
export function nameAndSayingFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory(['name', 'saying'])(entities, pattern);
}
////////////

export const entityMetadata: EntityMetadataMap = {
  Hero: {
    entityName: 'Hero', // required for minification
    selectId, // not necessary but shows you can supply a function
    sortComparer: sortByName,
    filterFn: nameFilter
  },
  Villain: {
    entityName: 'Villain', // required for minification
    filterFn: nameAndSayingFilter
  }
};

export const pluralNames = {
  // Case matters. Match the case of the entity name.
  Hero: 'Heroes'
};
