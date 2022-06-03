const fs = require('fs');

const { ethers } = require("hardhat");

const saveFiles = async (fileName, data) => {
    const fs = require("fs");
    const contractsDir = "./build/";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + fileName,
        data
    );
    console.log("export file", fileName);
}



/**
 * set delay for delayTimes
 * @param {Number} delayTimes - timePeriod for delay
 */
function delay(delayTimes) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayTimes);
    });
}

/**
 * change data type from Number to BigNum 
 * @param {Number} value - data that need to be change
 * @param {Number} d - decimals
 */
function toBigNum(value, d = 18) {
    return ethers.utils.parseUnits(String(value), d);
}

/**
 * change data type from BigNum to Number
 * @param {BigInt} value - data that need to be change
 * @param {Number} d - decimals
 */
function fromBigNum(value, d = 18) {
    return ethers.utils.formatUnits(value, d);
}

module.exports = { delay, toBigNum, fromBigNum, saveFiles };