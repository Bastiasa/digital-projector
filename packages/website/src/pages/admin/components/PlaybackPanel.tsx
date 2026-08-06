import { ActionIcon, Badge, Group, Paper, Slider, Stack, Title } from "@mantine/core";
import { IconAdjustments, IconAdjustmentsFilled, IconCrossFilled, IconEditFilled, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled, IconSettingsFilled, IconXFilled } from "@tabler/icons-react";
import { usePlaybackManagerContext } from "../../../context/PlaybackManagerContext";
import { useEffect, useMemo, useRef, useState, type ComponentProps, type DOMAttributes } from "react";
import { formatTime } from "../../../formatTime";
import { useAdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { useMediaDuration } from "../hooks/useMediaDuration";

export function PlaybackPanel() {

    const { syncUpdate, socket } = useAdminContext();

    const {
        pause,
        currentTime,
        currentFileId
    } = usePlaybackManagerContext();

    const [isSeeking, setSeeking] = useState(false);
    const [seekingValue, setSeekingValue] = useState<number>(0);
    
    const duration = useMediaDuration(`/file/${currentFileId}`);

    const [fileName, setFileName] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string | null>(null);

    const [isPlayable, setIsPlayable] = useState<boolean>(false);


    useEffect(() => {

        if (!currentFileId) {
            setFileName(null);
            return;
        }


        fetch(`/file/${currentFileId}`, { method: "HEAD" })
            .then(res => {

                const contentType = (res.headers.get('Content-Type') ?? 'application/octet-stream').toLowerCase();
                const fileName = decodeURIComponent(res.headers.get('X-Filename') ?? 'Unnamed');

                setFileName(fileName);

                setIsPlayable(
                    contentType.startsWith("video")
                    ||
                    contentType.startsWith("audio")
                );

                if (contentType.startsWith("video") || contentType.startsWith("audio") || contentType.startsWith("image")) {
                    setMimeType(contentType);
                    console.log("Media type: ", contentType);
                } else {
                    setMimeType(null);
                }



                if (!contentType.startsWith("video") && !contentType.startsWith("audio"))
                    return;
            });

    }, [currentFileId]);

    const navigate = useNavigate();

    const onNextClicked = () => {
        socket?.emit('next');
    };

    const onPrevClicked = () => {
        socket?.emit('prev');
    };


    return (
        <Paper className="border-t border-t-blue-500 fixed bottom-0 left-0 right-0 z-300 py-4 px-8">

            <Stack>

                <Group gap={'sm'} className="w-full max-w-225 mx-auto">

                    <ActionIcon onClick={() => {
                        navigate('/admin/settings')
                    }}>
                        <IconAdjustmentsFilled />
                    </ActionIcon>

                    {
                        currentFileId &&
                        <ActionIcon
                            color="red"
                            onClick={() => {
                                syncUpdate({ currentFileId: '' });
                                setMimeType('/');
                                setIsPlayable(false);
                            }}>
                            <IconXFilled />
                        </ActionIcon>
                    }

                    <Title
                        translate="no"
                        title={fileName ?? ""}
                        className="text-nowrap! text-ellipsis overflow-hidden"
                        flex={1}
                        order={4}>
                        {fileName ?? "No file selected"}
                    </Title>

                    <Badge>
                        {mimeType ?? "/"}
                    </Badge>
                </Group>

                <Group justify={isPlayable ? "start" : "end"} className="w-full max-w-[900px] mx-auto">

                    {isPlayable && <Slider
                        step={0.01}
                        label={(value) => formatTime(value)}
                        min={0}
                        max={duration}
                        value={isSeeking ? seekingValue : currentTime}
                        onChangeEnd={(value) => {
                            syncUpdate({
                                currentTime: value
                            });
                            console.log("Setting current time: ", value);

                            setSeeking(false);
                        }}
                        onChange={(value) => {
                            setSeekingValue(value);
                        }}
                        onMouseDown={() => {
                            setSeeking(true);
                        }}
                        onTouchStart={() => {
                            setSeeking(true);
                        }}
                        
                        className="w-0 flex-1"
                        size={'xl'} />}

                    {
                        isPlayable &&
                        <span>
                            {formatTime(currentTime)}
                        </span>
                    }

                    {
                        isPlayable && <ActionIcon
                            onClick={() => {
                                syncUpdate({
                                    pause: !pause
                                });
                            }}
                            size="sm"
                            variant="transparent">
                            {
                                pause ?
                                    <IconPlayerPlayFilled />
                                    :
                                    <IconPlayerPauseFilled />
                            }
                        </ActionIcon>
                    }

                    {currentFileId && <ActionIcon onClick={onPrevClicked} size="sm" variant="transparent">
                        <IconPlayerTrackPrevFilled />
                    </ActionIcon>}

                    {currentFileId && <ActionIcon onClick={onNextClicked} size={'sm'} variant="transparent">
                        <IconPlayerTrackNextFilled />
                    </ActionIcon>}
                </Group>


            </Stack>
        </Paper>
    );

}