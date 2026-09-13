describe('工作台 UI 重设计', () => {
  beforeEach(() => {
    cy.visit('/#/workbench')
  })

  it('渲染 Hero 标题', () => {
    cy.contains('为你的孩子，定制一份数学练习').should('be.visible')
  })

  it('渲染年级卡片', () => {
    cy.get('[data-test="grade-card"]').should('have.length.gte', 1)
  })

  it('三年级卡片显示推荐徽章', () => {
    cy.contains('三年级').closest('[data-test="grade-card"]').should('contain.text', '推荐')
  })

  it('点击三年级卡片展开预览区', () => {
    cy.contains('三年级').click()
    cy.get('[data-test="preview-root"]').should('be.visible')
  })

  it('点击自定义全部配置切换到 Tab 视图', () => {
    cy.contains('自定义全部配置').click()
    cy.get('[role="tablist"]').should('be.visible')
  })
})
