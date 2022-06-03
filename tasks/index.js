const { task } = require("hardhat/config");
const addresses = require("../build/addresses.json");
const getAccount = async () => {
    var [owner] = await ethers.getSigners();
    return owner;
}

task("check-balance", "Prints out the balance of your account").setAction(async function (taskArguments, hre) {
    const account = await getAccount();
    console.log(`Account balance for ${account.address}: ${await account.getBalance()}`);
});

task("setConfig", "set config NFT contract")
    .addParam("baseUri", "baseUri", "http://127.0.0.1:5000/api/getNFTdata", types.String, true)
    .addParam("maxId", "maxId", "30414", types.String, true)
    .addParam("price", "price", "0.1", types.String, true)
    .setAction(async (taskArguments, hre) => {
        const NFT_ = await hre.ethers.getContractFactory("NFTMAP");
        const NFT = NFT_.attach(addresses.NFTMAP);
        var tx = await NFT.setConfig(taskArguments.baseUri, taskArguments.maxId, ethers.utils.parseUnits(taskArguments.price));
        await tx.wait();
        console.log(`${taskArguments.baseUri} is setted for address ${NFT.address}`)
    })


task("transferOwnership", "transfer ownership")
    .addParam("newOwner", "new Owner", "", types.String, true)
    .setAction(async (taskArguments, hre) => {
        const NFT_ = await hre.ethers.getContractFactory("NFTMAP");
        const NFT = NFT_.attach(addresses.NFTMAP);
        var tx = await NFT.setConfig(taskArguments.newOwner);
        await tx.wait();
        console.log(`${taskArguments.newOwner} is setted for address ${NFT.address}`)
    })