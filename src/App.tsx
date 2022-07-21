import React, { PropsWithChildren, ReactNode } from "react";
import "./App.css";
import { Loading } from "./Loading";
import { load, categories, auth, on, logout } from "./utils";
import { LogIn } from "./Login/LogIn";
import { Form } from "./Form/Form";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    Link,
} from "react-router-dom";
import { Results } from "./Results/Results";
import { Logo } from "./Logo";
import { Button } from "semantic-ui-react";

interface Props {}

interface State {
    loggedIn: boolean;
    loaded: boolean;
    teams: string[];
    isDone?: boolean;
}

export class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loggedIn: false,
            loaded: false,
            teams: [],
        };
    }

    async componentDidMount() {
        const init = await load();

        on("logout", () => {
            this.setState({ loggedIn: false });
        });

        this.setState({
            loaded: true,
            teams: init.teams,
            loggedIn: !!init.user,
            isDone: !!localStorage.getItem("voted"),
        });
    }

    private renderHome() {
        if (!this.state.loaded) {
            return <Loading />;
        }

        return (
            <Form
                teams={this.state.teams}
                categories={categories}
                email={auth.currentUser()?.email ?? ""}
            />
        );
    }

    private renderResults() {
        return <Results />;
    }

    private invalidEmail() {
        if (!auth.currentUser()) {
            return false;
        }
        return !(auth.currentUser()?.email ?? "").endsWith("@domain.com");
    }

    public render() {
        let Home = () => this.renderHome();
        let Results = () => this.renderResults();
        let AppRoute = (props: {
            children: ReactNode | undefined;
            path: string;
        }) => (
            <Route path={props.path}>
                <div className="App">{props.children}</div>
            </Route>
        );

        if(!this.state.loaded) {
            return <div className="App"><Loading /></div>;
        }

        return (
            <Router>
                <Switch>
                    <Route path="/results">
                        <Results />
                    </Route>
                    <AppRoute path="/invalid">
                        {this.state.loaded && !this.state.loggedIn && (
                            <Redirect to="/login" />
                        )}
                        <div className="center">
                            <h1>Invalid email: {auth.currentUser()?.email}</h1>
                            <h2>
                                Use with your @domain.com email address to
                                vote
                            </h2>
                            <Button
                                primary
                                size="massive"
                                onClick={() => logout()}
                            >
                                Log out
                            </Button>
                        </div>
                    </AppRoute>
                    <AppRoute path="/login">
                        {this.state.loaded && this.state.loggedIn && (
                            <Redirect to="/" />
                        )}
                        <LogIn />
                    </AppRoute>
                    <AppRoute path="/done">
                        <div className="center">
                            <Logo />
                            <h1>Thank you for voting!</h1>
                            <Link
                                to="/"
                                component={(props) => {
                                    return (
                                        <Button
                                            primary
                                            onClick={() => {
                                                this.setState({
                                                    isDone: false,
                                                });
                                                props.navigate();
                                            }}
                                        >
                                            Update my vote
                                        </Button>
                                    );
                                }}
                            ></Link>
                        </div>
                    </AppRoute>
                    <AppRoute path="/">
                        {this.state.loaded && !this.state.loggedIn && (
                            <Redirect to="/login" />
                        )}
                        {this.state.loaded && this.state.isDone && (
                            <Redirect to="/done" />
                        )}
                        {this.state.loaded && this.invalidEmail() && (
                            <Redirect to="/invalid" />
                        )}
                        <Home />
                    </AppRoute>
                </Switch>
            </Router>
        );
    }
}
