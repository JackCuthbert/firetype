# firetype

[![NPM Version](https://img.shields.io/npm/v/firetype)](https://www.npmjs.com/package/firetype)
[![Release](https://github.com/JackCuthbert/firetype/workflows/Release/badge.svg)](https://github.com/JackCuthbert/firetype/actions?query=workflow%3ARelease)
[![Test](https://github.com/JackCuthbert/firetype/workflows/Test/badge.svg)](https://github.com/JackCuthbert/firetype/actions?query=workflow%3ATest)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

ORM for TypeScript and Google Cloud Firestore.

## Usage

Firetype requires TypeScript to work as intended.

```
npm install -D typescript
```

Install the `firetype` and `@google-cloud/firestore` packages.

```
npm install firetype @google-cloud/firestore
```

Create an interface that describes your document and extends the `Entity` type.

```ts
import { Entity } from 'firetype'

interface User extends Entity {
  firstName: string
  lastName: string
}
```

The `Entity` type adds an `id` property with type `string`. This is used as the
Document ID in Cloud Firestore and inserted into the document as `id`.

Use the base repository with built-in methods.

```ts
import { Repository } from 'firetype'
import { User } from './entity/User'

const userRepository = new Repository<User>('root_collection_name')

await userRepository.find('123')

await userRepository.createOrUpdate({
  id: uuidv4(),
  firstName: 'Jack',
  lastName: 'Cuthbert'
})
```

### Custom repository

Use a customm repository to add additional methods to the ORM. `this.firestore`
and `this.collection` are available for creating custom queries and operations.

```ts
import { Firestore } from '@google-cloud/firestore'
import { Repository } from 'firetype'
import { User } from './entity/User'

class TeamRepository extends Repository<User> {
  constructor (firestore?: Firestore) {
    super('root_collection_name', firestore) {
  }

  async setPremiumStatus(user: User, isPremium: boolean): Promise<User> {
    const ref = this.firestore.doc(this.createDocRef(user.id))
    const update: Partial<User> = { isPremium }
    await ref.set(update, { merge: true })
    return { ...user, ...update }
  }
}
```
