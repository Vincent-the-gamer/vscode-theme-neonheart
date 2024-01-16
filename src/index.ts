import vscode from "vscode"

export function activate(this: any) {
	this.extensionName = 'vincent-the-gamer.neonheart';
	vscode.window.showInformationMessage("NeonHeart Activated!")
}

export function deactivate() {
	vscode.window.showInformationMessage("NeonHeart Deactivated!")
}