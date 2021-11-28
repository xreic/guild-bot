# Discord bot for Crowned

Just a simple Discord bot to make my life easier

## Setup

1. Fork the repo
2. [Setup your bot with the proper permission](https://discordjs.guide/preparations/setting-up-a-bot-application.html)
   1. ![Image of permissions](https://user-images.githubusercontent.com/32492656/143509311-3a18fa7d-c2f9-452f-8e2d-85dac80c376b.png)
3. [Setup your Sheet API Service Account](https://developers.google.com/workspace/guides/create-credentials)
   1. Select the **service account** option
   2. Also give this service account **editor** permissions
4. Make a copy of this [spreadsheet](https://docs.google.com/spreadsheets/d/1jvomrR7UV2XzH-xasM-Jduw0CzCIgFUwsxMNeZuXzZM/edit#gid=0)
   1. Delete whatever existing sheets are in your dupe.
   2. Share `editor` access with your **service account** email via the **SHARE** button at the top right of your spreadsheet
   3. If you want to "disable" the marbles stuff, just hide the column in the template
      1. Only people with the "admin role" (user defined in the env vars), will be able to utilize the `!marbles` command
5. Create an `.env` from the `.env.sample` (if you need to)
	 1. For the `CREDENTIALS` env var, just squish your key JSON into one line and throw it in there
6. Deploy on Heroku or whatever service you want
   1. Setup env vars, if you need to

## [Deploying on Heroku](https://dashboard.heroku.com)

I deployed on Heroku, but you can do whatever you want.\
If you do Heroku too, then you might experience an issue where Heroku tries to run you app with a `web` dyno instead of a `worker` dyno (like we specify in the Procfile).\
To fix this, you're going to need to:
1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login via the Heroku CLI: `heroku login`
3. Run the following command: `heroku scale web=0 worker=1 --app <APP_NAME>`

## APIs and Libraries and Stuff

- [Discord.js](https://discordjs.guide/#before-you-begin)
- [Sheets API](https://developers.google.com/sheets/api/reference/rest)
- [PM2 + Heroku](https://pm2.keymetrics.io/docs/integrations/heroku/#using-pm2-with-heroku)
