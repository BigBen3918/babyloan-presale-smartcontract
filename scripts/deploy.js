const fs = require("fs");

const saveFiles = async (fileName, data) => {
    const fs = require("fs");
    const contractsDir = "./build/";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(contractsDir + fileName, data);
    console.log("export file", fileName);
};

const saveAbis = async () => {
    const PresaleABI = artifacts.readArtifactSync("Presale").abi;
    await saveFiles(
        "abis.json",
        JSON.stringify(
            {
                Presale: PresaleABI,
            },
            undefined,
            4
        )
    );
};

async function main() {
    saveAbis();

    //NFT
    const Presale_ = await hre.ethers.getContractFactory("Presale");
    const Presale = await Presale_.deploy();
    await Presale.deployed();
    //marketplace

    // var tx = await Presale.setConfig("http://127.0.0.1/api/getNFTdata", "30414", ethers.utils.parseUnits("0.1"))
    // await tx.wait();
    const addresses = {
        Presale: Presale.address,
    };
    await saveFiles("addresses.json", JSON.stringify(addresses, undefined, 4));
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
