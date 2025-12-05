"use client";

import { ConfigProvider, App } from "antd";
import viVN from "antd/locale/vi_VN";
import { ReactNode } from "react";

export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#3b82f6",
          borderRadius: 8,
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
