import { ActionIcon, Grid, GridCol, Group, Slider, Stack, Title, type SliderProps } from "@mantine/core";
import { IconChevronLeft, IconRefresh } from "@tabler/icons-react";
import { PlaybackManagerProvider, usePlaybackManagerContext, type PlaybackManagerContextType } from "../../../context/PlaybackManagerContext";
import { AdminProvider, useAdminContext } from "../context/AdminContext";


const SliderParameter = ({
    labelFormat = (v) => `${v}%`,
    label,
    propertyName,
    min = 0,
    max = 30,
    defaultValue,
    value,
    ...rest
}: {
    labelFormat?: (v: number) => string | number,
    label: string,
    propertyName: keyof PlaybackManagerContextType
} & SliderProps) => {


    const { syncUpdate } = useAdminContext();

    return (

        <Grid>

            <GridCol span={4}>
                <Title order={3}>{label}</Title>
            </GridCol>

            <GridCol span={7}>
                <Slider

                    onChange={(value) => {
                        syncUpdate({ [propertyName]: value });
                    }}

                    {...rest}
                    step={.01}
                    min={min}
                    max={max}
                    label={labelFormat}
                    value={value} />
            </GridCol>

            <GridCol span={1}>
                <ActionIcon onClick={() => {
                    syncUpdate({ [propertyName]: defaultValue })
                }}>
                    <IconRefresh />
                </ActionIcon>
            </GridCol>
        </Grid>
    )
}

const oneToHundredPercentFormat = (v: number) => {
    return `${Math.round(v * 100)}%`;
}

const ImageParameters = () => {

    const { brightness, contrast, saturation, blur, opacity } = usePlaybackManagerContext();

    return (
        <>
            <SliderParameter
                value={brightness}
                label="Brightness"
                defaultValue={1}
                propertyName="brightness"
            />

            <SliderParameter
                value={contrast}
                defaultValue={1}
                label="Contrast"
                propertyName="contrast"
            />

            <SliderParameter
                value={saturation}
                defaultValue={1}
                label="Saturation"
                propertyName="saturation"
            />

            <SliderParameter
                value={blur}
                label="Blur"
                defaultValue={0}
                min={0}
                max={10}
                labelFormat={v => (`${v}px`)}
                propertyName="blur"
            />

            <SliderParameter
                value={opacity}
                label="Opacity"
                defaultValue={1}
                min={0}
                max={1}
                labelFormat={oneToHundredPercentFormat}
                propertyName="opacity" />
        </>
    );
}

const AudioParameters = () => {
    const { volume } = usePlaybackManagerContext();

    return (
        <>
            <SliderParameter
                value={volume}
                label="Volume"
                defaultValue={1}
                min={0}
                max={1}
                labelFormat={oneToHundredPercentFormat}
                propertyName="volume"
            />
        </>
    );
}

export default function SettingsPage() {


    return (
        <Stack
            style={{
                gap: "20px"
            }}
            className="w-full max-w-250 mx-auto my-12 px-6">
            <Group>
                <ActionIcon onClick={() => {
                    history.back();
                }}>
                    <IconChevronLeft />
                </ActionIcon>

                <Title>
                    Parameters & Settings
                </Title>
            </Group>

            <Title order={2}>
                Image Parameters
            </Title>

            <ImageParameters />

            <Title order={2}>
                Audio Parameters
            </Title>

            <AudioParameters />





        </Stack>
    );
}