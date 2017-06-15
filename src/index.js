import State from './state';
var path = require('path');

var stringify = require('json-stable-stringify');

module.exports = function(options) {
  function plugin(babel) {
    let state = new State(options);
    var types = babel.types;
    var callPathsToRemove;

    return {
      name: 'babel-plugin-remove-functions',
      visitor: {
        Program: {
          enter() {
            state.enter();
          },
          exit() {
            state.exit();
          }
        },

        ImportDeclaration: function(path) {
          path.node.specifiers.forEach((specifier) => {
            state.importSpecifier(specifier.type, path.node.source.value, specifier.local.name);
          });
        },

        ExpressionStatement: function(path) {
          if(!path.node.expression.callee || !path.node.expression.callee.name) {
            return;
          }

          let callPath = path.node.expression.callee.name;
          if(state.shouldRemoveCallPath(callPath)) {
            path.remove();
          }
        },

        CallExpression: function(path) {
          if(path.node.callee.type === 'MemberExpression') {
            let callPath = getCallPath(path.node.callee);

            if(state.shouldRemoveCallPath(callPath)) {
              path.remove();
            }
          }
        },

        VariableDeclaration: function(path) {
          //TODO: GJ: move some of this into State

          //eg. `const { assert, deprecate } = Ember;`
          path.node.declarations.forEach((declaration) => {
            if(declaration.init) {
              let importSource = state.getImportSourceFromLocal(declaration.init.name);

              options.removals.forEach((removal) => {
                if(removal.module === importSource) {

                  if(declaration.id && declaration.id.properties) {
                    declaration.id.properties.forEach((property) => {
                      //eg. const { warn: renamedWarn } = Ember;
                      //    =>: property.key.name => 'warn'
                      //    =>: property.value.name => 'renamedWarn'
                      if(removal.paths.indexOf(property.key.name) !== -1) {
                        state.callPathsToRemove.add(property.value.name);
                      }
                    });
                  }
                }
              });
            }
          });
        }
      }

    };
  };

  plugin.baseDir = function() {
    return path.join(__dirname, '../');
  };

  plugin.cacheKey = function() {
    return stringify(options);
  };

  return plugin;
};

function getCallPath(node) {
  var leftSide = '';
  if(node.object.type === 'Identifier') {
    leftSide = node.object.name;
  } else {
    if(node.object.type === 'MemberExpression') {
      leftSide = getCallPath(node.object);
    };
  }

  return `${leftSide}.${node.property.name}`;
}
