const crypto = require("crypto");
const { buildBabyjub, buildPedersenHash } = require("circomlibjs");
const utils = require("ffjavascript").utils;
const rbigint = (nbytes) => utils.leBuff2int(crypto.randomBytes(nbytes))

async function generateTornadoDepositNote() {
  let deposit = {
    secret: rbigint(31),
    nullifier: rbigint(31),
  }
  const preimage = Buffer.concat([utils.leInt2Buff(deposit.nullifier, 31), utils.leInt2Buff(deposit.secret, 31)])
  let babyJub = await buildBabyjub();
  let pedersen = await buildPedersenHash();

  const pedersenHash = data => babyJub.F.toObject(babyJub.unpackPoint(pedersen.hash(data))[0])
  deposit.commitment = pedersenHash(preimage);

  return deposit;
}

module.exports = generateTornadoDepositNote;

