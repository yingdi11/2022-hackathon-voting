import GoTrue from "gotrue-js";

export const auth = new GoTrue({
    APIUrl: "https://<app-name>.netlify.app/.netlify/identity",
    setCookie: true,
});
(window as any).auth = auth;

async function loadInternal() {
    const [teams, user] = await Promise.all([getTeams(), getUser()]);

    if (
        user &&
        !localStorage.getItem("votes") &&
        user.email.endsWith("@domain.com")
    ) {
        const votes = (await getMyVote()) ?? {};
        localStorage.setItem("votes", JSON.stringify(votes));
    }

    return { teams, user };
}

let loadPromise: ReturnType<typeof loadInternal> | undefined = undefined;

export async function load() {
    loadPromise ??= loadInternal();
    return await loadPromise;
}

async function getTeams() {
    return Array.from(new Set([
        "Team 1",
        "Team 2",
        "Team 3",
        "Team 4",
        "Team 5",
        "Team 6",
        "Team 7",
        "Team 8",
        "Team 9",
        "Team 10",
        "Team 11",
        "Team 12",
        "Team 13",
        "Team 14",
        "Team 15",
        "Team 16",
        "Team 17",
        "Team 18",
        "Team 19",
        "Team 20",
        "Team 21",
        "Team 22",
        "Team 23",
        "Team 24",
        "Team 25",
        "Team 26",
        "Team 27",
        "Team 28",
        "Team 29",
        "Team 30",
        "Team 31",
        "Team 32",
        "Team 33",
        "Team 34",
        "Team 35",
        "Team 36",
        "Team 37",
        "Team 38",
        "Team 39",
        "Team 40",
        "Team 41",
        "Team 42",
        "Team 43",
        "Team 44",
    ])).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));;
}

async function getUser() {
    await processHash();
    await auth.currentUser()?.jwt();
    return auth.currentUser();
}

async function processHash() {
    const hash = window.location.hash.replace(/^#\/?/, "");

    if (hash.indexOf("access_token=") >= 0) {
        const params: Record<string, string> = {};
        for (const pair of hash.split("&")) {
            const [key, value] = pair.split("=");
            params[key] = value;
        }

        if (window.document && params["access_token"]) {
            window.document.cookie = `nf_jwt=${params["access_token"]}`;
        }

        window.location.hash = "";
        await auth.createUser(params, true);
    }
}

async function requestFunction(name: string, method: string, body?: string) {
    const jwt = await auth.currentUser()?.jwt();

    const r = await fetch(`/.netlify/functions/${name}`, {
        method,
        body,
        headers: { Authorization: `Bearer ${jwt}` },
    });

    return r;
}

export const categories = [
    { displayName: "Best Overall", key: "grand" },
    { displayName: "Best use of extension API", key: "api" },
    { displayName: "Tech debt", key: "tech-debt" },
    { displayName: "Thinking BIG", key: "big" },
    {
        displayName: "Accelerator (speeds up our ability to create value)",
        key: "accelerator",
    },
    { displayName: "Unbelievable Engineering", key: "unbelievable" },
    { displayName: "Best use of intelligent diagramming", key: "intelligent" },
    { displayName: "Best cross-suite use case", key: "suite" },
    { displayName: "Build to delight", key: "delight" },
];

const callbacks = new Map<string, VoidFunction[]>();

export function on(event: "logout", callback: VoidFunction) {
    if (!callbacks.has(event)) {
        callbacks.set(event, []);
    }
    callbacks.get(event)?.push(callback);
}

export async function logout() {
    await auth.currentUser()?.logout();
    localStorage.clear();
    callbacks.get("logout")?.map((fn) => fn());
}

export async function submitVotes(votes: string) {
    try {
        const r = await requestFunction("submit", "POST", votes);

        if (r.status === 200) {
            localStorage.setItem("voted", "1");
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

export async function getMyVote() {
    try {
        const r = await requestFunction("myVote", "GET");
        const data: any[] = await r.json();
        if (data.length === 1) {
            localStorage.setItem("voted", "1");
            return data[0];
        }
    } catch (e) {}
    return undefined;
}

export interface Entry {
    team: string;
    category: string;
    totalVotes: number;
    count: number;
}

export interface VotingResults {
    winners: Record<string, Entry[]>;
    votes: Entry[];
}

export async function getResults() {
    const r = await requestFunction("results", "GET");
    try {
        if (r.status === 200) {
            const data: VotingResults = await r.json();
            localStorage.setItem("r", JSON.stringify(data));

            return data;
        }
    } catch {}
    return false;
}
