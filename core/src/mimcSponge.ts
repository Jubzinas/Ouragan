// Patterned from https://github.com/BigWhaleLabs/seal-cred-verifier-contract/blob/91124575b85d1ea11937e38387603cd6750f936e/utils/Mimc7.ts
import { buildBabyjub, buildMimcSponge } from 'circomlibjs';

export default class {
  private babyJub: any;
  F: any;
  private mimc7: any;

  async prepare() {
    this.babyJub = await buildBabyjub();
    this.F = this.babyJub.F;
    this.mimc7 = await buildMimcSponge();
    return this;
  }
  hash(elements: any[] | Uint8Array) {
    return this.F.toObject(this.mimc7.multiHash.bind(this.mimc7)(elements));
  }
  hashWithoutBabyJub(elements: any[] | Uint8Array) {
    return this.mimc7.multiHash.bind(this.mimc7)(elements);
  }
}
