context('/api/nodes/text', () => {
  before(() => {
    cy.visit('/api/nodes/text')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.clearContent()
    })
  })

  it('text should be wrapped in a paragraph by default', () => {
    cy.get('.ProseMirror')
      .type('Example Text')
      .find('p')
      .should('contain', 'Example Text')
  })
})
