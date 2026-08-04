import { Anchor, Button, Card, Image, Stack, Text } from "@mantine/core";
import { CenteredFullSizeContainer } from "../../components/CenteredFullSizeContainer";
import { QRCodeSVG } from "qrcode.react";
import { useAppContext } from "../../contexts/AppContext";
import { Link } from "react-router-dom";

import PLACEHOLDER_QR from '../../assets/PlaceholderQR.png'
import { LinkButton } from "../../components/LinkButton";

export default function OtherDevicePage() {

    const {rcHostingUrl} = useAppContext();

    console.log(rcHostingUrl);

    return <CenteredFullSizeContainer>
        <Card withBorder className="w-full">
            <Stack>

                {
                    !rcHostingUrl
                    ?
                    <Image 
                        className="w-full max-w-[200px] mx-auto" 
                        src={PLACEHOLDER_QR}/>
                    :
                    <QRCodeSVG
                        bgColor="transparent"
                        fgColor="white"
                        className="w-full max-w-[200px] mx-auto" 
                        value={`${rcHostingUrl}/admin`}
                        size={256}/>

                }
                
                
                <Text variant="dimmed">
                    Scan this QR code on another device, or open the following URL: <Anchor onClick={()=>window.app.shellOpen(rcHostingUrl)}>{rcHostingUrl}</Anchor>.
                </Text>

                <LinkButton to={"/"}>
                    Back
                </LinkButton>
            </Stack>
        </Card>
    </CenteredFullSizeContainer>;
}