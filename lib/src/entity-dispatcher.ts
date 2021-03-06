import { Store } from '@ngrx/store';

import { EntityAction, EntityOp } from './entity.actions';
import { EntityCommands } from './entity-commands';
import { EntityCache, QueryParams } from './interfaces';
import { IdSelector, Update } from './ngrx-entity-models';

/**
 * Dispatches Entity-related commands to effects and reducers
 */
export class EntityDispatcher<T> implements EntityCommands<T> {
  constructor(
    /** Name of the entity type for which entities are dispatched */
    public entityName: string,
    private store: Store<EntityCache>,
    private selectId: IdSelector<T> = (entity: any) => entity.id
  ) {}

  private dispatch(op: EntityOp, payload?: any): void {
    this.store.dispatch(new EntityAction(this.entityName, op, payload));
  }

  /**
   * Convert an entity (or partial entity) into the `Update<T>` object
   * `id`: the primary key and
   * `changes`: the entity (or partial entity of changes).
   */
  private toUpdate: (entity: Partial<T>) => Update<T> = (entity: T) => ({
    id: this.selectId(entity) as string,
    changes: entity
  });

  /**
   * Save a new entity to remote storage.
   * Does not add to cache until save succeeds.
   * Ignored by cache-add if the entity is already in cache.
   */
  add(entity: T): void {
    this.dispatch(EntityOp.SAVE_ADD, entity);
  }

  /**
   * Removes entity from the cache (if it is in the cache)
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * @param entity The entity to remove
   */
  delete(entity: T): void

  /**
   * Removes entity from the cache by key (if it is in the cache)
   * and deletes entity from remote storage by key.
   * Does not restore to cache if the delete fails.
   * @param key The primary key of the entity to remove
   */
  delete(key: number | string ): void
  delete(arg: (number | string) | T): void {
    this.dispatch(EntityOp.SAVE_DELETE, this.getKey(arg));
  }

  /**
   * Query remote storage for all entities and
   * completely replace the cached collection with the queried entities.
   */
  getAll(): void {
    this.dispatch(EntityOp.QUERY_ALL);
  }

  /**
   * Query remote storage for the entity with this primary key.
   * If the server returns an entity,
   * merge it into the cached collection.
   */
  getByKey(key: any): void {
    this.dispatch(EntityOp.QUERY_BY_KEY, key);
  }

  /**
   * Query remote storage for the entities that satisfy a query expressed
   * with either a query parameter map or an HTTP URL query string.
   * and merge the results into the cached collection.
   */
  getWithQuery(queryParams: QueryParams | string): void {
    this.dispatch(EntityOp.QUERY_MANY, queryParams);
  }

  /**
   * Save the updated entity (or partial entity) to remote storage.
   * Updates the cached entity after the save succeeds.
   * Update in cache is ignored if the entity's key is not found in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  update(entity: Partial<T>): void {
    // update entity might be a partial of T but must at least have its key.
    // pass the Update<T> structure as the payload
    const update: Update<T> = this.toUpdate(entity);
    this.dispatch(EntityOp.SAVE_UPDATE, update);
  }

  /*** Cache-only operations that do not update remote storage ***/

  /**
   * Replace all entities in the cached collection.
   * Does not save to remote storage.
   */
  addAllToCache(entities: T[]): void {
    this.dispatch(EntityOp.ADD_ALL, entities);
  }

  /**
   * Add a new entity directly to the cache.
   * Does not save to remote storage.
   * Ignored if an entity with the same primary key is already in cache.
   */
  addOneToCache(entity: T): void {
    this.dispatch(EntityOp.ADD_ONE, entity);
  }

  /**
   * Add multiple new entities directly to the cache.
   * Does not save to remote storage.
   * Entities with primary keys already in cache are ignored.
   */
  addManyToCache(entities: T[]): void {
    this.dispatch(EntityOp.ADD_MANY, entities);
  }

  /** Clear the cached entity collection */
  clearCache(): void {
    this.dispatch(EntityOp.REMOVE_ALL);
  }

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   * @param entity The entity to remove
   */
  removeOneFromCache(entity: T): void

  /**
   * Remove an entity directly from the cache.
   * Does not delete that entity from remote storage.
   * @param key The primary key of the entity to remove
   */
  removeOneFromCache(key: number | string ): void
  removeOneFromCache(arg: (number | string) | T ): void {
    this.dispatch(EntityOp.REMOVE_ONE, this.getKey(arg));
  }

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   * @param entity The entities to remove
   */
  removeManyFromCache(entities: T[]): void

  /**
   * Remove multiple entities directly from the cache.
   * Does not delete these entities from remote storage.
   * @param keys The primary keys of the entities to remove
   */
  removeManyFromCache(keys: (number | string)[]): void
  removeManyFromCache(args: ((number | string)[] | T[])): void {
    if (!args || args.length === 0) { return; }
    const keys = (typeof args[0] === 'object') ?
      // if array[0] is a key, assume they're all keys
      (<T[]> args).map(arg => this.getKey(arg)) : args;
    this.dispatch(EntityOp.REMOVE_MANY, keys);
  }

  /**
   * Update a cached entity directly.
   * Does not update that entity in remote storage.
   * Ignored if an entity with matching primary key is not in cache.
   * The update entity may be partial (but must have its key)
   * in which case it patches the existing entity.
   */
  updateOneInCache(entity: Partial<T>): void {
    // update entity might be a partial of T but must at least have its key.
    // pass the Update<T> structure as the payload
    const update: Update<T> = this.toUpdate(entity);
    this.dispatch(EntityOp.UPDATE_ONE, update);
  }

  /**
   * Update multiple cached entities directly.
   * Does not update these entities in remote storage.
   * Entities whose primary keys are not in cache are ignored.
   * Update entities may be partial (but each must have its key);
   * such partial entities patch their cached counterparts.
   */
  updateManyInCache(entities: Partial<T>[]): void {
    if (!entities || entities.length === 0) { return; }
    const updates: Update<T>[] = entities.map(entity => this.toUpdate(entity));
    this.dispatch(EntityOp.UPDATE_MANY, updates);
  }

  /**
   * Set the pattern that the collection's filter applies
   * when using the `filteredEntities` selector.
   */
  setFilter(pattern: any): void {
    this.dispatch(EntityOp.SET_FILTER, pattern);
  }

  /** Get key from entity (unless arg is already a key) */
  private getKey(arg: number | string | T ) {
    return typeof arg === 'object' ? this.selectId(arg) : arg;
  }
}

/**
 * Create an `EntityDispatcher` for an entity type `T` and store
 * Can replace this function with a richer dispatcher by
 * providing alternative with the `CREATE_ENTITY_DISPATCHER_TOKEN`.
 */
export function createEntityDispatcher<T, D extends EntityDispatcher<T> = EntityDispatcher<T>>(
  /** Name of the entity type */
  entityName: string,
  /** The runtime `EntityCache` store */
  store: Store<EntityCache>,
  /**
   * Function that returns the primary key for an entity `T`.
   * Usually acquired from `EntityDefinition` metadata.
   */
  selectId: IdSelector<T> = ((entity: any) => entity.id)
): D { return <D> new EntityDispatcher<T>(entityName, store, selectId)}
