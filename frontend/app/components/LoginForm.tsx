"use client";

import { useState } from "react";
import { Input, Button, App } from "antd";
import { WalletOutlined, KeyOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../stores/authStore";
import LanguageSwitcher from "./LanguageSwitcher";

export default function LoginForm() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { login, generateCode: generateNewCode } = useAuthStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateCode = async () => {
    try {
      const response = await generateNewCode();
      if (response.success && response.data) {
        setCode(response.data.code);
        message.success(t("login.codeCreated"));
      } else {
        message.error(response.error || t("login.failed"));
      }
    } catch {
      // Fallback to local generation if API fails
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setCode(result);
      message.success(t("login.codeCreated"));
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 12) {
      message.error(t("login.validation.length"));
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(code)) {
      message.error(t("login.validation.format"));
      return;
    }

    setLoading(true);
    try {
      const response = await login(code.toUpperCase());
      if (response.success) {
        message.success(t("login.success"));
      } else {
        message.error(response.error || t("login.failed"));
      }
    } catch {
      message.error(t("login.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-500 to-blue-600 px-6 pt-16 pb-10">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Logo & Title */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <WalletOutlined className="text-4xl text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t("app.name")}</h1>
        <p className="mt-1 text-blue-100">{t("app.tagline")}</p>
      </div>

      {/* Form Card */}
      <div className="flex-1">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              {t("login.accessCode")}
            </label>
            <Input
              size="large"
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder={t("login.placeholder")}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().slice(0, 12))
              }
              onPressEnter={handleSubmit}
              maxLength={12}
              className="!h-14 !rounded-xl font-mono !text-xl tracking-[0.2em]"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>
                {code.length}/12 {t("login.characters")}
              </span>
              <span>{t("login.lettersAndNumbers")}</span>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleSubmit}
            className="!h-14 !rounded-xl !text-lg !font-semibold"
          >
            {t("login.access")}
          </Button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-sm text-gray-400">{t("login.or")}</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <Button
            size="large"
            block
            icon={<PlusOutlined />}
            onClick={handleGenerateCode}
            className="!h-14 !rounded-xl !text-base"
          >
            {t("login.createNew")}
          </Button>

          {/* Guide Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href="/huong-dan">
              <Button
                type="default"
                size="large"
                block
                className="!h-12 !rounded-xl !border-blue-400 !text-blue-600 hover:!bg-blue-50"
              >
                📖 {t("login.guide")}
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-blue-100">
          {t("login.uniqueCode")}
          <br />
          {t("login.rememberCode")}
        </p>
      </div>
    </div>
  );
}
