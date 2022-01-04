# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.3.2] - 2021-12-31
## Fixed

-   Return on error for banner streamdown
-   Bug with Twitter name not updating properly if they change their twitter name manually on Twitter
-   Newsletter signup

## [0.3.1] - 2021-12-29

## Changed

-   Promo sticky text shorter for mobile
-   Added umami event for edit name text
-   Refactor s3 endpoints into utils
-   Improved Twitter API error logging

## Fixed

-   username streamdown logs

## [0.3.0] - 2021-12-20

### Added

-   Holiday decorations
-   Announcement components
-   Name changer feature

### Changed

-   Pricing page layout

### Fixed

-   Catch errors uploading banner to backup bucket
-   Update pricing handling for different levels
-   Watermark now properly removed with remotion rendering

## [0.2.1] - 2021-12-11

### Fixed

-   Listing subscriptions when there are more than 100

## [0.2.0] - 2021-12-11

### Added

-   Inform users that background images should be 1500x500
-   Custom 404 page

### Changed

-   Banner page now uses server side rendering for smoother loading
-   Added another Discord invite button to banner page
-   "Share to Twitter" Tweet format so that the link doesn't get hidden on Twitter

## [0.1.23] - 2021-12-09

### Fixed

-   Banner page
-   Validate access tokens

## [0.1.22] - 2021-12-09

### Fixed

-   Not being able to save banner settings

## [0.1.21] - 2021-12-09

### Fixed

-   Fixed glitch on banner page that shows default banner instead of user settings

## [0.1.20] - 2021-12-09

### Fixed

-   Issue where members couldn't use members-only features

## [0.1.19] - 2021-12-09

### Changed

-   Use twurple library to refresh Twitch user access tokens when getting user session

## [0.1.18] - 2021-12-07

### Changed

-   Font feature is now available

## [0.1.17] - 2021-12-06

### Added

-   Users can select different font's used in their banner (hidden)
-   OG image
-   Added Discord webhook for errors

### Changed

-   Using updated Twitch auth package

## [0.1.16] - 2021-12-05

### Changed

-   Update production GitHub Actions workflow
-   Deploy nestjs to production

## [0.1.15] - 2021-12-05

### Fixed

-   Fixed twitch client token not refreshing

### Added

-   Twitch username is now option to show on your banner
-   All user banners are saved to different bucket for safe keeping and backup on sign up

## [0.1.14] - 2021-12-02

### Fixed

-   Users couldn't sign up if they had created their Twitter account using a phone number rather than an email address (for real this time)

## [0.1.13] - 2021-12-02

### Fixed

-   Users couldn't sign up if they had created their Twitter account using a phone number rather than an email address

## [0.1.12] - 2021-12-02

### Changed

-   Improved pricing page and pricing modal UI
-   Made clear that PulseBanner is free to use
-   Made some API endpoints more secure

### Added

-   Partnered users that will get professional for free
-   Cleanup code handling whether customer is paying or not

## [0.1.11] - 2021-12-01

### Fixed

-   Don't process duplicate streamup notifications

## [0.1.10] - 2021-11-30

### Added

-   Discord webhook on user signup
-   Useful timestamps: updatedAt for banners, createdAt for users

## [0.1.9] - 2021-11-29

### Fixed

-   Handle duplicate streamup notifications without breaking

## [0.1.8] - 2021-11-29

### Added

-   Share to Twitter widget on banner page
-   Help link to Discord server
-   Social media links to footer

## [0.1.7] - 2021-11-29

### Fixed

-   Connect accounts modal not popping up after connecting to Twitter on banner page

## [0.1.6] - 2021-11-29

### Fixed

-   Stream thumbnail URLs were not getting fetched and passed into the Remotion server API call
-   Webhooks admin panel
-   API issue with /api/twitch/notification where we were getting the wrong element in array causing 500's.

### Added

-   Sample image banner backgrounds that any user level can use. Let users understand how the background images work.
-   Added toasts for when the banner is enabled/disabled letting users know the banner will/will not update next time they start streaming.

## [0.1.5] - 2021-11-24

### Added

-   Added redirect from `/` to `/banner`.
-   Restricted custom image setting for background to paying users only.

## [0.1.4] - 2021-11-24

Initial pre-release
