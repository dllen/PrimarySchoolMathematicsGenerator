describe('History flow', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.indexedDB.deleteDatabase('MathProblemsHistory');
      },
    });
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('saves a problem set and shows it in history', () => {
    cy.get('input[type=number]').first().type('{selectAll}3');
    cy.contains('生成题目').click();
    cy.contains('查看历史').click();
    cy.get('.history-list li').should('have.length.at.least', 1);
  });

  it('opens history detail and renders problems', () => {
    cy.get('input[type=number]').first().type('{selectAll}3');
    cy.contains('生成题目').click();
    cy.contains('查看历史').click();
    cy.contains('查看').first().click();
    cy.get('.problem-item').should('have.length.at.least', 3);
    cy.contains('返回列表').click();
  });

  it('deletes a history entry', () => {
    cy.get('input[type=number]').first().type('{selectAll}2');
    cy.contains('生成题目').click();
    cy.contains('查看历史').click();
    cy.contains('删除').first().click();
    cy.get('.history-list li').should('have.length', 0);
  });
});
