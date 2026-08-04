import type { GetFolderResponse, GetFoldersResponse } from "@digital-projector/shared";

export class MockData {

    static readonly SELECTED_FILE_ID = 'b1de06f3b087ebe66a13d9dcc484d99175ed5e4236e6efe799120c63cf9abfe9';

    static readonly FOLDERS_REQUEST: GetFoldersResponse = {
        success: true,
        data: [
            [8, "/home/luis/Documents"],
            [9, "/home/luis/Vídeos"],
            [10, "/home/luis/Imágenes"],
            [11, "/home/luis/Música"],
            [12, "/home/luis/Público"],
            [13, "/home/luis/Documentos"],
            [14, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [15, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [16, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [17, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [18, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [19, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [20, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [21, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
            [22, "/media/luis/WORK/projects/node/digital-projector/packages/website/src/pages/admin/components/files"],
        ]
    };

    static readonly FILES_REQUEST: GetFolderResponse = {
        "success": true,
        "data": {
            "id": 7,
            "path": "/home/luis/Imágenes",
            "files": [
                {
                    "fileName": "Camiseta.png",
                    "id": "0a22f5afe691b061777be44ad35d51f5549070724046145825f7ce47da02e4b3"
                },
                {
                    "fileName": "Camiseta.webp",
                    "id": "b1de06f3b087ebe66a13d9dcc484d99175ed5e4236e6efe799120c63cf9abfe9"
                },
                {
                    "fileName": "Captura de pantalla de Clase de Héctor Latorre.webm.png",
                    "id": "a493dfd2a6a6257d2654552cb8472c4f5c286e69971865640e40187cd8a05348"
                },
                {
                    "fileName": "JaxSmile.png",
                    "id": "13c001809664f187c4a68793aa94e327831cf0fd333c727d0c3f37d703592870"
                },
                {
                    "fileName": "Logo Carlos Aponte.png",
                    "id": "38f7e3dd255daacd1d6cae9151614823880e06d36a889d6893601400a71bc94c"
                },
                {
                    "fileName": "Logo Santa Store.svg",
                    "id": "443efaa178ba6fa821c884f13ba32d8654defd02000e3ac72f9cd3397977c978"
                },
                {
                    "fileName": "Typescript_logo_2020.svg.png",
                    "id": "65bf55934423032518be6c8901d0509f63e78043b6fd228caf4d410508b450f5"
                },
                {
                    "fileName": "avaluo el porvenir de la flora test.png",
                    "id": "60f63ffb1ee3ab6e6b6c8f8c5fa43f42d4ad7fd00321337b6794ba46c7e58011"
                },
                {
                    "fileName": "banner century21.png",
                    "id": "02877d3171a2bc65f4f0c52b28d31b1910649eaeaa995c1f2486b8d488232b8d"
                },
                {
                    "fileName": "batch_Hi, I'm paint (Caine), camiseta talla XL.png",
                    "id": "1e26328ffa8894b6f7aa8aade888637604935ae4ca84f9554fc166195d2dd248"
                },
                {
                    "fileName": "batch_I finger paint (Kinger), camiseta talla M.png",
                    "id": "d625b8b5b91f6098422f8d0193b4664d503ea9bc825531d8e96423e5c17343d5"
                },
                {
                    "fileName": "blogcuttericon.png",
                    "id": "4be852f18f4c54bec78970333dcf5388099ee8dc06b7a2177197a6ffecf401e4"
                },
                {
                    "fileName": "busday.png",
                    "id": "0b7ceda509e6314ab7e9e27587d59ac4c104f8d613b91a70e3c4295eb9b3099e"
                },
                {
                    "fileName": "express-js-icon.webp",
                    "id": "2fd4a2407b861be33514bc84187debb888c0e2ed44db7ff28d8d2fffccad47af"
                },
                {
                    "fileName": "freddy_sprites.png",
                    "id": "c45d9cbd148e0dcbcd4e73ddd996062aee10ab893c6de40ad1b88a1adb5362e0"
                },
                {
                    "fileName": "google_maps.png",
                    "id": "7e47ce4c32d0ec6478a6f6d7bc03556a036c3ae51cd34ac706d631f591eaf30f"
                },
                {
                    "fileName": "http-icon.webp",
                    "id": "13e03b066d9445e9647f8ca2342abcc6b87cd90173184d8f2c2a0185f5e9aaf5"
                },
                {
                    "fileName": "mapa.png",
                    "id": "d4987a7f9e076127de0e5ba852bbde500ff7b246d3885be7c2540f694b68cef3"
                },
                {
                    "fileName": "meowl.png",
                    "id": "1e58d009e12ea6bb41a91cd7dfd0c16acc5510c170a6d757d547653c0fe3efcf"
                },
                {
                    "fileName": "node-js-icon.webp",
                    "id": "9971bf57acf59e00c6d943516815504c3cb67736e1a5550bcd463e444dcf133a"
                },
                {
                    "fileName": "pressure-point-banner.png",
                    "id": "e19306b15c565958fd8e00c79c1ea468b3896320031c5e6cb0e5a4df75064939"
                },
                {
                    "fileName": "shirt_maker_banner.jpg",
                    "id": "25e02ddde6fe8221acd22361377489bc5db2f27ca89ac82fb987ed5a83a3e841"
                },
                {
                    "fileName": "sonic-rewrite.png",
                    "id": "7c77c34ab72392465af7b33531da1f7eadc3c6ab39bd020aa7c967b4b86df1b9"
                },
                {
                    "fileName": "springtrap_sprites.png",
                    "id": "3957d0966f285e17050965d1215113d454b5e8ed2fd000b182590495ed93efe5"
                },
                {
                    "fileName": "tmp.png",
                    "id": "94362fabe22200175dcdcaa3d0b2ddf649491202f1bcfb6f8d8c45f1c4c32a25"
                },
                {
                    "fileName": "tmp2.png",
                    "id": "d3b1bb7962e64cda2b4bc576b955695edab0ba492d8e2c6d69316baeb28b48d5"
                }
            ]
        }
    }
}