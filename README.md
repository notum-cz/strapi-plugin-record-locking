# Strapi plugin record-locking

This plugin provides the functionality to prevent data loss in cases where multiple users are simultaneously editing the same record within STRAPI v5.

**When a user attempts to edit a record that is already being edited, a warning will be displayed.**

![Record Locking Plugin Example](./record-locking.png)

## ⚠️ Plugin version 2.x aimed at Strapi v5

Plugin version 2.x is aimed at Strapi V5. If you need support for Strapi V4, please follow the 1.x releases. What's new:

- TypeScript rewrite.
- Overall code refactor to make it safer & more readable.
- Strapi V5 support.
  - Records are now matched based on `document_id` attribute.

### Migration from 1.x to 2.x

Since the plugin does not retain any data, we're not providing migration scripts for the database. Strapi should update the columns automatically, however if this does not happen, you can update the columns manually when migrating to Strapi V5:

- column `entityType` has been renamed to `entityId`
- column `entityIdentifier` has been renamed to `entityDocumentId`

### Newer plugin features only on 2.x
- The new plugin features like allowing takeover of existing locks or configuring specific collections to include or exclude from locking are available only on version 2.x that works with Strapi V5.

## 🙉 What does the plugin do for you?

✅ Safeguards against concurrent editing by restricting access to a record to a single user at a time.

✅ Provides clear visibility of the current editing user, enabling you to easily identify who is working on the record.

✅ Allows taking over the editing lock from the currently editing user, if needed.

## 🧑‍💻 Installation

### 1. Install the plugin with your favourite package manager:

```
npm i @notum-cz/strapi-plugin-record-locking
```

```
yarn add @notum-cz/strapi-plugin-record-locking
```

### 2. Create or modify file `config/plugins.js` and include the following code snippet:

```js
module.exports = ({ env }) => ({
  'record-locking': {
    enabled: true,
  },
});
```

We use websockets and you can determine the necessary transport yourself:

```js
module.exports = ({ env }) => ({
  'record-locking': {
    enabled: true,
    config: {
      transports: ['websocket'],
    },
  },
});
```

If you do not specify a transport, the default parameters will be applied:

```js
DEFAULT_TRANSPORTS: ['polling', 'websocket', 'webtransport'];
```

### 3. Enable websocket support by configuring the Strapi middleware.

In the `config/middlewares.js` file either replace `'strapi::security'` with a middleware object (see the example below) or update your existing configuration accordingly.

1. Ensure that `contentSecurityPolicy.directives.connect-src` array includes `"ws:"` and `"wss:"`.
2. Rebuild Strapi and test record locking features.
3. You should not encounter any `Content Security Policy` errors in the console.

```js
module.exports = [
  'strapi::errors',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:", "ws:", "wss:", "http:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
          ],
          "media-src": ["'self'", "data:", "blob:"],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors', ...
```

> While optional, it is highly **recommended** to implement this step to prevent Socket.io from falling back to the HTTP protocol and generating the following error in the web console.  
> `Refused to connect to <protocol>://<url> because it does not appear in the connect-src directive of the Content Security Policy`

---

### 3. Enable the takeover feature.
In the `config/plugin.ts`, enable the `Takeover` button via the following configuration change (this button is disabled by default):

```
module.exports = ({ env }) => ({
  'record-locking': {
    enabled: true,
    config: {
      showTakeoverButton: true,
    },
  },
});
```
- Once this configuration is enabled, the the modal that specifies that an entry is being edited by another user will have a `Takeover` button.

![Record Locking Plugin Takeover Feature](./before-takeover.png)

- Clicking this button will change the record lock to the user taking over.
- The user previously editing will see a modal with a message that the entry has been taken over.

![Record Locking Plugin Takeover Feature](./after-takeover.png)

### 4. Configure specific collections to include or exclude from locking
By default, record locking is performed for every collection and single-type in the setup. To enable record locking only for a subset of collections or single-types, use the following plugin configuration.

#### 4.1. Enable locking only for a specified list of collections
To enable locking only for a provided list of collections or single-types, use the `include` configurable. In the below example, locking is enabled only for `article` and `post` collections:

```
module.exports = ({ env }) => ({
  'record-locking': {
    enabled: true,
    config: {
      include: ['api::article.article', 'api::post.post'],
    },
  },
});

```

#### 4.2. Disable locking for a specified list of collections
To exclude only a certain list of collections or single-types from locking, use the `exclude` configurable. In the below example, locking is enabled for all the collections except the `user` table belonging to Users-Permissions plugin.

```
module.exports = ({ env }) => ({
  'record-locking': {
    enabled: true,
    config: {
      exclude: ['plugin::users-permissions.user'],
    },
  },
});

```

⚠️ Use only one of `include` and `exclude` configurables. If both are specified, only the `include` list considered and `exclude` list is ignored.


## 🐛 Bugs

We manage bugs through [GitHub Issues](https://github.com/notum-cz/strapi-plugin-record-locking/issues). <br>
If you're interested in helping us, you would be a rock ⭐.

## 🧔 Authors

The main star: **Martin Čapek** https://github.com/martincapek <br>
Original Maintainer: **Ondřej Mikulčík** https://github.com/omikulcik <br>
Active Maintainer: **Dominik Juriga** https://github.com/dominik-juriga <br>
Project owner: **Ondřej Janošík** <br>

## 💬 Community

Join our [Discord server](https://discord.gg/hZRCcfWq) to discuss new features, implementation challenges or anything related to this plugin.

### 🚀 Created with passion by [Notum Technologies](https://notum.cz/en)

- Official STRAPI partner and Czech based custom development agency.
- We're passionate about sharing our expertise with the open source community, which is why we developed this plugin. 🖤

### 🎯 [How can Notum help you with your STRAPI project?](https://notum.cz/en/strapi/)

✔️ We offer valuable assistance in developing custom STRAPI, web, and mobile apps to fulfill your requirements and goals.. <br>
✔️ With a track record of 100+ projects, our open communication and exceptional project management skills provide us with the necessary tools to get your project across the finish line.<br>
📅 To initiate a discussion about your Strapi project, feel free to reach out to us via email at sales@notum.cz. We're here to assist you!

## 🔑 Keywords

- [strapi](https://www.npmjs.com/search?q=keywords:strapi)
- [plugin](https://www.npmjs.com/search?q=keywords:plugin)
- [record](https://www.npmjs.com/search?q=keywords:record)
- [lock](https://www.npmjs.com/search?q=keywords:lock)
