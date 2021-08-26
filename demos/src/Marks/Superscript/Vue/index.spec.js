context('/src/Marks/Superscript/Vue/', () => {
  before(() => {
    cy.visit('/src/Marks/Superscript/Vue/')
  })

  beforeEach(() => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example Text</p>')
      cy.get('.ProseMirror').type('{selectall}')
    })
  })

  it('should transform inline style to sup tags', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><span style="vertical-align: super">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p><sup>Example Text</sup></p>')
    })
  })

  it('sould omit inline style with a different vertical align', () => {
    cy.get('.ProseMirror').then(([{ editor }]) => {
      editor.commands.setContent('<p><span style="vertical-align: middle">Example Text</span></p>')
      expect(editor.getHTML()).to.eq('<p>Example Text</p>')
    })
  })

  it('the button should make the selected text bold', () => {
    cy.get('button:first')
      .click()

    cy.get('.ProseMirror')
      .find('sup')
      .should('contain', 'Example Text')
  })

  it('the button should toggle the selected text bold', () => {
    cy.get('button:first').click()
    cy.get('.ProseMirror').type('{selectall}')
    cy.get('button:first').click()
    cy.get('.ProseMirror sup').should('not.exist')
  })
})
