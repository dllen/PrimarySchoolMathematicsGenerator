describe('Mobile flow', () => {
  beforeEach(() => {
    cy.viewport(375, 667); // iPhone SE
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
          configurable: true,
        });
      },
    });
    cy.clearLocalStorage();
  });

  it('shows mobile hint and download image button', () => {
    cy.contains('下载图片').should('exist');
  });

  it('disables PDF button on mobile with tooltip', () => {
    cy.contains('生成题目').click();
    cy.get('button[title*="桌面端"]').should('be.disabled');
  });
});
