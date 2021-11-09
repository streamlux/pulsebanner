# PulseBanner

## Getting started

1. Install Docker engine https://www.docker.com/get-started
1. Clone repo
2. Create .env file in project root and copy paste the contents of `.env.template` in and fill in the values.
3. Run `docker-compose up -d`
4. Open adminer to verify the database and adminer started properly. Enter password from .env file. [Adminer link](http://localhost:8080/?pgsql=db&username=postgres&psql)
5. Run `npm install`
6. Run `prisma db push` *
7. Verify by viewing the newly created database 'mydb'. [Adminer link](http://localhost:8080/?pgsql=db&username=postgres&db=mydb&ns=public)
8. Run `prisma db seed` *
9. Verify by viewing the newly created rows in the products table. [Adminer link](http://localhost:8080/?pgsql=db&username=postgres&db=mydb&ns=public&select=products)
10. Run `nx run next:serve` *

Note: Running locally on windows inside of wsl may cause issues with spawning a local server. Running `Get-Service LxssManager | Restart-Service` 

_* May need to prefix command with `npx`. You can remove the need for npx by properly setting up your path._


## Local testing with Twitch webhooks

Note: This requires twitch-cli repo to be installed https://github.com/twitchdev/twitch-cli

 - To test stream is online event (streamup) run following command
    - ./twitch event trigger streamup -F http://localhost:4200/api/twitch/notification/${twitter-id-here} --secret="${secret-here}"
 - To test stream is offline event (streamdown) run following command
    - ./twitch event trigger streamdown -F http://localhost:4200/api/twitch/notification/${twitter-id-here} --secret="${secret-here}"

## Local Remotion setup for WSL

If you are dumb enough to do this on windows inside of wsl (like me) here is the steps

1. Follow these instructions to install ffmpeg and all additional requirements for linux https://www.remotion.dev/docs/#additional-step-for-linux-users
2. Install chromium-browser in wsl `sudo apt-get install chromium-browser`
3. Make sure puppeteer is installed `npm install puppeteer`
4. `sudo apt-get install -yqq daemonize`
5. `sudo apt-get install -yqq dbus-user-session`
6. `sudo apt-get install -yqq fontconfig`
7. `sudo daemonize /usr/bin/unshare --fork --pid --mount-proc /lib/systemd/systemd --system-unit=basic.target`
8. This has installed snap on your wsl system, verify running `snap version`
9. `sudo snap install chromium`
10. Good to start the server, nx run remotion:serve
