const fs = require("fs");
const path = require("path");

const seedDirectory = path.join(__dirname, "seed");

async function runSeeds() {
  try {
    const files = fs.readdirSync(seedDirectory);

    for (const file of files) {
      if (file.endsWith(".js")) {
        const seedPath = path.join(seedDirectory, file);
        const seedModule = require(seedPath);

        if (typeof seedModule.seed === "function") {
          console.log(`Running seed: ${file}`);
          await seedModule.seed(); // Assuming each seed file exports an async 'seed' function
          console.log(`Seed ${file} completed.`);
        } else {
          console.warn(`Warning: ${file} does not export a 'seed' function.`);
        }
      }
    }
    console.log("All seeds completed.");
  } catch (error) {
    console.error("Error running seeds:", error);
  }
}

runSeeds(); // Immediately execute the function when the script is run.
