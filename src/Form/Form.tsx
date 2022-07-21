import React from "react";
import { Redirect } from "react-router";

import { Dropdown, Checkbox, Button } from "semantic-ui-react";
import { logout, submitVotes } from "../utils";
import "./Form.css";

interface Props {
    teams: string[];
    categories: { displayName: string; key: string }[];
    email: string;
}

interface State {
    votes: Record<string, string[]>;
    team: string;
    submitting?: boolean;
    eligible?: boolean;
    redirect?: boolean;
}

export class Form extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const votes = JSON.parse(localStorage.getItem("votes") ?? "{}");
        const team = localStorage.getItem("team") ?? "";

        this.state = {
            votes,
            team,
            eligible:
                !!localStorage.getItem("voted") ||
                !!localStorage.getItem("eligible"),
        };
    }

    private getDropdowns() {
        const options = this.props.teams
            .filter((team) => team !== this.state.team)
            .map((team) => {
                return {
                    key: team,
                    text: team,
                    value: team,
                };
            });

        return this.props.categories.map((category) => {
            return (
                <React.Fragment key={category.key}>
                    <h3>{category.displayName}</h3>
                    <p className="multiple-votes">You can vote for multiple teams</p>
                    <Dropdown
                        placeholder="Select teams"
                        fluid
                        multiple
                        search
                        selection
                        options={options}
                        onChange={(event, data) => {
                            const votes = { ...this.state.votes };
                            votes[category.key] = data.value as string[];
                            localStorage.setItem(
                                "votes",
                                JSON.stringify(votes)
                            );
                            this.setState({ votes });
                        }}
                        value={this.state.votes[category.key] ?? []}
                    ></Dropdown>
                </React.Fragment>
            );
        });
    }

    private getVoteBody() {
        const result: string[] = [];

        result.push(`team=${this.state.team}`);

        for (const category of this.props.categories) {
            const votes = this.state.votes[category.key] ?? [];
            result.push(
                ...votes
                    .filter((team) => team != this.state.team)
                    .map(
                        (team) =>
                            `${encodeURIComponent(
                                category.key
                            )}=${encodeURIComponent(team)}`
                    )
            );
        }
        return result.join("&");
    }

    private async submit() {
        this.setState({ submitting: true });
        const success = await submitVotes(this.getVoteBody());

        this.setState({ submitting: false, redirect: success });
    }

    public render() {
        const options = this.props.teams.map((team) => {
            return {
                key: team,
                text: team,
                value: team,
            };
        });

        options.unshift({ key: "na", text: "No Team", value: "na" });

        if (this.state.redirect) {
            return <Redirect to="/done" />;
        }
        return (
            <React.Fragment>
                <h1>Hackathon 2022 Voting</h1>
                <p>
                    <span className="required">* Required</span>
                </p>
                <p>
                    Please vote for teams in each category to help us determine
                    the winners
                </p>
                <h1>Eligibility</h1>
                <p>
                    In order to vote, you must have attended the hackathon video
                    pitch session<span className="required">*</span>
                </p>
                <Checkbox
                    checked={!!this.state.eligible}
                    onChange={(event, data) => {
                        if (data.checked) {
                            localStorage.setItem("eligible", "1");
                        } else {
                            localStorage.removeItem("eligible");
                        }
                        this.setState({ eligible: data.checked });
                    }}
                    label="I attended the hackathon video pitch session"
                ></Checkbox>
                <h3>
                    Voting as: {this.props.email}.{" "}
                    <a
                        href="/logout"
                        onClick={(e) => {
                            e.preventDefault();
                            logout();
                        }}
                    >
                        Sign out
                    </a>
                </h3>
                <h3>
                    Which team are you on (if any)
                    <span className="required">*</span>
                </h3>
                <Dropdown
                    placeholder="Select team"
                    fluid
                    search
                    selection
                    options={options}
                    onChange={(event, data) => {
                        this.setState({ team: data.value as string });
                        localStorage.setItem("team", data.value as string);
                    }}
                    value={this.state.team ?? ""}
                ></Dropdown>
                {this.getDropdowns()}
                <Button
                    className="submit"
                    primary
                    onClick={() => {
                        this.submit();
                    }}
                    loading={this.state.submitting}
                    disabled={
                        this.state.submitting ||
                        !this.state.eligible ||
                        this.state.team === ""
                    }
                >
                    Submit
                </Button>
            </React.Fragment>
        );
    }
}
