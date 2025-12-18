// __tests__/shoppingList-dao.test.js

// Použití CommonJS syntaxe pro maximální kompatibilitu s Jest v Node.js prostředí
const { connect, close, clear } = require('../src/lib/test-db');
const shoppingListDao = require('../src/dao/shoppingList-dao');

// Nastavení testovacího prostředí
beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clear();
});

afterAll(async () => {
  await close();
});

// Hlavní blok testů pro ShoppingList DAO
describe('ShoppingList DAO Tests', () => {

  // Testovací data
  const userId = 'u-test-user-123';
  const listName = 'Můj Testovací Seznam';

  // 1. CREATE (Vytvoření záznamu)
  test('should create a shopping list successfully', async () => {
    const dtoIn = { name: listName };
    
    // Volání DAO metody create
    const result = await shoppingListDao.create(dtoIn, userId);

    // Ověření (Asserts)
    expect(result).toBeDefined();
    expect(result.data.name).toBe(listName);
    expect(result.data.ownerId).toBe(userId);
    expect(result.data.id).toBeDefined(); 
    expect(result.data.state).toBe('active');
  });

  // 2. GET (Načtení jednoho záznamu - upraveno na getById)
  test('should get a shopping list by ID', async () => {
    // Nejdřív vytvoříme seznam
    const created = await shoppingListDao.create({ name: listName }, userId);

    // Teď ho načteme pomocí getById
    const found = await shoppingListDao.getById({ id: created.data.id }, userId);

    expect(found).toBeDefined();
    expect(found.data.id).toBe(created.data.id);
    expect(found.data.name).toBe(listName);
  });

  // 3. UPDATE (Aktualizace záznamu - upraveno na updateName)
  test('should update shopping list name', async () => {
    // Vytvoříme seznam
    const created = await shoppingListDao.create({ name: 'Staré jméno' }, userId);
    
    // Upravíme jméno pomocí updateName
    const updateDtoIn = { id: created.data.id, name: 'Nové jméno' };
    const updated = await shoppingListDao.updateName(updateDtoIn, userId);

    expect(updated.data.name).toBe('Nové jméno');
    
    // Ověříme v DB
    const found = await shoppingListDao.getById({ id: created.data.id }, userId);
    expect(found.data.name).toBe('Nové jméno');
  });

  // 4. LIST (Načtení seznamu aktivních dat)
  test('should list active shopping lists', async () => {
    // Vytvoříme 2 seznamy pro uživatele
    await shoppingListDao.create({ name: 'Seznam 1' }, userId);
    await shoppingListDao.create({ name: 'Seznam 2' }, userId);

    // Načteme aktivní seznamy (očekává page a limit v dtoIn)
    const list = await shoppingListDao.listActive({ page: 0, limit: 10 }, userId);

    expect(list.data.itemList).toBeDefined();
    expect(list.data.itemList.length).toBe(2);
  });

  // 5. DELETE (Smazání záznamu - upraveno na deleteList)
  test('should delete a shopping list', async () => {
    const created = await shoppingListDao.create({ name: 'Na smazání' }, userId);
    
    // Smažeme pomocí deleteList
    await shoppingListDao.deleteList({ id: created.data.id }, userId);

    // Ověříme, že getById vyhodí chybu nebo nenajde záznam
    await expect(
      shoppingListDao.getById({ id: created.data.id }, userId)
    ).rejects.toThrow();
  });

  // 6. ALTERNATIVNÍ SCÉNÁŘ (Rainy Day - Error Handling)
  test('should throw error when updating non-existent list', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    
    // Očekáváme, že updateName selže pro neexistující ID
    await expect(
      shoppingListDao.updateName({ id: nonExistentId, name: 'Fail' }, userId)
    ).rejects.toThrow(); 
  });

});