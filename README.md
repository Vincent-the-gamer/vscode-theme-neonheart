<img src="./.github/banner.png"/>
<h1 align="center">VS Code Theme NeonHeart</h1>
<p align="center">An opinionated Visual Studio Code theme.</p>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=vincent-the-gamer.neonheart" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/vincent-the-gamer.neonheart.svg?color=4d9375&amp;label=Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
</p>

<p align="center">
    <b><i>Let the neon lights colorize your heart. (๑•̀ㅂ•́)و✧</i></b>
</p>

# Installation

Search `neonheart` in VS Code extension menu.

# Enable Code Glowing (Yeeeeeah!!!!)

From `v0.1.8`, you don't need to install `Custom CSS and JS` plugin, because `NeonHeart` has bundled it !!!

All you need to do is configuring your path to `glow.css` in `settions.json`.

> [!WARNING]
> `file://` is required!!!!

macOS:

```json
"neonheart.imports": [
    "file:///Users/{USER_NAME}/.vscode/extensions/vincent-the-gamer.neonheart-{plugin-version}/glow.css"
],
```

Windows: 
```json
"neonheart.imports": [
    "file://C:/Users/{USER_NAME}/.vscode/extensions/vincent-the-gamer.neonheart-{plugin-version}/glow.css"
],
```

Linux:

```json
"neonheart.imports": [
    "file:///home/{USER_NAME}/.vscode/extensions/vincent-the-gamer.neonheart-{plugin-version}/glow.css"
],
```

Then, run `Enable NeonHeart Glowing`

- `Ctrl + Shift + P` or `Command + Shift + P`
- Input `enable neonheart glowing`

    ![enable](./.github/enable.png)

And happy hacking~~~ ☆´∀｀☆

# Preview

## Normal
![theme](./.github/theme.png)

## Glowing
![glowing](./.github/glowing-preview.png)

# Publish
```shell
pnpm run build
pnpm run publish
```

# Changelog
View [Changelog](./CHANGELOG.md)

# License
[MIT](./LICENSE)

# Special Thanks
Custom CSS and JS Loader: 
[be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)