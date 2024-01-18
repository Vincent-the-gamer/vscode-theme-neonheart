export default {
    admin: "Run VS Code with admin privileges so the changes can be applied.",
	enabled:
		"NeonHeart glow enabled. Restart to take effect. " +
		"If Code complains about it is corrupted, CLICK DON'T SHOW AGAIN. " +
		"See README for more detail.",
	disabled: "NeonHeart glow disabled and reverted to default. Restart to take effect.",
	already_disabled: "NeonHeart glow already disabled.",
	somethingWrong: "Something went wrong: ",
	restartIde: "Restart Visual Studio Code",
	notfound: "NeonHeart glow not found.",
	notConfigured:
		"NeonHeart glow path not configured. " +
		'Please set "neonheart.imports" in your user settings.',
	reloadAfterVersionUpgrade:
		"Detected reloading CSS / JS after VSCode is upgraded. " + "Performing application only.",
	cannotLoad: (url: string) => `Cannot load '${url}'. Skipping.`
}