import { Firestore } from '@google-cloud/firestore'

export interface Entity {
  id: string
}

/**
 * Generic interface for simple Firestore interactions.
 *
 * @example
 *
 * interface MyEntity extends Entity {
 *    someKey: string
 * }
 *
 * const myRepository = new Repository<MyEntity>('root_collection')
 * myRepository.createOrUpdate({
 *   someKey: 'hello, world'
 * })
 */
export class Repository<T extends Entity> {
  protected readonly collection: string
  protected readonly firestore: Firestore

  constructor(collection: string, firestore?: Firestore) {
    this.collection = collection
    this.firestore = firestore ?? new Firestore()
  }

  /** Return the Datastore reference to a User document */
  protected createDocRef(docId: string): string {
    return `${this.collection}/${docId}`
  }

  /** Return the User from Datastore */
  async find(docId: string): Promise<T | undefined> {
    const ref = this.firestore.doc(this.createDocRef(docId))
    const doc = await ref.get()

    if (!doc.exists) return undefined

    const userData = doc.data() as T
    return userData
  }

  /** Create or update (and return) the User from Datastore */
  async createOrUpdate(newDoc: T): Promise<T> {
    const ref = this.firestore.doc(this.createDocRef(newDoc.id))
    const doc = await ref.get()

    await ref.set(newDoc, { merge: doc.exists })
    return newDoc
  }

  /** Remove the user from Datastore if it exists */
  async delete(docId: string): Promise<void> {
    const userRef = this.firestore.doc(this.createDocRef(docId))
    await userRef.delete()
  }
}
