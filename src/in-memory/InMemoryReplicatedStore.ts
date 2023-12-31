import {
  Awaitable,
  Changes,
  Reference,
  ReplicatedStore,
  Version,
} from "../types"

/**
 * A basic store that persists data in a `Map`. This store is a replication target so will respect
 * the provided versions
 */
export class InMemoryReplicatedStore<T extends Reference>
  implements ReplicatedStore<T>
{
  private version: Version = 0
  private db = new Map<string, T>()

  private static toKey(reference: Reference) {
    return `${reference.type}::${reference.id}`
  }

  init() {}

  getVersion() {
    return this.version
  }

  setVersion(version: Version) {
    this.version = version
  }

  put(reference: T) {
    this.db.set(InMemoryReplicatedStore.toKey(reference), reference)
  }

  putMany(references: T[]) {
    references.forEach((reference) =>
      this.db.set(InMemoryReplicatedStore.toKey(reference), reference)
    )
  }

  getAll(fromVersion = 0) {
    return Array.from(this.db.values()).filter(
      (val) => val.version >= fromVersion
    )
  }

  getOne(reference: Reference) {
    return this.db.get(InMemoryReplicatedStore.toKey(reference))
  }

  delete(reference: Reference) {
    this.db.delete(InMemoryReplicatedStore.toKey(reference))
  }

  deleteMany(references: Reference[]) {
    const keys = references.map(InMemoryReplicatedStore.toKey)
    keys.forEach(this.db.delete)
  }

  applyChanges(changes: Changes<T>): Awaitable<void> {
    this.putMany(changes.update || [])
    this.deleteMany(changes.delete || [])
    this.setVersion(changes.version)
  }
}
