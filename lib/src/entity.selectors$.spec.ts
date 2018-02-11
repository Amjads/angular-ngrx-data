import { createFeatureSelector, createSelector, Selector, Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { EntityCache } from './interfaces';
import { EntityCollection } from './entity-definition';
import { EntityMetadata, EntityMetadataMap } from './entity-metadata';
import { PropsFilterFnFactory } from './entity-filters';
import { createEntitySelectors, EntitySelectors } from './entity.selectors';

import {
  createCachedCollectionSelector,
  EntitySelectors$,
  EntitySelectors$Factory
} from './entity.selectors$';

describe('EntitySelectors$', () => {

  /** HeroMetadata identifies extra collection state properties */
  const heroMetadata: EntityMetadata<Hero> = {
    entityName: 'Hero',
    filterFn: nameFilter,
    additionalCollectionState: {
      foo: 'Foo',
      bar: 3.14
    }
  };

  const villainMetadata: EntityMetadata<Villain> = {
    entityName: 'Villain',
    selectId: (entity: Villain) => entity.key
  }

  describe('createCachedCollectionSelector', () => {

    const initialState: HeroCollection = {
      ids: [1],
      entities: {1: {id: 1, name: 'A'}},
      filter: '',
      loading: false,
      foo: 'foo foo',
      bar: 42
    };

    const entityCacheSelector = createFeatureSelector<EntityCache>('entityCache');

    it('creates collection selector that defaults to initial state', () => {
      const selector = createCachedCollectionSelector(
        'Hero', entityCacheSelector, initialState);
      const state = { entityCache: {} }; // ngrx store with empty cache
      const collection = selector(state)
      expect(collection.entities).toEqual(initialState.entities, 'entities');
      expect(collection.foo).toEqual('foo foo', 'foo');
    });

    it('creates collection selector that defaults to the default initial state', () => {
      // must specify type-args when initialState isn't available for type inference
      const selector = createCachedCollectionSelector<Hero, HeroCollection>(
        'Hero', entityCacheSelector);
      const state = { entityCache: {} }; // ngrx store with empty cache
      const collection = selector(state)
      expect(collection.entities).toEqual({}, 'entities');
      expect(collection.foo).toBeUndefined('foo');
    });

    it('collection selector should return cached collection when it exists', () => {
      // must specify type-args when initialState isn't available for type inference
      const selector = createCachedCollectionSelector<Hero, HeroCollection>(
        'Hero', entityCacheSelector);

      // ngrx store with populated Hero collection
      const state = {
        entityCache: {
          Hero: {
            ids: [42],
            entities: {42: {id: 42, name: 'The Answer'}},
            filter: '',
            loading: true,
            foo: 'towel',
            bar: 0
          }
        }
      };

      const collection = selector(state)
      expect(collection.entities[42]).toEqual({id: 42, name: 'The Answer'}, 'entities');
      expect(collection.foo).toBe('towel', 'foo');
    });
  });

  // Hero has a super-set of EntitySelectors$
  describe('EntitySelectors$Factory.create (Hero)', () => {

    // Selectors don't change during tests
    const selectors = createEntitySelectors<Hero, HeroSelectors>(heroMetadata);

    // Some immutable cache states
    const emptyCache: EntityCache = {};

    const initializedHeroCache: EntityCache = <any> {
      // The state of the HeroCollection in this test suite
      // as the EntityReducer might initialize it.
      Hero: {ids: [], entities: {}, loading: false, filter: undefined, bar: 3.14 }
    };

    let bar: number;
    let collection: HeroCollection;
    let foo: string;
    let heroes: Hero[];
    let loading: boolean;

    // The store during tests will be the entity cache
    let store: Store<{ entityCache: EntityCache}>;

    // Observable of state changes, which these tests simulate
    let state$: BehaviorSubject<{ entityCache: EntityCache }>;

    const nextCacheState =
      (cache: EntityCache) => state$.next({ entityCache: cache });

    let factory: EntitySelectors$Factory;

    beforeEach(() => {
      state$ = new BehaviorSubject({ entityCache: emptyCache });
      store = new Store<{ entityCache: EntityCache }>(state$, null, null);
      factory = new EntitySelectors$Factory('entityCache', store);

      // listen for changes to the hero collection
      store.select('entityCache', 'Hero')
           .subscribe((c: HeroCollection) => collection = c);
    });

    function subscribeToSelectors(selectors$: HeroSelectors$) {
      selectors$.entities$.subscribe(h => heroes = h);
      selectors$.loading$.subscribe(l => loading = l);
      selectors$.foo$.subscribe(f => foo = f);
      selectors$.bar$.subscribe(b => bar = b);
    }

    it('selectors$ emit default empty values when collection is undefined', () => {
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);

      subscribeToSelectors(selectors$);

      expect(heroes).toEqual([], 'no heroes by default');
      expect(loading).toBe(false, 'loading is false by default');
      expect(foo).toBeUndefined('no default foo value');
      expect(bar).toBeUndefined('no default bar value');
    });

    it('selectors$ emit expected values for initialized Hero collection', () => {
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);

      subscribeToSelectors(selectors$);

      // prime the store for Hero first use as the EntityReducer would
      nextCacheState(initializedHeroCache);

      expect(heroes).toEqual([], 'no heroes when collection initialized');
      expect(foo).toBeUndefined('no foo when collection initialized');
      expect(bar).toEqual(3.14, 'bar has initial value');
    });

    it('selectors$ emit updated hero values', () => {
      const selectors$ = factory.create<Hero, HeroSelectors$>('Hero', selectors);

      subscribeToSelectors(selectors$);

      // prime the store for Hero first use as the EntityReducer would
      nextCacheState(initializedHeroCache);

      // set foo and add an entity as the reducer would
      collection = {
        ...collection,
        ...{
          foo: 'FooDoo',
          ids: [42],
          entities: {42: {id: 42, name: 'Bob'}}
        }
      };

      // update the store as a reducer would
      nextCacheState({ ...emptyCache, Hero: collection});

      // Selectors$ should have emitted the updated values.
      expect(heroes).toEqual([{id: 42, name: 'Bob'}], 'added a hero');
      expect(loading).toBe(false, 'loading'); // didn't change
      expect(foo).toEqual('FooDoo', 'updated foo value');
      expect(bar).toEqual(3.14, 'still the initial value'); // didn't change
    });

    it('selectors$ emit supplied defaultCollectionState when collection is undefined', () => {

      // N.B. This is an absurd default state, suitable for test purposes only.
      // The default state feature exists to prevent selectors$ subscriptions
      // from bombing before the collection is initialized or
      // during time-travel debugging.
      const defaultHeroState: HeroCollection = {
        ids: [1],
        entities: {1: {id: 1, name: 'A'}},
        filter: '',
        loading: false,
        foo: 'foo foo',
        bar: 42
      };
      const selectors$ =
        factory.create<Hero, HeroSelectors$>('Hero', selectors, defaultHeroState); // <- override default state

      subscribeToSelectors(selectors$);

      expect(heroes).toEqual([{id: 1, name: 'A'}], 'default state heroes');
      expect(foo).toEqual('foo foo', 'has default foo');
      expect(bar).toEqual(42, 'has default bar');

      // Important: the selector is returning these values;
      // They are not actually in the store's entity cache collection!
      expect(collection).toBeUndefined( 'no collection until reducer creates it.');
    });
  });

});

/////// Test values and helpers /////////

function nameFilter<T>(entities: T[], pattern: string) {
  return PropsFilterFnFactory<any>(['name'])(entities, pattern);
}

/// Hero
interface Hero {
  id: number;
  name: string;
}

/** HeroCollection is EntityCollection<Hero> with extra collection properties */
interface HeroCollection extends EntityCollection<Hero> {
  foo: string;
  bar: number;
}

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors extends EntitySelectors<Hero> {
  selectFoo: Selector<HeroCollection, string>;
  selectBar: Selector<HeroCollection, number>;
}

/** HeroSelectors identifies the extra selectors for the extra collection properties */
interface HeroSelectors$ extends EntitySelectors$<Hero> {
  foo$: Observable<string> | Store<string>;
  bar$: Observable<number> | Store<number>;
}

/// Villain
interface Villain {
  key: string;
  name: string;
}

