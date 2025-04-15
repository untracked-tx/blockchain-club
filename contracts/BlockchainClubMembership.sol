// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BlockchainClubMembership is ERC721, Ownable {
    uint256 public tokenPrice = 0.01 ether;
    uint256 public nextTokenId = 1;
    string public baseTokenURI;

    constructor(string memory baseURI) ERC721("BlockchainClubMembership", "BCM") {
        baseTokenURI = baseURI;
    }

    function mintMembership() external payable {
        require(msg.value == tokenPrice, "Incorrect payment");
        _safeMint(msg.sender, nextTokenId);
        nextTokenId++;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId), ".json"));
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
