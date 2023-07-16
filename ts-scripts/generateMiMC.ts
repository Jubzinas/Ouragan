//@ts-ignore
import * as circomlibjs from "circomlibjs";
import fs from "fs";

const main = async () => {
    const contractBytecode = await circomlibjs.mimcSpongecontract.createCode('mimcsponge', 220);
    const output = {
        bytecode: contractBytecode,
    }
    fs.writeFileSync("./ts-scripts/out/mimc.json", JSON.stringify(output, null, 2));


};

main().catch(console.error).then(() => process.exit());