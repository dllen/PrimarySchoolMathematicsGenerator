describe('Generator flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('shows config panel and action bar', () => {
    cy.contains('题目数量').should('be.visible');
    cy.contains('生成题目').should('be.visible');
  });

  it('generates arithmetic problems for default config', () => {
    cy.get('input[type=number]').first().type('{selectAll}5');
    cy.contains('生成题目').click();
    cy.get('.problem-item').should('have.length', 5);
  });

  it('supports application problems when selected', () => {
    cy.get('input[type=number]').first().type('{selectAll}3');
    cy.contains('应用题').click();
    cy.contains('生成题目').click();
    cy.get('.problem-item').should('have.length.at.least', 3);
  });

  it('toggles answer mode and renders answers inline', () => {
    cy.get('input[type=number]').first().type('{selectAll}3');
    cy.contains('题目后显示').click();
    cy.contains('生成题目').click();
    cy.get('.problem-item .answer').should('have.length', 3);
  });
});
