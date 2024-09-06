import { CacheStore } from "@/data/protocols/cache";
import { LocalSavePurchases } from "@/data/usercases";

class CacheStoreSpy implements CacheStore {
  deleteCallCount = 0;
  insertCallsCount = 0;
  key: string

  delete(key: string): void {
    this.deleteCallCount++
    this.key = key
  };
};

type SutType = {
  sut: LocalSavePurchases
  cacheStore: CacheStoreSpy
};

const makeSut = (): SutType => {
  const cacheStore = new CacheStoreSpy();
  const sut = new LocalSavePurchases(cacheStore);

  return {
    sut,
    cacheStore
  }
};

describe('LocalSavePurchases', () =>{
  test('should not delete cache on sut.init', () => {
    const { cacheStore } = makeSut();
    new LocalSavePurchases(cacheStore);
    expect(cacheStore.deleteCallCount).toBe(0);
  });

  test('should delete old cache save on sut.save', async () => {
    const { sut, cacheStore } = makeSut();
    await sut.save();

    expect(cacheStore.deleteCallCount).toBe(1);
    expect(cacheStore.key).toBe('purchases');
  });

  test('should not insert new cache if delete fails',  () => {
    const { cacheStore, sut } = makeSut();
    jest.spyOn(cacheStore, 'delete').mockImplementationOnce(() => { throw new Error() });
    const promise = sut.save();
    expect(cacheStore.insertCallsCount).toBe(0);
    expect(promise).rejects.toThrow();
  });
});
