export interface TokenPayload {
    sub: string;       // userId
    uver: number;      // user token version
    exp: number;       
    iat?: number;
    token_type?: "access";
}