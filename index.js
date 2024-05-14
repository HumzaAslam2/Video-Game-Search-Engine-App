import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const bearerToken = "p0a8zg2agodsppssrkrv7ueyw5zznx";
const config = {
    headers: {
        "Accept": "application/json",
        "Client-ID": "x0f2ay33mf0fs5shwww8ig41e3hytt",
        "Authorization": `Bearer ${bearerToken}`
    }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/search", async (req, res) => {
    try
    {
        let query = `fields name, involved_companies.company.name, aggregated_rating, summary, storyline, platforms.name; search "${req.body.videoGameName}";`;
        if (req.body.resultLimit === '' || req.body.resultLimit === undefined)
        {
            query += " limit 500;";
        }
        else
        {
            query += ` limit ${req.body.resultLimit};`;
        }
        const response = await axios.post("https://api.igdb.com/v4/games", query, config);
        const result = response.data;
        const games = [];
        for (let i = 0; i < result.length; i++)
        {
            const resultGame = result[i];
            const game = {
                name: resultGame.name,
                companyNames: [],
                rating: resultGame.aggregated_rating,
                summary: resultGame.summary,
                storyline: resultGame.storyline,
                platforms: []
            };
            if (resultGame.aggregated_rating === undefined)
            {
                game.rating = "None";
            }
            else
            {
                game.rating = parseFloat(resultGame.aggregated_rating.toFixed(2));
            }
            if (resultGame.summary === undefined)
            {
                game.summary = "None";
            }
            if (resultGame.storyline === undefined)
            {
                game.storyline = "None";
            }
            if (resultGame.involved_companies !== undefined)
            {
                resultGame.involved_companies.forEach((involved_company) => {
                    game.companyNames.push(involved_company.company.name);
                });
            }
            if (resultGame.platforms !== undefined)
            {
                resultGame.platforms.forEach((platform) => {
                    game.platforms.push(platform.name);
                });
            }
            games.push(game);
        }
        res.render("index.ejs", {games: games});
    }
    catch (error)
    {
        console.error("Failed to fetch video game results:", error.message);
    }
});

app.listen(port, () => console.log(`Server started on ${port}`));