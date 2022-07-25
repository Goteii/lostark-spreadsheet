const fs = require("fs");
const express = require("express");
const app = express();
const databaseFilePath = "./Scar.xlsx - Guildmembers.csv";
const groupsFilePath = "./Scar.xlsx - Scar.csv";
const database = [];
const groups = [];
const providedGuildmates = [];

const typeDictionary = {
  database: "database",
  groups: "groups",
};

function CSVToArray(filePath, type, delimiter = ",") {
  const csvFile = fs.readFileSync(filePath);
  const csvData = csvFile.toString();

  const pattern = new RegExp(
    "(\\" +
      delimiter +
      "|\\r?\\n|\\r|^)" +
      '(?:"([^"](?:""[^"])*)"|' +
      '([^"\\' +
      delimiter +
      "\\r\\n]*))",
    "gi"
  );

  const rows = [[]];
  let matches = false;
  while ((matches = pattern.exec(csvData))) {
    const matched_delimiter = matches[1];
    if (matched_delimiter.length && matched_delimiter !== delimiter) {
      rows.push([]);
    }
    let matched_value;
    if (matches[2]) {
      matched_value = matches[2].replace(new RegExp('""', "g"), '"');
    } else {
      matched_value = matches[3];
    }
    rows[rows.length - 1].push(matched_value);
  }
  type === typeDictionary.database
    ? database.push(rows.flat())
    : groups.push(rows.flat());
}

CSVToArray(databaseFilePath, typeDictionary.database);
CSVToArray(groupsFilePath, typeDictionary.groups);

const databaseUniq = [...new Set(database[0])];
const groupsUniq = [...new Set(groups[0])];

groupsUniq.forEach((val, _i) => {
  if (databaseUniq.includes(val)) {
    providedGuildmates.push(val);
  }
});

const missingGuildmates = databaseUniq.filter(
  (guildmate) => !providedGuildmates.includes(guildmate)
);

const hostname = "127.0.0.1";
const port = 3000;

app.use(express.static(__dirname + "/public"));

app.get("", (req, res) => {
  res.render("index.ejs", {
    title: "Missing Guildmates in Spreadsheet",
    missingGuildmates,
  });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
