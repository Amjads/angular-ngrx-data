# Ngrx-data FAQs

<a name="entity"></a>
## What is an _entity_?

An **_entity_** is an object with _long-lived data values_ that you read from and write to a database.

>Operations that access the database are called **_persistence_** operations.

An _entity_ refers to some "thing" in the application domain, such as a customer. 
Such things are unique even as their values change. Accordingly each entity has a unique **_primary key_**, also called its **_identifier_**.

Each _entity_ object is an instance of an **_entity type_**. That type could be represented explicitly as a class or an interface. Or it could just be a bag of data.

To manage entities with _ngrx-data_, you describe each entity type with [**_entity metadata_**](docs/entity-metadata).

The application's **_entity model_** is the set of all entity types in your application that are described with _entity metadata_.

In some definitions, the _entity type_ and _entity model_ describe both the data and the _logic_ that govern that data such as data integrity rules (e.g., validations) and behaviors (e.g., calculations). The _current version_ of _ngrx-data_ library is unaware of entity logic beyond what is strictly necessary to persist entity data values.

<a name="no-panacea"></a>
## Is _ngrx-data_ the answer for everything?

**_No!_**
The _ngrx-data_ library is narrowly focused on a single objective:
to simplify management of [_entity data_](#entity).

Entity data are a particularly opportune target for simplification
because they appear in high volume in many applications and
the sheer number of _similar-but-different_ ngrx code artifacts necessary to manage that data is daunting.

Anything we can do to shrink entity management code and to leverage the commonalities across entity types will repay the effort handsomely.

But _entity data_ is only _one_ kind of application data.

Configuration data, user roles, the user's prior selections, the current state of screen layouts ...
these are all important and highly idiosyncratic data that can benefit from
custom coding with standard _ngrx_ techniques.

Data streamed from remote sources such as trading systems,
mobile asset tracking systems, and IoT devices are not entity data
and may not be a good fit for the _ngrx-data_ library.
They are still worth managing with _ngrx_.

It bears repeating: the _ngrx-data_ library is good for
querying, caching, and saving _entity data_ ... and that's it.

<a name="ngrx"></a>
## What is _ngrx_?

[Ngrx](https://github.com/ngrx/platform/blob/master/README.md) is a collection of libraries for writing Angular applications in a "reactive style" that combines the
[redux](#redux) pattern and tools with [RxJS Observables](#rxjs). 

The `ngrx-data` library builds upon three _ngrx_ libraries: 
[@ngrx/store](https://github.com/ngrx/platform/blob/master/docs/store/README.md),
[@ngrx/effects](https://github.com/ngrx/platform/blob/master/docs/effects/README.md), and
[@ngrx/entity](https://github.com/ngrx/platform/blob/master/docs/entity/README.md)

<a name="redux"></a>
## What is _redux_?

[Redux](https://redux.js.org/) is an implementation of a pattern for managing application [state](#state) in a web client application.

It is notable for:

* Holding all _shared state_ as objects in a single, central _store_.

* All objects in the store are [_immutable_](https://en.wikipedia.org/wiki/Immutable_object).
You never directly set any property of any object held in a redux store.

* You update the store by _dispatching actions_ to the store.

* An _action_ is like a message. It always has a _type_. It often has a _payload_ which is the data for that message.

* Action instances are immutable

* Action instances are serializable (because the redux dev tools demand it and we should be able to persist them to local browser storage between user sessions);

* All store values are immutable and serializable.

* _actions_ sent to the store are processed by _reducers_. A reducer may update the store by replacing old objects in the store with new objects that have the updated state.

* All _reducers_ are “pure” functions.
They have no side-effects.

* The store publishes an _event_ when updated by a reducer.

* You application listens for store _events_; when it hears an event of interest, the app pulls the corresponding object(s) from the store.

_Ngrx_ is similar in almost all important respects.
It differs most significantly in replacing _events_ with _observables_.

_Ngrx_ relies on 
[RxJS Observables](#rxjs) to listen for store events, select those that matter, and push the selected object(s) to your application.

<a name="state"></a>
## What is _state_?

_State_ is data. 
Applications have several kinds of state including:

* _application_ state is _session_ data that determine how your application works. Filter values and router configurations are examples of _application_ state.

* _persistent_ state is "permanent" data that you store in a remote database. [Entities](#entity) are a prime example of _persistent_ state. 

* _shared_ state is data that are shared among application components and services.

In _ngrx_, as in the redux pattern, all stored state is (or should be) _immutable_.
You never change the properties of objects in the store.
You replace them with new objects, created through a merge of the previous property values and new property values.

Arrays are completely replaced with you add, remove, or replace any of their items.

<a name="rxjs"></a>
## What are _RxJS Observables_"

[RxJS Observables](http://reactivex.io/rxjs/) is a library for programming in a "reactive style".

Many Angular APIs produce _RxJS Observables_ so programming "reactively" with _Observables_ is familiar to many Angular developers. Search the web for many helpful resources on _RxJS_.

<a name="code-generation"></a>
## What's wrong with code generation?

Some folks try to conquer the "too much boilerplate" problem by generating the code.

Adding the `Foo` entity type? Run a code generator to produce  _actions_, _action-creators_, _reducers_, _effects_, _dispatchers_, and _selectors_ for `Foo`.
Run another one to product the service that makes HTTP GET, PUT, POST, and DELETE calls for `Foo`.

Maybe it generates canned tests for them too.

Now you have ten (or more) new files for `Foo`. Multiply that by a 100 entity model and you have 1000 files. Cool!

Except you're responsible for everyone of those files. Overtime you're bound to modify some of them to satisfy some peculiarity of the type.

Then there is a bug fix or a new feature or a new way to generate some of these files. It's your job to upgrade them. Which ones did you change? Why?

Good luck!
