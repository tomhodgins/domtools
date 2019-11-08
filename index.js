// Takes a String
// Returns a DocumentFragment containing all parsed Nodes
export function parse(
  string = '',
  mode = 'html' // or 'xml'
) {
  const fragment = new DocumentFragment
  const parser = new DOMParser
  const dom = parser.parseFromString(
    string,
    ({
      html: 'text/html',
      xml: 'application/xml'
    })[mode]
  )
  fragment.append(
    ...({
      html: dom.body,
      xml: dom
    })[mode].childNodes
  )
  return fragment
}

// Takes a Document, DocumentFragment, Element, Node, or an Array containing them
// Returns the objects passed in after processing each Node with callback function
export function process(
  object = all(),
  callback = node => node
) {
  const readChildren = list => {
    if (
      list.childNodes
      && list.childNodes.length
    ) {
      Array.from(list.childNodes).forEach(node => {
        callback(node)
        if (list.childNodes) {
          readChildren(node)
        }
      })
    }
  }

  if (Array.isArray(object)) {
    object.map(node => process(node, callback))
  } else {
    readChildren(object)
  }

  return object
}

// Takes a DocumentFragment, HTMLElement, Element, Node, an array containing them, or a string
// Returns the original object, plus a node
export function add(
  nodes = parse(),
  object = parse(),
) {
  if (Array.isArray(object)) {
    object.map(docLike => add(docLike, nodes, index))
  } else if (object instanceof Document) {
    if (document.body) {
      document.body.append(nodes)
    } else {
      document.documentElement.append(nodes)
    }
  } else if (
    [
      DocumentFragment,
      Element,
      Node
    ].some(thing => object instanceof thing)
  ) {
    object.append(nodes)
  }
  return object
}

// Takes a DocumentFragment, HTMLElement, Element, Node, an array containing them, or a string
// Returns the original object, minus nodes
export function remove(
  object = parse()
) {
  if (Array.isArray(object)) {
    object.map(docLike => remove(docLike))
  } else if (
    [
      Document,
      DocumentFragment
    ].some(thing => object instanceof thing)
  ) {
    while (object.firstChild) {
      object.removeChild(object.firstChild)
    }
  } else if (
    [
      Element,
      Node
    ].some(thing => object instanceof thing)
  ) {
    object.remove()
  }
  return object
}

// Takes a Document, DocumentFragment, Element, Node, or an array containing them
// Returns a String
export function stringify(
  object = document,
  mode = 'html' // or 'xml'
) {
  if (Array.isArray(object)) {
    return object.map(stringify).join('\n')
  } else if (object instanceof Document) {
    return ({
      html: object.documentElement.outerHTML,
      xml: new XMLSerializer().serializeToString(object)
    })[mode]
  } else if (object instanceof DocumentFragment) {
    return Array.from(object.childNodes).map(stringify).join('\n')
  } else if (object instanceof Element) {
    return object.outerHTML
  } else if (object instanceof Node) {
    return object.data
  }
}

// Returns an Array of all Nodes in the Document
export function all(
  documentObject = document
) {
  const iterator = documentObject.createNodeIterator(document)
  const nodes = []
  let currentNode = iterator.nextNode()
  while (currentNode) {
    nodes.push(currentNode)
    currentNode = iterator.nextNode()
  }
  return nodes
}

// Takes a Document, DocumentFragment, Element, Node, or an Array containing them
// Returns an Array of all matching Nodes
export function filter(
  nodes = parse(),
  test = node => node
) {
  const output = []
  process(
    nodes,
    node => {
      if (test(node)) {
        output.push(node)
      }
    }
  )
  return output
}

// Takes a string, and optionally a Document-like object, an Element, or an array containing them
// Returns an object containing all nodes with tag names containing or matching the string
export function tagName(
  string = '',
  option = false,
  list = all()
) {
  if (Array.isArray(list) === false) {
    list = [list]
  }
  return list.map(nodes =>
    filter(
      nodes,
      node => {
        if (node.nodeType === 1) {
          if (option) {
            return node.nodeName && node.nodeName.toUpperCase() === string.toUpperCase()
          } else {
            return node.nodeName && node.nodeName.toUpperCase().includes(string.toUpperCase())
          }
        }
      }
    )
  ).filter(nodes => nodes.length)
}

// Takes a string, and optionally a Document-like object, an Element, or an array containing them
// Returns an object containing all nodes with attribute names containing or matching the string
export function attributeName(
  string = '',
  option = false,
  list = all()
) {
  if (Array.isArray(list) === false) {
    list = [list]
  }
  return list.map(nodes =>
    filter(
      nodes,
      node => node.attributes && [...node.attributes].some(attribute => {
        if (option) {
          return attribute.name === string
        } else {
          return attribute.name.includes(string)
        }
      })
    )
  ).filter(nodes => nodes.length)
}

// Takes a string, and optionally a Document-like object, an Element, or an array containing them
// Returns an object containing all nodes with attribute values containing or matching the string
export function attributeValue(
  string = '',
  option = false,
  list = all()
) {
  if (Array.isArray(list) === false) {
    list = [list]
  }
  return list.map(nodes =>
    filter(
      nodes,
      node => node.attributes && [...node.attributes].some(attribute => {
        if (option) {
          return attribute.value === string
        } else {
          return attribute.value.includes(string)
        }
      })
    )
  ).filter(nodes => nodes.length)
}

// Takes a string, and optionally a Document-like object, an Element, or an array containing them
// Returns an object containing all nodes with attribute values containing or matching the string
export function textContent(
  string = '',
  option = false,
  list = all()
) {
  if (Array.isArray(list) === false) {
    list = [list]
  }
  return list.map(nodes =>
    filter(
      nodes,
      node => {
        if (node.nodeName === '#text') {
          if (option) {
            return node.textContent === string
          } else {
            return node.textContent.includes(string)
          }
        }
      }
    )
  ).filter(nodes => nodes.length)
}

export default {
  parse,
  process,
  add,
  remove,
  stringify,
  all,
  filter,
  tagName,
  attributeName,
  attributeValue,
  textContent
}