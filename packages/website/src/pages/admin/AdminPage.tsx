import { useQuery } from "@tanstack/react-query";
import { IS_DEVELOPMENT } from "../../constants";
import { MockData } from "../../mock";
import { ActionIcon, Button, Card, EmptyState, EmptyStateDescription, EmptyStateTitle, Grid, GridCol, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { LinkButtton } from "../../components/LinkButton";
import { PlaybackManagerProvider } from "../../context/PlaybackManagerContext";
import { PlaybackPanel } from "./components/PlaybackPanel";
import { AdminProvider } from "./context/AdminContext";
import { IconRefresh } from "@tabler/icons-react";
import { AdminHeader } from "./components/AdminHeader";
import type { GetFoldersResponse } from "@digital-projector/shared";
import PageTitle from "../../components/PageTitle";


const FolderElement = ({ folderId, path }: { folderId: number, path: string }) => {
    return (

        <Card withBorder>
            <Grid>
                <GridCol span={{ xs: 12, sm: 8 }}>
                    <Text style={{ wordBreak: 'keep-all' }} className="text-ellipsis overflow-hidden text-nowrap">{path}</Text>
                </GridCol>

                <GridCol span={{ xs: 12, sm: 4 }}>
                    <LinkButtton
                        to={`/admin/folder/${folderId}`}
                        fullWidth
                        variant="light">
                        Open
                    </LinkButtton>
                </GridCol>
            </Grid>

        </Card>

    )
}

export default function AdminPage() {

    const foldersQuery = useQuery<GetFoldersResponse>({
        queryKey: ['folders'],
        queryFn: () => {

            if (IS_DEVELOPMENT) {
                return MockData.FOLDERS_REQUEST;
            }

            return fetch('/folders').then(r => r.json());
        },

        retry: 1
    });



    const errorMessage = (
        <div className="flex items-center absolute justify-center inset-0">
            <PlaybackManagerProvider>
                <Card withBorder>
                    <Stack>
                        <Text>
                            Error trying to retrieve the folders.
                        </Text>

                        <Button onClick={() => foldersQuery.refetch()}>
                            Retry
                        </Button>
                    </Stack>
                </Card>
            </PlaybackManagerProvider>
        </div>
    );

    return (
        <Stack className="">
            <PageTitle>Digital Projector | Admin</PageTitle>
            <AdminHeader>
                <Group className="max-w-250 mx-auto">
                    <Title flex={1}>
                        Admin page &mdash; Available folders
                    </Title>

                    <ActionIcon
                        loading={foldersQuery.isLoading}
                        onClick={() => foldersQuery.refetch()}>
                        <IconRefresh />
                    </ActionIcon>
                </Group>
            </AdminHeader>

            <Stack className="px-6 py-4  max-w-[1000px] mx-auto  w-full">
                {foldersQuery.isLoading ?

                    <Loader className="absolute left-1/2 top-1/2 -translate-1/2" size="xl" />

                    :

                    foldersQuery.isError ?

                        errorMessage

                        :

                        foldersQuery.data?.success ?

                            <Stack className="">
                                {foldersQuery.data.data.length > 0 && foldersQuery.data.data.map(([id, path]) => (
                                    <FolderElement key={id} folderId={id} path={path} />
                                ))}

                                {
                                    foldersQuery.data.data.length < 1 &&
                                    <Card withBorder my={'150px'}>
                                        <EmptyState>
                                            <EmptyStateTitle>
                                                Nothing here
                                            </EmptyStateTitle>

                                            <EmptyStateDescription>
                                                It seems that there are no folders
                                            </EmptyStateDescription>

                                            <Button onClick={() => foldersQuery.refetch()}>
                                                Refresh
                                            </Button>
                                        </EmptyState>
                                    </Card>
                                }

                                <div className="py-14"></div>
                            </Stack>

                            :

                            errorMessage
                }

                <PlaybackManagerProvider>
                    <AdminProvider>
                        <PlaybackPanel />
                    </AdminProvider>
                </PlaybackManagerProvider>

            </Stack>



        </Stack>
    );
}