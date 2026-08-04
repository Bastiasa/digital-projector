import { createHash } from "crypto"

export const makeSha256 = (data:string) => {
    return createHash('SHA256')
        .update(data)
        .digest()
        .toString('hex');
}