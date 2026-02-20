import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#13364F', // Navy Blue
    colorInfo: '#13364F',
    colorSuccess: '#52c41a',
    colorWarning: '#C29A5A', // Gold
    colorError: '#f5222d',
    colorBgBase: '#ffffff',
    colorTextBase: '#000000',
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#13364F',
      siderBg: '#13364F',
    },
    Button: {
      borderRadius: 4,
      algorithm: true, // Enable default algorithms
    },
    Card: {
      borderRadius: 8,
    },
  },
};

export default theme;
