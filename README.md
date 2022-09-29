# whistle.urlcombo

Auto version of Combo plugin for whistle.

## Usage

Install whistle and this plugin:

```bash
npm i -g whistle.urlcombo
```

Use in whistle config:

```
[matcher] urlcombo://[delimiter]:[seperator]
```

## Examples

### Nginx

```
/assets.alicdn.com/g/\?\?.*/ urlcombo://??:,
```

Rule above will apply to requests like:

```
https://assets.alicdn.com/g/??lazada/static/0.0.5/react-full-16-8.js,next/next/1.13.9/next.min.js

// becomes
https://assets.alicdn.com/g/lazada/static/0.0.5/react-full-16-8.js
https://assets.alicdn.com/g/next/next/1.13.9/next.min.js
```

### jsDelivr

```
/cdn.jsdelivr.net/combine/ urlcombo://combine:,
```

Rule above will apply to requests like:

```
https://cdn.jsdelivr.net/combine/gh/jquery/jquery@3.2/dist/jquery.min.js,gh/twbs/bootstrap@3.3/dist/js/bootstrap.min.js

// becomes
https://cdn.jsdelivr.net/combine/gh/jquery/jquery@3.2/dist/jquery.min.js
https://cdn.jsdelivr.net/combine/gh/twbs/bootstrap@3.3/dist/js/bootstrap.min.js
```
