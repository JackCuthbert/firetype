import { Firestore, FieldValue } from '@google-cloud/firestore'
import { v4 as uuidv4 } from 'uuid'

export interface Entity {
  id: string
}

/**
 * Firetype repository class to create a generic abstraction over Google Cloud
 * Datastores package.
 *
 * @example
 *
 * interface MyEntity extends Entity {
 *    someKey: string
 * }
 *
 * const myRepository = new Repository<MyEntity>('root_collection')
 *
 * myRepository.createOrUpdate({
 *   someKey: 'hello, world'
 * })
 *
 */
export class Repository<T extends Entity> {
  protected readonly collection: string
  protected readonly firestore: Firestore

  constructor(collection: string, firestore?: Firestore) {
    this.collection = collection
    this.firestore = firestore ?? new Firestore()
  }

  /** Return the Datastore reference to a User document */
  protected getDocPath(docId: string = uuidv4()): string {
    return `${this.collection}/${docId}`
  }

  /** Return the User from Datastore */
  async find(id: string): Promise<T | undefined> {
    const ref = this.firestore.doc(this.getDocPath(id))
    const doc = await ref.get()

    if (!doc.exists) return undefined

    const userData = doc.data() as T
    return userData
  }

  /** Create a new document or update an existing one (via merge) */
  async createOrUpdate(newDoc: T): Promise<T> {
    const path = this.getDocPath(newDoc.id)
    const ref = this.firestore.doc(path)
    const doc = await ref.get()

    await ref.set(newDoc, { merge: doc.exists })

    return newDoc
  }

  async incrementValue(doc: T, property: keyof T, num: number = 1): Promise<T> {
    const existingProperty = doc[property]

    if (typeof existingProperty !== 'number') {
      throw Error(
        `To increment the "${String(property)}" value it must be a number`
      )
    }

    const ref = this.firestore.doc(this.getDocPath(doc.id))

    await ref.update({
      [property]: FieldValue.increment(num)
    })

    const result: T = {
      ...doc,
      [property]: existingProperty + num
    }

    return result
  }

  /** Remove the document if it exists */
  async delete(id: string): Promise<void> {
    const userRef = this.firestore.doc(this.getDocPath(id))
    await userRef.delete()
  }
}
