const { expect } = require("chai");
const { ethers } = require("hardhat");
const { delay, toBigNum, fromBigNum, saveFiles } = require("../utils");

var owner;
var userWallet;
var provider;
var isDevelopment = true;

var config = {
    initialprice: toBigNum("0.01", 6),
    start: 0,
    period: 24 * 3600,
    hikeRate: toBigNum("0.01", 6),
    roundCount: 10,
    bnbPrice: toBigNum("300", 6)
}
//test
var Busd = { address: "0xe9e7cea3dedca5984780bafc599bd69add087d56" };
var XBT = { address: "0xe329102DA0E7E135656CD72CDc983c81f27CB5B6" };
var exchangeRouter = { address: "0x989e555316F2cEF1949d782Fd875995F83b65FA0" };
var exchangeFactory = { address: "0xfdD9410cE89e43DdBe53E3fECf87535223564759" };
var WETH = { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" };

//main contract
var Presale;

describe("Create UserWallet", function () {
    it("Create account", async function () {
        [owner] = await ethers.getSigners();
        console.log(owner.address);

        provider = owner.provider;
        userWallet = ethers.Wallet.createRandom();
        userWallet = userWallet.connect(ethers.provider);

        // if (isDevelopment) {
        //     var tx = await owner.sendTransaction({
        //         to: userWallet.address,
        //         value: toBigNum("100", 18)
        //     });
        //     await tx.wait();
        // }
    });
});

if (isDevelopment) {
    describe("Exchange deploy", function () {

        it("Factory deploy", async function () {
            const Factory = await ethers.getContractFactory("ICICBSwapFactory");
            exchangeFactory = await Factory.deploy(owner.address);
            await exchangeFactory.deployed();
            console.log(await exchangeFactory.INIT_CODE_PAIR_HASH())
            console.log(exchangeFactory.address);
        });

        it("WETH deploy", async function () {
            const WETH_ = await ethers.getContractFactory("WETH");
            WETH = await WETH_.deploy();
            await WETH.deployed();
            console.log(WETH.address);
        });

        it("Router deploy", async function () {
            const Router = await ethers.getContractFactory("ICICBSwapRouter");
            exchangeRouter = await Router.deploy(exchangeFactory.address, WETH.address);
            await exchangeRouter.deployed();
            console.log(exchangeRouter.address);
        });
    });
}

describe("test contract deployment", function () {
    it("busd deploy", async function () {
        const ERC20 = await ethers.getContractFactory("Token");
        if (isDevelopment) {
            Busd = await ERC20.deploy(toBigNum("10000000000000000000"));
            await Busd.deployed();
            var tx = await Busd.transfer(userWallet.address, toBigNum("1000000"));
            await tx.wait();
        } else {
            Busd = ERC20.attach(Busd.address);
        }
        console.log(Busd.address);
    });

    it("XBT deploy", async function () {
        const ERC20 = await ethers.getContractFactory("Token");
        if (isDevelopment) {
            XBT = await ERC20.deploy(toBigNum("10000000000000000000"));
            await XBT.deployed();
        } else {
            XBT = ERC20.attach(XBT.address);
        }
        console.log(XBT.address);
    });
});

describe("contract deployment and setConfig", function () {
    it("Presale deploy", async function () {
        const Presale_ = await ethers.getContractFactory("Presale");
        Presale = await Presale_.deploy();
        await Presale.deployed();
        console.log(Presale.address);

        var tx = await XBT.transfer(Presale.address, toBigNum("20000000"));
        await tx.wait();
    });

    it("set Config", async function () {
        // set init addresses
        var tx = await Presale.setInitAddresses(XBT.address, Busd.address, exchangeRouter.address);
        await tx.wait();

        // set Terms
        tx = await Presale.setTerms(
            config.initialprice,
            config.start,
            config.period,
            config.hikeRate,
            config.roundCount,
            config.bnbPrice
        );
        await tx.wait();
    });
});

// if (isDevelopment) {
//     describe("contract test - user side", function () {

//         it("Presale buy with BNB ", async function () {
//             var tx = await (Presale.connect(userWallet)).buy({ value: toBigNum("1") });
//             await tx.wait();

//             var tokenBalance = await XBT.balanceOf(userWallet.address);
//             expect(tokenBalance).to.equal(toBigNum("30000"))
//         });

//         it("Presale buy with BUSD", async function () {
//             var tx = await (Busd.connect(userWallet)).approve(Presale.address, toBigNum("10000"));
//             await tx.wait();
//             tx = await (Presale.connect(userWallet)).buyWithBusd(toBigNum("10"));
//             await tx.wait();

//             var tokenBalance = await XBT.balanceOf(userWallet.address);
//             expect(tokenBalance).to.equal(toBigNum("30000").add(toBigNum("1000")))
//         });
//     })

//     describe("contract test - admin side", function () {

//         it("add liquidity with BNB ", async function () {
//             var tokenBalance1 = await XBT.balanceOf(Presale.address);
//             var tx = await Presale.addLiquidity(toBigNum("0.5"), toBigNum("15000"), toBigNum("0"), toBigNum("0"));
//             await tx.wait();

//             var tokenBalance2 = await XBT.balanceOf(Presale.address);
//             expect(tokenBalance1.sub(tokenBalance2)).to.equal(toBigNum("15000"));
//         });

//         it("buy for BNB ", async function () {
//             var Balance1 = await provider.getBalance(Presale.address);
//             var tx = await Presale.buyBNB(toBigNum("0.1"), toBigNum("0"));
//             await tx.wait();

//             var Balance2 = await provider.getBalance(Presale.address);
//             expect(Balance1.sub(Balance2)).to.equal(toBigNum("0.1"));
//         });

//         it("add liquidity with BUSD ", async function () {
//             var tokenBalance1 = await XBT.balanceOf(Presale.address);
//             var tx = await Presale.addLiquidityBUSD(toBigNum("5"), toBigNum("500"), toBigNum("0"), toBigNum("0"));
//             await tx.wait();

//             var tokenBalance2 = await XBT.balanceOf(Presale.address);
//             expect(tokenBalance1.sub(tokenBalance2)).to.equal(toBigNum("500"));
//         });

//         it("buy for BUSD ", async function () {
//             var Balance1 = await Busd.balanceOf(Presale.address);
//             expect(Balance1).to.equal(toBigNum("5"));
//             var tx = await Presale.buyBUSD(toBigNum("1"), toBigNum("0"));
//             await tx.wait();

//             var Balance2 = await Busd.balanceOf(Presale.address);
//             expect(Balance1.sub(Balance2)).to.equal(toBigNum("1"));
//         });
//     })

//     describe("owner test - user side", function () {
//         var OwnerContract;
//         it("OwnerContract deploy ", async function () {
//             const OwnerContract_ = await ethers.getContractFactory("owner");
//             OwnerContract = await OwnerContract_.deploy();
//             await OwnerContract.deployed();
//             console.log(OwnerContract.address);

//             var tx = await OwnerContract.setAddresses(XBT.address, exchangeRouter.address, exchangeFactory.address, Busd.address, WETH.address, Presale.address);
//             await tx.wait();

//             tx = await Presale.transferOwnership(OwnerContract.address);
//         });

//         it("OwnerContract buy with BNB", async function () {
//             var tx = await OwnerContract.addAndRemoveLiquidity(toBigNum("0.1"), toBigNum("15000"), toBigNum("0"), toBigNum("0"));
//             await tx.wait();
//         });
//     })
// }

describe("save files", function () {
    it("save abis", async function () {
        const PresaleABI = artifacts.readArtifactSync("Presale").abi;
        const ERC20ABI = artifacts.readArtifactSync("ERC20").abi;
        const RouterABI = artifacts.readArtifactSync("ICICBSwapRouter").abi;
        await saveFiles("abis.json", JSON.stringify({
            Presale: PresaleABI,
            ERC20: ERC20ABI,
            Router: RouterABI
        }, undefined, 4));
    });
    it("save addresses", async function () {
        await saveFiles("addresses.json", JSON.stringify({
            Presale: Presale.address,
            XBT: XBT.address,
            Busd: Busd.address,
            Router: exchangeRouter.address
        }, undefined, 4));
    });
});