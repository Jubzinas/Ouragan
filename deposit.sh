#!/bin/bash
RPC_URL=$1
source .env && forge script script/TornadoMultipleDeposit.s.sol --broadcast --rpc-url ${RPC_URL}