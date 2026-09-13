describe('移动端底部 sheet', () => {
  beforeEach(() => {
    cy.viewport('iphone-x')
    cy.visit('/#/workbench')
  })

  it('顶栏显示汉堡按钮', () => {
    cy.get('button[aria-label="打开菜单"]').should('be.visible')
  })

  it('点击汉堡打开菜单 sheet', () => {
    cy.get('button[aria-label="打开菜单"]').click()
    cy.contains('历史').should('be.visible')
  })

  it('点击菜单项跳转并关闭 sheet', () => {
    cy.get('button[aria-label="打开菜单"]').click()
    cy.contains('历史').click()
    cy.location('hash').should('include', '/history')
  })
})
