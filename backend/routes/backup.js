import express from 'express';
import { dbConfig } from '../db.js';
import { upload } from '../upload.js';
import mysqldump from 'mysqldump';

const router = express.Router();

router.get("/backup", (req, res) => {
  mysqldump({
    connection: dbConfig,
    dumpToFile: process.env.BACKUP_FILE_PATH,
  })
    .then(() => res.send("Backup created successfully!"))
    .catch((error) => res.status(500).send("Error creating backup: " + error.message));
});

//Fetch DMB Data

router.post("/restore", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const exec = require("child_process").exec;
  const command = `mysql -u root -p"" apbs_db < ${filePath}`;

  exec(command, (error) => {
    if (error) {
      res.status(500).send("Error restoring database: " + error.message);
    } else {
      res.send("Database restored successfully!");
    }
  });
});

//Download DB

router.get("/download", (req, res) => {
  const filePath = "(C:)/backup.sql";
  res.download(filePath, "backup.sql", (err) => {
    if (err) {
      res.status(500).send("Error downloading backup: " + err.message);
    }
  });
});

// LOG IN

export default router;
