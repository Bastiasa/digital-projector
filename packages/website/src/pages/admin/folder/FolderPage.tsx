import { ActionIcon, Button, Card, CardSection, Flex, Grid, GridCol, Group, Image, Loader, Stack, Text, Title } from "@mantine/core";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MockData } from "../../../mock";
import { IS_DEVELOPMENT } from "../../../constants";
import AUDIO_COVER_IMAGE from '../../../assets/audio_file_cover.png'
import { extensionIsAudio, extensionIsImage, extensionIsVideo } from "../../../extensionHelper";
import { AdminProvider, useAdminContext } from "../context/AdminContext";
import { PlaybackManagerProvider, usePlaybackManagerContext } from "../../../context/PlaybackManagerContext";
import { PlaybackPanel } from "../components/PlaybackPanel";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import type { GetFolderResponse } from "@digital-projector/shared";
import PageTitle from "../../../components/PageTitle";
import { AdminHeader } from "../components/AdminHeader";



const Files = ({ folderId, folderDataQuery }: { folderId: number, folderDataQuery: UseQueryResult<GetFolderResponse> }) => {


    const { currentFileId } = usePlaybackManagerContext();
    const { syncUpdate } = useAdminContext();

    const sortedFiles = folderDataQuery.data?.success ?
        folderDataQuery.data.data.files.sort(({ fileName: a }, { fileName: b }) => {
            return a.localeCompare(b);
        })
        :
        [];

    const errorMessage = <Card withBorder className="absolute w-full max-w-80 my-44 top-1/2 left-1/2 -translate-1/2" >
       <Stack gap={'md'}>
            <Text ta={'center'}>
                Error trying to retrieve the folder data.
            </Text>

            <Button onClick={() => folderDataQuery.refetch()}>
                Retry
            </Button>
       </Stack>
    </Card>


    return folderDataQuery.isLoading ?
        <Loader className="absolute left-1/2 top-1/2 -translate-1/2" size="xl" />
        :
        folderDataQuery.isError ?

            errorMessage

            :

            folderDataQuery.data?.success ?
                <div className="px-6 flex-1 max-w-[500px] sm:max-w-300 mx-auto">
                    <Grid gap="md">
                        {sortedFiles.map(({ fileName, id }) => {
                            const [ext] = fileName.split('.').reverse();

                            const isVideo = ext ? extensionIsVideo(ext) : false;
                            const isImage = ext ? extensionIsImage(ext) : false;
                            const isAudio = ext ? extensionIsAudio(ext) : false;

                            const selected = id == currentFileId;

                            return (
                                <GridCol span={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={id}>
                                    <Card
                                        onClick={() => {
                                            syncUpdate({
                                                currentFileId: id,
                                                pause: false,
                                                currentTime: 0
                                            })
                                        }}
                                        className={`cursor-pointer ${selected ? "outline-6! outline-purple-600!" : "hover:outline-4! hover:outline-purple-400! transition-outline duration-200"}`} withBorder>
                                        <CardSection>

                                            {isVideo &&
                                                <video
                                                    className="w-full h-[180px] md:h-[180px] lg:h-[160px]"
                                                    src={`/file/${id}`} />
                                            }

                                            {(isImage || isAudio) &&
                                                <Image
                                                    className="w-full h-[180px]! md:h-[180px]! lg:h-[160px]! object-contain"
                                                    src={isImage ? `/file/${id}` : AUDIO_COVER_IMAGE} />
                                            }

                                        </CardSection>

                                        <Text className="text-1xl! sm:text-sm!" mt={16}>{fileName}</Text> 
                                    </Card>
                                </GridCol>
                            );
                        })}
                    </Grid>
                </div>
                :
                errorMessage;
}

export default function FolderPage() {

    const navigate = useNavigate();
    const { id: rawFolderId } = useParams();

    const folderId = parseInt(rawFolderId || '-1');

    useEffect(() => {
        if (!Number.isFinite(folderId)) {
            navigate('/admin');
        }
    }, [folderId, navigate]);

    if (!Number.isFinite(folderId)) {
        return <Loader className="absolute left-1/2 top-1/2 -translate-1/2" size="xl" />;
    }

    const folderDataQuery = useQuery<GetFolderResponse>({
        queryKey: ['folder', folderId],
        queryFn: () => {

            if (IS_DEVELOPMENT) {
                return MockData.FILES_REQUEST;
            }

            return fetch(`/folder/${folderId}`).then(r => r.json());
        },

        retry: 1
    });

    return (
        <div className="">

            <PageTitle>Digital Projector | Folder {folderDataQuery.data?.success ? folderDataQuery.data.data.path : folderId.toString()}</PageTitle>
            
            <Flex direction={'column'}>
                <AdminHeader>
                    <Group className="w-full mx-auto max-w-[1000px]">
                        <ActionIcon onClick={() => {
                            navigate('/admin')
                        }}>
                            <IconChevronLeft />
                        </ActionIcon>

                        <Title
                            flex={1}
                            order={2}>
                            {folderDataQuery.data?.success ?
                                folderDataQuery.data.data.path
                                : folderId}
                        </Title>

                        <ActionIcon 
                            loading={folderDataQuery.isFetching}
                            onClick={() => folderDataQuery.refetch()}>
                            <IconRefresh />
                        </ActionIcon>
                    </Group>
                </AdminHeader>

                <div className="py-4"></div>

                <Files
                    folderId={folderId}
                    folderDataQuery={folderDataQuery} />

                <div className="py-20"></div>
            </Flex>

            <PlaybackPanel />

        </div>
    );
}