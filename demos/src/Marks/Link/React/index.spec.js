import Link from '@tiptap/extension-link'

context('/src/Marks/Link/React/', () => {
  before(() => {
    cy.visit('/src/Marks/Link/React/')
  })

  beforeEach(() => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p>Example TextDEFAULT</p>')
      cy.get('.tiptap').type('{selectall}')
    })
  })

  it('should add a custom class to a link', () => {
    const linkExtension = Link.configure({
      HTMLAttributes: {
        class: 'foo',
      },
    })

    expect(linkExtension.options.HTMLAttributes).to.deep.include({
      class: 'foo',
    })
  })

  it('should parse a tags correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="#">Example Text1</a></p>')
      expect(editor.getHTML()).to.eq(
        '<p><a target="_blank" rel="noopener noreferrer nofollow" href="#">Example Text1</a></p>',
      )
    })
  })

  it('should parse a tags with target attribute correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="#" target="_self">Example Text2</a></p>')
      expect(editor.getHTML()).to.eq(
        '<p><a target="_self" rel="noopener noreferrer nofollow" href="#">Example Text2</a></p>',
      )
    })
  })

  it('should parse a tags with rel attribute correctly', () => {
    cy.get('.tiptap').then(([{ editor }]) => {
      editor.commands.setContent('<p><a href="#" rel="follow">Example Text3</a></p>')
      expect(editor.getHTML()).to.eq(
        '<p><a target="_blank" rel="follow" href="#">Example Text3</a></p>',
      )
    })
  })

  it('the button should add a link to the selected text', () => {
    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://tiptap.dev')

      cy.get('button:first').click()

      cy.window().its('prompt').should('be.called')

      cy.get('.tiptap')
        .find('a')
        .should('contain', 'https://tiptap.dev')
        .should('have.attr', 'href', 'https://tiptap.dev')
    })
  })

  it('detects a pasted URL within a text', () => {
    cy.get('.tiptap')
      .paste({
        pastePayload: 'some text https://example1.com around an url',
        pasteType: 'text/plain',
      })
      .find('a')
      .should('contain', 'https://example1.com')
      .should('have.attr', 'href', 'https://example1.com')
  })

  it('detects a pasted URL', () => {
    cy.get('.tiptap')
      .paste({ pastePayload: 'https://example2.com', pasteType: 'text/plain' })
      .find('a')
      .should('contain', 'https://example2.com')
      .should('have.attr', 'href', 'https://example2.com')
  })

  it('detects a pasted URL with query params', () => {
    cy.get('.tiptap')
      .paste({ pastePayload: 'https://example.com?paramA=nice&paramB=cool', pasteType: 'text/plain' })
      .find('a')
      .should('contain', 'https://example.com?paramA=nice&paramB=cool')
      .should('have.attr', 'href', 'https://example.com?paramA=nice&paramB=cool')
  })

  it('correctly detects multiple pasted URLs', () => {
    cy.get('.tiptap').paste({
      pastePayload:
        'https://example1.com, https://example2.com/foobar, (http://example3.com/foobar)',
      pasteType: 'text/plain',
    })

    cy.get('.tiptap')
      .find('a[href="https://example1.com"]')
      .should('contain', 'https://example1.com')

    cy.get('.tiptap')
      .find('a[href="https://example2.com/foobar"]')
      .should('contain', 'https://example2.com/foobar')

    cy.get('.tiptap')
      .find('a[href="http://example3.com/foobar"]')
      .should('contain', 'http://example3.com/foobar')
  })
})
