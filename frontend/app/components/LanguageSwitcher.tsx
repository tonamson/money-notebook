"use client";

import { Dropdown, Button } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { MenuProps } from "antd";

const languages = [
  { key: "en", label: "English", flag: "🇺🇸" },
  { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { key: "zh", label: "中文", flag: "🇨🇳" },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: "light" | "dark";
}

export default function LanguageSwitcher({
  className = "",
  variant = "dark",
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const currentLang =
    languages.find((l) => l.key === i18n.language) || languages[0];

  const items: MenuProps["items"] = languages.map((lang) => ({
    key: lang.key,
    label: (
      <span className="flex items-center gap-2">
        <span>{lang.flag}</span>
        <span>{lang.label}</span>
        {lang.key === i18n.language && <span className="text-blue-500">✓</span>}
      </span>
    ),
  }));

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    i18n.changeLanguage(key);
  };

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
      <Button
        type="text"
        size="small"
        icon={<GlobalOutlined />}
        className={`${
          variant === "light"
            ? "!text-white/80 hover:!text-white hover:!bg-white/20"
            : "!text-gray-600 hover:!text-gray-800 hover:!bg-gray-100"
        } ${className}`}
      >
        <span className="ml-1">{currentLang.flag}</span>
      </Button>
    </Dropdown>
  );
}
