// run-migrations.js
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function runMigrations() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js"))
      .sort();

    const migrationsCollection = db.collection("migrations");

    for (const file of files) {
      const migrationName = file.replace(".js", "");
      const existingMigration = await migrationsCollection.findOne({
        name: migrationName,
      });

      if (!existingMigration) {
        const migration = require(path.join(migrationsDir, file));
        console.log(`Running migration ${file}...`);

        try {
          await migration.up(db);
          await migrationsCollection.insertOne({
            name: migrationName,
            timestamp: new Date(),
          });
          console.log(`Migration ${file} completed successfully.`);
        } catch (upError) {
          console.error(`Error running migration ${file} (up):`, upError);

          try {
            console.log(`Attempting rollback for migration ${file}...`);
            await migration.down(db); // Call the down function
            console.log(
              `Rollback for migration ${file} completed successfully.`
            );

            // Remove the migration from the tracking collection since it failed
            await migrationsCollection.deleteOne({ name: migrationName });
          } catch (downError) {
            console.error(
              `Error during rollback for migration ${file}:`,
              downError
            );
            // Consider logging to a separate error file or alerting.
            // You might want to halt the entire process here.
            throw new Error(
              `Migration ${file} failed and rollback also failed: ${upError.message}, ${downError.message}`
            );
          }
          throw upError; // Re-throw the original up error to stop further migrations
        }
      } else {
        console.log(`Migration ${file} already run, skipping.`);
      }
    }

    console.log("All migrations completed.");
  } catch (error) {
    console.error("Migration process failed:", error);
  } finally {
    await client.close();
  }
}

runMigrations().catch(console.error);
