# firetype

ORM for TypeScript and Google Cloud Firestore.

## Usage

Install the `firetype` and the `@google-cloud/firestore` peer dependency.

```
npm install -D typescript
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
