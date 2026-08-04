import { Anchor, Button, Card, Group, Image, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { CenteredFullSizeContainer } from "../../components/CenteredFullSizeContainer";
import { LinkButton } from "../../components/LinkButton";
import ICON_IMAGE from "../../assets/Icon.png";

const StartServerButton = ()=> {
    const {rcHostingUrl} = useAppContext();
    const [serverState, setServerState] = useState<'loading'|'started'|'stopped'>(rcHostingUrl ? 'started' : 'stopped');

    function onStartServerClicked() {
            setServerState('loading');

        if (serverState == 'stopped') {
            window.app.runRcServer();
        } else {
            window.app.stopRcServer();
        }
    }


    useEffect(()=>{
        const offStarted = window.events.subscribe('rc-server-started', (url) => {
            setServerState('started');
        });

        const offStopped = window.events.subscribe('rc-server-stopped', ()=>{
            setServerState('stopped');
        });

        return () => {
            offStarted();
            offStopped();
        }
    }, []);

    return (
        <Button 
            loading={serverState == 'loading'} 
            disabled={serverState == 'loading'} 
            onClick={onStartServerClicked}>
            {
                serverState == 'loading' ?
                '...'
                :
                serverState == 'started' ?
                'Stop server'
                :
                serverState == 'stopped' ?
                'Start server'
                :
                'Undefined'
            }
        </Button>
    );
}

export default function MainPage( ) {



    const {rcHostingUrl} = useAppContext();

    return <CenteredFullSizeContainer>

        <Card withBorder className="w-full">
            <Stack>

                <Group gap={"lg"}>
                    <Image w={100} src={ICON_IMAGE}/>
                    <Stack flex={1}>
                        <Title>
                            Digital Projector
                        </Title>

                        <Text>
                            &copy; <Anchor onClick={()=> window.app.shellOpen("https://bastiasa.github.io")}>Luis Bastidas 2026</Anchor> <br></br>
                            Ver. {__APP_VERSION__}
                        </Text>

                    </Stack>
                </Group>

                <LinkButton to={"/settings"}>
                    Settings
                </LinkButton>

                <StartServerButton/>

                <LinkButton disabled={!rcHostingUrl} to={"/other_device"}>
                    Manage with other device
                </LinkButton>

                <Group>
                    <Button 
                        onClick={()=>{
                            window.app.shellOpen(`${rcHostingUrl}/admin`)
                        }}
                        disabled={!rcHostingUrl} 
                        flex={1}>
                        Manage    
                    </Button> 


                    <Button 
                        onClick={()=>{
                            window.app.shellOpen(`${rcHostingUrl}/view`)
                        }}
                        disabled={!rcHostingUrl} 
                        flex={1}>
                        View
                    </Button>   
                </Group>
            </Stack>
        </Card>
    </CenteredFullSizeContainer>
}