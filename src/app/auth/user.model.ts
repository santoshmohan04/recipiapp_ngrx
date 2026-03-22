/**
 * User model for authenticated users
 * Handles JWT token and expiration
 */
export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

  /**
   * Get the current token if it hasn't expired
   * Returns null if token is expired
   */
  get token(): string | null {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }

  /**
   * Check if token is still valid
   */
  get isValid(): boolean {
    return !!this.token;
  }

  /**
   * Get token expiration date
   */
  get tokenExpirationDate(): Date {
    return this._tokenExpirationDate;
  }

  /**
   * Get time remaining until token expires (in milliseconds)
   */
  get timeUntilExpiration(): number {
    if (!this._tokenExpirationDate) {
      return 0;
    }
    return this._tokenExpirationDate.getTime() - new Date().getTime();
  }
}
