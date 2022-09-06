# # Strapi plugin record-locking

### Hey I am editing, don't change my content! Plugin

This plugin provides the ability to stop data loss when two users are editing the same record in STRAPI v4

### Benefits

✅ Have only one user editing one record at a time
✅ Clearly shows you who is the other user editing the record

## 🧑‍💻 Install

```
npm i @notum-cz/strapi-plugin-record-locking

yarn add @notum-cz/strapi-plugin-record-locking
```

## <br> <br> 🖐 ⚠️ Read before installation  
---

### <br> 1. You need to create/modify file `config/plugins.js` with

```js
module.exports = ({ env }) => ({
 "record-locking": {
    enabled: true,
  },
});
```

### <br> 2. To suppport websocket protocol configure strapi middleware

*For the `config/middlewares.js` file you will need to either replace `'strapi::security'` with middleware object (example below) or update your existing configuration accordingly...*
1. Ensure that `"ws:"` and `"wss:"` are present in strapi::security config under  **`contentSecurityPolicy.directives.connect-src`**
2. Rebuild strapi and test record locking features.
3. There should be no `Content Security Policy` error in the console.

```js
module.exports = [
  'strapi::errors',
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:",  "wss:", "http:"],
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
> This is optional but **recommended** as Socket.io will fallback to using http protocol and throws the following error in web console...  
`Refused to connect to <protocol>://<url> because it does not appear in the connect-src directive of the Content Security Policy`
---
## 🛣️ Road map

- ✨ Option to choose specific collection types
- ✨ Add a "Takeover" button
- ✨ Possibility to choose roles prioritization (Author cannot Takover SuperAdmin)


## 🐛 Bugs

We are using [GitHub Issues](https://github.com/notum-cz/strapi-plugin-record-locking/issues) to manage bugs. <br>
If you want to help us you would be a rock ⭐.

## 🧔 Authors

The main star: **Martin Čapek** https://github.com/martincapek <br>
Developer: **Filip Janko** https://github.com/fikoun <br>
Project owner: **Ondřej Janošík** <br>

#### 🚀 Created with passion by [Notum Technologies](https://notum.cz/en)

- Official STRAPI partner and Czech based custom development agency.
- We love to share expertise with the open source community, that's why this plugin was created. 🖤

### 🎯 [How can Notum help you with your STRAPI project?](https://notum.cz/en/strapi/)

✔️ We can help you develop custom STRAPI, web and mobile apps. <br>
✔️ With 100+ projects, open communication and great project management we have the tools to get your project across the finish line.<br>
📅 If you want to discuss your Strapi project, text us at info@notum.cz

## Keywords

- [strapi](https://www.npmjs.com/search?q=keywords:strapi)
- [plugin](https://www.npmjs.com/search?q=keywords:plugin)
- [record](https://www.npmjs.com/search?q=keywords:record)
- [lock](https://www.npmjs.com/search?q=keywords:lock)
