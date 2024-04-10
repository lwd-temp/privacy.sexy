import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { ScriptToCategorySelectionMapper } from '@/application/Context/State/Selection/Category/ScriptToCategorySelectionMapper';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { ScriptSelectionChangeCommand } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import { buildTestScenarioData, type CategoryChangeProcessingTestScenario } from './CategoryChangeProcessingTestScenario';

describe('ScriptToCategorySelectionMapper', () => {
  describe('areAllScriptsSelected', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly preselect: PreselectedTestOptions['preselect'];
      readonly expectedResult: boolean;
    }> = [
      {
        description: 'no selected scripts',
        preselect: () => [],
        expectedResult: false,
      },
      {
        description: 'partially selected scripts',
        preselect: (allScripts) => [allScripts[0]],
        expectedResult: false,
      },
      {
        description: 'all scripts are selected',
        preselect: (allScripts) => [...allScripts],
        expectedResult: true,
      },
    ];
    testScenarios.forEach((
      { description, preselect, expectedResult },
    ) => {
      it(`${description}: returns ${expectedResult}`, () => {
        const { sut, category } = setupTestWithPreselectedScripts({
          preselect,
        });
        // act
        const actual = sut.areAllScriptsSelected(category);
        // assert
        expect(actual).to.equal(expectedResult);
      });
    });
  });
  describe('isAnyScriptSelected', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly preselect: PreselectedTestOptions['preselect'];
      readonly expectedResult: boolean;
    }> = [
      {
        description: 'no selected scripts',
        preselect: () => [],
        expectedResult: false,
      },
      {
        description: 'one script is selected',
        preselect: (allScripts) => [allScripts[0]],
        expectedResult: true,
      },
      {
        description: 'all scripts are selected',
        preselect: (allScripts) => [...allScripts],
        expectedResult: true,
      },
    ];
    testScenarios.forEach((
      { description, preselect, expectedResult },
    ) => {
      it(`${description}: returns ${expectedResult}`, () => {
        const { sut, category } = setupTestWithPreselectedScripts({
          preselect,
        });
        // act
        const actual = sut.isAnyScriptSelected(category);
        // assert
        expect(actual).to.equal(expectedResult);
      });
    });
  });
  describe('processChanges', () => {
    const testScenarios: readonly CategoryChangeProcessingTestScenario[] = [
      {
        description: 'single script: select without revert',
        initialCategorySetup: [
          {
            categoryId: 'single-category',
            scriptIds: ['single-script'],
          },
        ],
        doCategoryChanges: ({ changeStatusOfAllCategories }) => changeStatusOfAllCategories(
          { isSelected: true, isReverted: false },
        ),
        expectScriptChanges: ({ expectSameStatusFromAllScripts }) => expectSameStatusFromAllScripts(
          { isSelected: true, isReverted: false },
        ),
      },
      {
        description: 'multiple scripts: select without revert',
        initialCategorySetup: [
          {
            categoryId: 'first-category',
            scriptIds: ['first-category-first-script', 'first-category-second-script'],
          },
          {
            categoryId: 'second-category',
            scriptIds: ['second-category-first-script'],
          },
        ],
        doCategoryChanges: ({ changeStatusOfAllCategories }) => changeStatusOfAllCategories(
          { isSelected: true, isReverted: false },
        ),
        expectScriptChanges: ({ expectSameStatusFromAllScripts }) => expectSameStatusFromAllScripts(
          { isSelected: true, isReverted: false },
        ),
      },
      {
        description: 'single script: select with revert',
        initialCategorySetup: [
          {
            categoryId: 'single-category',
            scriptIds: ['single-script'],
          },
        ],
        doCategoryChanges: ({ changeStatusOfAllCategories }) => changeStatusOfAllCategories(
          { isSelected: true, isReverted: true },
        ),
        expectScriptChanges: ({ expectSameStatusFromAllScripts }) => expectSameStatusFromAllScripts(
          { isSelected: true, isReverted: true },
        ),
      },
      {
        description: 'multiple scripts: select with revert',
        initialCategorySetup: [
          {
            categoryId: 'first-category',
            scriptIds: ['first-category-first-script'],
          },
          {
            categoryId: 'second-category',
            scriptIds: ['second-category-first-script'],
          },
          {
            categoryId: 'third-category',
            scriptIds: ['third-category-first-script'],
          },
        ],
        doCategoryChanges: ({ changeStatusOfAllCategories }) => changeStatusOfAllCategories(
          { isSelected: true, isReverted: true },
        ),
        expectScriptChanges: ({ expectSameStatusFromAllScripts }) => expectSameStatusFromAllScripts(
          { isSelected: true, isReverted: true },
        ),
      },
      {
        description: 'single script: deselect',
        initialCategorySetup: [
          {
            categoryId: 'single-category',
            scriptIds: ['single-script'],
          },
        ],
        doCategoryChanges: ({ changeStatusOfAllCategories }) => changeStatusOfAllCategories(
          { isSelected: false },
        ),
        expectScriptChanges: ({ expectSameStatusFromAllScripts }) => expectSameStatusFromAllScripts(
          { isSelected: false },
        ),
      },
      {
        description: 'multiple scripts: deselect',
        initialCategorySetup: [
          {
            categoryId: 'first-category',
            scriptIds: ['first-category-first-script'],
          },
          {
            categoryId: 'second-category',
            scriptIds: ['second-category-first-script'],
          },
        ],
        doCategoryChanges: ({ changeStatusOfAllCategories }) => changeStatusOfAllCategories(
          { isSelected: false },
        ),
        expectScriptChanges: ({ expectSameStatusFromAllScripts }) => expectSameStatusFromAllScripts(
          { isSelected: false },
        ),
      },
      {
        description: 'mixed operations (select, revert, deselect)',
        initialCategorySetup: [
          {
            categoryId: 'first-category',
            scriptIds: ['first-category-first-script-to-revert'],
          },
          {
            categoryId: 'second-category',
            scriptIds: ['second-category-first-script-to-not-revert'],
          },
          {
            categoryId: 'third-category',
            scriptIds: ['third-category-first-script-to-deselect'],
          },
        ],
        doCategoryChanges: ({ initialCategories: categories }) => [
          {
            categoryKey: categories[0].categoryKey,
            newStatus: { isSelected: true, isReverted: true },
          },
          {
            categoryKey: categories[1].categoryKey,
            newStatus: { isSelected: true, isReverted: false },
          },
          {
            categoryKey: categories[2].categoryKey,
            newStatus: { isSelected: false },
          },
        ],
        expectScriptChanges: ({ initialCategories: categories }) => [
          {
            scriptKey: categories[0].scriptKeys[0],
            newStatus: { isSelected: true, isReverted: true },
          },
          {
            scriptKey: categories[1].scriptKeys[0],
            newStatus: { isSelected: true, isReverted: false },
          },
          {
            scriptKey: categories[2].scriptKeys[0],
            newStatus: { isSelected: false },
          },
        ],
      },
      {
        description: 'affecting selected categories only',
        initialCategorySetup: [
          {
            categoryId: 'first-category (changed)',
            scriptIds: [
              'first-category-first-script (changed)',
              'first-category-second-script (changed)',
            ],
          },
          {
            categoryId: 'second-category (unchanged)',
            scriptIds: [
              'second-category-first-script (unchanged)',
              'second-category-second-script (unchanged)',
            ],
          },
          {
            categoryId: 'third-category (unchanged)',
            scriptIds: [
              'second-category-first-script (unchanged)',
              'second-category-second-script (unchanged)',
            ],
          },
        ],
        doCategoryChanges: ({ initialCategories: categories }) => [
          {
            categoryKey: categories[0].categoryKey,
            newStatus: { isSelected: true, isReverted: true },
          },
        ],
        expectScriptChanges: ({ initialCategories: categories }) => [
          {
            scriptKey: categories[0].scriptKeys[0],
            newStatus: { isSelected: true, isReverted: true },
          },
          {
            scriptKey: categories[0].scriptKeys[1],
            newStatus: { isSelected: true, isReverted: true },
          },
          // Excluding unchanged scripts/categories to assert that they are not changed
        ],
      },
    ];
    testScenarios.forEach((testScenario) => {
      it(testScenario.description, () => {
        // arrange
        const testData = buildTestScenarioData(testScenario);
        const scriptSelectionStub = new ScriptSelectionStub();
        const sut = new ScriptToCategorySelectionMapperBuilder()
          .withScriptSelection(scriptSelectionStub)
          .withCollection(new CategoryCollectionStub().withAction(
            new CategoryStub('category-with-all-scripts')
              // Register scripts to test for nested items
              .withAllScriptKeysRecursively(
                ...testData.categoriesWithKeys.flatMap((c) => c.scriptKeys),
              )
              .withCategories(...testData.categoriesWithKeys.map(
                (category) => new CategoryStub(category.categoryKey)
                  .withAllScriptKeysRecursively(...category.scriptKeys),
              )),
          ))
          .build();
        // act
        sut.processChanges({
          changes: testData.actualCategoryChanges,
        });
        // assert
        expect(scriptSelectionStub.callHistory).to.have.lengthOf(1);
        const call = scriptSelectionStub.callHistory.find((m) => m.methodName === 'processChanges');
        expectExists(call);
        const [command] = call.args;
        const { changes: actualScriptChanges } = (command as ScriptSelectionChangeCommand);
        expect(actualScriptChanges).to.have.lengthOf(testData.expectedScriptChanges.length);
        expect(actualScriptChanges).to.deep.members(testData.expectedScriptChanges);
      });
    });
  });
});

