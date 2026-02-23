import type { ThemeConfig } from 'antd';

// Paleta: azul (identidade NixVet), neutros suaves
const theme: ThemeConfig = {
  token: {
    fontSize: 14,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    colorPrimary: '#2563eb',       // blue-600 - principal
    colorPrimaryHover: '#1d4ed8',
    colorPrimaryActive: '#1e40af',
    colorInfo: '#2563eb',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorBgLayout: '#f1f5f9',      // slate-100
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorText: '#334155',
    colorTextSecondary: '#64748b',
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    borderRadius: 10,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      siderBg: '#ffffff',
      bodyBg: 'transparent',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#eff6ff',   // blue-50
      itemSelectedColor: '#2563eb',
      itemHoverBg: '#f8fafc',
      itemHoverColor: '#2563eb',
      itemActiveBg: '#eff6ff',
      itemBorderRadius: 10,
      itemMarginBlock: 4,
      itemPaddingInline: 16,
    },
    Button: {
      borderRadius: 10,
      fontWeight: 500,
      primaryShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
    },
    Input: {
      borderRadius: 10,
      activeShadow: '0 0 0 2px rgba(37, 99, 235, 0.15)',
    },
    Table: {
      borderRadius: 0,
    },
  },
};

export default theme;
