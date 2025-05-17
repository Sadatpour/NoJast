describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the main content', () => {
    cy.get('main').should('exist')
  })

  it('should have working navigation', () => {
    cy.get('nav').should('exist')
    cy.get('nav a').first().click()
    cy.url().should('not.equal', Cypress.config().baseUrl)
  })
}) 