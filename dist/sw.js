if(!self.define){let s,l={};const e=(e,n)=>(e=new URL(e+".js",n).href,l[e]||new Promise((l=>{if("document"in self){const s=document.createElement("script");s.src=e,s.onload=l,document.head.appendChild(s)}else s=e,importScripts(e),l()})).then((()=>{let s=l[e];if(!s)throw new Error(`Module ${e} didn’t register its module`);return s})));self.define=(n,i)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(l[r])return;let u={};const o=s=>e(s,r),t={module:{uri:r},exports:u,require:o};l[r]=Promise.all(n.map((s=>t[s]||o(s)))).then((s=>(i(...s),u)))}}define(["./workbox-5ffe50d4"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/___vite-browser-external_commonjs-proxy-Bfge3nyM.js",revision:null},{url:"assets/ar_AR-ZRPPM56D-d2WEfzQ_.js",revision:null},{url:"assets/arbitrum-IA4OWRTN-B0aI2PBQ.js",revision:null},{url:"assets/Arc-R3PUWRPJ-CUdEQO8X.js",revision:null},{url:"assets/assets-NU2OP443-COMs-Mo6.js",revision:null},{url:"assets/avalanche-MXEFEDSW-DcC5FNt3.js",revision:null},{url:"assets/base-Z4LFBE5D-DHfqMzJC.js",revision:null},{url:"assets/blast-TN2WIMWF-BUZNbRBy.js",revision:null},{url:"assets/Brave-24BM36UM-C6C5mkTK.js",revision:null},{url:"assets/Browser-4R4QKTV2-D3ON1q-S.js",revision:null},{url:"assets/bsc-RVE67I5L-DVYEF0vl.js",revision:null},{url:"assets/ccip-DuLkpPSg.js",revision:null},{url:"assets/celo-E6XU57FO-C5IguUgF.js",revision:null},{url:"assets/Chrome-TLI42HDP-BgiVz-ma.js",revision:null},{url:"assets/coinbaseWallet-WWX6LF36-BMRj6mTC.js",revision:null},{url:"assets/connect-MR6XDLIE-BET5HMNk.js",revision:null},{url:"assets/create-X4WFHLCW-De9pC3ym.js",revision:null},{url:"assets/cronos-ROYR77VZ-Prn3LRPZ.js",revision:null},{url:"assets/de_DE-GYZFZXWH-CYZf24IR.js",revision:null},{url:"assets/Edge-AZ34LAFM-EBh9cG_z.js",revision:null},{url:"assets/es_419-OGVOQEFZ-D6BJPTeQ.js",revision:null},{url:"assets/ethereum-RFBAMUVK-WsW8NXqo.js",revision:null},{url:"assets/events-Bcr9oyZL.js",revision:null},{url:"assets/Firefox-ZDK7RHKK-5nyhB0sj.js",revision:null},{url:"assets/flow-NBCRNYVF-D2XasjKk.js",revision:null},{url:"assets/fr_FR-Q5QBQBX2-lQoTmpTH.js",revision:null},{url:"assets/gnosis-T7U5EW2Q-CoPEM_sI.js",revision:null},{url:"assets/hardhat-NEEC6JX7-DzuWQYyS.js",revision:null},{url:"assets/hi_IN-7I7LRHGW-CTQjmeYe.js",revision:null},{url:"assets/hooks.module-Ch-lvXiF.js",revision:null},{url:"assets/id_ID-ZMGZ2JFV-CgKQKAmU.js",revision:null},{url:"assets/index-BIB2-MgE.js",revision:null},{url:"assets/index-Bmyt78x5.js",revision:null},{url:"assets/index-BpqlzeOR.js",revision:null},{url:"assets/index-C8DG5_eZ.js",revision:null},{url:"assets/index-ClP5MVkq.js",revision:null},{url:"assets/index-CrEbriqT.js",revision:null},{url:"assets/index-D7GxIMMp.js",revision:null},{url:"assets/index-DFoqFU6g.css",revision:null},{url:"assets/index.es-CCl5idit.js",revision:null},{url:"assets/ja_JP-NYBCHQTZ-CMaBl8Za.js",revision:null},{url:"assets/klaytn-QTDBZIB3-DyuKTpxX.js",revision:null},{url:"assets/ko_KR-67WE736M-DHWhIjcm.js",revision:null},{url:"assets/Linux-VYP66PDO--MOvpQUa.js",revision:null},{url:"assets/login-CWDTIDNK-DhDUYE4b.js",revision:null},{url:"assets/Macos-5QL4JBJE-DLNYPiln.js",revision:null},{url:"assets/manta-5V6W5D7G-BnjsGzeJ.js",revision:null},{url:"assets/mantle-KBL3OIYT-DIpe0poV.js",revision:null},{url:"assets/metaMaskWallet-YFHEHW7V-BggUDXad.js",revision:null},{url:"assets/ms_MY-65AJIBUS-BLlUrxe6.js",revision:null},{url:"assets/Opera-BKMCKUXC-CCypmVaM.js",revision:null},{url:"assets/optimism-VD7XDD2W-DpJY1TMb.js",revision:null},{url:"assets/polygon-WWEUOMKW-CNBYSB1T.js",revision:null},{url:"assets/pt_BR-DMJANC65-DMs4DrlC.js",revision:null},{url:"assets/rainbowWallet-2SR6TVBF-kimcGeuf.js",revision:null},{url:"assets/refresh-HJGJRASX-D0rkc63_.js",revision:null},{url:"assets/ronin-PNHX5V6H-BS-WPXjQ.js",revision:null},{url:"assets/ru_RU-WER7RQ6A-DsJK55uv.js",revision:null},{url:"assets/Safari-PXQIVS6N-B-Lfxb9r.js",revision:null},{url:"assets/safeWallet-VUYZPLY4-CXnodgMs.js",revision:null},{url:"assets/scan-DEOT2M37-1-mJ5OyF.js",revision:null},{url:"assets/scroll-NMZWDUQH-fIxBV-y0.js",revision:null},{url:"assets/sign-A7IJEUT5-CGsRnPrd.js",revision:null},{url:"assets/th_TH-JOSHEZ6D-Cp87mIRZ.js",revision:null},{url:"assets/tr_TR-EAMG2YPO-C52_xfsf.js",revision:null},{url:"assets/uk_UA-GO2TRVWA-C1C1400t.js",revision:null},{url:"assets/vi_VN-5HLLSOJA-Dj7ferOp.js",revision:null},{url:"assets/walletConnectWallet-FNSU4KNU-B0ci71fU.js",revision:null},{url:"assets/Windows-GTAT3OTE-K9Pt3pUF.js",revision:null},{url:"assets/xdc-X7V4QFNF-CSGs0o6M.js",revision:null},{url:"assets/zetachain-BMJKVYBN-IK2CZBr3.js",revision:null},{url:"assets/zh_CN-THPIFVWJ-Cbp71xMR.js",revision:null},{url:"assets/zh_HK-R7XP4TGF-CyJtfKGw.js",revision:null},{url:"assets/zh_TW-F5LD752V-AHFgsYw-.js",revision:null},{url:"assets/zkSync-JL26RB7U-BYMs9Lzo.js",revision:null},{url:"assets/zora-YZH32HP3-CY3tp3EJ.js",revision:null},{url:"index.html",revision:"a78fb0231d9d73936cfe4a02c7f95f37"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"owl-icon.svg",revision:"9f889ec9ffbfa481749165d59b20ad30"},{url:"manifest.webmanifest",revision:"0967a597abefb39fd098ff4d8ad8d0d3"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));
