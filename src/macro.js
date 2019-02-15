"use strict";

const { createMacro } = require("babel-plugin-macros");

module.exports = createMacro(forOwnMacro);

const INVALID_USAGE = `
Invalid usage of for-own.macro. It must be used by wrapping in a call the
object that you are iterating using a for-in statement:

  import own from "for-own.macro";

  for (const key in own(object)) {
    // ...
  }
`.slice(1, -1);

function forOwnMacro({ references, state, babel }) {
  const { template, types: t } = babel;

  references.default.forEach(referencePath => {
    const { node, parentPath: callPath } = referencePath;
    const loopPath = callPath.parentPath;

    if (
      !callPath.isCallExpression({ callee: node }) ||
      callPath.get("arguments").length !== 1 ||
      !loopPath.isForInStatement({ right: callPath.node })
    ) {
      throw callPath.buildCodeFrameError(INVALID_USAGE);
    }

    const declPath = loopPath.get("left");
    let keyId, keyAssign = null;
    switch (declPath.type) {
      case "Identifier":
        keyId = declPath.node;
        break;
      case "VariableDeclaration":
        const idPath = declPath.get("declarations.0.id");
        if (idPath.isIdentifier()) {
          keyId = idPath.node;
          break;
        }
      default:
        keyId = declPath.scope.generateUidIdentifierBasedOnNode(declPath.node);
        keyAssign = t.cloneNode(declPath.node);
        if (declPath.isVariableDeclaration()) {
          keyAssign.declarations[0].init = keyId;
        } else {
          keyAssign = t.assignmentExpression("=", keyAssign, keyId);
        }
        declPath.replaceWith(template.statement.ast`var ${keyId}`);
    }

    const obj = callPath.get("arguments.0").node;
    let objId, objAssign;
    switch (obj.type) {
      case "Identifier":
        objAssign = obj;
        objId = t.cloneNode(obj);
        break;
      default:
        objId = loopPath.scope.generateUidIdentifierBasedOnNode(obj);
        loopPath.parentPath.scope.push({ id: objId });
        objAssign = t.assignmentExpression("=", objId, obj);
    }

    const body = keyAssign
      ? template.statement.ast`{ ${keyAssign}; ${loopPath.node.body} }`
      : loopPath.node.body;

    loopPath.replaceWith(template.statement.ast`
      for (${declPath.node} in ${objAssign})
        if (Object.hasOwnProperty.call(${objId}, ${keyId}))
          ${body}
    `);
  });
}