class ScriptToCategorySelectionMapperBuilder {
  private scriptSelection: ScriptSelection = new ScriptSelectionStub();

  private collection: CategoryCollection = new CategoryCollectionStub();

  public withScriptSelection(scriptSelection: ScriptSelection): this {
    this.scriptSelection = scriptSelection;
    return this;
  }

  public withCollection(collection: CategoryCollection): this {
    this.collection = collection;
    return this;
  }

  public build(): ScriptToCategorySelectionMapper {
    return new ScriptToCategorySelectionMapper(
      this.scriptSelection,
      this.collection,
    );
  }
}

type TestScripts = readonly [ScriptStub, ScriptStub, ScriptStub];
interface PreselectedTestOptions {
  preselect: (allScripts: TestScripts) => readonly ScriptStub[];
}
function setupTestWithPreselectedScripts(options: PreselectedTestOptions) {
  const allScripts: TestScripts = [
    new ScriptStub('first-script'),
    new ScriptStub('second-script'),
    new ScriptStub('third-script'),
  ];
  const preselectedScripts = options.preselect(allScripts);
  const category = new CategoryStub('category-with-all-scripts')
    .withAllScriptsRecursively(...allScripts); // Register scripts to test for nested items
  const collection = new CategoryCollectionStub().withAction(category);
  const sut = new ScriptToCategorySelectionMapperBuilder()
    .withCollection(collection)
    .withScriptSelection(
      new ScriptSelectionStub()
        .withSelectedScripts(preselectedScripts.map((s) => s.toSelectedScript())),
    )
    .build();
  return {
    category,
    sut,
  };
}
