import { Link } from "react-router-dom";
import { CenteredFullSizeContainer } from "../../components/CenteredFullSizeContainer";
import { Button, Card, EmptyState, EmptyStateDescription, EmptyStateTitle, Flex, Grid, GridCol, Group, NumberInput, Text, Title } from "@mantine/core";
import { LinkButton } from "../../components/LinkButton";
import React, { useEffect, useState } from "react";
import {GlobalConstants} from '@digital-projector/shared';
import { useMap } from "../../hooks/useMap";

const Folders = () => {

    const {
        map: folders,
        set,
        remove,
        replace
    } = useMap(new Map());

    useEffect(()=>{
        window.app.fetchMultimediaFolders()
            .then((map)=>{
                replace(map);
            });
    }, []);

    return (
        <Flex 
            gap={16}
            direction={'column'}>

            {folders.size < 1 
        
            ?

            <EmptyState className="mx-auto py-22">
                <EmptyStateTitle>You haven't selected any folders</EmptyStateTitle>
                <EmptyStateDescription>Click in add folder.</EmptyStateDescription>
            </EmptyState>

            :

            Array.from(folders.entries()).map(([key, value])=>{
                
                return <Card withBorder>
                    <Group gap={32}>
                        <Text
                            title={value}
                            className="overflow-hidden text-ellipsis text-nowrap" 
                            flex={75} w={1}>
                            {value}
                        </Text>

                        <Button 
                            onClick={()=>{
                                remove(key);
                                window.app.deleteMultimediaFolder(key);
                            }}
                            flex={25}>
                            Delete
                        </Button>
                    </Group>
                </Card>
            })

            }

            <Button onClick={()=>{
                window.app.pickMultimediaFolder()
                    .then((data) => {

                        if (data) {                        
                            set(data.id, data.folder);
                        }
                    })  
            }}>
                Add folder
            </Button>

        </Flex>
    );
}


const PortInput = () => {

    const [value, setValue] = useState(3000);

    useEffect(()=> {

        window.app.getData<number>(GlobalConstants.SETTINGS_FIELDS.PORT, 3000)
            .then((v)=> {
                setValue(v ?? 3000);
            });

    }, [])

    return <NumberInput
        value={value}
        onChange={(v) => {
            window.app.setFields({
                [GlobalConstants.SETTINGS_FIELDS.PORT] : v
            });

            setValue(v as number);
            
        }}
        min={1024}
        max={6535}
        placeholder="1024 - 6535"/>;
}

export default function SettingsPage( ) {
    return <CenteredFullSizeContainer>
        <Card className="w-full h-4/5 !overflow-auto" withBorder>
            <Grid>
                <GridCol>
                    <Title>Network Settings</Title>
                </GridCol>

                <GridCol span={8}>
                    <Text>
                        Server port
                    </Text>
                </GridCol>

                <GridCol span={4}>
                    <PortInput/>
                </GridCol>

                <GridCol>
                    <Title>Multimedia Folders</Title>
                </GridCol>

                <GridCol>
                    <Folders/>
                </GridCol>

                <GridCol span={12}>
                    <LinkButton className="w-full" to="/">
                        Back
                    </LinkButton>
                </GridCol>
            </Grid>
        </Card>
    </CenteredFullSizeContainer>
}