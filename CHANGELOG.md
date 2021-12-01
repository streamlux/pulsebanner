# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Discord webhook on user signup
- Useful timestamps: updatedAt for banners, createdAt for users

## [0.1.9] - 2021-11-29

### Fixed

- Handle duplicate streamup notifications without breaking

## [0.1.8] - 2021-11-29

### Added

- Share to Twitter widget on banner page
- Help link to Discord server 
- Social media links to footer

## [0.1.7] - 2021-11-29

### Fixed

- Connect accounts modal not popping up after connecting to Twitter on banner page

## [0.1.6] - 2021-11-29

### Fixed

- Stream thumbnail URLs were not getting fetched and passed into the Remotion server API call
- Webhooks admin panel
- API issue with /api/twitch/notification where we were getting the wrong element in array causing 500's.

### Added

- Sample image banner backgrounds that any user level can use. Let users understand how the background images work.
- Added toasts for when the banner is enabled/disabled letting users know the banner will/will not update next time they start streaming.

## [0.1.5] - 2021-11-24

### Added 

- Added redirect from `/` to `/banner`.
- Restricted custom image setting for background to paying users only.

## [0.1.4] - 2021-11-24

Initial pre-release 
