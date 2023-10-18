# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-beta.0] - 2022-09-14

### Added

- Initial version of sdk.

## [0.1.0-beta.1] - 2022-09-15

### Added

- On-boarding and credits section in README.

## [0.1.0-beta.2] - 2022-09-21

### Changed

- Server endponits

## [0.1.0-beta.3] - 2022-09-22

### Added

- Value Extraction feature
- Add license and value extraction in API section of README.
- Add CHANGELOG.md file.
- Documented some code.

### Changed

- Moved `valueContribution` code into generalized function `protocolValue`.
- Rename brand name from DAppzero to Spock in README.
- JSON formatting utils.

### Fixed

- Multiple reject txn logging.
- Wallet disconnect expection.
- Parse data in ls event.

## [0.1.0-beta.4] - 2022-09-26

### Changed

- Provider event attach function.
- Server endpoints

### Fixed

- README typo

## [0.1.0-beta.5] - 2022-10-04

### Fixed

- Document reference for same domain.

## [0.1.0-beta.6] - 2022-10-10

### Fixed

- RPC request method and params for new versions of ethers.js.

## [0.1.0-beta.7] - 2022-10-21

### Fixed

- `Fortmatic` typo in wallet constants.

## [0.1.0] - 2022-11-03

### Changed

- Remove beta tag from sdk

## [0.1.1] - 2023-01-08

### Changed

- End session functionality on account and chain change.
- Add submit and reject txn count in session data.
- Config eslint, lint-staged and husky.

## [0.1.2] - 2023-02-03

### Changed

- Convert user ip fetching as a one time procedure.
- Add ip support on all server routes.
- Deprecate value contribution functions.

### Fixed

- Navigation record in session.
- New session starting on chain change.
- Session duration bug.

## [1.0.0-beta.0] - 2023-05-05

### Added

- Indentification, link distinctId with users(wallet).
- New meta-data properties with all tracking events.
- UTM paramters tracking.
- Opt out support for make tracking consentful for the required application.

### Changed

- Improve session tracking through server support.
- Removed deprecated value contribution functions.
- Separated pathname and search parameters for `trackPageView`.

## [1.0.0-beta.1] - 2023-05-05

### Added

- Make geolocation tracking optional.

## [1.0.0-beta.2] - 2023-05-05

### Fixed

- Cookie handling with consent.
- DistinctId key bug.

## [1.0.0-beta.3] - 2023-05-06

### Fixed

- Events flow in session.
- Geolocation tracking on intial events.

## [1.0.0-beta.4] - 2023-05-10

### Fixed

- Add txn hash on txn-submit tracking.
- Expire session on wallet or chain change.

## [1.0.0-beta.5] - 2023-05-12

### Fixed

- Session expiry handling on page unload.

## [1.0.0-beta.6] - 2023-05-29

### Fixed

- Add txn status in event flow tracking.

## [1.0.0] - 2023-06-11

### Fixed

- Update constants documentation.
- Remove beta

## [1.0.1] - 2023-06-17

### Fixed

- Backward compatibility for old version device-id
- Remove beta

## [1.1.0] - 2023-08-22

### Added

- Allow user to limit the tracking of datapoints by passing the desired one on initialization.

## [1.2.0] - 2023-09-08

### Added

- Revert the latest version back to 1.1.0 state.

## [1.3.0] - 2023-09-10

### Added

- Widget support through iframe.
- Pass events data into to widget.
- Custom widget on-click handling.
- Add engage data point.

## [1.3.2] - 2023-09-11

### Added

- Engage data-points in README.
- Widget on-click method in API section of README.

### Fixed

- Type of widget on-click method params.

## [1.3.3] - 2023-09-12

### Fixed

- SDK Version constant

## [1.4.0] - 2023-09-12

### Added

- Add popup events in session flow.

## [1.5.0-beta.0] - 2023-10-18

### Changed

- Datapoints category.
- Make web2 tracking optional, like sessions, visits.
- Allow widget to serve campaign for exlcuded datapoints. (Just to serve camapaign not to track user data).

### Added

- Test version for widget.
