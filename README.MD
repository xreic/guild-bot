# Discord bot for Crowned

Just a simple Discord bot to make my life easier

## Permissions Setup
[Discord Dev Site](https://discord.com/developers/applications)
![image](https://user-images.githubusercontent.com/32492656/143509311-3a18fa7d-c2f9-452f-8e2d-85dac80c376b.png)

## Sheets API Credentials

## Deplying on Heroku
I deployed on Heroku, but you can do whatever you want.\
If you do Heroku too, then you might experience an issue where Heroku tries to run you app with a `web` dyno instead of a `worker` dyno (like we specify in the Procfile). You can see this when you open the application logs.\
To fix this, you're going to need to:
1. Install the Heroku CLI
2. Login via the Heroku CLI
3. Run the following command
> heroku scale web=0 worker=1 --app <APP_NAME>

## APIs
- [Sheets API](https://developers.google.com/sheets)
