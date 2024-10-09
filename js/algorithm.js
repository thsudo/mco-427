// This file represents the "algorithm." It knows who the players are, infers their interests, and determines what content from the "internet" is recommended.
export const personas = {
    hannah: {
        name: "Hannah",
        age: 23,
        location: "Chicago, IL",
        gender: "female",
        primary_interest: "taylor_swift",
    },
    aiden: {
        name: "Aiden",
        age: 15,
        location: "Philadelphia, PA",
        gender: "male",
        primary_interest: "video_games",
    },
    ben: {
        name: "Ben",
        age: 17,
        location: "Raleigh, NC",
        gender: "male",
        primary_interest: "literature",
    }
}

// these represent inferences the algorithm makes based on interests of each persona
// and what users the algorithm deems similar to them are interested in
export const algorithm_assumptions = {
    chappell_roan: ["LGBTQ+", "pop_music", "sabrina_carpenter"],
    pop_music: ["taylor_swift", "chappell_roan"],
    taylor_swift: ["travis_kelce", "pop_music", "pop_culture"],
    travis_kelce: ["kansas_city_chiefs", "nfl", "football", "jason_kelce"],
    age: {
        15: ["video_games", "sports", "streaming", "climate_change"],
        17: ["college", "tiktok", "twitch", "youtube", "climate_change"],
        23: ["climate_change", "dating", "tiktok", "youtube", "gen_z", "grad_school"],
    },
    gender: {
        female: ["instagram", "youtube", "pinterest", "tiktok", "pop_music"],
        male: ["video_games", "pranks", "twitch", "discord", "reddit", "football"]
    },
    pop_culture: ["taylor_swift", "chappell_roan", "fashion", "social_media", "memes"],
    literature: ["poetry", "booktok", "books"],
    video_games: ["fortnite", "minecraft", "valorant"]
}
