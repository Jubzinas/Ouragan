import { utilsMarket, utilsCrypto } from 'private-market-utils';
import { Keypair } from 'maci-domainobjs';
import { EcdhSharedKey } from 'maci-crypto';

export class OuraganUser {
  user: utilsMarket.User;

  constructor(privKey: bigint | null = null) {
    if (privKey) {
      this.user = new utilsMarket.User(privKey);
    } else {
      this.user = new utilsMarket.User(utilsCrypto.getRandomECDSAPrivKey(false));
    }
  }

  generateSharedKeyWith(user: utilsMarket.User): EcdhSharedKey {
    return Keypair.genEcdhSharedKey(this.user.privJubJubKey, user.pubJubJubKey);
  }
}
