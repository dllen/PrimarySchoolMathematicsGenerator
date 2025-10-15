
describe('History Feature End-to-End Test', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test to ensure a clean state
    cy.visit('/', {
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('MathProblemsHistory');
      },
    });
  });

  it('should save generated problems to history and allow viewing them', () => {
    // 1. Generate problems
    cy.contains('button', '生成题目').click();
    cy.get('.problem-item').should('have.length.gt', 0);

    // 2. Navigate to the history list
    cy.contains('button', '查看历史题目').click();
    cy.get('.history-list').should('be.visible');

    // 3. Verify the history list has one entry
    cy.get('.history-list li').should('have.length', 1);
    cy.get('.history-list li').first().contains(/题目: 20 | 类型: [+\-×÷, ]+ | 2项/);

    // 4. Navigate to the history detail view
    cy.get('.history-list li').first().click();
    cy.get('.history-detail-panel').should('be.visible');

    // 5. Verify the problems are displayed in the detail view
    cy.get('#history-problems-to-print .problem-item').should('have.length.gte', 1);
    // Initially, answers should be hidden
    cy.get('#history-problems-to-print .problem-answer').should('not.exist');

    // 6. Show and verify answers
    cy.contains('button', '显示答案').click();
    cy.get('#history-problems-to-print .problem-answer').should('have.length.gte', 1);
    cy.get('#history-problems-to-print .problem-answer').first().should('be.visible');

    // 7. Go back to the history list
    cy.contains('button', '返回列表').click();
    cy.get('.history-list').should('be.visible');

    // 8. Go back to the generator
    cy.contains('button', '返回主页').click();
    cy.get('.config-panel').should('be.visible');
  });

  it('should enforce the 20-record limit in history', () => {
    // Generate problems 21 times
    for (let i = 0; i < 21; i++) {
      cy.contains('button', '生成题目').click();
      // A short wait to ensure the async DB operation has time to complete
      cy.wait(100);
    }

    // Navigate to history
    cy.contains('button', '查看历史题目').click();

    // Verify the list has exactly 20 items
    cy.get('.history-list li').should('have.length', 20);
  });
});
