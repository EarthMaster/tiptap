context('/api/extensions/horizontal-rule', () => {
  beforeEach(() => {
    cy.visit('/api/extensions/horizontal-rule')

    cy.get('.ProseMirror').window().then(window => {
      const { editor } = window
      editor.setContent('<p>Example Text</p>')
    })
  })

  describe('horizontal-rule', () => {
    it('the button should add a horizontal rule', () => {
      cy.get('.ProseMirror hr').should('not.exist')
      cy.get('.demo__preview button:first').click({ force: true })
      cy.get('.ProseMirror hr').should('exist')
    })

    it('the default markdown shortcut should add a horizontal rule', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        editor.clearContent()

        cy.get('.ProseMirror hr').should('not.exist')
        cy.get('.ProseMirror').type('---', {force: true})
        cy.get('.ProseMirror hr').should('exist')
      })
    })

    it('the alternative markdown shortcut should add a horizontal rule', () => {
      cy.get('.ProseMirror').window().then(window => {
        const { editor } = window
        editor.clearContent()

        cy.get('.ProseMirror hr').should('not.exist')
        cy.get('.ProseMirror').type('___ ', {force: true})
        cy.get('.ProseMirror hr').should('exist')
      })
    })
  })
})