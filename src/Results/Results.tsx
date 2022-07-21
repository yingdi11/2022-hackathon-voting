import React from "react";
import { Redirect } from "react-router";
import { Button, Table } from "semantic-ui-react";
import { categories, getResults, VotingResults } from "../utils";
import "./Results.css";

interface Props {}

interface State {
    results?: VotingResults;
    showFull?: boolean;
    forbidden?: boolean;
    column?: string;
    direction?: "ascending" | "descending";
}

export class Results extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public async componentDidMount() {
        const results = await getResults();

        if (results) {
            this.setState({ results });
        } else {
            this.setState({ forbidden: true });
        }
    }

    public render() {
        if (this.state.forbidden) {
            return <Redirect to="/" />;
        } else if (this.state.results) {
            const winners = this.state.results.winners;
            const categoryWinners = categories.map((category) => {
                const categoryWinners = winners[category.key] ?? [];
                return (
                    <React.Fragment key={category.key}>
                        <h1>{category.displayName}</h1>
                        <Table singleLine collapsing unstackable>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Place</Table.HeaderCell>
                                    <Table.HeaderCell>Team</Table.HeaderCell>
                                    <Table.HeaderCell>Votes</Table.HeaderCell>
                                    <Table.HeaderCell>
                                        Total Votes
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {categoryWinners
                                    .slice(0, 5)
                                    .map((entry, index) => {
                                        return (
                                            <Table.Row
                                                positive={index < 2}
                                                key={entry.team}
                                            >
                                                <Table.Cell>
                                                    {index + 1}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {entry.team}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {entry.count}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {entry.totalVotes}
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                            </Table.Body>
                        </Table>
                    </React.Fragment>
                );
            });

            const votes = this.state.results.votes;
            const teams = Array.from(
                new Set(this.state.results.votes.map((entry) => entry.team))
            );

            const fullDetailsData = teams.map((team) => {
                const teamVotes = votes.filter((entry) => entry.team === team);
                const row: Record<string, string | number> = {
                    team: team,
                    total: teamVotes[0]?.totalVotes ?? 0,
                };

                for (const category of categories) {
                    const count =
                        teamVotes.find(
                            (entry) => entry.category === category.key
                        )?.count ?? 0;
                    row[category.key] = count;
                }

                return row;
            });

            const columns = [
                "team",
                ...categories.map((category) => category.key),
                "total",
            ];
            const columnNames = [
                "Team",
                ...categories.map((category) => category.displayName),
                "Total Votes",
            ];

            const column = this.state.column ?? "team";
            const direction = this.state.direction ?? "ascending";

            fullDetailsData.sort((a, b) => {
                const aVal = a[column];
                const bVal = b[column];
                let comparison = 0;
                if (typeof aVal === "string" && typeof bVal === "string") {
                    comparison = aVal
                        .toLowerCase()
                        .localeCompare(bVal.toLowerCase());
                }
                if (typeof aVal === "number" && typeof bVal === "number") {
                    comparison = aVal - bVal;
                }
                if (direction === "ascending") {
                    return comparison;
                } else {
                    return -comparison;
                }
            });

            const fullDetails = (
                <React.Fragment>
                    <h1>Full Vote Counts</h1>
                    <Button
                        onClick={() => {
                            this.setState({ showFull: !this.state.showFull });
                        }}
                    >
                        {this.state.showFull ? "Hide" : "Show"}
                    </Button>
                    {this.state.showFull && (
                        <Table celled sortable unstackable>
                            <Table.Header>
                                <Table.Row>
                                    {columns.map((key, index) => {
                                        return (
                                            <Table.HeaderCell
                                                key={key}
                                                sorted={
                                                    column === key
                                                        ? direction
                                                        : undefined
                                                }
                                                onClick={() => {
                                                    if (column === key) {
                                                        this.setState({
                                                            direction:
                                                                direction ===
                                                                "ascending"
                                                                    ? "descending"
                                                                    : "ascending",
                                                        });
                                                    } else {
                                                        this.setState({
                                                            column: key,
                                                            direction:
                                                                key === "team"
                                                                    ? "ascending"
                                                                    : "descending",
                                                        });
                                                    }
                                                }}
                                            >
                                                {columnNames[index]}
                                            </Table.HeaderCell>
                                        );
                                    })}
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {fullDetailsData.map((details) => {
                                    return (
                                        <Table.Row key={details["team"]}>
                                            <Table.Cell>
                                                {details["team"]}
                                            </Table.Cell>
                                            {categories.map((category) => {
                                                return (
                                                    <Table.Cell
                                                        key={category.key}
                                                    >
                                                        {details[category.key]}
                                                    </Table.Cell>
                                                );
                                            })}
                                            <Table.Cell>
                                                {details["total"]}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                    )}
                </React.Fragment>
            );
            return (
                <div className="wrap-results">
                    {categoryWinners}
                    {fullDetails}
                </div>
            );
        } else {
            return <h1>Loading Results...</h1>;
        }
    }
}
