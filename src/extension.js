const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	this.extensionName = 'vincent-the-gamer.neonheart';
	this.cntx = context;
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	// ...
}

module.exports = {
	activate,
	deactivate
}