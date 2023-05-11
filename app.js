const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbobject = (dbobject) => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
    jerseyNumber: dbobject.jersey_number,
    role: dbobject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
        select *
        from cricket_Team;
        `;
  const players = await db.all(getPlayerQuery);
  response.send(players.map((eachplayer) => convertDbobject(eachplayer)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getplayerQuerybyid = `
    select * 
    from cricket_Team
    where player_id=${playerId};
    `;
  const player = await db.get(getplayerQuerybyid);
  response.send(convertDbobject(player));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_Team
    (player_name,jersey_number,role)
    VALUES
    (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );
    `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        update cricket_Team
        set 
        player_name='${playerName}',
        jersey_number=${jerseyNumber},
        role='${role}'
        where player_id=${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerquery = `
        delete from cricket_Team 
        where player_id=${playerId};
    `;
  await db.run(deletePlayerquery);
  response.send("Player Removed");
});

module.exports = app;
