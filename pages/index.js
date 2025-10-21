import React, { useState, useEffect } from "react";
import { Send, CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function SMSAuthForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [uid, setUid] = useState("");

  // URLパラメータからuidを取得
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uidParam = urlParams.get("uid");
    if (uidParam) {
      setUid(uidParam);
      console.log("プロライン UID:", uidParam);
    }
  }, []);

  const handleSendSMS = async () => {
    setError("");

    if (!formData.name.trim()) {
      setError("お名前を入力してください");
      return;
    }

    if (!formData.phone.trim()) {
      setError("電話番号を入力してください");
      return;
    }

    setLoading(true);

    const cleanPhone = formData.phone.replace(/[-\s+]/g, "");
    const phoneRegex = /^(0[0-9]{9,10}|81[0-9]{9,10})$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("正しい電話番号を入力してください");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setCanResend(false);
        startCountdown();
      } else {
        setError(data.error || "SMS送信に失敗しました");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyCode = async () => {
    setError("");

    if (verificationCode.length !== 6) {
      setError("6桁の認証コードを入力してください");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(3);
        await submitForm(data.token);
      } else {
        setError(data.error || "認証コードが正しくありません");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (token) => {
    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          token: token,
          diagnosisType: "猪突猛進チャレンジャー",
          uid: uid, // uidも送信
        }),
      });

      if (response.ok) {
        setSuccess(true);

        // プロラインのシナリオ移動を発火
        if (uid) {
          fireProlineBeacon(uid);
        }
      } else {
        setError("送信に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      setError("送信エラーが発生しました");
    }
  };

  // プロラインのビーコン発火関数
  const fireProlineBeacon = (userId) => {
    console.log("🚀 プロラインシナリオ移動を実行:", userId);

    const img = document.createElement("img");
    img.src = `https://autosns.jp/api/call-beacon/y1mMjPcyJx/${userId}`;
    img.style.display = "none";
    img.onload = () => {
      console.log("✅ プロラインシナリオ移動成功");
    };
    img.onerror = () => {
      console.error("❌ プロラインシナリオ移動失敗");
    };
    document.body.appendChild(img);
  };

  const handleResend = () => {
    handleSendSMS();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              診断結果をお届けします
            </h1>
            <p className="text-gray-600">
              診断結果の完全版をお届けするため、ご本人様確認を行います。
            </p>
            <p className="text-gray-600">
              【氏名】【電話番号】をご入力いただくと、SMSで認証コードが届きます。
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div
                className={`w-12 h-1 ${
                  step >= 2 ? "bg-indigo-600" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <div
                className={`w-12 h-1 ${
                  step >= 3 ? "bg-indigo-600" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                送信完了！
              </h2>
              <p className="text-gray-600 mb-4">認証が完了しました。</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-semibold mb-2">
                  📱 LINEに戻ってください
                </p>
                <p className="text-sm text-green-700">
                  診断結果の完全版がLINEに届いています。
                  <br />
                  LINEアプリを開いてご確認ください。
                </p>
              </div>
              {uid && (
                <p className="text-xs text-gray-400 mt-4">
                  シナリオ移動ID: {uid}
                </p>
              )}
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お名前 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="山田太郎"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        電話番号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="09012345678"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        ハイフンなしで入力してください
                      </p>
                    </div>

                    <button
                      onClick={handleSendSMS}
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          認証コードを送信
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <p className="text-gray-600">
                        <span className="font-semibold">{formData.phone}</span>{" "}
                        宛に
                        <br />
                        6桁の認証コードを送信しました
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        認証コード <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        value={verificationCode}
                        onChange={(e) =>
                          setVerificationCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="000000"
                      />
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        コードの有効期限は10分です
                      </p>
                    </div>

                    <button
                      onClick={handleVerifyCode}
                      disabled={loading || verificationCode.length !== 6}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          認証して送信
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      {!canResend ? (
                        <p className="text-sm text-gray-500">
                          再送信まであと {countdown} 秒
                        </p>
                      ) : (
                        <button
                          onClick={handleResend}
                          className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                        >
                          コードを再送信
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setStep(1)}
                      className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
                    >
                      ← 電話番号を変更する
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 入力された情報はデータベースに保存されず、
              <br />
              処理完了後に自動的に削除されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
