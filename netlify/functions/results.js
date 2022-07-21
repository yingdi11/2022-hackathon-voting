const createClient = require("@supabase/supabase-js").createClient;

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseKey = process.env["SUPABASE_SERVICE_KEY"];

const allowedEmails = new Set(["allowedemail@domain.com"]);

exports.handler = async (event, context) => {
    if (event.httpMethod != "GET") {
        return {
            statusCode: 403,
            body: "forbidden",
        };
    } else {
        const email = context.clientContext?.user?.email;
        // if (!email) {
        // if (!email || !allowedEmails.has(email)) {
        //     return {
        //         statusCode: 403,
        //         body: "forbidden",
        //     };
        // }
        const supabase = createClient(supabaseUrl, supabaseKey);

        let { data, error } = await supabase.from("votes").select("*");

        if (data.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ winners: [], votes: [] }),
            };
        }

        const results = {};

        const categories = [
            "grand",
            "api",
            "tech-debt",
            "big",
            "accelerator",
            "unbelievable",
            "intelligent",
            "suite",
            "delight",
        ];

        const getCounter = (team, category) => {
            if (!results[category]) results[category] = {};
            if (!results[category][team])
                results[category][team] = { count: 0 };
            return results[category][team];
        };

        const totalVotesForTeam = new Map();

        for (const row of data) {
            for (const category of categories) {
                const teams = row[category];
                for (const team of teams) {
                    const counter = getCounter(team, category);
                    counter.count++;
                    totalVotesForTeam.set(
                        team,
                        (totalVotesForTeam.get(team) ?? 0) + 1
                    );
                }
            }
        }

        const counts = [];

        for (const category in results) {
            for (const team in results[category]) {
                counts.push({
                    category,
                    team,
                    count: results[category][team].count,
                });
            }
        }

        const ineligible = new Set();

        const winners = {};

        for (const category of categories) {
            winners[category] = [];
        }

        counts.sort(
            (a, b) =>
                b.count - a.count ||
                totalVotesForTeam.get(b.team) - totalVotesForTeam.get(a.team)
        );

        const grand = counts.filter((entry) => entry.category === "grand");
        const maxGrand = grand[0].count;
        const allMax = grand.filter((entry) => entry.count === maxGrand);

        if (allMax.length > 1) {
            // check tie breaker
            const totals = allMax.map(
                (entry) => totalVotesForTeam.get(entry.team) ?? 0
            );
            const maxTotal = Math.max(...totals);
            const allMaxTotal = allMax.filter(
                (entry) => totalVotesForTeam.get(entry.team) === maxTotal
            );

            winners["grand"].push(...allMaxTotal);

            for (const entry of allMaxTotal) {
                // grand prize winner is ineligible for other prizes
                ineligible.add(entry.team);
            }
        } else {
            winners["grand"].push(...allMax);
            for (const entry of allMax) {
                // grand prize winner is ineligible for other prizes
                ineligible.add(entry.team);
            }
        }
        const categoryPrizes = new Map();

        // this list is sorted by total number of votes, breaking ties with the tie breaker rule
        for (const entry of counts) {
            entry.totalVotes = totalVotesForTeam.get(entry.team) ?? 0;
            if (entry.category != "grand" && !ineligible.has(entry.team)) {
                winners[entry.category].push(entry);
                if (winners[entry.category].length <= 2) {
                    categoryPrizes.set(
                        entry.team,
                        (categoryPrizes.get(entry.team) ?? 0) + 1
                    );
                    if (categoryPrizes.get(entry.team) === 2) {
                        ineligible.add(entry.team);
                    }
                }
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ winners, votes: counts }),
        };
    }
};
