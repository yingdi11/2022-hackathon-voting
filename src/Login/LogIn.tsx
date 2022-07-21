import { Logo } from "../Logo";
import {Button} from 'semantic-ui-react';
import './Login.css';
import { auth } from "../utils";

export function LogIn() {
    return <div className="signin">
    <div className="wrap">
        <Logo />
        <Button primary size="massive" onClick={() => {
            const url = auth.loginExternalUrl('google');
            window.location.href = url;
        }}>Sign in to vote!</Button>
        <p>You must sign in with your @domain.com email address</p>
    </div>
</div>
}