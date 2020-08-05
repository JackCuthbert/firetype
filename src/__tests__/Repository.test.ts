import { Firestore } from '@google-cloud/firestore'
import { v4 as uuidv4 } from 'uuid'
import { Repository, Entity } from '../Repository'

interface MyDocument extends Entity {
  numberKey: number
  stringKey: string
  boolKey: boolean
}

let firestore: Firestore
let repository: Repository<MyDocument>

const COLLECTION = 'TEST_collection'

describe('Repository', () => {
  beforeEach(() => {
    firestore = new Firestore()
    repository = new Repository<MyDocument>(COLLECTION, firestore)
  })

  afterEach(async () => {
    await firestore.terminate()
  })

  describe('#find', () => {
    it('returns a previously created document', async () => {
      const id = uuidv4()
      const ref = firestore.doc(`${COLLECTION}/${id}`)
      const data: MyDocument = {
        id,
        numberKey: 123,
        stringKey: 'Hello, World!',
        boolKey: true
      }

      await ref.create(data)

      const result = await repository.find(id)
      expect(result).toBeDefined()
      expect(result?.numberKey).toBe(data.numberKey)
    })

    it('returns undefined for a document that does not exist', async () => {
      const result = await repository.find('abcd')
      expect(result).toBeUndefined()
    })
  })

  describe('#createOrUpdate', () => {
    it('creates a doc', async () => {
      const data: MyDocument = {
        id: uuidv4(),
        numberKey: 123,
        stringKey: 'Hello, World!',
        boolKey: true
      }
      const doc = await repository.createOrUpdate(data)

      const firestoreDoc = await firestore.doc(`${COLLECTION}/${doc.id}`).get()
      expect(firestoreDoc.exists).toBe(true)
      expect(firestoreDoc.data()?.stringKey).toBe(doc.stringKey)
    })

    it('updates a doc', async () => {
      const id = uuidv4()
      const ref = firestore.doc(`${COLLECTION}/${id}`)

      const data: MyDocument = {
        id,
        numberKey: 123,
        stringKey: 'Hello, World!',
        boolKey: true
      }

      await ref.set(data)
      const previousFirestoreDoc = await ref.get()
      expect(previousFirestoreDoc.exists).toBe(true)
      expect(previousFirestoreDoc.data()?.numberKey).toBe(data.numberKey)

      await repository.createOrUpdate({
        ...data,
        numberKey: 999
      })

      const firestoreDoc = await ref.get()
      expect(firestoreDoc.exists).toBe(true)
      expect(firestoreDoc.data()?.numberKey).toBe(999)
    })
  })

  describe('#incrementValue', () => {
    it('throws when incrementing NaN', async () => {
      const id = uuidv4()
      const data: MyDocument = {
        id,
        numberKey: 0,
        stringKey: 'Hello, World!',
        boolKey: true
      }
      await repository.createOrUpdate(data)

      expect.assertions(1)
      try {
        await repository.incrementValue(data, 'stringKey', 2)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('increments a number', async () => {
      const id = uuidv4()
      const ref = firestore.doc(`${COLLECTION}/${id}`)

      const data: MyDocument = {
        id,
        numberKey: 0,
        stringKey: 'Hello, World!',
        boolKey: true
      }

      await repository.createOrUpdate(data)

      const result = await repository.incrementValue(data, 'numberKey', 2)
      expect(result.numberKey).toBe(2)

      const firestoreDoc = await ref.get()
      expect(firestoreDoc.exists).toBe(true)
      expect(firestoreDoc.data()?.numberKey).toBe(2)
    })
  })

  describe('#delete', () => {
    it('deletes a previously created document', async () => {
      const id = uuidv4()
      const ref = firestore.doc(`${COLLECTION}/${id}`)
      const data: MyDocument = {
        id,
        numberKey: 123,
        stringKey: 'Hello, World!',
        boolKey: true
      }

      await ref.create(data)
      await repository.delete(id)

      const result = await ref.get()
      expect(result.exists).toBe(false)
    })
  })
})
