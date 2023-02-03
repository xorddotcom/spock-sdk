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

- Covert user ip fetching as a one time procedure.
- Add ip support on all server routes.
- Deprecate value contribution functions.

### Fixed

- Navigation record in session.
- New session starting on chain change.
- Session duration bug.
