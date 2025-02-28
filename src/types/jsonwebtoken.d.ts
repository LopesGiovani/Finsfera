declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: object
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: object
  ): string | object | Buffer;

  export function decode(
    token: string,
    options?: object
  ): null | { [key: string]: any } | string;

  export default {
    sign,
    verify,
    decode,
  };
}
