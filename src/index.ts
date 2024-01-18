import vscode from "vscode"
import fs from "fs"
import path from "path"
import msg from "./messages"
import { v4 } from "uuid"
import fetch from "node-fetch"
import Url from "url"
import process from 'node:process';

// Returns true if the VS Code version running this extension is below the
// version specified in the "version" parameter. Otherwise returns false.
function isVSCodeBelowVersion(version: string) {
	const vscodeVersion = vscode.version;
	const vscodeVersionArray = vscodeVersion.split('.');
	const versionArray = version.split('.');
	
	for (let i = 0; i < versionArray.length; i++) {
		if (vscodeVersionArray[i] < versionArray[i]) {
			return true;
		}
	}
	return false;
}

export function activate(context: vscode.ExtensionContext) {
	// this.extensionName = 'vincent-the-gamer.neonheart';
	const appDir = path.dirname(process.mainModule!.filename);
	const isWin = /^win/.test(process.platform);
	const base = appDir + (isWin ? "\\vs\\code" : "/vs/code");
	const electronBase = isVSCodeBelowVersion("1.70.0") ? "electron-browser" : "electron-sandbox";
	const htmlFile = path.join(base, electronBase, "workbench", "workbench.html");
	const BackupFilePath = (uuid: any) =>
		path.join(base, electronBase, "workbench", `workbench.${uuid}.bak-neonheart`);

	async function getContent(url: string) {
		if (/^file:/.test(url)) {
			const fp = Url.fileURLToPath(url);
			return await fs.promises.readFile(fp);
		} else {
			const response = await fetch(url);
			return response.buffer();
		}
	}

	// main commands
	async function cmdInstall() {
		const uuidSession = v4();
		await createBackup(uuidSession);
		await performPatch(uuidSession);
	}

	async function cmdReinstall() {
		await uninstallImpl();
		await cmdInstall();
	}

	async function cmdUninstall() {
		await uninstallImpl();
		disabledRestart();
	}

	async function uninstallImpl() {
		const backupUuid = await getBackupUuid(htmlFile);
		if (!backupUuid) return;
		const backupPath = BackupFilePath(backupUuid);
		await restoreBackup(backupPath);
		await deleteBackupFiles();
	}

	// Backup
	async function getBackupUuid(htmlFilePath: string) {
		try {
			const htmlContent = await fs.promises.readFile(htmlFilePath, "utf-8");
			const m = htmlContent.match(
				/<!-- !! NEONHEART-SESSION-ID ([0-9a-fA-F-]+) !! -->/
			);
			if (!m) return null;
			else return m[1];
		} catch (e) {
			vscode.window.showInformationMessage(msg.somethingWrong + e);
			throw e;
		}
	}

	async function createBackup(uuidSession: any) {
		try {
			let html = await fs.promises.readFile(htmlFile, "utf-8");
			html = clearExistingPatches(html);
			await fs.promises.writeFile(BackupFilePath(uuidSession), html, "utf-8");
		} catch (e) {
			vscode.window.showInformationMessage(msg.admin);
			throw e;
		}
	}

	async function restoreBackup(backupFilePath: string) {
		try {
			if (fs.existsSync(backupFilePath)) {
				await fs.promises.unlink(htmlFile);
				await fs.promises.copyFile(backupFilePath, htmlFile);
			}
		} catch (e) {
			vscode.window.showInformationMessage(msg.admin);
			throw e;
		}
	}

	async function deleteBackupFiles() {
		const htmlDir = path.dirname(htmlFile);
		const htmlDirItems = await fs.promises.readdir(htmlDir);
		for (const item of htmlDirItems) {
			if (item.endsWith(".bak-neonheart")) {
				await fs.promises.unlink(path.join(htmlDir, item));
			}
		}
	}

	// Patching
	async function performPatch(uuidSession: string) {
		const config = vscode.workspace.getConfiguration("neonheart");
		if (!patchIsProperlyConfigured(config)) {
			return vscode.window.showInformationMessage(msg.notConfigured);
		}

		let html = await fs.promises.readFile(htmlFile, "utf-8");
		html = clearExistingPatches(html);

		const injectHTML = await patchHtml(config);
		html = html.replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, "");

		let indicatorJS = "";
		if (config.statusbar) indicatorJS = await getIndicatorJs();

		html = html.replace(
			/(<\/html>)/,
			`<!-- !! NEONHEART-SESSION-ID ${uuidSession} !! -->\n` +
				"<!-- !! NEONHEART-START !! -->\n" +
				indicatorJS +
				injectHTML +
				"<!-- !! NEONHEART-END !! -->\n</html>"
		);
		try {
			await fs.promises.writeFile(htmlFile, html, "utf-8");
		} catch (e) {
			vscode.window.showInformationMessage(msg.admin);
			disabledRestart();
		}
		enabledRestart();
	}
	function clearExistingPatches(html: string) {
		html = html.replace(
			/<!-- !! NEONHEART-START !! -->[\s\S]*?<!-- !! NEONHEART-END !! -->\n*/,
			""
		);
		html = html.replace(/<!-- !! NEONHEART-SESSION-ID [\w-]+ !! -->\n*/g, "");
		return html;
	}

	function patchIsProperlyConfigured(config: Record<string, any>) {
		return config && config.imports && config.imports instanceof Array;
	}

	async function patchHtml(config: Record<string, any>) {
		let res = "";
		for (const item of config.imports) {
			const imp = await patchHtmlForItem(item);
			if (imp) res += imp;
		}
		return res;
	}
	async function patchHtmlForItem(url: string) {
		if (!url) return "";
		if (typeof url !== "string") return "";

		// Copy the resource to a staging directory inside the extension dir
		let parsed = new Url.URL(url);
		const ext = path.extname(parsed.pathname);

		try {
			const fetched = await getContent(url);
			if (ext === ".css") {
				return `<style>${fetched}</style>`;
			} else if (ext === ".js") {
				return `<script>${fetched}</script>`;
			} else {
				console.log(`Unsupported extension type: ${ext}`);
			}
		} catch (e) {
			console.error(e);
			vscode.window.showWarningMessage(msg.cannotLoad(url));
			return "";
		}
	}
	async function getIndicatorJs() {
		let indicatorJsPath;
		let ext = vscode.extensions.getExtension("vincent-the-gamer.neonheart");
		if (ext && ext.extensionPath) {
			indicatorJsPath = path.resolve(ext.extensionPath, "src/statusbar.ts");
		} else {
			indicatorJsPath = path.resolve(__dirname, "statusbar.ts");
		}
		const indicatorJsContent = await fs.promises.readFile(indicatorJsPath, "utf-8");
		return `<script>${indicatorJsContent}</script>`;
	}

	function reloadWindow() {
		// reload vscode-window
		vscode.commands.executeCommand("workbench.action.reloadWindow");
	}
	function enabledRestart() {
		vscode.window
			.showInformationMessage(msg.enabled, { title: msg.restartIde })
			.then(reloadWindow);
	}
	function disabledRestart() {
		vscode.window
			.showInformationMessage(msg.disabled, { title: msg.restartIde })
			.then(reloadWindow);
	}

	const installNeonHeart = vscode.commands.registerCommand(
		"neonheart.installNeonHeart",
		cmdInstall
	);
	const uninstallNeonHeart = vscode.commands.registerCommand(
		"neonheart.uninstallNeonHeart",
		cmdUninstall
	);
	const updateNeonHeart = vscode.commands.registerCommand(
		"neonheart.updateNeonHeart",
		cmdReinstall
	);

	context.subscriptions.push(installNeonHeart);
	context.subscriptions.push(uninstallNeonHeart);
	context.subscriptions.push(updateNeonHeart);

	console.log("NeonHeart Glowing is active!");
	console.log("Application directory", appDir);
	console.log("Main HTML file", htmlFile);
}

export function deactivate() {

}