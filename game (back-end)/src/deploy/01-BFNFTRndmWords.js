const { ethers, network } = require("hardhat");
const { networks } = require("../hardhat.config");
const { networkConfig, developmentNets } = require("../helper-hardhat-config");
require("dotenv").config();

const { verify } = require("../utils/blockchainUtils/etherscanVerifyContract");
const {
    updateFrontEndData,
    FRONT_END_CONTRACTS_TESTING_FILE,
} = require("../blockchainScripts/updateFrontEnd");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    let inDevNet = developmentNets.includes(network.name);
    const nOfConfitmations = inDevNet ? 1 : 6;
    let coordinatorAddress, vrfSubsId, VRFCoordinatorV2MockContract;

    // console.log("Deploying BFNFT...")

    let VRFCoordinatorV2Contract;
    // Testnet or local network?
    if (developmentNets.includes(network.name)) {
        // Local network => Get mocks, create && fund subsciption to VRF
        VRFCoordinatorV2MockContract = await ethers.getContract(
            "VRFCoordinatorV2Mock",
            deployer
        );
        coordinatorAddress = VRFCoordinatorV2MockContract.address;
        const transactionResponse =
            await VRFCoordinatorV2MockContract.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        vrfSubsId = await transactionReceipt.events[0].args.subId;
        await VRFCoordinatorV2MockContract.fundSubscription(
            vrfSubsId,
            ethers.utils.parseEther("40")
        );
    } else {
        // Testnet
        console.log("Deployer account ---> ", `${deployer}`);
        // Goerli => Get coordinator and subscription ID
        if (network.config.chainId == networks.goerli.chainId) {
            coordinatorAddress =
                networkConfig[networks.goerli.chainId]["vrfCoordinator"];
            vrfSubsId = networkConfig[networks.goerli.chainId]["vrfSubsId"];
        }

        const VRFCoordinatorUsedAbi = [
            "function addConsumer(uint64 subId, address consumer) external",
        ];
        const provider = new ethers.providers.JsonRpcProvider(
            process.env.GOERLI_RPC_URL,
            networks.goerli.chainId
        );
        const signer = new ethers.Wallet(process.env.DEPLOYER_SK, provider);
        VRFCoordinatorV2Contract = new ethers.Contract(
            coordinatorAddress,
            VRFCoordinatorUsedAbi,
            signer
        );
    }

    const args = [
        coordinatorAddress,
        vrfSubsId,
        networkConfig[network.config.chainId]["keyHashGasLimit"],
        networkConfig[network.config.chainId]["callBackHashLimit"],
    ];

    await deploy("BFNFTRndmWords", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: nOfConfitmations,
    });

    const BFNFTRndmWordsContract = await deployments.get("BFNFTRndmWords");
    console.log(
        "BFNFTRndmWordsContract deployed at ",
        `${BFNFTRndmWordsContract.address}`
    );
    await updateFrontEndData(BFNFTRndmWordsContract, "BFNFTRndmWords");

    if (inDevNet) {
        // Once IndependentFundsManager contract is created, add it as a consumer of the
        // subscibtion to the mocks.
        response = await VRFCoordinatorV2MockContract.addConsumer(
            ethers.utils.formatUnits(vrfSubsId, 0),
            BFNFTRndmWordsContract.address
        );
        // console.log("Consumer added.")
    } else {
        // TODO: Add independentFundsManager as a consumer to VRFCoordinator in testnet.
        await VRFCoordinatorV2Contract.addConsumer(
            process.env.GOERLI_CHAINLINK_SUBS_ID,
            BFNFTRndmWordsContract.address
        );
        console.log("BFNFTRndmWordsContract added as consumer!");

        // Verifies on Etherscan if deployed on Goerli.
        if (
            process.env.ETHERSCAN_API_KEY &&
            network.config.chainId == networks.goerli.chainId
        ) {
            await verify(BFNFTRndmWordsContract.address, args);
            console.log("Verified on Etherscan!");
        }
    }

    // Only run when testing in local network
    if (process.env.TESTING_ON_LOCAL === "true") {
        await updateFrontEndData(
            BFNFTRndmWordsContract,
            "BFNFTRndmWords",
            FRONT_END_CONTRACTS_TESTING_FILE
        );
    }
    console.log("-----------------------------------");
};

module.exports.tags = ["all", "bfnftrndmwords"];
