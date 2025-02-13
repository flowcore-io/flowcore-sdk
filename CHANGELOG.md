# Changelog

## [1.11.7](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.6...v1.11.7) (2025-02-13)


### Bug Fixes

* next cursor in timebuckets is a number ([4cfb89f](https://github.com/flowcore-io/flowcore-sdk/commit/4cfb89f58bf69898df3e7dd9bbe2c28ff93078de))

## [1.11.6](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.5...v1.11.6) (2025-02-13)


### Bug Fixes

* limit invalid response to 1000 chars and add test ([93a8dfe](https://github.com/flowcore-io/flowcore-sdk/commit/93a8dfe75e68617e85c30d75c171a9713b8f5730))

## [1.11.5](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.4...v1.11.5) (2025-02-13)


### Bug Fixes

* add websocket import ([073aa8c](https://github.com/flowcore-io/flowcore-sdk/commit/073aa8ce2c7f1bd548bc762816f480f00f6ee126))
* output errors in invalid response exception ([c5c9c58](https://github.com/flowcore-io/flowcore-sdk/commit/c5c9c58841a2f91b995cf938293ab024fbc1118a))
* remove import ([4b76831](https://github.com/flowcore-io/flowcore-sdk/commit/4b7683191ecd7cab84e814ec1285e90f5b9ac320))

## [1.11.4](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.3...v1.11.4) (2025-02-12)


### Bug Fixes

* do not reconnect on 1005 ([4949d97](https://github.com/flowcore-io/flowcore-sdk/commit/4949d978c98412a5019a0cd6614d418cad10dc59))
* use code 1000 when manually disconnecting ([c83202d](https://github.com/flowcore-io/flowcore-sdk/commit/c83202d42e23aeb3d41cfc93ee131b21b2ba11f6))

## [1.11.3](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.2...v1.11.3) (2025-02-12)


### Bug Fixes

* add isopen and isconnecting to notification client ([fa90737](https://github.com/flowcore-io/flowcore-sdk/commit/fa907373c05a255889978190bea9a6e3750b18f9))
* add return types ([c51fbac](https://github.com/flowcore-io/flowcore-sdk/commit/c51fbac0d4fd1ac6208451837fb192afa3ffa6bb))

## [1.11.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.1...v1.11.2) (2025-02-12)


### Bug Fixes

* import node buffer ([6e6caa0](https://github.com/flowcore-io/flowcore-sdk/commit/6e6caa0707bb58987939e39898b32e574e7194f8))

## [1.11.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.0...v1.11.1) (2025-02-12)


### Bug Fixes

* fix import of rxjs ([3dcc724](https://github.com/flowcore-io/flowcore-sdk/commit/3dcc724d1ae1884441ba26b9c3abf5d24c67edd0))

## [1.11.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.10.3...v1.11.0) (2025-02-11)


### Features

* Add notification client with WebSocket support ([f573957](https://github.com/flowcore-io/flowcore-sdk/commit/f57395798baecfb4f5385820912c996e5bc7e641))
* Enhance NotificationClient with dynamic data fetching ([7398919](https://github.com/flowcore-io/flowcore-sdk/commit/739891977d862fedc06154ef4b936187f638fa34))
* Improve WebSocket compatibility and data parsing in NotificationClient ([b2867d3](https://github.com/flowcore-io/flowcore-sdk/commit/b2867d397ac3db2ca8894a738c3ef18ed1805775))


### Bug Fixes

* Improve tenant and connection handling in NotificationClient ([0fd04c2](https://github.com/flowcore-io/flowcore-sdk/commit/0fd04c22db8a585786bea1fed15a6cbbb3d8f265))

## [1.10.3](https://github.com/flowcore-io/flowcore-sdk/compare/v1.10.2...v1.10.3) (2025-02-07)

### Bug Fixes

- flowtype delete request
  ([66488ff](https://github.com/flowcore-io/flowcore-sdk/commit/66488ffccef62f6eefb0661c6166f3ff5bb6a82f))

## [1.10.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.10.1...v1.10.2) (2025-02-07)

### Bug Fixes

- add eventtype truncate command
  ([1f8d4b0](https://github.com/flowcore-io/flowcore-sdk/commit/1f8d4b0afa89e427b5835fa933208f6508d0c578))

## [1.10.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.10.0...v1.10.1) (2025-02-07)

### Bug Fixes

- disable retry for create resource commands
  ([c97f990](https://github.com/flowcore-io/flowcore-sdk/commit/c97f99017aaf6deef7ca431a61b5b4c322c3788f))

## [1.10.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.9.3...v1.10.0) (2025-02-03)

### Features

- add tests ([9590ea8](https://github.com/flowcore-io/flowcore-sdk/commit/9590ea8f95b23e219615c3219ae52c042925893f))

### Bug Fixes

- add explicit return
  ([5b30642](https://github.com/flowcore-io/flowcore-sdk/commit/5b3064238fd0c353c43ce9b7af5d42a434ff6e6f))
- add more tests
  ([814cb94](https://github.com/flowcore-io/flowcore-sdk/commit/814cb943df9cf5934530dfeec8db7167c4cc1273))

## [1.9.3](https://github.com/flowcore-io/flowcore-sdk/compare/v1.9.2...v1.9.3) (2025-02-03)

### Bug Fixes

- make description in update optional
  ([5b86c38](https://github.com/flowcore-io/flowcore-sdk/commit/5b86c387b4c1b414fe94c10a9c56d069dc772138))

## [1.9.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.9.1...v1.9.2) (2025-01-31)

### Bug Fixes

- fix event type model
  ([c5a2168](https://github.com/flowcore-io/flowcore-sdk/commit/c5a216896c1ab1d69fca9b2ef7a86de46a24f1cc))

## [1.9.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.9.0...v1.9.1) (2025-01-30)

### Bug Fixes

- add deleting and truncating
  ([d0333a2](https://github.com/flowcore-io/flowcore-sdk/commit/d0333a2ffe2a136b981a9e41b440df0c8bcd0be2))

## [1.9.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.8.0...v1.9.0) (2025-01-30)

### Features

- delete protected renamed to delete protection
  ([181a7ae](https://github.com/flowcore-io/flowcore-sdk/commit/181a7ae857b1ede5ada394ccd8ffd1385b733aa1))

## [1.8.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.7.0...v1.8.0) (2025-01-22)

### Features

- **data-core:** :sparkles: add isDeleting and isTruncating fields to DataCoreSchema and DataCoreV0Schema
  ([b9dd8b2](https://github.com/flowcore-io/flowcore-sdk/commit/b9dd8b2dfa8291cc420c7659b1b60a169297dc4b))

## [1.7.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.6.0...v1.7.0) (2025-01-12)

### Features

- added method to override and exported command error
  ([e78a053](https://github.com/flowcore-io/flowcore-sdk/commit/e78a0534283d483ecac1c6bcd35637d452240380))

## [1.6.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.5.0...v1.6.0) (2024-12-31)

### Features

- **exports:** :technologist: export parsed helper method
  ([4f781bc](https://github.com/flowcore-io/flowcore-sdk/commit/4f781bcf1ca0169f8b8b4361b201e2f38ea61d7c))

## [1.5.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.4.5...v1.5.0) (2024-12-19)

### Features

- add retry to client
  ([b202c56](https://github.com/flowcore-io/flowcore-sdk/commit/b202c5660f42a02bbd45db043d48713effe658a6))

### Bug Fixes

- update readme ([bf233bc](https://github.com/flowcore-io/flowcore-sdk/commit/bf233bc27b15892b5813c2121b7221d08c7b7d63))
- update readme ([3ffbe49](https://github.com/flowcore-io/flowcore-sdk/commit/3ffbe499e6014e64a8c420eead2763539cb5412c))
- use retryable status codes
  ([89a8919](https://github.com/flowcore-io/flowcore-sdk/commit/89a8919492c55614851779ff77ddc3f7fcde51e0))

## [1.4.5](https://github.com/flowcore-io/flowcore-sdk/compare/v1.4.4...v1.4.5) (2024-12-19)

### Bug Fixes

- expose flowcore event
  ([cd20a6c](https://github.com/flowcore-io/flowcore-sdk/commit/cd20a6c10591613f7813a52120395aa87311aba2))

## [1.4.4](https://github.com/flowcore-io/flowcore-sdk/compare/v1.4.3...v1.4.4) (2024-12-09)

### Bug Fixes

- choose files to include in publish
  ([9cc35a9](https://github.com/flowcore-io/flowcore-sdk/commit/9cc35a937f2a2342ece9319a1dc25407bfcab8df))

## [1.4.3](https://github.com/flowcore-io/flowcore-sdk/compare/v1.4.2...v1.4.3) (2024-12-09)

### Bug Fixes

- fix npm package url
  ([12e38d0](https://github.com/flowcore-io/flowcore-sdk/commit/12e38d07277a62e1bf8b8ce30cc88a02769a6ecd))

## [1.4.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.4.1...v1.4.2) (2024-12-09)

### Bug Fixes

- release npm ([e87287f](https://github.com/flowcore-io/flowcore-sdk/commit/e87287f5b7b47145733e7b1c8835a185e1f84f10))

## [1.4.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.4.0...v1.4.1) (2024-12-09)

### Bug Fixes

- release npm ([0f77599](https://github.com/flowcore-io/flowcore-sdk/commit/0f77599d6b476219b700e1beccf3e8e77a0caecd))

## [1.4.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.3.1...v1.4.0) (2024-12-09)

### Features

- release on npm also
  ([a53921d](https://github.com/flowcore-io/flowcore-sdk/commit/a53921d0e384ca6897f089af614692b841ff7087))

### Bug Fixes

- update deno.lock file
  ([b2e90bc](https://github.com/flowcore-io/flowcore-sdk/commit/b2e90bc0b0ee917764d0628277f0aa0e793b3da5))

## [1.3.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.3.0...v1.3.1) (2024-12-06)

### Bug Fixes

- add secret list and variable list
  ([75bf201](https://github.com/flowcore-io/flowcore-sdk/commit/75bf2013e8539aeb1f92ebcd5fdb96c197f6731e))
- add tenant list and api key list
  ([18cfb18](https://github.com/flowcore-io/flowcore-sdk/commit/18cfb18286342a3e51595d648b369cd7195def33))
- added more commands
  ([feef2ad](https://github.com/flowcore-io/flowcore-sdk/commit/feef2adc7be749f126c9d10a454dbc195e2198d6))
- change client options
  ([d4d7553](https://github.com/flowcore-io/flowcore-sdk/commit/d4d75532135c91c862cf46d407a3afea990a5cea))
- interface fix ([32cde1f](https://github.com/flowcore-io/flowcore-sdk/commit/32cde1f129cc0a94b3497ece0ac9da6431a56c96))

## [1.3.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.2.3...v1.3.0) (2024-12-05)

### Features

- refactor and new commands
  ([b3cb108](https://github.com/flowcore-io/flowcore-sdk/commit/b3cb1087f47d48c34571515aa690b6a995597f94))

### Bug Fixes

- fix typo ([9485cf7](https://github.com/flowcore-io/flowcore-sdk/commit/9485cf72072c74e31c2c08fcf1fa14d052299b84))
- lint fix ([e9da973](https://github.com/flowcore-io/flowcore-sdk/commit/e9da97398696d9f8294501dc7a5fadd5a20f92ff))

## [1.2.3](https://github.com/flowcore-io/flowcore-sdk/compare/v1.2.2...v1.2.3) (2024-12-02)

### Bug Fixes

- add tenant to event
  ([62d2cda](https://github.com/flowcore-io/flowcore-sdk/commit/62d2cda90ba8cfcbdefb69a8dff0050bc31802ab))

## [1.2.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.2.1...v1.2.2) (2024-12-02)

### Bug Fixes

- fix fetch events
  ([3817721](https://github.com/flowcore-io/flowcore-sdk/commit/3817721b697d1092acfdf6868861f9fe9770b6ba))

## [1.2.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.2.0...v1.2.1) (2024-12-02)

### Bug Fixes

- cursor is string
  ([b837899](https://github.com/flowcore-io/flowcore-sdk/commit/b8378992329a700d1673c4b2111ea4a2ac72e4ff))

## [1.2.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.1.0...v1.2.0) (2024-12-02)

### Features

- use v2 rest ([7ae42fa](https://github.com/flowcore-io/flowcore-sdk/commit/7ae42fae697385885986e1190385d571839473aa))

### Bug Fixes

- use event from contracts
  ([9d6e861](https://github.com/flowcore-io/flowcore-sdk/commit/9d6e8619d0bd53e954572cce80810f9699bc68df))

## [1.1.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.0.2...v1.1.0) (2024-11-08)

### Features

- api key options for client
  ([e132756](https://github.com/flowcore-io/flowcore-sdk/commit/e1327568d7d66adddce2344a1ffad8d5c7348514))

## [1.0.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.0.1...v1.0.2) (2024-11-07)

### Bug Fixes

- command set method
  ([0d74a68](https://github.com/flowcore-io/flowcore-sdk/commit/0d74a68c058c4671765abaac3788f74dd1c86c1d))

## [1.0.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.0.0...v1.0.1) (2024-11-07)

### Bug Fixes

- add readme ([9fbeff5](https://github.com/flowcore-io/flowcore-sdk/commit/9fbeff5e985234f398bd916df2ad3e9d1188aa21))
- and again ([fa56cd4](https://github.com/flowcore-io/flowcore-sdk/commit/fa56cd4830d13b05c2b4c6048b4447e6d380af8c))
- and again ([de86297](https://github.com/flowcore-io/flowcore-sdk/commit/de86297dccba09af1541468125749ff4f567f3a6))
- expose command class + add v2 events commands
  ([c3ac222](https://github.com/flowcore-io/flowcore-sdk/commit/c3ac222613ca82c6e8ba364ca6ffc67b356b6a3f))
- try again ([fa56cd4](https://github.com/flowcore-io/flowcore-sdk/commit/fa56cd4830d13b05c2b4c6048b4447e6d380af8c))
- try again ([816665f](https://github.com/flowcore-io/flowcore-sdk/commit/816665ff80632ffcfe1835ca3ada34d7c560b7f1))
- try monorepo ([fa56cd4](https://github.com/flowcore-io/flowcore-sdk/commit/fa56cd4830d13b05c2b4c6048b4447e6d380af8c))
- try monorepo ([fa56cd4](https://github.com/flowcore-io/flowcore-sdk/commit/fa56cd4830d13b05c2b4c6048b4447e6d380af8c))
- try monorepo ([849b01d](https://github.com/flowcore-io/flowcore-sdk/commit/849b01da4080e8c938653c6a5fdb32d9031a6439))
- update lock file
  ([178f15e](https://github.com/flowcore-io/flowcore-sdk/commit/178f15e3f62f5d775992a126e7b9d38b0a4278fc))
- update lock file
  ([fa56cd4](https://github.com/flowcore-io/flowcore-sdk/commit/fa56cd4830d13b05c2b4c6048b4447e6d380af8c))
- update lock file
  ([3291649](https://github.com/flowcore-io/flowcore-sdk/commit/3291649080e6e53543352e4b9969a35095ecc5c0))

## 1.0.0 (2024-10-25)

### Initial Release

- Initial release
