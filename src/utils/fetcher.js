import { pick, cloneDeep } from 'lodash'

/**
 * @typedef {Object} FetcherOptions
 * @property {string} url
 * @property {string} method
 * @property {BodyInit | null} body
 * @property {Object} headers
 * @property {RequestMode} mode
 * @property {string} cache
 * @property {RequestCredentials} credentials
 * @property {string} redirect
 * @property {string} referrer
 * @property {ReferrerPolicy} referrerPolicy
 * @property {string} integrity
 * @property {RequestDestination} destination
 * @property {boolean} keepalive
 * @property {AbortSignal} signal
 */

export class Fetcher {
  options = /** @type {Partial<FetcherOptions>} */ ({})

  /**
   * @constructor
   * @param {Request | RequestInfo | Fetcher} [args] 
   */
  constructor(args) {
    const init = () => {
      if (typeof args === 'undefined') {
        return
      }
      if (args instanceof Fetcher) {
        this.options = cloneDeep(args.options)
        return
      }
      if (args instanceof Request) {
        this.options = this.resolveOptions(args)
        return
      }
      this.options = this.resolveOptions(args)
    }
    init()
  }

  static create(args) {
    return new Fetcher(args)
  }

  /**
   * @param {Partial<FetcherOptions>} options
   * @returns {Partial<FetcherOptions>}
   */
  resolveOptions(options) {
    const pickKey = ['url', 'method', 'body', 'headers', 'mode', 'cache', 'credentials', 'redirect', 'referrer', 'referrerPolicy', 'integrity', 'destination', 'keepalive', 'signal']
    return cloneDeep(pick(options, pickKey))
  }

  /**
   * @param {Partial<FetcherOptions>} options
   * @returns {Fetcher}
   */
  setOptions(options) {
    this.options = this.resolveOptions({
      ...this.options,
      ...options,
    })
    return this
  }

  clone() {
    return new Fetcher(this)
  }
  
  /**
   * @param {Partial<FetcherOptions>} options
   * @returns {Promise<[Request,Response]>}
   * @example
   * let fetcher = Fetcher.create()
   *   .setOptions({ url: '/api/user' })
   *   .setOptions({ method: 'GET' })
   *   .send()
   */
  send(options = {}) {
    return new Promise((resolve, reject) => {
      const { url, ...rest } = Object.assign({}, this.options, options)
      const req = new Request(url, rest)
      try {
        return fetch(req).then((res) => resolve([req, res]))
      } catch (error) {
        return reject(error)
      }
    })
  }
}