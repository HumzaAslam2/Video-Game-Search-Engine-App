// Module imports
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// Express App
const app = express();
// Website port number
const port = 3000;
// IGDB Acess Token
const bearerToken = "";
// API Header
const config = {
    headers: {
        "Accept": "application/json",
        "Client-ID": "",
        "Authorization": `Bearer ${bearerToken}`
    }
};

// Express form parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
// Allows for use of images and CSS files with EJS
app.use(express.static("public"));

// Root web app route
app.get("/", (req, res) => {
    // Renders the initial EJS file
    res.render("index.ejs");
});

// Search route
app.post("/search", async (req, res) => {
    try
    {
        // IGDB API Query
        let query = `fields name, involved_companies.company.name, aggregated_rating, summary, storyline, platforms.name; search "${req.body.videoGameName}";`;
        // If Result limit input is empty, return maximum search results
        if (req.body.resultLimit === '' || req.body.resultLimit === undefined)
        {
            query += " limit 500;";
        }
        // Otherwise, set a limit
        else
        {
            query += ` limit ${req.body.resultLimit};`;
        }
        // IGDB API Post request
        const response = await axios.post("https://api.igdb.com/v4/games", query, config);
        // IGDB response
        const result = response.data;
        // Formatted and processed games data
        const games = [];
        // Processes the IGDB response JSON
        for (let i = 0; i < result.length; i++)
        {
            // Temporary variable holding one game from the game object list
            const resultGame = result[i];
            // Temporary variable holding a game to hold processed data
            const game = {
                name: resultGame.name,
                companyNames: [],
                rating: resultGame.aggregated_rating,
                summary: resultGame.summary,
                storyline: resultGame.storyline,
                platforms: []
            };
            // Sets the game rating to none if it doesn't exist
            if (resultGame.aggregated_rating === undefined)
            {
                game.rating = "None";
            }
            // Otherwise, sets the game rating to a number rounded to 2 places
            else
            {
                game.rating = parseFloat(resultGame.aggregated_rating.toFixed(2));
            }
            // Sets the game summary to none if it doesn't exist
            if (resultGame.summary === undefined)
            {
                game.summary = "None";
            }
            // Sets the game storyline to none if it doesn't exist
            if (resultGame.storyline === undefined)
            {
                game.storyline = "None";
            }
            // Process the involved_companies array in the game object to add only company names to another array
            if (resultGame.involved_companies !== undefined)
            {
                resultGame.involved_companies.forEach((involved_company) => {
                    game.companyNames.push(involved_company.company.name);
                });
            }
            // Process the platforms array in the game object to add only platform names to another array
            if (resultGame.platforms !== undefined)
            {
                resultGame.platforms.forEach((platform) => {
                    game.platforms.push(platform.name);
                });
            }
            // Adds the process games data to the games array
            games.push(game);
        }
        // Renders the website EJS file with the games passed to it
        res.render("index.ejs", {games: games});
    }
    catch (error)
    {
        // Returns an error if the search fails
        console.error("Failed to fetch video game results:", error.message);
    }
});

// Listens for the Express app on port 3000
app.listen(port, () => console.log(`Server started on ${port}`));
