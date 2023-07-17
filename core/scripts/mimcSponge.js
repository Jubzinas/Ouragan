// from https://github.com/BigWhaleLabs/attestor/blob/1cb4fe53a7f713ad96578490d47951188d86002b/src/helpers/Mimc7.ts
const { buildBabyjub, buildMimcSponge } = require('circomlibjs');

class MimcSponge {
    babyJub
    F
    mimcSponge

  async prepare() {
    this.babyJub = await buildBabyjub()
    this.F = this.babyJub.F
    this.mimcSponge = await buildMimcSponge()
    return this
  }
  hash(elements) {
    return this.F.toObject(this.mimcSponge.multiHash.bind(this.mimcSponge)(elements))
  }
  hashWithoutBabyJub(elements) {
    return this.mimcSponge.multiHash.bind(this.mimcSponge)(elements)
  }
}

module.exports = MimcSponge;
