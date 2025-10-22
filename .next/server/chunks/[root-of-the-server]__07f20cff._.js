module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/twilio [external] (twilio, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("twilio", () => require("twilio"));

module.exports = mod;
}),
"[project]/pages/api/send-sms.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
const twilio = __turbopack_context__.r("[externals]/twilio [external] (twilio, cjs)");
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({
            error: "電話番号を入力してください"
        });
    }
    // 電話番号を正規化（ハイフン、スペース、+を削除）
    let cleanPhone = phone.replace(/[-\s+]/g, "");
    // 国際形式に変換
    let internationalPhone;
    if (cleanPhone.startsWith("81")) {
        // 既に81で始まっている場合
        internationalPhone = `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("0")) {
        // 0で始まる国内形式の場合
        internationalPhone = `+81${cleanPhone.substring(1)}`;
    } else {
        return res.status(400).json({
            error: "電話番号の形式が正しくありません"
        });
    }
    console.log("=== デバッグ情報 ===");
    console.log("入力された電話番号:", phone);
    console.log("クリーン後:", cleanPhone);
    console.log("国際形式:", internationalPhone);
    console.log("TWILIO_VERIFY_SERVICE_SID:", process.env.TWILIO_VERIFY_SERVICE_SID);
    console.log("==================");
    try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
            to: internationalPhone,
            channel: "sms",
            locale: "ja"
        });
        return res.status(200).json({
            success: true,
            message: "SMS送信成功"
        });
    } catch (error) {
        console.error("SMS送信エラー:", error);
        console.error("エラーコード:", error.code);
        console.error("エラーメッセージ:", error.message);
        if (error.code === 60203) {
            return res.status(429).json({
                error: "送信回数の制限に達しました。しばらくしてから再度お試しください。"
            });
        }
        if (error.code === 60200) {
            return res.status(400).json({
                error: "電話番号の形式が正しくありません。"
            });
        }
        if (error.code === 21608) {
            return res.status(403).json({
                error: "この電話番号は認証されていません。トライアルアカウントでは、事前に認証した番号にのみSMSを送信できます。"
            });
        }
        return res.status(500).json({
            error: "SMS送信に失敗しました。電話番号を確認してください。"
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07f20cff._.js.map