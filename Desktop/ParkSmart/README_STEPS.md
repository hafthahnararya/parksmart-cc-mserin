# Add these files into Desktop/ParkSmart (next to sensor.js)

Files: processor.js, hardhat.config.js, contracts/EnergyData.sol, scripts/deploy.js,
scripts/testStore.js, package.json (merged: has mqtt + hardhat), .gitignore

## Setup (once)
node -v            # should be v22.x
npm install

## Part 1: processor (SHA256)
Edit BASE_TOPIC in sensor.js, subscriber.js AND processor.js to the SAME unique value
Terminal A: node sensor.js
Terminal B: node processor.js     # copy one SHA256 hash, then Ctrl+C both
git add . && git commit -m "Backend processor with SHA256 hashing"

## Part 2: Hardhat
npx hardhat compile
Terminal C: npx hardhat node       # keep running
Terminal D: npx hardhat run scripts/deploy.js --network localhost
  -> copy the printed address into scripts/testStore.js (CONTRACT_ADDRESS)
  -> (optional) replace the hash in testStore.js with the one you copied
npx hardhat run scripts/testStore.js --network localhost
  expected: tx sent / tx mined / count: 1 / record[0] = sensor-001 + hash + timestamp

## README + commit
Add to README.md: RPC http://127.0.0.1:8545, Contract EnergyData, Address <yours>
git add . && git commit -m "Hardhat local deploy EnergyData" && git push
