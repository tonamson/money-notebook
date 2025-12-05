"use client";

import { Button } from "antd";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  LoginOutlined,
  PlusCircleOutlined,
  BarChartOutlined,
  FilterOutlined,
  EditOutlined,
  CopyOutlined,
  WalletOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function HuongDanPage() {
  const { t } = useTranslation();

  // Helper to get array items from translation
  const getItems = (key: string): string[] => {
    return t(key, { returnObjects: true }) as string[];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletOutlined className="text-xl" />
            <span className="font-semibold">{t("app.name")}</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher variant="light" />
            <Link href="/">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                className="!text-white/80 hover:!text-white"
                size="small"
              />
            </Link>
          </div>
        </div>
        <p className="mt-1 text-xs text-blue-100">{t("guide.title")}</p>
      </header>

      {/* Content */}
      <div className="px-4 pb-8 pt-4 space-y-4">
        {/* Intro Card */}
        <div className="rounded-2xl bg-white p-4 shadow-md text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            {t("guide.welcome")} 💰
          </h2>
          <p className="text-sm text-gray-600">{t("guide.intro")}</p>
        </div>

        {/* Step 1 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <UserAddOutlined className="text-lg text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t("guide.step1.title")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("guide.step1.subtitle")}
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            {getItems("guide.step1.items").map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step1-create-code.png"
              alt={t("guide.step1.title")}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <LoginOutlined className="text-lg text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t("guide.step2.title")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("guide.step2.subtitle")}
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            {getItems("guide.step2.items").map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step2-login.png"
              alt={t("guide.step2.title")}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <PlusCircleOutlined className="text-lg text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t("guide.step3.title")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("guide.step3.subtitle")}
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            {getItems("guide.step3.items").map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step3-add-transaction.png"
              alt={t("guide.step3.title")}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 4 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
              <BarChartOutlined className="text-lg text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t("guide.step4.title")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("guide.step4.subtitle")}
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            {getItems("guide.step4.items").map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step4-stats.png"
              alt={t("guide.step4.title")}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 5 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100">
              <FilterOutlined className="text-lg text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t("guide.step5.title")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("guide.step5.subtitle")}
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            {getItems("guide.step5.items").map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step5-filter.png"
              alt={t("guide.step5.title")}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Step 6 */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <EditOutlined className="text-lg text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {t("guide.step6.title")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("guide.step6.subtitle")}
              </p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-1">
            {getItems("guide.step6.items").map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            <Image
              src="/guides/step6-edit-delete.png"
              alt={t("guide.step6.title")}
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-blue-50 p-4 shadow-md border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <BulbOutlined className="text-lg text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">
              {t("guide.tips.title")}
            </h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2 ml-1">
            {getItems("guide.tips.items").map((item, i) => (
              <li key={i}>
                • {item} {i === 0 && <CopyOutlined className="text-blue-500" />}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link href="/">
            <Button
              type="primary"
              size="large"
              className="!rounded-full !px-8 !h-12 !font-semibold !shadow-lg"
            >
              {t("guide.startNow")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
