import { sync } from '../storage';

export default class Background {
    constructor() {
        browser.storage.onChanged.addListener(::this.updateMenuItems);

        browser.runtime.onMessage.addListener((message, sender, respond) => {
            if (message.tabId != null) {
                browser.tabs
                    .sendMessage(message.tabId, message)
                    .then(message => respond(message))
                    .catch(e => respond('ConnectionError'));
                return true;
            }
        });

        this.updateMenuItems();
    }

    async updateMenuItems() {
        await browser.contextMenus.removeAll();

        await this.menuItems();
    }

    separator(parent) {
        browser.contextMenus.create({
            contexts: ['browser_action', 'page'],
            type: 'separator',
            parentId: parent
        });
    }

    item(
        options,
        title,
        key,
        {
            parent = null,
            onClick = value => sync.set('default', key, !value),
            checked = options[key]
        } = {}
    ) {
        browser.contextMenus.create({
            title,
            checked: checked,
            type: 'checkbox',
            parentId: parent,
            contexts: ['browser_action', 'page'],
            onclick: () => onClick(options[key])
        });
    }

    async menuItems() {
        const options = await sync.get('default');

        if (process.env.NODE_ENV !== 'production') {
            console.log(options);
        }

        this.item(options, 'Disable', 'disablePlugin');
        this.item(options, 'Night Mode', 'uiTheme', {
            checked: (await sync.get('default', 'uiTheme')) === 'dark',
            onClick: value => sync.set('default', 'uiTheme', value === 'dark' ? 'light' : 'dark')
        });
    }
}
