<div align="center">
<h1>INFOBIP - PWSRP</h1>
<h3>INFOBIP - Partnership WhatsApp Sender Registration Platform</h3>
</div>

<div align="center">
<a target="_blank" href="https://img.shields.io/badge/xubingyang-made-brightgreen"><img src="https://img.shields.io/badge/xubingyang-made-brightgreen" alt="Made by Bingyang Xu"></a>
<a target="_blank" href="https://img.shields.io/badge/infobip-partners-brightgreen"><img src="https://img.shields.io/badge/infobip-partner-brightgreen" alt="Infobip Partner"></a>
<a target="_blank" href="https://github.com/standard/standard"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style"></a>
<a target="_blank" href="https://github.com/xubingyang/whatsapp-sender-registration"><img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/xubingyang/whatsapp-sender-registration"></a>
<a target="_blank" href="https://www.codefactor.io/repository/github/xubingyang/whatsapp-sender-registration"><img alt="CodeFactor Grade" src="https://img.shields.io/codefactor/grade/github/xubingyang/whatsapp-sender-registration"></a>
<a target="_blank" href="https://github.com/xubingyang/whatsapp-sender-registration"><img alt="Code lines Count" src="https://tokei.rs/b1/github/xubingyang/whatsapp-sender-registration"></a>
<a target="_blank" href="https://app.travis-ci.com/github/xubingyang/whatsapp-sender-registration"><img src="https://app.travis-ci.com/xubingyang/whatsapp-sender-registration.svg?branch=main" alt="Build Status"></a>
<a target="_blank" href="https://inch-ci.org/github/xubingyang/whatsapp-sender-registration"><img src="https://inch-ci.org/github/xubingyang/whatsapp-sender-registration.svg?branch=main" alt="Inline docs"></a>
<a target="_blank" href="https://github.com/xubingyang/whatsapp-sender-registration"><img alt="GitHub" src="https://img.shields.io/github/license/xubingyang/whatsapp-sender-registration"></a>
<a target="_blank" href="https://github.com/xubingyang/whatsapp-sender-registration"><img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/y/xubingyang/whatsapp-sender-registration"></a>
<a target="_blank" href="https://github.com/xubingyang/whatsapp-sender-registration"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/xubingyang/whatsapp-sender-registration"></a>
</div>


## Node.js Application

You need to have `Node.js` installed on your computer (https://nodejs.org/en/).

Create `config.env` file in the `./config` project directory, and fill it with data:
```
NODE_ENV=
PORT=
ADMIN_EMAIL=

MONGO_URI=mongodb+srv://xubingyang:<MONGO_PASSWORD>@whatsapp-sender-registr.lrvox.mongodb.net/<MONGO_COLLECT_NAME>?retryWrites=true&w=majority
MONGO_PASSWORD=
APP_NAME=
MONGO_COLLECT_NAME=

LOG_TIME_ZONE=Asia/Tokyo
LOG_LANGUAGE=zh-cn
LOG_FORMAT=YYYY年MM月DD日, dddd, HH:mm:ss z

JWT_SECRET=
JWT_EXPIRE=12h
JWT_COOKIE_EXPIRE_HOUR=12

PASSWORD_EXPIRE_TIME_MINUTE=10

MAILGUN_API_KEY=
MAILGUN_DOMAIN=
FROM_EMAIL=
FROM_NAME=
TO_EMAIL=

LIMITER_HOUR=1
LIMITER_MAX=100
LIMITER_SKIP_FAILED_REQUESTS=true
```

Then in the `/` project directory:
 
- install needed dependencies by running:
    ### `yarn`
- test application by running:
    ### `yarn run test`
- start backend application by running:
    ### `yarn run server`
- start front application by running:
    ### `yarn run client`
- start backend and front of application by running:
    ### `yarn run dev`
- start the application by running:
    ### `yarn start`

## Disclaimer: 
*This project is a personal project.*

## Feature: 
- [x] Help Infobip Partners onboard their end-client with WhatsApp Sender Registration
- [x] Automatically send emails to Infobip Support Team

## Roadmap [^roadmap]
- Working on multi-tenant.
##
[^roadmap]: *Maybe no roadmap for this project.* :D

This project is using prettier and standart for checking JavaScript style.
<div align="center">
<a target="_blank" href="https://github.com/standard/standard"><img src="https://cdn.rawgit.com/standard/standard/master/badge.svg" alt="js-standard-style"></a>
</div>