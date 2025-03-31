# Changelog

## [1.24.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.24.0...v1.24.1) (2025-03-31)


### Bug Fixes

* add role list command ([9d7909e](https://github.com/flowcore-io/flowcore-sdk/commit/9d7909ea4cce70ca173715fb6ac5dd4dc799015c))
* add role list command ([c7f5695](https://github.com/flowcore-io/flowcore-sdk/commit/c7f56958426e86fc753742d3390dcd7225cbcc78))

## [1.24.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.23.0...v1.24.0) (2025-03-31)


### Features

* add iam role associations commands ([e7ea5b6](https://github.com/flowcore-io/flowcore-sdk/commit/e7ea5b615a9efa08acb71cfab4d2901ac810b5af))
* add iam role associations commands ([4760d8f](https://github.com/flowcore-io/flowcore-sdk/commit/4760d8f178b940c4e9054dececd9950e9b61f34e))

## [1.23.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.22.2...v1.23.0) (2025-03-27)


### Features

* remove deprecated commands ([4b49c13](https://github.com/flowcore-io/flowcore-sdk/commit/4b49c13737ff49cb9a384c15fe292a3efdb0c2b8))
* remove deprecated commands ([4b78d07](https://github.com/flowcore-io/flowcore-sdk/commit/4b78d078ff4d0587f3bbdc2100485b93595b76aa))

## [1.22.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.22.1...v1.22.2) (2025-03-27)


### Bug Fixes

* change datacore list command ([5b75ed9](https://github.com/flowcore-io/flowcore-sdk/commit/5b75ed9a11410404e585800d782951c3a96451f6))

## [1.22.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.22.0...v1.22.1) (2025-03-27)


### Bug Fixes

* **tenant:** :art: make configurationRepoCredentials required in tenant schema ([8fc755d](https://github.com/flowcore-io/flowcore-sdk/commit/8fc755dba5afccac58a034c14fb5881c4868a653))
* **tenant:** :art: remove unused TOptional type from tenant schema ([d757d09](https://github.com/flowcore-io/flowcore-sdk/commit/d757d09dd8eb211a4730822c04ea374463d0b347))

## [1.22.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.21.3...v1.22.0) (2025-03-27)


### Features

* **tenant:** :sparkles: add configurationRepoCredentials to tenant schema ([69e5c10](https://github.com/flowcore-io/flowcore-sdk/commit/69e5c10dd9d8b5a2b8f8f1ff36055cd280182142))


### Bug Fixes

* **tenant:** :art: make configurationRepoCredentials optional in tenant schema ([a9324fd](https://github.com/flowcore-io/flowcore-sdk/commit/a9324fd8ed381a77bfb79b889eaa69ed7950d13a))

## [1.21.3](https://github.com/flowcore-io/flowcore-sdk/compare/v1.21.2...v1.21.3) (2025-03-27)


### Bug Fixes

* add temp list datacore command ([5004bea](https://github.com/flowcore-io/flowcore-sdk/commit/5004beac0e194a063b6a61f261eb3c5298cf0de7))

## [1.21.2](https://github.com/flowcore-io/flowcore-sdk/compare/v1.21.1...v1.21.2) (2025-03-26)


### Bug Fixes

* ignore 403 from tenant fetch command ([c9c49df](https://github.com/flowcore-io/flowcore-sdk/commit/c9c49df3e61d0d93bb795d59e52b7202d65d805f))
* ignore 403 from tenant fetch command ([984f1da](https://github.com/flowcore-io/flowcore-sdk/commit/984f1da2ca75377ef590ca07fd46ea88b507f365))

## [1.21.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.21.0...v1.21.1) (2025-03-26)


### Bug Fixes

* change union literals to string (to make forward compatible) ([9b8c14d](https://github.com/flowcore-io/flowcore-sdk/commit/9b8c14d3b25485e2b3ca26a5fbdb86c35e2a493d))
* **event-type:** :bug: add tenant to EventListCommand ([7b7e989](https://github.com/flowcore-io/flowcore-sdk/commit/7b7e9898bab300d55261d53667f704193b373620))
* permissions should never return action.all (*) ([d28c20d](https://github.com/flowcore-io/flowcore-sdk/commit/d28c20d43f41db560c535fcb12c6e97ceeae2ec9))
* permissions should never return action.all (*) ([48190e2](https://github.com/flowcore-io/flowcore-sdk/commit/48190e29f703ae6b0eae087d9dcae5aea66c410e))

## [1.21.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.20.0...v1.21.0) (2025-03-24)


### Features

* add permissions list command ([8c0bb59](https://github.com/flowcore-io/flowcore-sdk/commit/8c0bb594d9110f69209047ad252bf5e7a1a1a483))
* add permissions list command ([66c4f75](https://github.com/flowcore-io/flowcore-sdk/commit/66c4f75033a42458c5b4db7403b69188fd46b8e3))
* rework dedicated tenant ([45e1887](https://github.com/flowcore-io/flowcore-sdk/commit/45e1887e4468db9ba18964ebac0cdf326e1763fa))


### Bug Fixes

* add explicit type for permission schema ([d541a83](https://github.com/flowcore-io/flowcore-sdk/commit/d541a8321a7c238df7ea29cc344e99d1f8a7ae44))
* fix eventtypeinfo command ([72e04e2](https://github.com/flowcore-io/flowcore-sdk/commit/72e04e2290913a10660dd4c872e5b9ec4c50067f))
* remove node-cache ([ddc409d](https://github.com/flowcore-io/flowcore-sdk/commit/ddc409d22100a12252968d8afdd5bf66a0eff28d))

## [1.20.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.19.1...v1.20.0) (2025-03-21)


### Features

* **command:** :sparkles: add support for dedicated URLs in command structure ([d80d56c](https://github.com/flowcore-io/flowcore-sdk/commit/d80d56cd4cea37e886315812fa85569d7ffa39f8))
* **commands:** :sparkles: add support for dedicated URLs in multiple command classes ([0d26cb5](https://github.com/flowcore-io/flowcore-sdk/commit/0d26cb5bad1bd9c75c186265dc09472cdc1c5493))


### Bug Fixes

* **flowcore-client:** :art: update import statement for Tenant type to use type-only import ([448580e](https://github.com/flowcore-io/flowcore-sdk/commit/448580ef38dc8130178ed2df55e2c976ea6740f0))
* **tests:** :bug: Fix memory leaks in NodeCache timers by adding close() method ([407d348](https://github.com/flowcore-io/flowcore-sdk/commit/407d348f2d9eaec79fa8cb15229224b13d562f90))

## [1.19.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.19.0...v1.19.1) (2025-03-17)


### Bug Fixes

* **security:** :art: update PATSchema to use optional description and add createdAt field ([389907f](https://github.com/flowcore-io/flowcore-sdk/commit/389907fec1e060a3cb99cc3231a6fe86696ff035))

## [1.19.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.18.0...v1.19.0) (2025-03-17)


### Features

* **security:** :sparkles: add commands for exchanging Personal Access Tokens (PAT) ([8b42470](https://github.com/flowcore-io/flowcore-sdk/commit/8b42470423d8904bd210e887f4377751f0b8981a))

## [1.18.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.17.0...v1.18.0) (2025-03-17)


### Features

* **security:** :sparkles: add commands for managing Personal Access Tokens (PAT) ([4c3760a](https://github.com/flowcore-io/flowcore-sdk/commit/4c3760aa880c8bbd793b64a9653080fa308b64e7))


### Bug Fixes

* **security:** :art: remove unused import for PAT and PATSchema ([4d281d6](https://github.com/flowcore-io/flowcore-sdk/commit/4d281d6bf75f122448f9d62aa395d95b96faf221))

## [1.17.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.16.0...v1.17.0) (2025-03-07)


### Features

* add tenant to dataCore schema and remove v0 schemas ([f710f14](https://github.com/flowcore-io/flowcore-sdk/commit/f710f1427f86b7730162e05f0935829ae139534d))
* add tenant to dataCore schema and remove v0 schemas ([91158d2](https://github.com/flowcore-io/flowcore-sdk/commit/91158d25cb5838072a8785051dbcc82d28a0aa26))


### Bug Fixes

* add tenant arg to fetch datacore ([92b5e29](https://github.com/flowcore-io/flowcore-sdk/commit/92b5e296031d728c90b1f965033ee090bd8e06f2))
* fix tests ([ea249d4](https://github.com/flowcore-io/flowcore-sdk/commit/ea249d4c3d1076df4f4cba521bf97316a57769aa))
* fix tests ([99ffaf8](https://github.com/flowcore-io/flowcore-sdk/commit/99ffaf859040d6f057c522a27f2d53d6963b1fd0))

## [1.16.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.15.0...v1.16.0) (2025-03-06)


### Features

* add custom command and bucket/event list commands ([ec37bc7](https://github.com/flowcore-io/flowcore-sdk/commit/ec37bc7125f85c03f3a5f3357d59e6fe11f145ae))
* add custom command and bucket/event list commands ([081c338](https://github.com/flowcore-io/flowcore-sdk/commit/081c3381db0a0b5d513fc9cc6fefce02fe071921))


### Bug Fixes

* **container-registry:** :bug: Update import statements for container registry commands ([802e15a](https://github.com/flowcore-io/flowcore-sdk/commit/802e15a05616b41da49032c579291940e9cd5057))
* fix imports ([e6cf6b9](https://github.com/flowcore-io/flowcore-sdk/commit/e6cf6b92596dbaad48938818e4d62180c508b401))

## [1.15.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.14.0...v1.15.0) (2025-03-05)


### Features

* **commands:** :sparkles: Add fetch first and last timebuckets command ([f134e59](https://github.com/flowcore-io/flowcore-sdk/commit/f134e59e274740c6f460681944200082ab8fc69a))

## [1.14.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.13.0...v1.14.0) (2025-03-05)


### Features

* **tenant:** :sparkles: Add tenant name to ID translation command ([7d16207](https://github.com/flowcore-io/flowcore-sdk/commit/7d1620762a5b99b9ae9cb9b25d07b9222fdd5e9f))


### Bug Fixes

* **tenant:** :art: Improve type definitions for tenant translate name to ID schema ([232c441](https://github.com/flowcore-io/flowcore-sdk/commit/232c4417b34b42130f093a10f0daf7657e011c32))

## [1.13.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.12.1...v1.13.0) (2025-03-05)


### Features

* change client error message to include response body ([67ee317](https://github.com/flowcore-io/flowcore-sdk/commit/67ee31700dc48022f98f403a984eae28a0648cc2))
* **commands:** :sparkles: Add waitfordelete and waitfortruncate to new delete/truncate commands ([3ffcf57](https://github.com/flowcore-io/flowcore-sdk/commit/3ffcf5748f641df185bf8dc6984b8b7fdd7509a8))
* **commands:** :sparkles: Delete/truncate request commands for datacore, flowtype and eventtype ([418708c](https://github.com/flowcore-io/flowcore-sdk/commit/418708c91e3a5893618f059648f540be01bae8cc))


### Bug Fixes

* export new commands ([84264cd](https://github.com/flowcore-io/flowcore-sdk/commit/84264cd136c1b03ab10a83e5f59b777193f927a4))
* force ([388db43](https://github.com/flowcore-io/flowcore-sdk/commit/388db43bd22bbe4ccd724f34ca1956bb8c42b192))

## [1.12.1](https://github.com/flowcore-io/flowcore-sdk/compare/v1.12.0...v1.12.1) (2025-03-03)


### Bug Fixes

* **tenant:** :recycle: Simplify tenant configuration schema ([4f1bbcb](https://github.com/flowcore-io/flowcore-sdk/commit/4f1bbcb80329148ef5d68726600a246eaee34de5))

## [1.12.0](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.10...v1.12.0) (2025-02-28)


### Features

* change tenant fetch command to use rest api ([81bb088](https://github.com/flowcore-io/flowcore-sdk/commit/81bb08869313ddb2b91ad7820a901d481f82f83c))


### Bug Fixes

* fix import ([e78844d](https://github.com/flowcore-io/flowcore-sdk/commit/e78844db2acb969d3800d319627ce2833502f606))
* fix typos in comments ([551e257](https://github.com/flowcore-io/flowcore-sdk/commit/551e25720926cb2b2b4f028f5a1b717c54eb8fdf))
* remove none from tenant dedicated status ([38a970a](https://github.com/flowcore-io/flowcore-sdk/commit/38a970ab10aa89d405eb71471330e358f0086b41))

## [1.11.10](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.9...v1.11.10) (2025-02-14)


### Bug Fixes

* allow api key in notification client ([62269e9](https://github.com/flowcore-io/flowcore-sdk/commit/62269e94e3fee0fcb7a38c30cd8a595982ea1af9))
* fix auth interface ([077b727](https://github.com/flowcore-io/flowcore-sdk/commit/077b727bb24234b58036cca6aba5aad5f7b310d0))
* rename url params ([395b47d](https://github.com/flowcore-io/flowcore-sdk/commit/395b47ddd57f2f79693eacb91fa14aeb5ba43332))

## [1.11.9](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.8...v1.11.9) (2025-02-14)


### Bug Fixes

* handle error response in tenant list ([0cbf9f5](https://github.com/flowcore-io/flowcore-sdk/commit/0cbf9f5c8d526c1d1ebe2d22624f02c603115130))

## [1.11.8](https://github.com/flowcore-io/flowcore-sdk/compare/v1.11.7...v1.11.8) (2025-02-13)


### Bug Fixes

* tiebucket input cursor is number ([67515dd](https://github.com/flowcore-io/flowcore-sdk/commit/67515dd731343b81c76512172572f5362e56535c))

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
