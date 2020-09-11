context('/api/extensions/paragraph', () => {
  before(() => {
    cy.visit('/api/extensions/paragraph')
  })

  beforeEach(done => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.focus()
      editor.clearContent()
      done()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror').type('Example Text', { force: true })
    cy.get('.ProseMirror').find('p').should('contain', 'Example Text')
  })

  it('enter should make a new paragraph', () => {
    cy.get('.ProseMirror').type('First Paragraph{enter}Second Paragraph', { force: true })
    cy.get('.ProseMirror').find('p').should('have.length', 2)
    cy.get('.ProseMirror').find('p:first').should('contain', 'First Paragraph')
    cy.get('.ProseMirror').find('p:nth-child(2)').should('contain', 'Second Paragraph')
  })

  it('backspace should remove the second paragraph', () => {
    cy.get('.ProseMirror').type('{enter}', { force: true })
    cy.get('.ProseMirror').find('p').should('have.length', 2)
    cy.get('.ProseMirror').type('{backspace}', { force: true })
    cy.get('.ProseMirror').find('p').should('have.length', 1)
  })
})