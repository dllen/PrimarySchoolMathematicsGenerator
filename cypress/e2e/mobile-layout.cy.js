describe('Mobile layout', () => {
  beforeEach(() => {
    cy.viewport(375, 667);
    cy.visit('/');
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('ConfigPanel shows all rows without folding', () => {
    cy.get('.config-row').its('length').should('be.gte', 7);
  });

  it('ActionBar sticks to bottom when scrolling', () => {
    cy.get('.config-panel').then(($el) => {
      const offset = $el.offset().top + $el.outerHeight() + 500;
      cy.scrollTo(0, offset);
      cy.get('.action-bar').should('be.visible');
    });
  });

  it('ProblemGrid is single-column on phone', () => {
    cy.contains('生成题目').click();
    cy.get('.problem-grid').first().then(($el) => {
      const cols = window.getComputedStyle($el[0]).gridTemplateColumns;
      expect(cols.trim().split(/\s+/).length).to.equal(1);
    });
  });

  it('touch targets are ≥ 44px', () => {
    cy.get('.action-bar .btn').first().invoke('css', 'minHeight').then((h) => {
      expect(parseInt(h, 10)).to.be.at.least(44);
    });
  });

  it('PDF button (desktop-only) is hidden on mobile', () => {
    cy.get('.action-bar .desktop-only').should('not.be.visible');
  });

  it('worksheet header info-row hidden on screen, shown on print', () => {
    cy.get('.worksheet-header .info-row').should('not.be.visible');
    cy.request('/src/style.css').then((res) => {
      const body = String(res.body);
      const printMatches = body.match(/@media print\s*\{[\s\S]*?\.worksheet-header \.info-row\s*\{[\s\S]*?display:\s*flex/g);
      expect(printMatches, 'print media rule sets .worksheet-header .info-row to display:flex').to.not.be.null;
    });
  });
});
