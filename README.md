# # Strapi plugin record-locking

### Hey I am editing, don't change my content! Plugin

This plugin provides the ability to stop data loss when two users are editing the same record in STRAPI v4

### Benefits

â Have only one user editing one record at a time
â Clearly shows you who is the other user editing the record

## ð§âð» Install

```
npm i @notum-cz/strapi-plugin-record-locking
yarn add @notum-cz/strapi-plugin-record-locking
```

## ðâ ï¸ Read before installation

1. You need to create/modify file `config/plugins.js` with

```
module.exports = ({ env }) => ({
 "record-locking": {
    enabled: true,
  },
});
```


## ð£ï¸ Road map

- â¨ Option to choose specific collection types
- â¨ Add a "Takeover" button
- â¨ Possibility to choose roles prioritization (Author cannot Takover SuperAdmin)


## ð Bugs

We are using [GitHub Issues](https://github.com/notum-cz/strapi-plugin-record-locking/issues) to manage bugs. <br>
If you want to help us you would be a rock â­.

## ð§ Authors

The main star: **Martin Äapek** https://github.com/martincapek <br>
Project owner: **OndÅej JanoÅ¡Ã­k** <br>

#### ð Created with passion by [Notum Technologies](https://notum.cz/en)

- Official STRAPI partner and Czech based custom development agency.
- We love to share expertise with the open source community, that's why this plugin was created. ð¤

### ð¯ [How can Notum help you with your STRAPI project?](https://notum.cz/en/strapi/)

âï¸ We can help you develop custom STRAPI, web and mobile apps. <br>
âï¸ With 100+ projects, open communication and great project management we have the tools to get your project across the finish line.<br>
ð If you want to discuss your Strapi project with our CEO, book a meeting [Book a free 15min Calendly ](https://bit.ly/3thyPFX)

## Keywords

- [strapi](https://www.npmjs.com/search?q=keywords:strapi)
- [plugin](https://www.npmjs.com/search?q=keywords:plugin)
- [record](https://www.npmjs.com/search?q=keywords:record)
- [lock](https://www.npmjs.com/search?q=keywords:lock)